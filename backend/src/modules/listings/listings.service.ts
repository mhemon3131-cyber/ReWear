import { Injectable } from '@nestjs/common';
import { ListingEntity } from './entities/listing.entity';

@Injectable()
export class ListingsService {
  // Member 1: AI Listing Copilot & Inventory Management
  async generateCopilotDraft(imageMetadata: any) {
    return {
      suggestedTitle: 'Vintage Corduroy Oversized Jacket',
      suggestedCategory: 'Outerwear',
      suggestedTags: ['Vintage', 'Corduroy', 'Unisex', 'Warm'],
      estimatedResaleRange: { min: 1600, max: 2000, currency: 'BDT' },
      conditionDraft: 'Like New',
    };
  }

  async getAllListings(): Promise<ListingEntity[]> {
    return [
      {
        id: 'list_1',
        title: 'Vintage Corduroy Oversized Jacket',
        brand: 'Zara Eco-Line',
        size: 'M',
        condition: 'Like New',
        defectDisclosure: 'No stains or tears; minor wear on lower inner cuff.',
        modes: ['buy', 'swap', 'rent'],
        salePrice: 1850,
        swapCredits: 45,
        rentalPricePerDay: 250,
        waterSavingsLiters: 2800,
        co2AvoidedKg: 3.4,
        status: 'ACTIVE',
        sellerId: 'usr_02',
      },
    ];
  }
}
