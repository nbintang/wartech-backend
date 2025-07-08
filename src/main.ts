import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

import { HttpExceptionFilter } from './commons/http-exception/http-exception.filter';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const allowedOrigins = [
    'http://localhost:3000',
    configService.get<string>('FRONTEND_URL'),
  ];
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));
  app.setGlobalPrefix('api');
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { extended: true });
  app.use(compression());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
