import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryArticleTagDto } from './dtos/query-article-tag.dto';
import { Prisma } from '@prisma/client';
import { ArticleTagDto } from './dtos/mutate-article-tag.dto';
import { PaginatedPayloadResponseDto } from '../common/dtos/paginated-payload-response.dto';
import { SinglePayloadResponseDto } from '../common/dtos/single-payload-response.dto';

@Injectable()
export class ArticleTagsService {
  constructor(private db: PrismaService) {}
  async addArticleTag(createArticleTagDto: ArticleTagDto): Promise<
    Prisma.ArticleTagGetPayload<{
      select: {
        id: true;
        articleId: true;
        tag: { select: { id: true; name: true; slug: true } };
      };
    }>
  > {
    const existedArticle = await this.db.article.findUnique({
      where: { slug: createArticleTagDto.articleSlug },
    });
    if (!existedArticle)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

    const existedTag = await this.db.tag.findUnique({
      where: { id: createArticleTagDto.tagId },
    });
    if (!existedTag)
      throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);

    const existedArticleTags = await this.db.articleTag.findMany({
      where: {
        articleId: existedArticle.id,
        tagId: existedTag.id,
      },
    });
    if (existedArticleTags.length > 0)
      throw new HttpException(
        'Article tag already exists',
        HttpStatus.BAD_REQUEST,
      );

    const articleTag = await this.db.articleTag.create({
      data: {
        article: { connect: { id: existedArticle.id } },
        tag: { connect: { id: existedTag.id } },
      },
      select: {
        id: true,
        articleId: true,
        tag: { select: { id: true, name: true, slug: true } },
      },
    });
    return articleTag;
  }

  async addArticleTags({ tagIds, articleSlug }: ArticleTagDto): Promise<
    SinglePayloadResponseDto<{
      articleId: string;
      tags: { id: string; name: string; slug: string }[];
    }>
  > {
    const existedArticle = await this.db.article.findUnique({
      where: { slug: articleSlug },
    });
    if (!existedArticle)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    const existedTags = await this.db.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true },
    });
    const validTagIds = existedTags.map(({ id }) => id);
    const existedArticleTags = await this.db.articleTag.findMany({
      where: {
        articleId: existedArticle.id,
        tagId: { in: existedTags.map(({ id }) => id) },
      },
    });
    if (existedArticleTags.length > 0) {
      throw new HttpException(
        'Article tag already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const data = validTagIds.map((tagId) => ({
      articleId: existedArticle.id,
      tagId,
    }));
    const createdArticleTags = await this.db.articleTag.createMany({
      data,
      skipDuplicates: true,
    });
    if (createdArticleTags.count === 0)
      throw new HttpException(
        'Article tag already exists',
        HttpStatus.BAD_REQUEST,
      );

    const articletags = await this.db.articleTag.findMany({
      where: {
        articleId: existedArticle.id,
        tagId: { in: validTagIds },
      },
      select: {
        id: true,
        tag: { select: { id: true, name: true, slug: true } },
      },
    });

    const mappedArticleTags = articletags.map((tag) => ({
      id: tag.tag.id,
      name: tag.tag.name,
      slug: tag.tag.slug,
    }));

    return {
      message: 'Article tags created successfully',
      data: {
        articleId: existedArticle.id,
        tags: mappedArticleTags,
      },
    };
  }

  async getAllArticleTags(query: QueryArticleTagDto): Promise<
    PaginatedPayloadResponseDto<
      Prisma.ArticleTagGetPayload<{
        select: {
          id: true;
          article: { select: { id: true; title: true; slug: true } };
          tag: { select: { id: true; name: true; slug: true } };
        };
      }>
    >
  > {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.ArticleTagWhereInput = {
      article: { slug: query['article-slug'] },
    };
    const articleTags = await this.db.articleTag.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        article: { select: { id: true, title: true, slug: true } },
        tag: { select: { id: true, name: true, slug: true } },
      },
    });
    const articleTagsCount = await this.db.articleTag.count({ where });
    return {
      data: {
        items: articleTags,
        meta: {
          totalItems: articleTagsCount,
          currentPage: page,
          itemPerPages: limit,
          itemCount: articleTags.length,
          totalPages: Math.ceil(articleTagsCount / limit),
        },
      },
    };
  }

  async getArticleTagById(id: string) {
    const articleTag = await this.db.articleTag.findUnique({
      where: { id },
      select: {
        id: true,
        article: { select: { id: true, title: true, slug: true } },
        tag: { select: { id: true, name: true, slug: true } },
      },
    });
    return articleTag;
  }

  async updateArticleTagById(
    id: string,
    updateArticleTagDto: ArticleTagDto,
  ): Promise<
    Prisma.ArticleTagGetPayload<{
      select: {
        id: true;
        articleId: true;
        tag: { select: { id: true; name: true; slug: true } };
      };
    }>
  > {
    const existedArticleTag = await this.getArticleTagById(id);
    if (!existedArticleTag)
      throw new HttpException('Article tag not found', HttpStatus.NOT_FOUND);
    const articleTag = await this.db.articleTag.update({
      where: { id },
      data: {
        article: { connect: { id: existedArticleTag.article.id } },
        tag: { connect: { id: updateArticleTagDto.tagId } },
      },
      select: {
        id: true,
        articleId: true,
        tag: { select: { id: true, name: true, slug: true } },
      },
    });
    return articleTag;
  }

  async removeArticleTagById(id: string) {
    const articleTag = await this.getArticleTagById(id);
    if (!articleTag)
      throw new HttpException('Article tag not found', HttpStatus.NOT_FOUND);
    await this.db.articleTag.delete({ where: { id } });
    return {
      message: 'Article tag deleted successfully',
    };
  }
}
