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
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { MailService } from 'src/mail/mail.service';
import { VerificationTokenService } from 'src/verification-token/verification-token.service';
import { LocalSigninDto } from './dto/auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private verificationTokenService: VerificationTokenService,
  ) {}

  compareHash(plainText: string, hash: string) {
    return bcrypt.compare(plainText, hash.toString());
  }
  async generateOtp(): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
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
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.usersService.createUser({
      name: createUserDto.name,
      email: createUserDto.email, // add this line
      image: createUserDto.image || null,
      role: createUserDto.role || 'READER',
      acceptedTOS: createUserDto.accepted_terms,
      password: hashedPassword,
    });
    const rawOtp = await this.generateOtp();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const newVerificationToken =
      await this.verificationTokenService.createVerificationToken({
        user: { connect: { id: newUser.id } },
        type: 'EMAIL_VERIFICATION',
        token: hashedOtp,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });
    if (!newVerificationToken)
      throw new InternalServerErrorException('Something went wrong');
    const sendedMail = await this.mailService.sendUserConfirmation(
      newUser.email,
      rawOtp,
    );
    if (!sendedMail)
      throw new InternalServerErrorException('Something went wrong');
    return true;
  }

  async verifyEmail({ email, token }: VerifyEmailDto) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    const verificationToken =
      await this.verificationTokenService.getVerificationTokenByUserId(user.id);
    if (!verificationToken)
      throw new NotFoundException('Verification token not found');
    if (verificationToken.expiresAt < new Date())
      throw new BadRequestException('Token expired');
    const isTokenValid = await this.compareHash(token, verificationToken.token);
    if (!isTokenValid) throw new BadRequestException('Invalid token');
    if (user.emailVerifiedAt)
      throw new BadRequestException('User already verified');
    await this.usersService.updateVerifiedUser(
      { id: user.id, email },
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
    if (!user) throw new UnauthorizedException('User does not exist');
    if (!user.verified) throw new UnauthorizedException('User is not verified');
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

  async forgotPassword({}) {}

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
