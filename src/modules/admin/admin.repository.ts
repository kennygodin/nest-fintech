import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import {
  TransactionStatus,
  TransactionType,
  UserStatus,
  WalletStatus,
} from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

export type SearchTransactionsFilters = {
  reference?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async searchWallets(
    filters: {
      status?: WalletStatus;
      email?: string;
    },
    skip: number,
    take: number,
  ) {
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.email && { user: { email: { contains: filters.email } } }),
    };

    const [wallets, total] = await this.prisma.$transaction([
      this.prisma.wallet.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),

      this.prisma.wallet.count({ where }),
    ]);

    return {
      wallets,
      total,
    };
  }

  async searchTransactions(
    filters: SearchTransactionsFilters,
    skip: number,
    take: number,
  ) {
    const where: Prisma.TransactionWhereInput = {
      ...(filters.reference && { reference: { contains: filters.reference } }),
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...((filters.startDate || filters.endDate) && {
        createdAt: {
          ...(filters.startDate && { gte: new Date(filters.startDate) }),
          ...(filters.endDate && { lte: new Date(filters.endDate) }),
        },
      }),
    };

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),

      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
    };
  }

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
