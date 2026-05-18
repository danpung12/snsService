import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    example: ['user-id-1', 'user-id-2'],
    description: '채팅방에 참여할 사용자 ID 목록',
    minItems: 2,
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  userIds!: string[];
}
