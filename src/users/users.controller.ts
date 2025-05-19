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
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { QueryUserDto } from './dtos/query-user.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from './enums/role.enums';
import { Request, Response } from 'express';
import { SinglePayloadResponseDto } from 'src/common/dtos/single-payload-response.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UpdateUserDto } from './dtos/mutate-user.dto';
@UseGuards(AccessTokenGuard)
@Controller('/protected/users')
@SkipThrottle({ short: true, medium: true, long: true })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  async getAllUsers(@Query() query: QueryUserDto) {
    return await this.usersService.getAllusers(query);
  }
  @Get('/profile')
  async getMe(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<SinglePayloadResponseDto> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userId = request.user.sub;
    const user = await this.usersService.getUserById(userId, {
      role: true,
      password: true,
      acceptedTOS: true,
      emailVerifiedAt: true,
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
  @UseGuards(RoleGuard)
  @Patch(':id')
  @SkipThrottle({ medium: false })
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
  @UseGuards(RoleGuard)
  @Delete(':id')
  async deleteUserById(@Param('id') id: string) {
    return await this.usersService.deleteUserById(id);
  }
}
