import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/strategy/jwt.strategy';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    const userId = req.user.sub;

    const user = await this.usersService.findById(userId);

    return {
      id: user?.id,
      nickname: user?.nickname,
    };
  }
}
