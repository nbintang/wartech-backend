import { Injectable } from '@nestjs/common';
import { SinglePayloadResponseDto } from '../commons/dtos/single-payload-response.dto';

@Injectable()
export class AppService {
  getHello(): SinglePayloadResponseDto {
    return {
      message: 'Hello World',
    };
  }
  postTest(): SinglePayloadResponseDto {
    return {
      message: 'Hello World',
    };
  }
}
