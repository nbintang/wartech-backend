import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
export const commentSchema = z.object({
  content: z.string().max(1200),
  userId: z.string().uuid().optional(), // 👈 optional
  articleId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
});

export class CommentDto extends createZodDto(commentSchema) {}
