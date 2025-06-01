import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailConfig } from './mail.config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: MailConfig,
    }),
    UsersModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
