import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { authApi } from "../features/auth/api/authApi";
import { getToken, clearToken, ApiError, setGroupId } from "../services/api";
import { migrateAnonDataToUser } from "../lib/scopedStorage";
import { useQueryClient } from "@tanstack/react-query";

const CACHED_USER_KEY = "sambung_ngaji_cached_user";

function getCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  } catch {}
}

let validateSessionPromise: Promise<User> | null = null;

function getValidateSessionPromise(): Promise<User> {
  if (!validateSessionPromise) {
    validateSessionPromise = authApi.validateSession().finally(() => {
      validateSessionPromise = null;
    });
  }
  return validateSessionPromise;
}

interface AuthContextValue {
  user: User | null;
  groupId: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(() => {
    const token = getToken();
    if (!token) return null;
    return getCachedUser();
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const token = getToken();
    if (!token) return false;
    // Jika ada token dan cached user, tidak perlu memblokir UI dengan loading
    return !getCachedUser();
  });

  useEffect(() => {
    let cancelled = false;

    const token = getToken();
    if (!token) {
      setCachedUser(null);
      setUser(null);
      setLoading(false);
      return;
    }

    const initialCache = getCachedUser();
    if (initialCache) {
      setGroupId(initialCache.group_id ?? null);
    }

    (async () => {
      try {
        const u = await getValidateSessionPromise();

        if (cancelled) return;

        migrateAnonDataToUser(u?.user_id);
        setGroupId(u?.group_id ?? null);
        setUser(u);
        setCachedUser(u);
      } catch (error) {
        if (cancelled) return;

        const isAuthError =
          error instanceof ApiError &&
          (error.message.toLowerCase().includes("unauthorized") ||
            error.message.toLowerCase().includes("sesi tidak valid") ||
            error.message.toLowerCase().includes("token") ||
            error.statusCode === 401);

        if (isAuthError) {
          clearToken();
          setCachedUser(null);
          setGroupId(null);
          setUser(null);
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
    const u = await authApi.login(username, password);
    migrateAnonDataToUser(u?.user_id);
    setGroupId(u?.group_id ?? null);
    setUser(u);
    setCachedUser(u);
  }

  async function logout() {
    queryClient.clear();
    clearToken();
    setCachedUser(null);
    setGroupId(null);
    setUser(null);

    authApi.logout().catch(() => {});
  }

  async function refreshUser() {
    try {
      const u = await authApi.validateSession();
      setUser(u);
      setCachedUser(u);
    } catch (err) {
      // jika error, jangan ganti state kecuali auth error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        groupId: user?.group_id ?? null,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
