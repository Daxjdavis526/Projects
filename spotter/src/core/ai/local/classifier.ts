/**
 * Offline content classifier. Deterministic, fast, explainable — and
 * limited: it knows the vocabulary of strength training, not the world. A
 * topic outside its lexicon falls back to keywords. Configure an LLM
 * provider for open-ended understanding.
 */
import type { ContentAnalysis, ContentAnalysisInput } from '../types'
import {
  AUDIENCE_CUES,
  CONTROVERSY_MARKERS,
  EXERCISES,
  FORMATS,
  TOPICS,
  compileTerm,
  lexiconVocabulary,
  scoreTerms,
  type CompiledTerm,
} from './lexicon'
import { contentTokens, firstSentence, GENERIC_HASHTAGS, normalizeText, segmentHashtag } from './text'

const compiledTopics = TOPICS.map((topic) => ({ topic, terms: topic.terms.map(compileTerm) }))
const compiledFormats = FORMATS.map((f) => ({ label: f.label, terms: f.terms.map(compileTerm) }))
const compiledControversy = CONTROVERSY_MARKERS.map(compileTerm)
const compiledAudience = AUDIENCE_CUES.map((a) => ({ label: a.label, terms: a.terms.map(compileTerm) }))
const vocabulary = lexiconVocabulary()

export interface TextView {
  /** Normalised text with hashtags expanded into words. */
  full: string
  /** The hook line (first sentence of the caption, or the title). */
  hook: string | null
  tokens: string[]
}

export function buildTextView(input: Pick<ContentAnalysisInput, 'title' | 'caption' | 'hashtags' | 'transcript' | 'comments'>): TextView {
  const specific = (tag: string) => !GENERIC_HASHTAGS.has(tag.toLowerCase())
  const hashtagWords = (input.hashtags ?? []).filter(specific).map((h) => segmentHashtag(h, vocabulary))
  const parts = [input.title ?? '', input.caption ?? '', hashtagWords.join(' '), input.transcript ?? '']
  const full = normalizeText(
    parts.join(' \n ').replace(/#([\p{L}\p{N}_]+)/gu, (_, tag: string) => (specific(tag) ? ` ${segmentHashtag(tag, vocabulary)} ` : ' ')),
  )
  const hook = firstSentence(input.caption) ?? firstSentence(input.title)
  // Comments inform tone (debate) but are weighted less than the creator's own words.
  const commentText = normalizeText((input.comments ?? []).slice(0, 20).join(' \n '))
  return { full: commentText ? `${full}\n${commentText}` : full, hook, tokens: contentTokens(full) }
}

export interface TopicScore {
  key: string
  label: string
  score: number
  matched: string[]
  generic: boolean
}

export function scoreTopics(text: string): TopicScore[] {
  return compiledTopics
    .map(({ topic, terms }) => {
      const { score, matched } = scoreTerms(text, terms)
      return { key: topic.key, label: topic.label, score, matched, generic: !!topic.generic }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
}

function bestLabel(text: string, groups: Array<{ label: string; terms: CompiledTerm[] }>): { label: string; score: number } | null {
  let best: { label: string; score: number } | null = null
  for (const g of groups) {
    const { score } = scoreTerms(text, g.terms)
    if (score > 0 && (!best || score > best.score)) best = { label: g.label, score }
  }
  return best
}

export function classifyHook(hook: string | null): string {
  if (!hook) return 'None'
  const h = normalizeText(hook)
  if (/^pov\b/.test(h)) return 'POV'
  if (
    /^(stop|don't|dont|never|quit)\b/.test(h) ||
    /(unpopular opinion|hot take|overrated|underrated|is a myth|nobody tells you|isn't cheating|not cheating|everyone is wrong|everyone gets this wrong|are wrong|wrong about|hear me out|isn't what you think)/.test(h)
  ) {
    return 'Contrarian claim'
  }
  if (/(mistake|wrong|you're probably|costing you|killing your|ruining|lying to you|doing it wrong)/.test(h)) return 'Mistake callout'
  if (/\?$/.test(h) || /^(how|why|what|should|is|are|does|do|can|will|which|would|when|ever wondered)\b/.test(h)) return 'Question'
  if (/^\d+\s/.test(h) || /\b\d+\s+(tips|mistakes|things|cues|reasons|ways|rules)\b/.test(h) || /^save these/.test(h)) return 'List'
  if (/^(i |i'm |my |when i|story time|last week|i tried)/.test(h)) return 'Story'
  if (/(the truth about|the only|explained|builds more|here's why|cheat code|is the new|what .* actually)/.test(h)) return 'Bold claim'
  return 'Statement'
}

function classifyStyle(format: string, topicKey: string, hookType: string, controversy: number, text: string): string {
  if (format === 'Skit / POV' || topicKey === 'gym_humor' || /[😂🤣💀]/u.test(text)) return 'Comedy'
  if (topicKey === 'motivation_mindset') return 'Motivational'
  if (format === 'Vlog / routine') return 'Vlog / lifestyle'
  const educational = ['Tutorial / how-to', 'Study breakdown', 'Myth busting', 'List / tips'].includes(format)
  if (educational && (controversy >= 0.5 || hookType === 'Contrarian claim')) return 'Educational controversy'
  if (format === 'Debate / reaction' || hookType === 'Contrarian claim' || controversy >= 0.6) return 'Opinion'
  return 'Educational'
}

function topKeywords(tokens: string[], matchedPhrases: string[], limit = 8): string[] {
  const counts = new Map<string, number>()
  for (const phrase of matchedPhrases) if (!phrase.includes('\\') && phrase.length > 2) counts.set(phrase, (counts.get(phrase) ?? 0) + 3)
  for (const tok of tokens) if (tok.length >= 4) counts.set(tok, (counts.get(tok) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, limit)
    .map(([k]) => k)
}

export function classifyLocally(input: ContentAnalysisInput, excludeKeywords: string[] = []): ContentAnalysis {
  const view = buildTextView(input)
  const topics = scoreTopics(view.full)
  const best = topics[0]
  const runnerUp = topics[1]

  let topicKey = 'general_training'
  let topicLabel = 'General training content'
  let topicConfidence = 0.3
  if (best && best.score >= 1.5) {
    topicKey = best.key
    topicLabel = best.label
    const margin = runnerUp ? (best.score - runnerUp.score) / best.score : 1
    topicConfidence = Math.min(0.9, 0.35 + 0.35 * margin + 0.2 * Math.min(1, best.score / 6))
  } else if (view.tokens.length > 0) {
    // Unknown to the lexicon: describe it by its most distinctive words.
    const words = topKeywords(view.tokens, [], 3)
    topicKey = `other_${words.slice(0, 2).join('_') || 'misc'}`
    topicLabel = words.length ? words.join(' ') : 'Other'
    topicConfidence = 0.2
  }

  const format = bestLabel(view.full, compiledFormats)?.label ?? 'Talking head'
  const hookType = classifyHook(view.hook)
  const controversyScore = scoreTerms(view.full, compiledControversy).score + (hookType === 'Contrarian claim' ? 1 : 0)
  const controversy = Math.round((1 - Math.exp(-0.45 * controversyScore)) * 100) / 100
  const style = classifyStyle(format, topicKey, hookType, controversy, view.full)
  const cue = bestLabel(view.full, compiledAudience)
  const topicDef = TOPICS.find((tp) => tp.key === topicKey)
  const targetAudience = cue && cue.score >= 2 ? cue.label : topicDef?.audience ?? 'General fitness audience'
  const exercises = EXERCISES.filter((e) => e.re.test(view.full)).map((e) => e.name)

  const nicheSignal = topics.filter((tp) => !tp.generic).reduce((s, tp) => s + tp.score, 0) + exercises.length * 0.8
  const excluded = excludeKeywords.some((k) => k && view.full.includes(k.toLowerCase()))
  const nicheRelevance = Math.round((1 - Math.exp(-nicheSignal / 3)) * (excluded ? 0.2 : 1) * 100) / 100
  const keywords = topKeywords(view.tokens, best?.matched ?? [])

  return {
    topic: topicLabel,
    topicKey,
    format,
    hook: view.hook,
    hookType,
    style,
    targetAudience,
    controversy,
    exercises,
    keywords,
    summary: `${format} on ${topicLabel.toLowerCase()} with a ${hookType.toLowerCase()} hook; ${style.toLowerCase()} in tone.`,
    nicheRelevance,
    confidence: Math.round(topicConfidence * 100) / 100,
  }
}
