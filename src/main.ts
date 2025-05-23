import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/http-exception/http-exception.filter';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));
  app.setGlobalPrefix('api');
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { extended: true });
  app.use(compression());
  app.enableCors({
    origin: ['http://localhost:3000', process.env.PROD_URL],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
