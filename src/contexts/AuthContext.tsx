// AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { authApi } from "../services/authApi";
import { getToken, clearToken, ApiError } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";

/* -------------------------------------------------------------------------- */
/*                              Module-level Cache                            */
/* -------------------------------------------------------------------------- */

/**
 * Cache promise validateSession untuk mencegah duplicate request
 * di React Strict Mode (yang menjalankan useEffect 2x di development).
 *
 * Request pertama → bikin promise, simpan di cache.
 * Request kedua   → pakai promise yang sama (tidak kirim request baru).
 * Setelah resolve → clear cache.
 */
let validateSessionPromise: Promise<User> | null = null;

function getValidateSessionPromise(): Promise<User> {
  if (!validateSessionPromise) {
    validateSessionPromise = authApi.validateSession().finally(() => {
      // Clear cache setelah selesai (sukses atau gagal)
      // supaya refresh berikutnya bikin request baru
      validateSessionPromise = null;
    });
  }
  return validateSessionPromise;
}

/* -------------------------------------------------------------------------- */
/*                              Auth Context                                  */
/* -------------------------------------------------------------------------- */

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = getToken();
      console.log(
        "🔐 AuthProvider: checking token:",
        token ? "present" : "none",
      );

      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        // ✅ Pakai cached promise — kalau dipanggil 2x (Strict Mode),
        //    request kedua pakai promise yang sama, tidak kirim request baru.
        const u = await getValidateSessionPromise();

        if (cancelled) return;

        console.log("✅ AuthProvider: session valid, user:", u);
        setUser(u);
      } catch (error) {
        if (cancelled) return;

        const isAuthError =
          error instanceof ApiError &&
          (error.message.toLowerCase().includes("unauthorized") ||
            error.message.toLowerCase().includes("sesi tidak valid") ||
            error.message.toLowerCase().includes("token"));

        console.error("❌ AuthProvider: session error:", error);

        if (isAuthError) {
          console.log("→ Auth error, clearing token");
          clearToken();
          setUser(null);
        } else {
          console.log("→ Non-auth error, token dipertahankan");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(username: string, password: string) {
    console.log("🔐 AuthProvider.login called");
    const u = await authApi.login(username, password);
    setUser(u);
  }

  async function logout() {
    console.log("🔐 AuthProvider.logout called");

    // 1. Clear query cache + state + token DULU — biar UI instant redirect
    queryClient.clear();
    clearToken();
    setUser(null);

    // 2. API call di background — tidak blocking, error di-ignore
    authApi.logout().catch((err) => {
      console.warn("Logout API error (ignored):", err);
    });
  }

  async function refreshUser() {
    try {
      const u = await authApi.validateSession();
      setUser(u);
    } catch (err) {
      console.warn("refreshUser failed:", err);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
