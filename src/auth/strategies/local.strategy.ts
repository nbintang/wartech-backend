import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LocalSigninSchema } from '../dto/auth.dto';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string) {
    const validatedUser = LocalSigninSchema.safeParse({ email, password });
    if (validatedUser.error instanceof ZodError)
      throw new ZodValidationException(validatedUser.error);
    const user = await this.authService.signIn({ email, password });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}
