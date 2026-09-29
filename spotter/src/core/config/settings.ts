/**
 * User-editable settings, stored per creator profile as JSON and validated
 * here. Everything the product description asks to be configurable lives in
 * this one schema, with defaults, so a missing or older settings document
 * always parses into a complete, valid one.
 */
import { z } from 'zod'
import { PLATFORMS, type Platform } from '../domain/types'

export const DEFAULT_NICHE_LABEL = 'Fitness / Bodybuilding / Strength Training'

export const DEFAULT_SUBTOPICS = [
  'bodybuilding',
  'hypertrophy',
  'powerlifting',
  'exercise technique',
  'gym culture',
  'nutrition',
  'fitness humor',
  'strength training',
]

export const DEFAULT_NICHE_KEYWORDS = [
  'gym',
  'lifting',
  'workout',
  'hypertrophy',
  'muscle',
  'strength',
  'squat',
  'bench press',
  'deadlift',
  'powerlifting',
  'bodybuilding',
  'reps',
  'sets',
  'form',
  'technique',
  'progressive overload',
  'protein',
  'creatine',
  'bulk',
  'cut',
]

/**
 * YouTube search queries used for discovery. search.list costs 100 quota
 * units per call against a default budget of 10,000 units a day: all 16
 * queries on each of three daily runs is 4,800 units, leaving room for
 * manual refreshes and stats polling. Running every query every run keeps
 * each trend sampled the same way from one run to the next, which velocity
 * comparisons depend on. With more queries than `maxSearchesPerRun`, the
 * collector rotates through the list instead.
 */
export const DEFAULT_YOUTUBE_QUERIES = [
  'squat depth hypertrophy',
  'lengthened partials',
  'training to failure',
  'progressive overload',
  'deadlift form mistakes',
  'bench press technique',
  'creatine myths',
  'protein intake muscle growth',
  'gym etiquette',
  'powerlifting meet',
  'beginner lifting mistakes',
  'rest times between sets',
  'hip thrust vs squat glutes',
  'zone 2 cardio lifters',
  'gym humor',
  'natural bodybuilding progress',
]

export const DEFAULT_INSTAGRAM_HASHTAGS = ['hypertrophy', 'powerlifting', 'gymtips', 'squat', 'bodybuilding']

const nonNegative = z.number().min(0).max(10)

export const trendWeightsSchema = z
  .object({
    velocity: nonNegative.default(0.24),
    outperformance: nonNegative.default(0.24),
    repetition: nonNegative.default(0.2),
    engagement: nonNegative.default(0.14),
    recency: nonNegative.default(0.1),
    acceleration: nonNegative.default(0.08),
  })
  .prefault({})

export const fitWeightsSchema = z
  .object({
    topic: nonNegative.default(0.35),
    niche: nonNegative.default(0.2),
    format: nonNegative.default(0.15),
    style: nonNegative.default(0.15),
    platform: nonNegative.default(0.1),
    length: nonNegative.default(0.05),
  })
  .prefault({})

const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM')

export const AI_PROVIDERS = ['local', 'anthropic', 'openai'] as const
export const EMBEDDING_PROVIDERS = ['local', 'openai', 'voyage'] as const
export type AIProviderName = (typeof AI_PROVIDERS)[number]
export type EmbeddingProviderName = (typeof EMBEDDING_PROVIDERS)[number]

export const settingsSchema = z.object({
  version: z.literal(1).default(1),
  schedule: z
    .object({
      enabled: z.boolean().default(true),
      /** Local times (in the profile timezone) at which collection runs. Default: morning, afternoon, evening. */
      times: z.array(timeOfDay).min(1).max(24).default(['07:00', '13:00', '19:00']),
    })
    .prefault({}),
  recommendations: z
    .object({
      /** 'daily' refreshes once, after the first run of the day; 'every_run' after each run. */
      frequency: z.enum(['daily', 'every_run', 'weekly']).default('daily'),
      count: z.number().int().min(3).max(15).default(7),
    })
    .prefault({}),
  trend: z
    .object({
      lookbackDays: z.number().int().min(3).max(60).default(14),
      minConfidence: z.number().min(0).max(100).default(35),
      minContentCount: z.number().int().min(1).max(25).default(3),
      minCreatorCount: z.number().int().min(1).max(10).default(2),
      /** A single post this many times its creator's baseline counts as a breakout. */
      breakoutMultiple: z.number().min(2).max(100).default(6),
      weights: trendWeightsSchema,
    })
    .prefault({}),
  fit: z
    .object({
      weights: fitWeightsSchema,
      /** Opportunity = trendWeight × Trend Score + (1 − trendWeight) × Creator Fit. */
      trendWeight: z.number().min(0).max(1).default(0.5),
    })
    .prefault({}),
  platformWeights: z
    .object({
      youtube: z.number().min(0).max(3).default(1),
      instagram: z.number().min(0).max(3).default(1),
      tiktok: z.number().min(0).max(3).default(1),
    })
    .prefault({}),
  niche: z
    .object({
      label: z.string().min(1).max(120).default(DEFAULT_NICHE_LABEL),
      subtopics: z.array(z.string().min(1).max(60)).max(40).default(DEFAULT_SUBTOPICS),
      keywords: z.array(z.string().min(1).max(60)).max(200).default(DEFAULT_NICHE_KEYWORDS),
      excludeKeywords: z.array(z.string().min(1).max(60)).max(100).default([]),
    })
    .prefault({}),
  discovery: z
    .object({
      youtube: z
        .object({
          queries: z.array(z.string().min(2).max(120)).max(100).default(DEFAULT_YOUTUBE_QUERIES),
          channelIds: z.array(z.string().min(2).max(64)).max(200).default([]),
          maxSearchesPerRun: z.number().int().min(0).max(50).default(16),
          regionCode: z.string().length(2).default('US'),
          relevanceLanguage: z.string().min(2).max(8).default('en'),
          publishedWithinDays: z.number().int().min(1).max(30).default(7),
          /** Keep re-polling public stats of a discovered video for this many days after publication. */
          trackDays: z.number().int().min(1).max(30).default(10),
        })
        .prefault({}),
      instagram: z
        .object({
          hashtags: z.array(z.string().min(1).max(100)).max(30).default(DEFAULT_INSTAGRAM_HASHTAGS),
          businessAccounts: z.array(z.string().min(1).max(64)).max(100).default([]),
        })
        .prefault({}),
    })
    .prefault({}),
  ai: z
    .object({
      provider: z.enum(AI_PROVIDERS).default('local'),
      model: z.string().max(100).nullable().default(null),
      embeddingProvider: z.enum(EMBEDDING_PROVIDERS).default('local'),
      embeddingModel: z.string().max(100).nullable().default(null),
      /** Upper bound on items sent to the AI provider per run (cost control). */
      maxItemsPerRun: z.number().int().min(10).max(2000).default(200),
    })
    .prefault({}),
})

export type AppSettings = z.infer<typeof settingsSchema>
export type TrendWeights = z.infer<typeof trendWeightsSchema>
export type FitWeights = z.infer<typeof fitWeightsSchema>

/** Parse stored settings, filling every missing field with its default. */
export function parseSettings(raw: unknown): AppSettings {
  const result = settingsSchema.safeParse(raw ?? {})
  if (result.success) return result.data
  // A corrupt or incompatible document must not take the dashboard down:
  // fall back to defaults and let the caller surface the problem.
  return settingsSchema.parse({})
}

export function defaultSettings(): AppSettings {
  return settingsSchema.parse({})
}

type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

/** Deep-merge a partial update into settings (arrays are replaced, not merged) and validate. */
export function mergeSettings(current: AppSettings, patch: DeepPartial<AppSettings>): AppSettings {
  const merge = (a: unknown, b: unknown): unknown => {
    if (b === undefined) return a
    if (Array.isArray(b) || b === null || typeof b !== 'object') return b
    if (a === null || typeof a !== 'object' || Array.isArray(a)) return b
    const out: Record<string, unknown> = { ...(a as Record<string, unknown>) }
    for (const [key, value] of Object.entries(b as Record<string, unknown>)) {
      out[key] = merge(out[key], value)
    }
    return out
  }
  return settingsSchema.parse(merge(current, patch))
}

/** Normalise weights so they sum to 1, ignoring the keys listed in `exclude`. */
export function normaliseWeights<K extends string>(
  weights: Record<K, number>,
  exclude: ReadonlySet<K> = new Set(),
): Record<K, number> {
  const keys = Object.keys(weights) as K[]
  const total = keys.filter((k) => !exclude.has(k)).reduce((sum, k) => sum + Math.max(0, weights[k]), 0)
  const out = {} as Record<K, number>
  for (const k of keys) out[k] = exclude.has(k) || total <= 0 ? 0 : Math.max(0, weights[k]) / total
  return out
}

export function platformWeight(settings: AppSettings, platform: Platform): number {
  return settings.platformWeights[platform] ?? 1
}

export { PLATFORMS }
