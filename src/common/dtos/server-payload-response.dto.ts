import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const errorMessageSchema = z.array(
  z.object({ field: z.string(), message: z.string() }),
);

const baseServerPayloadResponseSchema = z.object({
  statusCode: z.number(),
  success: z.boolean(),
  message: z.string(),
  errorMessages: errorMessageSchema,
  data: z.any(),
});

const serverPayloadResponseSchema = baseServerPayloadResponseSchema.partial({
  errorMessages: true,
  data: true,
});
export class ServerPayloadResponseDto extends createZodDto(
  serverPayloadResponseSchema,
) {}
