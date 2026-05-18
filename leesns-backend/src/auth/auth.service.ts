import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) {}

  // 토큰 발급 (Passport 가드 통과 후 호출)
  signToken(user: Pick<User, 'id' | 'email'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: isRefreshToken
        ? process.env.REFRESH_TOKEN_SECRET
        : process.env.ACCESS_TOKEN_SECRET,
      expiresIn: isRefreshToken ? '1h' : '5m',
    });
  }

  // 로그인 시 토큰 세트 반환
  loginUser(user: Pick<User, 'id' | 'email'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
      userId: user.id,
    };
  }

  // LocalStrategy에서 호출하는 토큰 검증 로직
  async validateUser(user: Pick<User, 'email' | 'password'>) {
    const found = await this.usersService.findByEmail(user.email);

    if (!found) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const passOk = await bcrypt.compare(user.password!, found.password!);

    if (!passOk) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }
    return found;
  }

  // 회원가입
  async signup(user: Pick<User, 'nickname' | 'email' | 'password'>) {
    const verifiedKey = `email:verified:${user.email}`;

    if (!(await this.redisService.get(verifiedKey))) {
      throw new BadRequestException('이메일 인증이 필요합니다.');
    }

    const hash = await bcrypt.hash(user.password!, 10);
    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    await this.redisService.del(verifiedKey);

    return this.loginUser(newUser);
  }

  // 토큰 갱신 로직 (RefreshGuard 통과 후 호출)
  rotateToken(user: any, isRefreshToken: boolean) {
    return this.signToken(
      {
        id: user.id, // 또는
        email: user.email,
      },
      isRefreshToken,
    );
  }

  
  async sendEmailCode(email: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('이미 가입된 이메일입니다');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redisService.set(`email:verify:${email}`, code, 60 * 3);

    await this.mailService.sendVerifyCode(email, code);

    return {
      message: '인증번호가 이메일로 발송되었습니다.',
    };
  }
  async verifyEmailCode(email: string, code: string) {
    const savedCode = await this.redisService.get(`email:verify:${email}`);

    if (!savedCode) {
      throw new BadRequestException(
        '인증번호가 만료되었거나 존재하지 않습니다',
      );
    }
    if (savedCode !== code) {
      throw new BadRequestException('인증번호가 일치하지 않습니다.');
    }
    await this.redisService.del(`email:verify:${email}`);

    await this.redisService.set(`email:verified:${email}`, 'true', 60 * 10);

    return {
      ok: true,
      message: `이메일 인증이 완료되었습니다.`,
    };
  }

  async googleLogin(profile: any) {
    const providerId = profile.id;
    const email = profile.emails[0].value;
    const nickname = profile.displayName;

    const user = await this.usersService.findByProviderId(providerId);

    if (!user) {
      const newUser = await this.usersService.createUser({
        email: email,
        nickname: nickname,
        provider: 'google',
        providerId: providerId,
      });

      return this.loginUser(newUser);
    }

    return this.loginUser(user);

    // rotateToken(token: string, isRefreshToken: boolean) {
    //   const decoded = this.verifyToken(token);

    //   if (decoded.type !== 'refresh') {
    //     throw new UnauthorizedException(
    //       '토큰 재발급은 refresh Token으로만 가능합니다.',
    //     );
    //   }

    //   return this.signToken(
    //     {
    //       ...decoded,
    //     },
    //     isRefreshToken,
    //   );
    // }

    // parseToken(header: string, isBearer: boolean) {
    //   const splitToken = header.split(' ');

    //   const prefix = isBearer ? 'Bearer' : 'Basic';

    //   //토큰 구성이 2개가 아니거나, prefix가 안 맞거나.
    //   if (splitToken.length !== 2 || splitToken[0] !== prefix) {
    //     throw new UnauthorizedException('잘못된 토큰입니다.');
    //   }

    //   const token = splitToken[1];

    //   return token;
    // }

    // decodeBasicToken(base64String: string) {
    //   const decoded = Buffer.from(base64String, 'base64').toString('utf8');
    //   const split = decoded.split(':');

    //   if (split.length !== 2) {
    //     throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    //   }

    //   const email = split[0];
    //   const password = split[1];

    //   return {
    //     email,
    //     password,
    //   };
    // }

    // verifyToken(token: string) {
    //   return this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    // }
  }
}
