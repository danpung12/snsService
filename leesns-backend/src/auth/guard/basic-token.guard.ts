import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // HTTP 요청 객체를 가져옴
    const req = context.switchToHttp().getRequest();

    // 요청 헤더에서 authorization 값을 추출
    const rawToken = req.headers['authorization'];

    // {authorization: 'Basic ~~'}

    // 토큰이 없으면 에러 발생
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다!');
    }

    // 'Basic xxx' 형식에서 실제 토큰 부분만 파싱 (false = Basic 토큰)
    const token = this.authService.parseToken(rawToken, false);

    // Base64로 인코딩된 토큰을 디코딩하여 email과 password 추출
    const { email, password } = this.authService.decodeBasicToken(token);

    // 추출한 email과 password로 사용자 인증 검증
    const user = await this.authService.validateUser({
      email,
      password,
    });

    // 인증된 사용자 정보를 요청 객체에 저장 (이후 컨트롤러에서 사용 가능)
    req.user = user;

    // 검증 성공 (true 반환 시 요청이 통과됨)
    return true;
  }
}
