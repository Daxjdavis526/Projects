/**
 * Claude, through the official Anthropic SDK.
 *
 * - Structured outputs (`output_config.format`) constrain every response to a
 *   JSON schema, and prompts.ts validates it again before anything is stored.
 * - Effort is set per task: low for classification and naming, medium for
 *   writing a brief. Opus 5.5 always thinks; effort is how depth is chosen.
 * - Claude 5-family models get server-side refusal fallbacks
 *   (`fallbacks: "default"`): if a safety classifier declines a request, the
 *   API re-runs it on the model Anthropic recommends for that category, inside
 *   the same call. A refusal that survives the fallback is reported, never
 *   parsed.
 * - The SDK retries 408/409/429/5xx and connection errors with exponential
 *   backoff; what still fails becomes an AIProviderError with a kind.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { BetaMessage } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import { redactString } from '../../observability/redact'
import { targetSeconds } from '../local/writer'
import {
  AIProviderError,
  type AIProvider,
  type AnalysisResult,
  type ClusterDescription,
  type ClusterDescriptionInput,
  type ContentAnalysisInput,
  type RecommendationDraft,
  type TrendBrief,
} from '../types'
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

export const DEFAULT_ANTHROPIC_MODEL = 'claude-opus-5-5'
const FALLBACK_BETA = 'server-side-fallback-2026-07-01'
/** Models that accept `fallbacks: "default"`. Others are called without it. */
export const FALLBACK_MODELS: ReadonlySet<string> = new Set(['claude-opus-5-5', 'claude-fable-5-1', 'claude-opus-5', 'claude-sonnet-5-5'])
/** Models that accept `output_config.effort`. Others use their default depth. */
const EFFORT_MODELS = /^claude-(opus-5|sonnet-5|fable-5|mythos-5|opus-4-[5-8]|sonnet-4-6)/

type Effort = 'low' | 'medium' | 'high'

/** The slice of the SDK client this provider uses, so tests can pass a fake. */
export interface AnthropicMessagesClient {
  beta: { messages: { create(params: Anthropic.Beta.Messages.MessageCreateParamsNonStreaming): Promise<BetaMessage> } }
}

export interface AnthropicProviderOptions {
  apiKey: string
  model?: string | null
  /** The niche phrase used in the classification prompt. */
  niche: string
  client?: AnthropicMessagesClient
}

interface CompletionRequest {
  system: string
  user: string
  schema: Record<string, unknown>
  effort: Effort
  maxTokens: number
  /** Mark the system prompt cacheable (it repeats across a run's batches). */
  cacheSystem?: boolean
}

export class AnthropicAIProvider implements AIProvider {
  readonly name = 'anthropic'
  readonly remote = true
  readonly model: string
  private readonly niche: string
  private readonly client: AnthropicMessagesClient

  constructor(options: AnthropicProviderOptions) {
    this.model = options.model?.trim() || DEFAULT_ANTHROPIC_MODEL
    this.niche = options.niche
    this.client = options.client ?? new Anthropic({ apiKey: options.apiKey, maxRetries: 3, timeout: 5 * 60_000 })
  }

  async analyzeContent(items: ContentAnalysisInput[]): Promise<AnalysisResult[]> {
    if (!items.length) return []
    const aliases = aliasIds(items)
    const raw = await this.complete({
      system: analysisSystemPrompt(this.niche, items[0]!.knownTopics),
      user: analysisUserPrompt(items, aliases),
      schema: ANALYSIS_JSON_SCHEMA,
      effort: 'low',
      maxTokens: 16_000,
      cacheSystem: true,
    })
    const { analyses, errors } = parseAnalysisResponse(raw, aliases)
    return items.map((item) => {
      const analysis = analyses.get(item.id) ?? null
      return { id: item.id, analysis, error: analysis ? null : (errors.get(item.id) ?? 'Missing from the response') }
    })
  }

  async describeCluster(input: ClusterDescriptionInput): Promise<ClusterDescription> {
    const raw = await this.complete({ system: DESCRIBE_SYSTEM_PROMPT, user: describeUserPrompt(input), schema: DESCRIBE_JSON_SCHEMA, effort: 'low', maxTokens: 4_000 })
    return validated(() => parseDescribeResponse(raw))
  }

  async draftRecommendation(brief: TrendBrief): Promise<RecommendationDraft> {
    const raw = await this.complete({
      system: DRAFT_SYSTEM_PROMPT,
      user: draftUserPrompt(brief, targetSeconds(brief.targetLength)),
      schema: DRAFT_JSON_SCHEMA,
      effort: 'medium',
      maxTokens: 16_000,
    })
    return validated(() => parseDraftResponse(raw, brief))
  }

  private async complete(request: CompletionRequest): Promise<unknown> {
    const fallbacks = FALLBACK_MODELS.has(this.model)
    let message: BetaMessage
    try {
      message = await this.client.beta.messages.create({
        model: this.model,
        max_tokens: request.maxTokens,
        system: [{ type: 'text', text: request.system, ...(request.cacheSystem ? { cache_control: { type: 'ephemeral' as const } } : {}) }],
        messages: [{ role: 'user', content: request.user }],
        output_config: {
          format: { type: 'json_schema', schema: request.schema },
          ...(EFFORT_MODELS.test(this.model) ? { effort: request.effort } : {}),
        },
        ...(fallbacks ? { fallbacks: 'default' as const, betas: [FALLBACK_BETA] } : {}),
      })
    } catch (err) {
      throw toProviderError(err)
    }
    return readJson(message)
  }
}

/** The JSON answer, or a precise reason there is none. */
export function readJson(message: BetaMessage): unknown {
  // Check why generation stopped before reading content: a refusal or a cut-off answer is not data.
  if (message.stop_reason === 'refusal') throw new AIProviderError('anthropic', 'Claude declined this request (refusal), including any fallback model', 'refusal')
  if (message.stop_reason === 'max_tokens' || message.stop_reason === 'model_context_window_exceeded') {
    throw new AIProviderError('anthropic', 'The answer was cut off before it finished (max_tokens)', 'truncated')
  }
  // After a server-side fallback, the substitute model's output follows the last `fallback` block.
  let start = 0
  message.content.forEach((block, i) => {
    if (block.type === 'fallback') start = i + 1
  })
  const text = message.content
    .slice(start)
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim()
  if (!text) throw new AIProviderError('anthropic', 'The response contained no text', 'bad_response')
  try {
    return JSON.parse(text)
  } catch {
    throw new AIProviderError('anthropic', 'The response was not valid JSON', 'bad_response')
  }
}

function validated<T>(parse: () => T): T {
  try {
    return parse()
  } catch (err) {
    const detail = err instanceof Error ? err.message.split('\n')[0]!.slice(0, 160) : String(err)
    throw new AIProviderError('anthropic', `The response failed validation: ${detail}`, 'bad_response')
  }
}

/** Typed SDK errors → the shared taxonomy. Messages are scrubbed; keys are never included. */
export function toProviderError(err: unknown): AIProviderError {
  if (err instanceof AIProviderError) return err
  const detail = (e: { message: string }) => redactString(e.message.slice(0, 200))
  if (err instanceof Anthropic.AuthenticationError) return new AIProviderError('anthropic', 'Anthropic rejected the API key (401). Check ANTHROPIC_API_KEY.', 'auth')
  if (err instanceof Anthropic.PermissionDeniedError) return new AIProviderError('anthropic', `This API key may not use this model (403): ${detail(err)}`, 'auth')
  if (err instanceof Anthropic.RateLimitError) return new AIProviderError('anthropic', 'Anthropic rate limit reached (429) after retries', 'rate_limit')
  if (err instanceof Anthropic.NotFoundError) return new AIProviderError('anthropic', `Model not found (404): ${detail(err)}`, 'invalid_request')
  if (err instanceof Anthropic.BadRequestError || err instanceof Anthropic.UnprocessableEntityError) {
    return new AIProviderError('anthropic', `Anthropic rejected the request (${err.status}): ${detail(err)}`, 'invalid_request')
  }
  if (err instanceof Anthropic.APIConnectionTimeoutError) return new AIProviderError('anthropic', 'Anthropic did not answer in time', 'unavailable')
  if (err instanceof Anthropic.APIConnectionError) return new AIProviderError('anthropic', 'Could not reach the Anthropic API', 'unavailable')
  if (err instanceof Anthropic.InternalServerError) return new AIProviderError('anthropic', `Anthropic API error (${err.status}) after retries`, 'unavailable')
  if (err instanceof Anthropic.APIError) return new AIProviderError('anthropic', `Anthropic API error (${err.status ?? 'unknown'}): ${detail(err)}`, 'unavailable')
  return new AIProviderError('anthropic', redactString(err instanceof Error ? err.message : String(err)).slice(0, 200), 'bad_response')
}
