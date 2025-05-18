import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dtos/mutate-comment.dto';
import { SinglePayloadResponseDto } from 'src/common/dtos/single-payload-response.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { QueryCommentDto } from './dtos/query-comment.dto';

@Controller('/protected/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

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

  @Delete(':id')
  async removeCommentById(
    @Param('id') id: string,
  ): Promise<SinglePayloadResponseDto> {
    return this.commentsService.removeCommentById(id);
  }
}
