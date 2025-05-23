import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikeDto } from './dto/mutate-like.dto';
import { SinglePayloadResponseDto } from '../common/dtos/single-payload-response.dto';
import { QueryLikeDto } from './dto/query-like.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enums';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
@SkipThrottle({ short: true, medium: true, long: true })
@Controller('/protected/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Post()
  async createLike(
    @Body() createLikeDto: LikeDto,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = request.user.sub;
    return await this.likesService.createLike({
      ...createLikeDto,
      userId,
    });
  }

  @Get()
  async getAllLikes(@Query() query: QueryLikeDto) {
    return await this.likesService.getAllLikes(query);
  }

  @Get(':id')
  async getLikeById(@Param('id') id: string) {
    return await this.likesService.getLikeById(id);
  }

  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':id')
  async removeLikeById(@Param('id') id: string) {
    return await this.likesService.removeLikeById(id);
  }
}
