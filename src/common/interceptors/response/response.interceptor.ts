import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { QueryResponseDto } from '../../dtos/query-response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    return next.handle().pipe(
      map((result) => {
        const { data, message } = result?.message
          ? result
          : { data: result, message: 'Success' };
        return {
          status_code: response.statusCode,
          success: true,
          message,
          data,
        } as QueryResponseDto;
      }),
    );
  }
}
