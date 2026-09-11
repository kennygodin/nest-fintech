import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from 'src/modules/transactions/transaction.repository';
import { TRANSACTION_MESSAGES } from './transaction.constants';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getById(userId: string, transactionId: string) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    const isOwner =
      transaction?.senderWallet?.userId === userId ||
      transaction?.recipientWallet?.userId === userId;

    if (!isOwner) {
      throw new NotFoundException(TRANSACTION_MESSAGES.NOT_FOUND);
    }

    return {
      id: transaction.id,
      reference: transaction.reference,
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      sender: transaction.senderWallet?.user ?? null,
      recipient: transaction.recipientWallet?.user ?? null,
    };
  }

  async listForUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const { transactions, total } =
      await this.transactionRepository.findManyForUser(userId, skip, limit);

    return {
      data: transactions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
