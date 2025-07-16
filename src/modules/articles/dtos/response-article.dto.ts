import { createZodDto } from 'nestjs-zod';
import { ArticleStatus } from '@prisma/client';
import { z } from 'zod';

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

export const articlesSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  image: z.string(),
  status: z.nativeEnum(ArticleStatus),
  tags: z.array(tagSchema),
  publishedAt: z.date(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: categorySchema,
  author: authorSchema,
  commentsCount: z.number(),
  tagsCount: z.number(),
  likesCount: z.number(),
});

export class ArticlesDto extends createZodDto(articlesSchema) {}
