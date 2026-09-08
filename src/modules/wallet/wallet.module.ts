import { Module } from '@nestjs/common';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { WalletController } from 'src/modules/wallet/wallet.controller';
import { WalletRepository } from 'src/modules/wallet/wallet.repository';

@Module({
  imports: [],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [],
})
export class WalletModule {}
