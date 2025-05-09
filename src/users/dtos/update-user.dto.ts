import { createZodDto } from 'nestjs-zod';
import { Role } from 'src/users/enums/role.enums';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  name: z.string().min(3).max(100).trim(), //varchar 100
  role: z.nativeEnum(Role).optional(),
  accepted_terms: z.boolean({
    message: 'You must accept the terms and conditions',
  }),
  email: z.string().email({ message: 'Invalid email' }),
  image: z.string().optional(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(60, { message: 'Password must be at most 60 characters' }),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
