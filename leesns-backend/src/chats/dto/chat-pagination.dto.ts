import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ChatPaginationDto {
  @ApiProperty({
    example: 'chat-room-id',
    description: '채팅방 ID',
  })
  @IsString()
  chatRoomId!: string;

  @ApiPropertyOptional({
    example: 'message-cursor-id',
    description: '이전 메시지 페이지를 조회할 커서',
  })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({
    example: 20,
    description: '조회할 메시지 수',
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  take: number = 20;
}
