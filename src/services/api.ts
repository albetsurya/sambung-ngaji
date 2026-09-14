// api.ts
import type { ApiResponse } from "../types";
import { API_BASE_URL } from "../constants";

const TOKEN_KEY = "pengajian_token";
const REQUEST_TIMEOUT_MS = 20_000;

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/* -------------------------------------------------------------------------- */
/*                              ApiError                                      */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  response?: ApiResponse<unknown>;
  retryable: boolean;
  statusCode?: number;

  constructor(
    message: string,
    response?: ApiResponse<unknown>,
    options: { retryable?: boolean; statusCode?: number } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.response = response;
    this.retryable = options.retryable ?? false;
    this.statusCode = options.statusCode;
  }
}

/* -------------------------------------------------------------------------- */
/*                              Retry Helper                                  */
/* -------------------------------------------------------------------------- */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_RETRIES = 2;
const RETRY_DELAYS = [500, 1500];

/* -------------------------------------------------------------------------- */
/*                              Main API Call                                 */
/* -------------------------------------------------------------------------- */

export async function call<T>(
  action: string,
  params: Record<string, any> = {},
): Promise<T> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callOnce<T>(action, params, attempt);
    } catch (error) {
      lastError = error;

      const retryable = error instanceof ApiError && error.retryable === true;

      if (!retryable || attempt === MAX_RETRIES) {
        throw error;
      }

      const delay = RETRY_DELAYS[attempt] ?? 1500;
      console.warn(
        `⚠️ API [${action}] gagal (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retry dalam ${delay}ms...`,
        error instanceof Error ? error.message : error,
      );
      await sleep(delay);
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
  const token = getToken();

  const payload: Record<string, any> = {
    action,
    ...params,
  };
  if (token) payload.token = token;

  const body = JSON.stringify(payload);

  const cacheBuster = `_t=${Date.now()}`;
  const url = API_BASE_URL.includes("?")
    ? `${API_BASE_URL}&${cacheBuster}`
    : `${API_BASE_URL}?${cacheBuster}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body,
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err?.name === "AbortError") {
      throw new ApiError(
        `Request timeout setelah ${REQUEST_TIMEOUT_MS / 1000} detik. Cek koneksi.`,
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
        { retryable: true },
      );
    }

    throw new ApiError(`Network error: ${msg}`, undefined, {
      retryable: true,
    });
  }

  clearTimeout(timeoutId);

  const text = await response.text();

  if (
    response.status === 404 ||
    text.includes("<!DOCTYPE") ||
    text.includes("<html")
  ) {
    const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "";

    throw new ApiError(
      `Server tidak siap (${response.status}${title ? " · " + title : ""}). Cek deployment Web App.`,
      undefined,
      { retryable: false, statusCode: response.status },
    );
  }

  if (response.status >= 500) {
    throw new ApiError(
      `Server error (${response.status}). Coba lagi nanti.`,
      undefined,
      { retryable: true, statusCode: response.status },
    );
  }

  let data: ApiResponse<T>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ApiError("Response server tidak valid (bukan JSON).", undefined, {
      retryable: false,
    });
  }

  if (!data.success) {
    const msg = data.message || "Terjadi kesalahan";

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
  testApiConnection,
  testApiGet,
};
