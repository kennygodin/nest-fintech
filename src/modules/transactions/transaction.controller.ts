import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TransactionService } from 'src/modules/transactions/transaction.service';
import { ListTransactionsDto } from 'src/modules/transactions/dto/list-transactions.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':id')
  async getById(@Req() req: Request, @Param('id') id: string) {
    return this.transactionService.getById(req.user!.id, id);
  }

  @Get()
  async list(@Req() req: Request, @Query() query: ListTransactionsDto) {
    return await this.transactionService.listForUser(
      req.user!.id,
      query.page,
      query.limit,
    );
  }
}
