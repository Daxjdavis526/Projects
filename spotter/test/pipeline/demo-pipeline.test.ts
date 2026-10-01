/**
 * The whole pipeline, end to end, on an in-memory PostgreSQL (PGlite):
 * demo world → mock connectors → AI stage → trends → personalisation →
 * recommendations. Then remote providers are switched on against fake
 * endpoints (no network, no keys) to show that a working provider is picked
 * up and that a failing one never costs the dashboard its trends.
 */
import { and, count, eq, like } from 'drizzle-orm'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { embedLocally, LocalEmbeddingProvider } from '@/core/ai/local/embedder'
import { resetProviderPauses } from '@/core/ai/registry'
import { parseEnv, type Env } from '@/core/config/env'
import { openDatabase, type DbHandle } from '@/core/db/client'
import { aiAnalysis, collectionRuns, contentEmbeddings, recommendations, systemEvents, trendClusters } from '@/core/db/schema'
import { demoSummary, seedDemoWorkspace } from '@/core/demo/seed'
import { createMemoryLogger } from '@/core/observability/logger'
import { executeRun, type RunStatus } from '@/core/pipeline/runner'
import { createUserWithProfile } from '@/core/services/users'

const HOUR = 3_600_000
const NOW = new Date('2026-09-28T14:00:00Z')
const logger = createMemoryLogger('error')
let handle: DbHandle
let profileId: string

async function runAt(env: Env, at: Date): Promise<RunStatus> {
  const [run] = await handle.db
    .insert(collectionRuns)
    .values({ creatorProfileId: profileId, dataMode: 'demo', trigger: 'manual', status: 'queued', requestedAt: at, clockAt: at })
    .returning({ id: collectionRuns.id })
  return executeRun(handle.db, env, run!.id, { logger, clock: () => at })
}

async function activeClusters() {
  return handle.db
    .select({ id: trendClusters.id, model: trendClusters.embeddingModel })
    .from(trendClusters)
    .where(and(eq(trendClusters.creatorProfileId, profileId), eq(trendClusters.status, 'active')))
}

async function events(pattern: string) {
  return handle.db.select({ message: systemEvents.message }).from(systemEvents).where(like(systemEvents.message, pattern))
}

beforeAll(async () => {
  handle = await openDatabase({ url: null, pgliteDir: null, runMigrations: true })
  ;({ profileId } = await createUserWithProfile(handle.db, {
    email: 'pipeline@spotter.test',
    displayName: 'Pipeline Test',
    password: 'correct horse battery staple',
    timezone: 'America/New_York',
  }))
  await seedDemoWorkspace(handle.db, parseEnv({}), profileId, { days: 4, now: NOW, logger })
}, 300_000)

afterAll(async () => {
  vi.unstubAllGlobals()
  await handle?.close()
})

beforeEach(() => {
  resetProviderPauses()
  vi.unstubAllGlobals()
})

describe('demo pipeline', () => {
  it('turns the demo world into scored trends and 5–10 recommendations', async () => {
    const summary = await demoSummary(handle.db, profileId)
    expect(summary.items).toBeGreaterThan(200)
    expect(summary.activeTrends).toBeGreaterThanOrEqual(5)
    expect(summary.recommendations).toBeGreaterThanOrEqual(5)
    expect(summary.recommendations).toBeLessThanOrEqual(10)

    const recs = await handle.db.select().from(recommendations).where(eq(recommendations.creatorProfileId, profileId))
    for (const rec of recs) {
      // Every number is from the deterministic engine, within range.
      for (const score of [rec.trendScore, rec.creatorFitScore, rec.opportunityScore]) {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      }
      expect(rec.suggestedHook.length).toBeGreaterThan(5)
      expect(rec.evidence.examples.length).toBeGreaterThan(0)
    }
    // Every analysed post carries a local embedding.
    const [local] = await handle.db.select({ n: count() }).from(contentEmbeddings).where(eq(contentEmbeddings.model, new LocalEmbeddingProvider().model))
    const [analysed] = await handle.db.select({ n: count() }).from(aiAnalysis).where(eq(aiAnalysis.status, 'succeeded'))
    expect(Number(local!.n)).toBeGreaterThan(0)
    expect(Number(local!.n)).toBeLessThanOrEqual(Number(analysed!.n))
  })

  it('falls back to local analysis once, not per post, when the AI provider rejects its key', async () => {
    const fetch = vi.fn(async () => Response.json({ error: { message: 'Incorrect API key provided' } }, { status: 401 }))
    vi.stubGlobal('fetch', fetch)
    const env = parseEnv({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-test-bad-key-000000000000', AI_MODEL: 'gpt-6-luna' })
    const before = (await activeClusters()).length

    const status = await runAt(env, new Date(NOW.getTime() + HOUR))
    expect(status).not.toBe('failed')
    // One rejected request, then the provider is paused for the run; nothing is lost.
    expect(fetch.mock.calls.length).toBeLessThanOrEqual(2)
    const failures = await events('AI analysis failed for % with openai%')
    expect(failures).toHaveLength(1)
    expect(failures[0]!.message).not.toContain('sk-test')
    expect((await activeClusters()).length).toBeGreaterThanOrEqual(before - 2)
  })

  it('switches trend grouping to a remote embedding model once it covers the posts', async () => {
    const fetch = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { input: string[] }
      return Response.json({ data: body.input.map((text, index) => ({ index, embedding: embedLocally(text, 384) })) })
    })
    vi.stubGlobal('fetch', fetch)
    const env = parseEnv({ EMBEDDING_PROVIDER: 'openai', OPENAI_BASE_URL: 'http://embeddings.test/v1', EMBEDDING_MODEL: 'fake-embed' })

    await runAt(env, new Date(NOW.getTime() + 2 * HOUR))
    expect(fetch).toHaveBeenCalled()
    const clusters = await activeClusters()
    expect(clusters.length).toBeGreaterThanOrEqual(5)
    expect(new Set(clusters.map((c) => c.model))).toEqual(new Set(['fake-embed']))
    expect(await events('Trend grouping now uses openai embeddings%')).toHaveLength(1)
    // Local vectors are kept beside the remote ones as the safety net.
    const models = await handle.db.selectDistinct({ model: contentEmbeddings.model }).from(contentEmbeddings)
    expect(new Set(models.map((m) => m.model))).toEqual(new Set(['fake-embed', new LocalEmbeddingProvider().model]))
  })

  it('keeps its trends when the embedding provider starts failing', async () => {
    const fetch = vi.fn(async () => Response.json({ error: { message: 'Invalid API key' } }, { status: 401 }))
    vi.stubGlobal('fetch', fetch)
    const env = parseEnv({ EMBEDDING_PROVIDER: 'openai', OPENAI_BASE_URL: 'http://embeddings.test/v1', EMBEDDING_MODEL: 'fake-embed' })
    const before = await activeClusters()

    const status = await runAt(env, new Date(NOW.getTime() + 3 * HOUR))
    expect(status).not.toBe('failed')
    expect(await events('Embedding failed with openai%')).not.toHaveLength(0)
    const after = await activeClusters()
    expect(after.length).toBeGreaterThanOrEqual(before.length - 2)
    expect(new Set(after.map((c) => c.model))).toEqual(new Set(['fake-embed']))
  })

  it('drops vectors from a model that is no longer configured', async () => {
    await runAt(parseEnv({}), new Date(NOW.getTime() + 4 * HOUR))
    const models = await handle.db.selectDistinct({ model: contentEmbeddings.model }).from(contentEmbeddings)
    expect(models.map((m) => m.model)).toEqual([new LocalEmbeddingProvider().model])
    // Back on local vectors: the remote-model trends retire and re-form.
    const clusters = await activeClusters()
    expect(clusters.length).toBeGreaterThanOrEqual(5)
    expect(new Set(clusters.map((c) => c.model))).toEqual(new Set([new LocalEmbeddingProvider().model]))
  })
})
