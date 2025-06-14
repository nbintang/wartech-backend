import { createZodDto } from 'nestjs-zod';
import slugify from '../../../commons/slugify';
import { z } from 'zod';

const tagInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name is too long')
    .trim()
    .optional(), // it's optional here
  names: z
    .array(
      z.string().min(1, 'Name is required').max(50, 'Name is too long').trim(),
    )
    .optional()
    .refine((names) => !names || new Set(names).size === names.length, {
      message: 'Duplicate names are not allowed in the array',
    }),
});

// Transform safely:
const tagSchema = tagInputSchema.transform((data) => ({
  ...data,
  slug: data.name ? slugify(data.name) : undefined,
  slugs: data.names?.map((name) => slugify(name)) ?? [],
}));

export class TagDto extends createZodDto(tagSchema) {}
