/**
 * Helpers shared by the OAuth flows.
 */
import type { TokenSet } from './types'

export function expiresAt(now: Date, seconds: unknown): Date | null {
  const n = typeof seconds === 'string' ? Number(seconds) : seconds
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? new Date(now.getTime() + n * 1000) : null
}

export function splitScopes(scope: unknown, separator: RegExp = /[\s,]+/): string[] | null {
  if (typeof scope !== 'string') return null
  const parts = scope.split(separator).map((s) => s.trim()).filter(Boolean)
  return parts.length ? [...new Set(parts)] : []
}

export function tokenSet(init: Partial<TokenSet> & { accessToken: string }): TokenSet {
  return {
    accessToken: init.accessToken,
    refreshToken: init.refreshToken ?? null,
    accessTokenExpiresAt: init.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: init.refreshTokenExpiresAt ?? null,
    scopes: init.scopes ?? null,
    tokenType: init.tokenType ?? null,
  }
}

export function buildUrl(base: string, params: Record<string, string | number | boolean | null | undefined>): string {
  const url = new URL(base)
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') url.searchParams.set(key, String(value))
  }
  return url.toString()
}

export function form(params: Record<string, string | null | undefined>): URLSearchParams {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value !== null && value !== undefined) body.set(key, value)
  return body
}
