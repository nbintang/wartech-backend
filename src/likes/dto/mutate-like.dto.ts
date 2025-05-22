import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const likeSchema = z.object({
  userId: z.string().uuid().optional(),
  articleId: z.string().uuid(),
});

export class LikeDto extends createZodDto(likeSchema) {}
