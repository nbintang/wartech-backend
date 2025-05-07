import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  token: z.coerce.string(),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}
