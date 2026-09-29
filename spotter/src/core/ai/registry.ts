/**
 * Picks the AI and embedding providers from settings and the environment.
 *
 * - A remote provider is used only when its credentials are present;
 *   otherwise the local provider is used, and a note says which variable is
 *   missing. The rest of the codebase only ever sees the interfaces.
 * - Remote providers sit behind a circuit breaker: after an authentication
 *   or rate-limit failure the provider is paused for a while and every call
 *   fails fast, so callers fall back to the local provider at once instead of
 *   repeating a failing request for every post.
 */
import { z } from 'zod'
import type { Env } from '../config/env'
import type { AIProviderName, AppSettings, EmbeddingProviderName } from '../config/settings'
import { LocalEmbeddingProvider } from './local/embedder'
import { LocalAIProvider } from './local/provider'
import { AnthropicAIProvider } from './remote/anthropic'
import { OPENAI_EMBEDDING_THRESHOLDS, OpenAIEmbeddingProvider, OpenAIProvider } from './remote/openai'
import { nichePhrase } from './remote/prompts'
import { VOYAGE_EMBEDDING_THRESHOLDS, VoyageEmbeddingProvider } from './remote/voyage'
import {
  AIProviderError,
  type AIErrorKind,
  type AIProvider,
  type AnalysisResult,
  type ClusterDescription,
  type ClusterDescriptionInput,
  type ContentAnalysisInput,
  type EmbeddingProvider,
  type EmbeddingThresholds,
  type RecommendationDraft,
  type TrendBrief,
} from './types'

export interface ProviderSelection {
  ai: AIProvider
  embedder: EmbeddingProvider
  /** Human-readable notes when the requested provider could not be used as asked. */
  notes: string[]
}

/** Settings win; the environment's choice applies while settings are left at "local". */
export function requestedProviders(settings: AppSettings, env: Env): { ai: AIProviderName; embedder: EmbeddingProviderName } {
  return {
    ai: env.AI_PROVIDER && settings.ai.provider === 'local' ? env.AI_PROVIDER : settings.ai.provider,
    embedder: env.EMBEDDING_PROVIDER && settings.ai.embeddingProvider === 'local' ? env.EMBEDDING_PROVIDER : settings.ai.embeddingProvider,
  }
}

const thresholdsSchema = z
  .object({
    join: z.number().min(0).max(1),
    create: z.number().min(0).max(1),
    merge: z.number().min(0).max(1),
    fitLow: z.number().min(-1).max(1),
    fitHigh: z.number().min(-1).max(1),
  })
  .partial()
  .strict()

/** EMBEDDING_THRESHOLDS, e.g. {"join":0.58,"create":0.62}, merged over the provider's defaults. */
export function thresholdOverride(env: Env, base: EmbeddingThresholds, notes: string[]): EmbeddingThresholds {
  if (!env.EMBEDDING_THRESHOLDS) return base
  let parsed: unknown
  try {
    parsed = JSON.parse(env.EMBEDDING_THRESHOLDS)
  } catch {
    notes.push('EMBEDDING_THRESHOLDS is not valid JSON; using the provider’s default thresholds.')
    return base
  }
  const result = thresholdsSchema.safeParse(parsed)
  if (!result.success) {
    notes.push('EMBEDDING_THRESHOLDS has unknown keys or values out of range (join, create, merge: 0 to 1; fitLow, fitHigh: −1 to 1); using the provider’s default thresholds.')
    return base
  }
  const merged = { ...base, ...result.data }
  if (merged.fitHigh <= merged.fitLow) {
    notes.push('EMBEDDING_THRESHOLDS: fitHigh must be above fitLow; using the provider’s default thresholds.')
    return base
  }
  return merged
}

function createAi(name: AIProviderName, settings: AppSettings, env: Env): AIProvider | string {
  const model = settings.ai.model ?? (env.AI_PROVIDER === name ? env.AI_MODEL : undefined) ?? null
  const niche = nichePhrase(settings.niche)
  switch (name) {
    case 'anthropic':
      if (!env.ANTHROPIC_API_KEY) return 'ANTHROPIC_API_KEY is not set'
      return new AnthropicAIProvider({ apiKey: env.ANTHROPIC_API_KEY, model, niche })
    case 'openai':
      if (!env.OPENAI_API_KEY && !env.OPENAI_BASE_URL) return 'OPENAI_API_KEY (or OPENAI_BASE_URL for a local server) is not set'
      return new OpenAIProvider({ apiKey: env.OPENAI_API_KEY, baseUrl: env.OPENAI_BASE_URL, model, niche })
    case 'local':
      return new LocalAIProvider(settings.niche.excludeKeywords)
  }
}

function createEmbedder(name: EmbeddingProviderName, settings: AppSettings, env: Env, notes: string[]): EmbeddingProvider | string {
  const model = settings.ai.embeddingModel ?? (env.EMBEDDING_PROVIDER === name ? env.EMBEDDING_MODEL : undefined) ?? null
  switch (name) {
    case 'openai':
      if (!env.OPENAI_API_KEY && !env.OPENAI_BASE_URL) return 'OPENAI_API_KEY (or OPENAI_BASE_URL for a local server) is not set'
      return new OpenAIEmbeddingProvider({
        apiKey: env.OPENAI_API_KEY,
        baseUrl: env.OPENAI_BASE_URL,
        model,
        thresholds: thresholdOverride(env, OPENAI_EMBEDDING_THRESHOLDS, notes),
      })
    case 'voyage':
      if (!env.VOYAGE_API_KEY) return 'VOYAGE_API_KEY is not set'
      return new VoyageEmbeddingProvider({ apiKey: env.VOYAGE_API_KEY, model, thresholds: thresholdOverride(env, VOYAGE_EMBEDDING_THRESHOLDS, notes) })
    case 'local':
      return new LocalEmbeddingProvider()
  }
}

export function selectProviders(settings: AppSettings, env: Env): ProviderSelection {
  const notes: string[] = []
  const requested = requestedProviders(settings, env)

  let ai = createAi(requested.ai, settings, env)
  if (typeof ai === 'string') {
    notes.push(`AI provider “${requested.ai}” is selected but ${ai}; using the local provider.`)
    ai = new LocalAIProvider(settings.niche.excludeKeywords)
  } else if (ai.remote) {
    const pause = activePause(breakerKey(ai.name, ai.model))
    if (pause) notes.push(`${ai.name} is paused until ${new Date(pause.until).toISOString().slice(11, 16)} UTC after: ${pause.error.message}`)
    ai = new GuardedAIProvider(ai)
  }

  let embedder = createEmbedder(requested.embedder, settings, env, notes)
  if (typeof embedder === 'string') {
    notes.push(`Embedding provider “${requested.embedder}” is selected but ${embedder}; using local embeddings.`)
    embedder = new LocalEmbeddingProvider()
  } else if (embedder.remote) {
    const pause = activePause(breakerKey(embedder.name, embedder.model))
    if (pause) notes.push(`${embedder.name} embeddings are paused until ${new Date(pause.until).toISOString().slice(11, 16)} UTC after: ${pause.error.message}`)
    embedder = new GuardedEmbeddingProvider(embedder)
  }
  return { ai, embedder, notes }
}

// ---------------------------------------------------------------------------
// Circuit breaker
// ---------------------------------------------------------------------------

/**
 * How long a provider is paused after a failure of this kind (retries already
 * spent). Other kinds concern one request and pause nothing.
 */
const PAUSE_MS: Partial<Record<AIErrorKind, number>> = { auth: 15 * 60_000, rate_limit: 5 * 60_000, unavailable: 2 * 60_000 }
const pauses = new Map<string, { until: number; error: AIProviderError }>()

const breakerKey = (name: string, model: string) => `${name}:${model}`

function activePause(key: string, now = Date.now()): { until: number; error: AIProviderError } | null {
  const pause = pauses.get(key)
  if (!pause) return null
  if (pause.until <= now) {
    pauses.delete(key)
    return null
  }
  return pause
}

async function guarded<T>(name: string, model: string, call: () => Promise<T>): Promise<T> {
  const key = breakerKey(name, model)
  const pause = activePause(key)
  if (pause) throw new AIProviderError(name, `Paused after an earlier failure: ${pause.error.message}`, pause.error.kind)
  try {
    return await call()
  } catch (err) {
    const ms = err instanceof AIProviderError ? PAUSE_MS[err.kind] : undefined
    if (ms && err instanceof AIProviderError) pauses.set(key, { until: Date.now() + ms, error: err })
    throw err
  }
}

/** Current pauses, for the status page. */
export function providerPauses(now = Date.now()): Array<{ provider: string; until: Date; reason: string }> {
  return [...pauses.entries()]
    .filter(([, p]) => p.until > now)
    .map(([key, p]) => ({ provider: key, until: new Date(p.until), reason: p.error.message }))
}

/** For tests. */
export function resetProviderPauses(): void {
  pauses.clear()
}

class GuardedAIProvider implements AIProvider {
  readonly name: string
  readonly model: string
  readonly remote: boolean
  constructor(private readonly inner: AIProvider) {
    this.name = inner.name
    this.model = inner.model
    this.remote = inner.remote
  }
  analyzeContent(items: ContentAnalysisInput[]): Promise<AnalysisResult[]> {
    return guarded(this.name, this.model, () => this.inner.analyzeContent(items))
  }
  describeCluster(input: ClusterDescriptionInput): Promise<ClusterDescription> {
    return guarded(this.name, this.model, () => this.inner.describeCluster(input))
  }
  draftRecommendation(brief: TrendBrief): Promise<RecommendationDraft> {
    return guarded(this.name, this.model, () => this.inner.draftRecommendation(brief))
  }
}

class GuardedEmbeddingProvider implements EmbeddingProvider {
  readonly name: string
  readonly model: string
  readonly dims: number
  readonly remote: boolean
  readonly thresholds: EmbeddingThresholds
  constructor(private readonly inner: EmbeddingProvider) {
    this.name = inner.name
    this.model = inner.model
    this.dims = inner.dims
    this.remote = inner.remote
    this.thresholds = inner.thresholds
  }
  embed(texts: string[]): Promise<number[][]> {
    return guarded(this.name, this.model, () => this.inner.embed(texts))
  }
}
