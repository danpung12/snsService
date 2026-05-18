import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CursorPaginationDto } from 'src/common/validation-message/dto/cursor-pagination.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const commentExample = {
  id: 1,
  content: '좋은 글입니다.',
  postId: 1,
  authorId: 'author-user-id',
  created_at: '2026-05-18T12:00:00.000Z',
  author: {
    id: 'author-user-id',
    nickname: '홍길동',
    avatarUrl: '/public/uploads/avatar_image/profile.jpg',
  },
};

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: '게시글 댓글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '댓글 목록 조회 성공',
    schema: {
      example: {
        data: [commentExample],
        nextCursor: 1,
        hasNextComment: false,
      },
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Get()
  @UseGuards(JwtAuthGuard)
  getCommentByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() paginationDto: CursorPaginationDto,
  ) {
    return this.commentsService.getCommentbyPost(postId, paginationDto);
  }

  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({
    status: 201,
    description: '댓글 작성 성공',
    schema: {
      example: {
        id: 1,
        content: '좋은 글입니다.',
        postId: 1,
        authorId: 'author-user-id',
        created_at: '2026-05-18T12:00:00.000Z',
        post: {
          authorId: 'post-author-user-id',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Post()
  @UseGuards(JwtAuthGuard)
  postComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto,
    @Req() req,
  ) {
    return this.commentsService.createComment(postId, req.user.id, body);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({
    status: 200,
    description: '댓글 수정 성공',
    schema: {
      example: {
        id: 1,
        content: '수정된 댓글입니다.',
        postId: 1,
        authorId: 'author-user-id',
        created_at: '2026-05-18T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  PatchComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.updateComment(id, body);
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제 성공',
    schema: {
      example: null,
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.deleteComment(id);
  }
}
