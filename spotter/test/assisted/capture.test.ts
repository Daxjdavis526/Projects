import { describe, expect, it } from 'vitest'
import { CaptureError, captureToItem, parsePostUrl } from '@/core/assisted/capture'

describe('post links', () => {
  it('recognises YouTube, Instagram and TikTok post URLs without fetching them', () => {
    expect(parsePostUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toMatchObject({ platform: 'youtube', externalId: 'dQw4w9WgXcQ' })
    expect(parsePostUrl('https://youtube.com/shorts/abcDEF12345?feature=share')).toMatchObject({ platform: 'youtube', externalId: 'abcDEF12345', canonicalUrl: 'https://www.youtube.com/watch?v=abcDEF12345' })
    expect(parsePostUrl('https://youtu.be/abcDEF12345')).toMatchObject({ platform: 'youtube', externalId: 'abcDEF12345' })
    expect(parsePostUrl('https://www.instagram.com/reel/C9xYz_AbC12/?igsh=abc')).toMatchObject({ platform: 'instagram', externalId: 'shortcode:C9xYz_AbC12', canonicalUrl: 'https://www.instagram.com/reel/C9xYz_AbC12/' })
    expect(parsePostUrl('https://instagram.com/some.lifter/p/C9xYz_AbC12/')).toMatchObject({ platform: 'instagram', externalId: 'shortcode:C9xYz_AbC12' })
    expect(parsePostUrl('https://www.tiktok.com/@gym.coach/video/7412345678901234567?lang=en')).toMatchObject({ platform: 'tiktok', externalId: '7412345678901234567', handle: 'gym.coach' })
  })

  it('rejects everything else', () => {
    for (const url of ['not a url', 'ftp://youtube.com/watch?v=abcDEF12345', 'https://evil.example/watch?v=abcDEF12345', 'https://www.youtube.com/channel/UC123', 'https://www.tiktok.com/@gym.coach', 'javascript:alert(1)']) {
      expect(parsePostUrl(url)).toBeNull()
    }
  })

  it('turns a capture into a manual post, with only the numbers the creator saw', () => {
    const now = new Date('2026-09-29T12:00:00Z')
    const item = captureToItem(
      {
        url: 'https://www.tiktok.com/@gym.coach/video/7412345678901234567',
        text: 'Stop doing half reps #SquatDepth #legday',
        creatorHandle: null,
        creatorFollowers: -5,
        views: 120_000.4,
        likes: null,
        comments: 310,
        postedAt: new Date('2026-10-05T00:00:00Z'), // in the future: not trusted
      },
      now,
    )
    expect(item).toMatchObject({
      platform: 'tiktok',
      creatorHandle: 'gym.coach',
      creatorFollowerCount: null,
      viewCount: 120_000,
      likeCount: null,
      commentCount: 310,
      createdAt: null,
      hashtags: ['squatdepth', 'legday'],
      metricSource: 'manual',
    })
    expect(() => captureToItem({ url: 'https://example.com', text: null, creatorHandle: null, creatorFollowers: null, views: null, likes: null, comments: null, postedAt: null }, now)).toThrow(CaptureError)
  })
})
