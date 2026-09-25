// api.ts
import type { ApiResponse } from "../types";
import { API_BASE_URL } from "../constants";

const TOKEN_KEY = "pengajian_token";
const GROUP_ID_KEY = "pengajian_group_id";
let _groupId = "";

export function setGroupId(id: string | null) {
  _groupId = id ?? "";
  if (_groupId) {
    document.cookie = `pengajian_group_id=${encodeURIComponent(_groupId)}; path=/; SameSite=Strict`;
  } else {
    document.cookie = "pengajian_group_id=; path=/; SameSite=Strict; Max-Age=-1";
  }
}

function getGroupId(): string {
  if (_groupId) return _groupId;
  const match = document.cookie.match(/(?:^|;\s*)pengajian_group_id=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000];
const MAX_CONCURRENT_REQUESTS = 2;
const MIN_DELAY_BETWEEN_REQUESTS_MS = 200;

/* -------------------------------------------------------------------------- */
/*                              Request Queue                                 */
/* -------------------------------------------------------------------------- */

let activeRequests = 0;
let lastRequestTime = 0;
const pendingQueue: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  // Delay minimum antar request supaya tidak spam GAS
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_DELAY_BETWEEN_REQUESTS_MS) {
    await new Promise((r) =>
      setTimeout(r, MIN_DELAY_BETWEEN_REQUESTS_MS - elapsed),
    );
  }

  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests++;
    lastRequestTime = Date.now();
    return;
  }

  return new Promise((resolve) => {
    pendingQueue.push(() => {
      activeRequests++;
      lastRequestTime = Date.now();
      resolve();
    });
  });
}

function releaseSlot(): void {
  activeRequests = Math.max(0, activeRequests - 1);
  const next = pendingQueue.shift();
  if (next) next();
}

/* -------------------------------------------------------------------------- */
/*                              Token Management                              */
/* -------------------------------------------------------------------------- */

export function getToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)pengajian_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string) {
  document.cookie = `pengajian_token=${encodeURIComponent(token)}; path=/; SameSite=Strict`;
}

export function clearToken() {
  document.cookie = "pengajian_token=; path=/; SameSite=Strict; Max-Age=-1";
}

/* -------------------------------------------------------------------------- */
/*                              ApiError                                      */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  response?: ApiResponse<unknown>;
  retryable: boolean;
  statusCode?: number;
  cancelled?: boolean;

  constructor(
    message: string,
    response?: ApiResponse<unknown>,
    options: { retryable?: boolean; statusCode?: number; cancelled?: boolean } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.response = response;
    this.retryable = options.retryable ?? false;
    this.statusCode = options.statusCode;
    this.cancelled = options.cancelled ?? false;
  }
}

/* -------------------------------------------------------------------------- */
/*                     Pembatalan + notifikasi retry                          */
/* -------------------------------------------------------------------------- */

const inflight = new Set<AbortController>();
let abortEpoch = 0;

/** Batalkan semua request API yang sedang berjalan (tombol Batal). */
export function abortAllApiCalls() {
  abortEpoch++;
  for (const c of inflight) {
    try {
      c.abort("cancelled");
    } catch {
      // ignore
    }
  }
}

/** Tidur yang bisa diinterupsi oleh abortAllApiCalls. false = dibatalkan. */
function sleepCancellable(ms: number, epoch: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const id = window.setInterval(() => {
      if (epoch !== abortEpoch) {
        window.clearInterval(id);
        resolve(false);
        return;
      }
      if (Date.now() - start >= ms) {
        window.clearInterval(id);
        resolve(true);
      }
    }, 200);
  });
}

export interface RetryInfo {
  action: string;
  attempt: number;
  total: number;
}

let retryNotifier: ((info: RetryInfo) => void) | null = null;

/** Daftarkan notifikasi retry (dipasang sekali dari App → toast). */
export function setRetryNotifier(fn: ((info: RetryInfo) => void) | null) {
  retryNotifier = fn;
}

/* -------------------------------------------------------------------------- */
/*                              Helpers                                       */
/* -------------------------------------------------------------------------- */

function isHtmlResponse(text: string): boolean {
  const head = text.slice(0, 200).toLowerCase();
  return (
    head.includes("<!doctype") ||
    head.includes("<html") ||
    head.includes("<head>")
  );
}

/**
 * Deteksi 404 dari GAS redirect expired.
 * Ciri: status 404, body kosong atau pesan generik Google (bukan JSON project).
 */
function isGasRedirectExpired(status: number, text: string): boolean {
  if (status !== 404) return false;
  // Body kosong atau pendek → kemungkinan besar redirect expired
  if (text.length < 500) return true;
  // Body HTML error Google
  if (text.includes("Halaman Tidak Ditemukan")) return true;
  if (text.includes("Page Not Found")) return true;
  if (text.includes("Error 404")) return true;
  return false;
}

/* -------------------------------------------------------------------------- */
/*                              Main API Call                                 */
/* -------------------------------------------------------------------------- */

export async function call<T>(
  action: string,
  params: Record<string, any> = {},
): Promise<T> {
  let lastError: unknown = null;
  const epoch = abortEpoch;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (epoch !== abortEpoch) {
      throw new ApiError("Permintaan dibatalkan", undefined, {
        retryable: false,
        cancelled: true,
      });
    }
    try {
      return await callOnce<T>(action, params, attempt);
    } catch (error) {
      lastError = error;

      // Jangan retry request yang dibatalkan user.
      if (error instanceof ApiError && error.cancelled) {
        throw error;
      }

      const retryable = error instanceof ApiError && error.retryable === true;

      if (!retryable || attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = RETRY_DELAYS[attempt] ?? 10000;
      console.warn(
        `⚠️ API [${action}] gagal (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retry dalam ${delay}ms...`,
        error instanceof Error ? error.message : error,
      );
      // Beri tahu UI sekali (retry pertama) agar tidak diam.
      if (attempt === 0 && retryNotifier) {
        try {
          retryNotifier({
            action,
            attempt: attempt + 1,
            total: MAX_RETRIES + 1,
          });
        } catch {
          // ignore
        }
      }
      const slept = await sleepCancellable(delay, epoch);
      if (!slept) {
        throw new ApiError("Permintaan dibatalkan", undefined, {
          retryable: false,
          cancelled: true,
        });
      }
    }
  }

  throw lastError;
}

/* -------------------------------------------------------------------------- */
/*                              Single API Call                               */
/* -------------------------------------------------------------------------- */

async function callOnce<T>(
  action: string,
  params: Record<string, any>,
  attempt: number,
): Promise<T> {
  await acquireSlot();

  const controller = new AbortController();
  inflight.add(controller);

  try {
    const token = getToken();

    const payload: Record<string, any> = {
      action,
      ...params,
    };
    // Auto-attach group_id untuk filter per kelompok
    const gid = getGroupId();
    if (gid) {
      payload.group_id = gid;
    }
    const body = JSON.stringify(payload);

    const headers: Record<string, string> = {
      "Content-Type": "text/plain;charset=utf-8",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // Cache buster hanya di attempt 0. Retry tanpa buster (pakai cache GAS).
    const url =
      attempt === 0
        ? API_BASE_URL.includes("?")
          ? `${API_BASE_URL}&_t=${Date.now()}`
          : `${API_BASE_URL}?_t=${Date.now()}`
        : API_BASE_URL;

    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body,
        redirect: "follow",
        cache: "no-store",
        // Kirim HttpOnly cookie sesi (backend juga pakai header sbg fallback).
        credentials: "include",
        signal: controller.signal,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err?.name === "AbortError") {
        // Dibatalkan user via abortAllApiCalls (reason "cancelled")
        // vs timeout internal (tanpa reason).
        if (controller.signal.reason === "cancelled") {
          throw new ApiError("Permintaan dibatalkan", undefined, {
            retryable: false,
            cancelled: true,
          });
        }
        throw new ApiError(
          `Request timeout setelah ${REQUEST_TIMEOUT_MS / 1000} detik. Coba lagi.`,
          undefined,
          { retryable: true },
        );
      }

      const msg = String(err?.message || err);
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("Load failed")
      ) {
        throw new ApiError(
          "Koneksi gagal. Cek jaringan internet Anda.",
          undefined,
          {
            retryable: true,
          },
        );
      }

      throw new ApiError(`Network error: ${msg}`, undefined, {
        retryable: true,
      });
    }

    clearTimeout(timeoutId);

    const text = await response.text();
    const status = response.status;

    /* ---------------- HTML response (deployment error) ---------------- */
    if (isHtmlResponse(text)) {
      const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "";

      throw new ApiError(
        `Server belum siap${title ? " · " + title : ""}. Mencoba ulang...`,
        undefined,
        { retryable: true, statusCode: status },
      );
    }

    /* ---------------- 404 dari GAS redirect expired ---------------- */
    if (isGasRedirectExpired(status, text)) {
      throw new ApiError(
        "Server sementara tidak tersedia. Mencoba ulang...",
        undefined,
        { retryable: true, statusCode: 404 },
      );
    }

    /* ---------------- 404 dengan body tidak dikenal ---------------- */
    if (status === 404) {
      throw new ApiError(
        "Server tidak merespon dengan benar. Mencoba ulang...",
        undefined,
        { retryable: true, statusCode: 404 },
      );
    }

    /* ---------------- 5xx ---------------- */
    if (status >= 500) {
      throw new ApiError(
        `Server error (${status}). Mencoba ulang...`,
        undefined,
        { retryable: true, statusCode: status },
      );
    }

    /* ---------------- 429 ---------------- */
    if (status === 429) {
      throw new ApiError("Server sedang sibuk. Mencoba ulang...", undefined, {
        retryable: true,
        statusCode: 429,
      });
    }

    /* ---------------- Parse JSON ---------------- */
    let data: ApiResponse<T>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(
        "Response server tidak valid. Mencoba ulang...",
        undefined,
        { retryable: true },
      );
    }

    /* ---------------- Cek response GAS ---------------- */
    if (!data.success) {
      const msg = data.message || "Terjadi kesalahan";

      // Deteksi "action wajib diisi" (redirect gagal) → retry
      if (
        msg.toLowerCase().includes("action wajib diisi") ||
        msg.toLowerCase().includes("action tidak dikenal")
      ) {
        throw new ApiError("Sesi request terganggu. Mencoba ulang...", data, {
          retryable: true,
        });
      }

      // Unauthorized → clear token, no retry
      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("sesi tidak valid") ||
        msg.toLowerCase().includes("session tidak ditemukan")
      ) {
        clearToken();
        throw new ApiError("Sesi kadaluarsa, silakan login ulang", data, {
          retryable: false,
          statusCode: 401,
        });
      }

      throw new ApiError(msg, data, { retryable: false });
    }

    return data.data;
  } finally {
    inflight.delete(controller);
    releaseSlot();
  }
}

/* -------------------------------------------------------------------------- */
/*                              Login / Logout                                */
/* -------------------------------------------------------------------------- */

export async function login(username: string, password: string) {
  const result = await call<{ token: string; user: any }>("login", {
    username,
    password,
  });

  if (result?.token) {
    setToken(result.token);
  }
  return result;
}

export async function logout() {
  try {
    await call("logout", {});
  } catch (error) {
    console.warn("Logout error (diabaikan):", error);
  } finally {
    clearToken();
  }
}

/* -------------------------------------------------------------------------- */
/*                              Debug Functions                               */
/* -------------------------------------------------------------------------- */

export async function testApiConnection() {
  console.log("=== 🧪 TEST API CONNECTION ===");
  console.log("📋 Environment:", {
    API_BASE_URL: API_BASE_URL,
    mode: import.meta.env.MODE,
  });

  if (!API_BASE_URL) {
    console.error("❌ API_BASE_URL is empty!");
    return { success: false, error: "API_BASE_URL empty" };
  }

  try {
    const result = await call<{ available: boolean }>(
      "checkUsernameAvailability",
      { username: "test_connection_probe" },
    );
    console.log("✅ API reachable:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Connection error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function testApiGet() {
  console.log("=== 🧪 TEST API GET ===");
  try {
    const url = `${API_BASE_URL}${API_BASE_URL.includes("?") ? "&" : "?"}action=validateSession&_t=${Date.now()}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });
    const text = await response.text();
    console.log("📥 Status:", response.status);
    console.log("📝 Response:", text.substring(0, 500));
    return { success: true, raw: text };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default {
  call,
  login,
  logout,
  getToken,
  setToken,
  clearToken,
  ApiError,
  abortAllApiCalls,
  setRetryNotifier,
  testApiConnection,
  testApiGet,
};
