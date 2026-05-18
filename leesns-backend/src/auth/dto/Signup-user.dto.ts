import { PickType } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class SignupUserDto extends PickType(AuthUserDto, [
  'email',
  'password',
  'nickname',
] as const) {}
