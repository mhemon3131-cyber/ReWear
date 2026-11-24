// Member 2 - Feature 6: Advanced Multi-Filter Marketplace Search (backend).
// Run: npx nest build && node --test test/member2/
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startApp, qs } = require('./helpers');

let api;
before(async () => {
  api = await startApp({ M2_DATABASE_URL: undefined, DATABASE_URL: undefined });
});
after(async () => api && api.close());

const ids = (r) => r.body.results.map((l) => l.id);

test('no filters: returns only marketplace-visible listings (ACTIVE/RESERVED), newest first', async () => {
  const r = await api.get('/discovery/search');
  assert.equal(r.status, 200);
  assert.equal(r.body.source, 'backend');
  assert.equal(r.body.total, r.body.results.length);
  assert.deepEqual(ids(r), ['list_4', 'list_3', 'list_2', 'list_1', 'list_5']);
  assert.ok(!ids(r).includes('list_6'), 'SOLD listing must not be returned');
  // knownIds covers every status so the frontend can reconcile IDs.
  assert.ok(r.body.catalog.knownIds.includes('list_6'));
  assert.ok(r.body.facets.categories.includes('Outerwear'));
});

test('keyword search is case-insensitive and requires every word', async () => {
  assert.deepEqual(ids(await api.get('/discovery/search' + qs({ q: 'CORDUROY jacket' }))), ['list_1']);
  assert.deepEqual(ids(await api.get('/discovery/search' + qs({ q: 'corduroy sweater' }))), []);
  // matches brand and colour fields too
  assert.deepEqual(ids(await api.get('/discovery/search' + qs({ q: 'aarong' }))), ['list_2']);
});

test('combined filters: category + size + condition + mode + sale price range', async () => {
  const r = await api.get(
    '/discovery/search' +
      qs({ categories: ['Outerwear', 'Knitwear'], sizes: ['M', 'L'], conditions: 'Like New', modes: 'rent', maxPrice: 2000 }),
  );
  assert.equal(r.status, 200);
  // list_5 (Outerwear, Free Size, rent-only, no sale price) excluded by size and price.
  assert.deepEqual(ids(r).sort(), ['list_1', 'list_4']);
});

test('multiple values within one filter are OR-ed; different filters are AND-ed', async () => {
  const r = await api.get('/discovery/search' + qs({ sizes: ['S', '32'] }));
  assert.deepEqual(ids(r).sort(), ['list_2', 'list_3']);
  const r2 = await api.get('/discovery/search' + qs({ sizes: ['S', '32'], categories: 'Denim' }));
  assert.deepEqual(ids(r2), ['list_3']);
});

test('price units are filtered separately (sale BDT, rent BDT/day, swap credits)', async () => {
  // rent range only matches listings that are actually rentable
  const rent = await api.get('/discovery/search' + qs({ minRentalPerDay: 200, maxRentalPerDay: 320 }));
  assert.deepEqual(ids(rent).sort(), ['list_1', 'list_3']);
  // a sale-price range excludes rent/swap-only items with no sale price (list_5)
  const sale = await api.get('/discovery/search' + qs({ minPrice: 0 }));
  assert.ok(!ids(sale).includes('list_5'));
  const credits = await api.get('/discovery/search' + qs({ minSwapCredits: 50 }));
  assert.deepEqual(ids(credits).sort(), ['list_3', 'list_5']);
});

test('sorting by sale price puts listings without a sale price last', async () => {
  const asc = ids(await api.get('/discovery/search' + qs({ sort: 'price_asc' })));
  assert.deepEqual(asc, ['list_4', 'list_2', 'list_1', 'list_3', 'list_5']);
  const desc = ids(await api.get('/discovery/search' + qs({ sort: 'price_desc' })));
  assert.deepEqual(desc, ['list_3', 'list_1', 'list_2', 'list_4', 'list_5']);
  const rent = ids(await api.get('/discovery/search' + qs({ sort: 'rental_asc' })));
  assert.deepEqual(rent.slice(-1), ['list_2']); // not rentable -> last
});

test('input validation rejects bad values with 400', async () => {
  const bad = [
    { conditions: 'Destroyed' },
    { modes: 'steal' },
    { sort: 'random' },
    { minPrice: 'abc' },
    { minPrice: -5 },
    { maxRentalPerDay: 99999999 },
    { q: 'x'.repeat(101) },
    { minPrice: 3000, maxPrice: 1000 },
    { minSwapCredits: 60, maxSwapCredits: 10 },
  ];
  for (const params of bad) {
    const r = await api.get('/discovery/search' + qs(params));
    assert.equal(r.status, 400, `expected 400 for ${JSON.stringify(params)}, got ${r.status}`);
  }
  // empty numeric params are treated as "not set", not zero
  const empty = await api.get('/discovery/search?minPrice=&maxPrice=');
  assert.equal(empty.status, 200);
  assert.equal(empty.body.total, 5);
});

const studioPayload = (overrides) => ({
  title: 'Member2 Probe Linen Kurta',
  description: 'Searchable probe listing',
  brand: 'ProbeBrand',
  category: 'Ethnic & Fusion',
  size: 'XL',
  color: ['Warm Cream'],
  images: ['https://example.com/x.jpg'],
  condition: 'Good',
  defectDisclosure: 'None',
  modes: ['buy'],
  salePrice: 777,
  status: 'ACTIVE',
  sellerId: 'probe@student.edu',
  ...overrides,
});

test('Seller Studio DRAFT listings stay hidden from buyers but are known to the server', async () => {
  const draft = await api.post('/listings', studioPayload({ title: 'Member2 Draft Probe Scarf', status: 'DRAFT' }));
  assert.equal(draft.status, 201, JSON.stringify(draft.body));
  const r = await api.get('/discovery/search' + qs({ q: 'draft probe scarf' }));
  assert.deepEqual(ids(r), []);
  assert.ok(r.body.catalog.knownIds.includes(draft.body.id));
});

test('listings created through POST /listings (Seller Studio) are searchable immediately', async () => {
  const created = await api.post('/listings', {
    sellerId: 'probe@student.edu',
    title: 'Member2 Probe Linen Kurta',
    description: 'Searchable probe listing',
    brand: 'ProbeBrand',
    category: 'Ethnic & Fusion',
    size: 'XL',
    color: ['Warm Cream'],
    images: ['https://example.com/x.jpg'],
    condition: 'Good',
    defectDisclosure: 'None',
    modes: ['buy'],
    salePrice: 777,
    status: 'ACTIVE',
  });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const r = await api.get('/discovery/search' + qs({ q: 'probe kurta', sizes: 'XL' }));
  assert.deepEqual(ids(r), [created.body.id]);
  assert.ok(r.body.catalog.knownIds.includes(created.body.id));
});

test('existing public listing APIs still work (regression)', async () => {
  const browse = await api.get('/listings?mode=rent');
  assert.equal(browse.status, 200);
  assert.ok(browse.body.every((l) => l.modes.includes('rent')));
  const feed = await api.get('/discovery/feed');
  assert.equal(feed.status, 200);
  const ai = await api.post('/discovery/ai-search', { query: 'jacket' });
  assert.equal(ai.status, 201);
});

test('search does not change listing view analytics', async () => {
  const before = (await api.get('/listings/seller/usr_02')).body.find((l) => l.id === 'list_1').analytics.views;
  await api.get('/discovery/search');
  await api.get('/discovery/search' + qs({ q: 'jacket' }));
  const afterViews = (await api.get('/listings/seller/usr_02')).body.find((l) => l.id === 'list_1').analytics.views;
  assert.equal(afterViews, before);
});
