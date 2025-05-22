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
  BadRequestException,
} from '@nestjs/common';
import { ArticleTagsService } from './article-tags.service';
import { ArticleTagDto } from './dtos/mutate-article-tag.dto';
import {
  QueryArticleTagDto,
  QueryArticleTagTypePostDto,
} from './dtos/query-article-tag.dto';
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
  @Post()
  addArticleTag(
    @Body() body: ArticleTagDto,
    @Query() query: QueryArticleTagTypePostDto,
  ) {
    if (query?.bulk || body.tagIds?.length > 1) {
      if (!body.tagIds || body.tagIds.length === 0)
        throw new BadRequestException('tagIds must be provided in bulk mode');
      return this.articleTagsService.addArticleTags(body);
    }
    if (!body.tagId)
      throw new BadRequestException('tagId must be provided in non-bulk mode');
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
    if (!updateArticleTagDto)
      throw new BadRequestException('please provide a body');
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
