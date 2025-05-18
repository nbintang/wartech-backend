import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from 'src/common/dtos/base-query-request.schema';
import { z } from 'zod';

const articleTagSchema = baseQueryRequestSchema.extend({
  'article-id': z.string().uuid().optional(),
  'tag-id': z.string().uuid().optional(),
  'article-slug': z.string().optional(),
});

export class QueryArticleTagDto extends createZodDto(articleTagSchema) {}
