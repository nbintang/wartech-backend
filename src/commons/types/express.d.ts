import { UserJwtPayload } from '../../modules/auth/strategies/access-token.strategy';
import 'express';
declare module 'express' {
  export interface Request {
    user?: UserJwtPayload;
  }
}
