import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { DefaultQueryResponseDto } from 'src/common/dtos/default-query-response.dto';
import { LocalSigninDto as SigninDto } from './dtos/auth.dto';
import { ResetPasswordDto } from './dtos/reset.password.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() user: CreateUserDto, @Req() request: Request) {
    const doesHaveCookieRefreshToken = request.cookies['refresh_token'];
    if (doesHaveCookieRefreshToken) {
      throw new UnauthorizedException('Please Logout First');
    }
    await this.authService.signUp(user);
    return {
      message: 'Success!, Please check your email for the verification link',
    };
  }

  @Get('verify')
  async verifyEmailTokenThroughLink(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<DefaultQueryResponseDto> {
    if (!token) throw new UnauthorizedException('Please provide token');
    const { accessToken, refreshToken } = await this.authService.verifyEmail({
      userId,
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

  @Post('forgot-password')
  async forgotPassword(
    @Body() { email }: { email: string },
  ): Promise<DefaultQueryResponseDto> {
    await this.authService.forgotPassword(email);
    return {
      message: 'Please check your email for the verification link',
    };
  }

  @Post('reset-password')
  async resetPassword(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Body() { newPassword }: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword({ userId, token, newPassword });
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
        `You are already logged in! Please logout first.`,
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
    const userId = (request as any).user.sub;
    const tokens = await this.authService.refreshToken(userId);
    return { access_token: tokens.accessToken };
  }
}
