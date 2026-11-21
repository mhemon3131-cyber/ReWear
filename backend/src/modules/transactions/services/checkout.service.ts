import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ProcessStripePaymentDto } from '../dto/stripe-payment.dto';
import { OrderEntity, OrderStatus, PaymentMethod } from '../entities/order.entity';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class CheckoutService {
  private orders: OrderEntity[] = [
    {
      id: 'ord_sample_01',
      orderNumber: 'ORD-2026-9481',
      buyerId: 'usr_mehedi',
      buyerName: 'Mehedi Hasan',
      buyerEmail: 'mhemon3131@gmail.com',
      sellerId: 'usr_ayesha',
      itemId: 'item_01',
      itemTitle: 'Vintage Corduroy Oversized Jacket',
      itemPrice: 1850,
      deliveryFee: 60,
      discount: 50,
      totalAmount: 1860,
      deliveryAddress: {
        fullName: 'Mehedi Hasan',
        phone: '01711223344',
        campus: 'BRAC University',
        hallOrBuilding: 'Building 2, Level 6',
        deliveryNotes: 'Please call upon reaching campus gate.',
      },
      deliveryOption: 'CAMPUS_PICKUP',
      paymentMethod: PaymentMethod.STRIPE_CARD,
      paymentStatus: 'PAID',
      orderStatus: OrderStatus.CONFIRMED,
      stripePaymentIntentId: 'pi_3MtwxX2eZvKYlo2C01234567',
      cancellationAllowedUntil: new Date(Date.now() + 1000 * 60 * 60 * 2),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      updatedAt: new Date(),
    },
  ];

  private payments: PaymentEntity[] = [];

  // 1. Create Order with Calculation Breakdown
  async createOrder(dto: CreateOrderDto): Promise<OrderEntity> {
    const deliveryFee = dto.deliveryOption === 'CAMPUS_PICKUP' ? 0 : 60;
    const sustainableDiscount = 50; // Discount for choosing pre-owned circular clothing
    const totalAmount = Math.max(0, dto.itemPrice + deliveryFee - sustainableDiscount);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-2026-${randomSuffix}`;

    const newOrder: OrderEntity = {
      id: `ord_${Date.now()}`,
      orderNumber,
      buyerId: 'usr_mehedi',
      buyerName: dto.buyerName,
      buyerEmail: dto.buyerEmail,
      sellerId: 'usr_seller_01',
      itemId: dto.itemId,
      itemTitle: dto.itemTitle,
      itemPrice: dto.itemPrice,
      deliveryFee,
      discount: sustainableDiscount,
      totalAmount,
      deliveryAddress: dto.deliveryAddress,
      deliveryOption: dto.deliveryOption || 'CAMPUS_PICKUP',
      paymentMethod: dto.paymentMethod as PaymentMethod,
      paymentStatus: dto.paymentMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
      orderStatus: OrderStatus.CONFIRMED,
      cancellationAllowedUntil: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours grace period
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  // 2. Process Stripe Payment Intent
  async processStripePayment(dto: ProcessStripePaymentDto): Promise<{ success: boolean; payment: PaymentEntity; order: OrderEntity }> {
    const order = this.orders.find((o) => o.id === dto.orderId || o.orderNumber === dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found.`);
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay for a cancelled order.');
    }

    const stripePaymentIntentId = `pi_stripe_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const paymentRecord: PaymentEntity = {
      id: `pay_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      method: 'STRIPE_CARD',
      amount: dto.amount,
      currency: dto.currency || 'BDT',
      stripePaymentIntentId,
      stripeCardBrand: dto.cardBrand || 'Visa',
      stripeCardLast4: dto.cardNumberLast4 || '4242',
      status: 'SUCCEEDED',
      paidAt: new Date(),
    };

    this.payments.push(paymentRecord);

    order.paymentStatus = 'PAID';
    order.stripePaymentIntentId = stripePaymentIntentId;
    order.orderStatus = OrderStatus.CONFIRMED;
    order.updatedAt = new Date();

    return {
      success: true,
      payment: paymentRecord,
      order,
    };
  }

  // 3. Cancellation Policy Enforcement
  async cancelOrder(orderId: string): Promise<{ success: boolean; message: string; order: OrderEntity }> {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found.`);
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException('This order is already cancelled.');
    }

    if (order.orderStatus === OrderStatus.SHIPPED || order.orderStatus === OrderStatus.DELIVERED) {
      throw new BadRequestException('Orders already dispatched or delivered cannot be cancelled online. Please report a dispute.');
    }

    const now = new Date();
    if (now > order.cancellationAllowedUntil) {
      throw new BadRequestException('The 2-hour cancellation window has expired. Please contact support or the campus courier.');
    }

    order.orderStatus = OrderStatus.CANCELLED;
    if (order.paymentStatus === 'PAID') {
      order.paymentStatus = 'REFUNDED';
    }
    order.updatedAt = new Date();

    return {
      success: true,
      message: `Order ${order.orderNumber} successfully cancelled. Any Stripe or credit charges have been initiated for refund.`,
      order,
    };
  }

  // 4. Retrieve Transaction History
  async getOrderHistory(buyerEmail?: string): Promise<OrderEntity[]> {
    if (buyerEmail) {
      return this.orders.filter((o) => o.buyerEmail === buyerEmail);
    }
    return this.orders;
  }

  async getOrderById(orderId: string): Promise<OrderEntity> {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
