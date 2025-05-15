import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AccessControlService } from 'src/auth/shared/access-control.service';

@Module({
  imports: [PrismaModule],
  controllers: [TagsController],
  providers: [TagsService, AccessControlService],
  exports: [TagsService],
})
export class TagsModule {}
