import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('posts/:postId/views/last-7-days/')
  getPostLast7DaysViewStats(@Param('postId', ParseIntPipe) postId: number) {
    return this.statsService.getPostLast7DaysViewStats(postId);
  }
}
