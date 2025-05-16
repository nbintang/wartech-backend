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
import { CreateArticleDto } from './dtos/mutate-article.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { ArticlesDto } from './dtos/response-article.dto';
import { QueryArticleDto } from './dtos/query-article.dto';
import { PayloadResponseDto } from 'src/common/dtos/payload-response.dto';
import { Prisma } from 'prisma/generated';

@Controller('/protected/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
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
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.createArticle(createArticleDto);
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<PayloadResponseDto> {
    const article = await this.articlesService.getArticleBySlug(slug);
    if (!article)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    return { message: 'Article fetched successfully', data: article };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleDto) {
    return this.articlesService.update(+id, updateArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }
}
