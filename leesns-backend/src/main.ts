import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000', // "이 주소(프론트)에서 오는 요청은 막지 마!"
    credentials: true, // "나중에 쿠키나 인증 헤더 같은 것도 통과시켜 줘!"
  });

  app.useGlobalPipes(new ValidationPipe())

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
