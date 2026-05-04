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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetUser } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { updatePostDto } from './dto/update-post.dto';
import { CursorPaginationDto } from 'src/common/validation-message/dto/cursor-pagination.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 모든 post를 다 가져온다.
  @Get()
  @UseGuards(JwtAuthGuard)
  getPosts(@Query() pagnationDto: CursorPaginationDto) {
    return this.postsService.getAllPosts(pagnationDto);
  }
  // id에 해당되는 post를 가져온다
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostbyId(id);
  }

  // POST를 생성한다.
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
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: updatePostDto,
  ) {
    return this.postsService.updatePost(id, body);
  }

  // id에 해당되는 POST를 삭제한다.
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
  @Post('mock/:userId')
  async generatePosts(@Param('userId', ParseIntPipe) userId: number) {
    await this.postsService.mockPosts(userId);
    return {
      message: `${userId}번 유저의 더미 게시글 100개가 성공적으로 생성되었습니다!`,
    };
  }
}
