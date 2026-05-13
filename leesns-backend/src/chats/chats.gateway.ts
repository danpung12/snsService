import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatPaginationDto } from './dto/chat-pagination.dto';

@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer()
  server!: Server;

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
    const message = await this.chatsService.createMessage(data);

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

  // @SubscribeMessage('joinRoom')
  // async joinRoom(@MessageBody() data, @ConnectedSocket() client: Socket) {
  //   await client.join(data.roomId);

  //   return {
  //     message: '접속됨',
  //     roomId: data.roomId,
  //   };
  // }
}
