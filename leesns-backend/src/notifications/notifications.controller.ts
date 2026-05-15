import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetUser } from 'src/users/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyNotifications(@GetUser('id') userId: string) {
    return this.notificationsService.getMyNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  getUnreadCount(@GetUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('read-all')
  markAllAsRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@GetUser('id') userId: string, @Param('id') notifyId) {
    return this.notificationsService.markAsRead(userId, notifyId);
  }
}
