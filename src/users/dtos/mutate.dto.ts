import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from '../enums/role.enums';

const schemaOptions = {
  allowedFileTypes: ['image/png', 'image/jpeg', 'image/jpg'],
  maxFileSize: 5 * 1024 * 1024,
};

export const validateImageSchema = z
  .custom<Express.Multer.File>((file) => !!file && typeof file === 'object')
  .refine((file) => schemaOptions.allowedFileTypes.includes(file.mimetype), {
    message: 'Only PNG, JPEG, or JPG images are allowed',
  })
  .refine((file) => file.size <= schemaOptions.maxFileSize, {
    message: `File must be less than ${
      schemaOptions.maxFileSize / (1024 * 1024)
    }MB`,
  });

const baseUserSchema = z.object({
  name: z.string().min(6).max(100).trim(),
  role: z.nativeEnum(Role).optional(),
  email: z.string().email({ message: 'Invalid email' }),
  image: z.string().url({ message: 'Invalid URL' }).optional().nullable(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(60, { message: 'Password must be at most 60 characters' }),
});
export const createUserSchema = baseUserSchema.extend({
  accepted_terms: z.coerce.boolean().default(false),
});
export const updateUserSchema = baseUserSchema;
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class CreateUserDto extends createZodDto(createUserSchema) {}
