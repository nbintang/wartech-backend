import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../commons/prisma/prisma.service';

@Injectable()
export class CommentLikesService {
  constructor(private readonly db: PrismaService) {}
  async likeCommentByUserIdAndCommentId(commentId: string, userId: string) {
    const existingLike = await this.getCurrentUserLikeByUserIdAndCommentId(
      commentId,
      userId,
    );
    if (existingLike) return { data: existingLike };
    const like = await this.db.like.create({
      data: {
        userId,
        commentId,
      },
      select: {
        id: true,
        user: { select: { id: true, name: true } },
        commentId: true,
      },
    });
    return {
      data: like,
    };
  }
  async removeLikeByUserIdAndCommentId(
    commentId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const existingLike = await this.getCurrentUserLikeByUserIdAndCommentId(
      commentId,
      userId,
    );
    if (!existingLike) return { message: 'Like not found' };
    await this.db.like.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
    return { message: 'Like deleted successfully' };
  }

  async getLikesByCommentId(commentId: string) {
    const likes = await this.db.like.findMany({
      where: { commentId },
      select: {
        id: true,
        user: { select: { id: true, name: true } },
        commentId: true,
      },
    });
    const totalLikes = await this.db.like.count({ where: { commentId } });
    return { likes, totalLikes };
  }

  async getCurrentUserLikeByUserIdAndCommentId(
    commentId: string,
    userId: string,
  ) {
    const like = await this.db.like.findUnique({
      where: { userId_commentId: { userId, commentId } },
      select: {
        id: true,
        commentId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return like;
  }
}
