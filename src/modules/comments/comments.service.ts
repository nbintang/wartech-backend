import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CommentDto } from './dtos/mutate-comment.dto';
import { PrismaService } from '../../commons/prisma/prisma.service';
import { QueryCommentDto } from './dtos/query-comment.dto';
import { Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { formatComments, getCommentSelect } from './helpers/comment';

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

    const where: Prisma.CommentWhereInput = {
      ...(query['article-slug'] && {
        article: { slug: query['article-slug'] },
      }),
      parentId: null,
    };

    const comments = await this.db.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: getCommentSelect(),
    });

    const commentsCount = await this.db.comment.count({ where });

    if (comments.length === 0 && commentsCount === 0) {
      throw new HttpException('No comments found', HttpStatus.NOT_FOUND);
    }

    return {
      formattedComments: formatComments(comments),
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
      select: getCommentSelect(),
    });
    if (!comment)
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    return comment;
  }

  async getCommentsByParentId(parentId: string, query: QueryCommentDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CommentWhereInput = {
      ...(query['article-slug'] && {
        article: { slug: query['article-slug'] },
      }),
      parentId,
    };

    const comments = await this.db.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      select: getCommentSelect(),
    });

    const commentsCount = await this.db.comment.count({ where });

    if (comments.length === 0) {
      throw new HttpException('No replies found', HttpStatus.NOT_FOUND);
    }

    return {
      comments: formatComments(comments),
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
