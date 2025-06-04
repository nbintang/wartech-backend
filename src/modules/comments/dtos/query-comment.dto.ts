import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from '../../../commons/dtos/base-query-request.schema';
import { z } from 'zod';

export const queryCommentSchema = baseQueryRequestSchema.extend({
  'article-slug': z.string().optional(),
});

export class QueryCommentDto extends createZodDto(queryCommentSchema) {}
