import { SetMetadata } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const IS_OWNER_KEY = 'isOwner';
type ModelName = keyof PrismaClient;
export const IsOwner = (model: ModelName) => SetMetadata(IS_OWNER_KEY, model);
