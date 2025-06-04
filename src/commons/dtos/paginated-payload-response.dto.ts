import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { baseServerPayloadResponseSchema } from './server-payload-response.dto';

const metaSchema = z.object({
  totalItems: z.number(),
  itemCount: z.number(),
  itemPerPages: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
});

const PaginatedPayloadResponseSchema = baseServerPayloadResponseSchema.extend({
  data: z.object({
    items: z.array(z.any()),
    meta: metaSchema,
  }),
});

export class PaginatedPayloadResponseDto<T = any> extends createZodDto(
  PaginatedPayloadResponseSchema,
) {
  data: {
    items: T[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemPerPages: number;
      totalPages: number;
      currentPage: number;
    };
  };
}
