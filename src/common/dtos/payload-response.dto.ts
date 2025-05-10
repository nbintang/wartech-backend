import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const basePayloadResponseSchema = z.object({ message: z.string() });
const payloadResponseSchema = basePayloadResponseSchema.extend({
  data: z.record(z.string(), z.any()),
});
export class PayloadResponseDto extends createZodDto(payloadResponseSchema) {}
