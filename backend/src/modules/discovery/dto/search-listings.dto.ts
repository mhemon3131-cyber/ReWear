import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Member 2 - Feature 6: Advanced Multi-Filter Marketplace Search.
//
// List parameters are exact labels. Send several values by repeating the key
// (?sizes=M&sizes=L). Values are NOT split on commas, because labels such as
// categories may legitimately contain punctuation.

export const SEARCH_CONDITIONS = ['Brand New w/ Tags', 'Like New', 'Good', 'Fair'] as const;
export const SEARCH_MODES = ['buy', 'swap', 'rent'] as const;
export const SEARCH_SORTS = [
  'newest',
  'price_asc',
  'price_desc',
  'rental_asc',
  'swap_credits_asc',
  'title_asc',
] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

export const MAX_AMOUNT = 10_000_000;

const toStringList = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  const list = Array.isArray(value) ? value : [value];
  // Non-string entries (e.g. nested query objects) are kept so validation rejects them.
  return list
    .map((v) => (typeof v === 'string' ? v.trim() : v))
    .filter((v) => v !== '');
};

const toOptionalNumber = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  if (typeof value !== 'string' && typeof value !== 'number') return NaN;
  return Number(value);
};

const toTrimmedString = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class SearchListingsDto {
  @IsOptional()
  @Transform(toTrimmedString)
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @Transform(toStringList)
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  categories?: string[];

  @IsOptional()
  @Transform(toStringList)
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  sizes?: string[];

  @IsOptional()
  @Transform(toStringList)
  @IsArray()
  @ArrayMaxSize(4)
  @IsIn(SEARCH_CONDITIONS as unknown as string[], { each: true })
  conditions?: string[];

  @IsOptional()
  @Transform(toStringList)
  @IsArray()
  @ArrayMaxSize(3)
  @IsIn(SEARCH_MODES as unknown as string[], { each: true })
  modes?: string[];

  // Purchase price in BDT (applies only to listings offered for 'buy').
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  @Max(MAX_AMOUNT)
  minPrice?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  @Max(MAX_AMOUNT)
  maxPrice?: number;

  // Daily rental fee in BDT/day (applies only to listings offered for 'rent').
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  @Max(MAX_AMOUNT)
  minRentalPerDay?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  @Max(MAX_AMOUNT)
  maxRentalPerDay?: number;

  // Swap credits (applies only to listings offered for 'swap').
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  @Max(MAX_AMOUNT)
  minSwapCredits?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  @Min(0)
  @Max(MAX_AMOUNT)
  maxSwapCredits?: number;

  @IsOptional()
  @Transform(toTrimmedString)
  @IsIn(SEARCH_SORTS as unknown as string[])
  sort?: SearchSort;
}
