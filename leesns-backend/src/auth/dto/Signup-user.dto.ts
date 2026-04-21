import { PickType } from '@nestjs/mapped-types';
import { BaseUserDto } from 'src/users/dto/base-user.dto';

export class SignupUserDto extends PickType(BaseUserDto, [
  'email',
  'password',
  'nickname',
]) {}
