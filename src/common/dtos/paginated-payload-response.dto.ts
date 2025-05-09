import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const PaginatedMetaSchema = z.object({
  total_items: z.number(),
  item_count: z.number(),
  item_per_page: z.number(),
  total_pages: z.number(),
  current_page: z.number(),
});

const PaginatedPayloadResponseSchema = z.object({
  data: z.object({
    items: z.array(z.any()),
    meta: PaginatedMetaSchema,
  }),
});

export class PaginatedPayloadResponseDto extends createZodDto(
  PaginatedPayloadResponseSchema,
) {}
