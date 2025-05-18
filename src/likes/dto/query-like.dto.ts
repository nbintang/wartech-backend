import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from 'src/common/dtos/base-query-request.schema';
import { z } from 'zod';

const queryLikeSchema = baseQueryRequestSchema.extend({
  'article-slug': z.string().optional(),
});

export class QueryLikeDto extends createZodDto(queryLikeSchema) {}
