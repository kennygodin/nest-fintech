import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { Request } from 'express';
import { DepositDto } from './dto/deposit.dto';
import { WALLET_MESSAGES } from './wallet.constants';
import { TransferDto } from './dto/transfer.dto';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer funds to another user' })
  async transfer(
    @Req() req: Request,
    @Body() dto: TransferDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException(WALLET_MESSAGES.MISSING_IDEMPOTENCY_KEY);
    }

    return this.walletService.transfer(
      req.user!.id,
      dto.recipientEmail,
      dto.amount,
      dto.description,
      idempotencyKey,
    );
  }

  @Post('deposit')
  async deposit(
    @Req() req: Request,
    @Body() dto: DepositDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException(WALLET_MESSAGES.MISSING_IDEMPOTENCY_KEY);
    }

    return this.walletService.deposit(
      req.user!.id,
      dto.amount,
      dto.description,
      idempotencyKey,
    );
  }

  @Get()
  async getWallet(@Req() req: Request) {
    return this.walletService.getWallet(req.user!.id);
  }

  @Get('balance')
  async getBalance(@Req() req: Request) {
    const wallet = await this.walletService.getWallet(req.user!.id);

    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }
}
