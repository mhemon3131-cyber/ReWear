// Member 2 - Feature 10: Outfit Builder & Digital Lookbook.
//
// Storage is always stated explicitly:
// - Backend + PostgreSQL       -> "Saved to PostgreSQL".
// - Backend + memory-demo mode -> labelled DEMO, lost on backend restart.
// - Backend unreachable        -> nothing is saved; the user may opt in to an OFFLINE DEMO
//   that writes to this browser's localStorage only. API errors never switch storage.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X, Shirt, BookOpen, Trash2, Pencil, Eye, Save, Check, AlertTriangle, Database, WifiOff, RefreshCw, Layers, Plus,
} from 'lucide-react';
import {
  searchListings, getLookbookStatus, listLookbooks, getLookbook, createLookbook, updateLookbook, deleteLookbook,
  BackendUnreachableError,
} from '../services/discoveryService';
import { resolveBackendId } from '../discovery/listingIdMap';
import {
  SLOT_ORDER, SLOT_LABELS, MAX_LOOKBOOK_ITEMS, AVAILABILITY_LABELS, inferSlot, garmentFromBackend, garmentFromFrontend,
  availabilityFromStatus, computeTotals, validateLookbookForm,
} from '../discovery/outfitModel';
import { createOfflineLookbookStore, presentOfflineLookbook } from '../discovery/lookbookOfflineStore';

const btn = 'inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const primary = `${btn} bg-[#542747] text-white hover:bg-[#A94F2C]`;
const secondary = `${btn} border border-[#E9C7B7] bg-white text-[#542747] hover:bg-[#FFF5EB]`;
const field = 'w-full rounded-xl border border-[#E9C7B7] bg-white px-3 py-2 text-sm text-[#38302F] focus:outline-none focus:ring-2 focus:ring-[#A94F2C]';
const AVAIL_CLS = {
  available: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  reserved: 'bg-amber-50 text-amber-900 border-amber-200',
  unavailable: 'bg-gray-100 text-gray-700 border-gray-300',
  missing: 'bg-red-50 text-red-800 border-red-200',
};
const fmt = (n) => Number(n).toLocaleString('en-US');
const EMPTY_FORM = { name: '', occasion: '', notes: '' };

function Thumb({ src, alt, className = '' }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className={`flex items-center justify-center bg-[#FFF5EB] text-[#E9C7B7] ${className}`}>
        <Shirt className="w-6 h-6" />
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setBroken(true)} className={`object-cover ${className}`} />;
}

function AvailabilityBadge({ availability }) {
  return (
    <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${AVAIL_CLS[availability] || AVAIL_CLS.missing}`}>
      {AVAILABILITY_LABELS[availability] || availability}
    </span>
  );
}

function Totals({ totals }) {
  const chips = [
    ['Buy all', totals.purchase, (t) => `৳${fmt(t.amount)}`],
    ['Rent all', totals.rentalPerDay, (t) => `৳${fmt(t.amount)}/day`],
    ['Swap all', totals.swapCredits, (t) => `${fmt(t.amount)} credits`],
  ];
  return (
    <div className="space-y-1" data-testid="m2-totals">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {chips.map(([label, t, show]) => (
          <div key={label} className="rounded-xl border border-[#E9C7B7] bg-white px-3 py-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#A94F2C]">{label}</div>
            <div className="text-sm font-black text-[#542747]">{t.itemCount ? show(t) : '-'}</div>
            <div className="text-[10px] text-[#38302F]/60">{t.itemCount} item{t.itemCount === 1 ? '' : 's'} offered</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#38302F]/60">
        Purchase prices, daily rental fees and swap credits are different units and are totalled separately.
        {totals.excludedUnavailable > 0 && ` ${totals.excludedUnavailable} unavailable garment(s) excluded.`}
      </p>
    </div>
  );
}

function StorageBanner({ mode, connection, status, loadError, onRetry, onUseOffline }) {
  let tone = 'info';
  let icon = Database;
  let text = 'Connecting to the ReWear backend…';
  let extra = null;
  if (mode === 'offline') {
    tone = 'warn';
    icon = WifiOff;
    text = 'OFFLINE DEMO: lookbooks are saved only in this browser (localStorage). Nothing is saved on the server.';
    extra = <button type="button" className={secondary} onClick={onRetry}><RefreshCw className="w-3.5 h-3.5" /> Reconnect to backend</button>;
  } else if (connection === 'unreachable') {
    tone = 'error';
    icon = WifiOff;
    text = 'Backend unreachable. Lookbooks cannot be saved on the server right now.';
    extra = (
      <span className="flex flex-wrap gap-2">
        <button type="button" className={secondary} onClick={onRetry}><RefreshCw className="w-3.5 h-3.5" /> Retry</button>
        <button type="button" className={secondary} onClick={onUseOffline}>Use offline demo (this browser only)</button>
      </span>
    );
  } else if (connection === 'error') {
    tone = 'error';
    icon = AlertTriangle;
    text = `The backend returned an error: ${loadError}`;
    extra = <button type="button" className={secondary} onClick={onRetry}><RefreshCw className="w-3.5 h-3.5" /> Retry</button>;
  } else if (connection === 'backend' && status) {
    if (status.identity.mode !== 'demo') {
      tone = 'error';
      icon = AlertTriangle;
      text = status.identity.message;
    } else if (!status.storage.ready) {
      tone = 'error';
      icon = AlertTriangle;
      text = status.storage.message;
    } else if (status.storage.persistent) {
      tone = 'ok';
      text = 'Lookbooks are saved to PostgreSQL on the ReWear backend.';
    } else {
      tone = 'warn';
      text = 'DEMO MODE: lookbooks are kept in backend memory and are lost when the backend restarts. This is not persistent storage.';
    }
  }
  const cls = {
    ok: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warn: 'bg-amber-50 border-amber-300 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-white border-[#E9C7B7] text-[#542747]',
  }[tone];
  const Icon = icon;
  return (
    <div className={`rounded-xl border px-3 py-2 text-xs ${cls}`} data-testid="m2-storage-banner" role="status">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-start gap-1.5 font-semibold"><Icon className="w-4 h-4 shrink-0" /> {text}</span>
        {extra}
      </div>
      {mode === 'backend' && status?.identity?.mode === 'demo' && (
        <div className="mt-1 text-[11px] opacity-80">
          Signed in as demo identity <strong>{status.identity.userId}</strong>. {status.identity.message}
        </div>
      )}
    </div>
  );
}

export default function OutfitBuilderModal({ isOpen, onClose, seedItem, frontendListings }) {
  if (!isOpen) return null;
  return <OutfitBuilder onClose={onClose} seedItem={seedItem} frontendListings={frontendListings} />;
}

function OutfitBuilder({ onClose, seedItem, frontendListings }) {
  const offlineStore = useMemo(() => createOfflineLookbookStore(), []);
  const [reloadToken, setReloadToken] = useState(0);
  const [connection, setConnection] = useState('checking'); // checking | backend | unreachable | error
  const [useOffline, setUseOffline] = useState(false);
  const [status, setStatus] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('build');
  const [selection, setSelection] = useState([]); // [{ key, slot }]
  const [extraGarments, setExtraGarments] = useState(() => new Map()); // garments of an edited lookbook not in the catalogue
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [lookbooks, setLookbooks] = useState([]);
  const [libraryError, setLibraryError] = useState('');
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');

  const mode = useOffline ? 'offline' : connection === 'backend' ? 'backend' : 'none';
  const backendUsable = mode === 'backend' && status?.storage?.ready && status?.identity?.mode === 'demo';
  const canSave = mode === 'offline' ? offlineStore.available : backendUsable;

  const offlineGarments = useMemo(() => frontendListings.map(garmentFromFrontend), [frontendListings]);
  const pickerGarments = mode === 'offline' ? offlineGarments : catalog;
  const garmentsByKey = useMemo(() => {
    const m = new Map(extraGarments);
    for (const g of pickerGarments) m.set(g.key, g);
    return m;
  }, [pickerGarments, extraGarments]);

  const presentOffline = useCallback(
    () => offlineStore.list().map((r) => presentOfflineLookbook(r, frontendListings)),
    [offlineStore, frontendListings],
  );

  const refreshLibrary = useCallback(async () => {
    setLibraryError('');
    if (useOffline) {
      setLookbooks(presentOffline());
      return;
    }
    try {
      const res = await listLookbooks();
      setLookbooks(res.lookbooks);
    } catch (err) {
      setLookbooks([]);
      setLibraryError(err instanceof BackendUnreachableError ? 'Backend unreachable. Could not load lookbooks.' : err.message);
    }
  }, [useOffline, presentOffline]);

  // Initial connection + catalogue (re-run on Retry).
  useEffect(() => {
    if (useOffline) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const [st, cat] = await Promise.all([getLookbookStatus(), searchListings({ sort: 'newest' })]);
        if (cancelled) return;
        const garments = (cat.results || []).map(garmentFromBackend);
        setStatus(st);
        setCatalog(garments);
        setConnection('backend');
        setLoadError('');
        if (seedItem) {
          const { backendId } = resolveBackendId(seedItem, new Set(cat.catalog?.knownIds || []));
          if (backendId && garments.some((g) => g.key === backendId)) {
            setSelection((s) => (s.some((x) => x.key === backendId) ? s : [...s, { key: backendId, slot: inferSlot(seedItem.category, seedItem.title) }]));
          } else if (backendId) {
            setNotice({ tone: 'error', text: `"${seedItem.title}" is not currently available to add to a lookbook.` });
          } else {
            setNotice({
              tone: 'warn',
              text: `"${seedItem.title}" exists only in this browser session and is not on the server, so it cannot be added to a saved lookbook.`,
            });
          }
        }
        if (st.storage.ready && st.identity.mode === 'demo') {
          const res = await listLookbooks().catch((e) => ({ error: e }));
          if (!cancelled) {
            if (res.error) setLibraryError(res.error.message);
            else setLookbooks(res.lookbooks);
          }
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof BackendUnreachableError) {
          setConnection('unreachable');
        } else {
          setConnection('error');
          setLoadError(err.message);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken, useOffline, seedItem]);

  const resetBuilder = () => {
    setSelection([]);
    setExtraGarments(new Map());
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const switchToOffline = () => {
    resetBuilder();
    setUseOffline(true);
    setNotice(null);
    setLookbooks(presentOffline());
    if (seedItem) setSelection([{ key: String(seedItem.id), slot: inferSlot(seedItem.category, seedItem.title) }]);
  };

  const reconnect = () => {
    resetBuilder();
    setUseOffline(false);
    setConnection('checking');
    setNotice(null);
    setDetail(null);
    setLookbooks([]);
    setReloadToken((t) => t + 1);
  };

  const toggleGarment = (g) => {
    setSelection((s) => {
      if (s.some((x) => x.key === g.key)) return s.filter((x) => x.key !== g.key);
      if (s.length >= MAX_LOOKBOOK_ITEMS) return s;
      return [...s, { key: g.key, slot: inferSlot(g.category, g.title) }];
    });
  };
  const removeGarment = (key) => setSelection((s) => s.filter((x) => x.key !== key));
  const setSlot = (key, slot) => setSelection((s) => s.map((x) => (x.key === key ? { ...x, slot } : x)));

  const selectedEntries = selection
    .map((s) => {
      const garment = garmentsByKey.get(s.key);
      if (!garment) return null;
      return { ...s, garment, availability: garment.availability || availabilityFromStatus(garment.status) };
    })
    .filter(Boolean);
  const previewTotals = computeTotals(selectedEntries);
  const formErrors = validateLookbookForm({ ...form, items: selection });

  const save = async () => {
    if (formErrors.length) {
      setNotice({ tone: 'error', text: formErrors.join(' ') });
      return;
    }
    const payload = { name: form.name, occasion: form.occasion, notes: form.notes, items: selection.map((s) => ({ listingId: s.key, slot: s.slot })) };
    setBusy(true);
    try {
      if (mode === 'offline') {
        if (editingId) offlineStore.update(editingId, payload, garmentsByKey);
        else offlineStore.create(payload, garmentsByKey);
        setNotice({ tone: 'warn', text: `"${form.name.trim()}" saved in THIS BROWSER ONLY (offline demo). It was not saved on the server.` });
      } else {
        const res = editingId ? await updateLookbook(editingId, payload) : await createLookbook(payload);
        setNotice(
          res.storage.persistent
            ? { tone: 'ok', text: `"${res.lookbook.name}" ${editingId ? 'updated' : 'saved'} in PostgreSQL.` }
            : { tone: 'warn', text: `"${res.lookbook.name}" ${editingId ? 'updated' : 'saved'} in backend DEMO memory only. It will be lost when the backend restarts.` },
        );
      }
      resetBuilder();
      setTab('library');
      await refreshLibrary();
    } catch (err) {
      setNotice({
        tone: 'error',
        text: err instanceof BackendUnreachableError ? 'Backend unreachable. Your lookbook was NOT saved.' : `Not saved: ${err.message}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (lb) => {
    const extras = new Map();
    for (const it of lb.items) {
      extras.set(it.listingId, { ...it.garment, key: it.listingId, status: it.listingStatus, availability: it.availability });
    }
    setExtraGarments(extras);
    setSelection(lb.items.map((it) => ({ key: it.listingId, slot: it.slot })));
    setForm({ name: lb.name, occasion: lb.occasion || '', notes: lb.notes || '' });
    setEditingId(lb.id);
    setDetail(null);
    setNotice(null);
    setTab('build');
  };

  const openDetail = async (lb) => {
    setNotice(null);
    if (mode === 'offline') {
      const rec = offlineStore.get(lb.id);
      setDetail(rec ? presentOfflineLookbook(rec, frontendListings) : null);
      return;
    }
    try {
      const res = await getLookbook(lb.id);
      setDetail(res.lookbook);
    } catch (err) {
      setNotice({ tone: 'error', text: err instanceof BackendUnreachableError ? 'Backend unreachable.' : err.message });
    }
  };

  const confirmDelete = async (id) => {
    setBusy(true);
    try {
      if (mode === 'offline') offlineStore.remove(id);
      else await deleteLookbook(id);
      setNotice({ tone: mode === 'offline' ? 'warn' : 'ok', text: mode === 'offline' ? 'Deleted from this browser (offline demo).' : 'Lookbook deleted.' });
      if (editingId === id) resetBuilder();
      if (detail?.id === id) setDetail(null);
      await refreshLibrary();
    } catch (err) {
      setNotice({ tone: 'error', text: err instanceof BackendUnreachableError ? 'Backend unreachable. Nothing was deleted.' : `Not deleted: ${err.message}` });
    } finally {
      setConfirmDeleteId(null);
      setBusy(false);
    }
  };

  const filteredPicker = pickerGarments.filter((g) => {
    const q = pickerQuery.trim().toLowerCase();
    return !q || [g.title, g.brand, g.category].some((v) => String(v || '').toLowerCase().includes(q));
  });

  const noticeCls = {
    ok: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warn: 'bg-amber-50 border-amber-300 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label="Outfit Builder and Lookbook" data-testid="m2-outfit-modal">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border-2 border-[#E9C7B7] bg-[#FFF5EB] shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#E9C7B7] px-5 py-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#A94F2C]" />
            <h2 className="text-lg font-black text-[#542747]">Outfit Builder &amp; Lookbook</h2>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={tab === 'build' ? primary : secondary} onClick={() => { setTab('build'); setDetail(null); }}>
              <Shirt className="h-3.5 w-3.5" /> {editingId ? 'Editing lookbook' : 'Build outfit'}
            </button>
            <button type="button" className={tab === 'library' ? primary : secondary} onClick={() => { setTab('library'); refreshLibrary(); }}>
              <BookOpen className="h-3.5 w-3.5" /> My lookbooks ({lookbooks.length})
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-[#542747] hover:bg-[#E9C7B7]/60">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto p-4 sm:p-5">
          <StorageBanner mode={mode} connection={connection} status={status} loadError={loadError} onRetry={reconnect} onUseOffline={switchToOffline} />
          {notice && (
            <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${noticeCls[notice.tone]}`} data-testid="m2-notice" role="alert">
              {notice.text}
            </div>
          )}

          {tab === 'build' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              {/* Garment picker */}
              <section className="space-y-2 lg:col-span-3" aria-label="Choose garments">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#542747]">
                    1. Choose garments <span className="font-normal text-[#38302F]/60">({selection.length}/{MAX_LOOKBOOK_ITEMS})</span>
                  </h3>
                  <input value={pickerQuery} onChange={(e) => setPickerQuery(e.target.value)} placeholder="Filter garments…" aria-label="Filter garments" className={`${field} max-w-[14rem] py-1.5 text-xs`} />
                </div>
                {mode === 'none' ? (
                  <p className="rounded-xl border border-dashed border-[#E9C7B7] p-6 text-center text-xs text-[#38302F]/70">
                    {connection === 'checking' ? 'Loading garments…' : 'Garments are unavailable until the backend is reachable.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {filteredPicker.map((g) => {
                      const selected = selection.some((s) => s.key === g.key);
                      const full = !selected && selection.length >= MAX_LOOKBOOK_ITEMS;
                      return (
                        <button
                          key={g.key}
                          type="button"
                          disabled={full}
                          onClick={() => toggleGarment(g)}
                          aria-pressed={selected}
                          data-testid="m2-garment-tile"
                          className={`overflow-hidden rounded-xl border bg-white text-left transition-shadow hover:shadow-md disabled:opacity-40 ${selected ? 'border-[#A94F2C] ring-2 ring-[#A94F2C]' : 'border-[#E9C7B7]'}`}
                        >
                          <div className="relative">
                            <Thumb src={g.image} alt={g.title} className="aspect-4/5 w-full" />
                            {selected && <span className="absolute right-1.5 top-1.5 rounded-full bg-[#A94F2C] p-1 text-white"><Check className="h-3 w-3" /></span>}
                          </div>
                          <div className="space-y-0.5 p-2">
                            <div className="line-clamp-1 text-[11px] font-bold text-[#542747]">{g.title}</div>
                            <div className="text-[10px] text-[#38302F]/60">{g.brand} · Size {g.size}</div>
                            {g.status !== 'ACTIVE' && <AvailabilityBadge availability={availabilityFromStatus(g.status)} />}
                          </div>
                        </button>
                      );
                    })}
                    {!filteredPicker.length && <p className="col-span-full text-xs text-[#38302F]/60">No garments match.</p>}
                  </div>
                )}
              </section>

              {/* Preview + details */}
              <section className="space-y-3 lg:col-span-2" aria-label="Outfit preview">
                <h3 className="text-sm font-bold text-[#542747]">2. Preview your outfit</h3>
                <div className="min-h-[8rem] space-y-2 rounded-2xl border border-[#E9C7B7] bg-white p-3" data-testid="m2-outfit-preview">
                  {!selectedEntries.length && <p className="py-6 text-center text-xs text-[#38302F]/60">Select garments to see them styled together.</p>}
                  {SLOT_ORDER.map((slot) => {
                    const entries = selectedEntries.filter((e) => e.slot === slot);
                    if (!entries.length) return null;
                    return (
                      <div key={slot}>
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#A94F2C]">{SLOT_LABELS[slot]}</div>
                        <div className="space-y-1.5">
                          {entries.map((e) => (
                            <div key={e.key} className="flex items-center gap-2 rounded-xl border border-[#E9C7B7]/70 p-1.5">
                              <Thumb src={e.garment.image} alt={e.garment.title} className="h-12 w-10 shrink-0 rounded-lg" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[11px] font-bold text-[#542747]">{e.garment.title}</div>
                                {e.availability !== 'available' && <AvailabilityBadge availability={e.availability} />}
                              </div>
                              <select value={e.slot} onChange={(ev) => setSlot(e.key, ev.target.value)} aria-label={`Slot for ${e.garment.title}`} className="rounded-lg border border-[#E9C7B7] bg-white px-1.5 py-1 text-[11px]">
                                {SLOT_ORDER.map((s) => <option key={s} value={s}>{SLOT_LABELS[s]}</option>)}
                              </select>
                              <button type="button" onClick={() => removeGarment(e.key)} aria-label={`Remove ${e.garment.title}`} className="rounded-full p-1 text-[#A94F2C] hover:bg-[#FFF5EB]">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Totals totals={previewTotals} />

                <h3 className="text-sm font-bold text-[#542747]">3. Name &amp; save</h3>
                <input value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lookbook name (required)" aria-label="Lookbook name" className={field} />
                <input value={form.occasion} maxLength={60} onChange={(e) => setForm({ ...form, occasion: e.target.value })} placeholder="Occasion (optional)" aria-label="Occasion" className={field} />
                <textarea value={form.notes} maxLength={500} rows={2} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" aria-label="Notes" className={field} />
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={primary} disabled={!canSave || busy || formErrors.length > 0} onClick={save}>
                    {editingId ? <Save className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    {editingId ? 'Save changes' : 'Save lookbook'}
                  </button>
                  {(editingId || selection.length > 0) && (
                    <button type="button" className={secondary} onClick={() => { resetBuilder(); setNotice(null); }}>
                      {editingId ? 'Cancel editing' : 'Clear'}
                    </button>
                  )}
                </div>
                {!canSave && mode !== 'none' && <p className="text-[11px] text-red-700">Saving is disabled: see the message above.</p>}
                {canSave && formErrors.length > 0 && selection.length > 0 && <p className="text-[11px] text-[#38302F]/70">{formErrors.join(' ')}</p>}
              </section>
            </div>
          )}

          {tab === 'library' && !detail && (
            <section aria-label="My lookbooks" className="space-y-2">
              {libraryError && <p className="text-xs text-red-700" role="alert">{libraryError}</p>}
              {!libraryError && !lookbooks.length && (
                <p className="rounded-xl border border-dashed border-[#E9C7B7] p-6 text-center text-xs text-[#38302F]/70">No lookbooks yet. Build an outfit to save your first one.</p>
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {lookbooks.map((lb) => {
                  const unavailable = lb.items.filter((i) => i.availability !== 'available').length;
                  return (
                    <article key={lb.id} className="space-y-2 rounded-2xl border border-[#E9C7B7] bg-white p-3" data-testid="m2-lookbook-card">
                      <div className="flex gap-1">
                        {lb.items.slice(0, 4).map((i) => (
                          <Thumb key={i.listingId} src={i.garment.image} alt={i.garment.title} className={`h-16 w-12 rounded-lg ${i.availability === 'available' ? '' : 'opacity-50 grayscale'}`} />
                        ))}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#542747]">{lb.name}</h4>
                        <div className="text-[11px] text-[#38302F]/70">
                          {lb.items.length} garment{lb.items.length === 1 ? '' : 's'}
                          {lb.occasion ? ` · ${lb.occasion}` : ''} · updated {new Date(lb.updatedAt).toLocaleString()}
                        </div>
                        {unavailable > 0 && <div className="mt-1 text-[11px] font-semibold text-amber-800">{unavailable} garment(s) no longer available</div>}
                      </div>
                      {confirmDeleteId === lb.id ? (
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-semibold text-red-700">Delete “{lb.name}”?</span>
                          <button type="button" className={`${btn} bg-red-700 text-white hover:bg-red-800`} disabled={busy} onClick={() => confirmDelete(lb.id)}>Yes, delete</button>
                          <button type="button" className={secondary} onClick={() => setConfirmDeleteId(null)}>Keep</button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={secondary} onClick={() => openDetail(lb)}><Eye className="h-3.5 w-3.5" /> View</button>
                          <button type="button" className={secondary} onClick={() => startEdit(lb)}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                          <button type="button" className={secondary} onClick={() => setConfirmDeleteId(lb.id)}><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {tab === 'library' && detail && (
            <section aria-label="Lookbook details" className="space-y-3" data-testid="m2-lookbook-detail">
              <button type="button" className={secondary} onClick={() => setDetail(null)}>← Back to lookbooks</button>
              <div>
                <h3 className="text-xl font-black text-[#542747]">{detail.name}</h3>
                {detail.occasion && <div className="text-xs font-semibold text-[#A94F2C]">{detail.occasion}</div>}
                {detail.notes && <p className="mt-1 text-xs text-[#38302F]/80">{detail.notes}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {detail.items.map((i) => (
                  <div key={i.listingId} className="overflow-hidden rounded-xl border border-[#E9C7B7] bg-white">
                    <Thumb src={i.garment.image} alt={i.garment.title} className={`aspect-4/5 w-full ${i.availability === 'available' ? '' : 'opacity-60 grayscale'}`} />
                    <div className="space-y-1 p-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#A94F2C]">{SLOT_LABELS[i.slot]}</div>
                      <div className="text-[11px] font-bold text-[#542747]">{i.garment.title}</div>
                      <AvailabilityBadge availability={i.availability} />
                      <div className="text-[10px] text-[#38302F]/70">
                        {i.garment.modes.includes('buy') && i.garment.salePrice !== null && <div>Buy ৳{fmt(i.garment.salePrice)}</div>}
                        {i.garment.modes.includes('rent') && i.garment.rentalPricePerDay !== null && <div>Rent ৳{fmt(i.garment.rentalPricePerDay)}/day</div>}
                        {i.garment.modes.includes('swap') && i.garment.swapCredits !== null && <div>Swap {fmt(i.garment.swapCredits)} credits</div>}
                      </div>
                      {i.availability === 'missing' && <div className="text-[10px] text-red-700">Shown from details saved with this lookbook.</div>}
                    </div>
                  </div>
                ))}
              </div>
              <Totals totals={detail.totals} />
              <div className="flex gap-2">
                <button type="button" className={secondary} onClick={() => startEdit(detail)}><Pencil className="h-3.5 w-3.5" /> Edit</button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
