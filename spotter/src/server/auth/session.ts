/**
 * Sessions for the local account.
 *
 * The cookie carries 32 random bytes; the database stores only their SHA-256,
 * so a leaked database cannot be replayed as a login. Cookies are HttpOnly,
 * SameSite=Lax and, in production, Secure with the __Host- prefix (pinned to
 * this origin, path /). Mutations go through Server Actions, which Next.js
 * only accepts as same-origin POSTs.
 */
import 'server-only'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { and, eq, gt, lt } from 'drizzle-orm'
import { getEnv, isProduction } from '@/core/config/env'
import { getDb } from '@/core/db/client'
import { creatorProfiles, sessions, users } from '@/core/db/schema'
import { sha256Hex } from '@/core/security/crypto'
import { randomToken } from '@/core/security/random'

const SESSION_DAYS = 30

export function sessionCookieName(): string {
  return isProduction(getEnv()) ? '__Host-spotter_session' : 'spotter_session'
}

export async function createSession(userId: string): Promise<void> {
  const db = await getDb()
  const token = randomToken(32)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 86_400_000)
  const userAgent = (await headers()).get('user-agent')?.slice(0, 300) ?? null
  await db.insert(sessions).values({ userId, tokenHash: sha256Hex(token), userAgent, expiresAt, lastSeenAt: now })
  await db.update(users).set({ lastLoginAt: now }).where(eq(users.id, userId))
  // Opportunistic cleanup of this user's expired sessions.
  await db.delete(sessions).where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, now)))
  ;(await cookies()).set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(getEnv()),
    path: '/',
    expires: expiresAt,
  })
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(sessionCookieName())?.value
  if (token) {
    const db = await getDb()
    await db.delete(sessions).where(eq(sessions.tokenHash, sha256Hex(token)))
  }
  jar.delete(sessionCookieName())
}

export interface SessionUser {
  id: string
  email: string
  displayName: string
}

/** The signed-in user for this request, or null. Cached per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(sessionCookieName())?.value
  if (!token || token.length > 200) return null
  const db = await getDb()
  const [row] = await db
    .select({ id: users.id, email: users.email, displayName: users.displayName })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, sha256Hex(token)), gt(sessions.expiresAt, new Date())))
    .limit(1)
  return row ?? null
})

export type Profile = typeof creatorProfiles.$inferSelect

export const getProfileFor = cache(async (userId: string): Promise<Profile | null> => {
  const db = await getDb()
  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1)
  return profile ?? null
})

/** For pages: the user, or a redirect to sign in. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return user
}

/** For app pages: the user and a profile that has finished setup. */
export async function requireProfile(): Promise<{ user: SessionUser; profile: Profile }> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile || !profile.setupCompletedAt) redirect('/setup')
  return { user, profile }
}
