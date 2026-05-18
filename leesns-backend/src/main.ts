import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  const allowedOrigins: string[] = [
    'http://localhost:3000',
    'https://snsservice.vercel.app',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  const config = new DocumentBuilder()
    .setTitle('LeeSNS API')
    .setDescription('LeeSNS 백엔드 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public',
  });

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
