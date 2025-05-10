import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dtos/mutate.dto';
import { MailService } from 'src/mail/mail.service';
import { VerificationTokenService } from 'src/verification-token/verification-token.service';
import { LocalSigninDto } from './dtos/auth.dto';
import { ResetPasswordDto, VerifyEmailFromUrlDto } from './dtos/verify.dto';
import { VerificationType } from 'src/verification-token/enums/verification.enum';
import { Role } from 'src/users/enums/role.enums';
import * as crypto from 'crypto';
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

  async generateTokens(userId: string, email: string, role: string) {
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

  async signUp(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.getUserByEmail(
      createUserDto.email,
    );
    if (existingUser)
      throw new HttpException(
        'Your already registered, please sign in or register with another account',
        400,
      );
    const hashedPassword = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.createUser({
      name: createUserDto.name,
      email: createUserDto.email, // add this line
      image: createUserDto.image || null,
      role: createUserDto.role || Role.READER,
      acceptedTOS: createUserDto.accepted_terms,
      password: hashedPassword,
    });
    const rawToken = await this.generateToken();
    const hashedToken = await bcrypt.hash(rawToken, 10);
    const newVerificationToken =
      await this.verificationTokenService.createVerificationToken({
        user: { connect: { id: newUser.id } },
        type: VerificationType.EMAIL_VERIFICATION,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    if (!newVerificationToken)
      throw new InternalServerErrorException('Something went wrong');
    const sendedMail = await this.mailService.sendUserOtpVerification({
      userName: newUser.name,
      userEmail: newUser.email,
      userId: newUser.id,
      token: rawToken,
    });
    if (!sendedMail)
      throw new InternalServerErrorException('Something went wrong');
    return true;
  }

  async verifyEmail({ userId, token }: VerifyEmailFromUrlDto) {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    const verificationToken =
      await this.verificationTokenService.getVerificationTokenByUserIdAndType({
        userId: user.id,
        type: VerificationType.EMAIL_VERIFICATION,
      });
    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      this.verificationTokenService.deleteTokensByUserId(user.id);
      throw new BadRequestException(
        'Token expired, please resend email for verification',
      );
    }
    const isTokenValid = await this.compareHash(token, verificationToken.token);
    if (!isTokenValid) throw new BadRequestException('Invalid token');
    if (user.emailVerifiedAt)
      throw new BadRequestException('User already verified');
    await this.usersService.updateVerifiedUser(
      { id: user.id },
      {
        emailVerifiedAt: new Date(),
        verified: true,
        verificationToken: { delete: { id: verificationToken.id } },
      },
    );
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );
    return { user, accessToken, refreshToken };
  }

  async signIn({ email, password }: LocalSigninDto): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user || !user.verified)
      throw new UnauthorizedException('User is not verified');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Password is incorrect');
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
      user.role,
    );
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if (!user.verified) throw new BadRequestException('User is not verified');
    const rawToken = await this.generateToken();
    const hashedToken = await this.hashData(rawToken);
    await this.verificationTokenService.deleteTokensByUserAndType({
      userId: user.id,
      type: VerificationType.PASSWORD_RESET,
    });
    await this.verificationTokenService.createVerificationToken({
      user: { connect: { id: user.id } },
      type: VerificationType.PASSWORD_RESET,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 min
    });
    await this.mailService.sendResetPassword({
      userName: user.name,
      userEmail: user.email,
      userId: user.id,
      token: rawToken,
    });
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

  async changePassword({ userId, token, newPassword }: ResetPasswordDto) {
    this.verifyResetPasswordToken({ userId, token });
    const hashedPassword = await this.hashData(newPassword);
    await this.usersService.updateVerifiedUser(
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

  async refreshToken(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new ForbiddenException('Access Denied');
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return tokens;
  }
  async signout() {
    return {
      message: 'Successfully signed out',
    };
  }
}
