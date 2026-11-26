import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async markPasswordResetTokenUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
  async findPasswordResetTokenByHash(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
    });
  }

  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async createOtp(userId: string, otpHash: string, expiresAt: Date) {
    return this.prisma.otp.create({
      data: {
        userId,
        otpHash,
        expiresAt,
      },
    });
  }

  async findOtpByHash(otpHash: string) {
    return this.prisma.otp.findFirst({
      where: { otpHash },
    });
  }

  async markOtpUsed(id: string) {
    return this.prisma.otp.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async findRefreshTokenByHash(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({ where: { tokenHash } });
  }

  async revokeRefreshToken(id: string) {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokensForUser(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
