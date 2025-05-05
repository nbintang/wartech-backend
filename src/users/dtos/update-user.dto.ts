import { UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  accepted_terms: boolean;

  @IsString()
  name: string;

  @IsString()
  password;
}
