import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { VerificationTokenModule } from './verification-token/verification-token.module';
import { LoggerModule } from './common/interceptors/logger/logger.module';
import { ResponseModule } from './common/interceptors/response/response.module';
import { HttpExceptionModule } from './common/filters/http-exception/http-exception.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    MailModule,
    VerificationTokenModule,
    LoggerModule,
    ResponseModule,
    HttpExceptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
