/**
 * Process environment, validated once. Secrets live only here (read from the
 * environment or a local .env file) and in encrypted database columns; they
 * are never sent to the browser and never logged.
 */
import { z } from 'zod'

const emptyToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value)
const optionalString = z.preprocess(emptyToUndefined, z.string().optional())
const bool = (fallback: boolean) =>
  z.preprocess((value) => {
    const v = emptyToUndefined(value)
    if (v === undefined) return fallback
    if (typeof v === 'boolean') return v
    return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase())
  }, z.boolean())
const int = (fallback: number) =>
  z.preprocess((value) => {
    const v = emptyToUndefined(value)
    return v === undefined ? fallback : Number(v)
  }, z.number().int())

export const envSchema = z.object({
  NODE_ENV: z.preprocess(emptyToUndefined, z.enum(['development', 'test', 'production']).default('development')),
  /** Public base URL of the app. OAuth redirect URIs are derived from it. */
  APP_URL: z.preprocess(emptyToUndefined, z.string().url().default('http://localhost:3000')),

  /** postgres://… — when unset, an embedded PGlite database under PGLITE_DATA_DIR is used (demo/dev only). */
  DATABASE_URL: optionalString,
  PGLITE_DATA_DIR: z.preprocess(emptyToUndefined, z.string().default('.data/pglite')),
  AUTO_MIGRATE: bool(true),

  /** 32 random bytes, base64. Encrypts OAuth tokens at rest. Required in production. */
  TOKEN_ENCRYPTION_KEY: optionalString,
  /** The previous key during a rotation, so existing tokens stay readable. */
  TOKEN_ENCRYPTION_KEY_PREVIOUS: optionalString,

  LOG_LEVEL: z.preprocess(emptyToUndefined, z.enum(['debug', 'info', 'warn', 'error']).optional()),
  LOG_FORMAT: z.preprocess(emptyToUndefined, z.enum(['json', 'pretty']).optional()),

  /** Run the scheduler/worker inside the web server process (simplest deployment). */
  RUN_WORKER_IN_WEB: bool(true),
  WORKER_POLL_INTERVAL_MS: int(15_000),

  // YouTube (Google Cloud project)
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  /** Optional API key: lets public discovery run before the channel is connected. */
  YOUTUBE_API_KEY: optionalString,
  /** Send PKCE (S256) to Google. Advertised by Google's discovery document; set false if your client rejects it. */
  GOOGLE_OAUTH_PKCE: bool(true),
  /** General quota bucket (units/day) shared by videos.list, channels.list, playlistItems.list, ... */
  YOUTUBE_DAILY_QUOTA: int(10_000),
  /** search.list has its own bucket since 2026-06-01: calls per day. */
  YOUTUBE_SEARCH_DAILY_LIMIT: int(100),
  /** videos.batchGetStats has its own bucket since 2026-06-03: units per day. */
  YOUTUBE_BATCH_STATS_DAILY_LIMIT: int(10_000),
  /** Share of each bucket held back so manual refreshes still work late in the day (0–0.5). */
  YOUTUBE_QUOTA_RESERVE_FRACTION: z.preprocess((v) => (emptyToUndefined(v) === undefined ? 0.1 : Number(v)), z.number().min(0).max(0.5)),
  /**
   * Set to true only after your Google Cloud project has been approved for the
   * "Analytics & Reporting" use case (YouTube API Developer Policies III.L).
   * Until then YouTube data is not used for trend scores, AI categorisation or
   * personalisation, and other creators' YouTube statistics are kept ≤ 30 days.
   */
  YOUTUBE_DERIVED_METRICS_APPROVED: bool(false),

  // Instagram (Meta app)
  INSTAGRAM_AUTH_MODE: z.preprocess(
    emptyToUndefined,
    z.enum(['instagram_login', 'facebook_login']).default('instagram_login'),
  ),
  /** "Instagram app ID/secret" from the Instagram API setup with Instagram login. */
  INSTAGRAM_APP_ID: optionalString,
  INSTAGRAM_APP_SECRET: optionalString,
  /** Facebook app ID/secret, used only when INSTAGRAM_AUTH_MODE=facebook_login. */
  FACEBOOK_APP_ID: optionalString,
  FACEBOOK_APP_SECRET: optionalString,
  /** Facebook Login for Business configuration ID. When set it is sent instead of `scope`. */
  FACEBOOK_LOGIN_CONFIG_ID: optionalString,
  /** Graph API version. v26.0 was current on 2026-09-29. */
  META_GRAPH_API_VERSION: z.preprocess(emptyToUndefined, z.string().regex(/^v\d+\.\d+$/).default('v26.0')),

  // TikTok
  TIKTOK_CLIENT_KEY: optionalString,
  TIKTOK_CLIENT_SECRET: optionalString,

  // AI
  AI_PROVIDER: z.preprocess(emptyToUndefined, z.enum(['local', 'anthropic', 'openai']).optional()),
  AI_MODEL: optionalString,
  ANTHROPIC_API_KEY: optionalString,
  OPENAI_API_KEY: optionalString,
  /** An OpenAI-compatible server instead of api.openai.com, e.g. http://localhost:11434/v1 (Ollama). */
  OPENAI_BASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  EMBEDDING_PROVIDER: z.preprocess(emptyToUndefined, z.enum(['local', 'openai', 'voyage']).optional()),
  EMBEDDING_MODEL: optionalString,
  VOYAGE_API_KEY: optionalString,
  /** JSON overriding clustering thresholds for a remote embedding model, e.g. {"join":0.58}. See `npm run calibrate:embeddings`. */
  EMBEDDING_THRESHOLDS: optionalString,

  /** Shown on the public /privacy and /terms pages: who runs this installation, and how to reach them about privacy. */
  OPERATOR_NAME: optionalString,
  PRIVACY_CONTACT: optionalString,

  /** Optional user-driven capture of posts the creator saw while browsing. Off by default. */
  ASSISTED_DISCOVERY_ENABLED: bool(false),

  /** Demo only: inject connector faults, e.g. "tiktok:rate_limited,instagram:auth_expired". */
  MOCK_FAULTS: optionalString,
})

export type Env = z.infer<typeof envSchema>

let cached: Env | null = null

export function getEnv(): Env {
  if (cached) return cached
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    // Name the offending variables, never their values.
    const problems = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid environment configuration — ${problems}`)
  }
  cached = parsed.data
  return cached
}

/** For tests: parse an explicit environment without touching the cache. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse(source)
}

export function resetEnvCache(): void {
  cached = null
}

export function isProduction(env: Env = getEnv()): boolean {
  return env.NODE_ENV === 'production'
}

/** Absolute URL for a path on this app (e.g. an OAuth redirect URI). */
export function appUrl(path: string, env: Env = getEnv()): string {
  return new URL(path, env.APP_URL.endsWith('/') ? env.APP_URL : `${env.APP_URL}/`).toString()
}
