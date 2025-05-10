import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Role } from '../enums/role.enums';

const QueryUserSchema = z.object({
  sort: z.string().optional(),
  order: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  name: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
});

export class QueryUserDto extends createZodDto(QueryUserSchema) {}
