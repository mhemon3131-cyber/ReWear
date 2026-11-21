import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CheckoutService } from './services/checkout.service';
import { SwapMatchmakerService } from './services/swap-matchmaker.service';

@Module({
  imports: [ConfigModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, CheckoutService, SwapMatchmakerService],
  exports: [TransactionsService, CheckoutService, SwapMatchmakerService],
})
export class TransactionsModule {}
