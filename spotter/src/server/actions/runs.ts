'use server'

import { revalidatePath } from 'next/cache'
import { getEnv } from '@/core/config/env'
import { getDb } from '@/core/db/client'
import { getLogger } from '@/core/observability/logger'
import { requestRun } from '@/core/pipeline/scheduler'
import { ensureInProcessWorker, inProcessWorker } from '@/core/pipeline/worker'
import { getProfileFor, requireUser } from '../auth/session'

export interface RefreshState {
  message: string | null
  error: string | null
  /** When this result was produced; keys the toast so each result shows once. */
  at: number
}

/** "Refresh now": queue a manual run (at most one pending at a time) and wake the worker. */
export async function refreshNow(_prev: RefreshState): Promise<RefreshState> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile?.setupCompletedAt) return { message: null, error: 'Finish setup first.', at: Date.now() }
  const db = await getDb()
  const { alreadyPending } = await requestRun(db, profile.id, 'manual')
  const env = getEnv()
  const worker = inProcessWorker() ?? (env.RUN_WORKER_IN_WEB ? ensureInProcessWorker(env, getLogger('worker')) : null)
  worker?.wake()
  revalidatePath('/', 'layout')
  if (alreadyPending) return { message: 'A refresh is already queued.', error: null, at: Date.now() }
  return {
    message: worker ? 'Refresh started. New data appears as each platform finishes.' : 'Refresh queued. The background worker (npm run worker) will pick it up.',
    error: null,
    at: Date.now(),
  }
}
