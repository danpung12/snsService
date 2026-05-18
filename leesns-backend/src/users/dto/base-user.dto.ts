import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';

export class BaseUserDto {
  @ApiProperty({
    example: 'test@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: emailValidationMessage })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: '사용자 비밀번호, 6~20자',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @Length(6, 20, { message: lengthValidationMessage })
  password!: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 닉네임, 2~10자',
    minLength: 2,
    maxLength: 10,
  })
  @IsString()
  @Length(2, 10, { message: '닉네임은 2~10 글자로 만들어 주세요.' })
  nickname!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: '프로필 이미지 URL',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
