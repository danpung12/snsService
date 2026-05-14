import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.headers.cookie) {
      throw new UnauthorizedException({
        code: 'NO_COOKIE_HEADER',
        message: '요청에  쿠키 헤더가 없습니다.',
      });
    }

    if (!req.cookies?.refreshToken) {
      throw new UnauthorizedException({
        code: 'NO_REFRESH_TOKEN',
        message: '리프레시 토큰 쿠키가 없습니다.',
      });
    }
    return super.canActivate(context);
  }
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies.refreshToken || null,
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET!,
    });
  }

  async validate(payload) {
    const user = await this.usersService.findById(payload.sub);
    return user;
  }
}
