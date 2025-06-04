import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { AccessControlService } from '../auth/shared/access-control.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LikesController],
  providers: [LikesService, AccessControlService],
})
export class LikesModule {}
