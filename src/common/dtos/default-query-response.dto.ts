import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DefaultQueryResponseSchema = z.object({
  message: z.string(),
  data: z.record(z.string(), z.any()),
});

export class DefaultQueryResponseDto extends createZodDto(
  DefaultQueryResponseSchema,
) {}
