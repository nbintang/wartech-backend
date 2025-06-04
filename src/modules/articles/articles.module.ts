import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { AccessControlService } from '../auth/shared/access-control.service';
import { PrismaModule } from '../../commons/prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, AccessControlService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
