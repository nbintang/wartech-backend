import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { QueryUserDto } from './dtos/query-user.dto';
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from './enums/role.enums';
@SkipThrottle()
@UseGuards(AccessTokenGuard)
@Controller('/protected/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  async getAllUsers(
    @Query() query: QueryUserDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const currrentPage = +(query.page ?? 1);
    const itemPerPages = +(query.limit ?? 10);
    const { users, usersCount } = await this.usersService.getAllusers({
      ...query,
      page: currrentPage,
      limit: itemPerPages,
    });
    const itemCount = users.length;
    const totalItems = usersCount;
    const totalPages = Math.ceil(totalItems / itemPerPages);
    return {
      message: 'Users fetched successfully',
      data: {
        items: users,
        meta: {
          item_count: itemCount,
          item_per_page: itemPerPages,
          total_items: totalItems,
          total_pages: totalPages,
          current_page: currrentPage,
        },
      },
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getLevel1andLevel2Users(id);
    if (!user) throw new NotFoundException('User Not Found');
    return user;
  }

  @Get('/profile')
  async getProfile() {}
}
