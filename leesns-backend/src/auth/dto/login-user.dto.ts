import { PickType } from '@nestjs/mapped-types';
import { AuthUserDto } from './auth-user.dto';

export class LoginUserDto extends PickType(AuthUserDto, [
  'email',
  'password',
] as const) {}
