// authApi.ts
import { call, setToken, clearToken } from "./api";
import type { User } from "../types";

export const authApi = {
  async login(username: string, password: string) {
    console.log("🔐 authApi.login called:", { username });
    try {
      const data = await call<{ token: string; user: User }>("login", {
        username,
        password,
      });
      console.log("✅ Login success:", data.user);
      setToken(data.token);
      return data.user;
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  },

  async logout() {
    console.log("🔐 authApi.logout called");
    try {
      await call("logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearToken();
    }
  },

  async validateSession() {
    console.log("🔐 authApi.validateSession called");
    try {
      const data = await call<{ user: User }>("validateSession", {}); // ← tambah {}
      console.log("✅ Session valid:", data.user);
      return data.user;
    } catch (error) {
      console.error("❌ Session invalid:", error);
      throw error;
    }
  },
};
