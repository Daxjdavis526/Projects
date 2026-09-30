/**
 * Connections page data: each platform's connection, token health (metadata
 * only), granted permissions and the capability report from its connector.
 */
import 'server-only'
import { and, eq } from 'drizzle-orm'
import { getEnv } from '@/core/config/env'
import { createConnector } from '@/core/connectors/registry'
import type { CapabilityReport } from '@/core/connectors/types'
import { getDb } from '@/core/db/client'
import { platformAccounts } from '@/core/db/schema'
import { PLATFORMS, type Platform } from '@/core/domain/types'
import { worldFor } from '@/core/pipeline/context'
import type { Profile } from '../auth/session'
import { getWorkspaceStatus, type PlatformStatus } from './workspace'

export interface ConnectionView {
  status: PlatformStatus
  capabilities: CapabilityReport
  /** Server settings missing for the live connector (names only, never values). */
  missingConfiguration: string[]
  requestedScopes: string[]
  usesPkce: boolean
  authVariant: string
}

export async function getConnections(profile: Profile): Promise<ConnectionView[]> {
  const env = getEnv()
  const status = await getWorkspaceStatus(profile)
  const world = worldFor(profile)
  const now = new Date()
  // Discovery remembers when Meta refused Hashtag Search (not approved yet); the report should say so.
  const db = await getDb()
  const cursors = await db
    .select({ platform: platformAccounts.platform, cursor: platformAccounts.discoveryCursor })
    .from(platformAccounts)
    .where(and(eq(platformAccounts.creatorProfileId, profile.id), eq(platformAccounts.mode, profile.dataMode === 'demo' ? 'mock' : 'live')))
  const igCursor = cursors.find((c) => c.platform === 'instagram')?.cursor as { hashtagSearchBlockedUntil?: string | null } | null | undefined
  const hashtagSearchBlocked = !!igCursor?.hashtagSearchBlockedUntil && new Date(igCursor.hashtagSearchBlockedUntil) > now
  return PLATFORMS.map((platform: Platform) => {
    const s = status.platforms.find((p) => p.platform === platform)!
    const mode = status.mode
    const live = createConnector(platform, 'live', { env, clock: () => new Date() })
    // A demo workspace whose world is not prepared yet describes the live connector.
    const connector = mode === 'mock' && world ? createConnector(platform, 'mock', { env, clock: () => new Date(), world }) : live
    const missing = live.auth.missingConfiguration()
    return {
      status: s,
      capabilities: connector.capabilities({
        mode,
        configured: mode === 'mock' ? true : missing.length === 0,
        connected: s.state !== 'not_connected',
        grantedScopes: s.grantedScopes,
        options: { instagramAuthMode: env.INSTAGRAM_AUTH_MODE, hasApiKey: !!env.YOUTUBE_API_KEY, derivedApproved: env.YOUTUBE_DERIVED_METRICS_APPROVED, hashtagSearchBlocked },
      }),
      missingConfiguration: missing,
      requestedScopes: connector.auth.requestedScopes,
      usesPkce: connector.auth.usesPkce,
      authVariant: connector.auth.authVariant,
    }
  })
}
