import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommentDto } from './dtos/mutate-comment.dto';
import { PrismaService } from '../../commons/prisma/prisma.service';
import { QueryCommentDto } from './dtos/query-comment.dto';
import { Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class CommentsService {
  constructor(private db: PrismaService) {}
  sanitizeCommentContent(content: string): string {
    return sanitizeHtml(content, {
      allowedTags: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'code',
        'pre',
        'blockquote',
        'ul',
        'ol',
        'li',
        'p',
        'br',
      ],
      allowedAttributes: {
        a: ['href', 'name', 'target'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      transformTags: {
        a: sanitizeHtml.simpleTransform('a', {
          rel: 'noopener noreferrer',
          target: '_blank',
        }),
        b: 'strong',
        i: 'em',
      },
      textFilter: (text) => text.replace(/\n/g, '<br>'),
    });
  }
  async createComment({ articleId, userId, content }: CommentDto) {
    const comment = await this.db.comment.create({
      data: {
        content: this.sanitizeCommentContent(content),
        userId,
        articleId,
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

  async repliesComment(commentId: string, createCommentDto: CommentDto) {
    return await this.db.comment.create({
      data: {
        content: this.sanitizeCommentContent(createCommentDto.content),
        userId: createCommentDto.userId,
        articleId: createCommentDto.articleId,
        parentId: commentId,
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
  }
  async getAllCommentsByArticleSlug(query: QueryCommentDto) {
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
        user: { select: { id: true, name: true, image: true, email: true } },
        article: {
          select: { id: true, title: true, slug: true, publishedAt: true },
        },
        likes: {
          select: { id: true },
        },

        children: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            isEdited: true,
            likes: {
              select: { id: true },
            },
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
            article: {
              select: { id: true, title: true, slug: true, publishedAt: true },
            },
            children: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const commentsCount = await this.db.comment.count({ where });
    if (comments.length === 0) {
      throw new HttpException('No comments found', HttpStatus.NOT_FOUND);
    }
    const formattedComments = comments.map((comment) => ({
      ...comment,
      likes: comment.likes.length,
      children: comment.children.map((child) => ({
        ...child,
        likes: child.likes.length,
      })),
    }));
    return {
      formattedComments,
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
        likes: true,
        user: { select: { id: true, name: true, image: true } },
        article: {
          select: { id: true, title: true, slug: true, publishedAt: true },
        },
        children: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            likes: true,
            isEdited: true,
            user: { select: { id: true, name: true, image: true } },
            article: {
              select: { id: true, title: true, slug: true, publishedAt: true },
            },
          },
        },
      },
    });
    return comment;
  }

  async getCommentsByParentId(parentId: string, query: QueryCommentDto) {
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
      where: { parentId, ...where },
      take,
      skip,
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
    const commentsCount = await this.db.comment.count({
      where: { parentId, ...where },
    });
    if (comments.length === 0) {
      throw new HttpException('No comments found', HttpStatus.NOT_FOUND);
    }
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

  async updateCommentById(id: string, updateCommentDto: CommentDto) {
    const existedComment = await this.getCommentById(id);
    if (!existedComment)
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    const comment = await this.db.comment.update({
      where: { id },
      data: {
        isEdited: true,
        content: this.sanitizeCommentContent(updateCommentDto.content),
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

  async removeCommentByIdAndUser(commentId: string) {
    await this.db.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted successfully' };
  }
}
