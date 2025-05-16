import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const MB = 5;
const schemaOptions = {
  allowedFileTypes: ['image/png', 'image/jpeg', 'image/jpg'],
  maxFileSize: MB * 1024 * 1024,
};

export const validateImageSchema = z
  .custom<Express.Multer.File>((file) => !!file && typeof file === 'object')
  .refine((file) => schemaOptions.allowedFileTypes.includes(file.mimetype), {
    message: 'Only PNG, JPEG, or JPG images are allowed',
  })
  .refine((file) => file.size <= schemaOptions.maxFileSize, {
    message: `File must be less than ${
      schemaOptions.maxFileSize / (1024 * 1024)
    }MB`,
  });

export class ImageDto extends createZodDto(validateImageSchema) {}
