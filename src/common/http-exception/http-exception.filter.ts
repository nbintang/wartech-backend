import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ZodValidationException } from 'nestjs-zod';
import { DefaultSystemQueryResponseDto } from 'src/common/dtos/default-system-query-response.dto';

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }
  catch(
    exception: HttpException | UnauthorizedException | ZodValidationException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response<DefaultSystemQueryResponseDto>>();
    const request = ctx.getRequest();
    if (exception instanceof UnauthorizedException) {
      return response.status(401).json({
        status_code: 401,
        success: false,
        message: exception.message || 'Unauthorized',
      });
    }

    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      this.logger.error(
        `ZodValidationException on ${request.method} ${request.url}: ${zodError.message}`,
      );
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

    super.catch(exception, host);
  }
}
