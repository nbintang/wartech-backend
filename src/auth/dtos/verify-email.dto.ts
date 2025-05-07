import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  token: z.coerce
    .string()
    .min(6, { message: 'Token must be at least 6 characters' }),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}
