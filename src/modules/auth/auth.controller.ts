import {
  Body,
  Controller,
  Delete,
  HttpException,
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
import { SinglePayloadResponseDto } from '../../common/dtos/single-payload-response.dto';
import { LocalSigninDto as SigninDto } from './dtos/auth.dto';
import { minutes, SkipThrottle, Throttle } from '@nestjs/throttler';
import { AccessTokenGuard } from './guards/access-token.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../users/enums/role.enums';
import { RoleGuard } from './guards/role.guard';

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

  @Post('verify')
  @Throttle({ long: { ttl: minutes(1), limit: 5, blockDuration: minutes(5) } })
  async verifyEmailTokenThroughLink(
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SinglePayloadResponseDto> {
    try {
      const { accessToken, refreshToken } =
        await this.authService.verifyEmailToken({
          token,
        });
      if (accessToken && refreshToken)
        response.cookie('refreshToken', refreshToken, {
          sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
          secure: process.env.NODE_ENV !== 'development',
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        });
      return { message: 'Email verified successfully', data: { accessToken } };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something Went Wrong',
        error.status || 500,
      );
    }
  }

  @Post('forgot-password')
  @Throttle({ long: { ttl: minutes(1), limit: 5, blockDuration: minutes(5) } })
  async forgotPassword(
    @Body() { email }: { email: string },
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    const user = request.user;
    if (user)
      throw new UnauthorizedException(
        `You are already logged in! Please logout first.`,
      );
    return await this.authService.forgotPassword(email);
  }
  @Post('resend-verification')
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Throttle({ long: { ttl: minutes(1), limit: 5, blockDuration: minutes(5) } })
  async resendVerification(
    @Body() body: { email: string },
  ): Promise<SinglePayloadResponseDto> {
    return await this.authService.resendVerification(body.email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { newPassword: string },
    @Query('token') token: string,
  ): Promise<SinglePayloadResponseDto> {
    try {
      return await this.authService.changePassword({
        token,
        newPassword: body.newPassword,
      });
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
    @Body() body: SigninDto,
  ): Promise<SinglePayloadResponseDto> {
    const { accessToken, refreshToken } = await this.authService.signIn(body);
    if (accessToken && refreshToken)
      response.cookie('refreshToken', refreshToken, {
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });
    return {
      message: 'Successfully signed in',
      data: { accessToken },
    };
  }

  @Delete('signout')
  async signout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<SinglePayloadResponseDto> {
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
