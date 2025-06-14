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
import { PaginatedPayloadResponseDto } from '../../commons/dtos/paginated-payload-response.dto';
import { SinglePayloadResponseDto } from '../../commons/dtos/single-payload-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enums';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

@Controller('/protected/article-tags')
export class ArticleTagsController {
  constructor(private readonly articleTagsService: ArticleTagsService) {}

  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @Post()
  @SkipThrottle({ short: true })
  addArticleTag(
    @Body() body: ArticleTagDto,
    @Query() query: QueryArticleTagTypePostDto,
  ) {
    if (query.bulk) {
      if (!body.tagIds || body.tagIds.length === 0)
        throw new BadRequestException('tagIds must be provided in bulk mode');
      return this.articleTagsService.addArticleTags(body);
    }
    if (!body.tagId)
      throw new BadRequestException('tagId must be provided in non-bulk mode');
    return this.articleTagsService.addArticleTag(body);
  }

  @Get()
  @SkipThrottle({ short: true, medium: true })
  async getAllArticleTags(
    @Query() query: QueryArticleTagDto,
  ): Promise<PaginatedPayloadResponseDto> {
    return await this.articleTagsService.getAllArticleTags(query);
  }

  @Get(':slug')
  @SkipThrottle({ short: true, medium: true })
  async getArticleTagById(
    @Param('slug') slug: string,
  ): Promise<SinglePayloadResponseDto> {
    const articleTag =
      await this.articleTagsService.getArticleTagByArticleSlug(slug);
    return {
      message: 'Article Tag fetched successfully',
      data: articleTag,
    };
  }
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @Patch(':slug')
  @SkipThrottle({ short: true })
  async updateArticleTagById(
    @Param('slug') slug: string,
    @Body() updateArticleTagDto: ArticleTagDto,
  ) {
    if (!updateArticleTagDto)
      throw new BadRequestException('please provide a body');
    return await this.articleTagsService.updateArticleTagByArticleSlug(
      slug,
      updateArticleTagDto,
    );
  }
  @Roles(Role.ADMIN, Role.REPORTER)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @Delete(':slug')
  @SkipThrottle({ short: true })
  async removeArticleTagById(@Param('slug') id: string) {
    return await this.articleTagsService.removeArticleTagByArticleSlug(id);
  }
}
