'use server'

import { redirect } from 'next/navigation'
import { and, eq, ne } from 'drizzle-orm'
import { getEnv } from '@/core/config/env'
import { parseSettings, type AppSettings } from '@/core/config/settings'
import { getDb } from '@/core/db/client'
import { collectionRuns, creatorProfiles, platformAccounts } from '@/core/db/schema'
import { connectDemoAccounts, prepareDemoWorkspace } from '@/core/demo/seed'
import { getLogger } from '@/core/observability/logger'
import { requestRun } from '@/core/pipeline/scheduler'
import { ensureInProcessWorker, inProcessWorker } from '@/core/pipeline/worker'
import { saveSettings } from '@/core/services/settings'
import { getProfileFor, requireUser } from '../auth/session'

async function profileOrRedirect() {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile) redirect('/setup')
  return profile
}

async function advance(profileId: string, current: number, to: number) {
  const db = await getDb()
  await db.update(creatorProfiles).set({ setupStep: Math.max(current, to), updatedAt: new Date() }).where(eq(creatorProfiles.id, profileId))
  redirect(`/setup?step=${to}`)
}

/** Step 2: demo data or real accounts. */
export async function setupChooseMode(form: FormData): Promise<void> {
  const profile = await profileOrRedirect()
  const mode = form.get('mode') === 'live' ? 'live' : 'demo'
  const db = await getDb()
  if (mode === 'demo') await prepareDemoWorkspace(db, profile.id, { now: new Date() })
  else await db.update(creatorProfiles).set({ dataMode: 'live', updatedAt: new Date() }).where(eq(creatorProfiles.id, profile.id))
  redirect('/setup?step=2')
}

/** Continue / Skip on steps 2–4. */
export async function setupNext(form: FormData): Promise<void> {
  const profile = await profileOrRedirect()
  const step = Math.min(7, Math.max(2, Number(form.get('step')) || 2))
  await advance(profile.id, profile.setupStep, step + 1)
}

/** Step 5: the niche. */
export async function setupNiche(form: FormData): Promise<void> {
  const profile = await profileOrRedirect()
  const db = await getDb()
  const split = (v: FormDataEntryValue | null) => [...new Set(String(v ?? '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean))]
  const subtopics = [...new Set([...form.getAll('subtopic').map(String), ...split(form.get('extraSubtopics'))])].slice(0, 40)
  const label = String(form.get('label') ?? '').trim().slice(0, 120)
  await saveSettings(db, profile.id, {
    niche: {
      ...(label ? { label } : {}),
      ...(subtopics.length ? { subtopics } : {}),
      keywords: split(form.get('keywords')).slice(0, 200),
      excludeKeywords: split(form.get('excludeKeywords')).slice(0, 100),
    },
  })
  if (label) await db.update(creatorProfiles).set({ niche: label }).where(eq(creatorProfiles.id, profile.id))
  await advance(profile.id, profile.setupStep, 6)
}

/** Step 6: recommendation frequency and schedule. */
export async function setupSchedule(form: FormData): Promise<void> {
  const profile = await profileOrRedirect()
  const db = await getDb()
  const times = [...new Set(form.getAll('time').map(String).filter((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t)))].sort()
  const frequency = String(form.get('frequency') ?? 'daily') as AppSettings['recommendations']['frequency']
  const count = Math.min(10, Math.max(5, Number(form.get('count')) || 7))
  await saveSettings(db, profile.id, {
    schedule: { enabled: true, times: times.length ? times : parseSettings(profile.settings).schedule.times },
    recommendations: { frequency: ['daily', 'every_run', 'weekly'].includes(frequency) ? frequency : 'daily', count },
  })
  const tz = String(form.get('timezone') ?? '')
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date())
    await db.update(creatorProfiles).set({ timezone: tz }).where(eq(creatorProfiles.id, profile.id))
  } catch {
    // keep the existing zone
  }
  await advance(profile.id, profile.setupStep, 7)
}

/** Step 7: finish, and start the first collection (or the demo history). */
export async function setupFinish(): Promise<void> {
  const profile = await profileOrRedirect()
  const db = await getDb()
  const env = getEnv()
  const now = new Date()
  if (profile.dataMode === 'demo') {
    if (!profile.demoAnchorAt) await prepareDemoWorkspace(db, profile.id, { now })
    const connected = await db
      .select({ id: platformAccounts.id })
      .from(platformAccounts)
      .where(and(eq(platformAccounts.creatorProfileId, profile.id), eq(platformAccounts.mode, 'mock'), ne(platformAccounts.status, 'disconnected')))
    // A demo with nothing connected would be empty: connect the three demo accounts.
    if (connected.length === 0) await connectDemoAccounts(db, env, profile.id, now)
    const [existing] = await db
      .select({ id: collectionRuns.id })
      .from(collectionRuns)
      .where(and(eq(collectionRuns.creatorProfileId, profile.id), eq(collectionRuns.dataMode, 'demo')))
      .limit(1)
    if (!existing) await db.insert(collectionRuns).values({ creatorProfileId: profile.id, dataMode: 'demo', trigger: 'demo_setup', status: 'queued', requestedAt: now })
  } else {
    await requestRun(db, profile.id, 'setup', now)
  }
  await db.update(creatorProfiles).set({ setupCompletedAt: now, setupStep: 7, updatedAt: now }).where(eq(creatorProfiles.id, profile.id))
  const worker = inProcessWorker() ?? (env.RUN_WORKER_IN_WEB ? ensureInProcessWorker(env, getLogger('worker')) : null)
  worker?.wake()
  redirect('/')
}
