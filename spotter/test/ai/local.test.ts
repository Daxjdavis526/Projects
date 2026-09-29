import { describe, expect, it } from 'vitest'
import { cosine } from '@/core/analytics/clustering'
import { classifyHook, classifyLocally } from '@/core/ai/local/classifier'
import { embedLocally, LOCAL_EMBEDDING_THRESHOLDS } from '@/core/ai/local/embedder'
import { LocalAIProvider } from '@/core/ai/local/provider'
import { pickHookType } from '@/core/ai/local/writer'
import { lexiconVocabulary } from '@/core/ai/local/lexicon'
import { segmentHashtag } from '@/core/ai/local/text'
import type { ContentAnalysisInput } from '@/core/ai/types'

const input = (title: string, caption: string | null = null, hashtags: string[] = []): ContentAnalysisInput => ({
  id: title,
  platform: 'youtube',
  title,
  caption,
  hashtags,
  transcript: null,
  comments: [],
  durationSeconds: 40,
  knownTopics: [],
})

describe('local classifier', () => {
  it('classifies the brief’s squat-depth example', () => {
    const a = classifyLocally(input('You’re probably doing this exercise wrong: how deep should you squat?'))
    expect(a.topicKey).toBe('squat_depth_rom')
    expect(a.hookType).toBe('Mistake callout')
    expect(a.exercises).toContain('squat')
  })

  it('recognises formats, hooks and styles', () => {
    const debate = classifyLocally(input('Is a bench press arch cheating? A coach reacts to the debate'))
    expect(debate.topicKey).toBe('bench_technique')
    expect(debate.format).toBe('Debate / reaction')
    expect(debate.controversy).toBeGreaterThan(0.5)

    const skit = classifyLocally(input('POV: someone is curling in the squat rack 😂'))
    expect(skit.format).toBe('Skit / POV')
    expect(skit.style).toBe('Comedy')

    const tutorial = classifyLocally(input('How to fix your deadlift lockout', 'Pull the slack out of the bar first.'))
    expect(tutorial.topicKey).toBe('deadlift_technique')
    expect(tutorial.format).toBe('Tutorial / how-to')
  })

  it('classifies hook lines', () => {
    expect(classifyHook('Stop doing half reps on squats')).toBe('Contrarian claim')
    expect(classifyHook('Unpopular opinion: filming your sets is fine.')).toBe('Contrarian claim')
    expect(classifyHook('How deep should you actually squat?')).toBe('Question')
    expect(classifyHook('5 beginner gym mistakes I made')).toBe('Mistake callout')
    expect(classifyHook('3 cues for a stronger bench press')).toBe('List')
    expect(classifyHook('I tried deep squats for 30 days')).toBe('Story')
    expect(classifyHook(null)).toBe('None')
  })

  it('expands run-together hashtags against the lexicon', () => {
    const vocab = lexiconVocabulary()
    expect(segmentHashtag('squatdepth', vocab)).toBe('squat depth')
    expect(segmentHashtag('lengthenedpartials', vocab)).toBe('lengthened partials')
    expect(segmentHashtag('trainingtofailure', vocab)).toBe('training to failure')
  })

  it('says it does not know rather than forcing unfamiliar content into a topic', () => {
    const a = classifyLocally(input('Japanese walking method for longevity'))
    expect(a.topicKey).toBe('general_training')
    expect(a.confidence).toBeLessThan(0.3)
    expect(a.nicheRelevance).toBeLessThan(0.3)
  })

  it('scores niche relevance and applies exclusions', () => {
    const provider = new LocalAIProvider(['steroid'])
    return provider.analyzeContent([input('Natty or not? Steroid use in fitness influencers'), input('Squat depth for hypertrophy')]).then(([a, b]) => {
      expect(a!.analysis!.nicheRelevance).toBeLessThan(b!.analysis!.nicheRelevance)
    })
  })
})

describe('local embeddings', () => {
  const e = (text: string) => embedLocally(text)

  it('groups posts by meaning even with no shared keywords (the brief’s example)', () => {
    const a = e('Full ROM squats build more muscle')
    const b = e('Stop doing half reps')
    const c = e('How deep should you squat?')
    const unrelated = e('Creatine does not cause hair loss')
    expect(cosine(a, c)).toBeGreaterThan(LOCAL_EMBEDDING_THRESHOLDS.create)
    expect(cosine(b, c)).toBeGreaterThan(LOCAL_EMBEDDING_THRESHOLDS.join)
    expect(cosine(a, unrelated)).toBeLessThan(0.2)
    expect(cosine(c, unrelated)).toBeLessThan(0.2)
  })

  it('does not treat generic gym content as one topic', () => {
    const a = e('Push day full workout')
    const b = e('Meal prep for the week')
    expect(cosine(a, b)).toBeLessThan(LOCAL_EMBEDDING_THRESHOLDS.create)
  })

  it('is deterministic and unit-length', () => {
    const v = e('Lengthened partials explained in 60 seconds')
    expect(v).toEqual(e('Lengthened partials explained in 60 seconds'))
    expect(Math.hypot(...v)).toBeCloseTo(1, 4)
  })
})

describe('local writer', () => {
  it('drafts an original recommendation tailored to the creator', async () => {
    const provider = new LocalAIProvider()
    const draft = await provider.draftRecommendation({
      trendLabel: 'Squat depth & range of motion',
      topicKey: 'squat_depth_rom',
      trendSummary: null,
      stage: 'Accelerating',
      trendScore: 91,
      fitScore: 88,
      evidenceLines: ['14 related videos from 9 creators', '3 creators substantially outperforming their baseline'],
      facts: {
        posts: 14,
        creators: 9,
        platforms: ['YouTube', 'Instagram'],
        postsLast3Days: 9,
        postsPrevious3Days: 4,
        momentumPerDay: 1.31,
        medianOutperformance: 2.4,
        bestOutperformance: 7.9,
        viewsPerHour: 41_000,
      },
      formats: ['Myth busting', 'Debate / reaction'],
      hookTypes: ['Contrarian claim'],
      styles: ['Educational controversy'],
      exampleTitles: ['Stop doing half reps on squats'],
      niche: 'Fitness',
      creatorInsights: ['You get 2.1× your normal views when the topic is controversial (11 posts).'],
      fitReasons: ['Closest to your own posts on squat depth & range of motion (similarity 0.81); your 6 posts there ran at 1.7× your normal.'],
      variant: 0,
      creatorBestFormats: ['Myth busting'],
      creatorBestHookTypes: ['Contrarian claim'],
      targetLength: '30–45s',
      audience: 'Intermediate lifters',
      ownPriorPost: null,
    })
    // The creator's best hook type that the trend also uses, written for this topic.
    expect(draft.suggestedHook).toBe('Squatting deeper isn’t automatically better — here’s when it is.')
    expect(draft.structure[0]!.startSec).toBe(0)
    expect(draft.structure.at(-1)!.endSec).toBe(40)
    expect(draft.oneLiner).toBe(
      'Squat depth & range of motion is accelerating: 9 new posts on YouTube and Instagram in the last 3 days (momentum 1.3× per day), running 2.4× their creators’ usual views.',
    )
    expect(draft.whyItMatters).toMatch(/3 creators substantially outperforming/)
    expect(draft.whyItMatters).toMatch(/Why you: closest to your own posts on squat depth/)
    // Never copies a competitor's title.
    expect(JSON.stringify(draft)).not.toMatch(/Stop doing half reps on squats/)
  })

  it('varies openings across a batch', () => {
    const brief = { creatorBestHookTypes: ['Contrarian claim', 'List'], hookTypes: ['Question', 'Contrarian claim'] }
    const picks = [0, 1, 2, 3].map((variant) => pickHookType({ ...brief, variant }))
    expect(picks[0]).toBe('Contrarian claim')
    expect(new Set(picks.slice(0, 3)).size).toBe(3)
    expect(picks[3]).toBe(picks[0])
  })
})
