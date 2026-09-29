/**
 * The AI layer's contracts. Everything else in the codebase talks to these
 * interfaces, never to a vendor SDK, so providers can be swapped (local
 * heuristics, Anthropic, OpenAI, a local model server) by configuration.
 *
 * AI classifies and writes. It never produces a score: every number on the
 * dashboard comes from the deterministic engine in core/analytics.
 */
import type { Platform, RecommendationBeat } from '../domain/types'

export const PROMPT_VERSION = 'v1'

export interface ContentAnalysisInput {
  id: string
  platform: Platform
  title: string | null
  caption: string | null
  hashtags: string[]
  transcript: string | null
  /** Top comments, when the platform exposes them and policy allows. Never stored. */
  comments: string[]
  durationSeconds: number | null
  /** Existing topic keys, so a provider can reuse them instead of inventing synonyms. */
  knownTopics: Array<{ key: string; label: string }>
}

export interface ContentAnalysis {
  /** Human-readable topic, e.g. "Deep squat vs partial squat hypertrophy". */
  topic: string
  /** Canonical snake_case key used for grouping, e.g. "squat_depth_rom". */
  topicKey: string
  /** e.g. "Debate / reaction", "Tutorial / how-to". */
  format: string
  /** The opening line that hooks the viewer, as observed (never rewritten). */
  hook: string | null
  /** e.g. "Contrarian claim", "Question", "Mistake callout". */
  hookType: string
  /** e.g. "Educational controversy", "Comedy". */
  style: string
  /** e.g. "Intermediate lifters". */
  targetAudience: string
  /** 0–1: how debate-provoking the framing is. */
  controversy: number
  exercises: string[]
  keywords: string[]
  summary: string
  /** 0–1: how squarely this belongs to the configured niche. */
  nicheRelevance: number
  /** 0–1: the provider's confidence in this classification. */
  confidence: number
}

export interface AnalysisResult {
  id: string
  analysis: ContentAnalysis | null
  error: string | null
}

export interface ClusterDescriptionInput {
  members: Array<{ title: string | null; caption: string | null; topic: string | null; format: string | null; hook: string | null }>
  topTopics: Array<{ value: string; count: number }>
  keywords: string[]
}

export interface ClusterDescription {
  /** Short trend name, ≤ 60 characters. */
  label: string
  /** One sentence: what the trend is. */
  summary: string
}

export interface TrendFacts {
  posts: number
  creators: number
  /** Platform display names, e.g. ["YouTube", "Instagram"]. */
  platforms: string[]
  postsLast3Days: number
  postsPrevious3Days: number
  /** Momentum growth per day (performance-weighted posts, 3 days vs the 3 before). */
  momentumPerDay: number | null
  /** Median and best multiple of their creators' usual views. */
  medianOutperformance: number | null
  bestOutperformance: number | null
  viewsPerHour: number | null
}

/** Everything a provider may use to write a recommendation. Evidence, not scripts. */
export interface TrendBrief {
  trendLabel: string
  /** Canonical topic key of the trend, when known. */
  topicKey: string | null
  trendSummary: string | null
  stage: string
  trendScore: number
  fitScore: number
  evidenceLines: string[]
  /** The key measured facts behind the evidence lines, for writers that compose their own sentences. */
  facts: TrendFacts
  /** Recurring patterns (not copied text): formats, hook types, styles. */
  formats: string[]
  hookTypes: string[]
  styles: string[]
  /** Example titles for context only; the provider must not reuse them. */
  exampleTitles: string[]
  niche: string
  /** What works for this creator, in plain English. */
  creatorInsights: string[]
  /** Why this trend suits this creator specifically (from the fit components). */
  fitReasons: string[]
  /** Position in today's batch (0-based), so a writer can vary its openings across the batch. */
  variant: number
  creatorBestFormats: string[]
  creatorBestHookTypes: string[]
  /** The creator's typical best-performing length, e.g. "30–45s". */
  targetLength: string | null
  audience: string | null
  ownPriorPost: string | null
}

export interface RecommendationDraft {
  oneLiner: string
  whyItMatters: string
  suggestedAngle: string
  suggestedHook: string
  titleConcept: string
  captionConcept: string
  structure: RecommendationBeat[]
  alternativeAngles: string[]
}

export interface AIProvider {
  readonly name: string
  readonly model: string
  /** Whether this provider makes network calls (and so can fail or cost money). */
  readonly remote: boolean
  analyzeContent(items: ContentAnalysisInput[]): Promise<AnalysisResult[]>
  describeCluster(input: ClusterDescriptionInput): Promise<ClusterDescription>
  draftRecommendation(brief: TrendBrief): Promise<RecommendationDraft>
}

export interface EmbeddingThresholds {
  /** Similarity for a post to join an existing trend. */
  join: number
  /** Similarity for posts to form a new trend together. */
  create: number
  /** Trends this similar are merged. */
  merge: number
  /** Similarity at which topic fit is 0 and 100 respectively. */
  fitLow: number
  fitHigh: number
}

export interface EmbeddingProvider {
  readonly name: string
  readonly model: string
  readonly dims: number
  readonly remote: boolean
  /** Calibrated for this model's similarity distribution. */
  readonly thresholds: EmbeddingThresholds
  embed(texts: string[]): Promise<number[][]>
}

export class AIProviderError extends Error {
  readonly provider: string
  readonly retryable: boolean
  constructor(provider: string, message: string, retryable = false) {
    super(message)
    this.name = 'AIProviderError'
    this.provider = provider
    this.retryable = retryable
  }
}

/** The text that represents a post for embedding. Keeps providers consistent. */
export function embeddingText(input: {
  title: string | null
  caption: string | null
  hashtags: string[] | null
  topic?: string | null
  keywords?: string[] | null
  transcript?: string | null
}): string {
  return [
    input.topic ? `Topic: ${input.topic}.` : '',
    input.title ?? '',
    input.caption ?? '',
    input.hashtags?.length ? input.hashtags.map((h) => `#${h}`).join(' ') : '',
    input.keywords?.length ? `Keywords: ${input.keywords.join(', ')}.` : '',
    input.transcript ? input.transcript.slice(0, 1_000) : '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 4_000)
}
