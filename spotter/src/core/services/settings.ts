/**
 * Saving settings, and applying new weights to the trends already on screen.
 */
import { and, desc, eq, inArray } from 'drizzle-orm'
import { reweight } from '../analytics/scoring'
import { opportunityScore } from '../analytics/relevance'
import { mergeSettings, normaliseWeights, parseSettings, type AppSettings } from '../config/settings'
import type { Database } from '../db/client'
import { creatorProfiles, trendClusters, trendScores } from '../db/schema'
import { FIT_COMPONENT_KEYS, type FitComponents } from '../domain/types'

type Patch = Parameters<typeof mergeSettings>[1]

export async function saveSettings(db: Database, profileId: string, patch: Patch): Promise<AppSettings> {
  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.id, profileId)).limit(1)
  if (!profile) throw new Error('Profile not found')
  const next = mergeSettings(parseSettings(profile.settings), patch)
  await db.update(creatorProfiles).set({ settings: next, updatedAt: new Date() }).where(eq(creatorProfiles.id, profileId))
  return next
}

/** Fit score from stored components under new weights (weighted mean of the available ones). */
export function refit(components: FitComponents, weights: AppSettings['fit']['weights']): number | null {
  let total = 0
  let weight = 0
  for (const key of FIT_COMPONENT_KEYS) {
    const c = components[key]
    if (!c || c.score === null || weights[key] <= 0) continue
    total += c.score * weights[key]
    weight += weights[key]
  }
  return weight ? Math.round((total / weight) * 10) / 10 : null
}

/**
 * Re-score active trends from their latest stored components with the
 * current weights, so a weight change shows up immediately instead of at the
 * next collection run. Inputs are unchanged; only the combination is.
 */
export async function applyWeightsToActiveTrends(db: Database, profileId: string, dataMode: 'demo' | 'live', settings: AppSettings): Promise<number> {
  const clusters = await db
    .select()
    .from(trendClusters)
    .where(and(eq(trendClusters.creatorProfileId, profileId), eq(trendClusters.dataMode, dataMode), eq(trendClusters.status, 'active')))
  if (!clusters.length) return 0
  const latest = await db
    .selectDistinctOn([trendScores.clusterId], { id: trendScores.id, clusterId: trendScores.clusterId, components: trendScores.components })
    .from(trendScores)
    .where(inArray(trendScores.clusterId, clusters.map((c) => c.id)))
    .orderBy(trendScores.clusterId, desc(trendScores.computedAt))
  const weights = normaliseWeights(settings.trend.weights)
  let updated = 0
  for (const cluster of clusters) {
    const row = latest.find((l) => l.clusterId === cluster.id)
    if (!row) continue
    const trendScore = reweight(row.components, weights)
    const fitScore = cluster.latestFitComponents ? refit(cluster.latestFitComponents, settings.fit.weights) : cluster.latestFitScore
    const opportunity = fitScore === null ? null : opportunityScore(trendScore, fitScore, settings.fit.trendWeight)
    await db.update(trendScores).set({ trendScore, weights }).where(eq(trendScores.id, row.id))
    await db
      .update(trendClusters)
      .set({ latestTrendScore: trendScore, latestFitScore: fitScore, latestOpportunityScore: opportunity, updatedAt: new Date() })
      .where(eq(trendClusters.id, cluster.id))
    updated++
  }
  return updated
}
