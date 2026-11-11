import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { authApi } from "../features/auth/api/authApi";
import { clearToken, ApiError, setGroupId } from "../services/api";
import { migrateAnonDataToUser } from "../lib/scopedStorage";
import { useQueryClient } from "@tanstack/react-query";

const CACHED_USER_KEY = "sambung_ngaji_cached_user";

function getCachedUser(): User | null {
  try {
    const raw = sessionStorage.getItem(CACHED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  try {
    if (user) {
      sessionStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(CACHED_USER_KEY);
    }
  } catch {}
  try {
    // Remove the old persistent copy left by earlier builds.
    localStorage.removeItem(CACHED_USER_KEY);
  } catch {}
}

function isAuthenticationError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("sesi tidak valid") ||
      error.message.toLowerCase().includes("token") ||
      error.statusCode === 401)
  );
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
  loginWithGoogle: (credential: string) => Promise<void>;
  registerCeria: (name: string, username: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [user, setUser] = useState<User | null>(() => {
    return getCachedUser();
  });

  // Validate on every boot so a backend HttpOnly session is supported too.
  // The cached profile remains hidden behind this loading state until it is
  // confirmed by the server.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const u = await getValidateSessionPromise();

        if (cancelled) return;

        migrateAnonDataToUser(u?.user_id);
        setGroupId(u?.group_id ?? null);
        setUser(u);
        setCachedUser(u);
      } catch {
        if (cancelled) return;

        // A cached profile is only an optimistic render hint, never proof of
        // authentication. Do not leave it active when validation fails.
        clearToken();
        setCachedUser(null);
        setGroupId(null);
        setUser(null);
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

  async function loginWithGoogle(credential: string) {
    const u = await authApi.loginWithGoogle(credential);
    migrateAnonDataToUser(u?.user_id);
    setGroupId(u?.group_id ?? null);
    setUser(u);
    setCachedUser(u);
  }

  async function registerCeria(name: string, username: string, password: string, confirmPassword: string) {
    const u = await authApi.registerCeria(name, username, password, confirmPassword);
    migrateAnonDataToUser(u?.user_id);
    setGroupId(u?.group_id ?? null);
    setUser(u);
    setCachedUser(u);
  }

  async function logout() {
    queryClient.clear();
    // Start revocation while the bearer token is still available. The local
    // session is cleared immediately afterwards so the UI never stays signed in.
    const revoke = authApi.logout();
    clearToken();
    setCachedUser(null);
    setGroupId(null);
    setUser(null);

    await revoke.catch(() => {});
  }

  async function refreshUser() {
    try {
      const u = await authApi.validateSession();
      setUser(u);
      setCachedUser(u);
    } catch (err) {
      if (isAuthenticationError(err)) {
        clearToken();
        setCachedUser(null);
        setGroupId(null);
        setUser(null);
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        groupId: user?.group_id ?? null,
        loading,
        login,
        loginWithGoogle,
        registerCeria,
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
