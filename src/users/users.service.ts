import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    const newUser = await this.prisma.user.create({
      data,
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
        role: true,
        verified: true,
        emailVerifiedAt: true,
      },
    });
  }

  async updateVerifiedUser(
    { id, email }: { id: string; email: string },
    data: Prisma.UserUpdateInput,
  ) {
    const user = await this.prisma.user.update({
      where: { id, email },
      data,
    });
    return user;
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
