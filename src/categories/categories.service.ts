import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryDto } from './dtos/mutate-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'prisma/generated';
import { QueryCategoriesDto } from './dtos/query-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private db: PrismaService) {}
  async createArticleCategory(data: CategoryDto) {
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

  async getAllCategories(query: QueryCategoriesDto) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;
    const dynamicSearch: Prisma.CategoryWhereInput = {
      ...(query.name && { name: { contains: query.name } }),
    };
    const categories = await this.db.category.findMany({
      where: dynamicSearch,
      skip,
      take,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            status: true,
            publishedAt: true,
          },
          where: {
            status: 'PUBLISHED',
          },
          orderBy: {
            publishedAt: 'desc',
          },
          take: Math.min(query.articles_per_category, 10), // Limit to max 10 for safety
        },
      },
    });
    const categoriesCount = await this.db.category.count({
      where: dynamicSearch,
    });
    const itemCount = categories.length;
    const totalPages = Math.ceil(categoriesCount / query.limit);
    return {
      categories,
      currrentPage: query.page,
      itemPerPages: query.limit,
      itemCount,
      totalItems: categoriesCount,
      totalPages,
    };
  }

  async getCategoryBySlug(slug: string) {
    return await this.db.category.findUnique({ where: { slug } });
  }

  async updateCategoryBySlug(slug: string, data: CategoryDto) {
    const currentCategory = await this.getCategoryBySlug(slug);
    if (!currentCategory)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    if (data.name) {
      const existingByName = await this.db.category.findUnique({
        where: { name: data.name },
      });
      if (existingByName && existingByName.id !== currentCategory.id)
        throw new HttpException(
          'Category name already exists',
          HttpStatus.BAD_REQUEST,
        );
    }
    if (data.slug && data.slug !== slug) {
      const existingBySlug = await this.getCategoryBySlug(data.slug);
      if (existingBySlug && existingBySlug.id !== currentCategory.id)
        throw new HttpException(
          'Category slug already exists',
          HttpStatus.BAD_REQUEST,
        );
    }
    const updatedCategory = await this.db.category.update({
      where: { slug },
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug ?? slug,
      },
    });

    return updatedCategory;
  }

  async deleteCategoryBySlug(slug: string) {
    const existedCategory = await this.getCategoryBySlug(slug);
    if (!existedCategory)
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    return await this.db.category.delete({ where: { slug } });
  }
}
