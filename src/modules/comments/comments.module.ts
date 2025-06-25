import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaModule } from '../../commons/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
import { CommentLikesService } from './comment-likes.service';
@Module({
  imports: [PrismaModule],
  controllers: [CommentsController],
  providers: [CommentsService, AccessControlService, CommentLikesService],
})
export class CommentsModule {}
