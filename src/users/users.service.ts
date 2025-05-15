import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { QueryUserDto } from './dtos/query-user.dto';
import { Prisma } from 'prisma/generated';
import { Role } from './enums/role.enums';

@Injectable()
export class UsersService {
  constructor(private db: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    const newUser = await this.db.user.create({
      data,
      select: { id: true, email: true, name: true },
    });
    return newUser;
  }

  async getAllusers(query: QueryUserDto) {
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
      users,
      currrentPage: page,
      itemPerPages: limit,
      itemCount,
      totalItems: usersCount,
      totalPages,
    };
  }

  async getUserByEmail(email: string) {
    return this.db.user.findUnique({
      where: {
        email,
      },
      include: {
        verificationToken: {
          where: { expiresAt: { gt: new Date() } },
        },
      },
    });
  }

  async updateUserById({ id }: { id: string }, data: Prisma.UserUpdateInput) {
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

  async getLevel1andLevel2Users(id: string) {
    return await this.db.user.findUnique({
      where: { id, NOT: { role: 'ADMIN' } },
      omit: {
        password: true,
        acceptedTOS: true,
      },
    });
  }
  async getUserById(id: string, except?: Prisma.UserOmit) {
    const user = await this.db.user.findUnique({
      where: { id },
      omit: except,
    });
    return user;
  }

  async deleteUserById(id: string) {
    return await this.db.user.delete({ where: { id } });
  }
}
