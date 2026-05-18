import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: '오늘의 기록입니다.',
    description: '게시글 내용',
  })
  @IsString({
    message: 'title은 string 타입을 입력해줘야 합니다',
  })
  @IsString()
  content!: string;

  @ApiPropertyOptional({
    example: [
      'https://example.com/images/post-1.png',
      'https://example.com/images/post-2.png',
    ],
    description: '게시글 이미지 URL 목록',
    type: [String],
  })
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
