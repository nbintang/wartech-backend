import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LikeDto } from './dto/mutate-like.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryLikeDto } from './dto/query-like.dto';
import { Prisma } from '@prisma/client';
import { SinglePayloadResponseDto } from '../../common/dtos/single-payload-response.dto';
import { PaginatedPayloadResponseDto } from '../../common/dtos/paginated-payload-response.dto';

type LikeWithUserAndArticle = Prisma.LikeGetPayload<{
  include: {
    user: { select: { id: true; name: true } };
    article: { select: { id: true; title: true; slug: true } };
  };
  omit: {
    userId: true;
    articleId: true;
  };
}>;
@Injectable()
export class LikesService {
  constructor(private db: PrismaService) {}
  async createLike(createLikeDto: LikeDto): Promise<
    SinglePayloadResponseDto<
      Prisma.LikeGetPayload<{
        select: {
          id: true;
          user: { select: { id: true; name: true } };
          article: { select: { id: true; title: true; slug: true } };
        };
      }>
    >
  > {
    const existedLikeFromArticle = await this.db.like.findMany({
      where: {
        articleId: createLikeDto.articleId,
        userId: createLikeDto.userId,
      },
    });
    if (existedLikeFromArticle.length > 0)
      throw new HttpException(
        'You Already Liked the article',
        HttpStatus.BAD_REQUEST,
      );
    const like = await this.db.like.create({
      data: {
        userId: createLikeDto.userId,
        articleId: createLikeDto.articleId,
      },
      select: {
        id: true,
        user: { select: { id: true, name: true } },
        article: { select: { id: true, title: true, slug: true } },
      },
    });
    return {
      data: like,
    };
  }

  async getAllLikes(
    query: QueryLikeDto,
  ): Promise<PaginatedPayloadResponseDto<LikeWithUserAndArticle>> {
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
      omit: {
        userId: true,
        articleId: true,
      },
    });
    const likesCount = await this.db.like.count({
      where,
    });
    const itemCount = likes.length;
    const totalPages = Math.ceil(likesCount / limit);
    return {
      data: {
        items: likes,
        meta: {
          totalItems: likesCount,
          currentPage: page,
          itemPerPages: limit,
          itemCount,
          totalPages,
        },
      },
    };
  }

  async getLikeById(id: string): Promise<LikeWithUserAndArticle> {
    const like = await this.db.like.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        article: { select: { id: true, title: true, slug: true } },
      },
      omit: {
        userId: true,
        articleId: true,
      },
    });
    return like;
  }

  async removeLikeById(id: string): Promise<{ message: string }> {
    await this.db.like.delete({ where: { id } });
    return { message: 'Like deleted successfully' };
  }
}
