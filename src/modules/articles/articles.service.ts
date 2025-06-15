import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ArticleDto } from './dtos/mutate-article.dto';
import { PrismaService } from '../../commons/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QueryArticleDto } from './dtos/query-article.dto';
import { ArticlesDto } from './dtos/response-article.dto';
import { PaginatedPayloadResponseDto } from '../../commons/dtos/paginated-payload-response.dto';
import sanitizeHtml from 'sanitize-html';
@Injectable()
export class ArticlesService {
  constructor(private db: PrismaService) {}
  async getArticeles(
    query: QueryArticleDto,
  ): Promise<PaginatedPayloadResponseDto<ArticlesDto>> {
    const isPaginated = query['is-paginated'] ?? false;
    const page = isPaginated ? +(query.page ?? 1) : undefined;
    const limit = isPaginated ? +(query.limit ?? 10) : undefined;
    const skip = isPaginated ? (page - 1) * limit : undefined;
    const take = isPaginated ? limit : undefined;
    const where: Prisma.ArticleWhereInput = {
      ...(query.title && { title: { contains: query.title } }),
      ...(query.category && {
        category: { name: { contains: query.category } },
      }),
      ...(query.tag && { tag: { name: { contains: query.tag } } }),
      ...(query.author && { author: { name: { contains: query.author } } }),
    };
    const articles = await this.db.article.findMany({
      where,
      skip,
      take,
      omit: { content: true, authorId: true, categoryId: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, name: true } },
        articleTags: {
          select: { tag: { select: { id: true, name: true, slug: true } } },
        },
        _count: { select: { comments: true, articleTags: true, likes: true } },
      },
      orderBy: [
        { updatedAt: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    const articlesCount = await this.db.article.count({ where });
    const itemCount = articles.length;
    const totalPages = isPaginated ? Math.ceil(articlesCount / limit) : 1;
    const mappedArticles: ArticlesDto[] = articles.map(
      ({ _count, articleTags, ...article }) => ({
        ...article,
        commentsCount: _count.comments,
        tagsCount: _count.articleTags,
        likesCount: _count.likes,
        tags: articleTags.map(({ tag }) => tag),
      }),
    );
    return {
      data: {
        items: mappedArticles,
        meta: {
          totalItems: articlesCount,
          currentPage: page,
          itemPerPages: limit,
          itemCount,
          totalPages,
        },
      },
    };
  }
  async createArticle(createArticleDto: ArticleDto) {
    const existedArticleTitle = await this.getArticleBySlug(
      createArticleDto.slug,
    );
    if (existedArticleTitle)
      throw new HttpException(
        'Article title already exists',
        HttpStatus.BAD_REQUEST,
      );
    const { categoryId, authorId, title, slug, content, image } =
      createArticleDto;
    const newArticle = await this.db.article.create({
      data: {
        title,
        slug,
        content: sanitizeHtml(content),
        image,
        author: { connect: { id: authorId } },
        category: { connect: { id: categoryId } },
      },
    });
    return {
      data: newArticle,
    };
  }

  async getArticleBySlug(slug: string): Promise<
    Prisma.ArticleGetPayload<{
      include: {
        category: {
          select: {
            id: true;
            name: true;
            slug: true;
            description: true;
          };
        };
        author: {
          select: {
            id: true;
            name: true;
            email: true;
            verified: true;
            image: true;
          };
        };
        articleTags: {
          select: { tag: { select: { id: true; name: true; slug: true } } };
        };
        _count: { select: { comments: true; articleTags: true; likes: true } };
      };
      omit: {
        authorId: true;
        categoryId: true;
      };
    }>
  > {
    const article = await this.db.article.findUnique({
      where: {
        slug,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            verified: true,
            image: true,
          },
        },
        articleTags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            articleTags: true,
            likes: true,
          },
        },
      },
      omit: {
        authorId: true,
        categoryId: true,
      },
    });
    return article;
  }

  async updateArticleBySlug(slug: string, updateArticleDto: ArticleDto) {
    const currentArticle = await this.getArticleBySlug(slug);
    if (!currentArticle)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    const updatedArticle = await this.db.article.update({
      where: { id: currentArticle.id },
      data: {
        title: updateArticleDto.title,
        slug: updateArticleDto.slug,
        content: sanitizeHtml(updateArticleDto.content),
        image: updateArticleDto.image,
        author: { connect: { id: updateArticleDto.authorId } },
        category: { connect: { id: updateArticleDto.categoryId } },
      },
    });
    return updatedArticle;
  }

  async deleteArticleBySlug(slug: string) {
    const deletedArticle = await this.db.article.delete({ where: { slug } });
    if (!deletedArticle) throw new HttpException('Failed to delete', 500);
    return {
      message: 'Article deleted successfully',
    };
  }
  async deleteArticlesBySlug(slugs: string[]) {
    const deletedArticles = await this.db.article.deleteMany({
      where: { slug: { in: slugs } },
    });
    if (!deletedArticles) throw new HttpException('Failed to delete', 500);
    return {
      message: 'Articles deleted successfully',
    };
  }
}
