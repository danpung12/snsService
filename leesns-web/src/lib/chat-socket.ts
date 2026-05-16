import { SOCKET_URL } from "@/lib/api_url";
import { io } from "socket.io-client";

export function createChatSocket() {
  return io(`${SOCKET_URL}/chats`, {
    transports: ["polling", "websocket"],
    withCredentials: true,
    timeout: 8000,
  });
}
