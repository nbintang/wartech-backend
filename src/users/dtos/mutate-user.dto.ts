import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from '../enums/role.enums';

const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const base64ImageRegex = /^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+/=]+$/;

// Zod Schema
export const ProfileUserBase64ImageSchema = z
  .string()
  .regex(base64ImageRegex, {
    message: 'Invalid base64 image format',
  })
  .refine(
    (base64) => {
      const base64Str = base64.split(',')[1] || ''; // Get Base64 data only
      const sizeInBytes =
        (base64Str.length * 3) / 4 -
        (base64Str.endsWith('==') ? 2 : base64Str.endsWith('=') ? 1 : 0);
      return sizeInBytes <= MAX_SIZE_BYTES;
    },
    {
      message: `Image exceeds maximum size of ${MAX_SIZE_BYTES / (1024 * 1024)} MB`,
    },
  );

const baseUserSchema = z.object({
  name: z.string().min(6).max(100).trim(),
  role: z.nativeEnum(Role).optional(),
  email: z.string().email({ message: 'Invalid email' }),
  image: ProfileUserBase64ImageSchema.optional(),
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
