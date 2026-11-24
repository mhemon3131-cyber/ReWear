// Member 2 - Feature 10: Outfit Builder & Digital Lookbook (backend).
// Run: npx nest build && node --test test/member2/
// PostgreSQL tests run only when M2_TEST_DATABASE_URL points at a migrated test database.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startApp } = require('./helpers');

const DEMO = { M2_DEMO_IDENTITY: 'true', M2_DEMO_USER_ID: 'demo_buyer_m2' };
const NO_DB = { M2_DATABASE_URL: undefined, DATABASE_URL: undefined };
const PG_URL = process.env.M2_TEST_DATABASE_URL;

const outfit = (overrides = {}) => ({
  name: 'Campus Winter Layers',
  occasion: 'Lecture day',
  notes: 'Warm but light',
  items: [
    { listingId: 'list_1', slot: 'outerwear' },
    { listingId: 'list_4', slot: 'top' },
    { listingId: 'list_3', slot: 'bottom' },
  ],
  ...overrides,
});

function crudSuite(label, env, { persistent }) {
  describe(`lookbook CRUD (${label})`, () => {
    let api;
    before(async () => {
      api = await startApp({ ...env, ...DEMO });
    });
    after(async () => api && api.close());

    test('status reports storage mode honestly and labels the demo identity', async () => {
      const r = await api.get('/discovery/lookbooks/status');
      assert.equal(r.status, 200);
      assert.equal(r.body.storage.ready, true);
      assert.equal(r.body.storage.persistent, persistent);
      if (!persistent) assert.match(r.body.storage.message, /DEMO MODE.*not persistent/);
      assert.equal(r.body.identity.mode, 'demo');
      assert.equal(r.body.identity.secure, false);
    });

    let id;
    test('create -> list -> view', async () => {
      const c = await api.post('/discovery/lookbooks', outfit());
      assert.equal(c.status, 201, JSON.stringify(c.body));
      assert.equal(c.body.storage.persistent, persistent);
      const lb = c.body.lookbook;
      id = lb.id;
      assert.match(id, /^[0-9a-f-]{36}$/);
      assert.deepEqual(lb.items.map((i) => [i.listingId, i.slot, i.position]), [['list_1', 'outerwear', 0], ['list_4', 'top', 1], ['list_3', 'bottom', 2]]);
      assert.equal(lb.items[0].garment.title, 'Vintage Corduroy Oversized Jacket');
      // separate totals (no unit mixing): 1850 + 1200 + 2100 BDT, 250 + 180 + 300 BDT/day, 45 + 30 + 50 credits
      assert.deepEqual(lb.totals.purchase, { unit: 'BDT', amount: 5150, itemCount: 3 });
      assert.deepEqual(lb.totals.rentalPerDay, { unit: 'BDT/day', amount: 730, itemCount: 3 });
      assert.deepEqual(lb.totals.swapCredits, { unit: 'credits', amount: 125, itemCount: 3 });
      assert.ok(!('waterSavingsLiters' in lb.items[0].garment), 'no eco-impact data in Member 2 lookbooks');

      const list = await api.get('/discovery/lookbooks');
      assert.equal(list.status, 200);
      assert.ok(list.body.lookbooks.some((l) => l.id === id));

      const view = await api.get(`/discovery/lookbooks/${id}`);
      assert.equal(view.status, 200);
      assert.equal(view.body.lookbook.name, 'Campus Winter Layers');
    });

    test('edit: rename, clear occasion, reorder/replace garments', async () => {
      const u = await api.put(`/discovery/lookbooks/${id}`, {
        name: '  Weekend Swap Fit  ',
        notes: 'Updated',
        items: [
          { listingId: 'list_2', slot: 'layer' },
          { listingId: 'list_1', slot: 'outerwear' },
        ],
      });
      assert.equal(u.status, 200, JSON.stringify(u.body));
      const lb = u.body.lookbook;
      assert.equal(lb.name, 'Weekend Swap Fit');
      assert.equal(lb.occasion, null);
      assert.deepEqual(lb.items.map((i) => i.listingId), ['list_2', 'list_1']);
      assert.ok(new Date(lb.updatedAt) >= new Date(lb.createdAt));
      // list_2 is not rentable: rental total counts only list_1.
      assert.deepEqual(lb.totals.rentalPerDay, { unit: 'BDT/day', amount: 250, itemCount: 1 });
    });

    test('reserved garments can be planned but are excluded from totals', async () => {
      const c = await api.post('/discovery/lookbooks', outfit({ name: 'Shawl look', items: [{ listingId: 'list_5', slot: 'outerwear' }] }));
      assert.equal(c.status, 201);
      assert.equal(c.body.lookbook.items[0].availability, 'reserved');
      assert.equal(c.body.lookbook.totals.excludedUnavailable, 1);
      assert.equal(c.body.lookbook.totals.rentalPerDay.amount, 0);
      assert.equal((await api.del(`/discovery/lookbooks/${c.body.lookbook.id}`)).status, 200);
    });

    test('validation errors', async () => {
      const cases = [
        [{ ...outfit(), name: '   ' }, /name is required/i],
        [{ ...outfit(), name: 'x'.repeat(81) }, /name/],
        [{ ...outfit(), items: [] }, /at least one garment/],
        [{ ...outfit(), items: Array.from({ length: 9 }, (_, i) => ({ listingId: `list_${i}`, slot: 'top' })) }, /at most 8/],
        [{ ...outfit(), items: [{ listingId: 'list_1', slot: 'hat' }] }, /slot/],
        [{ ...outfit(), items: [{ listingId: 'list_1', slot: 'top' }, { listingId: 'list_1', slot: 'outerwear' }] }, /more than once/],
        [{ ...outfit(), items: [{ listingId: 'list_999', slot: 'top' }] }, /not on the server/],
        [{ ...outfit(), items: [{ listingId: 'list_6', slot: 'top' }] }, /SOLD and cannot be added/],
        [{ ...outfit(), occasion: 'o'.repeat(61) }, /occasion/],
        [{ ...outfit(), notes: 'n'.repeat(501) }, /notes/],
      ];
      for (const [body, pattern] of cases) {
        const r = await api.post('/discovery/lookbooks', body);
        assert.equal(r.status, 400, `expected 400 for ${pattern}: got ${r.status}`);
        assert.match(JSON.stringify(r.body.message), pattern);
      }
      assert.equal((await api.get('/discovery/lookbooks/not-a-uuid')).status, 400);
      assert.equal((await api.get('/discovery/lookbooks/7f0c4f53-2a52-4f43-9f19-6a1f5c0e9a11')).status, 404);
      assert.equal((await api.put('/discovery/lookbooks/7f0c4f53-2a52-4f43-9f19-6a1f5c0e9a11', outfit())).status, 404);
    });

    test('deleted garments are shown from the saved snapshot and may stay on edit', async () => {
      const created = await api.post('/listings', {
        title: 'M2 Temporary Scarf', description: 'tmp', brand: 'Tmp', category: 'Accessories', size: 'Free Size',
        color: ['Red'], images: ['https://example.com/s.jpg'], condition: 'Good', defectDisclosure: 'None',
        modes: ['buy'], salePrice: 300, status: 'ACTIVE', sellerId: 'probe@student.edu',
      });
      assert.equal(created.status, 201);
      const tmpId = created.body.id;
      const c = await api.post('/discovery/lookbooks', outfit({ name: 'Scarf look', items: [{ listingId: tmpId, slot: 'accessory' }, { listingId: 'list_1', slot: 'outerwear' }] }));
      assert.equal(c.status, 201);
      const lbId = c.body.lookbook.id;

      assert.equal((await api.del(`/listings/${tmpId}`)).status, 200); // seller removes the garment
      const v = await api.get(`/discovery/lookbooks/${lbId}`);
      const gone = v.body.lookbook.items.find((i) => i.listingId === tmpId);
      assert.equal(gone.availability, 'missing');
      assert.equal(gone.garment.title, 'M2 Temporary Scarf'); // from snapshot
      assert.equal(v.body.lookbook.totals.purchase.amount, 1850); // missing item excluded

      // Editing other fields keeps the missing garment...
      const keep = await api.put(`/discovery/lookbooks/${lbId}`, outfit({ name: 'Scarf look v2', items: [{ listingId: tmpId, slot: 'accessory' }] }));
      assert.equal(keep.status, 200, JSON.stringify(keep.body));
      assert.equal(keep.body.lookbook.items[0].garment.title, 'M2 Temporary Scarf');
      // ...but it cannot be added to a different lookbook.
      const other = await api.post('/discovery/lookbooks', outfit({ items: [{ listingId: tmpId, slot: 'accessory' }] }));
      assert.equal(other.status, 400);
      assert.equal((await api.del(`/discovery/lookbooks/${lbId}`)).status, 200);
    });

    test('delete removes the lookbook', async () => {
      const d = await api.del(`/discovery/lookbooks/${id}`);
      assert.equal(d.status, 200);
      assert.equal(d.body.deleted, true);
      assert.equal((await api.get(`/discovery/lookbooks/${id}`)).status, 404);
      assert.equal((await api.del(`/discovery/lookbooks/${id}`)).status, 404);
    });
  });
}

crudSuite('memory-demo', { ...NO_DB, M2_LOOKBOOK_STORAGE: 'memory-demo' }, { persistent: false });

describe('lookbook safety defaults', () => {
  test('without M2_DEMO_IDENTITY, lookbooks are refused with 401 (auth is not weakened)', async () => {
    const api = await startApp({ ...NO_DB, M2_LOOKBOOK_STORAGE: 'memory-demo', M2_DEMO_IDENTITY: undefined });
    try {
      const r = await api.get('/discovery/lookbooks');
      assert.equal(r.status, 401);
      assert.match(r.body.message, /M2_DEMO_IDENTITY=true/);
      const s = await api.get('/discovery/lookbooks/status');
      assert.equal(s.body.identity.mode, 'disabled');
      assert.equal((await api.post('/discovery/lookbooks', outfit())).status, 401);
    } finally {
      await api.close();
    }
  });

  test('without a database and without demo storage, saving fails with 503 + setup message (no silent fallback)', async () => {
    const api = await startApp({ ...NO_DB, ...DEMO, M2_LOOKBOOK_STORAGE: undefined });
    try {
      const s = await api.get('/discovery/lookbooks/status');
      assert.equal(s.body.storage.mode, 'unconfigured');
      assert.equal(s.body.storage.ready, false);
      const r = await api.post('/discovery/lookbooks', outfit());
      assert.equal(r.status, 503);
      assert.match(r.body.message, /M2_DATABASE_URL/);
    } finally {
      await api.close();
    }
  });

  test('unreachable PostgreSQL returns 503, never a fake success', async () => {
    const api = await startApp({ ...DEMO, M2_LOOKBOOK_STORAGE: 'postgres', M2_DATABASE_URL: 'postgres://nobody:nothing@127.0.0.1:1/none' });
    try {
      const r = await api.post('/discovery/lookbooks', outfit());
      assert.equal(r.status, 503);
      assert.match(r.body.message, /PostgreSQL error/);
    } finally {
      await api.close();
    }
  });

  test('memory demo data is lost on restart (documented, not persistence)', async () => {
    const env = { ...NO_DB, ...DEMO, M2_LOOKBOOK_STORAGE: 'memory-demo' };
    let api = await startApp(env);
    await api.post('/discovery/lookbooks', outfit());
    assert.equal((await api.get('/discovery/lookbooks')).body.lookbooks.length, 1);
    await api.close();
    api = await startApp(env);
    assert.equal((await api.get('/discovery/lookbooks')).body.lookbooks.length, 0);
    await api.close();
  });
});

if (PG_URL) {
  const PG_ENV = { M2_LOOKBOOK_STORAGE: 'postgres', M2_DATABASE_URL: PG_URL, DATABASE_URL: undefined };
  crudSuite('postgres', PG_ENV, { persistent: true });

  describe('PostgreSQL persistence', () => {
    test('lookbooks survive a backend restart, edits included', async () => {
      let api = await startApp({ ...PG_ENV, ...DEMO });
      const c = await api.post('/discovery/lookbooks', outfit({ name: 'Restart proof' }));
      assert.equal(c.status, 201);
      const id = c.body.lookbook.id;
      const u = await api.put(`/discovery/lookbooks/${id}`, outfit({ name: 'Restart proof (edited)', items: [{ listingId: 'list_2', slot: 'top' }] }));
      assert.equal(u.status, 200);
      await api.close();

      api = await startApp({ ...PG_ENV, ...DEMO });
      const v = await api.get(`/discovery/lookbooks/${id}`);
      assert.equal(v.status, 200);
      assert.equal(v.body.lookbook.name, 'Restart proof (edited)');
      assert.deepEqual(v.body.lookbook.items.map((i) => i.listingId), ['list_2']);
      assert.equal((await api.del(`/discovery/lookbooks/${id}`)).status, 200);
      await api.close();
    });

    test('a different owner cannot see, edit or delete someone else\'s lookbook', async () => {
      let api = await startApp({ ...PG_ENV, ...DEMO });
      const c = await api.post('/discovery/lookbooks', outfit({ name: 'Private to owner A' }));
      const id = c.body.lookbook.id;
      await api.close();

      api = await startApp({ ...PG_ENV, ...DEMO, M2_DEMO_USER_ID: 'demo_other_user' });
      assert.equal((await api.get(`/discovery/lookbooks/${id}`)).status, 404);
      assert.equal((await api.put(`/discovery/lookbooks/${id}`, outfit())).status, 404);
      assert.equal((await api.del(`/discovery/lookbooks/${id}`)).status, 404);
      assert.ok(!(await api.get('/discovery/lookbooks')).body.lookbooks.some((l) => l.id === id));
      await api.close();

      api = await startApp({ ...PG_ENV, ...DEMO });
      assert.equal((await api.del(`/discovery/lookbooks/${id}`)).status, 200);
      await api.close();
    });
  });
} else {
  test('PostgreSQL persistence tests', { skip: 'M2_TEST_DATABASE_URL not set' }, () => {});
}
