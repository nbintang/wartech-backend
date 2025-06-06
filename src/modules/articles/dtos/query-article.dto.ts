import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from '../../../commons/dtos/base-query-request.schema';
import { z } from 'zod';

const queryArticleSchema = baseQueryRequestSchema.extend({
  'is-paginated': z.coerce.boolean().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  author: z.string().optional(),
});

export class QueryArticleDto extends createZodDto(queryArticleSchema) {}
