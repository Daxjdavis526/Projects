import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { providerPauses, resetProviderPauses, selectProviders, thresholdOverride } from '@/core/ai/registry'
import { OPENAI_EMBEDDING_THRESHOLDS } from '@/core/ai/remote/openai'
import { AIProviderError } from '@/core/ai/types'
import { parseEnv } from '@/core/config/env'
import { parseSettings } from '@/core/config/settings'

const settings = (ai: Record<string, unknown> = {}) => parseSettings({ ai })

describe('provider selection', () => {
  beforeEach(() => resetProviderPauses())
  afterEach(() => vi.unstubAllGlobals())

  it('uses the local providers by default', () => {
    const { ai, embedder, notes } = selectProviders(settings(), parseEnv({}))
    expect([ai.name, embedder.name]).toEqual(['local', 'local'])
    expect(notes).toEqual([])
  })

  it('falls back to local and names the missing variable', () => {
    const { ai, embedder, notes } = selectProviders(settings({ provider: 'anthropic', embeddingProvider: 'voyage' }), parseEnv({}))
    expect([ai.name, embedder.name]).toEqual(['local', 'local'])
    expect(notes.join(' ')).toContain('ANTHROPIC_API_KEY is not set')
    expect(notes.join(' ')).toContain('VOYAGE_API_KEY is not set')
  })

  it('takes the environment’s choice while settings say local, and its model only for that provider', () => {
    const env = parseEnv({ AI_PROVIDER: 'anthropic', AI_MODEL: 'claude-sonnet-5-5', ANTHROPIC_API_KEY: 'sk-ant-test', OPENAI_API_KEY: 'sk-test' })
    expect(selectProviders(settings(), env).ai).toMatchObject({ name: 'anthropic', model: 'claude-sonnet-5-5', remote: true })
    // Settings pick OpenAI: AI_MODEL (a Claude model) must not leak into it.
    expect(selectProviders(settings({ provider: 'openai' }), env).ai).toMatchObject({ name: 'openai', model: 'gpt-6-luna' })
    expect(selectProviders(settings({ provider: 'openai', model: 'gpt-6-sol' }), env).ai.model).toBe('gpt-6-sol')
  })

  it('accepts a local OpenAI-compatible server without an API key', () => {
    const env = parseEnv({ AI_PROVIDER: 'openai', AI_MODEL: 'qwen3:8b', OPENAI_BASE_URL: 'http://localhost:11434/v1' })
    const { ai, notes } = selectProviders(settings(), env)
    expect(ai).toMatchObject({ name: 'openai', model: 'qwen3:8b' })
    expect(notes).toEqual([])
  })

  it('pauses a provider after an authentication failure instead of repeating it', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ error: { message: 'Incorrect API key' } }), { status: 401 }))
    vi.stubGlobal('fetch', fetch)
    const env = parseEnv({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-bad' })
    const { ai } = selectProviders(settings(), env)
    const input = { members: [], topTopics: [], keywords: [] }

    await expect(ai.describeCluster(input)).rejects.toMatchObject({ kind: 'auth' })
    const second = await ai.describeCluster(input).catch((e: unknown) => e)
    expect(second).toBeInstanceOf(AIProviderError)
    expect((second as AIProviderError).message).toMatch(/^Paused after an earlier failure/)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(providerPauses()).toHaveLength(1)
    // A fresh selection reports the pause.
    expect(selectProviders(settings(), env).notes.join(' ')).toMatch(/openai is paused until \d\d:\d\d UTC/)
  })

  it('does not pause on a per-request failure', async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({ error: { message: 'bad schema' } }), { status: 400 }))
    vi.stubGlobal('fetch', fetch)
    const { ai } = selectProviders(settings(), parseEnv({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-x' }))
    const input = { members: [], topTopics: [], keywords: [] }
    await expect(ai.describeCluster(input)).rejects.toMatchObject({ kind: 'invalid_request' })
    await expect(ai.describeCluster(input)).rejects.toMatchObject({ kind: 'invalid_request' })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(providerPauses()).toEqual([])
  })
})

describe('embedding threshold override', () => {
  it('merges valid values over the defaults', () => {
    const notes: string[] = []
    const t = thresholdOverride(parseEnv({ EMBEDDING_THRESHOLDS: '{"join":0.5,"fitHigh":0.7}' }), OPENAI_EMBEDDING_THRESHOLDS, notes)
    expect(t).toEqual({ ...OPENAI_EMBEDDING_THRESHOLDS, join: 0.5, fitHigh: 0.7 })
    expect(notes).toEqual([])
  })

  it('ignores invalid overrides and says so', () => {
    for (const raw of ['not json', '{"join":2}', '{"jion":0.5}', '{"fitLow":0.8,"fitHigh":0.7}']) {
      const notes: string[] = []
      expect(thresholdOverride(parseEnv({ EMBEDDING_THRESHOLDS: raw }), OPENAI_EMBEDDING_THRESHOLDS, notes)).toBe(OPENAI_EMBEDDING_THRESHOLDS)
      expect(notes).toHaveLength(1)
    }
  })
})
