import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/strategy/jwt.strategy';
import { GetUser } from './decorator/user.decorator';
import { updateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const userProfileExample = {
  id: 'user-id',
  nickname: '홍길동',
  avatarUrl: '/public/uploads/avatar_image/profile.jpg',
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '내 프로필 조회 성공',
    schema: {
      example: userProfileExample,
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
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

  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiResponse({
    status: 200,
    description: '내 프로필 수정 성공',
    schema: {
      example: userProfileExample,
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMyProfile(@GetUser('id') userId: string, @Body() body: updateUserDto) {
    return this.usersService.updateMyProfile(userId, body);
  }

  @ApiOperation({ summary: '사용자 프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 프로필 조회 성공',
    schema: {
      example: userProfileExample,
    },
  })
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
