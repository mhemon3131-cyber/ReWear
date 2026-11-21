import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class AiCopilotRequestDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  initialCategoryHint?: string;

  @IsString()
  @IsOptional()
  sellerNote?: string;

  @IsBoolean()
  @IsOptional()
  hasProofOfAuthenticity?: boolean;

  @IsString()
  @IsOptional()
  declaredBrand?: string;
}

export class AiCopilotResponseDto {
  suggestedTitle: string;
  suggestedCategory: string;
  suggestedGender: 'Men' | 'Women' | 'Unisex';
  suggestedColors: string[];
  suggestedPattern: string;
  suggestedDescription: string;
  suggestedTags: string[];
  detectedConditionGrade: 'Brand New w/ Tags' | 'Like New' | 'Good' | 'Fair';
  estimatedResaleRange: {
    min: number;
    recommended: number;
    max: number;
    currency: string;
  };
  recommendedSwapCredits: number;
  recommendedDailyRentalFee: number;
  aiConfidenceScore: number;
  aiCaveat: string;
  scannedAt: Date;
}
