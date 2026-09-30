'use server'

import { revalidatePath } from 'next/cache'
import { getEnv } from '@/core/config/env'
import { getDb } from '@/core/db/client'
import { getLogger } from '@/core/observability/logger'
import { BriefUnavailableError, draftOnDemandBrief } from '@/core/services/briefs'
import { getProfileFor, requireUser } from '../auth/session'

export interface BriefState {
  error: string | null
}

export async function draftBrief(_prev: BriefState, form: FormData): Promise<BriefState> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile) return { error: 'Finish setup first.' }
  const clusterId = String(form.get('clusterId') ?? '')
  if (!/^[0-9a-f-]{36}$/.test(clusterId)) return { error: 'Unknown trend.' }
  try {
    await draftOnDemandBrief(await getDb(), getEnv(), profile, clusterId, getLogger('briefs'))
  } catch (err) {
    if (err instanceof BriefUnavailableError) return { error: err.message }
    getLogger('briefs').error('Brief drafting failed', { error: err })
    return { error: 'Drafting failed. Check Collection status for AI provider errors.' }
  }
  revalidatePath(`/trends/${clusterId}`)
  return { error: null }
}
