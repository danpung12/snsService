import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class PasswordPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.length < 6) {
      throw new BadRequestException('비밀번호는 6자 이상으로 입력해주세요!');
    }
    return value.toString();
  }
}
