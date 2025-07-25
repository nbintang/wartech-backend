import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from '../../../commons/dtos/base-query-request.schema';
import { z } from 'zod';

const queryTagSchema = baseQueryRequestSchema.extend({
  name: z.string().optional(),
  slug: z.string().optional(),
  bulk: z.coerce.boolean().optional(),
});

export class QueryTagDto extends createZodDto(queryTagSchema) {}
