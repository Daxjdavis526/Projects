/**
 * Database connection.
 *
 * - DATABASE_URL set  → PostgreSQL through node-postgres (the real deployment).
 * - DATABASE_URL unset → embedded PGlite (PostgreSQL compiled to WASM) under
 *   .data/pglite, so the demo runs with zero setup. PGlite is single-process:
 *   fine for `npm run dev` with the in-process worker, not for production.
 *
 * Both drivers expose the same Drizzle `PgDatabase` API, so nothing above this
 * file knows which one it is talking to.
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { getEnv } from '../config/env'
import { getLogger } from '../observability/logger'
import * as schema from './schema'

export type Schema = typeof schema
export type Database = PgDatabase<PgQueryResultHKT, Schema>
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]
/** Anything that can run queries: the database itself or an open transaction. */
export type Executor = Database | Transaction

export interface DbHandle {
  db: Database
  kind: 'postgres' | 'pglite'
  close(): Promise<void>
}

const MIGRATION_LOCK_ID = 727_310_001

export function migrationsFolder(): string {
  return path.resolve(process.cwd(), 'drizzle')
}

async function openPostgres(url: string): Promise<DbHandle> {
  const { Pool } = await import('pg')
  const { drizzle } = await import('drizzle-orm/node-postgres')
  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  })
  // An idle client losing its connection must not crash the process.
  pool.on('error', (err) => getLogger('db').error('PostgreSQL pool error', { error: err }))
  const db = drizzle({ client: pool, schema }) as unknown as Database
  return {
    db,
    kind: 'postgres',
    close: () => pool.end(),
  }
}

async function openPglite(dataDir: string | null): Promise<DbHandle> {
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle } = await import('drizzle-orm/pglite')
  if (dataDir) mkdirSync(dataDir, { recursive: true })
  const client = dataDir ? await PGlite.create(dataDir) : await PGlite.create()
  const db = drizzle({ client, schema }) as unknown as Database
  return { db, kind: 'pglite', close: () => client.close() }
}

export async function migrate(handle: DbHandle): Promise<void> {
  const folder = migrationsFolder()
  if (handle.kind === 'pglite') {
    const { migrate: run } = await import('drizzle-orm/pglite/migrator')
    await run(handle.db as never, { migrationsFolder: folder })
    return
  }
  const { migrate: run } = await import('drizzle-orm/node-postgres/migrator')
  const pool = (handle.db as unknown as { $client: import('pg').Pool }).$client
  const client = await pool.connect()
  try {
    // Serialise concurrent migrators (web server and worker starting together).
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID])
    try {
      await run(handle.db as never, { migrationsFolder: folder })
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID])
    }
  } finally {
    client.release()
  }
}

export async function openDatabase(options: { url?: string | null; pgliteDir?: string | null; runMigrations?: boolean } = {}): Promise<DbHandle> {
  const env = getEnv()
  const url = options.url === undefined ? env.DATABASE_URL : options.url
  const handle = url
    ? await openPostgres(url)
    : await openPglite(options.pgliteDir === undefined ? path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.PGLITE_DATA_DIR) : options.pgliteDir)
  if (options.runMigrations ?? env.AUTO_MIGRATE) await migrate(handle)
  return handle
}

// One connection per process, shared across Next.js route modules and the
// in-process worker (and surviving dev-server hot reloads).
const globalForDb = globalThis as unknown as { __spotterDb?: Promise<DbHandle> }

export function getDbHandle(): Promise<DbHandle> {
  // `next build` must never open (and migrate) a database: a page that reaches here
  // while being prerendered has to read request data (cookies, params) first.
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return Promise.reject(new Error('The database is not available during `next build`; this page must read request data before querying.'))
  }
  if (!globalForDb.__spotterDb) {
    const opening = openDatabase()
    globalForDb.__spotterDb = opening
    opening.then(
      (h) => getLogger('db').info('Database ready', { driver: h.kind }),
      (err) => {
        getLogger('db').error('Database failed to open', { error: err })
        globalForDb.__spotterDb = undefined
      },
    )
  }
  return globalForDb.__spotterDb
}

export async function getDb(): Promise<Database> {
  return (await getDbHandle()).db
}

export async function closeDb(): Promise<void> {
  const handle = globalForDb.__spotterDb
  globalForDb.__spotterDb = undefined
  if (handle) await (await handle).close()
}

/** Rows from a raw `db.execute(sql...)` result, for either driver. */
export function rowsOf<T>(result: unknown): T[] {
  const rows = (result as { rows?: unknown }).rows
  return Array.isArray(rows) ? (rows as T[]) : []
}
