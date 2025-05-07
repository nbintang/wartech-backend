import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  token: z.coerce
    .string()
    .min(6, { message: 'Token must be at least 6 characters' }),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
