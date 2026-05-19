import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 */30 * * * * ')
  async saveDailyPostViewStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const posts = await this.prisma.post.findMany({
      select: {
        id: true,
        viewCount: true,
      },
    });

    for (const post of posts) {
      const stat = await this.prisma.postDailyStat.upsert({
        where: {
          postId_date: {
            postId: post.id,
            date: today,
          },
        },
        create: {
          postId: post.id,
          date: today,
          snapshotViewCount: post.viewCount,
        },
        update: {
          snapshotViewCount: post.viewCount,
        },
      });
      console.log('저장된 통계:', stat);
    }
    console.log(`조회수 스냅샷 저장 완료: ${posts.length}개`);
  }

  async getPostLast7DaysViewStats(postId: number) {
    const sevenDaysAgo = new Date(); // 오늘 날짜
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // 일주일 전
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return this.prisma.postDailyStat.findMany({
      where: { postId, date: { gte: sevenDaysAgo } },
      select: {
        date: true,
        snapshotViewCount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
