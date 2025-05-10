import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryUserDto } from './dtos/query-user.dto';

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
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;
    const take = limit;
    const dynamicSearch: Prisma.UserWhereInput = {
      ...(query.name && {
        name: {
          contains: query.name,
          mode: 'insensitive',
        } as Prisma.StringFilter,
      }),
      ...(query.role && {
        role: query.role,
      }),
    };

    const users = this.prisma.user.findMany({
      where: dynamicSearch,
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
        verified: true,
        emailVerifiedAt: true,
      },
      skip,
      take,
    });

    const totalUsers = this.prisma.user.count({
      where: dynamicSearch,
    });
    return {
      users,
      totalUsers,
    };
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
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        role: true,
      },
    });
  }
}
