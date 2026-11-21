export enum SwapOfferStatus {
  PROPOSED = 'PROPOSED',
  ACCEPTED = 'ACCEPTED',
  ESCROW_LOCKED = 'ESCROW_LOCKED',
  COUNTERED = 'COUNTERED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CompatibilityBreakdown {
  categoryScore: number; // 0-25
  sizeScore: number;     // 0-25
  valueScore: number;    // 0-25
  conditionScore: number;// 0-25
  totalScore: number;    // 0-100%
  categoryNote: string;
  sizeNote: string;
  valueNote: string;
  conditionNote: string;
}

export class SwapOfferEntity {
  id: string;
  offerNumber: string; // e.g. SWP-2026-4410
  initiatorId: string;
  initiatorName: string;
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
  receiverId: string;
  receiverName: string;
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
  compatibility: CompatibilityBreakdown;
  status: SwapOfferStatus;
  cashAdjustmentBDT: number; // e.g. +150 if initiator adds cash
  creditAdjustment: number;   // e.g. +10 if initiator adds credits
  aiRationale: string;
  negotiationMessage: string;
  escrowLockedAt?: Date;
  isEscrowProtected: boolean;
  createdAt: Date;
  updatedAt: Date;
}
