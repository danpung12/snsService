import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly googleSMTP = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendVerifyCode(email: string, code: string) {
    return this.googleSMTP.sendMail({
      from: `"LeeSNS" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'LEESNS 이메일 인증번호',
      html: `
            <div>
            <h2> LeeSNS 이메일 인증번호 </h2>
            <p>아래 인증번호를 입력해주세요.</p>
            <h1>${code}</h1>
            <p>인증번호는 3분 동안 유효합니다.</p>
            </div>
        `,
    });
  }
}
