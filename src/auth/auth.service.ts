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
import { MailService } from '../mail/mail.service';
import { LocalSigninDto } from './dtos/auth.dto';
import { ResetPasswordDto, VerifyEmailFromUrlDto } from './dtos/verify.dto';
import { Role } from '../users/enums/role.enums';
import { VerificationType } from '../mail/enum/verification.enum';

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

  compareHash(plainText: string, hash: string) {
    return bcrypt.compare(plainText, hash.toString());
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
    const user = await this.mailService.confirmUserEmail(email);
    if (!user) throw new NotFoundException('User not found');
    const { accessToken, refreshToken } = await this.generateJwtTokens(
      user.id,
      user.email,
      user.role,
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
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async resendVerification(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.mailService.sendEmailConfirmation({
      name: user.name,
      email: user.email,
      id: user.id,
    });
    return {
      message: 'Email sent successfully',
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
