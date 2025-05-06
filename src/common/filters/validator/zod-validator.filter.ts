// filters/zod-validation-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const zodError = exception.getZodError(); // Native ZodError
    const flattened = zodError.flatten();

    response.status(400).json({
      status_code: 400,
      success: false,
      message: 'Validation faileds',
      test: 'ew',
      errors: zodError.errors, // full structured errors
      data: null,
    });
  }
}
