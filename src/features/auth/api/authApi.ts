import { setToken, getToken, clearToken } from "../../../services/api";
import { restGet, restPost } from "../../../services/apiClient";
import type { User } from "../../../types";

export const authApi = {
  async login(username: string, password: string) {
    try {
      const data = await restPost<{ token: string; user: User }>("/api/v1/auth/login", {
        username,
        password,
      });
      setToken(data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  },

  async loginWithGoogle(credential: string) {
    const data = await restPost<{ token: string; user: User }>(
      "/api/v1/auth/oauth/google",
      { credential, intent: "ceria" },
    );
    setToken(data.token);
    return data.user;
  },

  async registerCeria(name: string, username: string, password: string, confirmPassword: string) {
    const data = await restPost<{ token: string; user: User }>(
      "/api/v1/auth/register/ceria",
      { name, username, password, confirm_password: confirmPassword },
    );
    setToken(data.token);
    return data.user;
  },

  async logout() {
    const token = getToken();
    try {
      await restPost("/api/v1/auth/logout", undefined, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        timeout: 10000,
      });
    } finally {
      clearToken();
    }
  },

  async validateSession() {
    try {
      const data = await restGet<{ user: User }>("/api/v1/auth/validate-session");
      return data.user;
    } catch (error) {
      throw error;
    }
  },
};
