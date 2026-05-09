import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  cursor?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  take: number = 5;

  @IsString()
  @IsOptional()
  authorId?: string;

}
