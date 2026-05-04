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

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getCommentByPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() paginationDto: CursorPaginationDto,
  ) {
    return this.commentsService.getCommentbyPost(postId, paginationDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  postComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: CreateCommentDto,
    @Req() req,
  ) {
    return this.commentsService.createComment(postId, req.user.id, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  PatchComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateCommentDto,
  ) {
    return this.commentsService.updateComment(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.deleteComment(id);
  }
}
