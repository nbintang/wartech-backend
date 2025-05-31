import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

interface EmailContext {
  userName: string;
  userId: string;
  userEmail: string;
  token: string;
  routes: string;
  subject: string;
}

interface EmailTemplate {
  title: string;
  message: string;
  description: string;
}

@Injectable()
export class MailService {
  private frontendUrl: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    // const PROD_URL = this.configService.get<string>('PROD_URL');
    this.frontendUrl = 'http://localhost:3000';
  }

  async sendEmailVerification({
    userName,
    userEmail,
    userId,
    routes,
    token,
    subject = 'confirm your email',
  }: EmailContext): Promise<boolean> {
    const url = `${this.frontendUrl}/${routes}?token=${token}&userId=${userId}`;
    this.logger.log(
      `Sending verification email to ${userEmail} with URL: ${url}`,
    );
    const isVerify = routes === 'verify';
    const template: EmailTemplate = {
      title: isVerify
        ? `Selamat Datang, ${userName}! 🎉`
        : 'Reset Kata Sandi 🔐',
      message: isVerify
        ? 'Terima kasih telah bergabung dengan Wartech - platform berita teknologi terkini dan terdepan untuk solusi inovatif Anda.'
        : `Hai ${userName}, kami menerima permintaan untuk mereset kata sandi akun Wartech Anda.`,
      description: isVerify
        ? 'Untuk memulai perjalanan teknologi Anda bersama kami dan mengakses semua fitur eksklusif, silakan verifikasi alamat email Anda dengan menekan tombol di bawah ini.'
        : 'Untuk keamanan akun Anda, klik tombol di bawah ini untuk mengatur ulang kata sandi dengan aman. Pastikan Anda membuat kata sandi yang kuat dan unik.',
    };
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Hi ${userName} 👋, please ${subject}`,
        template: 'confirmation',
        context: {
          ...template,
          name: userName,
          url,
        },
      });
      this.logger.log(`Email sent to ${userEmail} successfully.`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${userEmail}: ${err.message}`);
      return false;
    }
  }
}
