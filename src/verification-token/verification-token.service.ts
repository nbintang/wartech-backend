import { Injectable } from '@nestjs/common';
import { Prisma, VerificationType } from '@prisma/client';
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

  async getVerificationTokenByUserId(userId: string) {
    const verificationToken = await this.prisma.verificationToken.findFirst({
      where: {
        userId,
        type: 'EMAIL_VERIFICATION',
      },
    });
    return verificationToken;
  }
  async getVerificationTokenByUserIdAndType(
    userId: string,
    type: VerificationType,
  ) {
    const verificationtoken = await this.prisma.verificationToken.findFirst({
      where: {
        userId,
        type,
        expiresAt: { gt: new Date() }, // to check if token is expired
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


  async deleteTokensByUserAndType(
    userId: string,
    type: VerificationType,
  ): Promise<void> {
    await this.prisma.verificationToken.deleteMany({
      where: {
        userId,
        type,
      },
    });
  }
}
