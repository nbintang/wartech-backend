import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const basePayloadResponseSchema = z.object({
  message: z.string(),
  data: z.record(z.string(), z.any()),
});

export class PayloadResponseDto<
  T = Record<string, unknown>,
> extends createZodDto(basePayloadResponseSchema) {
  data?: T;
}
