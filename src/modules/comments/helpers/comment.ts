import { Prisma } from '@prisma/client';

export const getCommentSelect = (): Prisma.CommentSelect => ({
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  isEdited: true,
  user: {
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
    },
  },
  article: {
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
    },
  },
  likes: {
    select: {
      id: true,
    },
  },
  _count: {
    select: {
      children: true,
    },
  },
});

export const formatComments = (comments: any[]): any[] => {
  return comments.map((comment) => ({
    ...comment,
    likes: comment.likes.length,
    childrenCount: comment._count?.children ?? 0
  }));
};
