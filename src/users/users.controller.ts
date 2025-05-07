import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Controller('/protected/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAllusers();
    return users;
  }
}
