import { createZodDto } from 'nestjs-zod';
import slugify from '../../../commons/slugify';
import { z } from 'zod';

const articleTagInputSchema = z.object({
  articleSlug: z
    .string()
    .refine((val) => slugify(val) === val, {
      message: 'Slug must be slugified',
    })
    .optional(),
  tagId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid().optional()).optional(),
});

export class ArticleTagDto extends createZodDto(articleTagInputSchema) {}
