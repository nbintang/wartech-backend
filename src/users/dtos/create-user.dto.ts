import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserRole } from '../enums/role.enums';

const CreateUserSchema = z.object({
  name: z.string().min(6).max(100).trim(),
  role: z.nativeEnum(UserRole).optional(),
  accepted_terms: z
    .boolean({
      message: 'You must accept the terms and conditions',
    })
    .default(false),
  email: z.string().email({ message: 'Invalid email' }),
  image: z.string().optional().nullable(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(60, { message: 'Password must be at most 60 characters' }),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
