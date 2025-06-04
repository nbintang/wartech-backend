import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const baseServerPayloadResponseSchema = z.object({
  statusCode: z.number().optional(),
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.any(),
});
export class ServerPayloadResponseDto<T = any> extends createZodDto(
  baseServerPayloadResponseSchema,
) {
  data?: T;
}

const baseServerErrorResponseSchema = baseServerPayloadResponseSchema.extend({
  errorMessages: z
    .array(z.object({ field: z.string(), message: z.string() }))
    .optional(),
});
export class ServerErrorPayloadResponseDto extends createZodDto(
  baseServerErrorResponseSchema,
) {}
