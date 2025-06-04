import { Module } from '@nestjs/common';
import { ArticleTagsService } from './article-tags.service';
import { ArticleTagsController } from './article-tags.controller';
import { PrismaModule } from '../../commons/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';

@Module({
  imports: [PrismaModule],
  controllers: [ArticleTagsController],
  providers: [ArticleTagsService, AccessControlService],
})
export class ArticleTagsModule {}
