import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
  (data: keyof User, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException(
        'Request에 user 프로퍼티가 없습니다.',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
