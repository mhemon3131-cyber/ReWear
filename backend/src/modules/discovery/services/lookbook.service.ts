import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ListingEntity } from '../../listings/entities/listing.entity';
import { SaveLookbookDto } from '../dto/save-lookbook.dto';
import { GarmentSnapshot, LookbookItemRecord, LookbookRecord, LookbookWrite } from '../entities/outfit-lookbook.entity';
import { LOOKBOOK_REPOSITORY, LookbookRepository } from '../lookbooks/lookbook.repository';
import { LookbookIdentityService } from '../lookbooks/lookbook-identity.service';
import { MarketplaceSearchService } from './marketplace-search.service';

// Member 2 - Feature 10: Outfit Builder & Digital Lookbook.
// Sustainability / eco-impact figures are intentionally NOT computed here (Member 4's domain).

/** Statuses a garment may have when it is newly added to a lookbook. */
const ADDABLE_STATUSES = ['ACTIVE', 'RESERVED'];

export type Availability = 'available' | 'reserved' | 'unavailable' | 'missing';

const num = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? n : null);

export function snapshotOf(l: ListingEntity): GarmentSnapshot {
  return {
    title: l.title,
    brand: l.brand,
    size: l.size,
    category: l.category,
    image: l.images?.[0] ?? null,
    modes: [...(l.modes || [])],
    salePrice: num(l.salePrice),
    rentalPricePerDay: num(l.rentalPricePerDay),
    swapCredits: num(l.swapCredits),
    capturedAt: new Date().toISOString(),
  };
}

function availabilityOf(l: ListingEntity | undefined): Availability {
  if (!l) return 'missing';
  if (l.status === 'ACTIVE') return 'available';
  if (l.status === 'RESERVED') return 'reserved';
  return 'unavailable';
}

/** Three separate totals: unlike units are never added together. Only available garments count. */
export function computeTotals(items: Array<{ availability: Availability; garment: GarmentSnapshot }>) {
  const purchase = { unit: 'BDT', amount: 0, itemCount: 0 };
  const rentalPerDay = { unit: 'BDT/day', amount: 0, itemCount: 0 };
  const swapCredits = { unit: 'credits', amount: 0, itemCount: 0 };
  let excludedUnavailable = 0;
  for (const { availability, garment } of items) {
    if (availability !== 'available') {
      excludedUnavailable++;
      continue;
    }
    if (garment.modes.includes('buy') && garment.salePrice !== null) {
      purchase.amount += garment.salePrice;
      purchase.itemCount++;
    }
    if (garment.modes.includes('rent') && garment.rentalPricePerDay !== null) {
      rentalPerDay.amount += garment.rentalPricePerDay;
      rentalPerDay.itemCount++;
    }
    if (garment.modes.includes('swap') && garment.swapCredits !== null) {
      swapCredits.amount += garment.swapCredits;
      swapCredits.itemCount++;
    }
  }
  return { purchase, rentalPerDay, swapCredits, excludedUnavailable };
}

@Injectable()
export class LookbookService implements OnModuleDestroy {
  constructor(
    @Inject(LOOKBOOK_REPOSITORY) private readonly repo: LookbookRepository,
    private readonly identity: LookbookIdentityService,
    private readonly search: MarketplaceSearchService,
  ) {}

  async onModuleDestroy() {
    await this.repo.close();
  }

  private storageTag() {
    return { mode: this.repo.mode, persistent: this.repo.persistent };
  }

  async status() {
    let ready = false;
    let message: string;
    try {
      await this.repo.ensureReady();
      ready = true;
      message = this.repo.persistent
        ? 'Lookbooks are saved in PostgreSQL.'
        : 'DEMO MODE: lookbooks are kept in backend memory and are lost when the backend restarts. This is not persistent storage.';
    } catch (err: any) {
      message = err?.message || 'Lookbook storage is unavailable.';
    }
    return {
      storage: { ...this.storageTag(), persistent: this.repo.persistent && ready, ready, message },
      identity: this.identity.describe(),
    };
  }

  private async liveListings() {
    const all = await this.search.getAllListingsReadOnly();
    return new Map(all.map((l) => [l.id, l]));
  }

  private present(record: LookbookRecord, live: Map<string, ListingEntity>) {
    const items = record.items.map((item) => {
      const listing = live.get(item.listingId);
      const availability = availabilityOf(listing);
      return {
        listingId: item.listingId,
        slot: item.slot,
        position: item.position,
        availability,
        listingStatus: listing?.status ?? null,
        // Live data when the listing still exists, otherwise the snapshot taken at save time.
        garment: listing ? snapshotOf(listing) : item.snapshot,
        savedSnapshot: item.snapshot,
      };
    });
    return {
      id: record.id,
      name: record.name,
      occasion: record.occasion,
      notes: record.notes,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      items,
      totals: computeTotals(items),
    };
  }

  private async buildWrite(dto: SaveLookbookDto, existing?: LookbookRecord): Promise<LookbookWrite> {
    const ids = dto.items.map((i) => i.listingId);
    const duplicate = ids.find((id, idx) => ids.indexOf(id) !== idx);
    if (duplicate) throw new BadRequestException(`Garment '${duplicate}' appears more than once in this lookbook.`);

    const live = await this.liveListings();
    const items: LookbookItemRecord[] = dto.items.map((it, position) => {
      const listing = live.get(it.listingId);
      if (listing && ADDABLE_STATUSES.includes(listing.status)) {
        return { listingId: it.listingId, slot: it.slot, position, snapshot: snapshotOf(listing) };
      }
      // Garments already in this lookbook may stay even if they were sold or removed since.
      const previous = existing?.items.find((p) => p.listingId === it.listingId);
      if (previous) return { listingId: it.listingId, slot: it.slot, position, snapshot: previous.snapshot };
      if (!listing) {
        throw new BadRequestException(
          `Garment '${it.listingId}' is not on the server. Only marketplace listings saved on the backend can be added.`,
        );
      }
      throw new BadRequestException(`'${listing.title}' is ${listing.status} and cannot be added to a lookbook.`);
    });

    return { name: dto.name, occasion: dto.occasion ?? null, notes: dto.notes ?? null, items };
  }

  async list() {
    const owner = this.identity.resolveOwner();
    const records = await this.repo.list(owner);
    const live = await this.liveListings();
    return { storage: this.storageTag(), lookbooks: records.map((r) => this.present(r, live)) };
  }

  async get(id: string) {
    const owner = this.identity.resolveOwner();
    const record = await this.repo.get(owner, id);
    if (!record) throw new NotFoundException('Lookbook not found.');
    return { storage: this.storageTag(), lookbook: this.present(record, await this.liveListings()) };
  }

  async create(dto: SaveLookbookDto) {
    const owner = this.identity.resolveOwner();
    await this.repo.ensureReady();
    const write = await this.buildWrite(dto);
    const now = new Date();
    const saved = await this.repo.create({ id: randomUUID(), ownerId: owner, ...write, createdAt: now, updatedAt: now });
    return { storage: this.storageTag(), lookbook: this.present(saved, await this.liveListings()) };
  }

  async update(id: string, dto: SaveLookbookDto) {
    const owner = this.identity.resolveOwner();
    const existing = await this.repo.get(owner, id);
    if (!existing) throw new NotFoundException('Lookbook not found.');
    const write = await this.buildWrite(dto, existing);
    const saved = await this.repo.update(owner, id, write);
    if (!saved) throw new NotFoundException('Lookbook not found.');
    return { storage: this.storageTag(), lookbook: this.present(saved, await this.liveListings()) };
  }

  async remove(id: string) {
    const owner = this.identity.resolveOwner();
    const deleted = await this.repo.delete(owner, id);
    if (!deleted) throw new NotFoundException('Lookbook not found.');
    return { storage: this.storageTag(), deleted: true, id };
  }
}
