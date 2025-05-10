import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { QueryUserDto } from './dtos/query-user.dto';

@UseGuards(AccessTokenGuard)
@Controller('/protected/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers(@Query() query: QueryUserDto) {
    const users = await this.usersService.getAllusers(query);
    return users;
  }
}
