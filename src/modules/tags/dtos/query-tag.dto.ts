import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from '../../../common/dtos/base-query-request.schema';
import { z } from 'zod';

const queryTagSchema = baseQueryRequestSchema.extend({
  name: z.string().optional(),
  slug: z.string().optional(),
});

export class QueryTagDto extends createZodDto(queryTagSchema) {}
