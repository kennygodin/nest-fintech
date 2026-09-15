import { Injectable } from '@nestjs/common';
import { UserStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, activeUsers, walletBalanceSum, transactionsByStatus] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.user.count({
          where: { status: UserStatus.active },
        }),
        this.prisma.wallet.aggregate({
          _sum: { balance: true },
        }),
        this.prisma.transaction.groupBy({
          by: ['status'],
          _count: { _all: true },
          _sum: { amount: true },
          orderBy: { status: 'asc' },
        }),
      ]);

    return { totalUsers, activeUsers, walletBalanceSum, transactionsByStatus };
  }
}
