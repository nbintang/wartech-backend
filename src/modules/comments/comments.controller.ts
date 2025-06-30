import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dtos/mutate-comment.dto';
import { SinglePayloadResponseDto } from '../../commons/dtos/single-payload-response.dto';
import { PaginatedPayloadResponseDto } from '../../commons/dtos/paginated-payload-response.dto';
import { QueryCommentDto } from './dtos/query-comment.dto';
import { Role } from '../users/enums/role.enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { IsOwner } from '../auth/decorators/is-owner.decorator';
import { RequiredAuth } from '../auth/decorators/required-auth.decorator';
import { CommentLikesService } from './comment-likes.service';

@Controller('/protected/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentLikeService: CommentLikesService,
  ) {}
  @RequiredAuth(Role.ADMIN, Role.REPORTER, Role.READER)
  @Post()
  @SkipThrottle({ short: true, medium: true })
  async createComment(
    @Body() createCommentDto: CommentDto,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    const userId = request.user.sub;
    const newComment = await this.commentsService.createComment({
      ...createCommentDto,
      userId,
    });
    return {
      data: newComment,
    };
  }
  @RequiredAuth(Role.ADMIN, Role.REPORTER, Role.READER)
  @Post(':id/replies')
  @SkipThrottle({ short: true, medium: true })
  async repliesCommentById(
    @Param('id') id: string,
    @Body() body: CommentDto,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    const userId = request.user.sub;
    const comment = await this.commentsService.repliesComment(id, {
      userId,
      ...body,
    });
    return { data: comment };
  }

  @Get()
  @SkipThrottle({ short: true, medium: true })
  async getAllComments(
    @Query() query: QueryCommentDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const { formattedComments, meta } =
      await this.commentsService.getAllCommentsByArticleSlug(query);
    return {
      data: {
        items: formattedComments,
        meta,
      },
    };
  }
  @Get(':id')
  @SkipThrottle({ short: true, medium: true })
  async getCommentById(
    @Param('id') id: string,
  ): Promise<SinglePayloadResponseDto> {
    const comment = await this.commentsService.getCommentById(id);
    return {
      data: comment,
    };
  }

  @RequiredAuth(Role.ADMIN, Role.REPORTER, Role.READER)
  @Get(':id/replies')
  @SkipThrottle({ short: true, medium: true })
  async getCommentsByParentId(
    @Param('id') parentId: string,
    @Query() query: QueryCommentDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const { comments, meta } = await this.commentsService.getCommentsByParentId(
      parentId,
      query,
    );
    return {
      data: {
        items: comments,
        meta: meta,
      },
    };
  }

  @RequiredAuth(Role.ADMIN, Role.REPORTER, Role.READER)
  @Patch(':id')
  @SkipThrottle({ short: true, medium: true })
  async updateCommentById(
    @Param('id') id: string,
    @Body() updateCommentDto: CommentDto,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    const userId = request.user.sub;
    const comment = await this.commentsService.updateCommentById(id, {
      ...updateCommentDto,
      userId,
    });
    return {
      data: comment,
    };
  }
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @IsOwner('comment')
  @Delete(':id')
  @SkipThrottle({ short: true, medium: true })
  async removeCommentById(
    @Param('id') id: string,
  ): Promise<SinglePayloadResponseDto> {
    return this.commentsService.removeCommentByIdAndUser(id);
  }
  @RequiredAuth(Role.ADMIN, Role.REPORTER, Role.READER)
  @Post(':id/like')
  @SkipThrottle({ short: true, medium: true })
  async likeComment(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    const userId = request.user.sub;
    return this.commentLikeService.likeCommentByUserIdAndCommentId(id, userId);
  }

  @RequiredAuth(Role.ADMIN, Role.REPORTER, Role.READER)
  @Delete(':id/like')
  @SkipThrottle({ short: true, medium: true })
  async removeLikeComment(
    @Param('id') id: string,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    const userId = request.user.sub;
    return this.commentLikeService.removeLikeByUserIdAndCommentId(id, userId);
  }

  @Get(':id/like')
  @SkipThrottle({ short: true, medium: true })
  async getLikeComment(@Param('id') id: string) {
    const likes = await this.commentLikeService.getLikesByCommentId(id);
    return { data: { likes } };
  }

  @RequiredAuth(Role.ADMIN, Role.REPORTER, Role.READER)
  @Get(':id/like/me')
  @SkipThrottle({ short: true, medium: true })
  async getCurrentUserLikeComment(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const userId = request.user.sub;
    return await this.commentLikeService.getCurrentUserLikeByUserIdAndCommentId(
      id,
      userId,
    );
  }
}
