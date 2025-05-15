import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { PayloadResponseDto } from 'src/common/dtos/payload-response.dto';

@SkipThrottle({
  short: true,
  medium: true,
  long: true,
})
@Controller('/protected/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {}

  @SkipThrottle()
  @Get()
  async getAllCategories(
    @Query() query: QueryCategoriesDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const { categories, currrentPage, itemPerPages, itemCount, totalPages } =
      await this.categoriesService.getAllCategories(query);
    return {
      message: 'Categories fetched successfully',
      data: {
        items: categories,
        meta: {
          item_count: itemCount,
          item_per_page: itemPerPages,
          total_pages: totalPages,
          current_page: currrentPage,
        },
      },
    };
  }

  @Get(':slug')
  async getCategoryBySlug(
    @Param('slug') slug: string,
  ): Promise<PayloadResponseDto> {
    const category = await this.categoriesService.getCategoryBySlug(slug);
    if (!category) throw new NotFoundException('Category Not Found');
    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
