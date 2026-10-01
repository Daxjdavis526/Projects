import { readFileSync } from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import type { BetaMessage } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import { describe, expect, it } from 'vitest'
import { AnthropicAIProvider, DEFAULT_ANTHROPIC_MODEL, toProviderError, type AnthropicMessagesClient } from '@/core/ai/remote/anthropic'
import { AIProviderError } from '@/core/ai/types'
import { analysisInputs, sampleBrief } from '../support/ai'

const fixture = (name: string): BetaMessage => JSON.parse(readFileSync(path.join(import.meta.dirname, '../fixtures/ai', name), 'utf8')) as BetaMessage

/** A fake SDK client: records every request and answers from a queue. */
function fakeClient(...answers: Array<BetaMessage | Error>) {
  const requests: Array<Record<string, unknown>> = []
  const client: AnthropicMessagesClient = {
    beta: {
      messages: {
        create: async (params) => {
          requests.push(params as unknown as Record<string, unknown>)
          const next = answers.shift()
          if (!next) throw new Error('No more fake answers')
          if (next instanceof Error) throw next
          return next
        },
      },
    },
  }
  return { client, requests }
}

const textMessage = (text: string, stop: BetaMessage['stop_reason'] = 'end_turn'): BetaMessage =>
  ({ ...fixture('anthropic.analysis.json'), content: [{ type: 'text', text, citations: null }], stop_reason: stop }) as BetaMessage

describe('Anthropic provider', () => {
  it('classifies a batch with structured output and maps answers back to post ids', async () => {
    const { client, requests } = fakeClient(fixture('anthropic.analysis.json'))
    const provider = new AnthropicAIProvider({ apiKey: 'unused', niche: 'Fitness / Bodybuilding', client })
    const inputs = analysisInputs()
    const results = await provider.analyzeContent(inputs)

    expect(results.map((r) => r.id)).toEqual(inputs.map((i) => i.id))
    const [squat, skit] = results
    expect(squat!.error).toBeNull()
    expect(squat!.analysis).toMatchObject({
      topic: 'Squat depth & range of motion',
      topicKey: 'squat_depth_rom', // normalised from "Squat Depth ROM"
      hookType: 'Contrarian claim',
      exercises: ['squat'], // de-duplicated, lower-cased
      nicheRelevance: 1, // clamped to 0–1
      confidence: 0.91,
    })
    expect(skit!.analysis!.style).toBe('Comedy')

    const request = requests[0]!
    expect(request.model).toBe(DEFAULT_ANTHROPIC_MODEL)
    expect(request.max_tokens).toBe(16_000)
    expect(request.output_config).toMatchObject({ effort: 'low', format: { type: 'json_schema' } })
    // Server-side refusal fallback, with its beta header, on Claude 5-family models.
    expect(request.fallbacks).toBe('default')
    expect(request.betas).toEqual(['server-side-fallback-2026-07-01'])
    expect(request).not.toHaveProperty('thinking')
    // The stable part of the prompt (instructions + known topics) is cacheable; posts go in the user turn.
    const system = request.system as Array<{ text: string; cache_control?: unknown }>
    expect(system[0]!.cache_control).toEqual({ type: 'ephemeral' })
    expect(system[0]!.text).toContain('squat_depth_rom: Squat depth & range of motion')
    const user = JSON.parse((request.messages as Array<{ content: string }>)[0]!.content) as { posts: Array<{ id: string }> }
    // Short aliases, not database ids, and post text travels as data.
    expect(user.posts.map((p) => p.id)).toEqual(['p1', 'p2'])
  })

  it('omits fallbacks and effort for models that do not take them', async () => {
    const { client, requests } = fakeClient(fixture('anthropic.analysis.json'))
    const provider = new AnthropicAIProvider({ apiKey: 'unused', model: 'claude-haiku-4-5', niche: 'Fitness', client })
    await provider.analyzeContent(analysisInputs())
    expect(requests[0]).not.toHaveProperty('fallbacks')
    expect(requests[0]).not.toHaveProperty('betas')
    expect(requests[0]!.output_config).not.toHaveProperty('effort')
  })

  it('reads the fallback model’s answer after a server-side fallback', async () => {
    const { client } = fakeClient(fixture('anthropic.fallback.json'))
    const provider = new AnthropicAIProvider({ apiKey: 'unused', niche: 'Fitness', client })
    const described = await provider.describeCluster({ members: [], topTopics: [], keywords: [] })
    expect(described).toEqual({ label: 'The squat depth debate', summary: 'Creators argue over how deep a squat has to be to count.' })
  })

  it('reports a refusal instead of parsing it', async () => {
    const { client } = fakeClient(fixture('anthropic.refusal.json'))
    const provider = new AnthropicAIProvider({ apiKey: 'unused', niche: 'Fitness', client })
    const err = await provider.describeCluster({ members: [], topTopics: [], keywords: [] }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(AIProviderError)
    expect((err as AIProviderError).kind).toBe('refusal')
    expect((err as AIProviderError).disablesProvider).toBe(false)
  })

  it('treats a cut-off answer as truncated, not as data', async () => {
    const { client } = fakeClient(textMessage('{"label":"Squat de', 'max_tokens'))
    const provider = new AnthropicAIProvider({ apiKey: 'unused', niche: 'Fitness', client })
    await expect(provider.describeCluster({ members: [], topTopics: [], keywords: [] })).rejects.toMatchObject({ kind: 'truncated' })
  })

  it('validates drafts: effort, beat timing, and no copied titles', async () => {
    const draft = {
      oneLiner: 'Squat depth is accelerating: 9 new posts in the last 3 days.',
      whyItMatters: 'Your myth-busting posts run above your normal.',
      suggestedAngle: 'Film both depths side by side and show the difference.',
      suggestedHook: 'Half reps or full depth? I tested both for a month.',
      titleConcept: 'Half reps vs full depth',
      captionConcept: 'Which side are you on?',
      structure: [
        { startSec: 0, endSec: 5, label: 'Hook', direction: 'Say the hook mid-set.' },
        { startSec: 4, endSec: 30, label: 'Test', direction: 'Show both depths.' },
        { startSec: 30, endSec: 40, label: 'Verdict', direction: 'Ask for their take.' },
      ],
      alternativeAngles: ['A coach reacts', 'Mobility drills', 'Beginner version', 'Fourth'],
    }
    const { client, requests } = fakeClient(textMessage(JSON.stringify(draft)), textMessage(JSON.stringify({ ...draft, suggestedHook: 'Stop doing half reps on squats — seriously.' })))
    const provider = new AnthropicAIProvider({ apiKey: 'unused', niche: 'Fitness', client })

    const result = await provider.draftRecommendation(sampleBrief())
    expect(requests[0]!.output_config).toMatchObject({ effort: 'medium' })
    expect(JSON.parse((requests[0]!.messages as Array<{ content: string }>)[0]!.content)).toMatchObject({ targetSeconds: 40 })
    // Overlapping beats are made contiguous from zero.
    expect(result.structure.map((b) => [b.startSec, b.endSec])).toEqual([
      [0, 5],
      [5, 30],
      [30, 40],
    ])
    expect(result.alternativeAngles).toHaveLength(3)

    // A hook that reuses another creator's title is rejected, so the caller falls back.
    await expect(provider.draftRecommendation(sampleBrief())).rejects.toMatchObject({ kind: 'bad_response' })
  })

  it('maps SDK errors to kinds, without leaking the key', () => {
    const headers = new Headers()
    const auth = toProviderError(new Anthropic.AuthenticationError(401, { type: 'error' }, 'invalid x-api-key sk-ant-api03-SECRETSECRETSECRET-abc', headers))
    expect(auth.kind).toBe('auth')
    expect(auth.disablesProvider).toBe(true)
    expect(auth.message).not.toContain('SECRET')

    const bad = toProviderError(new Anthropic.BadRequestError(400, { type: 'error' }, 'key sk-ant-api03-SECRETSECRETSECRET-abc is fine but max_tokens is not', headers))
    expect(bad.kind).toBe('invalid_request')
    expect(bad.message).not.toContain('SECRET')

    expect(toProviderError(new Anthropic.RateLimitError(429, { type: 'error' }, 'slow down', headers)).kind).toBe('rate_limit')
    expect(toProviderError(new Anthropic.InternalServerError(529, { type: 'error' }, 'overloaded', headers)).retryable).toBe(true)
    expect(toProviderError(new Anthropic.APIConnectionTimeoutError()).kind).toBe('unavailable')
  })
})
