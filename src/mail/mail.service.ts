import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserOtpVerification(email: string, otp: string): Promise<boolean> {
    // const url = `http://localhost:3000/auth/confirmation?token=${otp}`;
    const res = await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome! Confirm your email',
      template: 'confirmation',
      context: {
        name: email,
        otp,
      },
    });
    if (!res) return false;
    return true;
  }

  async sendResetPassword(email: string, otp: string): Promise<boolean> {
    const url = `http://localhost:3000/reset-password?token=${otp}`;
    const res = await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password',
      template: 'confirmation',
      context: {
        name: email,
        url,
        otp,
      },
    });
    if (!res) return false;
    return true;
  }
}
