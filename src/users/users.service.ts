import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { QueryUserDto } from './dtos/query-user.dto';
import { Prisma, User } from '@prisma/client';
import { Role } from './enums/role.enums';
import { PaginatedPayloadResponseDto } from '../common/dtos/paginated-payload-response.dto';

type UserPayload<T extends Prisma.UserDefaultArgs = object> =
  Prisma.UserGetPayload<T>;

type SafeUser = UserPayload<{
  omit: { password: true; acceptedTOS: true; emailVerifiedAt: true };
}>;

@Injectable()
export class UsersService {
  constructor(private db: PrismaService) {}

  async createUser(
    data: Prisma.UserCreateInput,
  ): Promise<UserPayload<{ select: { id: true; email: true; name: true } }>> {
    const newUser = await this.db.user.create({
      data,
      select: { id: true, email: true, name: true },
    });
    return newUser;
  }

  async getAllusers(
    query: QueryUserDto,
  ): Promise<PaginatedPayloadResponseDto<SafeUser>> {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;
    const take = limit;
    const dynamicSearch: Prisma.UserWhereInput = {
      ...(query.name && { name: { contains: query.name } }),
      ...(query.role && { role: query.role }),
    };
    const users = await this.db.user.findMany({
      where: {
        ...dynamicSearch,
        NOT: { role: Role.ADMIN },
      },
      omit: {
        password: true,
        acceptedTOS: true,
        emailVerifiedAt: true,
      },
      skip,
      take,
    });
    const usersCount = await this.db.user.count({ where: dynamicSearch });
    const itemCount = users.length;
    const totalPages = Math.ceil(usersCount / limit);
    return {
      data: {
        items: users,
        meta: {
          currentPage: page,
          itemPerPages: limit,
          itemCount,
          totalItems: usersCount,
          totalPages,
        },
      },
    };
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async updateUserById(
    { id }: { id: string },
    data: Prisma.UserUpdateInput,
  ): Promise<SafeUser> {
    return await this.db.user.update({
      where: { id },
      data,
      omit: {
        acceptedTOS: true,
        password: true,
        emailVerifiedAt: true,
      },
    });
  }

  async getLevel1andLevel2Users(id: string): Promise<SafeUser> {
    return await this.db.user.findUnique({
      where: { id, NOT: { role: 'ADMIN' } },
      omit: {
        password: true,
        acceptedTOS: true,
        emailVerifiedAt: true,
      },
    });
  }
  async getUserById(
    id: string,
    except?: Prisma.UserOmit,
  ): Promise<UserPayload<{ omit: Prisma.UserOmit }>> {
    const user = await this.db.user.findUnique({
      where: { id },
      omit: except,
    });
    return user;
  }

  async changeUserVerifiedStatus(id: string) {
    return await this.db.user.update({
      where: { id },
      data: { verified: true, emailVerifiedAt: new Date() },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async deleteUserById(id: string) {
    await this.db.user.delete({ where: { id, NOT: { role: 'ADMIN' } } });
    return {
      message: `User deleted successfully`,
    };
  }
}
