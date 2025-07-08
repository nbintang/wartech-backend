import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryDto } from './dtos/mutate-category.dto';
import { PrismaService } from '../../commons/prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';
import { QueryCategoriesDto } from './dtos/query-categories.dto';
import { PaginatedPayloadResponseDto } from '../../commons/dtos/paginated-payload-response.dto';
import { ArticleStatus } from '../articles/enums/article-status.enum';
export interface ArticleResponse {
  id: string;
  title: string;
  slug: string;
  image: string;
  status: ArticleStatus;
  publishedAt: Date | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  articles?: ArticleResponse[]; // articles is optional
}
@Injectable()
export class CategoriesService {
  constructor(private db: PrismaService) {}
  async createArticleCategory(data: CategoryDto): Promise<Category> {
    const existedCategory = await this.getCategoryBySlug(data.slug);
    if (existedCategory)
      throw new HttpException('Category already exists', 400);
    const newCategory = await this.db.category.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
      },
    });
    return newCategory;
  }


  async getAllCategories(
    query: QueryCategoriesDto,
  ): Promise<PaginatedPayloadResponseDto<CategoryResponse>> { // <-- FIX 1: Corrected the generic type
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const dynamicSearch: Prisma.CategoryWhereInput = {
      ...(query.name && { name: { contains: query.name } }),
    };

    const include = query['with-articles']
      ? {
          articles: {
            select: {
              id: true,
              title: true,
              slug: true,
              image: true,
              status: true,
              publishedAt: true,
            },
            where: { status: ArticleStatus.PUBLISHED },
            orderBy: { publishedAt: Prisma.SortOrder.desc },
            ...(query['articles-per-category']
              ? { take: query['articles-per-category'] }
              : {}),
          },
        }
      : undefined;

    const categories = await this.db.category.findMany({
      where: dynamicSearch,
      skip,
      take: limit,
      ...(include && { include }), // Use the constructed include object
    });

    // FIX 2: The mapping logic is now correct and type-safe
    const mappedCategories: CategoryResponse[] = categories.map((category) => {
      const { articles, ...restOfCategory } = category;
      const result: CategoryResponse = {
        ...restOfCategory,
        description: category.description || '',
      };
      if (query['with-articles'] && articles) {
        result.articles = articles as ArticleResponse[];
      }
      return result;
    });

    const categoriesCount = await this.db.category.count({
      where: dynamicSearch,
    });

    const totalPages = Math.ceil(categoriesCount / limit);

    return {
      data: {
        items: mappedCategories,
        meta: {
          currentPage: page,
          itemPerPages: limit,
          itemCount: categories.length,
          totalItems: categoriesCount,
          totalPages,
        },
      },
    };
  }


  async getCategoryBySlug(slug: string): Promise<Category> {
    return await this.db.category.findUnique({ where: { slug } });
  }

  async updateCategoryBySlug(
    slug: string,
    data: CategoryDto,
  ): Promise<Category> {
    const currentCategory = await this.getCategoryBySlug(slug);
    if (!currentCategory)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    const existedCategories = await this.db.category.findMany({
      where: {
        slug: data.slug,
        NOT: { id: currentCategory.id },
      },
    });
    if (existedCategories.length > 0)
      throw new HttpException(
        'Category already exists',
        HttpStatus.BAD_REQUEST,
      );
    const updatedCategory = await this.db.category.update({
      where: { id: currentCategory.id },
      data: {
        name: data.name ?? currentCategory.name,
        description: data.description,
        slug: data.slug ?? slug,
      },
    });
    return updatedCategory;
  }

  async deleteCategoryBySlug(slug: string): Promise<Category> {
    const existedCategory = await this.getCategoryBySlug(slug);
    if (!existedCategory)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

    return this.db.category.delete({
      where: { id: existedCategory.id },
    });
  }
}
