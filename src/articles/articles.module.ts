import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { AccessControlService } from 'src/auth/shared/access-control.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, AccessControlService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
