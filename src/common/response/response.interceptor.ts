import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ServerPayloadResponseDto } from '../dtos/server-payload-response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((result): ServerPayloadResponseDto => {
        const { data, message, statusCode, success } = result?.message
          ? result
          : {
              data: result,
              message: 'Success',
              statusCode: 200,
              success: true,
            };
        return {
          statusCode,
          success,
          message,
          data,
        };
      }),
    );
  }
}
