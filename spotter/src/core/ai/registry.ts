/**
 * Picks the AI and embedding providers from settings, falling back to the
 * local provider (and saying so) when a remote one is chosen but not
 * configured. The rest of the codebase only ever sees the interfaces.
 */
import type { Env } from '../config/env'
import type { AppSettings } from '../config/settings'
import { LocalEmbeddingProvider } from './local/embedder'
import { LocalAIProvider } from './local/provider'
import type { AIProvider, EmbeddingProvider } from './types'

export interface ProviderSelection {
  ai: AIProvider
  embedder: EmbeddingProvider
  /** Human-readable notes when the requested provider could not be used. */
  notes: string[]
}

export type RemoteProviderFactory = {
  ai?: (settings: AppSettings, env: Env) => AIProvider | null
  embedder?: (settings: AppSettings, env: Env) => EmbeddingProvider | null
}

const factories: RemoteProviderFactory[] = []

/** Remote providers register themselves (see ./remote). */
export function registerProviderFactory(factory: RemoteProviderFactory): void {
  factories.push(factory)
}

export function selectProviders(settings: AppSettings, env: Env): ProviderSelection {
  const notes: string[] = []
  const requestedAi = env.AI_PROVIDER && settings.ai.provider === 'local' ? env.AI_PROVIDER : settings.ai.provider
  const requestedEmbed = env.EMBEDDING_PROVIDER && settings.ai.embeddingProvider === 'local' ? env.EMBEDDING_PROVIDER : settings.ai.embeddingProvider

  let ai: AIProvider | null = null
  if (requestedAi !== 'local') {
    for (const f of factories) ai ??= f.ai?.(settings, env) ?? null
    if (!ai) notes.push(`AI provider “${requestedAi}” is not configured (missing API key); using the local provider.`)
  }
  let embedder: EmbeddingProvider | null = null
  if (requestedEmbed !== 'local') {
    for (const f of factories) embedder ??= f.embedder?.(settings, env) ?? null
    if (!embedder) notes.push(`Embedding provider “${requestedEmbed}” is not configured (missing API key); using local embeddings.`)
  }
  return {
    ai: ai ?? new LocalAIProvider(settings.niche.excludeKeywords),
    embedder: embedder ?? new LocalEmbeddingProvider(),
    notes,
  }
}
