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
import { type Response } from 'express';
import { GetUser } from 'src/users/decorator/user.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/Signup-user.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async loginUserPassport(
    @Body() _loginDto: LoginUserDto,
    @GetUser() user,
    @Res({ passthrough: true }) res,
  ) {
    const accessToken = await this.authService.signToken(user, false);
    const refreshToken = await this.authService.signToken(user, true);

    res.cookie('accessToken', accessToken, { httpOnly: true, path: '/' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/' });
  }

  @Post('signup')
  async signup(
    @Body() signupDto: SignupUserDto,
    @Res({ passthrough: true }) res,
  ) {
    const tokens = await this.authService.signup(signupDto);

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
  async PostTokenAcess(@GetUser() user, @Res({ passthrough: true }) res) {
    const newAccessToken = await this.authService.rotateToken(user, false);

    res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/' });
    return {
      message: '토큰 갱신 성공',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@GetUser() user) {
    return user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@GetUser() user, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.googleLogin(user);

    res.cookie('accessToken', accessToken, { httpOnly: true, path: '/' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, path: '/' });

    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
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
