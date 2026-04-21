import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetUser } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/strategy/jwt.strategy';
import { updatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 모든 post를 다 가져온다.
  @Get()
  @UseGuards(JwtAuthGuard)
  getPosts() {
    return this.postsService.getAllPosts();
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
    @GetUser('nickname') nickname: string,

    @Body() body: CreatePostDto,
    // @Body('title') title: string,
    // @Body('content') content: string,
  ) {
    return this.postsService.createPost(nickname, body);
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
}
