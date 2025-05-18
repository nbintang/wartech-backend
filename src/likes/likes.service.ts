import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LikeDto } from './dto/mutate-like.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryLikeDto } from './dto/query-like.dto';
import { Prisma } from 'prisma/generated';

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

  async getAllLikes(query: QueryLikeDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.LikeWhereInput = {
      ...(query['article-slug'] && {
        article: { slug: query['article-slug'] },
      }),
    };
    const likes = await this.db.like.findMany({
      where,
      skip,
      take,
      include: {
        user: { select: { id: true, name: true } },
        article: { select: { id: true, title: true, slug: true } },
      },
    });
    const likesCount = await this.db.like.count({
      where,
    });
    const itemCount = likes.length;
    const totalPages = Math.ceil(likesCount / limit);
    return {
      likes,
      meta: {
        totalItems: likesCount,
        currentPage: page,
        itemPerPages: limit,
        itemCount,
        totalPages,
      },
    };
  }

  async getLikeById(id: string) {
    const like = await this.db.like.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        article: { select: { id: true, title: true, slug: true } },
      },
    });
    return like;
  }

  async updateLikeById(id: string, updateLikeDto: LikeDto) {
    const existedLike = await this.db.like.findUnique({ where: { id } });
    if (!existedLike)
      throw new HttpException('Like not found', HttpStatus.NOT_FOUND);
    const like = await this.db.like.update({
      where: { id },
      data: {
        userId: updateLikeDto.userId,
        articleId: updateLikeDto.articleId,
      },
    });
    return like;
  }

  async removeLikeById(id: string) {
    await this.db.like.delete({ where: { id } });
    return { message: 'Like deleted successfully' };
  }
}
