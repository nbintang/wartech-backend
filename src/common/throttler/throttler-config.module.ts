import { Module } from '@nestjs/common';
import {
  ThrottlerModule,
  ThrottlerGuard,
  minutes,
  seconds,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: seconds(30), limit: 3 },
        { name: 'medium', ttl: minutes(1), limit: 5 },
        {
          name: 'long',
          ttl: minutes(1),
          limit: 25,
          blockDuration: minutes(5),
        },
      ],
      errorMessage: 'Too many requests, please try again later.',
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
