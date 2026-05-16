import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: ['http://localhost:3000', 'https://snsservice.vercel.app'],
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('joinNotificationRoom')
  joinNotificationRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(userId);

    return {
      message: '방 참가 완료',
    };
  }

  sendNotification(userId: string, notification: any) {
    this.server.to(userId).emit('newNotification', notification);
  }
}
