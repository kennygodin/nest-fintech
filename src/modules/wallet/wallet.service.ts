import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WalletRepository } from 'src/modules/wallet/wallet.repository';
import {
  WALLET_CODE,
  WALLET_MESSAGES,
} from 'src/modules/wallet/wallet.constants';
import {
  Prisma,
  TransactionStatus,
  WalletStatus,
} from 'generated/prisma/client';
import { UsersService } from 'src/modules/users/users.service';
import { USER_MESSAGES } from 'src/modules/users/users.constants';
import { NotificationsProducer } from 'src/modules/notifications/notifications.producer';

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly usersService: UsersService,
    private readonly notificationsProducer: NotificationsProducer,
  ) {}

  private readonly logger = new Logger(WalletService.name);

  async updateStatus(walletId: string, status: WalletStatus) {
    return this.walletRepository.updateWalletStatus(walletId, status);
  }

  async getWalletById(walletId: string) {
    const wallet = await this.walletRepository.findWalletById(walletId);

    if (!wallet) {
      throw new NotFoundException(WALLET_MESSAGES.NOT_FOUND);
    }

    return wallet;
  }

  async withdraw(
    userId: string,
    amount: number,
    description: string | undefined,
    idempotencyKey: string,
    simulateFailure: boolean,
  ) {
    const wallet = await this.getWallet(userId);

    if (wallet.status !== 'active') {
      throw new NotFoundException(WALLET_MESSAGES.NOT_ACTIVE);
    }

    try {
      const transaction = await this.walletRepository.createWithdrawal(
        wallet.id,
        amount,
        description,
        idempotencyKey,
        simulateFailure,
      );

      try {
        const isReversed = transaction.status === TransactionStatus.reversed;

        await this.notificationsProducer.notify(
          userId,
          isReversed
            ? WALLET_CODE.WITHDRAWAL_REVERSED
            : WALLET_CODE.WITHDRAWAL_SUCCESS,
          isReversed
            ? WALLET_MESSAGES.WITHDRAWAL_REVERSED
            : WALLET_MESSAGES.WITHDRAWAL_SUCCESS,
          isReversed
            ? `Your withdrawal of ₦${(amount / 100).toFixed(2)} could not be completed and was reversed`
            : `Your withdrawal of ₦${(amount / 100).toFixed(2)} was successful`,
        );
      } catch (error) {
        this.logger.warn(`Failed to queue withdrawal notification: ${error}`);
      }

      return transaction;
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
      const transaction = await this.walletRepository.createTransfer(
        senderWallet.id,
        recipientWallet.id,
        amount,
        description,
        idempotencyKey,
      );

      try {
        await this.notificationsProducer.notify(
          senderId,
          WALLET_CODE.TRANSFER_SENT,
          WALLET_MESSAGES.TRANSFER_SENT,
          `You sent ₦${(amount / 100).toFixed(2)} to ${recipient.email}`,
        );

        await this.notificationsProducer.notify(
          recipient.id,
          WALLET_CODE.TRANSFER_RECEIVED,
          WALLET_MESSAGES.TRANSFER_RECEIVED,
          `You received ₦${(amount / 100).toFixed(2)} from your transfer`,
        );
      } catch (error) {
        this.logger.warn(`Failed to queue transfer notifications: ${error}`);
      }

      return transaction;
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
      const transaction = await this.walletRepository.createDeposit(
        wallet.id,
        amount,
        description || '',
        idempotencyKey,
      );

      try {
        await this.notificationsProducer.notify(
          userId,
          WALLET_CODE.DEPOSIT_SUCCESS,
          WALLET_MESSAGES.DEPOSIT_SUCCESS,
          `Your wallet was credited with ₦${(amount / 100).toFixed(2)}`,
        );
      } catch (error) {
        this.logger.warn(`Failed to queue deposit notification: ${error}`);
      }

      return transaction;
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
