import { Module } from '@nestjs/common';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { WalletController } from 'src/modules/wallet/wallet.controller';
import { WalletRepository } from 'src/modules/wallet/wallet.repository';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [],
})
export class WalletModule {}
