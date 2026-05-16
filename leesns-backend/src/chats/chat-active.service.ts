import { Server } from 'socket.io';

export class ChatActiveService {
  private server!: Server;

  setServer(server: Server) {
    this.server = server;
  }

  // active-chat:민수:수진
  getActiveRoom(userId: string, roomId: string) {
    return `active-chat:${userId}:${roomId}`;
  }

  isViewingRoom(userId: string, roomId: string) {
    const roomName = this.getActiveRoom(userId, roomId);

    return (this.server.sockets.adapter.rooms.get(roomName)?.size ?? 0) > 0;
  }
}
