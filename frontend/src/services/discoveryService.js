// Member 2: API layer for Buyer Experience & Fashion Discovery.
// Unlike some older service helpers, this module never invents a "success" result:
// - BackendUnreachableError: the request could not reach the server (network/CORS/offline).
// - ApiError: the server answered with an error status. Callers must show it, not hide it.
import { toQueryString } from '../discovery/marketplaceFilters';

const API_ROOT = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5001/api/v1';
const DISCOVERY = `${API_ROOT}/discovery`;

export class BackendUnreachableError extends Error {
  constructor(cause) {
    super('The ReWear backend could not be reached.');
    this.name = 'BackendUnreachableError';
    this.cause = cause;
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    // Content-Type only when sending a body: a plain GET then needs no CORS preflight.
    res = await fetch(DISCOVERY + path, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new BackendUnreachableError(err);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message || `Request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }
  return data;
}

// ---- Feature 6: Advanced Multi-Filter Marketplace Search ----
export function searchListings(criteria, { signal } = {}) {
  return request(`/search${toQueryString(criteria)}`, { signal });
}

// ---- Feature 10: Outfit Builder & Digital Lookbook ----
export const getLookbookStatus = () => request('/lookbooks/status');
export const listLookbooks = () => request('/lookbooks');
export const getLookbook = (id) => request(`/lookbooks/${encodeURIComponent(id)}`);
export const createLookbook = (payload) => request('/lookbooks', { method: 'POST', body: JSON.stringify(payload) });
export const updateLookbook = (id, payload) =>
  request(`/lookbooks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });
export const deleteLookbook = (id) => request(`/lookbooks/${encodeURIComponent(id)}`, { method: 'DELETE' });
