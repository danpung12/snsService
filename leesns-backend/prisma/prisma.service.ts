import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    // NestJS 앱이 켜질 때 DB와 자동으로 선을 연결해 주는 최적화 코드입니다.
    await this.$connect();
  }
}
