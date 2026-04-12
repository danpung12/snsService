import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Headers('authorization') rawToken: string) {
    const token = this.authService.parseToken(rawToken, false);
    const endtoken = this.authService.decodeBasicToken(token);
    return this.authService.login(endtoken);
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
  async PostTokenAcess(@Headers('authorization') rawToken: string) {
    const token = this.authService.parseToken(rawToken, true);

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    };
  }
}
