// Member 2: outfit builder model + offline demo store. Run: node --test src/discovery/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inferSlot, computeTotals, garmentFromFrontend, validateLookbookForm } from './outfitModel.js';
import { createOfflineLookbookStore, presentOfflineLookbook, OFFLINE_KEY } from './lookbookOfflineStore.js';

test('inferSlot suggests sensible slots', () => {
  assert.equal(inferSlot('Outerwear', 'Corduroy Jacket'), 'outerwear');
  assert.equal(inferSlot('Pants & Jeans', ''), 'bottom');
  assert.equal(inferSlot('Denim', 'Cargo'), 'bottom');
  assert.equal(inferSlot('Knitwear', 'Turtleneck'), 'top');
  assert.equal(inferSlot('Tops & Vests', 'Jamdani Vest'), 'layer');
  assert.equal(inferSlot('Ethnic & Fusion', 'Hand-Embroidered Jamdani Fusion Vest'), 'layer');
  assert.equal(inferSlot('Mystery', 'Thing'), 'other');
});

const g = (modes, salePrice, rentalPricePerDay, swapCredits) => ({ modes, salePrice, rentalPricePerDay, swapCredits });

test('computeTotals keeps BDT, BDT/day and credits apart and skips unavailable items', () => {
  const t = computeTotals([
    { availability: 'available', garment: g(['buy', 'rent', 'swap'], 1000, 100, 10) },
    { availability: 'available', garment: g(['swap'], null, null, 20) },
    { availability: 'reserved', garment: g(['buy'], 5000, null, null) },
    { availability: 'missing', garment: g(['buy'], 7000, null, null) },
  ]);
  assert.deepEqual(t.purchase, { unit: 'BDT', amount: 1000, itemCount: 1 });
  assert.deepEqual(t.rentalPerDay, { unit: 'BDT/day', amount: 100, itemCount: 1 });
  assert.deepEqual(t.swapCredits, { unit: 'credits', amount: 30, itemCount: 2 });
  assert.equal(t.excludedUnavailable, 2);
});

test('garmentFromFrontend drops prices for modes the item is not offered in', () => {
  // App.jsx's Seller Studio handler defaults salePrice to 1800 even for swap-only items.
  const swapOnly = garmentFromFrontend({ id: 'x', title: 'T', modes: ['swap'], salePrice: 1800, swapCredits: 20 });
  assert.equal(swapOnly.salePrice, null);
  assert.equal(swapOnly.swapCredits, 20);
});

test('validateLookbookForm', () => {
  assert.deepEqual(validateLookbookForm({ name: 'A', items: [{}] }), []);
  assert.equal(validateLookbookForm({ name: ' ', items: [] }).length, 2);
  assert.equal(validateLookbookForm({ name: 'A'.repeat(81), items: [{}] }).length, 1);
  assert.equal(validateLookbookForm({ name: 'A', items: Array(9).fill({}) }).length, 1);
});

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), raw: m };
}

test('offline demo store: create, list, edit, delete, and graceful missing garments', () => {
  const storage = memoryStorage();
  const store = createOfflineLookbookStore(storage);
  const jacket = { id: 1, title: 'Jacket', brand: 'B', size: 'M', category: 'Outerwear', modes: ['buy'], salePrice: 100, status: 'ACTIVE' };
  const pants = { id: 3, title: 'Pants', brand: 'B', size: '32', category: 'Pants', modes: ['rent'], rentalPricePerDay: 50, status: 'RESERVED' };
  const garments = new Map([jacket, pants].map((i) => [String(i.id), garmentFromFrontend(i)]));

  const created = store.create({ name: ' Demo ', occasion: '', items: [{ listingId: '1', slot: 'outerwear' }, { listingId: '3', slot: 'bottom' }] }, garments);
  assert.equal(created.name, 'Demo');
  assert.equal(created.occasion, null);
  assert.ok(storage.raw.has(OFFLINE_KEY));
  assert.equal(store.list().length, 1);

  // jacket deleted from the page: lookbook still renders it from the stored copy
  const shown = presentOfflineLookbook(store.get(created.id), [pants]);
  assert.equal(shown.items[0].availability, 'missing');
  assert.equal(shown.items[0].garment.title, 'Jacket');
  assert.equal(shown.items[1].availability, 'reserved');
  assert.equal(shown.totals.purchase.amount, 0);

  const edited = store.update(created.id, { name: 'Demo 2', items: [{ listingId: '1', slot: 'top' }] }, new Map());
  assert.equal(edited.items[0].garment.title, 'Jacket'); // kept from previous record
  assert.throws(() => store.create({ name: 'x', items: [{ listingId: '99', slot: 'top' }] }, garments), /not available/);

  store.remove(created.id);
  assert.equal(store.list().length, 0);
  assert.throws(() => store.remove(created.id), /not found/);
});

test('offline store reports when browser storage is unavailable', () => {
  const store = createOfflineLookbookStore(null);
  assert.equal(store.available, false);
  assert.deepEqual(store.list(), []);
  assert.throws(() => store.create({ name: 'x', items: [{ listingId: '1', slot: 'top' }] }, new Map([['1', {}]])), /unavailable/);
});
