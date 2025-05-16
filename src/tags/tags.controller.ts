import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagDto } from './dtos/mutate-tag.dto';
import { QueryTagDto } from './dtos/query-tag.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { PayloadResponseDto } from 'src/common/dtos/payload-response.dto';
@Controller('/protected/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async createNewSlug(
    @Body() createTagDto: TagDto,
  ): Promise<PayloadResponseDto> {
    try {
      const tag = await this.tagsService.createNewSlug(createTagDto);
      return { message: 'Tag created successfully', data: tag };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something went wrong',
        HttpStatus.BAD_REQUEST || 500,
      );
    }
  }

  @Get()
  @SkipThrottle({ short: true, medium: true, long: true })
  async getAllTags(
    @Query() query: QueryTagDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const { tags, currrentPage, itemPerPages, itemCount, totalPages } =
      await this.tagsService.getAllTags(query);
    return {
      message: 'Tags fetched successfully',
      data: {
        items: tags,
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
  async getTagsBySlug(
    @Param('slug') slug: string,
  ): Promise<PayloadResponseDto> {
    const tag = await this.tagsService.getTagBySlug(slug);
    if (!tag) throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
    return { message: 'Tag fetched successfully', data: tag };
  }

  @Patch(':slug')
  async updateTagsBySlug(
    @Param('slug') slug: string,
    @Body() updateTagDto: TagDto,
  ): Promise<PayloadResponseDto> {
    try {
      const tag = await this.tagsService.updateTagsBySlug(slug, updateTagDto);
      return { message: 'Tag updated successfully', data: tag };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something went wrong',
        HttpStatus.BAD_REQUEST || 500,
      );
    }
  }

  @Delete(':slug')
  async deleteTagBySlug(
    @Param('slug') slug: string,
  ): Promise<PayloadResponseDto> {
    try {
      await this.tagsService.deleteTagBySlug(slug);
      return { message: 'Tag deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something went wrong',
        HttpStatus.BAD_REQUEST || 500,
      );
    }
  }
}
