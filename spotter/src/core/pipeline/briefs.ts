/**
 * Pieces shared by the recommendation stage and on-demand briefs: what the
 * creator is good at, why a trend fits them, and drafting with a fallback.
 */
import type { LiftRecord } from '../analytics/personalization'
import type { AIProvider, RecommendationDraft, TrendBrief } from '../ai/types'
import { FIT_COMPONENT_KEYS, type FitComponents } from '../domain/types'

/** The fit components that argue *for* this trend, strongest first, as sentences. */
export function fitReasons(components: FitComponents): string[] {
  return FIT_COMPONENT_KEYS.map((key) => components[key])
    .filter((c) => c.score !== null && c.score >= 60 && c.weight > 0)
    .sort((a, b) => b.score! * b.weight - a.score! * a.weight)
    .slice(0, 3)
    .map((c) => c.explanation)
}

/** Formats, hook types and length that measurably work for the creator (3+ posts, >5% above normal). */
export function creatorStrengths(lifts: LiftRecord[]): { bestFormats: string[]; bestHookTypes: string[]; bestLength: string | null } {
  const by = (dimension: string) =>
    lifts.filter((l) => l.dimension === dimension && l.postCount >= 3 && l.lift > 1.05).sort((a, b) => b.shrunkLogLift - a.shrunkLogLift)
  const bestLength = lifts.filter((l) => l.dimension === 'length' && l.postCount >= 3).sort((a, b) => b.shrunkLogLift - a.shrunkLogLift)[0]?.value ?? null
  return { bestFormats: by('format').map((l) => l.value), bestHookTypes: by('hook_type').map((l) => l.value), bestLength }
}

/** Draft with the configured provider; on failure, the local templates — and say so. */
export async function draftWithFallback(
  ai: AIProvider,
  fallback: AIProvider,
  brief: TrendBrief,
): Promise<{ draft: RecommendationDraft; generatedBy: string; note: string | null; failed: boolean }> {
  try {
    const draft = await ai.draftRecommendation(brief)
    return { draft, generatedBy: `${ai.name}:${ai.model}`, note: ai.remote ? null : 'Written from SPOTTER’s built-in templates (no LLM configured).', failed: false }
  } catch (err) {
    const draft = await fallback.draftRecommendation(brief)
    return {
      draft,
      generatedBy: `${fallback.name}:${fallback.model}`,
      note: `The ${ai.name} provider failed (${err instanceof Error ? err.message : String(err)}); written from built-in templates instead.`,
      failed: true,
    }
  }
}
