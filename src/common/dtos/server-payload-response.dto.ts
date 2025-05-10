import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const errorMessageSchema = z.array(
  z.object({ field: z.string(), message: z.string() }),
);

const baseServerPayloadResponseSchema = z.object({
  status_code: z.number(),
  success: z.boolean(),
  message: z.string(),
  error_messages: errorMessageSchema,
  data: z.any(),
});

const serverPayloadResponseSchema = baseServerPayloadResponseSchema.partial({
  error_messages: true,
  data: true,
});
export class ServerPayloadResponseDto extends createZodDto(
  serverPayloadResponseSchema,
) {}
