import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/lib/api_url";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");

    if (accessToken && !config.url?.includes("/auth/login")) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 토큰 갱신 중인지 플래그 (무한 루프 방지)
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
