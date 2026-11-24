import { HttpException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { LookbookItemRecord, LookbookRecord, LookbookWrite } from '../entities/outfit-lookbook.entity';

// Member 2 - Feature 10: lookbook storage.
//
//   M2_LOOKBOOK_STORAGE=postgres (default)  -> PostgreSQL via M2_DATABASE_URL or DATABASE_URL.
//   M2_LOOKBOOK_STORAGE=memory-demo         -> in-process memory. DEMO ONLY: lost on restart.
//
// There is no automatic fallback: if PostgreSQL is selected but missing, unreachable or not
// migrated, every lookbook request fails with 503 and a setup message.

export const LOOKBOOK_REPOSITORY = Symbol('LOOKBOOK_REPOSITORY');
export type StorageMode = 'postgres' | 'memory-demo' | 'unconfigured';

export interface LookbookRepository {
  readonly mode: StorageMode;
  /** True only for storage that survives a backend restart. */
  readonly persistent: boolean;
  ensureReady(): Promise<void>;
  list(ownerId: string): Promise<LookbookRecord[]>;
  get(ownerId: string, id: string): Promise<LookbookRecord | null>;
  create(record: LookbookRecord): Promise<LookbookRecord>;
  update(ownerId: string, id: string, data: LookbookWrite): Promise<LookbookRecord | null>;
  delete(ownerId: string, id: string): Promise<boolean>;
  close(): Promise<void>;
}

export const SETUP_MESSAGE =
  'Lookbook storage is not configured. Set M2_DATABASE_URL (or DATABASE_URL) to a PostgreSQL ' +
  'connection string and run "node scripts/member2-migrate.js" in the backend folder. ' +
  'For a non-persistent local demo only, set M2_LOOKBOOK_STORAGE=memory-demo.';

export const MIGRATION_MESSAGE =
  'PostgreSQL is reachable but the lookbook tables are missing. Run "node scripts/member2-migrate.js" in the backend folder.';

// ---------------------------------------------------------------------------

export class UnconfiguredLookbookRepository implements LookbookRepository {
  readonly mode = 'unconfigured' as const;
  readonly persistent = false;
  async ensureReady(): Promise<void> {
    throw new ServiceUnavailableException(SETUP_MESSAGE);
  }
  list = (): Promise<never> => this.ensureReady() as Promise<never>;
  get = (): Promise<never> => this.ensureReady() as Promise<never>;
  create = (): Promise<never> => this.ensureReady() as Promise<never>;
  update = (): Promise<never> => this.ensureReady() as Promise<never>;
  delete = (): Promise<never> => this.ensureReady() as Promise<never>;
  async close() {}
}

// ---------------------------------------------------------------------------

/** DEMO ONLY. Data lives in this Node process and disappears when the backend restarts. */
export class InMemoryDemoLookbookRepository implements LookbookRepository {
  readonly mode = 'memory-demo' as const;
  readonly persistent = false;
  private readonly store = new Map<string, LookbookRecord>();

  async ensureReady() {}
  async list(ownerId: string) {
    return [...this.store.values()]
      .filter((r) => r.ownerId === ownerId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime() || a.id.localeCompare(b.id))
      .map((r) => structuredClone(r));
  }
  async get(ownerId: string, id: string) {
    const r = this.store.get(id);
    return r && r.ownerId === ownerId ? structuredClone(r) : null;
  }
  async create(record: LookbookRecord) {
    this.store.set(record.id, structuredClone(record));
    return structuredClone(record);
  }
  async update(ownerId: string, id: string, data: LookbookWrite) {
    const r = this.store.get(id);
    if (!r || r.ownerId !== ownerId) return null;
    const next: LookbookRecord = { ...r, ...structuredClone(data), updatedAt: new Date() };
    this.store.set(id, next);
    return structuredClone(next);
  }
  async delete(ownerId: string, id: string) {
    const r = this.store.get(id);
    if (!r || r.ownerId !== ownerId) return false;
    return this.store.delete(id);
  }
  async close() {}
}

// ---------------------------------------------------------------------------

type LookbookRow = {
  id: string;
  owner_id: string;
  name: string;
  occasion: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};
type ItemRow = { lookbook_id: string; listing_id: string; slot: string; position: number; snapshot: any };

export class PostgresLookbookRepository implements LookbookRepository {
  readonly mode = 'postgres' as const;
  readonly persistent = true;
  private readonly logger = new Logger('Member2Lookbooks');
  private readonly pool: Pool;
  private schemaVerified = false;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 5, connectionTimeoutMillis: 5000 });
    // Without this listener an idle-client error (e.g. database restart) would crash Node.
    this.pool.on('error', (err) => this.logger.warn(`PostgreSQL idle client error: ${err.message}`));
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new ServiceUnavailableException(
        `PostgreSQL error${err?.code ? ` (${err.code})` : ''}: ${err?.message || 'unknown error'}. Lookbook was not saved.`,
      );
    }
  }

  private tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
    return this.run(async () => {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => undefined);
        throw err;
      } finally {
        client.release();
      }
    });
  }

  async ensureReady() {
    if (this.schemaVerified) return;
    const { rows } = await this.run(() =>
      this.pool.query(
        "SELECT to_regclass('m2_lookbooks') IS NOT NULL AS lookbooks, to_regclass('m2_lookbook_items') IS NOT NULL AS items",
      ),
    );
    if (!rows[0]?.lookbooks || !rows[0]?.items) throw new ServiceUnavailableException(MIGRATION_MESSAGE);
    this.schemaVerified = true;
  }

  private toRecord(row: LookbookRow, items: ItemRow[]): LookbookRecord {
    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      occasion: row.occasion,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      items: items
        .filter((i) => i.lookbook_id === row.id)
        .sort((a, b) => a.position - b.position)
        .map((i) => ({ listingId: i.listing_id, slot: i.slot as any, position: i.position, snapshot: i.snapshot })),
    };
  }

  private async load(db: Pool | PoolClient, where: string, params: unknown[]) {
    const { rows } = await db.query<LookbookRow>(
      `SELECT id, owner_id, name, occasion, notes, created_at, updated_at FROM m2_lookbooks WHERE ${where} ORDER BY updated_at DESC, id`,
      params,
    );
    if (!rows.length) return [];
    const items = await db.query<ItemRow>(
      'SELECT lookbook_id, listing_id, slot, position, snapshot FROM m2_lookbook_items WHERE lookbook_id = ANY($1::uuid[]) ORDER BY position',
      [rows.map((r) => r.id)],
    );
    return rows.map((r) => this.toRecord(r, items.rows));
  }

  private async insertItems(c: PoolClient, lookbookId: string, items: LookbookItemRecord[]) {
    for (const item of items) {
      await c.query(
        'INSERT INTO m2_lookbook_items (lookbook_id, listing_id, slot, position, snapshot) VALUES ($1, $2, $3, $4, $5::jsonb)',
        [lookbookId, item.listingId, item.slot, item.position, JSON.stringify(item.snapshot)],
      );
    }
  }

  async list(ownerId: string) {
    await this.ensureReady();
    return this.run(() => this.load(this.pool, 'owner_id = $1', [ownerId]));
  }

  async get(ownerId: string, id: string) {
    await this.ensureReady();
    const [record] = await this.run(() => this.load(this.pool, 'owner_id = $1 AND id = $2', [ownerId, id]));
    return record || null;
  }

  async create(record: LookbookRecord) {
    await this.ensureReady();
    await this.tx(async (c) => {
      await c.query(
        'INSERT INTO m2_lookbooks (id, owner_id, name, occasion, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [record.id, record.ownerId, record.name, record.occasion, record.notes, record.createdAt, record.updatedAt],
      );
      await this.insertItems(c, record.id, record.items);
    });
    return this.get(record.ownerId, record.id);
  }

  async update(ownerId: string, id: string, data: LookbookWrite) {
    await this.ensureReady();
    const updated = await this.tx(async (c) => {
      const res = await c.query(
        'UPDATE m2_lookbooks SET name = $3, occasion = $4, notes = $5, updated_at = now() WHERE id = $1 AND owner_id = $2',
        [id, ownerId, data.name, data.occasion, data.notes],
      );
      if (res.rowCount === 0) return false;
      await c.query('DELETE FROM m2_lookbook_items WHERE lookbook_id = $1', [id]);
      await this.insertItems(c, id, data.items);
      return true;
    });
    return updated ? this.get(ownerId, id) : null;
  }

  async delete(ownerId: string, id: string) {
    await this.ensureReady();
    const res = await this.run(() => this.pool.query('DELETE FROM m2_lookbooks WHERE id = $1 AND owner_id = $2', [id, ownerId]));
    return (res.rowCount ?? 0) > 0;
  }

  async close() {
    await this.pool.end().catch(() => undefined);
  }
}

// ---------------------------------------------------------------------------

export function createLookbookRepository(env: NodeJS.ProcessEnv = process.env): LookbookRepository {
  const choice = (env.M2_LOOKBOOK_STORAGE || 'postgres').trim().toLowerCase();
  const logger = new Logger('Member2Lookbooks');
  if (choice === 'memory-demo') {
    logger.warn('Lookbooks are using IN-MEMORY DEMO storage. Data is lost when the backend restarts.');
    return new InMemoryDemoLookbookRepository();
  }
  const url = env.M2_DATABASE_URL || env.DATABASE_URL;
  if (choice !== 'postgres' || !url) {
    logger.warn(choice !== 'postgres' ? `Unknown M2_LOOKBOOK_STORAGE "${choice}". ${SETUP_MESSAGE}` : SETUP_MESSAGE);
    return new UnconfiguredLookbookRepository();
  }
  return new PostgresLookbookRepository(url);
}
