import { call, setToken, clearToken } from "./api";
import type { User } from "../types";

export const authApi = {
  async login(username: string, password: string) {
    try {
      const data = await call<{ token: string; user: User }>("login", {
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
      await call("logout", {});
    } catch (error) {
    } finally {
      clearToken();
    }
  },

  async validateSession() {
    try {
      const data = await call<{ user: User }>("validateSession", {});
      return data.user;
    } catch (error) {
      throw error;
    }
  },
};
