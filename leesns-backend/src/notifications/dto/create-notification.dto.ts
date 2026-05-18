import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'receiver-user-id',
    description: '알림 수신자 ID',
  })
  receiverId!: string;

  @ApiProperty({
    example: 'sender-user-id',
    description: '알림 발신자 ID',
  })
  senderId!: string;

  @ApiProperty({
    enum: NotificationType,
    example: 'LIKE',
    description: '알림 유형',
  })
  type!: NotificationType;

  @ApiPropertyOptional({
    example: 1,
    description: '알림과 연결된 게시글 ID',
  })
  postId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: '알림과 연결된 댓글 ID',
  })
  commentId?: number;

  @ApiPropertyOptional({
    example: 'chat-room-id',
    description: '알림과 연결된 채팅방 ID',
  })
  chatRoomId?: string;
}
