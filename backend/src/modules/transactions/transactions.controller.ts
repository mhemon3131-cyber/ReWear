import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckoutService } from './services/checkout.service';
import { SwapMatchmakerService } from './services/swap-matchmaker.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProcessStripePaymentDto } from './dto/stripe-payment.dto';
import { CreateSwapOfferDto, CounterSwapOfferDto } from './dto/swap-offer.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly swapMatchmakerService: SwapMatchmakerService,
  ) {}

  // ==========================================
  // FEATURE 1: UNIFIED CHECKOUT & STRIPE PAYMENT
  // ==========================================

  @Post('checkout/order')
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.checkoutService.createOrder(dto);
  }

  @Post('checkout/stripe-pay')
  @HttpCode(HttpStatus.OK)
  async processStripePayment(@Body() dto: ProcessStripePaymentDto) {
    return this.checkoutService.processStripePayment(dto);
  }

  @Get('orders')
  async getOrderHistory(@Query('buyerEmail') buyerEmail?: string) {
    return this.checkoutService.getOrderHistory(buyerEmail);
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.checkoutService.getOrderById(id);
  }

  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(@Param('id') id: string) {
    return this.checkoutService.cancelOrder(id);
  }

  // ==========================================
  // FEATURE 2: AI SWAP MATCHMAKER & ESCROW
  // ==========================================

  @Post('swap-match/calculate')
  @HttpCode(HttpStatus.OK)
  async calculateCompatibility(@Body() body: { itemA: any; itemB: any }) {
    return this.swapMatchmakerService.calculateCompatibility(body.itemA, body.itemB);
  }

  @Post('swap-match/ai-explanation')
  @HttpCode(HttpStatus.OK)
  async generateAiExplanation(@Body() body: { itemA: any; itemB: any }) {
    const compatibility = this.swapMatchmakerService.calculateCompatibility(body.itemA, body.itemB);
    return this.swapMatchmakerService.generateAiExplanation(body.itemA, body.itemB, compatibility);
  }

  @Get('swap-offers')
  async getSwapOffers() {
    return this.swapMatchmakerService.getAllOffers();
  }

  @Post('swap-offers')
  async createSwapOffer(@Body() dto: CreateSwapOfferDto) {
    return this.swapMatchmakerService.createSwapOffer(dto);
  }

  @Post('swap-offers/:id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptSwapOffer(@Param('id') id: string) {
    return this.swapMatchmakerService.acceptSwapOffer(id);
  }

  @Post('swap-offers/:id/counter')
  @HttpCode(HttpStatus.OK)
  async counterSwapOffer(@Param('id') id: string, @Body() dto: CounterSwapOfferDto) {
    return this.swapMatchmakerService.counterSwapOffer(id, dto);
  }

  @Post('swap-offers/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectSwapOffer(@Param('id') id: string) {
    return this.swapMatchmakerService.rejectSwapOffer(id);
  }
}
