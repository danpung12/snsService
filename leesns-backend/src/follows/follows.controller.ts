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

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}
  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  followUser(
    @GetUser('id') followerId: string,
    @Param('userId') followedId: string,
  ) {
    return this.followsService.followUser(followerId, followedId);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  unfollowUser(
    @GetUser('id') followerId: string,
    @Param('userId') followedId: string,
  ) {
    return this.followsService.unfollowUser(followerId, followedId);
  }

  @Get('followings')
  @UseGuards(JwtAuthGuard)
  getFollowings(@GetUser('id') userId: string) {
    return this.followsService.getFollowings(userId);
  }

  @Get('followers')
  @UseGuards(JwtAuthGuard)
  getFollowers(@GetUser('id') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get(':userId/followings')
  @UseGuards(JwtAuthGuard)
  getUserFollowings(@Param('userId') userId: string) {
    return this.followsService.getFollowings(userId);
  }

  @Get(':userId/followers')
  @UseGuards(JwtAuthGuard)
  getUserFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }
}
