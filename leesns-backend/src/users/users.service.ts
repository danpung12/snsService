import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(user: Pick<User, 'email' | 'nickname' | 'password'>) {
    
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: user.email }, { nickname: user.nickname }],
      },
    });

    if (exists?.email === user.email) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }
    if (exists?.nickname === user.nickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    const newUser = await this.prisma.user.create({ data: user });

    return newUser;
  }
}
