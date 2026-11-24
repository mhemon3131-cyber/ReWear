// Member 2: listing-ID mapping tests.  Run: node --test src/discovery/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  SEED_LISTING_ID_MAP,
  SERVER_ONLY_SEED_LISTINGS,
  resolveBackendId,
  reconcileListings,
  adaptBackendListing,
} from './listingIdMap.js';

const appSource = readFileSync(fileURLToPath(new URL('../App.jsx', import.meta.url)), 'utf8');
const backendSeedSource = readFileSync(
  fileURLToPath(new URL('../../../backend/src/modules/listings/listings.service.ts', import.meta.url)),
  'utf8',
);

// Extract { id, brand, size } of each seed object from a source block.
function extractSeeds(source, idPattern) {
  const out = new Map();
  const re = new RegExp(`id:\\s*(${idPattern}),[\\s\\S]*?brand:\\s*(["'])(.*?)\\2,[\\s\\S]*?size:\\s*(["'])(.*?)\\4,`, 'g');
  for (const m of source.matchAll(re)) out.set(m[1].replace(/'/g, ''), { brand: m[3], size: m[5] });
  return out;
}

test('every seed mapping fingerprint matches BOTH the App.jsx card and the backend seed', () => {
  const frontendSeeds = extractSeeds(appSource.slice(appSource.indexOf('const initialListings')), '\\d+');
  const backendSeeds = extractSeeds(backendSeedSource, "'list_\\d+'");
  assert.deepEqual([...frontendSeeds.keys()], ['1', '2', '3', '4']);
  assert.deepEqual([...backendSeeds.keys()], ['list_1', 'list_2', 'list_3', 'list_4', 'list_5', 'list_6']);
  for (const { frontendId, backendId, fingerprint } of SEED_LISTING_ID_MAP) {
    assert.deepEqual(frontendSeeds.get(String(frontendId)), fingerprint, `frontend card ${frontendId}`);
    assert.deepEqual(backendSeeds.get(backendId), fingerprint, `backend ${backendId}`);
  }
  // Every backend seed is either mapped or explicitly documented as server-only.
  for (const backendId of backendSeeds.keys()) {
    const mapped = SEED_LISTING_ID_MAP.some((e) => e.backendId === backendId);
    assert.ok(mapped || backendId in SERVER_ONLY_SEED_LISTINGS, `${backendId} is unaccounted for`);
  }
});

const known = new Set(['list_1', 'list_2', 'list_3', 'list_4', 'list_5', 'list_6', 'list_1700000000000_ab12c']);
const card = (id, brand, size, extra = {}) => ({ id, brand, size, status: 'ACTIVE', modes: ['buy'], title: `t${id}`, ...extra });

test('resolveBackendId: seed table, server-assigned IDs, and local-only items', () => {
  assert.deepEqual(resolveBackendId(card(1, 'Zara Eco-Line', 'M'), known), { backendId: 'list_1', reason: 'seed-map' });
  // Same numeric ID but different garment -> not mapped.
  assert.equal(resolveBackendId(card(1, 'Other Brand', 'XL'), known).backendId, null);
  // String '1' is not the seed card 1.
  assert.equal(resolveBackendId(card('1', 'Zara Eco-Line', 'M'), known).backendId, null);
  // Studio item created online keeps the server ID.
  assert.equal(resolveBackendId(card('list_1700000000000_ab12c', 'X', 'M'), known).backendId, 'list_1700000000000_ab12c');
  // Studio offline fallback 'list_<ts>' looks like a backend ID but the server never saw it.
  assert.deepEqual(resolveBackendId(card('list_1800000000000', 'X', 'M'), known), { backendId: null, reason: 'local-only' });
  // Seed card whose backend twin is gone.
  assert.equal(resolveBackendId(card(2, 'Aarong Heritage', 'S'), new Set(['list_1'])).reason, 'seed-not-on-server');
});

const entity = (id, brand, size, extra = {}) => ({
  id, brand, size, title: `e${id}`, status: 'ACTIVE', modes: ['buy', 'rent'], salePrice: 100, rentalPricePerDay: 10,
  images: ['img.jpg'], createdAt: '2026-01-01T00:00:00Z', ...extra,
});

test('reconcileListings keeps frontend objects, adds server-only, hides locally removed', () => {
  const f1 = card(1, 'Zara Eco-Line', 'M');
  const local = card('list_1800000000000', 'Local', 'S');
  const { entries, localOnly } = reconcileListings({
    backendResults: [entity('list_1', 'Zara Eco-Line', 'M'), entity('list_2', 'Aarong Heritage', 'S'), entity('list_5', 'Handicraft Guild', 'Free Size')],
    frontendListings: [f1, local],
    knownIds: known,
    everSeenFrontendIds: new Set([1, 2, 'list_1800000000000']), // card 2 was deleted locally
  });
  assert.equal(entries[0].item, f1, 'same object reference as App state');
  assert.equal(entries[0].provenance, 'server');
  assert.deepEqual(entries.map((e) => e.item.id), [1, 'list_5']);
  assert.equal(entries[1].provenance, 'server-only');
  assert.deepEqual(localOnly, [local]);
});

test('reconcileListings: backend seed with changed fingerprint is not merged into the frontend card', () => {
  const f1 = card(1, 'Zara Eco-Line', 'M');
  const { entries, localOnly } = reconcileListings({
    backendResults: [entity('list_1', 'Renamed Brand', 'XXL')],
    frontendListings: [f1],
    knownIds: known,
    everSeenFrontendIds: new Set([1]),
  });
  // frontend card still resolves by seed table (its own fingerprint matches) ...
  assert.equal(entries[0].provenance, 'server');
  assert.equal(localOnly.length, 0);
});

test('adaptBackendListing keeps purchase, rental and credit values separate', () => {
  const a = adaptBackendListing(entity('list_5', 'H', 'Free Size', { modes: ['rent', 'swap'], salePrice: undefined, swapCredits: 60, rentalPricePerDay: 350 }));
  assert.equal(a.price, 'Not for sale');
  assert.equal(a.rentPrice, '৳350/day');
  assert.equal(a.swapCredits, 60);
  assert.equal(a.isServerOnly, true);
});
