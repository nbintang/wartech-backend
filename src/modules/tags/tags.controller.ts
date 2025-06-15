import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  BadRequestException,
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
import { Tag } from '@prisma/client';
@Controller('/protected/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Roles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard)
  @SkipThrottle({ short: true })
  @Post()
  async createTag(
    @Body() body: TagDto,
    @Query() query: QueryTagDto,
  ): Promise<SinglePayloadResponseDto<Tag | Tag[]>> {
    try {
      if (query.bulk) {
        if (!body.names || body.names.length === 0)
          throw new BadRequestException('names must be provided in bulk mode');
        return await this.tagsService.createTags(body);
      } else {
        if (!body.name)
          throw new BadRequestException(
            'names must be provided in non-bulk mode',
          );
        return await this.tagsService.createTag(body);
      }
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
