import { Injectable } from '@nestjs/common';
import { Prisma, VerificationType } from 'prisma/generated';
import { PrismaService } from 'src/prisma/prisma.service';

type VerificationToken<T extends Prisma.VerificationTokenDefaultArgs = object> =
  Prisma.VerificationTokenGetPayload<T>;
@Injectable()
export class VerificationTokenService {
  constructor(private db: PrismaService) {}
  async createVerificationToken(
    data: Prisma.VerificationTokenCreateInput,
  ): Promise<VerificationToken> {
    const verificationToken = await this.db.verificationToken.create({
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
  }): Promise<
    VerificationToken<{
      select: {
        id: true;
        userId: true;
        token: true;
        expiresAt: true;
      };
    }>
  > {
    const verificationtoken = await this.db.verificationToken.findFirst({
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
  }): Promise<number> {
    const tokens = await this.db.verificationToken.deleteMany({
      where: {
        userId,
        type,
      },
    });
    return tokens.count;
  }

  async deleteTokensByUserId(userId: string): Promise<Prisma.BatchPayload> {
    return await this.db.verificationToken.deleteMany({ where: { userId } });
  }
}
