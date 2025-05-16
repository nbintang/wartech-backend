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
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ZodValidationException } from 'nestjs-zod';
import { ServerPayloadResponseDto } from 'src/common/dtos/server-payload-response.dto';

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
    const response = ctx.getResponse<Response<ServerPayloadResponseDto>>();
    const request = ctx.getRequest<Request>();
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError();
      this.logger.error(
        `ZodValidationException on ${request.method} ${request.url}: ${zodError.message}`,
      );
      this.logger.error(
        `ZodValidationException on ${request.method} ${request.url}: ${zodError.message}`,
      );
      return response.status(400).json({
        statusCode: 400,
        success: false,
        errorMessages: zodError.errors.map(({ message, path }) => ({
          field: path.join('.'),
          message,
        })),
      });
    }
    if (exception instanceof UnauthorizedException) {
      return response.status(401).json({
        statusCode: 401,
        success: false,
        message: exception.message || 'Unauthorized',
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

    if (exception instanceof HttpException)
      this.logger.error(
        `${request.method} ${request.url} ${status} ${message}`,
      );
    response.status(status).json({
      statusCode: status,
      success: false,
      message,
    });
  }
}
