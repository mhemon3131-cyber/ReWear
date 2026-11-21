import { IsString, IsNotEmpty, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { ListingCondition, BrandTier } from '../entities/listing.entity';

export class PriceAdvisorRequestDto {
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  @IsIn(['Fast Fashion', 'Premium High-Street', 'Heritage', 'Designer', 'Unbranded'])
  brandTier?: BrandTier;

  @IsString()
  @IsIn(['Brand New w/ Tags', 'Like New', 'Good', 'Fair'])
  condition: ListingCondition;

  @IsOptional()
  @IsNumber()
  defectsCount?: number;

  @IsOptional()
  @IsString()
  defectSeverity?: 'Minor' | 'Noticeable' | 'Moderate';
}

export class PriceAdvisorResponseDto {
  currency: string;
  originalPrice: number;
  retentionRatePercentage: number;
  estimatedResaleRange: {
    min: number;
    recommended: number;
    max: number;
  };
  recommendedSwapCredits: number;
  recommendedDailyRentalFee: number;
  recommendedSecurityDeposit: number;
  estimatedBuyerSavingsBDT: number;
  depreciationBreakdown: {
    conditionImpact: string;
    brandTierImpact: string;
    categoryDemandImpact: string;
    defectPenalty: string;
  };
  marketExplanation: string;
}
