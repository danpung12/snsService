import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: 'chat-room-id',
    description: '메시지를 보낼 채팅방 ID',
  })
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @ApiProperty({
    example: 'sender-user-id',
    description: '메시지 발신자 ID',
  })
  @IsString()
  @IsNotEmpty()
  senderId!: string;

  @ApiPropertyOptional({
    example: '안녕하세요.',
    description: '메시지 내용',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/message.png',
    description: '메시지 이미지 URL',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 'receiver-user-id',
    description: '메시지 수신자 ID',
  })
  @IsString()
  @IsNotEmpty()
  receiverId!: string;
}
