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
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { QueryCategoriesDto } from './dtos/query-category.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enums';
import { RoleGuard } from '../auth/guards/role.guard';
import { CategoryDto } from './dtos/mutate-category.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { SinglePayloadResponseDto } from '../../commons/dtos/single-payload-response.dto';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
@SkipThrottle({ short: true, medium: true, long: true })
@Controller('/protected/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @SkipThrottle({ short: false })
  @Post()
  async createArticleCategory(@Body() body: CategoryDto) {
    try {
      const newCategory =
        await this.categoriesService.createArticleCategory(body);
      return newCategory;
    } catch (error) {
      throw new HttpException(
        error.message || 'Something Went Wrong',
        error.status || 500,
      );
    }
  }

  @Get()
  @SkipThrottle({ short: true, medium: true })
  async getAllCategories(@Query() query: QueryCategoriesDto) {
    return await this.categoriesService.getAllCategories(query);
  }

  @Get(':slug')
  @SkipThrottle({ short: true, medium: true })
  async getCategoryBySlug(
    @Param('slug') slug: string,
  ): Promise<SinglePayloadResponseDto> {
    const category = await this.categoriesService.getCategoryBySlug(slug);
    if (!category) throw new NotFoundException('Category Not Found');
    return {
      message: 'Category fetched successfully',
      data: category,
    };
  }

  @Patch(':slug')
  @SkipThrottle({ short: false })
  async updateCategoryBySlug(
    @Param('slug') slug: string,
    @Body() body: CategoryDto,
  ) {
    try {
      const category = await this.categoriesService.updateCategoryBySlug(
        slug,
        body,
      );
      return category;
    } catch (error) {
      throw new HttpException(
        error.message || 'Something Went Wrong',
        error.status || 500,
      );
    }
  }
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @SkipThrottle({ short: true })
  @Delete(':slug')
  async deleteCategoryBySlug(@Param('slug') slug: string) {
    try {
      await this.categoriesService.deleteCategoryBySlug(slug);
      return {
        message: 'Category deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something Went Wrong',
        error.status || 500,
      );
    }
  }
}
