/**
 * The providers a run uses, chosen once per run so every stage agrees.
 *
 * Every post always gets a local embedding (free, offline); a configured
 * remote embedding model adds its own vectors beside it. Clustering, topic
 * fit and "your earlier post" matching all use one vector space per run:
 * the remote model once it covers the posts being clustered, and the local
 * vectors until then. So a new or failing embedding provider never empties
 * the dashboard; switching models finishes in the background, and trends
 * restart once on the new model.
 */
import { and, count, eq, gte, inArray } from 'drizzle-orm'
import { LocalEmbeddingProvider } from '../ai/local/embedder'
import { selectProviders, type ProviderSelection } from '../ai/registry'
import type { EmbeddingProvider } from '../ai/types'
import { aiAnalysis, contentEmbeddings, contentItems, trendClusters } from '../db/schema'
import type { RunContext } from './context'

const DAY = 86_400_000
/** Share of recent analysed posts the configured model must cover before clustering switches to it… */
export const EMBEDDING_SWITCH_COVERAGE = 0.9
/** …and the share below which clustering, once switched, falls back to local vectors (hysteresis: no flapping). */
export const EMBEDDING_KEEP_COVERAGE = 0.6

const selections = new WeakMap<RunContext, ProviderSelection>()
const clustering = new WeakMap<RunContext, Promise<ClusteringChoice>>()

export function runProviders(rc: RunContext): ProviderSelection {
  let selection = selections.get(rc)
  if (!selection) {
    selection = selectProviders(rc.settings, rc.env)
    selections.set(rc, selection)
  }
  return selection
}

export interface ClusteringChoice {
  embedder: EmbeddingProvider
  /** Set while a newly configured embedding model is still catching up. */
  note: string | null
  /** Share of recent posts the configured model covers (1 for the local model). */
  coverage: number
}

export function clusteringEmbedder(rc: RunContext): Promise<ClusteringChoice> {
  let choice = clustering.get(rc)
  if (!choice) {
    choice = chooseClusteringEmbedder(rc)
    clustering.set(rc, choice)
  }
  return choice
}

async function chooseClusteringEmbedder(rc: RunContext): Promise<ClusteringChoice> {
  const configured = runProviders(rc).embedder
  if (!configured.remote) return { embedder: configured, note: null, coverage: 1 }
  const since = new Date(rc.now.getTime() - (rc.settings.trend.lookbackDays + 7) * DAY)
  const recent = and(inArray(contentItems.dataOrigin, rc.origins), eq(contentItems.availability, 'available'), gte(contentItems.publishedAt, since))
  const [all] = await rc.db
    .select({ n: count() })
    .from(contentItems)
    .innerJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded')))
    .where(recent)
  const [covered] = await rc.db
    .select({ n: count() })
    .from(contentItems)
    .innerJoin(aiAnalysis, and(eq(aiAnalysis.contentItemId, contentItems.id), eq(aiAnalysis.status, 'succeeded')))
    .innerJoin(contentEmbeddings, and(eq(contentEmbeddings.contentItemId, contentItems.id), eq(contentEmbeddings.model, configured.model)))
    .where(recent)
  const total = Number(all?.n ?? 0)
  const coverage = total === 0 ? 1 : Number(covered?.n ?? 0) / total
  const [inUse] = await rc.db
    .select({ id: trendClusters.id })
    .from(trendClusters)
    .where(
      and(
        eq(trendClusters.creatorProfileId, rc.profile.id),
        eq(trendClusters.dataMode, rc.dataMode),
        eq(trendClusters.status, 'active'),
        eq(trendClusters.embeddingModel, configured.model),
      ),
    )
    .limit(1)
  if (coverage >= (inUse ? EMBEDDING_KEEP_COVERAGE : EMBEDDING_SWITCH_COVERAGE)) return { embedder: configured, note: null, coverage }
  const pct = Math.round(coverage * 100)
  return {
    embedder: new LocalEmbeddingProvider(),
    note: inUse
      ? `${configured.name} embeddings cover only ${pct}% of recent posts, so trends are grouped with local embeddings until the provider catches up.`
      : `${configured.name} embeddings cover ${pct}% of recent posts; trends keep using local embeddings until ${Math.round(EMBEDDING_SWITCH_COVERAGE * 100)}%.`,
    coverage,
  }
}
