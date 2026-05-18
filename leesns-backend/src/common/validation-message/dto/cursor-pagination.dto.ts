import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @ApiPropertyOptional({
    example: 100,
    description: '다음 페이지 조회 기준이 되는 마지막 데이터 ID',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  cursor?: number;

  @ApiPropertyOptional({
    example: 5,
    description: '조회할 데이터 수',
    default: 5,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  take: number = 5;

  @ApiPropertyOptional({
    example: 'author-user-id',
    description: '특정 작성자의 게시글만 조회할 때 사용하는 사용자 ID',
  })
  @IsString()
  @IsOptional()
  authorId?: string;
}
