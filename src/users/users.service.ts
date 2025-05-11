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
      omit: {
        password: true,
        acceptedTOS: true,
        emailVerifiedAt: true,
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
      include: { verificationToken: true },
    });
  }

  async updateUserById({ id }: { id: string }, data: Prisma.UserUpdateInput) {
    return await this.prisma.user.update({
      where: { id },
      data,
      omit: {
        password: true,
        acceptedTOS: true,
      },
    });
  }

  async getLevel1andLevel2Users(id: string) {
    return await this.prisma.user.findUnique({
      where: { id, NOT: { role: 'ADMIN' } },
      omit: {
        password: true,
        acceptedTOS: true,
      },
    });
  }
  async getUserById(id: string, except?: Prisma.UserOmit) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: except,
    });
    const { createdAt, updatedAt, ...rest } = user;
    return {
      ...rest,
      created_at: createdAt,
      updated_at: updatedAt,
    };
  }

  async deleteUserById(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }
}
