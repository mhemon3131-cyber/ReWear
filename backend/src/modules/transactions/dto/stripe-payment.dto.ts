import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProcessStripePaymentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNotEmpty()
  @IsString()
  cardNumberLast4: string;

  @IsNotEmpty()
  @IsString()
  cardBrand: string;

  @IsOptional()
  stripeToken?: string;
}
