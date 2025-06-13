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
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagDto } from './dtos/mutate-tag.dto';
import { QueryTagDto } from './dtos/query-tag.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { SinglePayloadResponseDto } from '../../commons/dtos/single-payload-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enums';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
@Controller('/protected/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @SkipThrottle({ short: true })
  @Post()
  async createTag(
    @Body() createTagDto: TagDto,
  ): Promise<SinglePayloadResponseDto> {
    try {
      const tag = await this.tagsService.createTag(createTagDto);
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
  async getAllTags(@Query() query: QueryTagDto) {
    return await this.tagsService.getAllTags(query);
  }

  @Get(':slug')
  @SkipThrottle({ short: true, medium: true, long: true })
  async getTagsBySlug(
    @Param('slug') slug: string,
  ): Promise<SinglePayloadResponseDto> {
    const tag = await this.tagsService.getTagBySlug(slug);
    if (!tag) throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
    return { message: 'Tag fetched successfully', data: tag };
  }
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @Patch(':slug')
  @SkipThrottle({ short: true })
  async updateTagsBySlug(
    @Param('slug') slug: string,
    @Body() updateTagDto: TagDto,
  ): Promise<SinglePayloadResponseDto> {
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
  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @Delete(':slug')
  @SkipThrottle({ short: true })
  async deleteTagBySlug(
    @Param('slug') slug: string,
  ): Promise<SinglePayloadResponseDto> {
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
