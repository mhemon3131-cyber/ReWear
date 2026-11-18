export class ListingEntity {
  id: string;
  title: string;
  brand: string;
  size: string;
  condition: 'Brand New w/ Tags' | 'Like New' | 'Good' | 'Fair';
  defectDisclosure: string;
  modes: ('buy' | 'swap' | 'rent')[];
  salePrice?: number;
  swapCredits?: number;
  rentalPricePerDay?: number;
  waterSavingsLiters: number;
  co2AvoidedKg: number;
  status: 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'RENTED';
  sellerId: string;
}
