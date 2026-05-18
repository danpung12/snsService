import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { GetUser } from 'src/users/decorator/user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const followExample = {
  id: 'follow-id',
  followerId: 'follower-user-id',
  followedId: 'followed-user-id',
  followed: {
    id: 'followed-user-id',
    nickname: '홍길동',
    avatarUrl: '/public/uploads/avatar_image/profile.jpg',
  },
};

const followerExample = {
  id: 'follow-id',
  followerId: 'follower-user-id',
  followedId: 'followed-user-id',
  follower: {
    id: 'follower-user-id',
    nickname: '홍길동',
    avatarUrl: '/public/uploads/avatar_image/profile.jpg',
  },
};

@ApiTags('Follows')
@ApiBearerAuth()
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @ApiOperation({ summary: '사용자 팔로우' })
  @ApiResponse({
    status: 201,
    description: '팔로우 성공',
    schema: {
      example: {
        isFollowing: true,
      },
    },
  })
  @ApiResponse({ status: 400, description: '자기 자신은 팔로우할 수 없음' })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 팔로우한 사용자' })
  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  followUser(
    @GetUser('id') followerId: string,
    @Param('userId') followedId: string,
  ) {
    return this.followsService.followUser(followerId, followedId);
  }

  @ApiOperation({ summary: '사용자 언팔로우' })
  @ApiResponse({
    status: 200,
    description: '언팔로우 성공',
    schema: {
      example: {
        isFollowing: false,
      },
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @ApiResponse({ status: 404, description: '팔로우 관계를 찾을 수 없음' })
  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  unfollowUser(
    @GetUser('id') followerId: string,
    @Param('userId') followedId: string,
  ) {
    return this.followsService.unfollowUser(followerId, followedId);
  }

  @ApiOperation({ summary: '내 팔로잉 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 팔로잉 목록 조회 성공',
    schema: {
      example: [followExample],
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Get('followings')
  @UseGuards(JwtAuthGuard)
  getFollowings(@GetUser('id') userId: string) {
    return this.followsService.getFollowings(userId);
  }

  @ApiOperation({ summary: '내 팔로워 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '내 팔로워 목록 조회 성공',
    schema: {
      example: [followerExample],
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Get('followers')
  @UseGuards(JwtAuthGuard)
  getFollowers(@GetUser('id') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @ApiOperation({ summary: '사용자 팔로잉 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 팔로잉 목록 조회 성공',
    schema: {
      example: [followExample],
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Get(':userId/followings')
  @UseGuards(JwtAuthGuard)
  getUserFollowings(@Param('userId') userId: string) {
    return this.followsService.getFollowings(userId);
  }

  @ApiOperation({ summary: '사용자 팔로워 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 팔로워 목록 조회 성공',
    schema: {
      example: [followerExample],
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Get(':userId/followers')
  @UseGuards(JwtAuthGuard)
  getUserFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }
}
