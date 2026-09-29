/**
 * Platform data policies, as code.
 *
 * Each platform's terms constrain how long its data may be stored and what
 * may be computed from it. This module turns the rules found in the official
 * documents (see CAPABILITIES.md for quotes and links) into values the
 * pipeline enforces: the retention job, the analysis filter, and the
 * deletion that follows a disconnect.
 *
 * Demo data is synthetic, not platform data, so none of these limits apply
 * to it; the demo shows the product as it behaves once approvals are granted.
 */
import type { Env } from '../config/env'
import type { DataMode, Platform } from '../domain/types'

export interface PlatformDataPolicy {
  platform: Platform
  /** May AI categorisation, clustering and custom scores use other creators' data from this platform? */
  derivedAnalyticsOnPublicData: boolean
  /** Same, for the creator's own (authorized) data. */
  derivedAnalyticsOnOwnData: boolean
  /** Shown in the UI when derived analytics are restricted. */
  restrictionNote: string | null
  /** Delete other creators' metric snapshots older than this many days (null = no platform limit). */
  publicStatsRetentionDays: number | null
  /** Delete other creators' content (and metadata) not refreshed within this many days. */
  publicMetadataRefreshDays: number | null
  /** Re-verify that authorization is still valid at least this often. */
  authorizationRecheckDays: number | null
  /** Delete the creator's authorized data within this many days after access is revoked. */
  deleteAfterRevocationDays: number
  /** Required source attribution wherever the data is shown. */
  attribution: string
  /** Links shown next to the data (terms, policies). */
  attributionLinks: Array<{ label: string; href: string }>
}

/** How long, in days, our own storage policy keeps anything when a platform sets no limit. */
export const APP_DEFAULT_RETENTION_DAYS = 400

export function policyFor(platform: Platform, env: Pick<Env, 'YOUTUBE_DERIVED_METRICS_APPROVED'>, mode: DataMode): PlatformDataPolicy {
  if (mode === 'demo') {
    return {
      platform,
      derivedAnalyticsOnPublicData: true,
      derivedAnalyticsOnOwnData: true,
      restrictionNote: null,
      publicStatsRetentionDays: null,
      publicMetadataRefreshDays: null,
      authorizationRecheckDays: null,
      deleteAfterRevocationDays: 0,
      attribution: 'Simulated demo data',
      attributionLinks: [],
    }
  }
  switch (platform) {
    case 'youtube': {
      const approved = env.YOUTUBE_DERIVED_METRICS_APPROVED
      return {
        platform,
        // YouTube API Services Developer Policies III.E.4.h prohibit derived
        // metrics (including custom scores and content categorisation) unless
        // the project is approved for the Analytics & Reporting use case (III.L).
        derivedAnalyticsOnPublicData: approved,
        derivedAnalyticsOnOwnData: approved,
        restrictionNote: approved
          ? null
          : 'YouTube data is shown as reported by YouTube. Trend scoring, AI categorisation and personalisation of YouTube data stay off until your Google Cloud project is approved for YouTube’s Analytics & Reporting use case (Developer Policies III.L), then set YOUTUBE_DERIVED_METRICS_APPROVED=true.',
        // III.E.4.b: Non-Authorized statistics ≤ 30 days; the III.L amendment allows 36 months.
        publicStatsRetentionDays: approved ? 36 * 30 : 30,
        // III.E.4.d: other Non-Authorized data must be refreshed or deleted within 30 days.
        publicMetadataRefreshDays: 30,
        // III.E.4.b: re-check authorization (and that videos still exist) every 30 days.
        authorizationRecheckDays: 30,
        // III.D.2.c.i: delete within 7 days of an in-app revocation.
        deleteAfterRevocationDays: 7,
        attribution: 'Data from YouTube',
        attributionLinks: [
          { label: 'YouTube Terms of Service', href: 'https://www.youtube.com/t/terms' },
          { label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy' },
        ],
      }
    }
    case 'instagram':
      return {
        platform,
        derivedAnalyticsOnPublicData: true,
        derivedAnalyticsOnOwnData: true,
        restrictionNote: null,
        // Meta sets no fixed window; Platform Terms §3.d require deletion when no
        // longer necessary and on request. Our own default applies.
        publicStatsRetentionDays: APP_DEFAULT_RETENTION_DAYS,
        publicMetadataRefreshDays: null,
        authorizationRecheckDays: null,
        deleteAfterRevocationDays: 0,
        attribution: 'Data from Instagram',
        attributionLinks: [{ label: 'Meta Platform Terms', href: 'https://developers.facebook.com/terms' }],
      }
    case 'tiktok':
      return {
        platform,
        // Only the creator's own videos are available; TikTok offers no public discovery.
        derivedAnalyticsOnPublicData: false,
        derivedAnalyticsOnOwnData: true,
        restrictionNote:
          'TikTok’s Developer Terms (§III.3(c), (h)) restrict commercial use and building databases of content. SPOTTER stores only the creator’s own video metrics and deletes them on disconnect; have the terms reviewed before commercial use.',
        publicStatsRetentionDays: null,
        publicMetadataRefreshDays: null,
        authorizationRecheckDays: null,
        deleteAfterRevocationDays: 0,
        attribution: 'Data from TikTok',
        attributionLinks: [
          { label: 'TikTok Developer Terms', href: 'https://www.tiktok.com/legal/page/global/tik-tok-developer-terms-of-service/en' },
        ],
      }
  }
}

/** Platforms whose data may feed derived analytics, split by own vs third-party content. */
export function analyzablePlatforms(
  env: Pick<Env, 'YOUTUBE_DERIVED_METRICS_APPROVED'>,
  mode: DataMode,
): { own: Set<Platform>; public: Set<Platform> } {
  const own = new Set<Platform>()
  const pub = new Set<Platform>()
  for (const p of ['youtube', 'instagram', 'tiktok'] as const) {
    const policy = policyFor(p, env, mode)
    if (policy.derivedAnalyticsOnOwnData) own.add(p)
    if (policy.derivedAnalyticsOnPublicData) pub.add(p)
  }
  return { own, public: pub }
}
