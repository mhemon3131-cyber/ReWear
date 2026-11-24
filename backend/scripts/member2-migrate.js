// Member 2: apply the lookbook migration (safe to run repeatedly; never drops data).
// Usage (from the backend folder):  node scripts/member2-migrate.js
// Connection string comes from M2_DATABASE_URL, else DATABASE_URL, else backend/.env.
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

function readDotEnv() {
  const file = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return out;
}

async function main() {
  const env = { ...readDotEnv(), ...process.env };
  const url = env.M2_DATABASE_URL || env.DATABASE_URL;
  if (!url) {
    console.error('No database configured. Set M2_DATABASE_URL (or DATABASE_URL), e.g.\n  postgres://postgres:<password>@localhost:5432/rewear_db');
    process.exit(2);
  }
  const sqlFile = path.resolve(__dirname, '..', 'src', 'modules', 'discovery', 'sql', 'm2_001_lookbooks.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    await client.query(sql);
    const { rows } = await client.query('SELECT version, applied_at FROM m2_schema_migrations ORDER BY applied_at');
    console.log('Member 2 lookbook migration applied. Recorded versions:');
    for (const r of rows) console.log(`  ${r.version}  (${new Date(r.applied_at).toISOString()})`);
  } catch (err) {
    console.error(`Migration failed: ${err.code ? err.code + ' ' : ''}${err.message}`);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
