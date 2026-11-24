// Member 2 - Feature 6: Advanced Multi-Filter Marketplace Search panel.
import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Wifi, WifiOff, AlertTriangle, Loader2 } from 'lucide-react';
import { RANGE_FIELDS, SORT_OPTIONS, MODES } from '../discovery/marketplaceFilters';

const chip = (active) =>
  `px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
    active ? 'bg-[#542747] text-white border-[#542747]' : 'bg-white text-[#542747] border-[#E9C7B7] hover:bg-[#FFF5EB]'
  }`;
const input =
  'w-full rounded-lg border border-[#E9C7B7] bg-white px-2.5 py-1.5 text-xs text-[#38302F] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]';
const MODE_LABELS = { all: 'All', buy: 'Buy', swap: 'Swap', rent: 'Rent' };

function ChipGroup({ label, options, selected, onToggle }) {
  if (!options.length) return null;
  return (
    <div>
      <div className="text-[11px] font-bold text-[#542747] uppercase tracking-wider mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button key={opt} type="button" aria-pressed={selected.includes(opt)} onClick={() => onToggle(opt)} className={chip(selected.includes(opt))}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SourceBadge({ search }) {
  const map = {
    online: { icon: Wifi, text: 'Live backend search', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    offline: { icon: WifiOff, text: 'Backend unreachable: filtering this page\'s listings locally', cls: 'bg-amber-50 text-amber-900 border-amber-200' },
    error: { icon: AlertTriangle, text: 'Search error', cls: 'bg-red-50 text-red-800 border-red-200' },
    invalid: { icon: AlertTriangle, text: 'Fix the filters below', cls: 'bg-red-50 text-red-800 border-red-200' },
    loading: { icon: Loader2, text: 'Searching…', cls: 'bg-white text-[#542747] border-[#E9C7B7]' },
  };
  const { icon: Icon, text, cls } = map[search.phase] || map.loading;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      <Icon className={`w-3.5 h-3.5 ${search.phase === 'loading' || search.pending ? 'animate-spin' : ''}`} />
      {search.pending ? 'Updating…' : text}
    </span>
  );
}

export default function MarketplaceFilterPanel({ search, keyword, onKeywordChange, mode, onModeChange, onClearAll }) {
  const [open, setOpen] = useState(true);
  const { filters, setFilters, facets } = search;
  const toggle = (key) => (value) =>
    setFilters((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] }));
  const setField = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="mb-6 rounded-2xl border border-[#E9C7B7] bg-white/80 p-4 shadow-xs" data-testid="m2-filter-panel">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A94F2C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={keyword}
            maxLength={100}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Search title, brand, category, colour…"
            aria-label="Search marketplace"
            className="w-full pl-9 pr-3 py-2 rounded-full border border-[#E9C7B7] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#A94F2C]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Transaction mode">
          {['all', ...MODES].map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => onModeChange(m)} className={chip(mode === m)}>
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
        <select value={filters.sort} onChange={setField('sort')} aria-label="Sort results" className={`${input} md:w-56`}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-full border border-[#E9C7B7] bg-[#FFF5EB] px-3 py-1.5 text-xs font-bold text-[#542747]"
          aria-expanded={open}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> {open ? 'Hide filters' : 'More filters'}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <ChipGroup label="Category" options={facets.categories} selected={filters.categories} onToggle={toggle('categories')} />
            <ChipGroup label="Size" options={facets.sizes} selected={filters.sizes} onToggle={toggle('sizes')} />
            <ChipGroup label="Condition" options={facets.conditions} selected={filters.conditions} onToggle={toggle('conditions')} />
          </div>
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[#542747] uppercase tracking-wider">Price ranges (each unit filtered separately)</div>
            {RANGE_FIELDS.map((r) => (
              <div key={r.min} className="grid grid-cols-[8rem_1fr_1fr] items-center gap-2">
                <span className="text-xs text-[#38302F]">
                  {r.label} <span className="text-[#38302F]/60">({r.unit})</span>
                </span>
                <input type="number" min="0" inputMode="numeric" placeholder="Min" aria-label={`Minimum ${r.label}`} value={filters[r.min]} onChange={setField(r.min)} className={input} />
                <input type="number" min="0" inputMode="numeric" placeholder="Max" aria-label={`Maximum ${r.label}`} value={filters[r.max]} onChange={setField(r.max)} className={input} />
              </div>
            ))}
            <p className="text-[10px] text-[#38302F]/60">
              A purchase-price range only matches items for sale, a rental range only rentable items, and a credits range only swappable items.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E9C7B7]/60 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#542747]" data-testid="m2-result-count">
            {search.items.length} {search.items.length === 1 ? 'result' : 'results'}
          </span>
          <SourceBadge search={search} />
          {search.phase === 'online' && search.localOnlyCount > 0 && (
            <span className="text-[11px] text-amber-800">
              {search.localOnlyCount} not yet on the server (filtered locally)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-[#A94F2C] hover:bg-[#FFF5EB]"
        >
          <X className="w-3.5 h-3.5" /> Clear filters
        </button>
      </div>

      {search.validationErrors.length > 0 && (
        <ul className="mt-2 text-xs text-red-700 list-disc pl-5" role="alert">
          {search.validationErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {search.phase === 'error' && (
        <p className="mt-2 text-xs text-red-700" role="alert">
          The server rejected the search: {search.errorMessage}
        </p>
      )}
    </div>
  );
}
