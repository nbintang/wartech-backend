import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dtos/mutate-user.dto';
import { MailService } from '../mail/mail.service';
import { VerificationTokenService } from '../verification-token/verification-token.service';
import { LocalSigninDto } from './dtos/auth.dto';
import { ResetPasswordDto, VerifyEmailFromUrlDto } from './dtos/verify.dto';
import { VerificationType } from '../verification-token/enums/verification.enum';
import { Role } from '../users/enums/role.enums';
import crypto from 'crypto';

export type JwtTokenResponse = { accessToken: string; refreshToken: string };
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private verificationTokenService: VerificationTokenService,
  ) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  compareHash(plainText: string, hash: string) {
    return bcrypt.compare(plainText, hash.toString());
  }
  async generateToken(): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    return rawToken;
  }

  async generateJwtTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<JwtTokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '30s',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '1d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ message: string } | void> {
    const existingUser = await this.usersService.getUserByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      if (existingUser.verified) {
        throw new BadRequestException(
          'Your email is already registered and verified. Please sign in.',
        );
      } else {
        await this.resendVerificationToken(
          existingUser.email,
          VerificationType.EMAIL_VERIFICATION,
        );
        return {
          message: 'Please check your email for the verification link',
        };
      }
    }
    const hashedPassword = await this.hashData(createUserDto.password);
    const { name, email, acceptedTOS } = createUserDto;
    if (!name) throw new BadRequestException('Name is required');
    const newUser = await this.usersService.createUser({
      name,
      email,
      acceptedTOS,
      role: Role.READER,
      password: hashedPassword,
    });
    await this.createAndSendVerificationToken(
      newUser,
      VerificationType.EMAIL_VERIFICATION,
    );
  }

  async verifyEmail({
    userId,
    token,
  }: VerifyEmailFromUrlDto): Promise<JwtTokenResponse> {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    const verificationToken =
      await this.verificationTokenService.getVerificationTokenByUserIdAndType({
        userId: user.id,
        type: VerificationType.EMAIL_VERIFICATION,
      });
    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      await this.verificationTokenService.deleteTokensByUserId(user.id);
      throw new BadRequestException(
        'Token expired, please resend email for verification',
      );
    }
    const isTokenValid = await this.compareHash(token, verificationToken.token);
    if (user.emailVerifiedAt || !isTokenValid) {
      await this.verificationTokenService.deleteTokensByUserId(user.id);
      throw new BadRequestException('Invalid token');
    }
    await this.usersService.updateUserById(
      { id: user.id },
      {
        emailVerifiedAt: new Date(),
        verified: true,
        verificationTokens: { delete: { id: verificationToken.id } },
      },
    );
    const { accessToken, refreshToken } = await this.generateJwtTokens(
      user.id,
      user.email,
      user.role,
    );
    return { accessToken, refreshToken };
  }

  async signIn({ email, password }: LocalSigninDto): Promise<JwtTokenResponse> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user || !user.verified)
      throw new UnauthorizedException('User is not verified');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Password is incorrect');
    const { accessToken, refreshToken } = await this.generateJwtTokens(
      user.id,
      user.email,
      user.role,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async createAndSendVerificationToken(
    user: { email: string },
    type: VerificationType,
  ) {
    const existedUser = await this.usersService.getUserByEmail(user.email);
    if (!existedUser) throw new NotFoundException('User not found');
    const rawToken = await this.generateToken();
    const hashedToken = await this.hashData(rawToken);
    const newVerificationToken =
      await this.verificationTokenService.createVerificationToken({
        user: { connect: { id: existedUser.id } },
        type,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      });
    if (!newVerificationToken)
      throw new BadRequestException('Failed to create token');
    const sendedMail = await this.mailService.sendEmailVerification({
      userName: existedUser.name,
      userEmail: existedUser.email,
      userId: existedUser.id,
      token: rawToken,
      routes:
        type === VerificationType.PASSWORD_RESET
          ? 'verify-reset-password'
          : 'verify',
      subject:
        type === VerificationType.PASSWORD_RESET
          ? 'Reset your password'
          : 'Confirm your email',
    });
    if (!sendedMail)
      throw new InternalServerErrorException('Failed to send email');
    return {
      message: 'Please check your email for the verification link',
    };
  }

  async resendVerificationToken(email: string, type: VerificationType) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    const verificationToken =
      await this.verificationTokenService.getVerificationTokenByUserIdAndType({
        userId: user.id,
        type,
      });
    if (verificationToken && verificationToken.expiresAt > new Date()) {
      await this.verificationTokenService.deleteTokensByUserAndType({
        userId: user.id,
        type,
      });
    }
    return this.createAndSendVerificationToken(user, type);
  }

  async verifyResetPasswordToken({ userId, token }: VerifyEmailFromUrlDto) {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    const verificationToken =
      await this.verificationTokenService.getVerificationTokenByUserIdAndType({
        userId: user.id,
        type: VerificationType.PASSWORD_RESET,
      });
    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      this.verificationTokenService.deleteTokensByUserId(user.id);
      throw new BadRequestException(
        'Token expired, please resend email for verification',
      );
    }
    const isTokenValid = await this.compareHash(token, verificationToken.token);
    if (!isTokenValid) throw new BadRequestException('Invalid token');
    return true;
  }

  async changePassword({
    userId,
    token,
    newPassword,
  }: ResetPasswordDto): Promise<boolean> {
    this.verifyResetPasswordToken({ userId, token });
    const hashedPassword = await this.hashData(newPassword);
    await this.usersService.updateUserById(
      { id: userId },
      { password: hashedPassword },
    );
    const deletedToken =
      await this.verificationTokenService.deleteTokensByUserAndType({
        userId,
        type: VerificationType.PASSWORD_RESET,
      });
    if (!deletedToken)
      throw new InternalServerErrorException('Something went wrong');
    return true;
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new ForbiddenException('Access Denied');
    const tokens = await this.generateJwtTokens(user.id, user.email, user.role);
    return tokens;
  }
  async signout() {
    return {
      message: 'Successfully signed out',
    };
  }
}
