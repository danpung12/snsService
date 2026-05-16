import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { Namespace, Server, Socket } from 'socket.io';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatPaginationDto } from './dto/chat-pagination.dto';

@WebSocketGateway({
  namespace: 'chats',
  cors: {
    origin: ['http://localhost:3000', 'https://snsservice.vercel.app'],
    credentials: true,
  },
})
export class ChatsGateway {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer()
  server!: Namespace;

  @SubscribeMessage('createChat')
  async createChat(
    @MessageBody() createChatDto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.chatsService.createChat(createChatDto);
    await client.join(room.id);

    return room;
  }

  @SubscribeMessage('sendMessage')
  async SendMessage(@MessageBody() data: SendMessageDto) {
    const isViewingRoom = await this.isViewingRoom(
      data.receiverId,
      data.roomId,
    );
    const message = await this.chatsService.createMessage(data, isViewingRoom);

    this.server.to(data.roomId).emit('receiveMessage', message);
  }

  @SubscribeMessage('getMyChatRooms')
  async getMyChatRooms(@MessageBody() data) {
    return this.chatsService.getMyChatRooms(data.userId);
  }

  @SubscribeMessage('getMessages')
  async getMessage(@MessageBody() data: ChatPaginationDto) {
    return this.chatsService.getMessages(data);
  }

  private viewingRoomName(userId: string, roomId: string) {
    return `active-chat:${userId}:${roomId}`;
  }

  private isViewingRoom(userId: string, roomId: string) {
    const roomName = this.viewingRoomName(userId, roomId);

    return (this.server.adapter.rooms.get(roomName)?.size ?? 0) > 0;
  }

  @SubscribeMessage('enterViewingRoom')
  enterViewingRoom(
    @MessageBody() data: { userId: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = this.viewingRoomName(data.userId, data.roomId);
    client.join(roomName);
  }

  @SubscribeMessage('leaveViewingRoom')
  leaveViewingRoom(
    @MessageBody() data: { userId: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = this.viewingRoomName(data.userId, data.roomId);
    client.leave(roomName);
  }

  // @SubscribeMessage('joinRoom')
  // async joinRoom(@MessageBody() data, @ConnectedSocket() client: Socket) {
  //   await client.join(data.roomId);

  //   return {
  //     message: '접속됨',
  //     roomId: data.roomId,
  //   };
  // }
}
