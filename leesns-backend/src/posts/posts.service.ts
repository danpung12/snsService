import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { faker } from '@faker-js/faker/locale/ko';
import { CursorPaginationDto } from 'src/common/validation-message/dto/cursor-pagination.dto';
import { promises } from 'fs';
import { join } from 'path';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private ImagePath(image: string | null) {
    return image ? `/${process.env.POST_IMAGE_PATH}/${image}` : null;
  }

  private async movePostImage(image: string | null) {
    if (!image) {
      return null;
    }

    await promises.rename(
      join(process.cwd(), process.env.POST_TEMP_IAMGE_PATH!, image),
      join(process.cwd(), process.env.POST_IMAGE_PATH!, image),
    );
  }

  // Post를 전체 조회한다.
  async getAllPosts(paginationDto: CursorPaginationDto) {
    const { cursor, take = 5 } = paginationDto;

    const posts = await this.prisma.post.findMany({
      where: cursor ? { id: { lt: cursor } } : undefined,
      take: take + 1,
      orderBy: { id: 'desc' },
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

    const hasNextPage = posts[take] != null;
    const data = posts.slice(0, take).map((post) => ({
      ...post,
      images: post.images.map((image) => ({
        ...image,
        url: this.ImagePath(image.url),
      })),
    }));

    return {
      data,
      nextCursor: posts.at(-1)?.id ?? null,
      hasNextPage,
    };
  }

  // id에 해당하는 Post를 조회한다.
  async getPostbyId(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        images: true,
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return {
      ...post,
      images: post.images.map((image) => ({
        ...image,
        url: this.ImagePath(image.url),
      })),
    };
  }

  async createPost(userid: string, postDto: CreatePostDto) {
    const { images = [], ...postData } = postDto;

    await Promise.all(images.map((image) => this.movePostImage(image)));

    const post = await this.prisma.post.create({
      data: {
        authorId: userid,
        ...postData,
        images: {
          create: images.map((image, index) => ({
            url: image,
            order: index,
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return {
      ...post,
      images: post.images.map((image) => ({
        ...image,
        url: this.ImagePath(image.url),
      })),
    };
  }

  async updatePost(id: number, postDto: updatePostDto) {
    await this.getPostbyId(id);

    const { images, ...postData } = postDto;

    if (images) {
      await Promise.all(images.map((image) => this.movePostImage(image)));
    }

    const post = await this.prisma.post.update({
      where: { id },
      data: postData,
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
    return {
      ...post,
      images: post.images.map((image) => ({
        ...image,
        url: this.ImagePath(image.url),
      })),
    };
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
}
