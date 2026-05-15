import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { publicUserSelect } from 'src/common/prisma-select/user.select';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    if (dto.receiverId === dto.senderId) {
      return null;
    }

    const notification = await this.prisma.notification.create({
      data: dto,
      include: {
        sender: {
          select: publicUserSelect,
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });

    this.notificationsGateway.sendNotification(
      notification.receiverId,
      notification,
    );

    return notification;
  }

  async getMyNotifications(userId) {
    return this.prisma.notification.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    });
  }
  async getUnreadCount(userId) {
    return this.prisma.notification.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
  async markAsRead(userId, notifyId) {
    return this.prisma.notification.update({
      where: {
        receiverId: userId,
        id: notifyId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId) {
    return this.prisma.notification.updateMany({
      where: {
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
