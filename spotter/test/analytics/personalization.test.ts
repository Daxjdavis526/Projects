import { describe, expect, it } from 'vitest'
import { buildInsights, computeLifts, lengthBucket, postingWindow, weekday, type OwnPost } from '@/core/analytics/personalization'
import { creatorFit, type ClusterProfile, type CreatorModel } from '@/core/analytics/relevance'
import { defaultSettings } from '@/core/config/settings'

let n = 0
const post = (topic: string, multiple: number, extra: Partial<OwnPost['features']> = {}): OwnPost => ({
  contentItemId: `p${++n}`,
  platform: 'tiktok',
  views: 10_000 * multiple,
  expectedViews: 10_000,
  engagementRate: 0.05,
  features: { topic, platform: 'tiktok', ...extra },
})

describe('computeLifts', () => {
  const posts = [
    ...Array.from({ length: 10 }, () => post('Technique controversy', 2.1)),
    ...Array.from({ length: 8 }, () => post('Nutrition', 0.8)),
    post('Gym humor', 5), // one lucky post
  ]
  const lifts = computeLifts(posts)
  const find = (value: string) => lifts.find((l) => l.dimension === 'topic' && l.value === value)!

  it('measures lift against the creator’s own normal', () => {
    expect(find('Technique controversy').meanLogLift).toBeCloseTo(Math.log(2.1))
    expect(find('Nutrition').lift).toBeLessThan(1)
  })

  it('shrinks small samples so one lucky post is not a pattern', () => {
    const humor = find('Gym humor')
    expect(humor.lift).toBeLessThan(2) // raw 5×, shrunk with k=2 pseudo-posts
    expect(humor.confidence).toBeLessThan(find('Technique controversy').confidence)
  })

  it('writes plain-English insights for well-supported patterns only', () => {
    const insights = buildInsights(lifts)
    expect(insights[0]).toMatch(/^You get 1\.[7-9]× your normal views when posting about technique controversy \(10 posts\)\.$/)
    expect(insights.join(' ')).not.toMatch(/gym humor/i)
  })
})

describe('feature buckets', () => {
  it('buckets lengths', () => {
    expect(lengthBucket(22)).toBe('Under 30s')
    expect(lengthBucket(40)).toBe('30–45s')
    expect(lengthBucket(700)).toBe('10m+')
    expect(lengthBucket(null)).toBeNull()
  })

  it('uses the creator’s timezone for posting windows', () => {
    const t = new Date('2026-09-29T23:30:00Z') // 19:30 in New York (EDT)
    expect(postingWindow(t, 'America/New_York')).toBe('Evening (16–21)')
    expect(postingWindow(t, 'UTC')).toBe('Night (21–5)')
    expect(weekday(t, 'Asia/Tokyo')).toBe('Wednesday')
  })
})

describe('creatorFit', () => {
  const settings = defaultSettings()
  const ctx = {
    weights: settings.fit.weights,
    platformWeights: settings.platformWeights,
    nicheKeywords: settings.niche.keywords,
    subtopics: settings.niche.subtopics,
    excludeKeywords: ['steroids'],
    similarityRange: { low: 0.1, high: 0.7 },
  }
  const model: CreatorModel = {
    performanceCentroid: [1, 0, 0],
    centroid: [0.8, 0.6, 0],
    topics: [
      { topic: 'Squat depth & range of motion', centroid: [1, 0, 0], postCount: 6, shrunkLogLift: (6 * Math.log(2)) / 8 },
      { topic: 'Gym humor', centroid: [0, 0, 1], postCount: 6, shrunkLogLift: (6 * Math.log(0.6)) / 8 },
    ],
    ownPostCount: 40,
    lifts: computeLifts([
      ...Array.from({ length: 6 }, () => post('Squat depth & range of motion', 2, { format: 'Myth busting', platform: 'youtube' })),
      ...Array.from({ length: 6 }, () => post('Gym humor', 0.6, { format: 'Skit', platform: 'tiktok' })),
    ]),
  }
  const profile = (over: Partial<ClusterProfile>): ClusterProfile => ({
    centroid: [1, 0, 0],
    topicKey: 'squat_depth',
    topicLabel: 'Squat depth & range of motion',
    dominantFormat: 'Myth busting',
    dominantStyle: null,
    medianDurationSeconds: 40,
    platforms: ['youtube'],
    keywords: ['squat', 'hypertrophy', 'range of motion'],
    hashtags: ['squat', 'legday'],
    nicheRelevance: 0.9,
    ...over,
  })

  it('scores a trend like the creator’s best content highly', () => {
    const good = creatorFit(profile({}), model, ctx)
    const poor = creatorFit(
      profile({ centroid: [0, 0, 1], topicLabel: 'Gym humor', dominantFormat: 'Skit', platforms: ['tiktok'], keywords: ['pov', 'funny'], hashtags: ['gymhumor'], nicheRelevance: 0.4 }),
      model,
      ctx,
    )
    expect(good.score).toBeGreaterThan(75)
    expect(poor.score).toBeLessThan(45)
    expect(good.components.topic.explanation).toMatch(/your 6 posts there ran at 1\.7×/)
  })

  it('compares against the nearest of the creator’s topics, not a blend of all of them', () => {
    const wide = { ...ctx, similarityRange: { low: 0.1, high: 0.9 } }
    const perTopic = creatorFit(profile({}), model, wide)
    expect(perTopic.components.topic.inputs.nearestOwnTopic).toBe('Squat depth & range of motion')
    expect(perTopic.components.topic.inputs.similarity).toBe(1)
    // The average of both topics resembles neither, so an exact topic match would score lower against it.
    const blendOnly = creatorFit(profile({}), { ...model, topics: [], performanceCentroid: [Math.SQRT1_2, 0, Math.SQRT1_2] }, wide)
    expect(blendOnly.components.topic.inputs.similarityToYourBestContent).toBeCloseTo(0.707, 3)
    expect(creatorFit(profile({ centroid: [0, 0, 1] }), model, wide).components.topic.inputs.nearestOwnTopic).toBe('Gym humor')
  })

  it('lets a covered topic’s track record move its score', () => {
    const humor = creatorFit(profile({ centroid: [0, 0, 1] }), model, ctx)
    const squat = creatorFit(profile({ centroid: [1, 0, 0] }), model, ctx)
    // Identical similarity (1.0) to a covered topic; only the performance differs.
    expect(squat.components.topic.score!).toBeGreaterThan(humor.components.topic.score! + 20)
  })

  it('calls an uncovered topic new ground', () => {
    const fresh = creatorFit(profile({ centroid: [0, 1, 0] }), model, ctx)
    expect(fresh.components.topic.explanation).toMatch(/New ground/)
    expect(fresh.components.topic.score!).toBeLessThan(10)
  })

  it('treats unknown formats as neutral and reports them unavailable', () => {
    const r = creatorFit(profile({ dominantFormat: 'Challenge' }), model, ctx)
    expect(r.components.format.score).toBeNull()
    expect(r.components.format.explanation).toMatch(/neither helps nor hurts/)
  })

  it('penalises excluded keywords', () => {
    const clean = creatorFit(profile({}), model, ctx)
    const excluded = creatorFit(profile({ keywords: ['squat', 'steroids'] }), model, ctx)
    expect(excluded.components.niche.score!).toBeLessThan(clean.components.niche.score!)
  })
})
