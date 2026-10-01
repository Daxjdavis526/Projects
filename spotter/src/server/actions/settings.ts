'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { ZodError } from 'zod'
import { getEnv } from '@/core/config/env'
import { AI_PROVIDERS, EMBEDDING_PROVIDERS, parseSettings, type AppSettings } from '@/core/config/settings'
import { getDb } from '@/core/db/client'
import { collectionRuns, creatorProfiles } from '@/core/db/schema'
import { connectDemoAccounts, prepareDemoWorkspace } from '@/core/demo/seed'
import { getLogger } from '@/core/observability/logger'
import { ensureInProcessWorker, inProcessWorker } from '@/core/pipeline/worker'
import { applyWeightsToActiveTrends, saveSettings } from '@/core/services/settings'
import { getProfileFor, requireUser } from '../auth/session'

export interface SaveState {
  ok: boolean
  message: string | null
  section?: string
}

const text = (form: FormData, name: string, max = 2_000) => {
  const v = form.get(name)
  return typeof v === 'string' ? v.slice(0, max).trim() : ''
}
const num = (form: FormData, name: string) => {
  const v = Number(text(form, name, 20))
  return Number.isFinite(v) ? v : NaN
}
const list = (value: string, separator: RegExp = /[,\n]/) =>
  [...new Set(value.split(separator).map((s) => s.trim()).filter(Boolean))]

function validTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(new Date())
    return true
  } catch {
    return false
  }
}

function zodMessage(err: ZodError): string {
  return err.issues
    .slice(0, 3)
    .map((i) => `${i.path.join(' › ') || 'value'}: ${i.message}`)
    .join('; ')
}

export async function saveSettingsSection(_prev: SaveState, form: FormData): Promise<SaveState> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile) return { ok: false, message: 'No profile.' }
  const db = await getDb()
  const section = text(form, 'section', 40)
  const current = parseSettings(profile.settings)
  try {
    let patch: Parameters<typeof saveSettings>[2]
    switch (section) {
      case 'schedule': {
        const times = [...new Set(form.getAll('time').map((t) => String(t).trim()).filter(Boolean))].sort()
        const tz = text(form, 'timezone', 64)
        if (tz && !validTimeZone(tz)) return { ok: false, message: 'Unknown time zone.', section }
        if (tz && tz !== profile.timezone) await db.update(creatorProfiles).set({ timezone: tz }).where(eq(creatorProfiles.id, profile.id))
        patch = {
          schedule: { enabled: form.get('enabled') === 'on', times },
          recommendations: { frequency: text(form, 'frequency', 20) as AppSettings['recommendations']['frequency'], count: num(form, 'count') },
        }
        break
      }
      case 'weights': {
        const keys = ['velocity', 'outperformance', 'repetition', 'engagement', 'recency', 'acceleration'] as const
        const weights = Object.fromEntries(keys.map((k) => [k, num(form, k) / 100])) as AppSettings['trend']['weights']
        if (Object.values(weights).every((w) => !(w > 0))) return { ok: false, message: 'At least one component needs a weight above zero.', section }
        patch = { trend: { weights } }
        break
      }
      case 'fit': {
        const keys = ['topic', 'niche', 'format', 'style', 'platform', 'length'] as const
        const weights = Object.fromEntries(keys.map((k) => [k, num(form, k) / 100])) as AppSettings['fit']['weights']
        if (Object.values(weights).every((w) => !(w > 0))) return { ok: false, message: 'At least one component needs a weight above zero.', section }
        patch = { fit: { weights, trendWeight: num(form, 'trendWeight') / 100 } }
        break
      }
      case 'gates':
        patch = {
          trend: {
            lookbackDays: num(form, 'lookbackDays'),
            minConfidence: num(form, 'minConfidence'),
            minContentCount: num(form, 'minContentCount'),
            minCreatorCount: num(form, 'minCreatorCount'),
            breakoutMultiple: num(form, 'breakoutMultiple'),
          },
        }
        break
      case 'niche':
        patch = {
          niche: {
            label: text(form, 'label', 120),
            subtopics: list(text(form, 'subtopics')),
            keywords: list(text(form, 'keywords', 5_000)),
            excludeKeywords: list(text(form, 'excludeKeywords')),
          },
        }
        break
      case 'platforms':
        patch = { platformWeights: { youtube: num(form, 'youtube'), instagram: num(form, 'instagram'), tiktok: num(form, 'tiktok') } }
        break
      case 'discovery':
        patch = {
          discovery: {
            youtube: {
              queries: list(text(form, 'queries', 10_000), /\n/),
              channelIds: list(text(form, 'channelIds', 10_000), /[\s,]+/),
              maxSearchesPerRun: num(form, 'maxSearchesPerRun'),
              publishedWithinDays: num(form, 'publishedWithinDays'),
              trackDays: num(form, 'trackDays'),
            },
            instagram: {
              hashtags: list(text(form, 'hashtags').replace(/#/g, ''), /[\s,]+/),
              businessAccounts: list(text(form, 'businessAccounts', 10_000).replace(/@/g, ''), /[\s,]+/),
            },
          },
        }
        break
      case 'ai': {
        const provider = text(form, 'provider', 20)
        const embeddingProvider = text(form, 'embeddingProvider', 20)
        if (!(AI_PROVIDERS as readonly string[]).includes(provider) || !(EMBEDDING_PROVIDERS as readonly string[]).includes(embeddingProvider)) {
          return { ok: false, message: 'Unknown provider.', section }
        }
        const model = text(form, 'model', 100) || null
        const embeddingModel = text(form, 'embeddingModel', 100) || null
        const mismatch = modelMismatch(provider, model, embeddingProvider, embeddingModel)
        if (mismatch) return { ok: false, message: mismatch, section }
        patch = {
          ai: {
            provider: provider as AppSettings['ai']['provider'],
            model: provider === 'local' ? null : model,
            embeddingProvider: embeddingProvider as AppSettings['ai']['embeddingProvider'],
            embeddingModel: embeddingProvider === 'local' ? null : embeddingModel,
            maxItemsPerRun: num(form, 'maxItemsPerRun'),
          },
        }
        break
      }
      default:
        return { ok: false, message: 'Unknown section.', section }
    }
    const saved = await saveSettings(db, profile.id, patch)
    let note = ''
    if (section === 'weights' || section === 'fit') {
      const n = await applyWeightsToActiveTrends(db, profile.id, profile.dataMode, saved)
      note = n ? ` ${n} active trends re-scored with the new weights.` : ''
    }
    if (section === 'ai' && (current.ai.embeddingProvider !== saved.ai.embeddingProvider || current.ai.embeddingModel !== saved.ai.embeddingModel)) {
      note =
        saved.ai.embeddingProvider === 'local'
          ? ' Trends switch back to built-in embeddings on the next run and re-form on them.'
          : ' Posts are embedded with the new model from the next run; trends move to it (and re-form once) when it covers 90% of recent posts.'
    }
    revalidatePath('/', 'layout')
    return { ok: true, message: `Saved.${note}`, section }
  } catch (err) {
    if (err instanceof ZodError) return { ok: false, message: zodMessage(err), section }
    getLogger('settings').error('Saving settings failed', { error: err, section })
    return { ok: false, message: 'Could not save these settings.', section }
  }
}

/** Switch the workspace between simulated demo data and real accounts. Nothing is deleted either way. */
export async function switchDataMode(form: FormData): Promise<void> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile) redirect('/setup')
  const target = text(form, 'mode', 10)
  const db = await getDb()
  const env = getEnv()
  if (target === 'live') {
    await db.update(creatorProfiles).set({ dataMode: 'live', updatedAt: new Date() }).where(eq(creatorProfiles.id, profile.id))
    revalidatePath('/', 'layout')
    redirect('/connections')
  }
  if (target === 'demo') {
    const now = new Date()
    await prepareDemoWorkspace(db, profile.id, { now })
    const [anyRun] = await db
      .select({ id: collectionRuns.id })
      .from(collectionRuns)
      .where(and(eq(collectionRuns.creatorProfileId, profile.id), eq(collectionRuns.dataMode, 'demo')))
      .limit(1)
    if (!anyRun) await queueDemoHistory(profile.id, now, env)
    revalidatePath('/', 'layout')
    redirect('/')
  }
}

/** Throw away the demo world and build a fresh one (simulated data only). */
export async function resetDemo(): Promise<void> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile || profile.dataMode !== 'demo') redirect('/settings')
  const db = await getDb()
  const now = new Date()
  await prepareDemoWorkspace(db, profile.id, { now, reset: true })
  await queueDemoHistory(profile.id, now, getEnv())
  revalidatePath('/', 'layout')
  redirect('/')
}

async function queueDemoHistory(profileId: string, now: Date, env: ReturnType<typeof getEnv>): Promise<void> {
  const db = await getDb()
  await connectDemoAccounts(db, env, profileId, new Date(now.getTime() - 10 * 86_400_000))
  await db.insert(collectionRuns).values({ creatorProfileId: profileId, dataMode: 'demo', trigger: 'demo_setup', status: 'queued', requestedAt: now })
  const worker = inProcessWorker() ?? (env.RUN_WORKER_IN_WEB ? ensureInProcessWorker(env, getLogger('worker')) : null)
  worker?.wake()
}

/** A model name that plainly belongs to another provider is a mistake worth catching before a run fails on it. */
function modelMismatch(provider: string, model: string | null, embeddingProvider: string, embeddingModel: string | null): string | null {
  if (model && provider === 'anthropic' && !model.startsWith('claude-')) return 'Anthropic model names start with “claude-” (for example claude-opus-5-5).'
  if (model && provider === 'openai' && model.startsWith('claude-')) return 'That is an Anthropic model; choose Anthropic as the language model, or an OpenAI model name.'
  if (embeddingModel && embeddingProvider === 'voyage' && !embeddingModel.startsWith('voyage-')) return 'Voyage model names start with “voyage-” (for example voyage-4-lite).'
  if (embeddingModel && embeddingProvider === 'openai' && embeddingModel.startsWith('voyage-')) return 'That is a Voyage model; choose Voyage AI for embeddings.'
  return null
}
