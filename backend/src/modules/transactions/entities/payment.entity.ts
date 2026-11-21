export class PaymentEntity {
  id: string;
  orderId: string;
  orderNumber: string;
  method: 'STRIPE_CARD' | 'SWAP_CREDITS' | 'CASH_ON_DELIVERY';
  amount: number;
  currency: string; // e.g. 'BDT' or 'USD'
  stripePaymentIntentId?: string;
  stripeCardBrand?: string;
  stripeCardLast4?: string;
  status: 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paidAt: Date;
}
