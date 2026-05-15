import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'prisma/prisma.service';
import { FollowsService } from 'src/follows/follows.service';
import { NotificationsModule } from 'src/notifications/notifications.module';


@Module({
  imports: [NotificationsModule],
  controllers: [PostsController],
  providers: [PostsService, FollowsService, PrismaService],
})
export class PostsModule {}
