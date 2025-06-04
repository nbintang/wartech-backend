import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { QueryUserDto } from './dtos/query-user.dto';
import { minutes, SkipThrottle, Throttle } from '@nestjs/throttler';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './enums/role.enums';
import { Request, Response } from 'express';
import { SinglePayloadResponseDto } from '../../commons/dtos/single-payload-response.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { UpdateUserDto } from './dtos/mutate-user.dto';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
@UseGuards(AccessTokenGuard)
@Controller('/protected/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @SkipThrottle({ short: true, medium: true, long: true })
  async getAllUsers(@Query() query: QueryUserDto) {
    return await this.usersService.getAllusers(query);
  }
  @Get('/profile')
  @SkipThrottle({ short: true, medium: true, long: true })
  async getMe(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = request.user.sub;
    const user = await this.usersService.getUserById(userId, {
      id: true,
      email: true,
      name: true,
      verified: true,
      emailVerifiedAt: true,
      image: true,
    });
    return {
      message: `${user.name} fetched successfully`,
      data: user,
    };
  }
  @Get(':id')
  async getUserById(
    @Param('id') id: string,
  ): Promise<SinglePayloadResponseDto> {
    const user = await this.usersService.getLevel1andLevel2Users(id);
    if (!user) throw new NotFoundException('User Not Found');
    return {
      message: `${user.name} fetched successfully`,
      data: user,
    };
  }

  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(RoleGuard, EmailVerifiedGuard)
  @Patch(':id')
  @Throttle({ medium: { ttl: minutes(1), limit: 10 } })
  async updateProfile(@Param('id') id: string, @Body() body: UpdateUserDto) {
    try {
      const user = await this.usersService.updateUserById({ id }, body);
      return {
        message: `${user.name} updated successfully`,
        data: user,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something Went Wrong',
        error.status || 500,
      );
    }
  }
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard, EmailVerifiedGuard)
  @SkipThrottle({ short: true, medium: true })
  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    return await this.usersService.deleteUserById(id);
  }
}
