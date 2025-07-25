import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dtos/mutate-user.dto';
import { MailService } from '../../commons/mail/mail.service';
import { LocalSigninDto } from './dtos/auth.dto';
import { ResetPasswordDto, VerifyEmailFromUrlDto } from './dtos/verify.dto';
import { Role } from '../users/enums/role.enums';
import { VerificationType } from '../../commons/mail/enum/verification.enum';

export interface JwtTokenResponse {
  accessToken: string;
  refreshToken: string;
}
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  private async generateJwtTokens(
    userId: string,
    email: string,
    role: string,
    verified: boolean,
  ): Promise<JwtTokenResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role, verified },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '30s',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role, verified },
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

  private async confirmUserEmail(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (user.verified) throw new BadRequestException('Email already verified');
    return await this.usersService.changeUserVerifiedStatus(user.id);
  }
  compareHash(plainText: string, hash: string) {
    return bcrypt.compare(plainText, hash.toString());
  }

  async signUp(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.getUserByEmail(
      createUserDto.email,
    );
    if (existingUser) throw new BadRequestException('Email already exists');
    const hashedPassword = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.createUser({
      name: createUserDto.name,
      email: createUserDto.email,
      acceptedTOS: createUserDto.acceptedTOS,
      image: createUserDto.image || null,
      role: Role.READER,
      password: hashedPassword,
    });
    if (newUser)
      await this.mailService.sendEmailConfirmation({
        email: newUser.email,
        name: newUser.name,
        id: newUser.id,
      });
  }

  async verifyEmailToken({
    token,
  }: VerifyEmailFromUrlDto): Promise<JwtTokenResponse> {
    const { email, type } =
      await this.mailService.decodeConfirmationToken(token);
    if (type !== VerificationType.EMAIL_VERIFICATION)
      throw new BadRequestException('Invalid token');
    const user = await this.confirmUserEmail(email);
    if (!user) throw new NotFoundException('User not found');
    const { accessToken, refreshToken } = await this.generateJwtTokens(
      user.id,
      user.email,
      user.role,
      user.verified,
    );
    return { accessToken, refreshToken };
  }

  async signIn({ email, password }: LocalSigninDto): Promise<JwtTokenResponse> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user)
      throw new UnauthorizedException('User is not registered with us');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Password is incorrect');
    const { accessToken, refreshToken } = await this.generateJwtTokens(
      user.id,
      user.email,
      user.role,
      user.verified,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (user.verified) throw new BadRequestException('Email already verified');
    if (!user) throw new NotFoundException('User not found');
    const now = new Date();
    if (user.resendEmailCooldown && user.resendEmailCooldown > now) {
      const secondsLeft = Math.ceil(
        (user.resendEmailCooldown.getTime() - now.getTime()) / 1000,
      );
      throw new BadRequestException(
        `Please wait for ${secondsLeft} seconds before resending the verification email.`,
      );
    }

    await this.mailService.sendEmailConfirmation({
      name: user.name,
      email: user.email,
      id: user.id,
    });

    const cooldownMinutes = 1;
    await this.usersService.updateUserResendTime(
      user.id,
      new Date(now.getTime() + cooldownMinutes * 60 * 1000),
    );
    return {
      message: 'Email sent successfully',
      data: {
        expiresIn: cooldownMinutes * 60,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    await this.mailService.sendPasswordReset({
      name: user.name,
      email: user.email,
      id: user.id,
    });
    return {
      message: 'Email sent successfully',
    };
  }

  async changePassword({ token, newPassword }: ResetPasswordDto) {
    const { email, type } =
      await this.mailService.decodeConfirmationToken(token);
    if (type !== VerificationType.PASSWORD_RESET)
      throw new BadRequestException('Invalid token');
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    const hashedPassword = await this.hashData(newPassword);
    await this.usersService.updateUserById(
      { id: user.id },
      { password: hashedPassword },
    );
    return {
      message: 'Password Changed Successfully',
    };
  }

  async refreshToken(userId: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.getUserById(userId, {
      id: true,
      email: true,
      role: true,
      verified: true,
    });
    if (!user) throw new ForbiddenException('Access Denied');
    const tokens = await this.generateJwtTokens(
      user.id,
      user.email,
      user.role,
      user.verified,
    );
    return tokens;
  }
  async signout() {
    return {
      message: 'Successfully signed out',
    };
  }
}
