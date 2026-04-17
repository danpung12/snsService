import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { RefreshAuthGuard } from './strategy/jwt-refresh.strategy';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async loginUserPassport(@Request() req) {
    const user = req.user;

    return {
      accessToken: await this.authService.signToken(user, false),
      refreshToken: await this.authService.signToken(user, true),
      nickname: user.nickname,
    };
  }

  
  @Post('signup')
  signup(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.signup({
      nickname,
      email,
      password,
    });
  }

  @Post('token/access')
  @UseGuards(RefreshAuthGuard)
  async PostTokenAcess(@Request() req) {
    const newAccessToken = await this.authService.rotateToken(req.user, false);
    return {
      accessToken: newAccessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req) {
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
