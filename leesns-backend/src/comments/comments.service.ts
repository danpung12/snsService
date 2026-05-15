import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from 'prisma/prisma.service';
import { CursorPaginationDto } from 'src/common/validation-message/dto/cursor-pagination.dto';
import { publicUserSelect } from 'src/common/prisma-select/user.select';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createComment(
    postId: number,
    authorId: string,
    commentDto: CreateCommentDto,
  ) {
    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId,
        ...commentDto,
      },
      include: {
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    await this.notificationsService.createNotification({
      receiverId: comment.post.authorId,
      senderId: comment.authorId,
      type: 'COMMENT',
      commentId: comment.id,
      postId,
    });

    return comment;
  }

  async getCommentbyPost(postId: number, paginationDto: CursorPaginationDto) {
    const { cursor, take = 5 } = paginationDto;
    const comments = await this.prisma.comment.findMany({
      where: cursor ? { postId, id: { lt: cursor } } : { postId },
      take: take + 1,
      orderBy: { id: 'desc' },
      include: { author: { select: publicUserSelect } },
    });

    const hasNextComment = comments[take] != null;
    const data = comments.slice(0, take);

    return {
      data,
      nextCursor: data.at(-1)?.id ?? null,
      hasNextComment,
    };
  }

  async getCommentbyId(commentId: number) {
    const comment = await this.prisma.comment.findMany({
      where: { id: commentId },
      include: { author: { select: publicUserSelect } },
    });

    return comment;
  }

  async updateComment(id: number, commentDto: CreateCommentDto) {
    await this.getCommentbyId(id);

    return await this.prisma.comment.update({
      where: { id },
      data: commentDto,
    });
  }

  async deleteComment(id: number) {
    await this.getCommentbyId(id);

    await this.prisma.comment.delete({
      where: { id },
    });
  }
}
