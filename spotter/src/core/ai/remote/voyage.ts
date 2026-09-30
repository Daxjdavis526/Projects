/**
 * Voyage AI embeddings (POST https://api.voyageai.com/v1/embeddings).
 *
 * Posts are embedded as documents (`input_type: "document"`) and compared
 * with each other, never with queries, so the same input type is used on
 * both sides of every comparison.
 */
import type { EmbeddingProvider, EmbeddingThresholds } from '../types'
import { defaultRemoteHttpDeps, postJson, type RemoteHttpDeps } from './http'
import { orderedVectors } from './openai'

export const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'
export const DEFAULT_VOYAGE_MODEL = 'voyage-4-lite'
/** voyage-4 models accept 256, 512, 1024 or 2048; 512 keeps storage small with little loss. */
export const VOYAGE_EMBEDDING_DIMS = 512

/**
 * Starting points, not calibrated values: Voyage similarities sit higher
 * than OpenAI's for the same pair of texts. Run `npm run calibrate:embeddings`
 * on your own collected posts and set EMBEDDING_THRESHOLDS if clusters come
 * out too broad or too fragmented.
 */
export const VOYAGE_EMBEDDING_THRESHOLDS: EmbeddingThresholds = {
  join: 0.64,
  create: 0.68,
  merge: 0.88,
  fitLow: 0.4,
  fitHigh: 0.72,
}

export interface VoyageEmbeddingOptions {
  apiKey: string
  model?: string | null
  thresholds?: EmbeddingThresholds
  deps?: RemoteHttpDeps
}

export class VoyageEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'voyage'
  readonly remote = true
  readonly model: string
  readonly dims = VOYAGE_EMBEDDING_DIMS
  readonly thresholds: EmbeddingThresholds
  private readonly apiModel: string
  private readonly apiKey: string
  private readonly deps: RemoteHttpDeps

  constructor(options: VoyageEmbeddingOptions) {
    this.apiModel = options.model?.trim() || DEFAULT_VOYAGE_MODEL
    // The stored model id includes the size, so vectors of different sizes are never compared.
    this.model = `${this.apiModel}@${VOYAGE_EMBEDDING_DIMS}`
    this.apiKey = options.apiKey
    this.thresholds = options.thresholds ?? VOYAGE_EMBEDDING_THRESHOLDS
    this.deps = options.deps ?? defaultRemoteHttpDeps()
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (!texts.length) return []
    const response = (await postJson(
      {
        provider: this.name,
        url: VOYAGE_API_URL,
        headers: { authorization: `Bearer ${this.apiKey}` },
        body: { model: this.apiModel, input: texts, input_type: 'document', output_dimension: VOYAGE_EMBEDDING_DIMS },
        timeoutMs: 60_000,
      },
      this.deps,
    )) as { data?: Array<{ index?: number; embedding?: unknown }> }
    return orderedVectors(this.name, response.data, texts.length)
  }
}
