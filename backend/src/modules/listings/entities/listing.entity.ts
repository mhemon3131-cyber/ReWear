export type ListingCondition = 'Brand New w/ Tags' | 'Like New' | 'Good' | 'Fair';
export type ListingMode = 'buy' | 'swap' | 'rent';
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'RENTED' | 'ARCHIVED';
export type BrandTier = 'Fast Fashion' | 'Premium High-Street' | 'Heritage' | 'Designer' | 'Unbranded';

export interface ListingDefect {
  id: string;
  type: 'Stain' | 'Hole' | 'Missing Button' | 'Seam Tear' | 'Fading' | 'Pilling' | 'Zipper Issue' | 'Alteration' | 'Other';
  severity: 'Minor' | 'Noticeable' | 'Moderate';
  description: string;
  photoUrl?: string;
}

export interface ListingAnalytics {
  views: number;
  wishlistSaves: number;
  inquiries: number;
  swapOffers: number;
  shares: number;
}

export interface AiListingMetadata {
  suggestedTitle: string;
  suggestedCategory: string;
  suggestedColors: string[];
  suggestedPattern?: string;
  suggestedTags: string[];
  estimatedResaleRange: {
    min: number;
    recommended: number;
    max: number;
    currency: string;
  };
  aiConfidenceScore: number;
  aiCaveat: string;
  scannedAt: Date;
}

export class ListingEntity {
  id: string;
  title: string;
  description: string;
  brand: string;
  brandTier?: BrandTier;
  category: string;
  genderCategory?: 'Men' | 'Women' | 'Unisex';
  size: string;
  color: string[];
  pattern?: string;
  fabricComposition?: string;
  isSellerVerifiedFabric?: boolean;
  images: string[];

  // Feature 3: Clothing Condition & Defect Transparency
  condition: ListingCondition;
  defectDisclosure: string;
  defects: ListingDefect[];
  hasDefects: boolean;

  // Feature 2: Multi-Mode Product & Inventory Management
  modes: ListingMode[];
  originalPrice?: number;
  salePrice?: number;
  swapCredits?: number;
  rentalPricePerDay?: number;
  rentalDeposit?: number;
  status: ListingStatus;

  // Ecological Impact Estimations
  waterSavingsLiters: number;
  co2AvoidedKg: number;

  // Seller Details
  sellerId: string;
  sellerName?: string;
  sellerUniversity?: string;
  isVerifiedSeller?: boolean;

  // Feature 5: Seller Performance Analytics
  analytics: ListingAnalytics;

  // Feature 1: AI Listing Copilot Metadata
  aiMetadata?: AiListingMetadata;

  createdAt: Date;
  updatedAt: Date;
}
