import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { publicUserSelect } from 'src/common/prisma-select/user.select';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async followUser(followerId: string, followedId: string) {
    if (followerId === followedId) {
      throw new BadRequestException('자기 자신은 팔로우할 수 없습니다.');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followedId },
    });

    if (!targetUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followedId,
          followerId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('이미 팔로우한 사용자입니다.');
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followedId,
      },
    });

    return {
      isFollowing: true,
    };
  }

  async unfollowUser(followerId: string, followedId: string) {
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('팔로우가 되어있지 않습니다.');
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followedId: {
          followerId,
          followedId,
        },
      },
    });

    return {
      isFollowing: false,
    };
  }

  async getFollowings(userId: string) {
    return this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        followed: { select: publicUserSelect },
      },
    });
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: {
        followedId: userId,
      },
      include: {
        follower: { select: publicUserSelect },
      },
    });
  }


}
