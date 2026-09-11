import { Module } from '@nestjs/common';
import { TransactionService } from 'src/modules/transactions/transaction.service';
import { TransactionRepository } from 'src/modules/transactions/transaction.repository';
import { TransactionController } from 'src/modules/transactions/transaction.controller';

@Module({
  imports: [],
  controllers: [TransactionController],
  exports: [],
  providers: [TransactionService, TransactionRepository],
})
export class TransactionModule {}
