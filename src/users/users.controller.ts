import {
  BadRequestException,
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
import { PaginatedPayloadResponseDto } from 'src/common/dtos/paginated-payload-response.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from './enums/role.enums';
import { Request, Response } from 'express';
import { PayloadResponseDto } from 'src/common/dtos/payload-response.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UpdateUserDto } from './dtos/mutate.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@UseGuards(AccessTokenGuard)
@Controller('/protected/users')
@SkipThrottle({ short: true, medium: true, long: true })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Get()
  async getAllUsers(
    @Query() query: QueryUserDto,
  ): Promise<PaginatedPayloadResponseDto> {
    const {
      users,
      currrentPage,
      itemPerPages,
      itemCount,
      totalPages,
      totalItems,
    } = await this.usersService.getAllusers(query);
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
  @Get('/profile')
  async getMe(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<PayloadResponseDto> {
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
  async getUserById(@Param('id') id: string): Promise<PayloadResponseDto> {
    const user = await this.usersService.getLevel1andLevel2Users(id);
    console.log(user);
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
  async updateProfile(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<PayloadResponseDto> {
    try {
      if (body.image) {
        body.image = await this.handleImageUpdate(id, body.image);
      }
      const user = await this.usersService.updateUserById({ id }, body);
      return {
        message: `${user.name} updated successfully`,
        data: user,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message || 'Something Went Wrong',
        error.status || 500,
      );
    }
  }
  @Roles(Role.ADMIN)
  @UseGuards(RoleGuard)
  @Delete(':id')
  async deleteUserById(@Param('id') id: string): Promise<PayloadResponseDto> {
    const user = await this.usersService.deleteUserById(id);
    if (!user) throw new NotFoundException('User Not Found');
    return {
      message: `${user.name} deleted successfully`,
    };
  }

  private async handleImageUpdate(
    id: string,
    base64Image: string,
  ): Promise<string> {
    const { image: currentImage } = await this.usersService.getUserById(id);
    const public_id = this.cloudinaryService.extractPublicId(currentImage);
    if (!public_id)
      throw new BadRequestException("File doesn't match the schema");
    const { secure_url } = await this.cloudinaryService.uploadFile({
      base64: base64Image,
      public_id,
    });
    return secure_url;
  }
}
