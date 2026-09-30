/**
 * Offline, concept-aware embedding.
 *
 * Signed feature hashing over three kinds of features:
 *   - topic concepts from the fitness lexicon (dominant: this is what makes
 *     "Stop doing half reps" and "How deep should you squat?" land together
 *     although they share no words)
 *   - exercises and format (supporting)
 *   - content words and word pairs (so topics outside the lexicon still group
 *     by vocabulary)
 * The vector is L2-normalised; cosine similarity compares two posts.
 */
import { hashString } from '../../demo/random'
import type { EmbeddingProvider, EmbeddingThresholds } from '../types'
import { buildTextView, scoreTopics } from './classifier'
import { EXERCISES, FORMATS, compileTerm, scoreTerms } from './lexicon'
import { stem } from './text'

export const LOCAL_EMBEDDING_DIMS = 256
const compiledFormats = FORMATS.map((f) => ({ label: f.label, terms: f.terms.map(compileTerm) }))

function addFeature(vec: Float64Array, feature: string, weight: number): void {
  const h = hashString(feature)
  const index = h % vec.length
  const sign = (hashString(feature, 0x9e3779b1) & 1) === 0 ? 1 : -1
  vec[index]! += sign * weight
}

export function embedLocally(text: string, dims = LOCAL_EMBEDDING_DIMS): number[] {
  const view = buildTextView({ title: null, caption: text, hashtags: [], transcript: null, comments: [] })
  const vec = new Float64Array(dims)

  for (const topic of scoreTopics(view.full)) {
    if (topic.generic) continue
    addFeature(vec, `topic:${topic.key}`, 2.2 * Math.sqrt(topic.score))
  }
  for (const e of EXERCISES) if (e.re.test(view.full)) addFeature(vec, `exercise:${e.name}`, 1.1)
  for (const f of compiledFormats) {
    const { score } = scoreTerms(view.full, f.terms)
    if (score > 0) addFeature(vec, `format:${f.label}`, 0.45 * Math.min(2, Math.sqrt(score)))
  }
  const stems = view.tokens.map(stem)
  const tf = new Map<string, number>()
  for (const s of stems) tf.set(s, (tf.get(s) ?? 0) + 1)
  for (const [s, n] of tf) addFeature(vec, `tok:${s}`, 0.5 * Math.min(2, 1 + Math.log(n)))
  for (let i = 1; i < stems.length; i++) addFeature(vec, `bi:${stems[i - 1]}_${stems[i]}`, 0.3)

  let norm = 0
  for (const v of vec) norm += v * v
  norm = Math.sqrt(norm)
  return Array.from(vec, (v) => (norm === 0 ? 0 : Math.round((v / norm) * 1e6) / 1e6))
}

export const LOCAL_EMBEDDING_THRESHOLDS: EmbeddingThresholds = {
  join: 0.56,
  create: 0.6,
  merge: 0.86,
  fitLow: 0.08,
  fitHigh: 0.62,
}

export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'local'
  readonly model = 'lexicon-hash-256-v1'
  readonly dims = LOCAL_EMBEDDING_DIMS
  readonly remote = false
  readonly thresholds = LOCAL_EMBEDDING_THRESHOLDS

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => embedLocally(t, this.dims))
  }
}
