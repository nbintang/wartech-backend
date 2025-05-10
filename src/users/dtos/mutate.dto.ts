import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from '../enums/role.enums';

const baseUserSchema = z.object({
  name: z.string().min(6).max(100).trim(),
  role: z.nativeEnum(Role).optional(),
  accepted_terms: z.boolean({
    message: 'You must accept the terms and conditions',
  }),
  email: z.string().email({ message: 'Invalid email' }),
  image: z.string().optional().nullable(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(60, { message: 'Password must be at most 60 characters' }),
});
const createUserSchema = baseUserSchema.extend({
  accepted_terms: baseUserSchema.shape.accepted_terms.default(true),
});
const updateUserSchema = baseUserSchema;
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class CreateUserDto extends createZodDto(createUserSchema) {}
