import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const MailConfig: MailerAsyncOptions['useFactory'] = async (
  config: ConfigService,
) => ({
  transport: {
    host: config.get<string>('EMAIL_HOST'),
    port: config.get<number>('EMAIL_PORT'),
    secure: false,
    auth: {
      user: config.get<string>('EMAIL_USER'),
      pass: config.get<string>('EMAIL_PASS'),
    },
    debug: true,
    logger: true,
  },
  defaults: {
    from: `${config.get<string>('EMAIL_FROM')}`,
  },
  template: {
    dir: join(__dirname, '..', 'mail', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
