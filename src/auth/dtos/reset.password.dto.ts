import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid id' }),
  token: z.string().min(10),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
