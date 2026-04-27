import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class CursorPaginationDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  cursor: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  take: number = 5;
}
