import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redis: Redis; // redis 선언-타입지정

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!)// Redis 생성해서 넣기
  }

  async set(key: string, value: string, ttlSecond: number) {
    await this.redis.set(key, value, 'EX', ttlSecond);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
  }
}
