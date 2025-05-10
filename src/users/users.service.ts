import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { QueryUserDto } from './dtos/query-user.dto';
import { Prisma } from 'prisma/generated';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    const newUser = await this.prisma.user.create({
      data,
      select: { id: true, email: true, name: true },
    });
    return newUser;
  }

  async getAllusers(query: QueryUserDto) {
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;
    const dynamicSearch: Prisma.UserWhereInput = {
      ...(query.name && { name: { contains: query.name } }),
      ...(query.role && { role: query.role }),
    };
    const users = await this.prisma.user.findMany({
      where: {
        ...dynamicSearch,
        NOT: { role: 'ADMIN' },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verified: true,
      },
      skip,
      take,
    });
    const usersCount = await this.prisma.user.count({ where: dynamicSearch });
    return { users, usersCount };
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        verified: true,
        emailVerifiedAt: true,
      },
    });
  }

  async updateVerifiedUser(
    { id }: { id: string },
    data: Prisma.UserUpdateInput,
  ) {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
      },
    });
    return user;
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
    });
  }
}
