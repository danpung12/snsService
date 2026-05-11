import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/strategy/jwt.strategy';
import { GetUser } from './decorator/user.decorator';
import { updateUserDto } from './dto/update-user.dto';

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
      avatarUrl: user?.avatarUrl,
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@GetUser('id') userId: string, @Body() body: updateUserDto) {
    return this.usersService.updateMyProfile(userId, body);
  }

  @Get(':userId')
  async getUserProfile(@Param('userId') userId: string) {
    const user = await this.usersService.findById(userId);

    return {
      id: user?.id,
      nickname: user?.nickname,
      avatarUrl: user?.avatarUrl,
    };
  }
}
