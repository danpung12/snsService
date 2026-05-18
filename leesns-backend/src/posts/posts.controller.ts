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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetUser } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { updatePostDto } from './dto/update-post.dto';
import { CursorPaginationDto } from 'src/common/validation-message/dto/cursor-pagination.dto';
import { ResponseTimeInterceptor } from 'src/common/interceptors/response-time.interceptor';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const postExample = {
  id: 1,
  content: '오늘의 기록입니다.',
  likeCount: 3,
  commentCount: 1,
  created_at: '2026-05-18T12:00:00.000Z',
  authorId: 'author-user-id',
  author: {
    id: 'author-user-id',
    nickname: '홍길동',
    avatarUrl: '/public/uploads/avatar_image/profile.jpg',
  },
  images: [
    {
      id: 1,
      url: 'https://example.com/images/post-1.png',
      order: 0,
      createdAt: '2026-05-18T12:00:00.000Z',
      postId: 1,
    },
  ],
  likes: [{ id: 1 }],
  isLiked: true,
};

const postPaginationExample = {
  data: [postExample],
  nextCursor: 1,
  hasNextPage: false,
};

@ApiTags('Posts')
@Controller('posts')
@UseInterceptors(ResponseTimeInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 모든 post를 다 가져온다.
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    schema: {
      example: postPaginationExample,
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Get()
  @UseGuards(JwtAuthGuard)
  getPosts(
    @Query() pagnationDto: CursorPaginationDto,
    @GetUser('id') userId: string,
  ) {
    return this.postsService.getAllPosts(pagnationDto, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '팔로잉 게시글 목록 조회' })
  @ApiResponse({
    status: 201,
    description: '팔로잉 게시글 목록 조회 성공',
    schema: {
      example: postPaginationExample,
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Post('following')
  @UseGuards(JwtAuthGuard)
  getFollowingPosts(
    @Query() paginationDto: CursorPaginationDto,
    @GetUser('id') userId: string,
  ) {
    return this.postsService.getFollowingPosts(paginationDto, userId);
  }

  // id에 해당되는 post를 가져온다
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 상세 조회 성공',
    schema: {
      example: postExample,
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getPost(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
  ) {
    return this.postsService.getPostbyId(id, userId);
  }

  // POST를 생성한다.
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 생성' })
  @ApiResponse({
    status: 201,
    description: '게시글 생성 성공',
    schema: {
      example: postExample,
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @Post()
  @UseGuards(JwtAuthGuard)
  postPost(
    @GetUser('id') id: string,
    @Body() body: CreatePostDto,

    // @Body('title') title: string,
    // @Body('content') content: string,
  ) {
    return this.postsService.createPost(id, body);
  }

  // id에 해당되는 POST를 변경한다.
  @ApiOperation({ summary: '게시글 수정' })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    schema: {
      example: postExample,
    },
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: updatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  // id에 해당되는 POST를 삭제한다.
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제 성공',
    schema: {
      example: null,
    },
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }

  @ApiOperation({ summary: '목업 게시글 생성' })
  @ApiResponse({
    status: 201,
    description: '목업 게시글 생성 성공',
    schema: {
      example: {
        message: '1번 유저의 더미 게시글 100개가 성공적으로 생성되었습니다!',
      },
    },
  })
  @Post('mock/:userId')
  async generatePosts(@Param('userId', ParseIntPipe) userId: number) {
    await this.postsService.mockPosts(userId);
    return {
      message: `${userId}번 유저의 더미 게시글 100개가 성공적으로 생성되었습니다!`,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 좋아요 토글' })
  @ApiResponse({
    status: 201,
    description: '게시글 좋아요 토글 성공',
    schema: {
      example: {
        likeCount: 4,
        isLiked: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  @Post(':postId/like')
  @UseGuards(JwtAuthGuard)
  async togglePostLike(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser('id') userId: string,
  ) {
    return this.postsService.togglePostLike(postId, userId);
  }
}
