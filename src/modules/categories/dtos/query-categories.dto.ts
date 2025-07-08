import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from '../../../commons/dtos/base-query-request.schema';
import { z } from 'zod';

const queryCategorisSchema = baseQueryRequestSchema.extend({
  name: z.string().optional(),
  slug: z.string().optional(),
  'articles-per-category': z.coerce.number().optional(),
  'with-articles': z.coerce.boolean().optional().default(true), // default true kalau mau
});

export class QueryCategoriesDto extends createZodDto(queryCategorisSchema) {}
