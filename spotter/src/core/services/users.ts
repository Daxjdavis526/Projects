/**
 * Local accounts and the creator profile each one owns.
 */
import { eq, sql } from 'drizzle-orm'
import { defaultSettings } from '../config/settings'
import type { Database } from '../db/client'
import { creatorProfiles, users } from '../db/schema'
import { hashPassword, validatePasswordStrength } from '../security/passwords'

export class UserInputError extends Error {}

export async function countUsers(db: Database): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)` }).from(users)
  return Number(row?.n ?? 0)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function createUserWithProfile(
  db: Database,
  input: { email: string; displayName: string; password: string; timezone: string },
): Promise<{ userId: string; profileId: string }> {
  const email = normalizeEmail(input.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new UserInputError('Enter a valid email address.')
  const name = input.displayName.trim()
  if (name.length < 1 || name.length > 80) throw new UserInputError('Enter your name (up to 80 characters).')
  const weak = validatePasswordStrength(input.password)
  if (weak) throw new UserInputError(weak)
  let timezone = 'UTC'
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format(new Date())
    timezone = input.timezone
  } catch {
    // Unknown zone from the browser: keep UTC.
  }
  const passwordHash = await hashPassword(input.password)
  return db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: users.id }).from(users).where(eq(users.email, email))
    if (existing) throw new UserInputError('An account with that email already exists.')
    const [user] = await tx.insert(users).values({ email, displayName: name, passwordHash }).returning({ id: users.id })
    const [profile] = await tx
      .insert(creatorProfiles)
      .values({ userId: user!.id, displayName: name, timezone, settings: defaultSettings(), dataMode: 'demo', setupStep: 2 })
      .returning({ id: creatorProfiles.id })
    return { userId: user!.id, profileId: profile!.id }
  })
}
