import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { VerificationTokenModule } from 'src/verification-token/verification-token.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    // PassportModule,
    JwtModule.register({}),
    ConfigModule,
    UsersModule,
    MailModule,
    VerificationTokenModule,
  ],
  providers: [JwtService, ConfigService, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
