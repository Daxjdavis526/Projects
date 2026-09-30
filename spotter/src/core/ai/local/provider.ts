/**
 * The local AI provider: offline, deterministic, free. The default until an
 * LLM provider is configured, and the fallback when one fails.
 */
import type {
  AIProvider,
  AnalysisResult,
  ClusterDescription,
  ClusterDescriptionInput,
  ContentAnalysisInput,
  RecommendationDraft,
  TrendBrief,
} from '../types'
import { classifyLocally } from './classifier'
import { describeLocally, draftLocally } from './writer'
import { TOPICS } from './lexicon'

export class LocalAIProvider implements AIProvider {
  readonly name = 'local'
  readonly model = 'fitness-lexicon-v1'
  readonly remote = false

  constructor(private readonly excludeKeywords: string[] = []) {}

  async analyzeContent(items: ContentAnalysisInput[]): Promise<AnalysisResult[]> {
    return items.map((item) => {
      try {
        return { id: item.id, analysis: classifyLocally(item, this.excludeKeywords), error: null }
      } catch (err) {
        return { id: item.id, analysis: null, error: err instanceof Error ? err.message : String(err) }
      }
    })
  }

  async describeCluster(input: ClusterDescriptionInput): Promise<ClusterDescription> {
    return describeLocally(input)
  }

  async draftRecommendation(brief: TrendBrief): Promise<RecommendationDraft> {
    const topicKey = brief.topicKey ?? TOPICS.find((t) => t.label === brief.trendLabel)?.key ?? null
    return draftLocally(brief, topicKey)
  }
}
