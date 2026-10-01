/**
 * A small in-memory sliding-window limiter for sign-in attempts. One process
 * serves one creator, so memory is the right place; a multi-instance
 * deployment would move this to the database.
 */
import 'server-only'

const attempts = new Map<string, number[]>()

export function tooManyAttempts(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < windowMs)
  attempts.set(key, recent)
  return recent.length >= limit
}

export function recordAttempt(key: string, now = Date.now()): void {
  const list = attempts.get(key) ?? []
  list.push(now)
  attempts.set(key, list.slice(-50))
}

export function clearAttempts(key: string): void {
  attempts.delete(key)
}
