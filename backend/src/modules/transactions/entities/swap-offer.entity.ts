export class SwapOfferEntity {
  id: string;
  senderId: string;
  receiverId: string;
  offeredListingId: string;
  requestedListingId: string;
  compatibilityScore: number;
  status: 'PENDING' | 'ACCEPTED' | 'ESCROW_LOCKED' | 'COMPLETED' | 'CANCELLED';
  negotiationNote?: string;
  createdAt: Date;
}
