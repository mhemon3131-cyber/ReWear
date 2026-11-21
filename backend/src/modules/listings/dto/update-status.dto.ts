import { IsString, IsIn, IsOptional } from 'class-validator';
import { ListingStatus } from '../entities/listing.entity';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'RENTED', 'ARCHIVED'])
  status: ListingStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
