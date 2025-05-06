import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { QueryResponseDto } from 'src/common/dtos/query-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | HttpException
      | ZodValidationException
      | ZodSerializationException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response<QueryResponseDto>>();
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      return response.status(400).json({
        status_code: 400,
        success: false,
        messages: zodError.errors.map(({ message, path }) => ({
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
    });
  }
}
