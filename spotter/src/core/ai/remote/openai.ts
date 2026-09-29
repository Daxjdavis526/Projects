/**
 * OpenAI — or any OpenAI-compatible server (Ollama, LM Studio, vLLM,
 * llama.cpp) when OPENAI_BASE_URL points at it.
 *
 * Chat Completions with structured outputs (`response_format: json_schema`,
 * strict) for the three writing tasks, and the embeddings endpoint for
 * vectors. Called over plain HTTPS (see ./http.ts) so a local server works
 * with the same code and no extra dependency.
 *
 * On the official endpoint, `reasoning_effort` picks depth per task. Local
 * servers get the plain request shape they commonly support.
 */
import { targetSeconds } from '../local/writer'
import {
  AIProviderError,
  type AIProvider,
  type AnalysisResult,
  type ClusterDescription,
  type ClusterDescriptionInput,
  type ContentAnalysisInput,
  type EmbeddingProvider,
  type EmbeddingThresholds,
  type RecommendationDraft,
  type TrendBrief,
} from '../types'
import { defaultRemoteHttpDeps, postJson, type RemoteHttpDeps } from './http'
import {
  aliasIds,
  ANALYSIS_JSON_SCHEMA,
  analysisSystemPrompt,
  analysisUserPrompt,
  DESCRIBE_JSON_SCHEMA,
  DESCRIBE_SYSTEM_PROMPT,
  describeUserPrompt,
  DRAFT_JSON_SCHEMA,
  DRAFT_SYSTEM_PROMPT,
  draftUserPrompt,
  parseAnalysisResponse,
  parseDescribeResponse,
  parseDraftResponse,
} from './prompts'

export const OPENAI_API_BASE = 'https://api.openai.com/v1'
export const DEFAULT_OPENAI_MODEL = 'gpt-6-luna'
export const DEFAULT_OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'
/** text-embedding-3 models can shorten their vectors; 512 keeps storage small with little loss. */
export const OPENAI_EMBEDDING_DIMS = 512

type Effort = 'low' | 'medium' | 'high'

interface ConnectionOptions {
  apiKey?: string | null
  /** e.g. http://localhost:11434/v1 for Ollama. Defaults to OpenAI's API. */
  baseUrl?: string | null
  deps?: RemoteHttpDeps
}

function connection(options: ConnectionOptions): { base: string; official: boolean; headers: Record<string, string>; deps: RemoteHttpDeps } {
  const base = (options.baseUrl?.trim() || OPENAI_API_BASE).replace(/\/+$/, '')
  let official = false
  try {
    official = new URL(base).host === 'api.openai.com'
  } catch {
    throw new AIProviderError('openai', 'OPENAI_BASE_URL is not a valid URL', 'invalid_request')
  }
  return {
    base,
    official,
    headers: options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {},
    deps: options.deps ?? defaultRemoteHttpDeps(),
  }
}

export interface OpenAIProviderOptions extends ConnectionOptions {
  model?: string | null
  niche: string
}

interface ChatCompletion {
  choices?: Array<{ finish_reason?: string | null; message?: { content?: string | null; refusal?: string | null } }>
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai'
  readonly remote = true
  readonly model: string
  private readonly niche: string
  private readonly conn: ReturnType<typeof connection>

  constructor(options: OpenAIProviderOptions) {
    this.model = options.model?.trim() || DEFAULT_OPENAI_MODEL
    this.niche = options.niche
    this.conn = connection(options)
  }

  async analyzeContent(items: ContentAnalysisInput[]): Promise<AnalysisResult[]> {
    if (!items.length) return []
    const aliases = aliasIds(items)
    const raw = await this.complete('content_analysis', analysisSystemPrompt(this.niche, items[0]!.knownTopics), analysisUserPrompt(items, aliases), ANALYSIS_JSON_SCHEMA, 'low')
    const { analyses, errors } = parseAnalysisResponse(raw, aliases)
    return items.map((item) => {
      const analysis = analyses.get(item.id) ?? null
      return { id: item.id, analysis, error: analysis ? null : (errors.get(item.id) ?? 'Missing from the response') }
    })
  }

  async describeCluster(input: ClusterDescriptionInput): Promise<ClusterDescription> {
    const raw = await this.complete('trend_name', DESCRIBE_SYSTEM_PROMPT, describeUserPrompt(input), DESCRIBE_JSON_SCHEMA, 'low')
    return validated(() => parseDescribeResponse(raw))
  }

  async draftRecommendation(brief: TrendBrief): Promise<RecommendationDraft> {
    const raw = await this.complete('video_brief', DRAFT_SYSTEM_PROMPT, draftUserPrompt(brief, targetSeconds(brief.targetLength)), DRAFT_JSON_SCHEMA, 'medium')
    return validated(() => parseDraftResponse(raw, brief))
  }

  private async complete(schemaName: string, system: string, user: string, schema: object, effort: Effort): Promise<unknown> {
    const { base, official, headers, deps } = this.conn
    const body = {
      model: this.model,
      messages: [
        { role: official ? 'developer' : 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_schema', json_schema: { name: schemaName, schema, strict: true } },
      ...(official ? { reasoning_effort: effort, max_completion_tokens: 16_000 } : { max_tokens: 8_000 }),
    }
    const response = (await postJson({ provider: this.name, url: `${base}/chat/completions`, headers, body, timeoutMs: 5 * 60_000 }, deps)) as ChatCompletion
    return readChatJson(response)
  }
}

export function readChatJson(response: ChatCompletion): unknown {
  const choice = response.choices?.[0]
  if (!choice?.message) throw new AIProviderError('openai', 'The response had no message', 'bad_response')
  if (choice.message.refusal) throw new AIProviderError('openai', 'The model declined this request (refusal)', 'refusal')
  if (choice.finish_reason === 'length') throw new AIProviderError('openai', 'The answer was cut off before it finished (length)', 'truncated')
  if (choice.finish_reason === 'content_filter') throw new AIProviderError('openai', 'The answer was withheld by a content filter', 'refusal')
  const text = choice.message.content?.trim()
  if (!text) throw new AIProviderError('openai', 'The response contained no text', 'bad_response')
  try {
    return JSON.parse(text)
  } catch {
    throw new AIProviderError('openai', 'The response was not valid JSON', 'bad_response')
  }
}

function validated<T>(parse: () => T): T {
  try {
    return parse()
  } catch (err) {
    const detail = err instanceof Error ? err.message.split('\n')[0]!.slice(0, 160) : String(err)
    throw new AIProviderError('openai', `The response failed validation: ${detail}`, 'bad_response')
  }
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

/**
 * Starting points, not calibrated values. text-embedding-3 similarities run
 * lower than SPOTTER's local embedder (same-subject captions typically land
 * around 0.5–0.75, different fitness subjects around 0.3–0.5). Run
 * `npm run calibrate:embeddings` on your own collected posts and set
 * EMBEDDING_THRESHOLDS if clusters come out too broad or too fragmented.
 */
export const OPENAI_EMBEDDING_THRESHOLDS: EmbeddingThresholds = {
  join: 0.55,
  create: 0.6,
  merge: 0.85,
  fitLow: 0.25,
  fitHigh: 0.62,
}

export interface OpenAIEmbeddingOptions extends ConnectionOptions {
  model?: string | null
  thresholds?: EmbeddingThresholds
}

interface EmbeddingResponse {
  data?: Array<{ index?: number; embedding?: unknown }>
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai'
  readonly remote = true
  readonly model: string
  readonly dims: number
  readonly thresholds: EmbeddingThresholds
  private readonly apiModel: string
  private readonly conn: ReturnType<typeof connection>
  private readonly shortens: boolean

  constructor(options: OpenAIEmbeddingOptions) {
    this.apiModel = options.model?.trim() || DEFAULT_OPENAI_EMBEDDING_MODEL
    this.conn = connection(options)
    // Only text-embedding-3 models accept `dimensions`; others return their native size.
    this.shortens = /^text-embedding-3-/.test(this.apiModel)
    this.dims = this.shortens ? OPENAI_EMBEDDING_DIMS : 0
    // The stored model id includes the size, so vectors of different sizes are never compared.
    this.model = this.shortens ? `${this.apiModel}@${OPENAI_EMBEDDING_DIMS}` : this.apiModel
    this.thresholds = options.thresholds ?? OPENAI_EMBEDDING_THRESHOLDS
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (!texts.length) return []
    const { base, headers, deps } = this.conn
    const body = {
      model: this.apiModel,
      input: texts,
      encoding_format: 'float',
      ...(this.shortens ? { dimensions: OPENAI_EMBEDDING_DIMS } : {}),
    }
    const response = (await postJson({ provider: this.name, url: `${base}/embeddings`, headers, body, timeoutMs: 60_000 }, deps)) as EmbeddingResponse
    return orderedVectors(this.name, response.data, texts.length)
  }
}

/** Vectors in input order, each finite and non-empty, or an error naming what is wrong. */
export function orderedVectors(provider: string, data: Array<{ index?: number; embedding?: unknown }> | undefined, expected: number): number[][] {
  if (!Array.isArray(data) || data.length !== expected) throw new AIProviderError(provider, `Expected ${expected} embeddings, got ${Array.isArray(data) ? data.length : 'none'}`, 'bad_response')
  const out: number[][] = new Array(expected)
  data.forEach((entry, i) => {
    const index = typeof entry.index === 'number' ? entry.index : i
    const v = entry.embedding
    if (!Array.isArray(v) || !v.length || !v.every((x) => typeof x === 'number' && Number.isFinite(x))) {
      throw new AIProviderError(provider, 'An embedding was missing or not numeric', 'bad_response')
    }
    out[index] = v as number[]
  })
  if (out.some((v) => !v)) throw new AIProviderError(provider, 'Embeddings came back with missing indexes', 'bad_response')
  return out
}
