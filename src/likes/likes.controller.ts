import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikeDto } from './dto/mutate-like.dto';
import { SinglePayloadResponseDto } from 'src/common/dtos/single-payload-response.dto';
import { QueryLikeDto } from './dto/query-like.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enums';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Request } from 'express';
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
  @Patch(':id')
  async updateLikeById(
    @Param('id') id: string,
    @Body() updateLikeDto: LikeDto,
  ) {
    return await this.likesService.updateLikeById(id, updateLikeDto);
  }
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Delete(':id')
  async removeLikeById(@Param('id') id: string) {
    return await this.likesService.removeLikeById(id);
  }
}
