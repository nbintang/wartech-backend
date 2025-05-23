import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @SkipThrottle({ short: true, medium: true, long: true })
  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
