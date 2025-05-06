import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryResponseDto } from '../../dtos/query-response.dto';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError(); // Native ZodError
      return response.status(400).json({
        status_code: 400,
        success: false,
        message: 'Validation failed',
        data: null,
        errors: zodError.errors.map(({ message, path }) => ({
          field: path.join('.'),
          message,
        })),
      });
    }
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof responseMessage === 'string'
        ? responseMessage
        : responseMessage['message'] || 'Internal server error';

    response.status(status).json({
      status_code: status,
      success: false,
      message,
      data: null,
    } as QueryResponseDto);
  }
}
