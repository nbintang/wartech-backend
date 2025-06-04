import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const verifyEmailFromUrl = z.object({
  token: z.string().min(10),
});

export const resetPasswordSchema = verifyEmailFromUrl.extend({
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});
export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
export class VerifyEmailFromUrlDto extends createZodDto(verifyEmailFromUrl) {}
