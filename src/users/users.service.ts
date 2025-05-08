import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

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
  async getAllusers() {
    return this.prisma.user.findMany();
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
