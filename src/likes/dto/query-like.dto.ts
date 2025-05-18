import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const queryLikeSchema = z.object({
  'article-slug': z.string().optional(),
});

export class QueryLikeDto extends createZodDto(queryLikeSchema) {}
