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
        const baseResponse = {
          statusCode: result?.statusCode ?? 200,
          success: result?.success ?? true,
          message: result?.message ?? 'Success',
        };

        if (
          'data' in result &&
          result.data !== null &&
          result.data !== undefined
        ) {
          return {
            ...baseResponse,
            data: result.data,
          };
        }

        // If result is raw value (not an object with message), wrap it
        if (!result?.message && result !== null && result !== undefined) {
          return {
            ...baseResponse,
            data: result,
          };
        }

        return baseResponse;
      }),
    );
  }
}
