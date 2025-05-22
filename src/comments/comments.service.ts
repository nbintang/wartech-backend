import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommentDto } from './dtos/mutate-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryCommentDto } from './dtos/query-comment.dto';
import { Prisma } from 'prisma/generated';

@Injectable()
export class CommentsService {
  constructor(private db: PrismaService) {}
  async createComment(createCommentDto: CommentDto) {
    const comment = await this.db.comment.create({
      data: {
        content: createCommentDto.content,
        userId: createCommentDto.userId!,
        articleId: createCommentDto.articleId,
        parentId: createCommentDto.parentId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isEdited: true,
        user: { select: { id: true, name: true, image: true } },
        article: {
          select: { id: true, title: true, slug: true, publishedAt: true },
        },
      },
    });
    return comment;
  }

  async getAllComments(query: QueryCommentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.CommentWhereInput = {
      ...(query['article-slug'] && {
        article: { slug: query['article-slug'] },
      }),
    };
    const comments = await this.db.comment.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isEdited: true,
        user: { select: { id: true, name: true, image: true } },
        article: {
          select: { id: true, title: true, slug: true, publishedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const commentsCount = await this.db.comment.count({ where });
    return {
      comments,
      meta: {
        totalItems: commentsCount,
        currentPage: page,
        itemPerPages: limit,
        itemCount: comments.length,
        totalPages: Math.ceil(commentsCount / limit),
      },
    };
  }

  async getCommentById(id: string) {
    const comment = await this.db.comment.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isEdited: true,
        user: { select: { id: true, name: true, image: true } },
        article: {
          select: { id: true, title: true, slug: true, publishedAt: true },
        },
      },
    });
    return comment;
  }

  async updateCommentById(id: string, updateCommentDto: CommentDto) {
    const existedComment = await this.getCommentById(id);
    if (!existedComment)
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    const comment = await this.db.comment.update({
      where: { id },
      data: {
        isEdited: true,
        content: updateCommentDto.content,
        userId: updateCommentDto.userId!,
        articleId: updateCommentDto.articleId,
        parentId: updateCommentDto.parentId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        isEdited: true,
        user: { select: { id: true, name: true, image: true } },
        article: {
          select: { id: true, title: true, slug: true, publishedAt: true },
        },
      },
    });
    return comment;
  }

  async removeCommentById(id: string) {
    await this.db.comment.delete({ where: { id } });
    return { message: 'Comment deleted successfully' };
  }
}
