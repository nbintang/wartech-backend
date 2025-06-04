import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { RequiredFolder } from '../enums/folder.enum';

const queryFileDto = z.object({
  'image-url': z.string().url({ message: 'Invalid image url' }).optional(),
  folder: z
    .nativeEnum(RequiredFolder, {
      errorMap: () => ({
        message: 'folder must be either "users" or "articles"',
      }),
    })
    .optional(),
});

export class QueryFileDto extends createZodDto(queryFileDto) {}
