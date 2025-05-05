import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';
import { ConfigService } from '@nestjs/config';

export const MailConfig: MailerAsyncOptions['useFactory'] = async (
  config: ConfigService,
) => ({
  transport: {
    host: config.get<string>('EMAIL_HOST'),
    port: config.get<number>('EMAIL_PORT'),
    secure: false,
    auth: {
      user: config.get<string>('EMAIL_TEST_USER'),
      pass: config.get<string>('EMAIL_TEST_PASS'),
    },
  },
  defaults: {
    from: `"No Reply" <${config.get<string>('EMAIL_FROM')}>`,
  },
  template: {
    dir: process.cwd() + '/src/mail/templates',
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
