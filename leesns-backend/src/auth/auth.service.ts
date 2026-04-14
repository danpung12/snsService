import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JWT_SECRET } from './const/auth.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  signToken(user: Pick<User, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: isRefreshToken ? '1h' : '5m',
    });
  }

  loginUser(user: Pick<User, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  /**
   * 이메일과 비밀번호로 사용자를 찾아서 반환합니다.
   *
   * @param user - 사용자 인증 정보
   * @param user.email - 사용자 이메일
   * @param user.password - 사용자 비밀번호
   * @returns 인증된 사용자 객체
   * @throws {UnauthorizedException} 사용자를 찾을 수 없거나 비밀번호가 일치하지 않는 경우
   *
   * @example
   * const user = await authService.validateUser({
   *   email: 'test@test.com',
   *   password: '1234'
   * });
   */
  async validateUser(user: Pick<User, 'email' | 'password'>) {
    const found = await this.usersService.findByEmail(user.email);

    if (!found) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const passOk = await bcrypt.compare(user.password, found.password);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }
    return found;
  }

  async login(user: Pick<User, 'email' | 'password'>) {
    const loginedUser = await this.validateUser(user);

    return this.loginUser(loginedUser);
  }

  async signup(user: Pick<User, 'nickname' | 'email' | 'password'>) {
    const hash = await bcrypt.hash(user.password, 10);
    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });
    return this.loginUser(newUser);
  }

  parseToken(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    //토큰 구성이 2개가 아니거나, prefix가 안 맞거나.
    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');
    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 refresh Token으로만 가능합니다.',
      );
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }
}
