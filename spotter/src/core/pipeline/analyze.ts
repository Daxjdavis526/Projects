/**
 * AI stage: classify new or changed posts, then embed them.
 *
 * Only platforms whose policy allows derived analytics are analysed (see
 * core/compliance/policy.ts). A remote provider's failure never loses a post:
 * the batch falls back to the local provider and the failure is recorded.
 */
import { createHash } from 'node:crypto'
import { and, eq, inArray, isNull, or, sql, ne } from 'drizzle-orm'
import { LocalAIProvider } from '../ai/local/provider'
import { selectProviders } from '../ai/registry'
import { embeddingText, PROMPT_VERSION, type AnalysisResult, type ContentAnalysisInput } from '../ai/types'
import { analyzablePlatforms } from '../compliance/policy'
import { aiAnalysis, contentEmbeddings, contentItems } from '../db/schema'
import type { Platform } from '../domain/types'
import type { RunContext } from './context'
import { recordEvent } from './store/events'

const DAY = 86_400_000
const BATCH = 20

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
  const { ai, embedder, notes } = selectProviders(rc.settings, rc.env)
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
    let providerName = ai.name
    let modelName = ai.model
    let batchError: string | null = null
    try {
      results = await ai.analyzeContent(inputs)
    } catch (err) {
      batchError = err instanceof Error ? err.message : String(err)
      results = inputs.map((inp) => ({ id: inp.id, analysis: null, error: batchError }))
    }
    // Per-item fallback: anything the provider could not analyse goes to the local provider.
    const failed = results.filter((r) => !r.analysis).map((r) => r.id)
    if (failed.length) {
      fallbacks += failed.length
      const local = await fallback.analyzeContent(inputs.filter((inp) => failed.includes(inp.id)))
      const byId = new Map(local.map((r) => [r.id, r]))
      results = results.map((r) => (r.analysis ? r : { ...(byId.get(r.id) ?? r), error: r.error }))
      await recordEvent(rc.db, {
        profileId: rc.profile.id,
        level: 'warn',
        category: 'ai',
        message: `AI analysis failed for ${failed.length} post${failed.length === 1 ? '' : 's'} with ${ai.name}; used local heuristics instead. ${batchError ?? results.find((r) => r.error)?.error ?? ''}`.trim(),
        at: rc.now,
      })
    }
    for (const row of batch) {
      const result = results.find((r) => r.id === row.id)
      if (!result) continue
      const a = result.analysis
      const usedFallback = failed.includes(row.id)
      if (usedFallback) {
        providerName = fallback.name
        modelName = fallback.model
      } else {
        providerName = ai.name
        modelName = ai.model
      }
      const values = {
        contentItemId: row.id,
        provider: providerName,
        model: modelName,
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
        error: usedFallback ? `${ai.name}: ${result.error ?? 'failed'} (fell back to local)` : null,
        updatedAt: rc.now,
      }
      await rc.db
        .insert(aiAnalysis)
        .values({ ...values, createdAt: rc.now })
        .onConflictDoUpdate({ target: aiAnalysis.contentItemId, set: { ...values, attempts: sql`${aiAnalysis.attempts} + 1` } })
      if (a) analysed++
    }
  }

  // Embeddings for analysed posts lacking a current one.
  const toEmbed = await rc.db
    .select({
      id: contentItems.id,
      title: contentItems.title,
      caption: contentItems.caption,
      hashtags: contentItems.hashtags,
      transcript: contentItems.transcript,
      topic: aiAnalysis.topic,
      keywords: aiAnalysis.keywords,
      embModel: contentEmbeddings.model,
      embHash: contentEmbeddings.inputHash,
    })
    .from(contentItems)
    .innerJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded')))
    .leftJoin(contentEmbeddings, eq(contentEmbeddings.contentItemId, contentItems.id))
    .where(and(inArray(contentItems.dataOrigin, rc.origins), eq(contentItems.availability, 'available'), eligible))
  let embedded = 0
  const needs = toEmbed
    .map((row) => {
      const text = embeddingText({ title: row.title, caption: row.caption, hashtags: row.hashtags, topic: row.topic, keywords: row.keywords, transcript: row.transcript })
      return { id: row.id, text, inputHash: hash(`${embedder.model}:${text}`), current: row.embModel === embedder.model ? row.embHash : null }
    })
    .filter((r) => r.current !== r.inputHash)
  for (let i = 0; i < needs.length; i += 64) {
    const batch = needs.slice(i, i + 64)
    let vectors: number[][]
    try {
      vectors = await embedder.embed(batch.map((b) => b.text))
    } catch (err) {
      await recordEvent(rc.db, {
        profileId: rc.profile.id,
        level: 'error',
        category: 'ai',
        message: `Embedding failed with ${embedder.name}: ${err instanceof Error ? err.message : String(err)}`,
        at: rc.now,
      })
      break
    }
    for (let j = 0; j < batch.length; j++) {
      const vector = vectors[j]
      if (!vector) continue
      const values = { provider: embedder.name, model: embedder.model, dims: vector.length, vector, inputHash: batch[j]!.inputHash, createdAt: rc.now }
      await rc.db
        .insert(contentEmbeddings)
        .values({ contentItemId: batch[j]!.id, ...values })
        .onConflictDoUpdate({ target: contentEmbeddings.contentItemId, set: values })
      embedded++
    }
  }
  return { analysed, fallbacks, embedded, provider: `${ai.name}:${ai.model}`, embeddingModel: `${embedder.name}:${embedder.model}`, notes }
}
