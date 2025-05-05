import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { AuthDto, VerifyEmailDto } from './dto/auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() body: CreateUserDto) {
    const user = body;
    await this.authService.signUp(user);
    return {
      data: null,
      message: 'Success!, Please check your email for the OTP',
    };
  }

  @Post('verify')
  async verifyEmail(
    @Body() body: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, token } = body;
    const { accessToken, refreshToken } = await this.authService.verifyEmail(
      email,
      token,
    );
    if (accessToken && refreshToken)
      response.cookie('refresh_token', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });
    return {
      message: 'Email verified successfully',
      data: {
        access_token: accessToken,
      },
    };
  }
  @Post('signin')
  async signIn(
    @Body() body: AuthDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const existedTokenCookie = (request as any).cookies['refresh_token'];
    if (existedTokenCookie)
      throw new UnauthorizedException(
        'You are already logged in! Please logout first.',
      );
    const { accessToken, refreshToken, user } =
      await this.authService.signIn(body);
    if (accessToken && refreshToken)
      response.cookie('refresh_token', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });
    return {
      ...user,
      data: {
        access_token: accessToken,
      },
    };
  }
}
