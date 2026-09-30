/**
 * Workspace-wide status: data mode, connections, connector health, runs.
 * Used by the app shell and several pages.
 */
import 'server-only'
import { cache } from 'react'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { parseSettings, type AppSettings } from '@/core/config/settings'
import { getDb } from '@/core/db/client'
import { collectionRuns, oauthCredentials, platformAccounts, platformConnectorHealth } from '@/core/db/schema'
import type { ConnectorMode, Platform } from '@/core/domain/types'
import { PLATFORMS } from '@/core/domain/types'
import { nextSlot } from '@/core/pipeline/scheduler'
import type { Profile } from '../auth/session'

export type ConnectionState = 'connected' | 'needs_reauth' | 'error' | 'not_connected'

export interface PlatformStatus {
  platform: Platform
  mode: ConnectorMode
  state: ConnectionState
  accountId: string | null
  username: string | null
  displayName: string | null
  profileUrl: string | null
  followerCount: number | null
  grantedScopes: string[]
  connectedAt: Date | null
  lastSyncAt: Date | null
  health: {
    status: string
    tokenStatus: string
    lastSuccessAt: Date | null
    lastFailureAt: Date | null
    lastFailureKind: string | null
    lastFailureReason: string | null
    consecutiveFailures: number
    backoffUntil: Date | null
    rateLimit: unknown
  } | null
  token: { accessTokenExpiresAt: Date | null; refreshTokenExpiresAt: Date | null; lastRefreshedAt: Date | null; refreshFailures: number; hasRefreshToken: boolean } | null
}

export interface RunSummary {
  id: string
  trigger: string
  status: string
  requestedAt: Date
  startedAt: Date | null
  finishedAt: Date | null
  clockAt: Date | null
  error: string | null
}

export interface WorkspaceStatus {
  profileId: string
  dataMode: 'demo' | 'live'
  mode: ConnectorMode
  timezone: string
  settings: AppSettings
  platforms: PlatformStatus[]
  connectedCount: number
  lastRun: RunSummary | null
  activeRun: RunSummary | null
  demoSetup: RunSummary | null
  nextScheduledAt: Date | null
}

export const getWorkspaceStatus = cache(async (profile: Profile): Promise<WorkspaceStatus> => {
  const db = await getDb()
  const mode: ConnectorMode = profile.dataMode === 'demo' ? 'mock' : 'live'
  const settings = parseSettings(profile.settings)
  const [accounts, health, runs] = await Promise.all([
    db
      .select({ account: platformAccounts, token: oauthCredentials })
      .from(platformAccounts)
      .leftJoin(oauthCredentials, eq(oauthCredentials.platformAccountId, platformAccounts.id))
      .where(and(eq(platformAccounts.creatorProfileId, profile.id), eq(platformAccounts.mode, mode))),
    db
      .select()
      .from(platformConnectorHealth)
      .where(and(eq(platformConnectorHealth.creatorProfileId, profile.id), eq(platformConnectorHealth.mode, mode))),
    db
      .select({
        id: collectionRuns.id,
        trigger: collectionRuns.trigger,
        status: collectionRuns.status,
        requestedAt: collectionRuns.requestedAt,
        startedAt: collectionRuns.startedAt,
        finishedAt: collectionRuns.finishedAt,
        clockAt: collectionRuns.clockAt,
        error: collectionRuns.error,
      })
      .from(collectionRuns)
      .where(and(eq(collectionRuns.creatorProfileId, profile.id), eq(collectionRuns.dataMode, profile.dataMode), inArray(collectionRuns.trigger, ['schedule', 'manual', 'setup', 'cli', 'demo_setup'])))
      .orderBy(desc(collectionRuns.requestedAt))
      .limit(20),
  ])

  const platforms: PlatformStatus[] = PLATFORMS.map((platform) => {
    const row = accounts.find((a) => a.account.platform === platform)
    const h = health.find((x) => x.platform === platform) ?? null
    const account = row?.account
    const connected = account && account.status !== 'disconnected'
    const state: ConnectionState = !connected
      ? 'not_connected'
      : account.status === 'needs_reauth' || h?.status === 'auth_required'
        ? 'needs_reauth'
        : account.status === 'error'
          ? 'error'
          : 'connected'
    return {
      platform,
      mode,
      state,
      accountId: connected ? account.id : null,
      username: connected ? account.username : null,
      displayName: connected ? account.displayName : null,
      profileUrl: connected ? account.profileUrl : null,
      followerCount: connected ? account.followerCount : null,
      grantedScopes: connected ? account.grantedScopes : [],
      connectedAt: connected ? account.connectedAt : null,
      lastSyncAt: connected ? account.lastSyncAt : null,
      health: h
        ? {
            status: h.status,
            tokenStatus: h.tokenStatus,
            lastSuccessAt: h.lastSuccessAt,
            lastFailureAt: h.lastFailureAt,
            lastFailureKind: h.lastFailureKind,
            lastFailureReason: h.lastFailureReason,
            consecutiveFailures: h.consecutiveFailures,
            backoffUntil: h.backoffUntil,
            rateLimit: h.rateLimit,
          }
        : null,
      // Token *metadata* only. The tokens themselves never leave the server-side store.
      token:
        connected && row?.token
          ? {
              accessTokenExpiresAt: row.token.accessTokenExpiresAt,
              refreshTokenExpiresAt: row.token.refreshTokenExpiresAt,
              lastRefreshedAt: row.token.lastRefreshedAt,
              refreshFailures: row.token.refreshFailures,
              hasRefreshToken: !!row.token.refreshTokenEnc,
            }
          : null,
    }
  })

  const isJob = (r: RunSummary) => r.trigger === 'demo_setup'
  const active = runs.find((r) => (r.status === 'queued' || r.status === 'running') && !isJob(r)) ?? null
  const demoSetup = runs.find((r) => isJob(r)) ?? null
  const lastRun = runs.find((r) => r.finishedAt && !isJob(r)) ?? null
  return {
    profileId: profile.id,
    dataMode: profile.dataMode,
    mode,
    timezone: profile.timezone,
    settings,
    platforms,
    connectedCount: platforms.filter((p) => p.state !== 'not_connected').length,
    lastRun,
    activeRun: active,
    demoSetup,
    nextScheduledAt: nextSlot(settings, profile.timezone, new Date()),
  }
})
