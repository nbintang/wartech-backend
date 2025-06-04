import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { baseServerPayloadResponseSchema } from './server-payload-response.dto';

export const baseSinglePayloadResponseSchema =
  baseServerPayloadResponseSchema.extend({
    data: z.record(z.string(), z.any()),
  });

export class SinglePayloadResponseDto<
  T = Record<string, unknown>,
> extends createZodDto(baseSinglePayloadResponseSchema) {
  data?: T;
}
