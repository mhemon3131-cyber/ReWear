import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { CheckoutService } from './services/checkout.service';
import { SwapMatchmakerService } from './services/swap-matchmaker.service';

@Module({
  controllers: [TransactionsController],
  providers: [CheckoutService, SwapMatchmakerService],
  exports: [CheckoutService, SwapMatchmakerService],
})
export class TransactionsModule {}
