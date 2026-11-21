export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  STRIPE_CARD = 'STRIPE_CARD',
  SWAP_CREDITS = 'SWAP_CREDITS',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export class OrderEntity {
  id: string;
  orderNumber: string; // e.g. ORD-2026-9842
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  itemId: string;
  itemTitle: string;
  itemPrice: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  deliveryAddress: {
    fullName: string;
    phone: string;
    campus: string;
    hallOrBuilding: string;
    deliveryNotes?: string;
  };
  deliveryOption: 'CAMPUS_PICKUP' | 'STANDARD_DELIVERY' | 'EXPRESS_CAMPUS_DROP';
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  orderStatus: OrderStatus;
  stripePaymentIntentId?: string;
  cancellationAllowedUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}
