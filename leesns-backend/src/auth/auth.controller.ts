import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { RefreshAuthGuard } from './strategy/jwt-refresh.strategy';
import { AuthGuard } from '@nestjs/passport';
import { type Request, type Response } from 'express';
import { User } from '@prisma/client';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async loginUserPassport(@Req() req, @Res({ passthrough: true }) res) {
    const user = req.user;
    const accessToken = await this.authService.signToken(user, false);
    const refreshToken = await this.authService.signToken(user, true);

    res.cookie('accessToken', accessToken, { httpOnly: true, path: '/' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/' });
  }

  @Post('signup')
  async signup(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res,
  ) {
    const tokens = await this.authService.signup({
      nickname,
      email,
      password,
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      path: '/',
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      path: '/',
    });

    return { message: '회원가입 및 로그인 성공' };
  }

  //토큰 재발급
  @Post('token/access')
  @UseGuards(RefreshAuthGuard)
  async PostTokenAcess(@Req() req, @Res({ passthrough: true }) res) {
    const newAccessToken = await this.authService.rotateToken(req.user, false);

    res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/' });
    return {
      message: '토큰 갱신 성공',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Req() req) {
    return req.user;
  }

  // @Post('token/access')
  // @UseGuards(AccessTokenGuard)
  // async PostTokenAcess(@Headers('authorization') rawToken: string) {
  //   const token = this.authService.parseToken(rawToken, true);

  //   const newToken = this.authService.rotateToken(token, false);

  //   return {
  //     accessToken: newToken,
  //   };
  // }

  // @Post('token/refresh')
  // @UseGuards(RefreshTokenGuard)
  // postTokenRefresh(@Headers('authorization') rawToken: string) {
  //   const token = this.authService.parseToken(rawToken, true);

  //   const newToken = this.authService.rotateToken(token, true);

  //   return { refreshToken: newToken };
  // }

  // @Post('login')
  // login(@Headers('authorization') rawToken: string) {
  //   const token = this.authService.parseToken(rawToken, false);
  //   const endtoken = this.authService.decodeBasicToken(token);
  //   return this.authService.login(endtoken);
  // }
}
