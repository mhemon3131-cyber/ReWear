// Member 2: explicit mapping between frontend listing objects (App.jsx state) and
// backend listing IDs (NestJS ListingsService).
//
// Frontend seed cards use numeric IDs (1..4); the backend seed uses 'list_1'..'list_6'.
// The pairing below was checked by hand against both seed files and is guarded by a
// fingerprint (brand + size). We never infer identity by adding/removing a 'list_'
// prefix, because Seller Studio's offline fallback also creates 'list_<timestamp>' IDs
// that the server has never seen.

export const SEED_LISTING_ID_MAP = Object.freeze([
  { frontendId: 1, backendId: 'list_1', fingerprint: { brand: 'Zara Eco-Line', size: 'M' } },
  { frontendId: 2, backendId: 'list_2', fingerprint: { brand: 'Aarong Heritage', size: 'S' } },
  { frontendId: 3, backendId: 'list_3', fingerprint: { brand: "Levi's Circular", size: '32' } },
  { frontendId: 4, backendId: 'list_4', fingerprint: { brand: 'H&M Conscious', size: 'L' } },
]);

// Backend seed listings with no frontend card. They are shown from server data only.
export const SERVER_ONLY_SEED_LISTINGS = Object.freeze({
  list_5: 'Embroidered Kashmiri Shawl Overlay: exists only in backend seed data (no card in App.jsx).',
  list_6: 'Minimalist Relaxed Linen Summer Shirt: backend-only and SOLD, so marketplace search never returns it.',
});

const norm = (v) => String(v ?? '').trim().toLowerCase();

export function fingerprintMatches(fingerprint, listing) {
  if (!fingerprint || !listing) return false;
  return norm(fingerprint.brand) === norm(listing.brand) && norm(fingerprint.size) === norm(listing.size);
}

const seedByFrontendId = new Map(SEED_LISTING_ID_MAP.map((e) => [e.frontendId, e]));
const seedByBackendId = new Map(SEED_LISTING_ID_MAP.map((e) => [e.backendId, e]));

/**
 * Resolve which backend listing (if any) a frontend listing object represents.
 * @param {object} item frontend listing object
 * @param {Set<string>} knownIds IDs the server reported in catalog.knownIds
 * @returns {{ backendId: string|null, reason: string }}
 */
export function resolveBackendId(item, knownIds) {
  if (!item) return { backendId: null, reason: 'missing-item' };
  const seed = seedByFrontendId.get(item.id);
  if (seed) {
    if (!fingerprintMatches(seed.fingerprint, item)) return { backendId: null, reason: 'seed-fingerprint-mismatch' };
    if (!knownIds.has(seed.backendId)) return { backendId: null, reason: 'seed-not-on-server' };
    return { backendId: seed.backendId, reason: 'seed-map' };
  }
  // Seller Studio items created while the backend was online carry the server-assigned ID.
  // We only trust that ID if the server confirms it still knows it.
  if (typeof item.id === 'string' && knownIds.has(item.id)) {
    return { backendId: item.id, reason: 'server-assigned-id' };
  }
  return { backendId: null, reason: 'local-only' };
}

/** The frontend ID that is allowed to represent a backend listing, if any. */
export function frontendIdClaimingBackendId(backendId) {
  const seed = seedByBackendId.get(backendId);
  return seed ? seed.frontendId : backendId;
}

/** Convert a backend ListingEntity to the frontend card shape used by App.jsx / Checkout / Swap. */
export function adaptBackendListing(entity) {
  const money = (n) => (typeof n === 'number' ? `৳${n.toLocaleString('en-US')}` : null);
  return {
    id: entity.id,
    title: entity.title,
    brand: entity.brand,
    size: entity.size,
    category: entity.category,
    originalPrice: money(entity.originalPrice) || '-',
    price: entity.modes?.includes('buy') && money(entity.salePrice) ? money(entity.salePrice) : 'Not for sale',
    salePrice: entity.salePrice ?? null,
    estimatedValueBDT: entity.salePrice ?? null,
    swapCredits: entity.swapCredits ?? null,
    rentPrice: typeof entity.rentalPricePerDay === 'number' ? `৳${entity.rentalPricePerDay}/day` : null,
    rentalPricePerDay: entity.rentalPricePerDay ?? null,
    modes: entity.modes || [],
    condition: entity.condition,
    status: entity.status,
    waterSaved: entity.waterSavingsLiters,
    carbonSaved: entity.co2AvoidedKg,
    image: entity.images?.[0] || '',
    seller: entity.sellerName || 'ReWear seller',
    sellerId: entity.sellerId,
    verified: !!entity.isVerifiedSeller,
    hasDefectDisclosure: !!entity.defectDisclosure,
    defectNote: entity.defectDisclosure || 'No disclosure provided.',
    likes: entity.analytics?.wishlistSaves ?? 0,
    isWishlisted: false,
    isServerOnly: true,
  };
}

/**
 * Merge backend search results with the frontend listing state.
 *
 * - Backend result with a frontend counterpart -> the original frontend object is used
 *   (keeps Checkout/Swap/Seller Studio behaviour identical).
 * - Backend result whose frontend counterpart was removed in this session -> hidden.
 * - Backend result never represented in the frontend (e.g. list_5) -> adapted server card.
 * - A seed whose fingerprint no longer matches -> not merged (shown as a separate server card).
 *
 * @returns {{ entries: Array<{ item: object, record: object, provenance: string }>, localOnly: object[] }}
 */
export function reconcileListings({ backendResults, frontendListings, knownIds, everSeenFrontendIds }) {
  const byBackendId = new Map();
  const localOnly = [];
  for (const item of frontendListings) {
    const { backendId } = resolveBackendId(item, knownIds);
    if (backendId) byBackendId.set(backendId, item);
    else localOnly.push(item);
  }

  const entries = [];
  for (const entity of backendResults) {
    const counterpart = byBackendId.get(entity.id);
    if (counterpart) {
      entries.push({ item: counterpart, record: entity, provenance: 'server' });
      continue;
    }
    const seed = seedByBackendId.get(entity.id);
    const seedTrusted = seed && fingerprintMatches(seed.fingerprint, entity);
    const claimId = seedTrusted ? seed.frontendId : seed ? null : entity.id;
    if (claimId !== null && everSeenFrontendIds.has(claimId)) continue; // removed locally this session
    entries.push({ item: adaptBackendListing(entity), record: entity, provenance: 'server-only' });
  }
  return { entries, localOnly };
}
