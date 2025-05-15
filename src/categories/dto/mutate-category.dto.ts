import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-word chars (except hyphens)
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, '') // Trim hyphens from end
    .trim();

const categoryInputSchema = z.object({
  name: z.string().max(50).trim().min(1, 'Name is required'),
  description: z.string().max(255).trim().optional(),
});

// Transform schema (adds slug)
const categorySchema = categoryInputSchema.transform((data) => ({
  ...data,
  slug: slugify(data.name),
}));

export class CategoryDto extends createZodDto(categorySchema) {}
