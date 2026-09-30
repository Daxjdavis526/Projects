'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getEnv } from '@/core/config/env'
import { getLogger } from '@/core/observability/logger'
import { disconnectAccount } from '@/core/services/connections'
import { getDb } from '@/core/db/client'
import { requireUser, getProfileFor } from '../auth/session'
import { modeFor, OAuthFlowError, parsePlatform, safeReturnTo, startAuthorization } from '../oauth'

/** Form action: send the browser to the platform's consent screen. */
export async function connectPlatform(form: FormData): Promise<void> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile) redirect('/setup')
  const platform = parsePlatform(String(form.get('platform') ?? ''))
  const returnTo = safeReturnTo(String(form.get('returnTo') ?? ''), profile.setupCompletedAt ? '/connections' : '/setup')
  let url: string
  try {
    url = await startAuthorization({ userId: user.id, profile, platform, returnTo })
  } catch (err) {
    const code = err instanceof OAuthFlowError ? err.code : 'exchange_failed'
    redirect(`${returnTo.split('?')[0]}?oauth_error=${code}&platform=${platform}`)
  }
  redirect(url)
}

/** Form action: revoke (where possible), delete tokens and the data collected through the account. */
export async function disconnectPlatform(form: FormData): Promise<void> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile) redirect('/setup')
  const platform = parsePlatform(String(form.get('platform') ?? ''))
  const db = await getDb()
  await disconnectAccount(db, getEnv(), getLogger('connections'), { profileId: profile.id, platform, mode: modeFor(profile), reason: 'user' })
  revalidatePath('/', 'layout')
  redirect(`${safeReturnTo(String(form.get('returnTo') ?? ''), '/connections').split('?')[0]}?disconnected=${platform}`)
}
