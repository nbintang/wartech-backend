import { z } from 'zod';

export const BaseQuerySchema = z.object({
  sort: z.string().optional(),
  order: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
