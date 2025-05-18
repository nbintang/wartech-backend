import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dtos/mutate-article.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { ArticlesDto } from './dtos/response-article.dto';
import { QueryArticleDto } from './dtos/query-article.dto';
import { SinglePayloadResponseDto } from 'src/common/dtos/single-payload-response.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('/protected/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @SkipThrottle({ short: true, medium: true })
  async getArticles(
    @Query() query: QueryArticleDto,
  ): Promise<PaginatedPayloadResponseDto<ArticlesDto>> {
    const { articles, meta } = await this.articlesService.getArticeles(query);
    return {
      message: 'Articles fetched successfully',
      data: {
        items: articles,
        meta,
      },
    };
  }
  @Post()
  async createArticle(@Body() createArticleDto: ArticleDto) {
    return await this.articlesService.createArticle(createArticleDto);
  }

  @Get(':slug')
  @SkipThrottle({ short: true, medium: true })
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<SinglePayloadResponseDto> {
    const article = await this.articlesService.getArticleBySlug(slug);
    if (!article)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    const { articleTags, _count, ...rest } = article;
    const mappedArticle: ArticlesDto = {
      ...rest,
      tags: articleTags.map(({ tag }) => tag),
      commentsCount: _count.comments,
      tagsCount: _count.articleTags,
      likesCount: _count.likes,
    };
    return {
      message: 'Article fetched successfully',
      data: { ...mappedArticle },
    };
  }

  @Patch(':slug')
  async updateArticleBySlug(
    @Param('slug') slug: string,
    @Body() updateArticleDto: ArticleDto,
  ) {
    try {
      return await this.articlesService.updateArticleBySlug(
        slug,
        updateArticleDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Something went wrong',
        HttpStatus.BAD_REQUEST || 500,
      );
    }
  }

  @Delete(':slug')
  async remove(@Param('slug') slug: string) {
    return await this.articlesService.deleteArticleBySlug(slug);
  }
}
