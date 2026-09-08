import { Injectable } from '@nestjs/common';
import {
  LedgerEntryType,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTransactionByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.transaction.findUnique({ where: { idempotencyKey } });
  }

  async createDeposit(
    walletId: string,
    amount: number,
    description: string,
    idempotencyKey: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.deposit,
          status: TransactionStatus.success,
          amount,
          description,
          idempotencyKey,
          recipientWalletId: walletId,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: amount } },
      });

      await tx.ledgerEntry.create({
        data: {
          transactionId: transaction.id,
          walletId,
          amount,
          entryType: LedgerEntryType.credit,
          balanceBefore: updatedWallet.balance - amount,
          balanceAfter: updatedWallet.balance,
        },
      });

      return transaction;
    });
  }

  async findWalletByUserId(userId: string) {
    return await this.prisma.wallet.findUnique({
      where: { userId },
    });
  }
}
