import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from '../enums/role.enums';
import { baseQueryRequestSchema } from 'src/common/dtos/base-query.dto';

const queryUserSchema = baseQueryRequestSchema.extend({
  name: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
});

export class QueryUserDto extends createZodDto(queryUserSchema) {}
