import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, validateImageSchema } from 'src/users/dtos/mutate.dto';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { PayloadResponseDto } from 'src/common/dtos/payload-response.dto';
import { LocalSigninDto as SigninDto } from './dtos/auth.dto';
import { ResetPasswordDto } from './dtos/verify.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { VerificationType } from 'src/verification-token/enums/verification.enum';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
@SkipThrottle({ default: true, long: true })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Post('signup')
  @UseInterceptors(FileInterceptor('image'))
  async signup(
    @Body() body: CreateUserDto,
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (file) {
        const validatedImage = await validateImageSchema.parseAsync(file);
        if (!validatedImage)
          throw new BadRequestException("File doesn't match the schema");
        const { secure_url } = await this.cloudinaryService.uploadFile({
          file: validatedImage,
          folder: 'users',
        });
        body.image = secure_url;
      }
      const doesHaveCookieRefreshToken = request.cookies['refresh_token'];
      if (doesHaveCookieRefreshToken)
        throw new UnauthorizedException('Please Logout First');
      await this.authService.signUp(body);
      return {
        message: 'Success!, Please check your email for the verification link',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something Went Wrong');
    }
  }

  @Get('verify')
  async verifyEmailTokenThroughLink(
    @Query('userId') userId: string,
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PayloadResponseDto> {
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
    @Req() request: Request,
  ): Promise<PayloadResponseDto> {
    const existedTokenCookie = request.cookies['refresh_token'];
    if (existedTokenCookie)
      throw new UnauthorizedException(
        `You are already logged in! Please logout first.`,
      );
    await this.authService.sendEmailVerification(
      email,
      VerificationType.PASSWORD_RESET,
    );
    return {
      message: 'Please check your email for the verification link',
    };
  }

  @Post('resend-verification')
  async resendVerification(
    @Body() { email }: { email: string; type: VerificationType },
  ): Promise<PayloadResponseDto> {
    await this.authService.sendEmailVerification(
      email,
      VerificationType.EMAIL_VERIFICATION,
    );
    return {
      message: 'Please check your email for the verification link',
    };
  }

  @Get('verify-reset-password')
  async resetPassword(
    @Query('userId') userId: string,
    @Query('token') token: string,
  ): Promise<PayloadResponseDto> {
    const isTokenValid = await this.authService.verifyResetPasswordToken({
      userId,
      token,
    });
    return {
      message: `Token is ${isTokenValid ? 'valid' : 'invalid'}`,
    };
  }

  @Post('change-password')
  async changePassword(@Body() body: ResetPasswordDto) {
    await this.authService.changePassword(body);
    return {
      message: 'Password Changed Successfully',
    };
  }

  @Post('signin')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Body() body: SigninDto,
  ): Promise<PayloadResponseDto> {
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
  @SkipThrottle()
  async signout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const existedTokenCookie = request.cookies['refresh_token'];
    if (!existedTokenCookie)
      throw new UnauthorizedException(
        'You are not logged in! Please login first.',
      );
    response.clearCookie('refresh_token');
    return await this.authService.signout();
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  @SkipThrottle()
  async refreshTokens(@Req() request: Request) {
    const userId = (request as any).user.sub;
    const tokens = await this.authService.refreshToken(userId);
    return { access_token: tokens.accessToken };
  }
}
