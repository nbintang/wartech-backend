import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local.guard';
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
    @Body() body: { email: string; token: string },
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
      access_token: accessToken,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const existedTokenCookie = (request as any).cookies['refresh_token'];
    if (existedTokenCookie)
      throw new UnauthorizedException(
        'You are already logged in! Please logout first.',
      );
    const { accessToken, refreshToken } = await (request as any).user;
    if (accessToken && refreshToken)
      response.cookie('refresh_token', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });
    return {
      access_token: accessToken,
    };
  }

  @Delete('signout')
  async signout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const existedTokenCookie = (request as any).cookies['refresh_token'];
    if (!existedTokenCookie)
      throw new UnauthorizedException(
        'You are not logged in! Please login first.',
      );
    response.clearCookie('refresh_token');
    return await this.authService.signout();
  }
}
