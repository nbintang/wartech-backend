import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './logger.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './logger.interceptor';

@Module({
  imports: [WinstonModule.forRoot(winstonLoggerOptions)],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class LoggerModule {}
