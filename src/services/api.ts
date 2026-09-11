// api.ts
import type { ApiResponse } from "../types";
import { API_BASE_URL } from "../constants";

const TOKEN_KEY = "pengajian_token";

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
/*                              Retry Helper                                  */
/* -------------------------------------------------------------------------- */

/**
 * Cek apakah error layak di-retry (network, 404, HTML response).
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("html") ||
      msg.includes("404") ||
      msg.includes("not found") ||
      msg.includes("network") ||
      msg.includes("failed to fetch")
    );
  }
  if (error instanceof Error) {
    return (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("404")
    );
  }
  return false;
}

/**
 * Sleep helper.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* -------------------------------------------------------------------------- */
/*                              Main API Call                                 */
/* -------------------------------------------------------------------------- */

const MAX_RETRIES = 2;

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

      // Hanya retry kalau error-nya layak
      if (!isRetryableError(error) || attempt === MAX_RETRIES) {
        throw error;
      }

      // Exponential backoff: 300ms, 600ms
      const delay = 300 * Math.pow(2, attempt);
      console.warn(
        `⚠️ API call gagal (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retry dalam ${delay}ms...`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Single API call — tanpa retry.
 */
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

  // ✅ Pakai JSON body dengan Content-Type text/plain
  //    - text/plain = simple header → tidak trigger preflight
  //    - Body tetap JSON → Apps Script bisa parse
  const body = JSON.stringify(payload);

  // ✅ Cache-busting: tambahkan timestamp ke URL
  //    Ini mencegah browser pakai cache URL redirect lama dari Apps Script
  const cacheBuster = `_t=${Date.now()}_a=${attempt}`;
  const url = API_BASE_URL.includes("?")
    ? `${API_BASE_URL}&${cacheBuster}`
    : `${API_BASE_URL}?${cacheBuster}`;

  console.log(
    `📤 API call [${action}] attempt ${attempt + 1}, url: ${url.substring(0, 80)}...`,
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      // ✅ text/plain = simple header, tidak trigger OPTIONS preflight
      "Content-Type": "text/plain;charset=utf-8",
    },
    body,
    redirect: "follow", // Apps Script redirect setelah POST
    // ✅ Cegah browser cache response
    cache: "no-store",
  });

  const text = await response.text();

  // Cek HTML error (redirect ke login page / error page)
  if (text.includes("<!DOCTYPE") || text.includes("<html")) {
    // Extract title kalau ada, untuk debugging
    const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "unknown";

    throw new ApiError(
      `Server mengembalikan HTML (${title}). Cek URL Web App (harus /exec) dan deployment.`,
    );
  }

  // Cek response 404 dari Google
  if (response.status === 404) {
    throw new ApiError(
      "Server mengembalikan 404. URL Web App mungkin sudah expired, coba redeploy.",
    );
  }

  // Parse JSON
  let data: ApiResponse<T>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ApiError("Server mengembalikan response tidak valid");
  }

  if (!data.success) {
    if (
      data.message?.toLowerCase().includes("unauthorized") ||
      data.message?.toLowerCase().includes("sesi tidak valid")
    ) {
      clearToken();
      throw new ApiError("Sesi kadaluarsa, silakan login ulang", data);
    }
    throw new ApiError(data.message || "Terjadi kesalahan", data);
  }

  return data.data;
}

/* -------------------------------------------------------------------------- */
/*                              Login / Logout                                */
/* -------------------------------------------------------------------------- */

export async function login(username: string, password: string) {
  console.log("🔐 login called with:", { username });
  try {
    const result = await call<{ token: string; user: any }>("login", {
      username,
      password,
    });
    if (result?.token) {
      console.log(
        "✅ Login success, token:",
        result.token.substring(0, 20) + "...",
      );
      setToken(result.token);
    }
    return result;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error;
  }
}

export async function logout() {
  console.log("🔐 logout called");
  try {
    await call("logout", {});
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearToken();
  }
}

/* -------------------------------------------------------------------------- */
/*                              ApiError                                      */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  response?: ApiResponse<unknown>;
  constructor(message: string, response?: ApiResponse<unknown>) {
    super(message);
    this.name = "ApiError";
    this.response = response;
  }
}

/* -------------------------------------------------------------------------- */
/*                              Debug Functions                               */
/* -------------------------------------------------------------------------- */

/**
 * Test koneksi API — jalankan di browser console.
 */
export async function testApiConnection() {
  console.log("=== 🧪 TEST API CONNECTION ===");
  console.log("📋 Environment:", {
    API_BASE_URL: API_BASE_URL,
    mode: import.meta.env.MODE,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  });

  if (!API_BASE_URL) {
    console.error("❌ API_BASE_URL is empty!");
    return { success: false, error: "API_BASE_URL empty" };
  }

  console.log("📤 Testing login with superadmin...");

  try {
    const url = `${API_BASE_URL}${API_BASE_URL.includes("?") ? "&" : "?"}_t=${Date.now()}`;

    console.log("📤 Request URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "login",
        username: "superadmin",
        password: "ganti123",
      }),
      cache: "no-store",
    });

    console.log("📥 Status:", response.status);
    console.log("📥 Headers:", Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log("📝 Response (first 1000 chars):", text.substring(0, 1000));

    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      console.error("❌ Response is HTML - Web App error");
      return {
        success: false,
        error: "HTML response",
        html: text.substring(0, 500),
      };
    }

    try {
      const json = JSON.parse(text);
      console.log("✅ JSON parsed:", json);
      return { success: true, data: json };
    } catch {
      console.error("❌ Not valid JSON");
      return { success: false, error: "Not JSON", raw: text.substring(0, 200) };
    }
  } catch (error) {
    console.error("❌ Connection error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test dengan GET request — untuk cek apakah backend bisa diakses.
 */
export async function testApiGet() {
  console.log("=== 🧪 TEST API CONNECTION (GET) ===");

  try {
    const url = `${API_BASE_URL}${API_BASE_URL.includes("?") ? "&" : "?"}action=validateSession&_t=${Date.now()}`;

    console.log("📤 GET URL:", url);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    console.log("📥 Status:", response.status);

    const text = await response.text();
    console.log("📝 Response (first 500 chars):", text.substring(0, 500));

    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      console.error("❌ Response is HTML");
      return { success: false, error: "HTML response" };
    }

    try {
      const json = JSON.parse(text);
      console.log("✅ JSON parsed:", json);
      return { success: true, data: json };
    } catch {
      console.error("❌ Not valid JSON");
      return { success: false, error: "Not JSON" };
    }
  } catch (error) {
    console.error("❌ Error:", error);
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
