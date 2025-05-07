import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    console.log(verificationToken);
    return verificationToken;
  }
}
