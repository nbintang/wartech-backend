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

@Controller('/protected/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @Post()
  @SkipThrottle({ short: true, medium: true })
  async createComment(
    @Body() createCommentDto: CommentDto,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = request.user.sub;
    const newComment = await this.commentsService.createComment({
      ...createCommentDto,
      userId,
    });
    return {
      data: newComment,
    };
  }

  @Get()
  @SkipThrottle({ short: true, medium: true })
  async getAllComments(
    @Query() query: QueryCommentDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const { comments, meta } = await this.commentsService.getAllComments(query);
    return {
      data: {
        items: comments,
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
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @Patch(':id')
  @SkipThrottle({ short: true, medium: true })
  async updateCommentById(
    @Param('id') id: string,
    @Body() updateCommentDto: CommentDto,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
  @Delete(':id')
  @SkipThrottle({ short: true, medium: true })
  async removeCommentById(
    @Param('id') id: string,
  ): Promise<SinglePayloadResponseDto> {
    return this.commentsService.removeCommentById(id);
  }
}
