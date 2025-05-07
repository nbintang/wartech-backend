import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DefaultSystemQueryResponseSchema = z.object({
  status_code: z.number(),
  success: z.boolean(),
  message: z.string(),
  error_messages: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .optional(),
  data: z.any().optional(),
});

export class DefaultSystemQueryResponseDto extends createZodDto(
  DefaultSystemQueryResponseSchema,
) {}
