import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
  }
  async onModuleInit() {
    this.$on('query', (e) => {
      this.logger.info(
        `[Prisma Query] ${e.query} ${e.params} +${e.duration}ms`,
      );
    });
    this.$on('info', (e) => {
      this.logger.info(`[Prisma Info] ${e.message}`);
    });
    this.$on('warn', (e) => {
      this.logger.warn(`[Prisma Warn] ${e.message}`);
    });
    this.$on('error', (e) => {
      this.logger.error(`[Prisma Error] ${e.message}`);
    });
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
