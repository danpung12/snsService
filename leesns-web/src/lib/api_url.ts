export const API_URL = "/api";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://snsservice.onrender.com");

export const SOCKET_URL = BACKEND_URL;
