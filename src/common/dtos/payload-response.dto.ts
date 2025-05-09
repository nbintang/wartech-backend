import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const PayloadResponseSchema = z.object({
  message: z.string(),
  data: z.record(z.string(), z.any()),
});

export class PayloadResponseDto extends createZodDto(PayloadResponseSchema) {}
