import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  receiverId!: string;
  senderId!: string;
  type!: NotificationType;
  postId?: number;
  commentId?: number;
}
