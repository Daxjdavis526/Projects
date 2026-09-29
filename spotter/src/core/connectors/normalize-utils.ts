/**
 * Small, strict parsers used by every connector's normaliser. They return
 * null for anything they cannot interpret — a missing or malformed field
 * must stay missing, never become 0.
 */

/** Counts arrive as numbers (Meta, TikTok) or decimal strings (YouTube). */
export function toCount(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? Math.round(value) : null
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const n = Number(value.trim())
    return Number.isSafeInteger(n) ? n : null
  }
  return null
}

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value)
  return null
}

/** ISO-8601 timestamps, or Unix seconds (TikTok's create_time). */
export function toDate(value: unknown): Date | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const d = new Date(value < 1e12 ? value * 1000 : value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

export function toText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

/** ISO-8601 duration as used by YouTube contentDetails.duration, e.g. "PT1M3S", "P1DT2H". */
export function parseIsoDuration(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const match = /^P(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(
    value.trim(),
  )
  if (!match || value.trim() === 'P' || value.trim() === 'PT') return null
  const [, w, d, h, m, s] = match
  const total =
    Number(w ?? 0) * 604_800 + Number(d ?? 0) * 86_400 + Number(h ?? 0) * 3_600 + Number(m ?? 0) * 60 + Number(s ?? 0)
  return Math.round(total)
}

/** Hashtags in free text, lower-cased and de-duplicated, without the '#'. */
export function extractHashtags(...texts: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  for (const text of texts) {
    if (!text) continue
    for (const match of text.matchAll(/(?:^|[^\p{L}\p{N}_&])#([\p{L}\p{N}_]{2,100})/gu)) {
      const tag = match[1]!.toLowerCase()
      if (!/^\d+$/.test(tag)) seen.add(tag)
    }
  }
  return [...seen]
}

/** Merge explicit tags (e.g. YouTube snippet.tags) with caption hashtags. */
export function mergeTags(explicit: unknown, ...texts: Array<string | null | undefined>): string[] {
  const out = new Set(extractHashtags(...texts))
  if (Array.isArray(explicit)) {
    for (const tag of explicit) {
      if (typeof tag === 'string') {
        const clean = tag.replace(/^#/, '').trim().toLowerCase()
        if (clean && clean.length <= 100 && !clean.includes(' ')) out.add(clean)
      }
    }
  }
  return [...out]
}

export function firstLine(text: string | null, max = 140): string | null {
  if (!text) return null
  const line = text.split('\n').find((l) => l.trim() !== '')?.trim() ?? ''
  if (!line) return null
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}
