import {
  ArgumentsHost,
  Catch,
  HttpException,
  Inject,
  LoggerService,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ZodValidationException } from 'nestjs-zod';
import { QueryResponseDto } from '../dtos/query-response.dto';

@Catch(ZodValidationException, HttpException)
export class ZodExceptionFilter extends BaseExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  catch(
    exception: HttpException | ZodValidationException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response<QueryResponseDto>>();
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      this.logger.error(
        `ZodValidationException on ${request.method} ${request.url}: ${zodError.message}`,
      );
      return response.status(400).json({
        status_code: 400,
        success: false,
        error_messages: zodError.errors.map(({ message, path }) => ({
          field: path.join('.'),
          message,
        })),
      });
    }
    super.catch(exception, host);
  }
}
