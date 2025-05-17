import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const articleTagInpuptSchema = z.object({
  articleSlug: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
});

const articleTagsSchema = articleTagInpuptSchema.extend({
  tagIds: z.array(z.string().uuid().optional()),
});

export class ArticleTagsDto extends createZodDto(articleTagsSchema) {}
export class ArticleTagDto extends createZodDto(articleTagInpuptSchema) {}
