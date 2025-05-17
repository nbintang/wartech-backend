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
import { ArticleTagsService } from './article-tags.service';
import { ArticleTagDto, ArticleTagsDto } from './dto/mutate-article-tag.dto';
import { QueryArticleTagDto } from './dto/query-article-tag.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { PayloadResponseDto } from 'src/common/dtos/payload-response.dto';

@Controller('/protected/article-tags')
export class ArticleTagsController {
  constructor(private readonly articleTagsService: ArticleTagsService) {}

  @Post('/bulk')
  addArticleTags(@Body() body: ArticleTagsDto) {
    return this.articleTagsService.addArticleTags(body);
  }

  @Post()
  addArticleTag(@Body() body: ArticleTagDto) {
    return this.articleTagsService.addArticleTag(body);
  }

  @Get()
  async getAllArticleTags(
    @Query() query: QueryArticleTagDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const { articleTags, meta } =
      await this.articleTagsService.getAllArticleTags(query);
    return {
      message: 'Article Tags fetched successfully',
      data: {
        items: articleTags,
        meta,
      },
    };
  }

  @Get(':id')
  async getArticleTagById(
    @Param('id') id: string,
  ): Promise<PayloadResponseDto> {
    const articleTag = await this.articleTagsService.getArticleTagById(id);
    return {
      message: 'Article Tag fetched successfully',
      data: articleTag,
    };
  }

  @Patch(':id')
  async updateArticleTagById(
    @Param('id') id: string,
    @Body() updateArticleTagDto: ArticleTagDto,
  ) {
    return await this.articleTagsService.updateArticleTagById(
      id,
      updateArticleTagDto,
    );
  }

  @Delete(':id')
  async removeArticleTagById(@Param('id') id: string) {
    return await this.articleTagsService.removeArticleTagById(id);
  }
}
