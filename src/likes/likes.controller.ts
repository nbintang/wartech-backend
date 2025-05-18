import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikeDto } from './dto/mutate-like.dto';
import { SinglePayloadResponseDto } from 'src/common/dtos/single-payload-response.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { QueryLikeDto } from './dto/query-like.dto';
@Controller('/protected/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  async createLike(
    @Body() createLikeDto: LikeDto,
  ): Promise<SinglePayloadResponseDto> {
    return await this.likesService.createLike(createLikeDto);
  }

  @Get()
  async getAllLikes(
    @Query() query: QueryLikeDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const { likes, meta } = await this.likesService.getAllLikes(query);
    return {
      data: {
        items: likes,
        meta,
      },
    };
  }

  @Get(':id')
  async getLikeById(@Param('id') id: string) {
    return await this.likesService.getLikeById(id);
  }

  @Patch(':id')
  async updateLikeById(
    @Param('id') id: string,
    @Body() updateLikeDto: LikeDto,
  ) {
    return await this.likesService.updateLikeById(id, updateLikeDto);
  }

  @Delete(':id')
  async removeLikeById(@Param('id') id: string) {
    return await this.likesService.removeLikeById(id);
  }
}
