import { z } from 'zod';
import { Role } from '../enums/role.enums';

export const baseUserSchema = z.object({
  name: z.string().min(6).max(100).trim(),
  role: z.nativeEnum(Role).optional(),
  email: z.string().email({ message: 'Invalid email' }),
  image: z.string().url({ message: 'Invalid image url' }).optional(),
  acceptedTOS: z.coerce.boolean().default(false),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(60, { message: 'Password must be at most 60 characters' }),
});
