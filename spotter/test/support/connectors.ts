import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defaultSettings } from '@/core/config/settings'
import type { HttpDeps } from '@/core/connectors/http'
import { createQuotaGate, MemoryQuotaStore, quotaBuckets } from '@/core/connectors/quota'
import type { AccessCredentials, ConnectedAccountInfo, ConnectorContext, QuotaGate } from '@/core/connectors/types'
import { createMemoryLogger } from '@/core/observability/logger'

export function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'fixtures', name), 'utf8')) as T
}

export interface RecordedCall {
  url: URL
  method: string
  body: string | null
  headers: Record<string, string>
}

type Responder = Response | ((call: RecordedCall) => Response | Promise<Response>)

/** A fetch that answers from a route table and records every call. No network. */
export function fakeHttp(routes: Array<[RegExp | ((call: RecordedCall) => boolean), Responder]>): HttpDeps & { calls: RecordedCall[]; sleeps: number[] } {
  const calls: RecordedCall[] = []
  const sleeps: number[] = []
  const fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url)
    const call: RecordedCall = {
      url,
      method: init?.method ?? 'GET',
      body: init?.body === undefined || init.body === null ? null : String(init.body),
      headers: Object.fromEntries(Object.entries((init?.headers as Record<string, string>) ?? {}).map(([k, v]) => [k.toLowerCase(), v])),
    }
    calls.push(call)
    for (const [match, respond] of routes) {
      const hit = match instanceof RegExp ? match.test(`${call.method} ${url.origin}${url.pathname}`) : match(call)
      if (hit) {
        const res = typeof respond === 'function' ? await respond(call) : respond.clone()
        return res
      }
    }
    return new Response(JSON.stringify({ error: `no route for ${call.method} ${url.pathname}` }), { status: 599 })
  }) as typeof globalThis.fetch
  return { fetch, sleep: async (ms) => void sleeps.push(ms), random: () => 0.5, calls, sleeps }
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
}

export function testQuota(now: Date, useReserve = true): QuotaGate & { store: MemoryQuotaStore } {
  const store = new MemoryQuotaStore()
  const gate = createQuotaGate({
    store,
    buckets: quotaBuckets({ YOUTUBE_DAILY_QUOTA: 10_000, YOUTUBE_SEARCH_DAILY_LIMIT: 100, YOUTUBE_BATCH_STATS_DAILY_LIMIT: 10_000 }),
    reserveFraction: 0.1,
    useReserve,
    now: () => now,
  })
  return Object.assign(gate, { store })
}

export function testContext(over: Partial<ConnectorContext> & { credentials?: AccessCredentials | null; account?: ConnectedAccountInfo | null } = {}): ConnectorContext {
  const now = over.now ?? new Date('2026-09-29T12:00:00Z')
  return {
    now,
    logger: createMemoryLogger('warn'),
    settings: defaultSettings(),
    credentials: null,
    account: null,
    quota: testQuota(now),
    cursor: null,
    ...over,
  }
}

export function credentials(scopes: string[], over: Partial<AccessCredentials> = {}): AccessCredentials {
  return {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    accessTokenExpiresAt: new Date('2026-09-29T13:00:00Z'),
    refreshTokenExpiresAt: null,
    scopes,
    issuedAt: new Date('2026-09-20T12:00:00Z'),
    ...over,
  }
}
