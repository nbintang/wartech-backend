import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { VerificationTokenModule } from './verification-token/verification-token.module';
import { LoggerModule } from './common/logger/logger.module';
import { ResponseModule } from './common/response/response.module';
import { ValidatorModule } from './common/validator/zod-validator.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    MailModule,
    VerificationTokenModule,
    LoggerModule,
    ResponseModule,
    ValidatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
