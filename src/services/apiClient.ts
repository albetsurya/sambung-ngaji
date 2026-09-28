import axios from "axios";
import { API_BASE_URL } from "../constants";
import type { ApiResponse } from "../types";
import { ApiError, getToken } from "./api";

const baseURL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse<any>;
    if (data && typeof data === "object" && "success" in data && !data.success) {
      throw new ApiError(data.message || "Request gagal", undefined, {
        statusCode: response.status,
      });
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as ApiResponse<any>;
      const msg = data?.message || error.message;
      throw new ApiError(msg, undefined, {
        statusCode: error.response?.status,
      });
    }
    throw error;
  },
);

export async function restGet<T>(
  url: string,
  params?: Record<string, any>,
): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  return res.data.data;
}

export async function restPost<T>(url: string, data?: any): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, data);
  return res.data.data;
}

export async function restPut<T>(url: string, data?: any): Promise<T> {
  const res = await apiClient.put<ApiResponse<T>>(url, data);
  return res.data.data;
}

export async function restDelete<T>(
  url: string,
  params?: Record<string, any>,
): Promise<T> {
  const res = await apiClient.delete<ApiResponse<T>>(url, { params });
  return res.data.data;
}
