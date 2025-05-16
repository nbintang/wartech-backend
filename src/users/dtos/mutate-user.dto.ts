import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from '../enums/role.enums';

const baseUserSchema = z.object({
  name: z.string().min(6).max(100).trim(),
  role: z.nativeEnum(Role).optional(),
  email: z.string().email({ message: 'Invalid email' }),
  image: z.string().url({ message: 'Invalid image url' }).optional(),
});
export const createUserSchema = baseUserSchema.extend({
  accepted_terms: z.coerce.boolean().default(false),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(60, { message: 'Password must be at most 60 characters' }),
});
export const updateUserSchema = baseUserSchema;
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class CreateUserDto extends createZodDto(createUserSchema) {}
