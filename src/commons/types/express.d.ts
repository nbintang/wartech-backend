// src/@types/express.d.ts
import 'express';

declare module 'express' {
  export interface User {
    sub: string;
    email: string;
    role: string;
    verified: boolean;
    iat: number;
    exp: number;
  }

  export interface Request {
    user?: User;
  }
}
