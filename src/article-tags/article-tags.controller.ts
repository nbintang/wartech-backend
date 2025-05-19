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
import { ArticleTagsService } from './article-tags.service';
import { ArticleTagDto, ArticleTagsDto } from './dtos/mutate-article-tag.dto';
import { QueryArticleTagDto } from './dtos/query-article-tag.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { SinglePayloadResponseDto } from 'src/common/dtos/single-payload-response.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enums';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Controller('/protected/article-tags')
export class ArticleTagsController {
  constructor(private readonly articleTagsService: ArticleTagsService) {}
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post('/bulk')
  addArticleTags(@Body() body: ArticleTagsDto) {
    return this.articleTagsService.addArticleTags(body);
  }
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post()
  addArticleTag(@Body() body: ArticleTagDto) {
    return this.articleTagsService.addArticleTag(body);
  }

  @Get()
  async getAllArticleTags(
    @Query() query: QueryArticleTagDto,
  ): Promise<PaginatedPayloadResponseDto> {
    return await this.articleTagsService.getAllArticleTags(query);
  }

  @Get(':id')
  async getArticleTagById(
    @Param('id') id: string,
  ): Promise<SinglePayloadResponseDto> {
    const articleTag = await this.articleTagsService.getArticleTagById(id);
    return {
      message: 'Article Tag fetched successfully',
      data: articleTag,
    };
  }
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard)
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
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':id')
  async removeArticleTagById(@Param('id') id: string) {
    return await this.articleTagsService.removeArticleTagById(id);
  }
}
