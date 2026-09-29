/**
 * Formatting for display. Pure functions, safe on server and client. Dates
 * are always formatted in an explicit time zone (the creator's), never the
 * machine's, so server and browser agree.
 */

export function compact(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  const fmt = (v: number, suffix: string) => `${Number(v.toFixed(v >= 100 ? 0 : digits))}${suffix}`
  if (abs >= 1e9) return fmt(n / 1e9, 'B')
  if (abs >= 1e6) return fmt(n / 1e6, 'M')
  if (abs >= 1e4) return fmt(n / 1e3, 'K')
  if (abs >= 1e3) return Math.round(n).toLocaleString('en-US')
  return String(Math.round(n * 10) / 10)
}

export function integer(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return Math.round(n).toLocaleString('en-US')
}

export function multiple(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  if (n >= 10) return `${Math.round(n)}×`
  return `${Math.round(n * 10) / 10}×`
}

export function percent(fraction: number | null | undefined, digits = 0): string {
  if (fraction === null || fraction === undefined || !Number.isFinite(fraction)) return '—'
  return `${(fraction * 100).toFixed(digits)}%`
}

export function score(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return String(Math.round(n))
}

export function relativeTime(date: Date | string | null | undefined, now: Date = new Date()): string {
  if (!date) return 'never'
  const t = typeof date === 'string' ? new Date(date) : date
  const diff = now.getTime() - t.getTime()
  const future = diff < 0
  const s = Math.abs(diff) / 1000
  const phrase =
    s < 45
      ? 'just now'
      : s < 90
        ? '1 minute'
        : s < 3_600
          ? `${Math.round(s / 60)} minutes`
          : s < 5_400
            ? '1 hour'
            : s < 86_400
              ? `${Math.round(s / 3_600)} hours`
              : s < 172_800
                ? '1 day'
                : `${Math.round(s / 86_400)} days`
  if (phrase === 'just now') return phrase
  return future ? `in ${phrase}` : `${phrase} ago`
}

export function dateTime(date: Date | string | null | undefined, timeZone: string, style: 'short' | 'long' | 'time' | 'day' = 'short'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  const options: Intl.DateTimeFormatOptions =
    style === 'time'
      ? { hour: 'numeric', minute: '2-digit' }
      : style === 'day'
        ? { weekday: 'short', month: 'short', day: 'numeric' }
        : style === 'long'
          ? { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }
          : { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  try {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(d)
  } catch {
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(d)
  }
}

export function duration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return s ? `${m}m ${s}s` : `${m}m`
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`
}
