import { Injectable } from '@nestjs/common';
import { Prisma, VerificationType } from 'prisma/generated';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VerificationTokenService {
  constructor(private prisma: PrismaService) {}
  async createVerificationToken(data: Prisma.VerificationTokenCreateInput) {
    const verificationToken = await this.prisma.verificationToken.create({
      data,
    });
    return verificationToken;
  }

  async getVerificationTokenByUserIdAndType({
    userId,
    type,
  }: {
    userId: string;
    type: VerificationType;
  }) {
    const verificationtoken = await this.prisma.verificationToken.findFirst({
      where: {
        userId,
        type,
        expiresAt: { gt: new Date() }, // to get tokens that are not expired
      },
      select: {
        id: true,
        userId: true,
        token: true,
        expiresAt: true,
      },
    });
    return verificationtoken;
  }

  async deleteTokensByUserAndType({
    userId,
    type,
  }: {
    userId: string;
    type: VerificationType;
  }): Promise<Prisma.BatchPayload> {
    return await this.prisma.verificationToken.deleteMany({
      where: {
        userId,
        type,
      },
    });
  }

  async deleteTokensByUserId(userId: string): Promise<void> {
    await this.prisma.verificationToken.deleteMany({ where: { userId } });
  }
}
