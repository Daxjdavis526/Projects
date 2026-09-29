import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { RemoteHttpDeps } from '@/core/ai/remote/http'
import { OpenAIEmbeddingProvider, OpenAIProvider } from '@/core/ai/remote/openai'
import { VoyageEmbeddingProvider } from '@/core/ai/remote/voyage'
import { AIProviderError } from '@/core/ai/types'
import { sampleBrief } from '../support/ai'

const fixture = (name: string): unknown => JSON.parse(readFileSync(path.join(import.meta.dirname, '../fixtures/ai', name), 'utf8'))

interface Call {
  url: string
  headers: Record<string, string>
  body: Record<string, unknown>
}

/** Fake fetch answering from a queue of [status, body, headers?]; records requests; never waits. */
function fakeHttp(...answers: Array<[number, unknown, Record<string, string>?] | Error>) {
  const calls: Call[] = []
  const sleeps: number[] = []
  const deps: RemoteHttpDeps = {
    fetch: async (input, init) => {
      calls.push({ url: String(input), headers: init?.headers as Record<string, string>, body: JSON.parse(String(init?.body)) as Record<string, unknown> })
      const next = answers.shift()
      if (!next) throw new Error('No more fake answers')
      if (next instanceof Error) throw next
      const [status, body, headers] = next
      return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers })
    },
    sleep: async (ms) => {
      sleeps.push(ms)
    },
    random: () => 0.5,
  }
  return { deps, calls, sleeps }
}

describe('OpenAI provider', () => {
  it('drafts with strict structured output and reasoning effort on the official API', async () => {
    const { deps, calls } = fakeHttp([200, fixture('openai.chat.draft.json')])
    const provider = new OpenAIProvider({ apiKey: 'sk-test-key-0000000000000000000000', niche: 'Fitness', deps })
    const draft = await provider.draftRecommendation(sampleBrief())

    expect(draft.suggestedHook).toBe("I squatted half-depth for a month. Here's what my knees said.")
    expect(draft.structure.map((b) => [b.startSec, b.endSec])).toEqual([
      [0, 4],
      [4, 25],
      [25, 40],
    ])
    const call = calls[0]!
    expect(call.url).toBe('https://api.openai.com/v1/chat/completions')
    expect(call.headers.authorization).toBe('Bearer sk-test-key-0000000000000000000000')
    expect(call.body).toMatchObject({
      model: 'gpt-6-luna',
      reasoning_effort: 'medium',
      max_completion_tokens: 16_000,
      response_format: { type: 'json_schema', json_schema: { name: 'video_brief', strict: true } },
    })
    expect((call.body.messages as Array<{ role: string }>).map((m) => m.role)).toEqual(['developer', 'user'])
  })

  it('talks to a local OpenAI-compatible server with the plain request shape', async () => {
    const { deps, calls } = fakeHttp([200, fixture('openai.chat.draft.json')])
    const provider = new OpenAIProvider({ baseUrl: 'http://localhost:11434/v1/', model: 'qwen3:8b', niche: 'Fitness', deps })
    await provider.draftRecommendation(sampleBrief())
    const call = calls[0]!
    expect(call.url).toBe('http://localhost:11434/v1/chat/completions')
    expect(call.headers).not.toHaveProperty('authorization')
    expect(call.body).not.toHaveProperty('reasoning_effort')
    expect(call.body).toMatchObject({ model: 'qwen3:8b', max_tokens: 8_000 })
    expect((call.body.messages as Array<{ role: string }>)[0]!.role).toBe('system')
  })

  it('reports refusals and cut-off answers instead of parsing them', async () => {
    const refusal = { choices: [{ finish_reason: 'stop', message: { content: null, refusal: 'I can’t help with that.' } }] }
    const cutOff = { choices: [{ finish_reason: 'length', message: { content: '{"label":"Sq', refusal: null } }] }
    const { deps } = fakeHttp([200, refusal], [200, cutOff])
    const provider = new OpenAIProvider({ apiKey: 'k', niche: 'Fitness', deps })
    const input = { members: [], topTopics: [], keywords: [] }
    await expect(provider.describeCluster(input)).rejects.toMatchObject({ kind: 'refusal' })
    await expect(provider.describeCluster(input)).rejects.toMatchObject({ kind: 'truncated' })
  })

  it('retries 429 honouring Retry-After, then succeeds', async () => {
    const { deps, calls, sleeps } = fakeHttp([429, { error: { message: 'Rate limit' } }, { 'retry-after': '2' }], [200, fixture('openai.chat.draft.json')])
    const provider = new OpenAIProvider({ apiKey: 'k', niche: 'Fitness', deps })
    await provider.draftRecommendation(sampleBrief())
    expect(calls).toHaveLength(2)
    expect(sleeps).toEqual([2_000])
  })

  it('does not retry a bad key, and never repeats the key in the error', async () => {
    const key = 'sk-proj-SECRETSECRETSECRETSECRET1234'
    const { deps, calls } = fakeHttp([401, { error: { message: `Incorrect API key provided: ${key}.` } }])
    const provider = new OpenAIProvider({ apiKey: key, niche: 'Fitness', deps })
    const err = (await provider.describeCluster({ members: [], topTopics: [], keywords: [] }).catch((e: unknown) => e)) as AIProviderError
    expect(err).toBeInstanceOf(AIProviderError)
    expect(err.kind).toBe('auth')
    expect(err.disablesProvider).toBe(true)
    expect(err.message).toContain('HTTP 401')
    expect(err.message).not.toContain('SECRET')
    expect(calls).toHaveLength(1)
  })

  it('gives up after retries on server errors and network failures', async () => {
    const { deps, calls, sleeps } = fakeHttp([500, 'oops'], new TypeError('fetch failed'), [503, { error: { message: 'overloaded' } }])
    const provider = new OpenAIProvider({ apiKey: 'k', niche: 'Fitness', deps })
    await expect(provider.describeCluster({ members: [], topTopics: [], keywords: [] })).rejects.toMatchObject({ kind: 'unavailable', retryable: true })
    expect(calls).toHaveLength(3)
    // Full-jitter exponential backoff: random(0, 1s·2^(n−1)) with random() = 0.5.
    expect(sleeps).toEqual([500, 1_000])
  })
})

describe('OpenAI embeddings', () => {
  it('shortens text-embedding-3 vectors, keys the model id by size, and restores input order', async () => {
    const { deps, calls } = fakeHttp([200, fixture('openai.embeddings.json')])
    const embedder = new OpenAIEmbeddingProvider({ apiKey: 'k', deps })
    expect(embedder.model).toBe('text-embedding-3-small@512')
    expect(embedder.dims).toBe(512)
    const vectors = await embedder.embed(['first', 'second'])
    expect(vectors).toEqual([
      [1, 0, 0],
      [0, 1, 0],
    ])
    expect(calls[0]!.url).toBe('https://api.openai.com/v1/embeddings')
    expect(calls[0]!.body).toMatchObject({ model: 'text-embedding-3-small', input: ['first', 'second'], dimensions: 512 })
  })

  it('leaves other models at their native size', async () => {
    const { deps, calls } = fakeHttp([200, fixture('openai.embeddings.json')])
    const embedder = new OpenAIEmbeddingProvider({ baseUrl: 'http://localhost:11434/v1', model: 'nomic-embed-text', deps })
    expect(embedder.model).toBe('nomic-embed-text')
    await embedder.embed(['a', 'b'])
    expect(calls[0]!.body).not.toHaveProperty('dimensions')
  })

  it('rejects a response with the wrong number of vectors', async () => {
    const { deps } = fakeHttp([200, fixture('openai.embeddings.json')])
    const embedder = new OpenAIEmbeddingProvider({ apiKey: 'k', deps })
    await expect(embedder.embed(['only one'])).rejects.toMatchObject({ kind: 'bad_response' })
  })
})

describe('Voyage embeddings', () => {
  it('embeds posts as documents at 512 dimensions', async () => {
    const { deps, calls } = fakeHttp([200, fixture('voyage.embeddings.json')])
    const embedder = new VoyageEmbeddingProvider({ apiKey: 'pa-test', deps })
    expect(embedder.model).toBe('voyage-4-lite@512')
    const vectors = await embedder.embed(['a', 'b'])
    expect(vectors).toEqual([
      [0.6, 0.8],
      [0.8, 0.6],
    ])
    expect(calls[0]!.url).toBe('https://api.voyageai.com/v1/embeddings')
    expect(calls[0]!.headers.authorization).toBe('Bearer pa-test')
    expect(calls[0]!.body).toEqual({ model: 'voyage-4-lite', input: ['a', 'b'], input_type: 'document', output_dimension: 512 })
  })
})
