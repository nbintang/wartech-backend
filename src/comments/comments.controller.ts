import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentDto } from './dtos/mutate-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CommentDto) {
    return this.commentsService.createComment(createCommentDto);
  }

  @Get()
  findAll() {
    return this.commentsService.getAllComments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.getCommentById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: CommentDto) {
    return this.commentsService.updateCommentById(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.removeCommentById(+id);
  }
}
