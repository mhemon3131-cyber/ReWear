// Member 2 - Feature 6: Advanced Multi-Filter Marketplace Search (React hook).
//
// Primary path: GET /api/v1/discovery/search on the NestJS backend.
// Results are reconciled with App.jsx's `listings` state so the card objects passed to
// Checkout / SmartSwap / Seller Studio are the same objects as before.
//
// Listings the server does not know (e.g. Seller Studio items saved while the backend was
// offline) are filtered locally with identical rules and labelled "local only".
// If the backend cannot be reached at all, the whole grid is filtered locally and the UI
// says so. An HTTP error from the server is shown as an error; it never switches to local.
import { useEffect, useMemo, useState } from 'react';
import { searchListings, BackendUnreachableError } from '../services/discoveryService';
import {
  EMPTY_FILTERS,
  CONDITIONS,
  buildCriteria,
  validateCriteria,
  comparatorFor,
  frontendToRecord,
  matchesCriteria,
  filterFrontendListings,
} from '../discovery/marketplaceFilters';
import { reconcileListings } from '../discovery/listingIdMap';

const uniqueSorted = (values) =>
  Array.from(new Set(values.filter((v) => typeof v === 'string' && v.trim() !== ''))).sort((a, b) => a.localeCompare(b));

export function useMarketplaceSearch({ listings, keyword, mode }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [response, setResponse] = useState(null); // { key, data }
  const [phase, setPhase] = useState('loading'); // 'loading' | 'online' | 'offline' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Every frontend listing ID seen this session, so a garment the seller removed locally
  // is not resurrected from server results. (Derived-state pattern: update during render.)
  const [seenIds, setSeenIds] = useState(() => new Set(listings.map((l) => l.id)));
  if (listings.some((l) => !seenIds.has(l.id))) {
    setSeenIds((prev) => new Set([...prev, ...listings.map((l) => l.id)]));
  }

  const criteria = useMemo(() => buildCriteria(filters, keyword, mode), [filters, keyword, mode]);
  const validationErrors = useMemo(() => validateCriteria(criteria), [criteria]);
  const criteriaKey = JSON.stringify(criteria);
  // Refetch when listings are added/removed/change status so new Seller Studio items are
  // confirmed against the server catalogue.
  const listingsKey = listings.map((l) => `${l.id}:${l.status}`).join('|');
  const isValid = validationErrors.length === 0;

  useEffect(() => {
    if (!isValid) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await searchListings(JSON.parse(criteriaKey), { signal: controller.signal });
        setResponse({ key: criteriaKey, data });
        setPhase('online');
        setErrorMessage('');
      } catch (err) {
        if (err?.name === 'AbortError') return;
        if (err instanceof BackendUnreachableError) {
          setPhase('offline');
        } else {
          setPhase('error');
          setErrorMessage(err.message || 'Search failed.');
        }
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [criteriaKey, listingsKey, isValid]);

  const view = useMemo(() => {
    const empty = { items: [], provenance: new Map(), localOnlyCount: 0 };
    if (!isValid) return { ...empty, source: 'invalid' };
    if (phase === 'offline') {
      const items = filterFrontendListings(listings, criteria);
      return { ...empty, items, provenance: new Map(items.map((i) => [i.id, 'local-only'])), source: 'offline' };
    }
    if (phase === 'error') return { ...empty, source: 'error' };
    if (!response) return { ...empty, source: 'loading' };

    const data = response.data;
    const knownIds = new Set(data.catalog?.knownIds || []);
    const { entries, localOnly } = reconcileListings({
      backendResults: data.results || [],
      frontendListings: listings,
      knownIds,
      everSeenFrontendIds: seenIds,
    });
    const localMatches = localOnly
      .map((item) => ({ item, record: frontendToRecord(item), provenance: 'local-only' }))
      .filter((e) => matchesCriteria(e.record, criteria));
    const cmp = comparatorFor(criteria.sort);
    const merged = [...entries, ...localMatches].sort((a, b) => cmp(a.record, b.record));
    return {
      items: merged.map((e) => e.item),
      provenance: new Map(merged.map((e) => [e.item.id, e.provenance])),
      localOnlyCount: localMatches.length,
      source: 'online',
    };
  }, [isValid, phase, response, listings, criteria, seenIds]);

  const facets = useMemo(() => {
    const backendFacets = phase !== 'offline' ? response?.data?.facets : null;
    return {
      categories: uniqueSorted([...(backendFacets?.categories || []), ...listings.map((l) => l.category), ...filters.categories]),
      sizes: uniqueSorted([...(backendFacets?.sizes || []), ...listings.map((l) => l.size), ...filters.sizes]),
      conditions: CONDITIONS,
    };
  }, [phase, response, listings, filters.categories, filters.sizes]);

  return {
    filters,
    setFilters,
    resetFilters: () => setFilters(EMPTY_FILTERS),
    criteria,
    validationErrors,
    facets,
    phase: view.source,
    pending: view.source === 'online' && response?.key !== criteriaKey,
    errorMessage,
    items: view.items,
    provenance: view.provenance,
    localOnlyCount: view.localOnlyCount,
  };
}
