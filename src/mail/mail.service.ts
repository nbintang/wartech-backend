import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

type EmailContext = {
  userName: string;
  userId: string;
  userEmail: string;
  token: string;
  routes: string;
  subject: string;
};

@Injectable()
export class MailService {
  private baseUrl: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    const PROD_URL = this.configService.get<string>('PROD_URL');
    this.baseUrl = PROD_URL ? PROD_URL : 'http://localhost:3000';
  }

  async sendEmailVerification({
    userName,
    userEmail,
    userId,
    routes,
    token,
    subject = 'confirm your email',
  }: EmailContext): Promise<boolean> {
    const url = `${this.baseUrl}/api/auth/${routes}?token=${token}&userId=${userId}`;
    this.logger.log(
      `Sending verification email to ${userEmail} with URL: ${url}`,
    );

    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Hi ${userName} 👋, please ${subject}`,
        template: 'confirmation',
        context: {
          name: userName,
          url,
          token,
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
