import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PagePaginationDto {
  @ApiPropertyOptional({
    example: 1,
    description: '페이지 번호',
    default: 1,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    example: 5,
    description: '페이지당 데이터 수',
    default: 5,
  })
  @IsInt()
  @IsOptional()
  take: number = 5;
}
