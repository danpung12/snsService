import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: '좋은 글입니다.',
    description: '댓글 내용',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  content!: string;
}
