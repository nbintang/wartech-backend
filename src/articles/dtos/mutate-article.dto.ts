import { createZodDto } from 'nestjs-zod';
import slugify from '../../common/slugify';
import { z } from 'zod';

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

export class ArticleDto extends createZodDto(articleSchema) {}
