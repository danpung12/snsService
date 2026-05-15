import { SOCKET_URL } from "@/lib/api_url";
import { io } from "socket.io-client";

export function createNotificationSocket() {
  return io(`${SOCKET_URL}/notifications`, {
    transports: ["websocket", "polling"],
    withCredentials: true,
  });
}
