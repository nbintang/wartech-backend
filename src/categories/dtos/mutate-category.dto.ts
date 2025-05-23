import { createZodDto } from 'nestjs-zod';
import slugify from '../../common/slugify';
import { z } from 'zod';

const categoryInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50).trim(),
  description: z.string().max(255).trim().optional().nullable(),
});

// Transform schema (adds slug)
const categorySchema = categoryInputSchema.transform((data) => ({
  ...data,
  slug: slugify(data.name),
}));

export class CategoryDto extends createZodDto(categorySchema) {}
