import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { basePayloadResponseSchema } from './payload-response.dto';

const PaginatedMetaSchema = z.object({
  totalItems: z.number(),
  itemCount: z.number(),
  itemPerPages: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
});

const PaginatedPayloadResponseSchema = basePayloadResponseSchema.extend({
  data: z.object({
    items: z.array(z.any()),
    meta: PaginatedMetaSchema,
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
