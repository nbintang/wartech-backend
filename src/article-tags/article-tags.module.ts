import { Module } from '@nestjs/common';
import { ArticleTagsService } from './article-tags.service';
import { ArticleTagsController } from './article-tags.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AccessControlService } from 'src/auth/shared/access-control.service';

@Module({
  imports: [PrismaModule],
  controllers: [ArticleTagsController],
  providers: [ArticleTagsService, AccessControlService],
})
export class ArticleTagsModule {}
