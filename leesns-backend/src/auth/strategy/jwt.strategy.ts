import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => req?.cookies.accessToken || null,
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET!,
    });
  }

  validate(payload) {
    return payload;
  }
}
