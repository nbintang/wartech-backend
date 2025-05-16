import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dtos/mutate-article.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'prisma/generated';
import { QueryArticleDto } from './dtos/query-article.dto';
import { ArticlesDto } from './dtos/response-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private db: PrismaService) {}
  async getArticeles(query: QueryArticleDto) {
    const isPaginated = query.isPaginated ?? false;
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
      omit: {
        content: true,
        authorId: true,
        categoryId: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        articleTags: {
          select: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        _count: {
          select: { comments: true, articleTags: true, likes: true },
        },
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
    const articleResponse: ArticlesDto[] = articles.map(
      ({ _count, articleTags, ...article }) => ({
        ...article,
        commentsCount: _count.comments,
        tagsCount: _count.articleTags,
        likesCount: _count.likes,
        tags: articleTags.map(({ tag }) => tag),
      }),
    );
    return {
      articles: articleResponse,
      meta: {
        totalItems: articlesCount,
        currentPage: page,
        itemPerPages: limit,
        itemCount,
        totalPages,
      },
    };
  }
  async createArticle(createArticleDto: CreateArticleDto) {
    const {
      tagIds = [],
      categoryId,
      authorId,
      title,
      slug,
      content,
      image,
    } = createArticleDto;
    const newArticle = await this.db.article.create({
      data: {
        title,
        slug,
        content,
        image,
        author: { connect: { id: authorId } },
        category: { connect: { id: categoryId } },
        articleTags: tagIds.length
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
    });
    return newArticle;
  }

  async getArticleBySlug(slug: string) {
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
    });
    return article;
  }

  update(id: number, updateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
