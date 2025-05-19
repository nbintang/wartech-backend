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
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dtos/mutate-comment.dto';
import { SinglePayloadResponseDto } from 'src/common/dtos/single-payload-response.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { QueryCommentDto } from './dtos/query-comment.dto';
import { Role } from 'src/users/enums/role.enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Controller('/protected/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post()
  async createComment(
    @Body() createCommentDto: CommentDto,
  ): Promise<SinglePayloadResponseDto> {
    const newComment =
      await this.commentsService.createComment(createCommentDto);
    return {
      data: newComment,
    };
  }

  @Get()
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
  async getCommentById(
    @Param('id') id: string,
  ): Promise<SinglePayloadResponseDto> {
    const comment = await this.commentsService.getCommentById(id);
    return {
      data: comment,
    };
  }
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Patch(':id')
  async updateCommentById(
    @Param('id') id: string,
    @Body() updateCommentDto: CommentDto,
  ): Promise<SinglePayloadResponseDto> {
    const comment = await this.commentsService.updateCommentById(
      id,
      updateCommentDto,
    );
    return {
      data: comment,
    };
  }
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':id')
  async removeCommentById(
    @Param('id') id: string,
  ): Promise<SinglePayloadResponseDto> {
    return this.commentsService.removeCommentById(id);
  }
}
