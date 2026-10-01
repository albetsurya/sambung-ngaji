import { setToken, clearToken } from "../../../services/api";
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

  async logout() {
    try {
      await restPost("/api/v1/auth/logout");
    } catch (error) {
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
