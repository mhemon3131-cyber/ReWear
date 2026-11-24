// Member 2: local filter rules (used for local-only / offline listings). Run: node --test src/discovery/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_FILTERS,
  buildCriteria,
  validateCriteria,
  toQueryString,
  filterFrontendListings,
  hasActiveFilters,
} from './marketplaceFilters.js';

const L = [
  { id: 1, title: 'Vintage Corduroy Oversized Jacket', brand: 'Zara Eco-Line', size: 'M', category: 'Outerwear', condition: 'Like New', status: 'ACTIVE', modes: ['buy', 'swap', 'rent'], salePrice: 1850, swapCredits: 45, rentalPricePerDay: 250 },
  { id: 2, title: 'Jamdani Vest', brand: 'Aarong Heritage', size: 'S', category: 'Tops & Vests', condition: 'Brand New w/ Tags', status: 'ACTIVE', modes: ['buy', 'swap'], salePrice: 1600, swapCredits: 40 },
  { id: 3, title: 'Raw Denim Cargo', brand: "Levi's", size: '32', category: 'Pants & Jeans', condition: 'Good', status: 'RESERVED', modes: ['buy', 'swap', 'rent'], salePrice: 2100, swapCredits: 50, rentalPricePerDay: 300 },
  { id: 4, title: 'Turtleneck Sweater', brand: 'H&M', size: 'L', category: 'Knitwear', condition: 'Like New', status: 'ACTIVE', modes: ['buy', 'swap', 'rent'], salePrice: 1200, swapCredits: 30, rentalPricePerDay: 180 },
  { id: 'x', title: 'Draft Scarf', brand: 'Me', size: 'M', category: 'Outerwear', condition: 'Good', status: 'DRAFT', modes: ['swap'], swapCredits: 10 },
  { id: 'y', title: 'Swap Only Tee', brand: 'Me', size: 'M', category: 'Tops & Vests', condition: 'Fair', status: 'ACTIVE', modes: ['swap'], salePrice: 1800, swapCredits: 20 },
];
const run = (f, q = '', mode = 'all') => filterFrontendListings(L, buildCriteria({ ...EMPTY_FILTERS, ...f }, q, mode)).map((i) => i.id);

test('combined filters AND across fields, OR within a field', () => {
  assert.deepEqual(run({ sizes: ['M', 'L'], conditions: ['Like New'] }, '', 'rent').sort(), [1, 4]);
  assert.deepEqual(run({ categories: ['outerwear'] }), [1]); // case-insensitive, draft hidden
  assert.deepEqual(run({}, 'denim cargo'), [3]);
});

test('price units never mix: a sale range ignores swap-only items even if they carry a salePrice', () => {
  assert.deepEqual(run({ minPrice: '1700', maxPrice: '1900' }), [1]); // 'y' has salePrice 1800 but is not for sale
  assert.deepEqual(run({ maxRentalPerDay: '200' }), [4]);
  assert.deepEqual(run({ minSwapCredits: '45', maxSwapCredits: '50' }).sort(), [1, 3]);
});

test('sorting matches backend semantics', () => {
  assert.deepEqual(run({ sort: 'price_asc' }), [4, 2, 1, 3, 'y']); // 'y' not for sale -> last
  assert.deepEqual(run({ sort: 'rental_asc' }).slice(0, 3), [4, 1, 3]);
});

test('validation: reversed ranges, negatives, non-numbers and long keywords', () => {
  assert.deepEqual(validateCriteria(buildCriteria(EMPTY_FILTERS, '', 'all')), []);
  assert.equal(validateCriteria(buildCriteria({ ...EMPTY_FILTERS, minPrice: '5', maxPrice: '1' }, '', 'all')).length, 1);
  assert.equal(validateCriteria(buildCriteria({ ...EMPTY_FILTERS, minRentalPerDay: '-1' }, '', 'all')).length, 1);
  assert.equal(validateCriteria(buildCriteria({ ...EMPTY_FILTERS, maxSwapCredits: 'abc' }, '', 'all')).length, 1);
  assert.equal(validateCriteria(buildCriteria(EMPTY_FILTERS, 'x'.repeat(101), 'all')).length, 1);
});

test('query string uses repeated keys and omits empty values', () => {
  const c = buildCriteria({ ...EMPTY_FILTERS, sizes: ['M', 'L'], categories: ['Ethnic & Fusion'], minPrice: '' }, ' jacket ', 'rent');
  assert.equal(toQueryString(c), '?sort=newest&q=jacket&categories=Ethnic+%26+Fusion&sizes=M&sizes=L&modes=rent');
  assert.equal(hasActiveFilters(EMPTY_FILTERS, '', 'all'), false);
  assert.equal(hasActiveFilters(EMPTY_FILTERS, '', 'swap'), true);
});
