import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type EmailContext = {
  userName: string;
  userId: string;
  userEmail: string;
  token: string;
};

@Injectable()
export class MailService {
  private baseUrl: string;
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    // const PROD_URL = this.configService.get<string>('PROD_URL');
    this.baseUrl = 'http://localhost:3000/api';
  }

  async sendUserOtpVerification({
    userName,
    userEmail,
    userId,
    token,
  }: EmailContext): Promise<boolean> {
    const url = `${this.baseUrl}/auth/verify?token=${token}&userId=${userId}`;
    console.log(url);
    const res = await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Welcome! Confirm your email',
      template: 'confirmation',
      context: {
        name: userName,
        url,
        token,
      },
    });
    if (!res) return false;
    return true;
  }

  async sendResetPassword({
    userName,
    userEmail,
    userId,
    token,
  }: EmailContext): Promise<boolean> {
    const url = `${this.baseUrl}/auth/verify-reset-password?token=${token}&userId=${userId}`;
    console.log(url);
    const res = await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Reset Password',
      template: 'confirmation',
      context: {
        name: userName,
        url,
        token,
      },
    });
    if (!res) return false;
    return true;
  }
}
