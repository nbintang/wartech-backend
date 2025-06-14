import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../commons/prisma/prisma.service';
import { QueryArticleTagDto } from './dtos/query-article-tag.dto';
import { Prisma } from '@prisma/client';
import { ArticleTagDto } from './dtos/mutate-article-tag.dto';
import { PaginatedPayloadResponseDto } from '../../commons/dtos/paginated-payload-response.dto';
import { SinglePayloadResponseDto } from '../../commons/dtos/single-payload-response.dto';

// Define a consistent ArticleTagPayload type for reusability
type ArticleTagPayload = Prisma.ArticleTagGetPayload<{
  select: {
    article: { select: { id: true; title: true; slug: true } };
    tag: { select: { id: true; name: true; slug: true } };
  };
}>;

@Injectable()
export class ArticleTagsService {
  constructor(private db: PrismaService) {}

  async addArticleTag(
    createArticleTagDto: ArticleTagDto,
  ): Promise<ArticleTagPayload> {
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
        article: { select: { id: true, title: true, slug: true } },
        tag: { select: { id: true, name: true, slug: true } },
      },
    });
    return articleTag;
  }

  async addArticleTags({ tagIds, articleSlug }: ArticleTagDto): Promise<
    SinglePayloadResponseDto<{
      article: { id: string; title: string; slug: string };
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
      select: { id: true, name: true, slug: true },
    });
    const validTagIds = existedTags.map(({ id }) => id);

    const existedArticleTags = await this.db.articleTag.findMany({
      where: {
        articleId: existedArticle.id,
        tagId: { in: validTagIds },
      },
    });
    if (existedArticleTags.length > 0) {
      throw new HttpException(
        'Some article tags already exist for this article',
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = validTagIds.map((tagId) => ({
      articleId: existedArticle.id,
      tagId,
    }));

    await this.db.articleTag.createMany({
      data,
      skipDuplicates: true,
    });

    const newlyAddedArticleTags = await this.db.articleTag.findMany({
      where: {
        articleId: existedArticle.id,
        tagId: { in: validTagIds },
      },
      select: {
        tag: { select: { id: true, name: true, slug: true } },
      },
    });

    const mappedTags = newlyAddedArticleTags.map((at) => at.tag);

    return {
      message: 'Article tags added successfully',
      data: {
        article: {
          id: existedArticle.id,
          title: existedArticle.title,
          slug: existedArticle.slug,
        },
        tags: mappedTags,
      },
    };
  }

  async getAllArticleTags(
    query: QueryArticleTagDto,
  ): Promise<PaginatedPayloadResponseDto<ArticleTagPayload>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.ArticleTagWhereInput = {
      ...(query['article-slug'] && {
        article: { slug: query['article-slug'] },
      }),
      ...(query['tag-slug'] && { tag: { slug: query['tag-slug'] } }),
    };

    const [articleTags, articleTagsCount] = await this.db.$transaction([
      this.db.articleTag.findMany({
        where,
        skip,
        take,
        select: {
          article: { select: { id: true, title: true, slug: true } },
          tag: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.db.articleTag.count({ where }),
    ]);

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

  async getArticleTagByArticleSlug(
    articleSlug: string,
  ): Promise<ArticleTagPayload> {
    const article = await this.db.article.findUnique({
      where: { slug: articleSlug },
      select: { id: true }, // Only need ID to find the article tag
    });
    if (!article)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

    const articleTag = await this.db.articleTag.findFirst({
      where: {
        articleId: article.id,
      },
      select: {
        article: { select: { id: true, title: true, slug: true } },
        tag: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!articleTag)
      throw new HttpException('Article tag not found', HttpStatus.NOT_FOUND);
    return articleTag;
  }

  async updateArticleTagByArticleSlug(
    articleSlug: string,
    updateArticleTagDto: ArticleTagDto,
  ): Promise<
    Prisma.ArticleTagGetPayload<{
      select: {
        article: { select: { id: true; title: true; slug: true } };
        tag: { select: { id: true; name: true; slug: true } };
      };
    }>
  > {
    const article = await this.db.article.findUnique({
      where: { slug: articleSlug },
      select: { id: true, title: true, slug: true },
    });
    if (!article)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    const existedArticleTag = await this.db.articleTag.findFirst({
      where: { articleId: article.id },
    });
    if (!existedArticleTag)
      throw new HttpException('Article tag not found', HttpStatus.NOT_FOUND);

    const articleTag = await this.db.articleTag.update({
      where: { id: existedArticleTag.id },
      data: {
        article: { connect: { id: article.id } },
        tag: { connect: { id: updateArticleTagDto.tagId } },
      },
      select: {
        article: { select: { id: true, title: true, slug: true } },
        tag: { select: { id: true, name: true, slug: true } },
      },
    });
    return articleTag;
  }

  async removeArticleTagByArticleSlug(
    articleSlug: string,
  ): Promise<{ message: string }> {
    const article = await this.db.article.findUnique({
      where: { slug: articleSlug },
      select: { id: true },
    });
    if (!article)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

    const articleTag = await this.db.articleTag.findFirst({
      where: { articleId: article.id },
      select: { id: true }, // Only need the ID to delete
    });

    if (!articleTag) {
      throw new HttpException(
        'Article tag not found for this article',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.db.articleTag.delete({ where: { id: articleTag.id } });
    return {
      message: 'Article tag deleted successfully',
    };
  }
  async removeArticleTagsByArticleSlug(
    articleSlug: string,
  ): Promise<{ message: string }> {
    const existedArticle = await this.db.article.findUnique({
      where: { slug: articleSlug },
    });

    if (!existedArticle) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    // 2️⃣ Hapus tags yang ada dahulu
    await this.db.articleTag.deleteMany({
      where: { articleId: existedArticle.id },
    });

    return { message: 'Article tags deleted successfully' };
  }
}
