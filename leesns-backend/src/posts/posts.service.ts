import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { faker } from '@faker-js/faker/locale/ko';
import { CursorPaginationDto } from 'src/common/validation-message/dto/cursor-pagination.dto';
import { promises } from 'fs';
import { join } from 'path';
import { publicUserSelect } from 'src/common/prisma-select/user.select';
import { FollowsService } from 'src/follows/follows.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followsService: FollowsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private formatPost(post) {
    return {
      ...post,
      // 좋아요
      isLiked: post.likes?.length > 0,
      // 이미지 파싱
      images: post.images ?? [],
    };
  }

  // Post를 전체 조회한다.
  async getAllPosts(
    paginationDto: CursorPaginationDto,
    userId: string,
    whereCondition?: string[],
  ) {
    const { cursor, take = 5, authorId } = paginationDto;

    const where = {
      authorId: whereCondition ? { in: whereCondition } : authorId,
      ...(cursor ? { id: { lt: cursor } } : undefined),
    };

    const posts = await this.prisma.post.findMany({
      where: where,
      take: take + 1,
      orderBy: { id: 'desc' },
      include: {
        author: {
          select: publicUserSelect,
        },
        likes: {
          where: { userId },
          select: { id: true },
        },

        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    const hasNextPage = posts[take] != null;
    const data = posts.slice(0, take).map((post) => this.formatPost(post));

    return {
      data,
      nextCursor: posts.at(-1)?.id ?? null,
      hasNextPage,
    };
  }

  // id에 해당하는 Post를 조회한다.
  async getPostbyId(id: number, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: publicUserSelect,
        },
        likes: { where: { userId }, select: { id: true } },

        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return this.formatPost(post);
  }

  async createPost(userid: string, postDto: CreatePostDto) {
    const { images = [], ...postData } = postDto;

    const post = await this.prisma.post.create({
      data: {
        authorId: userid,
        ...postData,
        images: {
          create: images.map((url, index) => ({
            url,
            order: index,
          })),
        },
      },
      include: {
        author: {
          select: publicUserSelect,
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return this.formatPost(post);
  }

  async updatePost(id: number, postDto: updatePostDto) {
    await this.getPostbyId(id);

    const { images, ...postData } = postDto;

    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...postData,
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url, index) => ({
              url,
              order: index,
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });
    return this.formatPost(post);
  }

  async deletePost(id: number) {
    await this.getPostbyId(id);

    await this.prisma.post.delete({
      where: { id },
    });
  }

  async mockPosts(userId: number) {
    const dummyData = Array.from({ length: 100 }, () => ({
      //  Faker가 그럴싸한 랜덤 데이터를 채워줍니다.
      authorId: faker.person.fullName(),
      content: faker.lorem.paragraphs(3),
      likeCount: faker.number.int({ min: 0, max: 500 }),
      commentCount: faker.number.int({ min: 0, max: 50 }),
    }));

    // 단 1번의 쿼리로 100개 밀어넣기
    await this.prisma.post.createMany({
      data: dummyData,
    });
  }

  async togglePostLike(postId: number, userId: string) {
    // 게시글 먼저 있는지 확인
    await this.getPostbyId(postId);

    // 게시글에 유저가 누른 기록이 있는지 확인. 있으면 true
    const postLike = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    // true 이면 해당 누른 기록(userId_postId) 을 지움.
    if (postLike) {
      await this.prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      const post = await this.prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      return {
        likeCount: post.likeCount,
        isLiked: false,
      };
    } else {
      // false이면 누른 기록을 새로 만듬.
      await this.prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      });

      const post = await this.prisma.post.update({
        where: { id: postId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      await this.notificationsService.createNotification({
        type: 'LIKE',
        senderId: userId,
        receiverId: post.authorId,
        postId,
      });

      return {
        likeCount: post.likeCount,
        isLiked: true,
      };
    }
  }

  async getFollowingPosts(paginationDto: CursorPaginationDto, userId: string) {
    const followings = await this.followsService.getFollowings(userId);

    const targetUserIds = followings.map((follow) => follow.followedId);

    return this.getAllPosts(paginationDto, userId, targetUserIds);
  }
}
