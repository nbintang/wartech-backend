import { createZodDto } from 'nestjs-zod';
import slugify from '../../../commons/slugify';
import { z } from 'zod';
import { ArticleStatus } from '@prisma/client';
const articleInputSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  content: z.string().min(1),
  image: z.string().url(),
  authorId: z.string().uuid(),
  categoryId: z.string().uuid(),
  tagIds: z.array(z.string().uuid()).optional(),
});

const articleSchema = articleInputSchema.transform((data) => ({
  ...data,
  slug: slugify(data.title),
}));
const updateArticleSchema = articleInputSchema.extend({
  status: z.nativeEnum(ArticleStatus).optional(),
}).transform((data) => ({
  ...data,
  slug: slugify(data.title),
}));

export class ArticleDto extends createZodDto(articleSchema) {}
export class UpdateArticleDto extends createZodDto(updateArticleSchema) {}
