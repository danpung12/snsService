import { PickType } from '@nestjs/mapped-types';
import { AuthUserDto } from './auth-user.dto';

export class SignupUserDto extends PickType(AuthUserDto, [
  'email',
  'password',
  'nickname',
] as const) {}
