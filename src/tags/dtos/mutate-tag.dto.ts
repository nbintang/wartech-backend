import { createZodDto } from 'nestjs-zod';
import slugify from '../../common/slugify';
import { z } from 'zod';

const tagInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name is too long')
    .trim(),
});

const tagSchema = tagInputSchema.transform((data) => ({
  ...data,
  slug: slugify(data.name),
}));

export class TagDto extends createZodDto(tagSchema) {}
