export class RentalBookingEntity {
  id: string;
  renterId: string;
  listingId: string;
  startDate: Date;
  endDate: Date;
  securityDeposit: number;
  dailyRate: number;
  totalRentalFee: number;
  status: 'CONFIRMED' | 'ACTIVE_RENTAL' | 'RETURN_INSPECTED' | 'LATE_RETURN' | 'COMPLETED';
}
