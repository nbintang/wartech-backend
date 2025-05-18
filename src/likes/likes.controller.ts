import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikeDto } from './dto/mutate-like.dto';
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  create(@Body() createLikeDto: LikeDto) {
    return this.likesService.createLike(createLikeDto);
  }

  @Get()
  findAll() {
    return this.likesService.getAllLikes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.likesService.getLikeById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
    return this.likesService.updateLikeById(+id, updateLikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.likesService.removeLikeById(+id);
  }
}
