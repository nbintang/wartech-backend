import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from '../../../common/dtos/base-query-request.schema';
import { z } from 'zod';
import { Role } from '../enums/role.enums';
const baseQueryUserSchema = z.object({
  name: z.string().optional(),
  role: z
    .string()
    .transform((val) => val.toUpperCase() as keyof typeof Role)
    .refine((val) => Object.values(Role).includes(val as Role), {
      message: 'Invalid role',
    })
    .optional(),
});
const queryUserSchema = baseQueryRequestSchema.extend(
  baseQueryUserSchema.shape,
);
export class QueryUserDto extends createZodDto(queryUserSchema) {}
