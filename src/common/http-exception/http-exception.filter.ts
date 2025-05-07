import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryResponseDto } from 'src/common/dtos/query-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response<QueryResponseDto>>();
    if (exception instanceof UnauthorizedException) {
      return response.status(401).json({
        status_code: 401,
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

    response.status(status).json({
      status_code: status,
      success: false,
      message,
    });
  }
}
