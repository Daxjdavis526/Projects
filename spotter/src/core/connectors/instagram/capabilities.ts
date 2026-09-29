/**
 * What the Instagram connector can do, by auth path, configuration and
 * granted permissions (Instagram Platform docs, checked 2026-09-29).
 */
import { CAPABILITY_LABEL, type CapabilityContext, type CapabilityItem, type CapabilityReport, type CapabilityStatus } from '../types'

export const INSTAGRAM_DOCS_CHECKED = '2026-09-29'
const DOCS = 'https://developers.facebook.com/documentation/instagram-platform'

export function instagramCapabilities(ctx: CapabilityContext): CapabilityReport {
  const fb = ctx.options?.authMode === 'facebook_login'
  const live = ctx.mode === 'live'
  const granted = new Set(ctx.grantedScopes)
  const basicScope = fb ? 'instagram_basic' : 'instagram_business_basic'
  const insightsScope = fb ? 'instagram_manage_insights' : 'instagram_business_manage_insights'
  const gate = (scope: string, fallback: CapabilityStatus): CapabilityStatus => {
    if (live && !ctx.configured) return 'not_configured'
    if (ctx.connected && !granted.has(scope)) return 'needs_permission'
    return fallback
  }
  const hashtagBlocked = ctx.options?.hashtagSearchBlocked === true
  const item = (key: CapabilityItem['key'], status: CapabilityStatus, summary: string, extra: Partial<CapabilityItem> = {}): CapabilityItem => ({
    key,
    label: CAPABILITY_LABEL[key],
    status,
    summary,
    ...extra,
  })

  const items: CapabilityItem[] = [
    item('own_profile', gate(basicScope, 'available'), 'Username, followers, following and post count of your professional account.', {
      scopes: [basicScope],
      docs: [`${DOCS}/instagram-graph-api/reference/ig-user`],
    }),
    item('own_content', gate(basicScope, 'available'), 'Your posts and Reels with caption, timestamp, permalink, likes, comments and audio type (licensed music vs original sound).', {
      scopes: [basicScope],
      docs: [`${DOCS}/instagram-graph-api/reference/ig-user/media`],
    }),
    item(
      'own_analytics',
      gate(insightsScope, 'available'),
      'Per-post views, reach, likes, comments, shares, saves and Reels watch time; daily account reach. Lifetime totals, up to 48 hours delayed.',
      { scopes: [insightsScope], docs: [`${DOCS}/reference/instagram-media/insights`] },
    ),
    fb
      ? item(
          'public_discovery',
          live && !ctx.configured ? 'not_configured' : 'limited',
          hashtagBlocked
            ? 'Business Discovery of a watchlist of professional accounts works. Hashtag Search is not approved for this app yet (needs App Review for Instagram Public Content Access and Business Verification).'
            : 'Business Discovery of a watchlist of professional accounts (exact usernames only), plus Hashtag Search (top posts, no authors or views; 30 hashtags per rolling 7 days; requires App Review).',
          { scopes: ['instagram_basic', 'instagram_manage_insights', 'pages_read_engagement'], docs: [`${DOCS}/instagram-api-with-facebook-login/business-discovery`, `${DOCS}/instagram-api-with-facebook-login/hashtag-search`] },
        )
      : item(
          'public_discovery',
          'unavailable',
          'Instagram Login cannot search or read other accounts (only posts that tag or mention you, which SPOTTER does not use). Switch to the Facebook Login path (requires a Facebook Page linked to the account) for Business Discovery and Hashtag Search.',
          { docs: [`${DOCS}/overview`] },
        ),
    item(
      'public_metrics_over_time',
      fb ? (live && !ctx.configured ? 'not_configured' : 'limited') : 'unavailable',
      fb
        ? 'Watchlist accounts’ recent posts are re-read each run (likes, comments, Reels views incl. paid). Hashtag results cannot be re-polled.'
        : 'Not available with Instagram Login.',
    ),
    item(
      'creator_sizes',
      fb ? (live && !ctx.configured ? 'not_configured' : 'limited') : 'unavailable',
      fb ? 'Follower counts for watchlist accounts only; hashtag results never identify the author.' : 'Not available with Instagram Login.',
    ),
    item(
      'comments',
      'not_implemented',
      'The API can return comments on your own posts with a comment-management permission. SPOTTER does not ask for it, so no comment text is read.',
    ),
    item('transcripts', 'unavailable', 'No transcript or caption-track API is documented for Instagram media.'),
    item(
      'audio',
      'limited',
      'Only the audio type (licensed music or original sound) per Reel. No API reveals which track an existing Reel uses.',
      { docs: [`${DOCS}/reference/instagram-media`] },
    ),
    item('shares_saves', gate(insightsScope, 'limited'), 'Shares and saves for your own posts via insights. Never for other accounts.'),
    item(
      'token_refresh',
      live && !ctx.configured ? 'not_configured' : 'available',
      fb
        ? 'Long-lived tokens last about 60 days. SPOTTER tries to extend them a week before expiry, but Meta documents only the short-to-long exchange, so plan to reconnect about every 60 days. Data access also lapses after 90 days of inactivity.'
        : 'Long-lived tokens (60 days) are refreshed automatically a week before expiry (only once they are 24 hours old).',
    ),
  ]
  const notes = [
    fb ? 'Auth path: Facebook Login for Business (graph.facebook.com).' : 'Auth path: Instagram Login (graph.instagram.com).',
    'Personal (non-professional) Instagram accounts are never accessible.',
    'media_url is omitted for video with copyrighted or licensed audio, copyright-flagged media and other accounts’ Reels with downloads turned off; the thumbnail then comes from thumbnail_url (images use media_url).',
  ]
  return {
    platform: 'instagram',
    connectorId: ctx.mode === 'mock' ? 'instagram-demo' : `instagram-${fb ? 'facebook_login' : 'instagram_login'}`,
    mode: ctx.mode,
    apiName: fb ? 'Instagram API with Facebook Login (Graph API v26.0)' : 'Instagram API with Instagram Login (Graph API v26.0)',
    docsCheckedOn: INSTAGRAM_DOCS_CHECKED,
    items,
    notes,
  }
}
