import { Injectable } from '@nestjs/common';
import { LikeDto } from './dto/mutate-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikesService {
  constructor(private db: PrismaService) {}
  async createLike(createLikeDto: LikeDto) {
    const like = await this.db.like.create({
      data: {
        userId: createLikeDto.userId,
        articleId: createLikeDto.articleId,
      },
    });
    return like;
  }

  getLikes() {
    return `This action returns all likes`;
  }

  getLikeById(id: number) {
    return `This action returns a #${id} like`;
  }

  updateLikeById(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  removeLikeById(id: number) {
    return `This action removes a #${id} like`;
  }
}
