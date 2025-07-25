import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './commons/http-exception/http-exception.filter';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const allowedOrigins = [
    'https://wartech-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  // Add logging to debug CORS
  const logger = new Logger('CORS');

  // Enable CORS with detailed configuration
  app.enableCors({
    origin: (origin, callback) => {
      logger.log(`CORS request from origin: ${origin}`);

      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) {
        logger.log('No origin - allowing request');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        logger.log(`Origin ${origin} is allowed`);
        callback(null, true);
      } else {
        logger.warn(`Origin ${origin} is not allowed`);
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-HTTP-Method-Override',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Credentials',
    ],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Add a middleware to log all requests
  app.use((req, res, next) => {
    logger.log(`${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
  });

  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));
  app.setGlobalPrefix('api');
  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('urlencoded', { extended: true });
  app.use(compression());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}

bootstrap();
