import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { basePayloadResponseSchema } from './payload-response.dto';

const PaginatedMetaSchema = z.object({
  total_items: z.number(),
  item_count: z.number(),
  item_per_page: z.number(),
  total_pages: z.number(),
  current_page: z.number(),
});

const PaginatedPayloadResponseSchema = basePayloadResponseSchema.extend({
  data: z.object({
    items: z.array(z.any()),
    meta: PaginatedMetaSchema,
  }),
});

export class PaginatedPayloadResponseDto extends createZodDto(
  PaginatedPayloadResponseSchema,
) {}
