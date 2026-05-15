import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { publicUserSelect } from 'src/common/prisma-select/user.select';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatPaginationDto } from './dto/chat-pagination.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createChat(createChatDto: CreateChatDto) {
    const userIds = createChatDto.userIds.sort();
    const dmKey = userIds.join(':');

    const existingRoom = await this.prisma.chatRoom.findUnique({
      where: { dmKey },
      include: {
        users: {
          select: publicUserSelect,
        },
      },
    });

    if (existingRoom) return existingRoom;

    return this.prisma.chatRoom.create({
      data: {
        dmKey,
        users: {
          connect: userIds.map((userId) => ({ id: userId })),
          //connect: createChatDto.userIds.map((userId) => ({ id: userId })), 와 동일
        },
      },
      include: {
        users: {
          select: publicUserSelect,
        },
      },
    });
  }

  async createMessage(data: SendMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        chatRoomId: data.roomId,
        senderId: data.senderId,
      },
      // 흠 메세지 전송할때는 그 직후 랜더링에 sender 정보 안 필요한데.. 일단 혹시모르니까 넣어놓음.
      include: {
        sender: {
          select: publicUserSelect,
        },
      },
    });

    const chatRoom = await this.prisma.chatRoom.update({
      where: {
        id: data.roomId,
      },
      data: {
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
      },
      include: {
        users: true,
      },
    });

    const receiver = chatRoom.users.find((user) => user.id !== data.senderId);

    if (receiver) {
      const notificationData = {
        receiverId: receiver.id,
        senderId: data.senderId,
        type: 'MESSAGE' as const,
        chatRoomId: data.roomId,
      };

      const existNotify = await this.prisma.notification.findFirst({
        where: { ...notificationData, isRead: false },
      });

      if (!existNotify)
        await this.notificationsService.createNotification(notificationData);
    }
    return message;
  }

  async getMyChatRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });
  }

  async getMessages(paginationDto: ChatPaginationDto) {
    const { chatRoomId, cursor, take } = paginationDto;

    const message = await this.prisma.message.findMany({
      where: {
        chatRoomId,
      },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: take + 1,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: publicUserSelect,
        },
      },
    });
    const hasNextPage = message[take] != null;
    const data = message.slice(0, take).reverse();

    return {
      data,
      nextCursor: hasNextPage ? data[0]?.id : null,
      hasNextPage,
    };
  }
}
