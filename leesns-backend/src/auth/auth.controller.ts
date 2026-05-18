import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { RefreshAuthGuard } from './strategy/jwt-refresh.strategy';
import { AuthGuard } from '@nestjs/passport';
import { type Response } from 'express';
import { GetUser } from 'src/users/decorator/user.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/Signup-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    } as const;
  }

  @ApiOperation({
    summary: '회원 로그인',
    description:
      '이메일과 비밀번호로 로그인하고 accessToken, refreshToken 쿠키를 발급합니다. 응답 body는 없습니다.',
  })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    schema: {
      example: null,
    },
  })
  @ApiResponse({
    status: 401,
    description: '이메일 또는 비밀번호가 올바르지 않음',
  })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async loginUserPassport(
    @Body() _loginDto: LoginUserDto,
    @GetUser() user,
    @Res({ passthrough: true }) res,
  ) {
    const accessToken = await this.authService.signToken(user, false);
    const refreshToken = await this.authService.signToken(user, true);

    res.cookie('accessToken', accessToken, this.getCookieOptions());
    res.cookie('refreshToken', refreshToken, this.getCookieOptions());
  }

  @ApiOperation({
    summary: '회원가입',
    description:
      '이메일 인증이 완료된 사용자 정보를 등록하고 로그인 쿠키를 발급합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '회원가입 및 로그인 성공',
    schema: {
      example: {
        message: '회원가입 및 로그인 성공',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '이메일 인증 필요 또는 이미 가입된 이메일',
  })
  @ApiResponse({
    status: 409,
    description: '이미 가입된 이메일 또는 닉네임',
  })
  @Post('signup')
  async signup(
    @Body() signupDto: SignupUserDto,
    @Res({ passthrough: true }) res,
  ) {
    const tokens = await this.authService.signup(signupDto);

    res.cookie('accessToken', tokens.accessToken, this.getCookieOptions());
    res.cookie('refreshToken', tokens.refreshToken, this.getCookieOptions());

    return { message: '회원가입 및 로그인 성공' };
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 201,
    description: '로그아웃 성공',
    schema: {
      example: {
        message: '로그아웃 성공',
      },
    },
  })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', this.getCookieOptions());
    res.clearCookie('refreshToken', this.getCookieOptions());

    return {
      message: '로그아웃 성공',
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '액세스 토큰 재발급' })
  @ApiResponse({
    status: 201,
    description: '액세스 토큰 재발급 성공',
    schema: {
      example: {
        message: '토큰 갱신 성공',
      },
    },
  })
  @ApiResponse({ status: 401, description: '리프레시 토큰이 유효하지 않음' })
  @Post('token/access')
  @UseGuards(RefreshAuthGuard)
  async PostTokenAcess(@GetUser() user, @Res({ passthrough: true }) res) {
    const newAccessToken = await this.authService.rotateToken(user, false);

    res.cookie('accessToken', newAccessToken, this.getCookieOptions());
    return {
      message: '토큰 갱신 성공',
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '인증 사용자 확인' })
  @ApiResponse({
    status: 200,
    description: '인증 사용자 정보 조회 성공',
    schema: {
      example: {
        id: 'user-id',
        email: 'test@example.com',
        nickname: '홍길동',
        avatarUrl: '/public/uploads/avatar_image/profile.jpg',
      },
    },
  })
  @ApiResponse({ status: 401, description: '액세스 토큰이 유효하지 않음' })
  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@GetUser() user) {
    return user;
  }

  @ApiOperation({ summary: '구글 로그인 시작' })
  @ApiResponse({ status: 302, description: '구글 OAuth 인증 화면으로 이동' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @ApiOperation({ summary: '구글 로그인 콜백' })
  @ApiResponse({
    status: 302,
    description: '구글 로그인 성공 후 프론트엔드로 이동',
  })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@GetUser() user, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.googleLogin(user);

    res.cookie('accessToken', accessToken, this.getCookieOptions());
    res.cookie('refreshToken', refreshToken, this.getCookieOptions());

    res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  }

  @ApiOperation({
    summary: '이메일 인증번호 발송',
    description: '회원가입 전에 사용할 이메일 인증번호를 발송합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '인증번호 발송 성공',
    schema: {
      example: {
        message: '인증번호가 이메일로 발송되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '이미 가입된 이메일' })
  @Post('email/code')
  sendEmailCode(@Body('email') email: string) {
    return this.authService.sendEmailCode(email);
  }

  @ApiOperation({ summary: '이메일 인증번호 확인' })
  @ApiResponse({
    status: 201,
    description: '이메일 인증 성공',
    schema: {
      example: {
        ok: true,
        message: '이메일 인증이 완료되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '인증번호 만료 또는 불일치' })
  @Post('email/verify')
  verifyEmailCode(@Body('email') email: string, @Body('code') code: string) {
    return this.authService.verifyEmailCode(email, code);
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
