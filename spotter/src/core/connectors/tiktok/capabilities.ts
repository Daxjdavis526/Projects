/**
 * What the TikTok connector can do (Login Kit + Display API, docs checked 2026-09-29).
 */
import { CAPABILITY_LABEL, type CapabilityContext, type CapabilityItem, type CapabilityReport, type CapabilityStatus } from '../types'

export const TIKTOK_DOCS_CHECKED = '2026-09-29'
const DOCS = 'https://developers.tiktok.com/doc'

export function tiktokCapabilities(ctx: CapabilityContext): CapabilityReport {
  const live = ctx.mode === 'live'
  const granted = new Set(ctx.grantedScopes)
  const gate = (scope: string, fallback: CapabilityStatus): CapabilityStatus => {
    if (live && !ctx.configured) return 'not_configured'
    if (ctx.connected && !granted.has(scope)) return 'needs_permission'
    // TikTok's FAQ: no API access until the app is approved — except for Sandbox target users.
    if (live && !ctx.connected) return 'needs_review'
    return fallback
  }
  const item = (key: CapabilityItem['key'], status: CapabilityStatus, summary: string, extra: Partial<CapabilityItem> = {}): CapabilityItem => ({
    key,
    label: CAPABILITY_LABEL[key],
    status,
    summary,
    ...extra,
  })
  const items: CapabilityItem[] = [
    item('own_profile', gate('user.info.basic', 'available'), 'Display name and avatar; username and bio with user.info.profile; followers, likes and video count with user.info.stats.', {
      scopes: ['user.info.basic', 'user.info.profile', 'user.info.stats'],
      docs: [`${DOCS}/tiktok-api-v2-get-user-info`],
    }),
    item('own_content', gate('video.list', 'available'), 'Your public videos with description, duration, publish time and view, like, comment and share counts.', {
      scopes: ['video.list'],
      docs: [`${DOCS}/tiktok-api-v2-video-list`],
    }),
    item(
      'own_analytics',
      'unavailable',
      'No private analytics in the Display API. Watch time, reach, saves and audience data need the TikTok API for Business Accounts API (company developer account).',
    ),
    item(
      'public_discovery',
      'unavailable',
      'No official API lets a commercial app list other creators’ videos. Research API: non-commercial researchers only. The API for Business Discovery API offers hashtag-level trends to companies with an ad account (not implemented in V1).',
      { docs: [`${DOCS}/research-api-faq`, 'https://business-api.tiktok.com/portal/docs?id=1825127469285442'] },
    ),
    item('public_metrics_over_time', 'unavailable', 'Only your own videos can be re-polled.'),
    item('creator_sizes', 'unavailable', 'Other creators’ follower counts are not available.'),
    item('comments', 'unavailable', 'The Display API has no comments endpoint.'),
    item('transcripts', 'unavailable', 'No transcript or caption text beyond the 150-character description.'),
    item('audio', 'unavailable', 'The Display API video object has no sound or music field.'),
    item('shares_saves', gate('video.list', 'limited'), 'Share counts for your own videos. No save/favourite counts.'),
    item(
      'token_refresh',
      live && !ctx.configured ? 'not_configured' : 'available',
      'Access tokens (24 h) refresh automatically; rotated refresh tokens are stored. Refresh tokens are documented to last 365 days, and it is not documented whether refreshing extends that, so expect to reconnect yearly.',
      { docs: [`${DOCS}/oauth-user-access-token-management`] },
    ),
  ]
  return {
    platform: 'tiktok',
    connectorId: ctx.mode === 'mock' ? 'tiktok-demo' : 'tiktok-display-api-v2',
    mode: ctx.mode,
    apiName: 'TikTok Login Kit for Web + Display API v2',
    docsCheckedOn: TIKTOK_DOCS_CHECKED,
    items,
    notes: [
      'Until TikTok approves the app, only Sandbox target users (up to 10) can connect; approval is required for any other account.',
      'TikTok’s app review guidelines say apps “must not be for private or personal use”: plan for this before submitting.',
      'Redirect URIs must be absolute https URLs registered exactly (no query string).',
    ],
  }
}
