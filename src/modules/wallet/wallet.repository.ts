import { BadRequestException, Injectable } from '@nestjs/common';
import {
  LedgerEntryType,
  TransactionStatus,
  TransactionType,
} from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { WALLET_MESSAGES } from 'src/modules/wallet/wallet.constants';

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTransfer(
    senderWalletId: string,
    recipientWalletId: string,
    amount: number,
    description: string | undefined,
    idempotencyKey: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const [debitedWallet] = await tx.wallet.updateManyAndReturn({
        where: { id: senderWalletId, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });

      if (!debitedWallet) {
        throw new BadRequestException(WALLET_MESSAGES.INSUFFICIENT_BALANCE);
      }

      const creditedWallet = await tx.wallet.update({
        where: { id: recipientWalletId },
        data: { balance: { increment: amount } },
      });

      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.transfer,
          status: TransactionStatus.success,
          amount,
          description,
          idempotencyKey,
          senderWalletId,
          recipientWalletId,
        },
      });

      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: transaction.id,
            walletId: senderWalletId,
            entryType: LedgerEntryType.debit,
            amount,
            balanceBefore: debitedWallet.balance + amount,
            balanceAfter: debitedWallet.balance,
          },
          {
            transactionId: transaction.id,
            walletId: recipientWalletId,
            entryType: LedgerEntryType.credit,
            amount,
            balanceBefore: creditedWallet.balance - amount,
            balanceAfter: creditedWallet.balance,
          },
        ],
      });

      return transaction;
    });
  }

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
