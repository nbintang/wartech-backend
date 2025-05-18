import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from 'src/common/dtos/base-query-request.schema';
import { z } from 'zod';

export const queryCommentSchema = baseQueryRequestSchema.extend({
  'article-slug': z.string().uuid().optional(),
});

export class QueryCommentDto extends createZodDto(queryCommentSchema) {}
