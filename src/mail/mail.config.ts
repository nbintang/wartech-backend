import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const MailConfig: MailerAsyncOptions['useFactory'] = async (
  config: ConfigService,
) => ({
  transport: {
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.get<string>('EMAIL_USER'),
      clientId: config.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
      refreshToken: config.get<string>('GOOGLE_REFRESH_TOKEN'),
    },
    debug: true,
    logger: true,
  },
  defaults: {
    from: `${config.get<string>('EMAIL_FROM')}`,
    replyTo: `${config.get<string>('EMAIL_USER')}`,
  },
  template: {
    dir: join(__dirname, '..', 'mail', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
