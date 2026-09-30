/**
 * Text normalisation for the local (offline) AI provider: tokenising,
 * light stemming, stopwords, and splitting run-together hashtags
 * ("#squatdepth" → "squat depth") against a vocabulary.
 */

export const STOPWORDS = new Set(
  (
    'a an the and or but if then than so to of in on at by for with from into onto over under about as is are was were be been being ' +
    'i me my mine we our you your yours he she it its they them their this that these those there here what which who whom whose ' +
    'do does did doing done have has had having can could should would will shall may might must not no nor only own same too very ' +
    'just also more most much many few some any all each every both either neither other another such up down out off again further ' +
    'once when where why how really actually literally get got gets getting make makes made let lets going go goes went gonna ' +
    'am im ive youre dont doesnt isnt arent wasnt cant wont thats whats heres theres ill youll weve theyre one two three new like ' +
    'via amp s t re ve ll d m vs'
  ).split(/\s+/),
)

/**
 * Words too common in this niche to say anything about a topic. They are
 * kept out of keyword lists and embeddings so two unrelated gym videos do
 * not look alike just because both say "gym".
 */
export const GENERIC_NICHE_WORDS = new Set(
  (
    'gym gymtok gymlife fitness fitnesstips fitnessmotivation fitfam workout workouts training train trained lifting lift lifts lifter lifters ' +
    'exercise exercises fit health healthy motivation tips tip video videos shorts short reels reel viral fyp foryou foryoupage explore ' +
    'day today week weeks time people guy guys everyone someone thing things way ways'
  ).split(/\s+/),
)

/**
 * Hashtags attached to almost every fitness post. They say nothing about the
 * topic, so they are dropped before topic scoring and embedding.
 */
export const GENERIC_HASHTAGS = new Set(
  (
    'gym gymtok gymlife gymmotivation fitness fitnesstips fitnessmotivation fitfam fitnessjourney fitnesscommunity fitspo workout ' +
    'workouts training lifting lift motivation health healthy explore viral fyp foryou foryoupage reels shorts trending instagood'
  ).split(/\s+/),
)

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’´`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Very light stemmer: enough to join plural/verb forms of fitness vocabulary. */
export function stem(word: string): string {
  let w = word
  if (w.length > 5 && w.endsWith('ies')) w = `${w.slice(0, -3)}y`
  else if (w.length > 4 && w.endsWith('es') && /(ss|x|ch|sh)es$/.test(w)) w = w.slice(0, -2)
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us')) w = w.slice(0, -1)
  if (w.length > 6 && w.endsWith('ing')) w = w.slice(0, -3)
  else if (w.length > 5 && w.endsWith('ed')) w = w.slice(0, -2)
  return w
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .replace(/#/g, ' ')
    .split(/[^\p{L}\p{N}']+/u)
    .map((t) => t.replace(/^'+|'+$/g, '').replace(/'/g, ''))
    .filter((t) => t.length >= 2)
}

export function contentTokens(text: string): string[] {
  return tokenize(text).filter((t) => !STOPWORDS.has(t) && !GENERIC_NICHE_WORDS.has(t) && !/^\d+$/.test(t))
}

/**
 * Split a run-together hashtag into known words by dynamic programming,
 * preferring fewer, longer words. Unknown hashtags are returned whole.
 */
export function segmentHashtag(tag: string, vocabulary: ReadonlySet<string>): string {
  const s = tag.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (s.length < 5 || vocabulary.has(s)) return s
  const n = s.length
  const best: Array<{ cost: number; words: string[] } | null> = new Array(n + 1).fill(null)
  best[0] = { cost: 0, words: [] }
  for (let i = 1; i <= n; i++) {
    for (let j = Math.max(0, i - 20); j < i; j++) {
      const prev = best[j]
      if (!prev) continue
      const word = s.slice(j, i)
      const known = vocabulary.has(word) || /^\d+$/.test(word)
      if (!known) continue
      const cost = prev.cost + 1
      if (!best[i] || cost < best[i]!.cost) best[i] = { cost, words: [...prev.words, word] }
    }
  }
  const result = best[n]
  return result && result.words.length > 1 ? result.words.join(' ') : s
}

/** First non-empty line or sentence of a caption: usually the hook. */
export function firstSentence(text: string | null, max = 140): string | null {
  if (!text) return null
  const line = text
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !/^[#.\s]+$/.test(l) && !l.startsWith('#'))
  if (!line) return null
  const withoutTags = line.replace(/(^|\s)#[\p{L}\p{N}_]+/gu, '').trim()
  const sentence = /^(.+?[.!?])(\s|$)/.exec(withoutTags)?.[1] ?? withoutTags
  const clean = sentence.trim()
  if (!clean) return null
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean
}
