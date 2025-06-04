import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { PrismaModule } from '../commons/prisma/prisma.module';
import { MailModule } from '../commons/mail/mail.module';
import { LoggerModule } from '../commons/logger/logger.module';
import { ResponseModule } from '../commons/response/response.module';
import { ValidatorModule } from '../commons/validator/zod-validator.module';
import { CloudinaryModule } from '../modules/cloudinary/cloudinary.module';
import { ThrottlerConfigModule } from '../commons/throttler/throttler-config.module';
import { ArticlesModule } from '../modules/articles/articles.module';
import { CategoriesModule } from '../modules/categories/categories.module';
import { TagsModule } from '../modules/tags/tags.module';
import { ArticleTagsModule } from '../modules/article-tags/article-tags.module';
import { CommentsModule } from '../modules/comments/comments.module';
import { LikesModule } from '../modules/likes/likes.module';
import { AppService } from './app.service';

@Module({
  imports: [
    ThrottlerConfigModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    MailModule,
    LoggerModule,
    ResponseModule,
    ValidatorModule,
    CloudinaryModule,
    ArticlesModule,
    CategoriesModule,
    TagsModule,
    ArticleTagsModule,
    CommentsModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
