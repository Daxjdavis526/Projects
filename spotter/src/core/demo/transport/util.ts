/**
 * Helpers for the simulated platform APIs.
 */
import type { Platform } from '../../domain/types'
import { lexiconVocabulary } from '../../ai/local/lexicon'
import { contentTokens, segmentHashtag, stem } from '../../ai/local/text'
import type { WorldPost } from '../world'

export const DEMO_API_ORIGIN = 'https://demo-api.spotter.invalid'

export type FaultKind = 'rate_limited' | 'auth_expired' | 'unavailable' | 'timeout' | 'schema_changed'

export function parseFaults(spec: string | undefined | null): Partial<Record<Platform, FaultKind>> {
  const out: Partial<Record<Platform, FaultKind>> = {}
  for (const part of (spec ?? '').split(',')) {
    const [platform, kind] = part.split(':').map((s) => s?.trim())
    if ((platform === 'youtube' || platform === 'instagram' || platform === 'tiktok') && kind) {
      if (['rate_limited', 'auth_expired', 'unavailable', 'timeout', 'schema_changed'].includes(kind)) out[platform] = kind as FaultKind
    }
  }
  return out
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
}

/** Resolve when the request is aborted: simulates an API that never answers. */
export function hang(signal: AbortSignal | null | undefined): Promise<Response> {
  return new Promise((_, reject) => {
    if (!signal) return
    const fail = () => reject(new DOMException('The operation was aborted.', 'AbortError'))
    if (signal.aborted) fail()
    else signal.addEventListener('abort', fail, { once: true })
  })
}

export function queryTokens(q: string): string[] {
  return [...new Set(contentTokens(q).map(stem))]
}

const vocabulary = lexiconVocabulary()

function postTokens(post: WorldPost): Set<string> {
  const words = contentTokens(`${post.title ?? ''} ${post.caption} ${post.hashtags.join(' ')}`).map(stem)
  // Run-together hashtags ("squatdepth", "gymhumor") also match their parts, as they would on the real platforms.
  const out = new Set(words)
  for (const tag of post.hashtags) {
    for (const tok of segmentHashtag(tag, vocabulary).split(' ')) out.add(stem(tok))
    // A tag that is itself a known term ("gymhumor") still matches its two halves.
    const s = tag.toLowerCase()
    for (let i = 2; i <= s.length - 2; i++) {
      if (vocabulary.has(s.slice(0, i)) && vocabulary.has(s.slice(i))) {
        out.add(stem(s.slice(0, i)))
        out.add(stem(s.slice(i)))
      }
    }
  }
  return out
}

/** A crude but honest relevance score: share of query words present in the post. */
export function relevance(post: WorldPost, qTokens: string[]): number {
  if (qTokens.length === 0) return 0
  const tokens = postTokens(post)
  let hits = 0
  for (const t of qTokens) if (tokens.has(t)) hits++
  return hits / qTokens.length
}

/** ISO-8601 duration as YouTube formats it. */
export function isoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`
}

export function list<T>(items: T[], offset: number, pageSize: number): { page: T[]; next: string | undefined } {
  const page = items.slice(offset, offset + pageSize)
  return { page, next: offset + pageSize < items.length ? String(offset + pageSize) : undefined }
}
