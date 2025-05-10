import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from '../enums/role.enums';
import { BaseQuerySchema } from 'src/common/dtos/base-query.dto';

const QueryUserSchema = BaseQuerySchema.extend({
  name: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

export class QueryUserDto extends createZodDto(QueryUserSchema) {}
