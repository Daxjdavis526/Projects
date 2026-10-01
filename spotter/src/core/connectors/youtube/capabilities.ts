/**
 * What the YouTube connector can do, derived from the implementation, the
 * server configuration and the scopes the creator actually granted. Every
 * statement here is backed by the official docs quoted in CAPABILITIES.md
 * (checked 2026-09-29).
 */
import { CAPABILITY_LABEL, type CapabilityContext, type CapabilityItem, type CapabilityReport, type CapabilityStatus } from '../types'

export const YOUTUBE_DOCS_CHECKED = '2026-09-29'
const SCOPE_READONLY = 'https://www.googleapis.com/auth/youtube.readonly'
const SCOPE_ANALYTICS = 'https://www.googleapis.com/auth/yt-analytics.readonly'

export function youtubeCapabilities(ctx: CapabilityContext): CapabilityReport {
  const live = ctx.mode === 'live'
  const hasApiKey = ctx.options?.hasApiKey === true
  const approved = ctx.mode === 'mock' || ctx.options?.derivedApproved === true
  const granted = new Set(ctx.grantedScopes)
  const scopeStatus = (scope: string, fallback: CapabilityStatus): CapabilityStatus => {
    if (live && !ctx.configured) return 'not_configured'
    if (ctx.connected && !granted.has(scope)) return 'needs_permission'
    return fallback
  }
  const item = (key: CapabilityItem['key'], status: CapabilityStatus, summary: string, extra: Partial<CapabilityItem> = {}): CapabilityItem => ({
    key,
    label: CAPABILITY_LABEL[key],
    status,
    summary,
    ...extra,
  })

  const discoveryConfigured = !live || ctx.configured || hasApiKey
  const items: CapabilityItem[] = [
    item('own_profile', scopeStatus(SCOPE_READONLY, 'available'), 'Channel title, handle, subscriber count, total views and video count.', {
      scopes: [SCOPE_READONLY],
      docs: ['https://developers.google.com/youtube/v3/docs/channels/list'],
    }),
    item('own_content', scopeStatus(SCOPE_READONLY, 'available'), 'Your public uploads (the last 180 days on the first sync, then 60; up to 300 per run) with title, description, tags, duration, publish time and live view/like/comment counts. Live and upcoming broadcasts are skipped.', {
      scopes: [SCOPE_READONLY],
      docs: ['https://developers.google.com/youtube/v3/docs/playlistItems/list'],
    }),
    item(
      'own_analytics',
      scopeStatus(SCOPE_ANALYTICS, 'available'),
      'Watch time, average view duration and percentage, engaged views, shares and subscribers gained per video. Data lags 48–72 hours.',
      { scopes: [SCOPE_READONLY, SCOPE_ANALYTICS], docs: ['https://developers.google.com/youtube/analytics/reference/reports/query'] },
    ),
    item(
      'public_discovery',
      !discoveryConfigured ? 'not_configured' : approved ? 'limited' : 'needs_review',
      approved
        ? 'Keyword search and channel watchlists. search.list is capped at 100 calls a day: the default 16 queries run on every scheduled run (48 calls a day); longer query lists rotate across runs.'
        : 'Search results are collected and shown as reported. Trend scoring and AI categorisation of YouTube data need YouTube’s Analytics & Reporting approval (Developer Policies III.L).',
      { docs: ['https://developers.google.com/youtube/v3/docs/search/list', 'https://developers.google.com/youtube/terms/derived-metrics-policy'] },
    ),
    item(
      'public_metrics_over_time',
      !discoveryConfigured ? 'not_configured' : 'limited',
      approved
        ? 'Views, likes and comments re-polled every run with videos.batchGetStats (own 10,000-unit bucket).'
        : 'Re-polled every run, but other channels’ statistics may be stored for at most 30 days (Developer Policies III.E.4.b).',
      { docs: ['https://developers.google.com/youtube/v3/docs/videos/batchGetStats', 'https://developers.google.com/youtube/terms/developer-policies'] },
    ),
    item('creator_sizes', discoveryConfigured ? 'limited' : 'not_configured', 'Subscriber counts, rounded down to three significant figures, and missing for channels that hide them.', {
      docs: ['https://developers.google.com/youtube/v3/docs/channels'],
    }),
    item(
      'comments',
      !discoveryConfigured ? 'not_configured' : approved ? 'available' : 'needs_review',
      approved
        ? 'Top public comments on the fastest-growing videos (1 quota unit per call), used only as AI input and never stored.'
        : 'Read only once derived analytics on YouTube data are approved (they are AI input); until then SPOTTER does not request them.',
      {
      docs: ['https://developers.google.com/youtube/v3/docs/commentThreads/list'],
    }),
    item('transcripts', 'unavailable', 'Captions of other creators’ videos cannot be downloaded: captions.download requires permission to edit the video.', {
      docs: ['https://developers.google.com/youtube/v3/docs/captions/download'],
    }),
    item('audio', 'unavailable', 'The Data API exposes no Shorts sound or music information for any video.', {
      docs: ['https://developers.google.com/youtube/v3/docs/videos'],
    }),
    item('shares_saves', scopeStatus(SCOPE_ANALYTICS, 'limited'), 'Shares only for your own videos (Analytics API). No public share or save counts exist.', {
      docs: ['https://developers.google.com/youtube/analytics/metrics'],
    }),
    item(
      'token_refresh',
      live && !ctx.configured ? 'not_configured' : 'available',
      'Refresh tokens are used automatically. In Google’s “Testing” publishing status they expire after 7 days — publish the OAuth app to avoid weekly reconnects.',
      { docs: ['https://developers.google.com/identity/protocols/oauth2#expiration'] },
    ),
  ]

  const notes = [
    'No official Shorts flag exists; videos are reported with their duration and never classified as Shorts by SPOTTER.',
    'View counting changed on 2025-03-31 (Shorts) and in late August 2026 (all formats); views/hour series may step at those dates.',
  ]
  if (!approved && live) notes.push('Derived analytics on YouTube data are off until YOUTUBE_DERIVED_METRICS_APPROVED=true (after YouTube approves the III.L use case).')
  return {
    platform: 'youtube',
    connectorId: ctx.mode === 'mock' ? 'youtube-demo' : 'youtube-data-api-v3',
    mode: ctx.mode,
    apiName: 'YouTube Data API v3 + YouTube Analytics API v2',
    docsCheckedOn: YOUTUBE_DOCS_CHECKED,
    items,
    notes,
  }
}
