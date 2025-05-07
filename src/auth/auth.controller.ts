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
import { Request, Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { DefaultQueryResponseDto } from 'src/common/dtos/default-query-response.dto';
import { LocalSigninDto as SigninDto } from './dto/auth.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() body: CreateUserDto, @Req() request: Request) {
    const user = body;
    await this.authService.signUp(user);
    const doesHaveCookieRefreshToken = request.cookies['refresh_token'];
    if (!doesHaveCookieRefreshToken) {
      throw new UnauthorizedException('Please Logout First');
    }
    return {
      message: 'Success!, Please check your email for the OTP',
    };
  }

  @Post('verify')
  async verifyEmail(
    @Body() body: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<DefaultQueryResponseDto> {
    const { email, token } = body;
    const { accessToken, refreshToken } = await this.authService.verifyEmail({
      email,
      token,
    });
    if (accessToken && refreshToken)
      response.cookie('refresh_token', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });
    return {
      message: 'Email verified successfully',
      data: { access_token: accessToken },
    };
  }

  @Post('signin')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() body: SigninDto,
  ): Promise<DefaultQueryResponseDto> {
    const existedTokenCookie = request.cookies['refresh_token'];
    if (existedTokenCookie)
      throw new UnauthorizedException(
        'You are already logged in! Please logout first.',
      );
    const { accessToken, refreshToken } = await this.authService.signIn(body);
    if (accessToken && refreshToken)
      response.cookie('refresh_token', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });
    return {
      message: 'Successfully signed in',
      data: { access_token: accessToken },
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

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshTokens(@Req() request: Request) {
    console.log((request as any).user);

    const userId = (request as any).user.sub;
    const tokens = await this.authService.refreshToken(userId);
    return { access_token: tokens.accessToken };
  }
}
