import { applyDecorators, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../guards/access-token.guard';
import { RoleGuard } from '../guards/role.guard';
import { EmailVerifiedGuard } from '../guards/email-verified.guard';
import { Roles } from './roles.decorator';
import { Role } from '../../users/enums/role.enums';

export function RequiredAuth(...roles: Role[]) {
  return applyDecorators(
    UseGuards(AccessTokenGuard, RoleGuard, EmailVerifiedGuard),
    Roles(...roles),
  );
}
