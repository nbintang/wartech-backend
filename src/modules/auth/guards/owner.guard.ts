import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../../../commons/prisma/prisma.service';
import { IS_OWNER_KEY } from '../decorators/is-owner.decorator';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: PrismaService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const model = this.reflector.get<string>(
      IS_OWNER_KEY,
      context.getHandler(),
    );
    if (!model) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const paramId = request.params.id;
    if (!user || !paramId)
      throw new ForbiddenException('Missing user or param');

    const data = this.db[model].findUnique({
      where: { id: paramId },
      select: { userId: true },
    });
    if (!data) throw new ForbiddenException(`${model} not found`);
    if (data.user.id !== user.sub && user.role !== 'ADMIN') {
      throw new ForbiddenException(`You are not the owner of this ${model}`);
    }
    return true;
  }
}
