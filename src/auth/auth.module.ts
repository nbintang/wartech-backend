import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { VerificationTokenModule } from 'src/verification-token/verification-token.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { AccessControlService } from './shared/access-control.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
    UsersModule,
    MailModule,
    CloudinaryModule,
    VerificationTokenModule,
  ],
  providers: [
    JwtService,
    ConfigService,
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessControlService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
