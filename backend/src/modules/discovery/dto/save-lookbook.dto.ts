import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { OUTFIT_SLOTS, OutfitSlot } from '../entities/outfit-lookbook.entity';

// Member 2 - Feature 10. Used for both create (POST) and edit (PUT, full replacement).
// On PUT, omitting occasion/notes clears them.

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const trimOrUndefined = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'string') return value;
  const t = value.trim();
  return t === '' ? undefined : t;
};

export const MAX_LOOKBOOK_ITEMS = 8;

export class LookbookItemDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  listingId: string;

  @IsIn(OUTFIT_SLOTS as unknown as string[])
  slot: OutfitSlot;
}

export class SaveLookbookDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Lookbook name is required.' })
  @MaxLength(80)
  name: string;

  @IsOptional()
  @Transform(trimOrUndefined)
  @IsString()
  @MaxLength(60)
  occasion?: string;

  @IsOptional()
  @Transform(trimOrUndefined)
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Select at least one garment.' })
  @ArrayMaxSize(MAX_LOOKBOOK_ITEMS, { message: `A lookbook can hold at most ${MAX_LOOKBOOK_ITEMS} garments.` })
  @ValidateNested({ each: true })
  @Type(() => LookbookItemDto)
  items: LookbookItemDto[];
}
