import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { authApi } from "../services/authApi";
import { getToken, clearToken, ApiError, setGroupId } from "../services/api";
import { migrateAnonDataToUser } from "../lib/scopedStorage";
import { useQueryClient } from "@tanstack/react-query";


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
  const [user, setUser] = useState<User | null>(null);
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
      } catch (error) {
        if (cancelled) return;

        const isAuthError =
          error instanceof ApiError &&
          (error.message.toLowerCase().includes("unauthorized") ||
            error.message.toLowerCase().includes("sesi tidak valid") ||
            error.message.toLowerCase().includes("token"));

        if (isAuthError) {
          clearToken();
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
  }

  async function logout() {

    queryClient.clear();
    clearToken();
    setGroupId(null);
    setUser(null);

    authApi.logout().catch((err) => {
    });
  }

  async function refreshUser() {
    try {
      const u = await authApi.validateSession();
      setUser(u);
    } catch (err) {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, groupId: user?.group_id ?? null, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
