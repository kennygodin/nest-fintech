import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WalletRepository } from 'src/modules/wallet/wallet.repository';
import { WALLET_MESSAGES } from 'src/modules/wallet/wallet.constants';
import { Prisma, WalletStatus } from 'generated/prisma/client';
import { UsersService } from 'src/modules/users/users.service';
import { USER_MESSAGES } from '../users/users.constants';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly usersService: UsersService,
  ) {}

  async transfer(
    senderId: string,
    recipientEmail: string,
    amount: number,
    description: string | undefined,
    idempotencyKey: string,
  ) {
    const recipient = await this.usersService.findByEmail(recipientEmail);

    if (!recipient) {
      throw new NotFoundException(USER_MESSAGES.RECIPIENT_NOT_FOUND);
    }

    if (recipient.id === senderId) {
      throw new BadRequestException(WALLET_MESSAGES.CANNOT_TRANSFER_TO_SELF);
    }

    const senderWallet = await this.getWallet(senderId);
    const recipientWallet = await this.getWallet(recipient.id);

    if (senderWallet.status !== 'active') {
      throw new NotFoundException(WALLET_MESSAGES.NOT_ACTIVE);
    }

    if (recipientWallet.status !== WalletStatus.active) {
      throw new ForbiddenException(WALLET_MESSAGES.RECIPIENT_WALLET_NOT_ACTIVE);
    }

    try {
      return await this.walletRepository.createTransfer(
        senderWallet.id,
        recipientWallet.id,
        amount,
        description,
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
