import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetUser } from 'src/users/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const notificationExample = {
  id: 'notification-id',
  receiverId: 'receiver-user-id',
  senderId: 'sender-user-id',
  type: 'LIKE',
  isRead: false,
  postId: 1,
  commentId: null,
  chatRoomId: null,
  createdAt: '2026-05-18T12:00:00.000Z',
  sender: {
    id: 'sender-user-id',
    nickname: '홍길동',
    avatarUrl: '/public/uploads/avatar_image/profile.jpg',
  },
  post: {
    id: 1,
    content: '오늘의 기록입니다.',
  },
  comment: null,
};

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: '내 알림 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 알림 목록 조회 성공',
    schema: {
      example: [notificationExample],
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @UseGuards(JwtAuthGuard)
  @Get()
  getMyNotifications(@GetUser('id') userId: string) {
    return this.notificationsService.getMyNotifications(userId);
  }

  @ApiOperation({ summary: '읽지 않은 알림 수 조회' })
  @ApiResponse({
    status: 200,
    description: '읽지 않은 알림 수 조회 성공',
    schema: {
      example: 3,
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  getUnreadCount(@GetUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  @ApiResponse({
    status: 200,
    description: '모든 알림 읽음 처리 성공',
    schema: {
      example: {
        count: 3,
      },
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  markAllAsRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @ApiOperation({ summary: '알림 읽음 처리' })
  @ApiResponse({
    status: 200,
    description: '알림 읽음 처리 성공',
    schema: {
      example: {
        id: 'notification-id',
        receiverId: 'receiver-user-id',
        senderId: 'sender-user-id',
        type: 'LIKE',
        isRead: true,
        postId: 1,
        commentId: null,
        chatRoomId: null,
        createdAt: '2026-05-18T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@GetUser('id') userId: string, @Param('id') notifyId) {
    return this.notificationsService.markAsRead(userId, notifyId);
  }
}
