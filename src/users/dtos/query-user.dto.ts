import { createZodDto } from 'nestjs-zod';
import { baseQueryRequestSchema } from 'src/common/dtos/base-query-request.schema';
import { baseUserSchema } from './user.schema';
const baseQueryUserSchema = baseUserSchema.omit({
  image: true,
  email: true,
});
const queryUserSchema = baseQueryRequestSchema.extend(
  baseQueryUserSchema.shape,
);
export class QueryUserDto extends createZodDto(queryUserSchema) {}
