import { BadRequestException, Injectable } from '@nestjs/common';
import { ListingsService } from '../../listings/listings.service';
import { ListingEntity, ListingStatus } from '../../listings/entities/listing.entity';
import { SearchListingsDto, SearchSort } from '../dto/search-listings.dto';

// Member 2 - Feature 6: Advanced Multi-Filter Marketplace Search.
//
// Reads listings through Member 1's exported ListingsService without modifying it.
// Only the public read method getAllListings() is used, because getListingById()
// increments the view counter (a side effect search must not have).

const ALL_STATUSES: ListingStatus[] = ['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'RENTED', 'ARCHIVED'];

// Same rule as the public listings browse: buyers see active and reserved (escrow) items.
export const MARKETPLACE_VISIBLE_STATUSES: ListingStatus[] = ['ACTIVE', 'RESERVED'];

export interface SearchCriteria {
  q?: string;
  categories?: string[];
  sizes?: string[];
  conditions?: string[];
  modes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRentalPerDay?: number;
  maxRentalPerDay?: number;
  minSwapCredits?: number;
  maxSwapCredits?: number;
  sort?: SearchSort;
}

const RANGES: Array<[keyof SearchCriteria, keyof SearchCriteria, string]> = [
  ['minPrice', 'maxPrice', 'purchase price'],
  ['minRentalPerDay', 'maxRentalPerDay', 'daily rental fee'],
  ['minSwapCredits', 'maxSwapCredits', 'swap credits'],
];

const lower = (s: unknown) => (typeof s === 'string' ? s.toLowerCase() : '');
const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

function inRange(value: unknown, min?: number, max?: number) {
  if (!isNum(value)) return false;
  if (isNum(min) && value < min) return false;
  if (isNum(max) && value > max) return false;
  return true;
}

export function validateRanges(criteria: SearchCriteria) {
  for (const [minKey, maxKey, label] of RANGES) {
    const min = criteria[minKey] as number | undefined;
    const max = criteria[maxKey] as number | undefined;
    if (isNum(min) && isNum(max) && min > max) {
      throw new BadRequestException(`Minimum ${label} cannot be greater than maximum ${label}.`);
    }
  }
}

export function matchesCriteria(listing: ListingEntity, c: SearchCriteria): boolean {
  if (c.q) {
    const haystack = [
      listing.title,
      listing.brand,
      listing.description,
      listing.category,
      listing.pattern,
      listing.size,
      listing.genderCategory,
      ...(listing.color || []),
    ]
      .map(lower)
      .join(' ');
    const tokens = lower(c.q).split(/\s+/).filter(Boolean);
    if (!tokens.every((t) => haystack.includes(t))) return false;
  }

  if (c.categories?.length) {
    const wanted = c.categories.map(lower);
    if (!wanted.includes(lower(listing.category))) return false;
  }

  if (c.sizes?.length) {
    const wanted = c.sizes.map(lower);
    if (!wanted.includes(lower(listing.size))) return false;
  }

  if (c.conditions?.length && !c.conditions.includes(listing.condition)) return false;

  const modes = listing.modes || [];
  if (c.modes?.length && !c.modes.some((m) => modes.includes(m as any))) return false;

  // Each unit is filtered on its own; a range only matches listings offered in that mode.
  if (isNum(c.minPrice) || isNum(c.maxPrice)) {
    if (!modes.includes('buy') || !inRange(listing.salePrice, c.minPrice, c.maxPrice)) return false;
  }
  if (isNum(c.minRentalPerDay) || isNum(c.maxRentalPerDay)) {
    if (!modes.includes('rent') || !inRange(listing.rentalPricePerDay, c.minRentalPerDay, c.maxRentalPerDay)) {
      return false;
    }
  }
  if (isNum(c.minSwapCredits) || isNum(c.maxSwapCredits)) {
    if (!modes.includes('swap') || !inRange(listing.swapCredits, c.minSwapCredits, c.maxSwapCredits)) return false;
  }

  return true;
}

// Missing values always sort last, regardless of direction.
function byNumber(get: (l: ListingEntity) => unknown, dir: 1 | -1) {
  return (a: ListingEntity, b: ListingEntity) => {
    const av = get(a);
    const bv = get(b);
    if (!isNum(av) && !isNum(bv)) return 0;
    if (!isNum(av)) return 1;
    if (!isNum(bv)) return -1;
    return (av - bv) * dir;
  };
}

const time = (d: unknown) => {
  const t = d instanceof Date ? d.getTime() : new Date(d as string).getTime();
  return Number.isFinite(t) ? t : undefined;
};

export function comparatorFor(sort: SearchSort = 'newest') {
  const primary: (a: ListingEntity, b: ListingEntity) => number = (() => {
    switch (sort) {
      case 'price_asc':
        return byNumber((l) => (l.modes?.includes('buy') ? l.salePrice : undefined), 1);
      case 'price_desc':
        return byNumber((l) => (l.modes?.includes('buy') ? l.salePrice : undefined), -1);
      case 'rental_asc':
        return byNumber((l) => (l.modes?.includes('rent') ? l.rentalPricePerDay : undefined), 1);
      case 'swap_credits_asc':
        return byNumber((l) => (l.modes?.includes('swap') ? l.swapCredits : undefined), 1);
      case 'title_asc':
        return (a, b) => (a.title || '').localeCompare(b.title || '');
      case 'newest':
      default:
        return byNumber((l) => time(l.createdAt), -1);
    }
  })();
  return (a: ListingEntity, b: ListingEntity) => primary(a, b) || String(a.id).localeCompare(String(b.id));
}

export function filterAndSortListings(listings: ListingEntity[], criteria: SearchCriteria) {
  validateRanges(criteria);
  return listings
    .filter((l) => MARKETPLACE_VISIBLE_STATUSES.includes(l.status))
    .filter((l) => matchesCriteria(l, criteria))
    .sort(comparatorFor(criteria.sort));
}

const uniqueSorted = (values: unknown[]) =>
  Array.from(new Set(values.filter((v): v is string => typeof v === 'string' && v.trim() !== ''))).sort((a, b) =>
    a.localeCompare(b),
  );

@Injectable()
export class MarketplaceSearchService {
  constructor(private readonly listingsService: ListingsService) {}

  /** Every listing in Member 1's store, any status, without side effects. */
  async getAllListingsReadOnly(): Promise<ListingEntity[]> {
    const batches = await Promise.all(ALL_STATUSES.map((status) => this.listingsService.getAllListings({ status })));
    const byId = new Map<string, ListingEntity>();
    for (const listing of batches.flat()) byId.set(listing.id, listing);
    return Array.from(byId.values());
  }

  async search(dto: SearchListingsDto) {
    const criteria: SearchCriteria = { ...dto, sort: dto.sort || 'newest' };
    validateRanges(criteria);

    const all = await this.getAllListingsReadOnly();
    const visible = all.filter((l) => MARKETPLACE_VISIBLE_STATUSES.includes(l.status));
    const results = filterAndSortListings(visible, criteria);

    return {
      source: 'backend',
      total: results.length,
      results,
      appliedFilters: criteria,
      facets: {
        categories: uniqueSorted(visible.map((l) => l.category)),
        sizes: uniqueSorted(visible.map((l) => l.size)),
        conditions: uniqueSorted(visible.map((l) => l.condition)),
      },
      // IDs of every listing the server knows about (any status). The frontend uses this
      // to tell server-backed listings apart from ones that exist only in browser state.
      catalog: { knownIds: all.map((l) => l.id) },
    };
  }
}
