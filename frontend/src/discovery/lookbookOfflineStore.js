// Member 2 - Feature 10: OFFLINE DEMO lookbook store (browser localStorage).
//
// Used ONLY after the user explicitly chooses "offline demo" while the backend is
// unreachable. Data stays in this browser; nothing is saved on the server. The UI must
// never describe a save here as a successful backend save.
import { availabilityFromStatus, computeTotals, garmentFromFrontend } from './outfitModel.js';

export const OFFLINE_KEY = 'rewear.m2.offlineDemoLookbooks.v1';

function defaultStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function createOfflineLookbookStore(storage = defaultStorage()) {
  const read = () => {
    try {
      const parsed = JSON.parse(storage?.getItem(OFFLINE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const write = (records) => {
    if (!storage) throw new Error('Browser storage is unavailable, so the offline demo cannot save.');
    storage.setItem(OFFLINE_KEY, JSON.stringify(records));
  };
  const now = () => new Date().toISOString();

  /** @param garmentsByKey Map<string, garment> of currently known frontend garments */
  const toItems = (items, garmentsByKey, previous = []) =>
    items.map((it, position) => {
      const g = garmentsByKey.get(it.listingId) || previous.find((p) => p.listingId === it.listingId)?.garment;
      if (!g) throw new Error(`Garment ${it.listingId} is not available in this browser.`);
      return { listingId: it.listingId, slot: it.slot, position, garment: g };
    });

  return {
    available: !!storage,
    list: () => read().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))),
    get: (id) => read().find((r) => r.id === id) || null,
    create(payload, garmentsByKey) {
      const records = read();
      const record = {
        id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: payload.name.trim(),
        occasion: payload.occasion?.trim() || null,
        notes: payload.notes?.trim() || null,
        items: toItems(payload.items, garmentsByKey),
        createdAt: now(),
        updatedAt: now(),
      };
      write([record, ...records]);
      return record;
    },
    update(id, payload, garmentsByKey) {
      const records = read();
      const idx = records.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Offline demo lookbook not found.');
      const prev = records[idx];
      const next = {
        ...prev,
        name: payload.name.trim(),
        occasion: payload.occasion?.trim() || null,
        notes: payload.notes?.trim() || null,
        items: toItems(payload.items, garmentsByKey, prev.items),
        updatedAt: now(),
      };
      records[idx] = next;
      write(records);
      return next;
    },
    remove(id) {
      const records = read();
      const next = records.filter((r) => r.id !== id);
      if (next.length === records.length) throw new Error('Offline demo lookbook not found.');
      write(next);
    },
  };
}

/** Same response shape as the backend's presented lookbook, using current frontend listings. */
export function presentOfflineLookbook(record, frontendListings) {
  const live = new Map(frontendListings.map((l) => [String(l.id), l]));
  const items = record.items.map((it) => {
    const current = live.get(it.listingId);
    return {
      listingId: it.listingId,
      slot: it.slot,
      position: it.position,
      availability: current ? availabilityFromStatus(current.status || 'ACTIVE') : 'missing',
      garment: current ? garmentFromFrontend(current) : it.garment,
    };
  });
  return { ...record, items, totals: computeTotals(items) };
}
