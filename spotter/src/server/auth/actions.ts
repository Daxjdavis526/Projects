'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getDb } from '@/core/db/client'
import { users } from '@/core/db/schema'
import { getLogger } from '@/core/observability/logger'
import { verifyPassword } from '@/core/security/passwords'
import { countUsers, createUserWithProfile, normalizeEmail, UserInputError } from '@/core/services/users'
import { clearAttempts, recordAttempt, tooManyAttempts } from './rate-limit'
import { createSession, destroySession } from './session'

export interface FormState {
  error: string | null
  values?: Record<string, string>
}

const log = getLogger('auth')
// Same cost parameters as real hashes (core/security/passwords.ts), so a miss takes as long as a hit.
const DUMMY_HASH = `scrypt$32768$8$1$${'A'.repeat(22)}$${'A'.repeat(86)}`

function field(form: FormData, name: string, max = 500): string {
  const value = form.get(name)
  return typeof value === 'string' ? value.slice(0, max) : ''
}

/** Only same-site relative paths, never "//host" or a full URL. */
function safeReturnTo(value: string): string {
  return /^\/(?![/\\])[\w\-/?=&%.]*$/.test(value) ? value : '/'
}

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const email = normalizeEmail(field(form, 'email', 320))
  const password = field(form, 'password', 1_000)
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
  const key = `${ip}|${email}`
  if (tooManyAttempts(key, 8, 15 * 60_000)) {
    return { error: 'Too many attempts. Wait a few minutes and try again.', values: { email } }
  }
  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  // Verify against a dummy hash when the user does not exist, so timing does not reveal accounts.
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !ok) {
    recordAttempt(key)
    log.warn('Sign-in failed', { reason: user ? 'bad_password' : 'unknown_email' })
    return { error: 'That email and password do not match.', values: { email } }
  }
  clearAttempts(key)
  await createSession(user.id)
  log.info('Signed in', { userId: user.id })
  redirect(safeReturnTo(field(form, 'returnTo', 300) || '/'))
}

export async function signOut(): Promise<void> {
  await destroySession()
  redirect('/login')
}

/** Setup step 1: the first (and only) local account. */
export async function createFirstAccount(_prev: FormState, form: FormData): Promise<FormState> {
  const values = { email: field(form, 'email', 320), displayName: field(form, 'displayName', 80) }
  const db = await getDb()
  if ((await countUsers(db)) > 0) return { error: 'An account already exists on this installation. Sign in instead.', values }
  const password = field(form, 'password', 1_000)
  if (password !== field(form, 'confirm', 1_000)) return { error: 'The two passwords do not match.', values }
  try {
    const { userId } = await createUserWithProfile(db, { ...values, password, timezone: field(form, 'timezone', 64) || 'UTC' })
    await createSession(userId)
  } catch (err) {
    if (err instanceof UserInputError) return { error: err.message, values }
    throw err
  }
  redirect('/setup')
}
