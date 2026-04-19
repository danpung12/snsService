import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies.accessToken || null,
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET!,
    });
  }

  async validate(payload) {
    const user = await this.usersService.findById(payload.sub);
    return user;
  }

  // 원래 걍 return payload 인데, 큰 문제가 생겼음.
  // id를 토큰 구울때는 sub로 바꿔서 저장하는 게 국룰인데,
  // 커스텀 데코레이터에서 타입지정을 User 테이블로 해 버리니까
  // 커스텀 데코레이터에서 (sub)를 못 받음. User테이블에는 id로 저장돼있으니까.
  // 그래서 (id) 로 넣으면 토큰에서는 sub로 저장돼있으니 인식을 못함.
  // 그래서 payload.sub 로 user를 불러와 그 안의 id로 다시 저장하게 한 거임. 
}
