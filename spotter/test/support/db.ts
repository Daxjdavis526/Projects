/**
 * An in-memory PostgreSQL (PGlite) with every migration applied, installed as
 * the process-wide database so modules that call getDb() use it too.
 */
import { openDatabase, type DbHandle } from '@/core/db/client'
import { createUserWithProfile } from '@/core/services/users'

export async function openTestDatabase(): Promise<DbHandle> {
  const handle = await openDatabase({ url: null, pgliteDir: null, runMigrations: true })
  ;(globalThis as unknown as { __spotterDb?: Promise<DbHandle> }).__spotterDb = Promise.resolve(handle)
  return handle
}

export async function closeTestDatabase(handle: DbHandle | undefined): Promise<void> {
  ;(globalThis as unknown as { __spotterDb?: Promise<DbHandle> }).__spotterDb = undefined
  await handle?.close()
}

let counter = 0
export async function createTestUser(handle: DbHandle, name = 'Test Creator'): Promise<{ userId: string; profileId: string }> {
  counter++
  return createUserWithProfile(handle.db, {
    email: `user${counter}-${Date.now()}@spotter.test`,
    displayName: name,
    password: 'correct horse battery staple',
    timezone: 'America/New_York',
  })
}
