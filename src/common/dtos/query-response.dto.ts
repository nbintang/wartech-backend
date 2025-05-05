import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryResponseDto {
  @IsNumber()
  status_code: number;

  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;

  @IsOptional()
  data: any | any[] | null | undefined;
}
