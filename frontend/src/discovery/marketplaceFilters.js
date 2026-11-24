// Member 2 - Feature 6: shared filter model for marketplace search.
// The backend (GET /api/v1/discovery/search) is the primary search engine. This module
// mirrors its rules so listings that exist only in this browser session (e.g. Seller
// Studio items saved while the backend was offline) can still be filtered consistently.

export const CONDITIONS = ['Brand New w/ Tags', 'Like New', 'Good', 'Fair'];
export const MODES = ['buy', 'swap', 'rent'];
export const VISIBLE_STATUSES = ['ACTIVE', 'RESERVED'];
export const MAX_AMOUNT = 10_000_000;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Purchase price: low to high' },
  { value: 'price_desc', label: 'Purchase price: high to low' },
  { value: 'rental_asc', label: 'Rental fee/day: low to high' },
  { value: 'swap_credits_asc', label: 'Swap credits: low to high' },
  { value: 'title_asc', label: 'Title A-Z' },
];

// Separate ranges per unit. Never combined into one price.
export const RANGE_FIELDS = [
  { min: 'minPrice', max: 'maxPrice', label: 'Purchase price', unit: '৳', mode: 'buy' },
  { min: 'minRentalPerDay', max: 'maxRentalPerDay', label: 'Rental fee', unit: '৳/day', mode: 'rent' },
  { min: 'minSwapCredits', max: 'maxSwapCredits', label: 'Swap credits', unit: 'credits', mode: 'swap' },
];

export const EMPTY_FILTERS = Object.freeze({
  categories: [],
  sizes: [],
  conditions: [],
  minPrice: '',
  maxPrice: '',
  minRentalPerDay: '',
  maxRentalPerDay: '',
  minSwapCredits: '',
  maxSwapCredits: '',
  sort: 'newest',
});

const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
const lower = (s) => (typeof s === 'string' ? s.toLowerCase() : '');

/** Build search criteria from UI state. `mode` is App.jsx's existing activeMode ('all'|'buy'|'swap'|'rent'). */
export function buildCriteria(filters, keyword, mode) {
  const c = { sort: filters.sort || 'newest' };
  const q = (keyword || '').trim();
  if (q) c.q = q;
  if (filters.categories?.length) c.categories = [...filters.categories];
  if (filters.sizes?.length) c.sizes = [...filters.sizes];
  if (filters.conditions?.length) c.conditions = [...filters.conditions];
  if (mode && mode !== 'all') c.modes = [mode];
  for (const { min, max } of RANGE_FIELDS) {
    for (const key of [min, max]) {
      const raw = filters[key];
      if (raw !== '' && raw !== null && raw !== undefined) c[key] = Number(raw);
    }
  }
  return c;
}

/** Client-side validation matching the backend DTO. Returns a list of messages. */
export function validateCriteria(c) {
  const errors = [];
  if (c.q && c.q.length > 100) errors.push('Search text must be 100 characters or fewer.');
  for (const { min, max, label } of RANGE_FIELDS) {
    for (const key of [min, max]) {
      if (key in c && (!isNum(c[key]) || c[key] < 0 || c[key] > MAX_AMOUNT)) {
        errors.push(`${label} must be a number between 0 and ${MAX_AMOUNT.toLocaleString('en-US')}.`);
      }
    }
    if (isNum(c[min]) && isNum(c[max]) && c[min] > c[max]) {
      errors.push(`Minimum ${label.toLowerCase()} cannot be greater than the maximum.`);
    }
  }
  return [...new Set(errors)];
}

export function hasActiveFilters(filters, keyword, mode) {
  const c = buildCriteria(filters, keyword, mode);
  return Object.keys(c).some((k) => k !== 'sort') || c.sort !== 'newest';
}

/** Query string for GET /discovery/search (repeated keys for lists). */
export function toQueryString(c) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(c)) {
    if (value === undefined || value === null || value === '') continue;
    for (const v of Array.isArray(value) ? value : [value]) sp.append(key, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** Normalise a frontend card object into the fields the filter needs. */
export function frontendToRecord(item) {
  return {
    id: item.id,
    title: item.title,
    brand: item.brand,
    category: item.category,
    size: item.size,
    condition: item.condition,
    status: item.status || 'ACTIVE',
    modes: item.modes || [],
    salePrice: item.salePrice,
    rentalPricePerDay: item.rentalPricePerDay,
    swapCredits: item.swapCredits,
    description: item.description || item.defectNote || '',
    color: Array.isArray(item.color) ? item.color : [],
    createdAt: item.createdAt,
  };
}

function inRange(value, min, max) {
  if (!isNum(value)) return false;
  if (isNum(min) && value < min) return false;
  if (isNum(max) && value > max) return false;
  return true;
}

/** Mirrors matchesCriteria() in backend marketplace-search.service.ts. */
export function matchesCriteria(r, c) {
  if (!VISIBLE_STATUSES.includes(r.status)) return false;
  if (c.q) {
    const hay = [r.title, r.brand, r.description, r.category, r.size, ...(r.color || [])].map(lower).join(' ');
    if (!lower(c.q).split(/\s+/).filter(Boolean).every((t) => hay.includes(t))) return false;
  }
  if (c.categories?.length && !c.categories.map(lower).includes(lower(r.category))) return false;
  if (c.sizes?.length && !c.sizes.map(lower).includes(lower(r.size))) return false;
  if (c.conditions?.length && !c.conditions.includes(r.condition)) return false;
  const modes = r.modes || [];
  if (c.modes?.length && !c.modes.some((m) => modes.includes(m))) return false;
  if ((isNum(c.minPrice) || isNum(c.maxPrice)) && (!modes.includes('buy') || !inRange(r.salePrice, c.minPrice, c.maxPrice))) return false;
  if ((isNum(c.minRentalPerDay) || isNum(c.maxRentalPerDay)) && (!modes.includes('rent') || !inRange(r.rentalPricePerDay, c.minRentalPerDay, c.maxRentalPerDay))) return false;
  if ((isNum(c.minSwapCredits) || isNum(c.maxSwapCredits)) && (!modes.includes('swap') || !inRange(r.swapCredits, c.minSwapCredits, c.maxSwapCredits))) return false;
  return true;
}

function byNumber(get, dir) {
  return (a, b) => {
    const av = get(a);
    const bv = get(b);
    if (!isNum(av) && !isNum(bv)) return 0;
    if (!isNum(av)) return 1;
    if (!isNum(bv)) return -1;
    return (av - bv) * dir;
  };
}

// Records without a creation date are items created in this browser session: treat as newest.
const createdTime = (r) => {
  if (!r.createdAt) return Number.MAX_SAFE_INTEGER;
  const t = new Date(r.createdAt).getTime();
  return Number.isFinite(t) ? t : Number.MAX_SAFE_INTEGER;
};

/** Comparator over normalised records, mirroring the backend sort rules. */
export function comparatorFor(sort = 'newest') {
  const has = (r, m) => (r.modes || []).includes(m);
  const primary = {
    price_asc: byNumber((r) => (has(r, 'buy') ? r.salePrice : undefined), 1),
    price_desc: byNumber((r) => (has(r, 'buy') ? r.salePrice : undefined), -1),
    rental_asc: byNumber((r) => (has(r, 'rent') ? r.rentalPricePerDay : undefined), 1),
    swap_credits_asc: byNumber((r) => (has(r, 'swap') ? r.swapCredits : undefined), 1),
    title_asc: (a, b) => String(a.title || '').localeCompare(String(b.title || '')),
    newest: byNumber(createdTime, -1),
  }[sort] || byNumber(createdTime, -1);
  return (a, b) => primary(a, b) || String(a.id).localeCompare(String(b.id));
}

/** Filter + sort frontend card objects locally (offline / local-only listings). */
export function filterFrontendListings(listings, c) {
  return listings
    .map((item) => ({ item, record: frontendToRecord(item) }))
    .filter(({ record }) => matchesCriteria(record, c))
    .sort((a, b) => comparatorFor(c.sort)(a.record, b.record))
    .map(({ item }) => item);
}
