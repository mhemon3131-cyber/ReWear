// Member 2 - Feature 10: Outfit Builder helpers (slots, garment shape, separate totals).
// Eco-impact numbers are deliberately not shown here (Member 4 owns sustainability).

export const SLOT_ORDER = ['outerwear', 'top', 'layer', 'bottom', 'accessory', 'other'];
export const SLOT_LABELS = {
  outerwear: 'Outerwear',
  top: 'Top',
  layer: 'Layer',
  bottom: 'Bottom',
  accessory: 'Accessory',
  other: 'Other',
};
export const MAX_LOOKBOOK_ITEMS = 8;

const RULES = [
  ['outerwear', /outer|jacket|coat|blazer|shawl|parka|hoodie/],
  ['bottom', /pant|jean|denim|trouser|skirt|short|cargo|bottom|legging/],
  ['layer', /vest|cardigan|overlay|waistcoat/],
  ['accessory', /accessor|bag|scarf|jewel|hat|cap|belt|shoe|footwear|sneaker/],
  ['top', /top|shirt|tee|blouse|knit|sweater|turtleneck|kurti|kurta|tunic/],
];

/** Suggest an outfit slot from category first, then title. The user can always change it. */
export function inferSlot(category, title) {
  for (const text of [category, title]) {
    const s = String(text || '').toLowerCase();
    for (const [slot, re] of RULES) if (re.test(s)) return slot;
  }
  return 'other';
}

const num = (n) => (typeof n === 'number' && Number.isFinite(n) ? n : null);

/** Garment shape used by the builder, from a backend ListingEntity. */
export function garmentFromBackend(l) {
  return {
    key: l.id,
    title: l.title,
    brand: l.brand,
    size: l.size,
    category: l.category,
    image: l.images?.[0] || null,
    modes: l.modes || [],
    salePrice: num(l.salePrice),
    rentalPricePerDay: num(l.rentalPricePerDay),
    swapCredits: num(l.swapCredits),
    status: l.status,
  };
}

/** Garment shape from an App.jsx card object (offline demo only). */
export function garmentFromFrontend(item) {
  return {
    key: String(item.id),
    title: item.title,
    brand: item.brand,
    size: item.size,
    category: item.category,
    image: item.image || null,
    modes: item.modes || [],
    salePrice: item.modes?.includes('buy') ? num(item.salePrice) : null,
    rentalPricePerDay: item.modes?.includes('rent') ? num(item.rentalPricePerDay) : null,
    swapCredits: item.modes?.includes('swap') ? num(item.swapCredits) : null,
    status: item.status || 'ACTIVE',
  };
}

export function availabilityFromStatus(status) {
  if (!status) return 'missing';
  if (status === 'ACTIVE') return 'available';
  if (status === 'RESERVED') return 'reserved';
  return 'unavailable';
}

export const AVAILABILITY_LABELS = {
  available: 'Available',
  reserved: 'Reserved (in escrow)',
  unavailable: 'No longer available',
  missing: 'Listing removed',
};

/** Purchase (BDT), rental (BDT/day) and swap credits are summed separately, never combined. */
export function computeTotals(entries) {
  const purchase = { unit: 'BDT', amount: 0, itemCount: 0 };
  const rentalPerDay = { unit: 'BDT/day', amount: 0, itemCount: 0 };
  const swapCredits = { unit: 'credits', amount: 0, itemCount: 0 };
  let excludedUnavailable = 0;
  for (const { availability, garment } of entries) {
    if (availability !== 'available') {
      excludedUnavailable++;
      continue;
    }
    if (garment.modes.includes('buy') && num(garment.salePrice) !== null) {
      purchase.amount += garment.salePrice;
      purchase.itemCount++;
    }
    if (garment.modes.includes('rent') && num(garment.rentalPricePerDay) !== null) {
      rentalPerDay.amount += garment.rentalPricePerDay;
      rentalPerDay.itemCount++;
    }
    if (garment.modes.includes('swap') && num(garment.swapCredits) !== null) {
      swapCredits.amount += garment.swapCredits;
      swapCredits.itemCount++;
    }
  }
  return { purchase, rentalPerDay, swapCredits, excludedUnavailable };
}

/** Client-side form validation mirroring the backend DTO. */
export function validateLookbookForm({ name, occasion, notes, items }) {
  const errors = [];
  if (!name || !name.trim()) errors.push('Give your lookbook a name.');
  else if (name.trim().length > 80) errors.push('Name must be 80 characters or fewer.');
  if (occasion && occasion.trim().length > 60) errors.push('Occasion must be 60 characters or fewer.');
  if (notes && notes.trim().length > 500) errors.push('Notes must be 500 characters or fewer.');
  if (!items.length) errors.push('Select at least one garment.');
  if (items.length > MAX_LOOKBOOK_ITEMS) errors.push(`A lookbook can hold at most ${MAX_LOOKBOOK_ITEMS} garments.`);
  return errors;
}
