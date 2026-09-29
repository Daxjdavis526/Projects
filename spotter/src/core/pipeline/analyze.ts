/**
 * AI stage: classify new or changed posts, then embed them.
 *
 * Only platforms whose policy allows derived analytics are analysed (see
 * core/compliance/policy.ts). A remote provider's failure never loses a post:
 * the affected posts go to the local provider, the failure is recorded once
 * per run, and they are retried with the remote provider next run. After an
 * authentication or rate-limit failure the remote provider is not called
 * again this run.
 *
 * Every post gets a local embedding; a configured remote embedding model adds
 * its own vector beside it (see ./providers.ts for which one clustering uses).
 */
import { createHash } from 'node:crypto'
import { and, eq, inArray, isNull, ne, notInArray, or, sql } from 'drizzle-orm'
import { LocalEmbeddingProvider } from '../ai/local/embedder'
import { LocalAIProvider } from '../ai/local/provider'
import { AIProviderError, embeddingText, PROMPT_VERSION, type AnalysisResult, type ContentAnalysisInput, type EmbeddingProvider } from '../ai/types'
import { analyzablePlatforms } from '../compliance/policy'
import { aiAnalysis, contentEmbeddings, contentItems } from '../db/schema'
import type { Platform } from '../domain/types'
import type { RunContext } from './context'
import { runProviders } from './providers'
import { recordEvent } from './store/events'

const DAY = 86_400_000
const BATCH = 20
const EMBED_BATCH = 64
/** Cost guard: most texts sent to a remote embedding model in one run. */
const MAX_REMOTE_EMBEDS_PER_RUN = 5_000

export interface AiStageResult {
  analysed: number
  fallbacks: number
  embedded: number
  provider: string
  embeddingModel: string
  notes: string[]
}

function hash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 24)
}

async function knownTopics(rc: RunContext): Promise<Array<{ key: string; label: string }>> {
  const rows = await rc.db
    .select({ key: aiAnalysis.topicKey, label: aiAnalysis.topic, n: sql<number>`count(*)` })
    .from(aiAnalysis)
    .where(and(sql`${aiAnalysis.topicKey} is not null`, eq(aiAnalysis.status, 'succeeded')))
    .groupBy(aiAnalysis.topicKey, aiAnalysis.topic)
    .orderBy(sql`count(*) desc`)
    .limit(60)
  return rows.filter((r) => r.key && r.label).map((r) => ({ key: r.key!, label: r.label! }))
}

export async function runAiStage(rc: RunContext, comments: Map<string, string[]>): Promise<AiStageResult> {
  const { ai, embedder, notes } = runProviders(rc)
  const fallback = new LocalAIProvider(rc.settings.niche.excludeKeywords)
  const allowed = analyzablePlatforms(rc.env, rc.dataMode)
  const ownPlatforms = [...allowed.own] as Platform[]
  const publicPlatforms = [...allowed.public] as Platform[]
  const publicSince = new Date(rc.now.getTime() - (rc.settings.trend.lookbackDays + 7) * DAY)
  const ownSince = new Date(rc.now.getTime() - 400 * DAY)

  const eligible = or(
    ownPlatforms.length ? and(eq(contentItems.isOwn, true), inArray(contentItems.platform, ownPlatforms), sql`${contentItems.publishedAt} >= ${ownSince}`) : sql`false`,
    publicPlatforms.length ? and(eq(contentItems.isOwn, false), inArray(contentItems.platform, publicPlatforms), sql`${contentItems.publishedAt} >= ${publicSince}`) : sql`false`,
  )
  const limit = ai.remote ? rc.settings.ai.maxItemsPerRun : 5_000
  const pending = await rc.db
    .select({
      id: contentItems.id,
      platform: contentItems.platform,
      externalId: contentItems.externalId,
      title: contentItems.title,
      caption: contentItems.caption,
      hashtags: contentItems.hashtags,
      transcript: contentItems.transcript,
      durationSeconds: contentItems.durationSeconds,
      contentHash: contentItems.contentHash,
    })
    .from(contentItems)
    .leftJoin(aiAnalysis, eq(aiAnalysis.contentItemId, contentItems.id))
    .where(
      and(
        inArray(contentItems.dataOrigin, rc.origins),
        eq(contentItems.availability, 'available'),
        sql`${contentItems.contentHash} is not null`,
        eligible,
        or(isNull(aiAnalysis.id), ne(aiAnalysis.inputHash, contentItems.contentHash), ne(aiAnalysis.provider, ai.name)),
      ),
    )
    .orderBy(sql`${contentItems.publishedAt} desc nulls last`)
    .limit(limit)

  let analysed = 0
  let fallbacks = 0
  let firstError: string | null = null
  /** Set when the remote provider cannot serve anything this run (bad key, rate limit). */
  let remoteDown: string | null = null
  const topics = pending.length ? await knownTopics(rc) : []
  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH)
    const inputs: ContentAnalysisInput[] = batch.map((row) => ({
      id: row.id,
      platform: row.platform,
      title: row.title,
      caption: row.caption,
      hashtags: row.hashtags ?? [],
      transcript: row.transcript,
      comments: comments.get(`${row.platform}:${row.externalId}`) ?? [],
      durationSeconds: row.durationSeconds,
      knownTopics: topics,
    }))
    let results: AnalysisResult[]
    if (remoteDown) {
      results = inputs.map((inp) => ({ id: inp.id, analysis: null, error: remoteDown }))
    } else {
      try {
        results = await ai.analyzeContent(inputs)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (err instanceof AIProviderError && err.disablesProvider) remoteDown = message
        results = inputs.map((inp) => ({ id: inp.id, analysis: null, error: message }))
      }
    }
    // Per-item fallback: anything the provider could not analyse goes to the local provider.
    const failed = new Set(results.filter((r) => !r.analysis).map((r) => r.id))
    if (failed.size) {
      fallbacks += failed.size
      firstError ??= results.find((r) => r.error)?.error ?? null
      const local = await fallback.analyzeContent(inputs.filter((inp) => failed.has(inp.id)))
      const byId = new Map(local.map((r) => [r.id, r]))
      results = results.map((r) => (r.analysis ? r : { ...(byId.get(r.id) ?? r), error: r.error }))
    }
    for (const row of batch) {
      const result = results.find((r) => r.id === row.id)
      if (!result) continue
      const a = result.analysis
      const usedFallback = failed.has(row.id)
      const producer = usedFallback ? fallback : ai
      const values = {
        contentItemId: row.id,
        provider: producer.name,
        model: producer.model,
        promptVersion: PROMPT_VERSION,
        inputHash: row.contentHash!,
        status: a ? ('succeeded' as const) : ('failed' as const),
        topic: a?.topic ?? null,
        topicKey: a?.topicKey ?? null,
        format: a?.format ?? null,
        hook: a?.hook ?? null,
        hookType: a?.hookType ?? null,
        style: a?.style ?? null,
        targetAudience: a?.targetAudience ?? null,
        controversy: a?.controversy ?? null,
        exercises: a?.exercises ?? null,
        keywords: a?.keywords ?? null,
        summary: a?.summary ?? null,
        confidence: a?.confidence ?? null,
        nicheRelevance: a?.nicheRelevance ?? null,
        error: usedFallback ? `${ai.name}: ${result.error ?? 'failed'} (fell back to local)`.slice(0, 500) : null,
        updatedAt: rc.now,
      }
      await rc.db
        .insert(aiAnalysis)
        .values({ ...values, createdAt: rc.now })
        .onConflictDoUpdate({ target: aiAnalysis.contentItemId, set: { ...values, attempts: sql`${aiAnalysis.attempts} + 1` } })
      if (a) analysed++
    }
  }
  if (fallbacks) {
    await recordEvent(rc.db, {
      profileId: rc.profile.id,
      level: 'warn',
      category: 'ai',
      message: `AI analysis failed for ${fallbacks} post${fallbacks === 1 ? '' : 's'} with ${ai.name}; used local heuristics instead and will retry next run. ${firstError ?? ''}`.trim(),
      at: rc.now,
    })
  }

  // Embeddings: always the local model, plus the configured remote model if any.
  const local = new LocalEmbeddingProvider()
  let embedded = 0
  for (const model of embedder.remote ? [local, embedder] : [embedder]) {
    embedded += await embedMissing(rc, model, eligible, model.remote ? MAX_REMOTE_EMBEDS_PER_RUN : Infinity)
  }
  // Vectors from models no longer configured are never compared again.
  const keep = [...new Set([local.model, embedder.model])]
  await rc.db
    .delete(contentEmbeddings)
    .where(
      and(
        notInArray(contentEmbeddings.model, keep),
        inArray(contentEmbeddings.contentItemId, rc.db.select({ id: contentItems.id }).from(contentItems).where(inArray(contentItems.dataOrigin, rc.origins))),
      ),
    )
  return { analysed, fallbacks, embedded, provider: `${ai.name}:${ai.model}`, embeddingModel: `${embedder.name}:${embedder.model}`, notes }
}

/** Embed analysed posts that lack a current vector from this model. Returns how many were stored. */
async function embedMissing(rc: RunContext, embedder: EmbeddingProvider, eligible: ReturnType<typeof or>, max: number): Promise<number> {
  const rows = await rc.db
    .select({
      id: contentItems.id,
      title: contentItems.title,
      caption: contentItems.caption,
      hashtags: contentItems.hashtags,
      transcript: contentItems.transcript,
      topic: aiAnalysis.topic,
      keywords: aiAnalysis.keywords,
      embHash: contentEmbeddings.inputHash,
    })
    .from(contentItems)
    .innerJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded')))
    .leftJoin(contentEmbeddings, and(eq(contentEmbeddings.contentItemId, contentItems.id), eq(contentEmbeddings.model, embedder.model)))
    .where(and(inArray(contentItems.dataOrigin, rc.origins), eq(contentItems.availability, 'available'), eligible))
    .orderBy(sql`${contentItems.publishedAt} desc nulls last`)
  const needs = rows
    .map((row) => {
      const text = embeddingText({ title: row.title, caption: row.caption, hashtags: row.hashtags, topic: row.topic, keywords: row.keywords, transcript: row.transcript })
      return { id: row.id, text, inputHash: hash(`${embedder.model}:${text}`), current: row.embHash }
    })
    .filter((r) => r.current !== r.inputHash)
    .slice(0, max)
  let embedded = 0
  for (let i = 0; i < needs.length; i += EMBED_BATCH) {
    const batch = needs.slice(i, i + EMBED_BATCH)
    let vectors: number[][]
    try {
      vectors = await embedder.embed(batch.map((b) => b.text))
    } catch (err) {
      await recordEvent(rc.db, {
        profileId: rc.profile.id,
        level: embedder.remote ? 'warn' : 'error',
        category: 'ai',
        message: `Embedding failed with ${embedder.name} after ${embedded} of ${needs.length} posts: ${err instanceof Error ? err.message : String(err)}${embedder.remote ? ' Trends keep using local embeddings meanwhile.' : ''}`,
        at: rc.now,
      })
      break
    }
    for (let j = 0; j < batch.length; j++) {
      const vector = vectors[j]
      if (!vector) continue
      const values = { provider: embedder.name, dims: vector.length, vector, inputHash: batch[j]!.inputHash, createdAt: rc.now }
      await rc.db
        .insert(contentEmbeddings)
        .values({ contentItemId: batch[j]!.id, model: embedder.model, ...values })
        .onConflictDoUpdate({ target: [contentEmbeddings.contentItemId, contentEmbeddings.model], set: values })
      embedded++
    }
  }
  return embedded
}
