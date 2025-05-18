import { PartialType } from '@nestjs/mapped-types';
import { LikeDto } from './mutate-like.dto';

export class UpdateLikeDto extends PartialType(LikeDto) {}
