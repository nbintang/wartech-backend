import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from 'src/common/dtos/base-query.dto';
import { z } from 'zod';

const queryCategorisSchema = baseQueryRequestSchema.extend({
  name: z.string().optional(),
  slug: z.string().optional(),
  articlesPerCategory: z.coerce.number().optional(),
});

export class QueryCategoriesDto extends createZodDto(queryCategorisSchema) {}
