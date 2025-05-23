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
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dtos/mutate-article.dto';
import { PaginatedPayloadResponseDto } from '../common/dtos/paginated-payload-response.dto';
import { ArticlesDto } from './dtos/response-article.dto';
import { QueryArticleDto } from './dtos/query-article.dto';
import { SinglePayloadResponseDto } from '../common/dtos/single-payload-response.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enums';
import { RoleGuard } from '../auth/guards/role.guard';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@Controller('/protected/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async getArticles(
    @Query() query: QueryArticleDto,
  ): Promise<PaginatedPayloadResponseDto<ArticlesDto>> {
    return await this.articlesService.getArticeles(query);
  }
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post()
  @SkipThrottle({ short: true, long: true })
  async createArticle(@Body() createArticleDto: ArticleDto) {
    try {
      return await this.articlesService.createArticle(createArticleDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Something went wrong',
        error.status || 500,
      );
    }
  }
  @Get(':slug')
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
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Patch(':slug')
  @SkipThrottle({ short: true, long: true })
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
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':slug')
  async remove(@Param('slug') slug: string): Promise<SinglePayloadResponseDto> {
    return await this.articlesService.deleteArticleBySlug(slug);
  }
}
