import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/strategy/jwt.strategy';
import { GetUser } from './decorator/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@GetUser('id') userId: string) {
    const user = await this.usersService.findById(userId);

    return {
      id: user?.id,
      nickname: user?.nickname,
    };
  }
}
