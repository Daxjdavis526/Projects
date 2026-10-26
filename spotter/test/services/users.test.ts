/**
 * The forgotten-password path: a new password works, the old one stops
 * working, existing sessions end, and weak passwords are refused.
 */
import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { DbHandle } from '@/core/db/client'
import { sessions, users } from '@/core/db/schema'
import { verifyPassword } from '@/core/security/passwords'
import { setPassword, UserInputError } from '@/core/services/users'
import { closeTestDatabase, createTestUser, openTestDatabase } from '../support/db'

let handle: DbHandle
let userId: string

beforeAll(async () => {
  handle = await openTestDatabase()
  ;({ userId } = await createTestUser(handle))
})

afterAll(async () => {
  await closeTestDatabase(handle)
})

describe('setPassword', () => {
  it('replaces the password and ends existing sessions', async () => {
    await handle.db.insert(sessions).values({ userId, tokenHash: 'a'.repeat(64), expiresAt: new Date(Date.now() + 86_400_000) })
    await setPassword(handle.db, userId, 'a brand new password')
    const [user] = await handle.db.select().from(users).where(eq(users.id, userId))
    expect(await verifyPassword('a brand new password', user!.passwordHash)).toBe(true)
    expect(await verifyPassword('correct horse battery staple', user!.passwordHash)).toBe(false)
    expect(await handle.db.select().from(sessions).where(eq(sessions.userId, userId))).toHaveLength(0)
  })

  it('refuses a weak password and changes nothing', async () => {
    const [before] = await handle.db.select().from(users).where(eq(users.id, userId))
    await expect(setPassword(handle.db, userId, 'short')).rejects.toBeInstanceOf(UserInputError)
    const [after] = await handle.db.select().from(users).where(eq(users.id, userId))
    expect(after!.passwordHash).toBe(before!.passwordHash)
  })
})
