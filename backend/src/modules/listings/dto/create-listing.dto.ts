import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsIn, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ListingCondition, ListingMode, ListingStatus, BrandTier } from '../entities/listing.entity';

export class DefectDto {
  @IsString()
  @IsNotEmpty()
  type: 'Stain' | 'Hole' | 'Missing Button' | 'Seam Tear' | 'Fading' | 'Pilling' | 'Zipper Issue' | 'Alteration' | 'Other';

  @IsString()
  @IsIn(['Minor', 'Noticeable', 'Moderate'])
  severity: 'Minor' | 'Noticeable' | 'Moderate';

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsOptional()
  brandTier?: BrandTier;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  genderCategory?: 'Men' | 'Women' | 'Unisex';

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsArray()
  @IsString({ each: true })
  color: string[];

  @IsString()
  @IsOptional()
  pattern?: string;

  @IsString()
  @IsOptional()
  fabricComposition?: string;

  @IsBoolean()
  @IsOptional()
  isSellerVerifiedFabric?: boolean;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  // Condition & Defect Transparency
  @IsString()
  @IsIn(['Brand New w/ Tags', 'Like New', 'Good', 'Fair'])
  condition: ListingCondition;

  @IsString()
  @IsNotEmpty()
  defectDisclosure: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DefectDto)
  defects?: DefectDto[];

  @IsBoolean()
  @IsOptional()
  hasDefects?: boolean;

  // Multi-Mode configuration
  @IsArray()
  @IsIn(['buy', 'swap', 'rent'], { each: true })
  modes: ListingMode[];

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  swapCredits?: number;

  @IsNumber()
  @IsOptional()
  rentalPricePerDay?: number;

  @IsNumber()
  @IsOptional()
  rentalDeposit?: number;

  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE'])
  status?: ListingStatus;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @IsOptional()
  sellerName?: string;

  @IsString()
  @IsOptional()
  sellerUniversity?: string;
}
