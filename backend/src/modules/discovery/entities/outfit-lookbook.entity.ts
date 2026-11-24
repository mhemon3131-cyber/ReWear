// Member 2 - Feature 10: Outfit Builder & Digital Lookbook domain model.
// (The older placeholder LookbookEntity in lookbook.entity.ts is left untouched.)

export const OUTFIT_SLOTS = ['outerwear', 'top', 'layer', 'bottom', 'accessory', 'other'] as const;
export type OutfitSlot = (typeof OUTFIT_SLOTS)[number];

/** Garment details captured when the item was saved, used if the listing later disappears. */
export interface GarmentSnapshot {
  title: string;
  brand: string;
  size: string;
  category: string;
  image: string | null;
  modes: string[];
  salePrice: number | null;
  rentalPricePerDay: number | null;
  swapCredits: number | null;
  capturedAt: string;
}

export interface LookbookItemRecord {
  listingId: string;
  slot: OutfitSlot;
  position: number;
  snapshot: GarmentSnapshot;
}

export interface LookbookRecord {
  id: string;
  ownerId: string;
  name: string;
  occasion: string | null;
  notes: string | null;
  items: LookbookItemRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LookbookWrite {
  name: string;
  occasion: string | null;
  notes: string | null;
  items: LookbookItemRecord[];
}
