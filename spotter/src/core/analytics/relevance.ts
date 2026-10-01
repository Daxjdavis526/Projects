/**
 * Creator Fit: how well a trend matches *this* creator, 0–100.
 *
 * A trend can be globally hot and still wrong for the creator. Fit combines:
 *
 *   topic     semantic closeness of the trend to the nearest topic the
 *             creator has covered, adjusted by how that topic performs
 *             for them
 *   niche     overlap with the configured niche keywords and subtopics
 *   format    the creator's measured lift for the trend's dominant format
 *   style     the creator's measured lift for the trend's dominant style
 *   platform  how strong the creator is where the trend is happening
 *   length    the creator's lift at the trend's typical video length
 *
 * Components without data are reported as unavailable and excluded; with no
 * own-content history at all, fit falls back to niche overlap alone.
 */
import type { FitWeights } from '../config/settings'
import type { FitComponents, Platform, ScoreComponent } from '../domain/types'
import { FIT_COMPONENT_KEYS } from '../domain/types'
import { cosine, type Vector } from './clustering'
import type { LiftRecord, PersonalizationDimension } from './personalization'
import { lengthBucket } from './personalization'
import { clamp, round } from './stats'

/** The centre of the creator's own posts on one topic, and how that topic performs for them. */
export interface TopicCentroid {
  topic: string
  centroid: number[]
  postCount: number
  /** Mean ln(views ÷ expected) over these posts, shrunk toward 0 (see personalization.ts). */
  shrunkLogLift: number
}

export interface CreatorModel {
  /** Mean embedding of own posts weighted by exp(lift): "what works for me". */
  performanceCentroid: number[] | null
  /** Plain mean embedding of own posts: "what I usually make". */
  centroid: number[] | null
  /**
   * One centre per topic the creator has covered. A creator who posts about six
   * things has six centres; their average would sit between all of them and
   * resemble none, so topic fit compares a trend with the nearest one.
   */
  topics: TopicCentroid[]
  lifts: LiftRecord[]
  ownPostCount: number
}

export interface ClusterProfile {
  centroid: Vector
  topicKey: string | null
  topicLabel: string | null
  dominantFormat: string | null
  dominantStyle: string | null
  medianDurationSeconds: number | null
  platforms: Platform[]
  keywords: string[]
  hashtags: string[]
  /** Mean AI-assessed niche relevance of members, 0–1 (null if unknown). */
  nicheRelevance: number | null
}

export interface FitContext {
  weights: FitWeights
  platformWeights: Record<Platform, number>
  nicheKeywords: string[]
  subtopics: string[]
  excludeKeywords: string[]
  /** Embedding-model calibration: similarity at which topic fit is 0 and 100. */
  similarityRange: { low: number; high: number }
}

function liftFor(model: CreatorModel, dimension: PersonalizationDimension, value: string | null): LiftRecord | null {
  if (!value) return null
  const normalized = value.toLowerCase()
  return model.lifts.find((l) => l.dimension === dimension && l.value.toLowerCase() === normalized) ?? null
}

/** Map a log-lift onto 0–100 with 50 = "your normal". */
function liftScore(logLift: number): number {
  return 50 + 50 * Math.tanh(1.2 * logLift)
}

function c(score: number | null, weight: number, inputs: ScoreComponent['inputs'], explanation: string): ScoreComponent {
  return { score: score === null ? null : round(clamp(score), 1), weight, inputs, explanation }
}

function keywordOverlap(profile: ClusterProfile, ctx: FitContext): { share: number; matched: string[]; excluded: string[] } {
  const haystack = [...profile.keywords, ...profile.hashtags, profile.topicLabel ?? ''].join(' ').toLowerCase()
  const terms = [...new Set([...ctx.nicheKeywords, ...ctx.subtopics].map((t) => t.toLowerCase().trim()).filter(Boolean))]
  const matched = terms.filter((t) => haystack.includes(t) || haystack.includes(t.replace(/\s+/g, '')))
  const excluded = ctx.excludeKeywords.map((t) => t.toLowerCase().trim()).filter((t) => t && haystack.includes(t))
  // Matching 4 distinct niche terms is a strong signal; more adds little.
  return { share: Math.min(1, matched.length / 4), matched, excluded }
}

export function creatorFit(profile: ClusterProfile, model: CreatorModel, ctx: FitContext): { score: number; components: FitComponents } {
  const w = ctx.weights

  // Topic ----------------------------------------------------------------------
  // Similarity to the nearest of the creator's own topics, nudged up or down by
  // how that topic performs for them — in proportion to how close the match is.
  const { low, high } = ctx.similarityRange
  const toScore = (sim: number) => clamp((100 * (sim - low)) / Math.max(0.01, high - low))
  const nearest = model.topics
    .map((t) => ({ t, sim: cosine(profile.centroid, t.centroid) }))
    .sort((a, b) => b.sim - a.sim)[0]
  const reference = model.performanceCentroid ?? model.centroid
  let topic: ScoreComponent
  if (nearest) {
    const simScore = toScore(nearest.sim)
    const lift = Math.exp(nearest.t.shrunkLogLift)
    // The closer the match, the more that topic's own track record decides the score.
    const trust = 0.6 * (simScore / 100)
    const score = (1 - trust) * simScore + trust * liftScore(nearest.t.shrunkLogLift)
    const close = simScore >= 50
    topic = c(
      score,
      w.topic,
      { nearestOwnTopic: nearest.t.topic, similarity: round(nearest.sim, 3), yourPostsOnIt: nearest.t.postCount, yourLiftOnIt: round(lift, 2) },
      close
        ? `Closest to your own posts on ${nearest.t.topic.toLowerCase()} (similarity ${round(nearest.sim, 2)}); your ${nearest.t.postCount} post${nearest.t.postCount === 1 ? '' : 's'} there ran at ${round(lift, 1)}× your normal.`
        : `New ground: the nearest thing you have posted is ${nearest.t.topic.toLowerCase()} (similarity ${round(nearest.sim, 2)}).`,
    )
  } else if (reference) {
    const sim = cosine(profile.centroid, reference)
    topic = c(toScore(sim), w.topic, { similarityToYourBestContent: round(sim, 3) }, `Semantic similarity to your best-performing content: ${round(sim, 2)}.`)
  } else {
    topic = c(null, w.topic, {}, 'Unavailable: no analysed own content yet to compare against.')
  }

  // Niche ----------------------------------------------------------------------
  const overlap = keywordOverlap(profile, ctx)
  const kwScore = 100 * overlap.share
  const nicheScore =
    (profile.nicheRelevance === null ? kwScore : 0.5 * kwScore + 50 * profile.nicheRelevance) - (overlap.excluded.length ? 40 : 0)
  const niche = c(
    nicheScore,
    w.niche,
    {
      matchedNicheTerms: overlap.matched.slice(0, 6).join(', ') || null,
      aiNicheRelevance: profile.nicheRelevance === null ? null : round(profile.nicheRelevance, 2),
      excludedTermsFound: overlap.excluded.join(', ') || null,
    },
    overlap.matched.length
      ? `Matches your niche terms: ${overlap.matched.slice(0, 4).join(', ')}.` + (overlap.excluded.length ? ` Contains excluded terms: ${overlap.excluded.join(', ')}.` : '')
      : 'Few of your niche keywords appear in this trend.',
  )

  // Format / style / length ------------------------------------------------------
  const liftComponent = (
    key: 'format' | 'style' | 'length',
    dimension: PersonalizationDimension,
    value: string | null,
    label: string,
  ): ScoreComponent => {
    const lift = liftFor(model, dimension, value)
    if (!value) return c(null, w[key], {}, `Unavailable: the trend has no dominant ${label}.`)
    if (!lift) return c(null, w[key], { trendValue: value }, `No history of yours with ${label} “${value}”, so it neither helps nor hurts.`)
    return c(
      liftScore(lift.shrunkLogLift),
      w[key],
      { trendValue: value, yourLift: round(lift.lift, 2), yourPosts: lift.postCount },
      `Your ${lift.postCount} posts with ${label} “${value}” ran at ${round(lift.lift, 1)}× your normal.`,
    )
  }
  const format = liftComponent('format', 'format', profile.dominantFormat, 'format')
  const style = liftComponent('style', 'style', profile.dominantStyle, 'style')
  const length = liftComponent('length', 'length', lengthBucket(profile.medianDurationSeconds), 'length')

  // Platform ---------------------------------------------------------------------
  let platform: ScoreComponent
  if (model.ownPostCount === 0 || profile.platforms.length === 0) {
    platform = c(null, w.platform, {}, 'Unavailable: no own posts to compare platforms.')
  } else {
    let total = 0
    let weight = 0
    const parts: string[] = []
    for (const p of profile.platforms) {
      const pw = ctx.platformWeights[p] ?? 1
      const lift = liftFor(model, 'platform', p)
      const s = lift ? liftScore(lift.shrunkLogLift) : 45
      total += s * pw
      weight += pw
      parts.push(lift ? `${p} ${round(lift.lift, 1)}×` : `${p}: no history`)
    }
    platform = c(weight ? total / weight : null, w.platform, { platforms: profile.platforms.join(', ') }, `Your strength where this trend is happening: ${parts.join('; ')}.`)
  }

  const components: FitComponents = { topic, niche, format, style, platform, length }
  let total = 0
  let weight = 0
  for (const key of FIT_COMPONENT_KEYS) {
    const comp = components[key]
    if (comp.score === null || comp.weight <= 0) continue
    total += comp.score * comp.weight
    weight += comp.weight
  }
  return { score: weight ? round(total / weight, 1) : 0, components }
}

export function opportunityScore(trendScore: number, fitScore: number, trendWeight: number): number {
  return round(trendWeight * trendScore + (1 - trendWeight) * fitScore, 1)
}
