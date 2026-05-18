import axios from "axios";
import { API_URL } from "@/lib/api_url";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config ?? {};
    const requestUrl = originalRequest.url ?? "";

    const isAuthUrl =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/signup") ||
      requestUrl.includes("/auth/email/") ||
      requestUrl.includes("/auth/token/access") ||
      requestUrl.includes("/auth/google");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/token/access");
        processQueue();
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (
          typeof window !== "undefined" &&
          !["/login", "/signup"].includes(window.location.pathname)
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
