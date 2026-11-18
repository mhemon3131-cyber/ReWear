import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('swap-match')
  async swapMatch(@Body() body: { offeredId: string; targetId: string }) {
    return this.transactionsService.calculateSwapMatch(body.offeredId, body.targetId);
  }

  @Post('swap-offer')
  async createSwapOffer(@Body() body: any) {
    return this.transactionsService.createSwapOffer(body);
  }

  @Get('rental-availability')
  async checkRental(
    @Query('listingId') listingId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.checkRentalAvailability(listingId, startDate, endDate);
  }
}
