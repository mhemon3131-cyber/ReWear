import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  itemId: string;

  @IsNotEmpty()
  @IsString()
  itemTitle: string;

  @IsNotEmpty()
  @IsNumber()
  itemPrice: number;

  @IsNotEmpty()
  @IsString()
  buyerName: string;

  @IsNotEmpty()
  @IsString()
  buyerEmail: string;

  @IsNotEmpty()
  deliveryAddress: {
    fullName: string;
    phone: string;
    campus: string;
    hallOrBuilding: string;
    deliveryNotes?: string;
  };

  @IsOptional()
  deliveryOption?: 'CAMPUS_PICKUP' | 'STANDARD_DELIVERY' | 'EXPRESS_CAMPUS_DROP';

  @IsNotEmpty()
  paymentMethod: 'STRIPE_CARD' | 'SWAP_CREDITS' | 'CASH_ON_DELIVERY';
}
