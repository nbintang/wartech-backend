import { createZodDto } from 'nestjs-zod';
import { baseUserSchema } from './user.schema';

export const createUserSchema = baseUserSchema;
export const updateUserSchema = baseUserSchema.omit({
  acceptedTOS: true,
  password: true,
});
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class CreateUserDto extends createZodDto(createUserSchema) {}
