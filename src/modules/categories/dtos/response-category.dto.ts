import { createZodDto } from 'nestjs-zod';
import { ArticleStatus } from '../../articles/enums/article-status.enum';
import { z } from 'zod';

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  articles: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        image: z.string(),
        status: z.nativeEnum(ArticleStatus),
        description: z.string().nullable(),
        publishedAt: z.date(),
      }),
    )
    .nullable(),
});

export class CategoryResponseDto extends createZodDto(categorySchema) {}
