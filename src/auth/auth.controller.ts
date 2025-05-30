import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService, JwtTokenResponse } from './auth.service';
import { CreateUserDto } from '../users/dtos/mutate-user.dto';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { SinglePayloadResponseDto } from '../common/dtos/single-payload-response.dto';
import { LocalSigninDto as SigninDto } from './dtos/auth.dto';
import { ResetPasswordDto } from './dtos/verify.dto';
import { VerificationType } from '../verification-token/enums/verification.enum';
import { minutes, SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('auth')
@SkipThrottle({ short: true, long: true })
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signup(@Body() body: CreateUserDto, @Req() request: Request) {
    try {
      const existedTokenCookie = request.user;
      if (existedTokenCookie)
        throw new UnauthorizedException('You are already logged in!');
      await this.authService.signUp(body);
      return {
        message: 'Success!, Please check your email for the verification link',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something Went Wrong',
        error.status || 500,
      );
    }
  }

  @Get('verify')
  async verifyEmailTokenThroughLink(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SinglePayloadResponseDto> {
    if (!token) throw new UnauthorizedException('Please provide token');
    const { accessToken, refreshToken } = await this.authService.verifyEmail({
      userId,
      token,
    });
    if (accessToken && refreshToken)
      response.cookie('refreshToken', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });
    return {
      message: 'Email verified successfully',
      data: { accessToken: accessToken },
    };
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() { email }: { email: string },
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    const existedTokenCookie = request.cookies['refreshToken'];
    if (existedTokenCookie)
      throw new UnauthorizedException(
        `You are already logged in! Please logout first.`,
      );
    const isTokenCreated =
      await this.authService.createAndSendVerificationToken(
        { email },
        VerificationType.PASSWORD_RESET,
      );
    if (!isTokenCreated)
      throw new InternalServerErrorException(
        'Failed to send email, make the user is valid',
      );
    return {
      message: 'Please check your email for the verification link',
    };
  }

  @Post('resend-verification')
  async resendVerification(
    @Body() { email }: { email: string },
  ): Promise<SinglePayloadResponseDto> {
    await this.authService.createAndSendVerificationToken(
      { email },
      VerificationType.EMAIL_VERIFICATION,
    );
    return {
      message: 'Please check your email for the verification link',
    };
  }
  @Get('verify-reset-password')
  @Throttle({ long: { ttl: minutes(1), limit: 1, blockDuration: minutes(5) } })
  async resetPassword(
    @Query('userId') userId: string,
    @Query('token') token: string,
  ): Promise<SinglePayloadResponseDto> {
    const isTokenValid = await this.authService.verifyResetPasswordToken({
      userId,
      token,
    });
    return {
      message: `Token is ${isTokenValid ? 'valid' : 'invalid'}`,
      data: { valid: isTokenValid, redirect: isTokenValid },
    };
  }

  @Post('change-password')
  async changePassword(@Body() body: ResetPasswordDto) {
    try {
      await this.authService.changePassword(body);
      return {
        message: 'Password Changed Successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something Went Wrong',
        error.status || 500,
      );
    }
  }

  @Post('signin')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() body: SigninDto,
  ): Promise<SinglePayloadResponseDto> {
    const { accessToken, refreshToken } = await this.authService.signIn(body);
    if (accessToken && refreshToken)
      response.cookie('refreshToken', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
      });
    return {
      message: 'Successfully signed in',
      data: { accessToken: accessToken },
    };
  }

  @Delete('signout')
  async signout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    const existedTokenCookie = request.cookies['refreshToken'];
    if (!existedTokenCookie)
      throw new UnauthorizedException(
        'You are not logged in! Please login first.',
      );
    response.clearCookie('refreshToken', {
      sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
      secure: process.env.NODE_ENV !== 'development',
      httpOnly: true,
    });
    return await this.authService.signout();
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @SkipThrottle({
    long: true,
    medium: true,
    short: true,
  })
  async refreshTokens(
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto<Omit<JwtTokenResponse, 'refreshToken'>>> {
    const userId = (request as any).user.sub;
    const tokens = await this.authService.refreshToken(userId);
    return {
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
      },
    };
  }
}
