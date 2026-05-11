import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { emailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';

export class BaseUserDto {
  @IsEmail({}, { message: emailValidationMessage })
  email!: string;

  @IsString()
  @Length(6, 20, { message: lengthValidationMessage })
  password!: string;

  @IsString()
  @Length(2, 10, { message: '닉네임은 2~10 글자로 만들어 주세요.' })
  nickname!: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
