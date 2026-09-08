import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WalletRepository } from 'src/modules/wallet/wallet.repository';
import { WALLET_MESSAGES } from 'src/modules/wallet/wallet.constants';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async deposit(
    userId: string,
    amount: number,
    description: string | undefined,
    idempotencyKey: string,
  ) {
    const wallet = await this.getWallet(userId);

    if (wallet.status !== 'active') {
      throw new NotFoundException(WALLET_MESSAGES.NOT_ACTIVE);
    }

    try {
      return await this.walletRepository.createDeposit(
        wallet.id,
        amount,
        description || '',
        idempotencyKey,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing =
          await this.walletRepository.findTransactionByIdempotencyKey(
            idempotencyKey,
          );

        if (existing?.amount === amount) {
          return existing;
        }

        throw new ConflictException(WALLET_MESSAGES.IDEMPOTENCY_CONFLICT);
      }

      throw error;
    }
  }

  async getWallet(userId: string) {
    const wallet = await this.walletRepository.findWalletByUserId(userId);

    if (!wallet) {
      throw new NotFoundException(WALLET_MESSAGES.NOT_FOUND);
    }

    return wallet;
  }
}
