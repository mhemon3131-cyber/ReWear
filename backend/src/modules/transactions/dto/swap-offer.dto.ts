import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSwapOfferDto {
  @IsNotEmpty()
  initiatorItem: {
    id: string;
    title: string;
    category: string;
    brand: string;
    size: string;
    condition: string;
    estimatedValueBDT: number;
    image: string;
  };

  @IsNotEmpty()
  receiverItem: {
    id: string;
    title: string;
    category: string;
    brand: string;
    size: string;
    condition: string;
    estimatedValueBDT: number;
    image: string;
  };

  @IsOptional()
  @IsNumber()
  cashAdjustmentBDT?: number;

  @IsOptional()
  @IsNumber()
  creditAdjustment?: number;

  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class CounterSwapOfferDto {
  @IsNotEmpty()
  @IsNumber()
  counterCashAdjustmentBDT: number;

  @IsNotEmpty()
  @IsNumber()
  counterCreditAdjustment: number;

  @IsNotEmpty()
  @IsString()
  counterMessage: string;
}
