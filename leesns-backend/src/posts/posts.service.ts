import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { faker } from '@faker-js/faker/locale/ko';
import { CursorPaginationDto } from 'src/common/validation-message/dto/cursor-pagination.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // Post를 전체 조회한다.
  async getAllPosts(paginationDto: CursorPaginationDto) {
    const { cursor, take = 5 } = paginationDto;

    const posts = await this.prisma.post.findMany({
      where: cursor ? { id: { lt: cursor } } : undefined,
      take: take + 1,
      orderBy: { id: 'desc' },
    });

    const hasNextPage = posts[take] != null;
    const data = posts.slice(0, take);

    return {
      data,
      nextCursor: posts.at(-1)?.id ?? null,
      hasNextPage,
    };
  }

  // id에 해당하는 Post를 조회한다.
  async getPostbyId(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  createPost(nickname: string, postDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        author: nickname,
        ...postDto,
      },
    });
  }

  async updatePost(id: number, postDto: updatePostDto) {
    await this.getPostbyId(id);

    return await this.prisma.post.update({
      where: { id },
      data: postDto,
    });
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
      author: faker.person.fullName(), 
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
