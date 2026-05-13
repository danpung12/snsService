import { API_URL } from "@/lib/api_url";
import { io } from "socket.io-client";

export function createChatSocket() {
  return io(`${API_URL}/chats`, {
    transports: ["websocket", "polling"],
    withCredentials: true,
  });
}
