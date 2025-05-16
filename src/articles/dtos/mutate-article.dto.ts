import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const articleInputSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  content: z.string().min(1),
  image: z.string().url(), // atau boleh string biasa jika bukan URL
  authorId: z.string().uuid(),
  categoryId: z.string().uuid(),
  tagIds: z.array(z.string().uuid()).optional(), // untuk relasi dengan Tag
});

export class CreateArticleDto extends createZodDto(articleInputSchema) {}
