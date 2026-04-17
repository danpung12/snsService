import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  // Strategy가 제공하는 값으로 실제 사용자가 존재하는지 검증.
  async validate(email: string, password: string) {
    return await this.authService.validateUser({ email, password });
  }
}
