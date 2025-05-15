import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'prisma/generated';
import { QueryCategoriesDto } from './dto/query-categories.dto';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .trim();
@Injectable()
export class CategoriesService {
  constructor(private db: PrismaService) {}
  async createArticleCategory(data: Prisma.CategoryCreateInput) {
    const slug = slugify(data.name);

    return this.db.category.create({ data });
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

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
