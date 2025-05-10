import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const signinSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});
export class LocalSigninDto extends createZodDto(signinSchema) {}
