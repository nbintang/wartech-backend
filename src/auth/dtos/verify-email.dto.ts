import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid id' }),
  token: z.string().min(10),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}
