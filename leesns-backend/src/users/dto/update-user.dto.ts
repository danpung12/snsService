import { PartialType, PickType } from '@nestjs/swagger';
import { BaseUserDto } from './base-user.dto';

export class updateUserDto extends PartialType(
  PickType(BaseUserDto, ['nickname', 'avatarUrl'] as const),
) {}
