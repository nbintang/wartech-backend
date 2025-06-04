import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from '../../../common/dtos/base-query-request.schema';
import { z } from 'zod';

const articleTagSchema = baseQueryRequestSchema.extend({
  'article-id': z.string().uuid().optional(),
  'tag-id': z.string().uuid().optional(),
  'article-slug': z.string().optional(),
});
const typePostArticleTagSchema = z.object({
  bulk: z.coerce.boolean().optional(),
});

export class QueryArticleTagTypePostDto extends createZodDto(
  typePostArticleTagSchema,
) {}

export class QueryArticleTagDto extends createZodDto(articleTagSchema) {}
