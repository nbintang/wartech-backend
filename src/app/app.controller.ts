import { Controller, Get, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @SkipThrottle({ short: true, medium: true, long: true })
  @Get()
  getHello() {
    return this.appService.getHello();
  }
  @Post()
  postTest() {
    return this.appService.getHello();
  }
}
