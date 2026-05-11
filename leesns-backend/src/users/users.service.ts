import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { updateUserDto } from './dto/update-user.dto';
import { join } from 'path';
import { promises } from 'fs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private ImagePath(image?: string | null) {
    if (image) {
      return `/${process.env.AVATAR_IMAGE_PATH}/${image}`;
    }
  }

  private async moveAvatarImage(image: string | null) {
    if (!image) {
      return null;
    }

    await promises.rename(
      join(process.cwd(), process.env.POST_TEMP_IAMGE_PATH!, image),
      join(process.cwd(), process.env.AVATAR_IMAGE_PATH!, image),
    );
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(user: Prisma.UserCreateInput) {
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

  async findByProviderId(providerId: string) {
    return this.prisma.user.findUnique({ where: { providerId } });
  }

  async updateMyProfile(userId: string, body: updateUserDto) {
    await this.moveAvatarImage(body.avatarUrl ?? null);

    return this.prisma.user.update({
      where: { id: userId },
      data: { ...body, avatarUrl: this.ImagePath(body.avatarUrl) },
      select: { id: true, nickname: true, avatarUrl: true },
    });
  }
}
