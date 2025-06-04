import { z } from 'zod';

export const baseQueryRequestSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
