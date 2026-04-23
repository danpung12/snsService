import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { updatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'prisma/prisma.service';



@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // Post를 전체 조회한다.
  getAllPosts() {
    return this.prisma.post.findMany({ orderBy: { id: 'desc' } });
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
}
