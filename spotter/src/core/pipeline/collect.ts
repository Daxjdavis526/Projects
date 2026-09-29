/**
 * Collection: one platform at a time, isolated.
 *
 * For each connected platform: refresh the token if due → profile → own
 * content → own analytics → public discovery → re-poll tracked posts →
 * comments for AI. Every step records ok / unsupported / failed. An auth
 * failure or throttle stops that platform's remaining steps; other errors
 * are recorded and the next step still runs. One platform failing never
 * touches another: platforms run concurrently and each settles on its own.
 */
import { quotaBuckets, createQuotaGate } from '../connectors/quota'
import { isConnectorError, toConnectorError } from '../connectors/errors'
import { createConnector } from '../connectors/registry'
import type { ConnectorContext, ConnectorResult, PlatformConnector } from '../connectors/types'
import { policyFor } from '../compliance/policy'
import type { ConnectorMode, Platform, PlatformRunResult, PlatformStepResult, RateLimitInfo } from '../domain/types'
import { PLATFORMS } from '../domain/types'
import type { RunContext } from './context'
import {
  getHealth,
  listActiveAccounts,
  saveDiscoveryCursor,
  toAccountInfo,
  tokenStatusOf,
  updateAccountProfile,
  upsertHealth,
  type AccountRow,
} from './store/accounts'
import { creatorsNeedingBaseline, markAvailability, mergeOwnerInsights, saveAccountSeries, trackedItems, upsertItems } from './store/content'
import { recordEvent } from './store/events'
import { DbQuotaStore } from './store/quota'
import { ensureFreshCredentials } from './tokens'

const DAY = 86_400_000

export interface CollectionOutput {
  platformResults: Partial<Record<Platform, PlatformRunResult>>
  /** Top comments per content item id, for AI analysis in this run only. Never stored. */
  comments: Map<string, string[]>
}

class StopPlatform extends Error {}

interface Target {
  platform: Platform
  mode: ConnectorMode
  account: AccountRow | null
}

/** Which platforms to collect this run: connected accounts, plus YouTube public discovery by API key. */
export async function collectionTargets(rc: RunContext): Promise<Target[]> {
  const mode: ConnectorMode = rc.dataMode === 'demo' ? 'mock' : 'live'
  const accounts = (await listActiveAccounts(rc.db, rc.profile.id, mode)).filter((a) => a.status !== 'disconnected')
  const targets: Target[] = accounts.map((account) => ({ platform: account.platform, mode, account }))
  if (mode === 'live' && rc.env.YOUTUBE_API_KEY && !targets.some((t) => t.platform === 'youtube')) {
    targets.push({ platform: 'youtube', mode, account: null })
  }
  return targets.sort((a, b) => PLATFORMS.indexOf(a.platform) - PLATFORMS.indexOf(b.platform))
}

function backoffMs(consecutiveFailures: number): number {
  return Math.min(6 * 3_600_000, 15 * 60_000 * 2 ** Math.max(0, consecutiveFailures - 1))
}

export async function collectPlatform(rc: RunContext, target: Target, output: CollectionOutput, useQuotaReserve: boolean): Promise<PlatformRunResult> {
  const startedAt = rc.now
  const steps: PlatformStepResult[] = []
  const origin = rc.dataMode === 'demo' ? 'demo' : 'live'
  const logger = rc.logger.child({ platform: target.platform })
  let itemsUpserted = 0
  let snapshotsWritten = 0
  let rateLimit: RateLimitInfo | null = null
  let fatal: { kind: string; message: string } | null = null
  const connector: PlatformConnector = createConnector(target.platform, target.mode, { env: rc.env, clock: rc.clock, world: rc.world })
  const quota = createQuotaGate({
    store: new DbQuotaStore(rc.db, target.mode === 'mock' ? 'demo:' : ''),
    buckets: quotaBuckets(rc.env),
    reserveFraction: rc.env.YOUTUBE_QUOTA_RESERVE_FRACTION,
    useReserve: useQuotaReserve,
    now: rc.clock,
  })
  const previous = await getHealth(rc.db, rc.profile.id, target.platform, target.mode)
  const policy = policyFor(target.platform, rc.env, rc.dataMode)

  const ctx: ConnectorContext = {
    now: rc.now,
    logger,
    settings: rc.settings,
    credentials: null,
    account: target.account ? toAccountInfo(target.account) : null,
    quota,
    cursor: target.account?.discoveryCursor ?? null,
  }

  const step = async <T>(name: string, fn: () => Promise<ConnectorResult<T>>, onOk: (data: T) => Promise<number | void>): Promise<void> => {
    try {
      const result = await fn()
      if (result.status === 'unsupported') {
        steps.push({ name, status: 'unsupported', detail: result.reason })
        return
      }
      if (result.rateLimit) rateLimit = result.rateLimit
      const count = await onOk(result.data)
      steps.push({ name, status: 'ok', items: typeof count === 'number' ? count : undefined, detail: result.warnings.length ? result.warnings.slice(0, 3).join(' · ') : undefined })
    } catch (err) {
      const e = toConnectorError(err, target.platform, name)
      steps.push({ name, status: 'failed', errorKind: e.kind, detail: e.message })
      logger.warn('Collection step failed', { step: name, kind: e.kind, error: e })
      if (e.isAuthProblem || e.kind === 'rate_limited' || e.kind === 'quota_exceeded' || e.kind === 'not_configured') {
        fatal = { kind: e.kind, message: e.message }
        throw new StopPlatform()
      }
    }
  }

  try {
    // 1. Credentials.
    if (target.account) {
      const fresh = await ensureFreshCredentials(rc, connector, target.account)
      if (fresh.status === 'ok') {
        ctx.credentials = fresh.credentials
        steps.push({ name: 'token', status: 'ok', detail: fresh.refreshed ? 'refreshed' : 'valid' })
      } else if (fresh.status === 'missing') {
        steps.push({ name: 'token', status: 'failed', errorKind: 'auth_required', detail: 'No stored credentials; reconnect.' })
        fatal = { kind: 'auth_required', message: 'No stored credentials; reconnect.' }
        throw new StopPlatform()
      } else {
        steps.push({ name: 'token', status: 'failed', errorKind: fresh.kind, detail: fresh.message })
        fatal = { kind: fresh.kind, message: fresh.message }
        throw new StopPlatform()
      }
    }

    // 2–4. The creator's own account and content.
    if (target.account && ctx.credentials) {
      await step('profile', () => connector.getCreatorProfile(ctx), async (profile) => {
        await updateAccountProfile(rc.db, target.account!.id, profile, rc.now)
        ctx.account = { ...ctx.account!, followerCount: profile.followerCount, username: profile.username ?? ctx.account!.username }
      })
      const firstSync = !target.account.lastSyncAt
      const since = new Date(rc.now.getTime() - (firstSync ? 180 : 60) * DAY)
      const ownIds: Array<{ externalId: string; publishedAt: Date | null }> = []
      await step('own_content', () => connector.getCreatorContent(ctx, { since, maxItems: 300 }), async (items) => {
        for (const item of items) {
          item.creatorFollowerCount ??= ctx.account?.followerCount ?? null
          item.creatorId ??= ctx.account?.externalAccountId ?? null
          ownIds.push({ externalId: item.externalId, publishedAt: item.createdAt })
        }
        const ids = await upsertItems(rc.db, target.platform, items, { origin, isOwn: true, runId: rc.runId, now: rc.now, platformAccountId: target.account!.id, metadataFresh: true })
        itemsUpserted += ids.size
        snapshotsWritten += items.length
        return ids.size
      })
      const recentOwn = ownIds.filter((i) => !i.publishedAt || i.publishedAt.getTime() > rc.now.getTime() - 90 * DAY)
      if (recentOwn.length) {
        await step('own_analytics', () => connector.getCreatorAnalytics(ctx, { items: recentOwn, since }), async (data) => {
          await saveAccountSeries(rc.db, target.account!.id, origin, data.accountSeries, rc.now)
          return mergeOwnerInsights(rc.db, target.platform, origin, rc.runId, rc.now, data.items)
        })
      }
    }

    // 5. Public discovery.
    const baselineCreators = await creatorsNeedingBaseline(rc.db, target.platform, origin, rc.now)
    const discovered: Array<{ id: string; vph: number }> = []
    await step(
      'discovery',
      () => connector.getPublicDiscoveryCandidates(ctx, { maxItems: 1_000, baselineCreators }),
      async (batch) => {
        const ids = await upsertItems(rc.db, target.platform, batch.items, { origin, isOwn: false, runId: rc.runId, now: rc.now, metadataFresh: true })
        if (target.account && batch.cursor) await saveDiscoveryCursor(rc.db, target.account.id, batch.cursor)
        itemsUpserted += ids.size
        snapshotsWritten += batch.items.length
        for (const item of batch.items) {
          const id = ids.get(item.externalId)
          const age = item.createdAt ? Math.max(1, (rc.now.getTime() - item.createdAt.getTime()) / 3_600_000) : null
          if (id && item.viewCount !== null && age) discovered.push({ id: item.externalId, vph: item.viewCount / age })
        }
        return ids.size
      },
    )

    // 6. Re-poll recently discovered posts to extend their time series.
    const tracked = await trackedItems(rc.db, target.platform, origin, new Date(rc.now.getTime() - rc.settings.discovery.youtube.trackDays * DAY), rc.now, 1500)
    if (tracked.length) {
      await step('refresh_tracked', () => connector.refreshPublicMetrics(ctx, tracked), async (items) => {
        await upsertItems(rc.db, target.platform, items, { origin, isOwn: false, runId: rc.runId, now: rc.now, metadataFresh: false })
        snapshotsWritten += items.length
        const returned = new Set(items.map((i) => i.externalId))
        const missing = tracked.filter((id) => !returned.has(id))
        if (missing.length) await markAvailability(rc.db, target.platform, origin, missing, 'unavailable', rc.now)
        return items.length
      })
    }

    // 7. Comments on the fastest posts, as AI input (only where derived analytics are allowed).
    if (connector.getTopComments && policy.derivedAnalyticsOnPublicData && discovered.length) {
      const top = discovered.sort((a, b) => b.vph - a.vph).slice(0, 8)
      let fetched = 0
      for (const d of top) {
        try {
          const res = await connector.getTopComments(ctx, d.id, 20)
          if (res.status === 'ok' && res.data.length) {
            output.comments.set(`${target.platform}:${d.id}`, res.data)
            fetched++
          }
        } catch (err) {
          if (isConnectorError(err) && (err.kind === 'quota_exceeded' || err.kind === 'rate_limited')) break
        }
      }
      steps.push({ name: 'comments', status: 'ok', items: fetched })
    }
  } catch (err) {
    if (!(err instanceof StopPlatform)) {
      const e = toConnectorError(err, target.platform, 'collect')
      fatal = { kind: e.kind, message: e.message }
      steps.push({ name: 'unexpected', status: 'failed', errorKind: e.kind, detail: e.message })
      logger.error('Collection failed unexpectedly', { error: e })
    }
  }

  const failed = steps.filter((s) => s.status === 'failed')
  const okSteps = steps.filter((s) => s.status === 'ok' && s.name !== 'token')
  const status: PlatformRunResult['status'] = fatal && okSteps.length === 0 ? 'failed' : failed.length ? 'partial' : 'succeeded'

  // Health: success resets the backoff; failures grow it exponentially.
  rateLimit ??= await quota.snapshot(target.platform)
  const f = fatal as { kind: string; message: string } | null
  const consecutive = status === 'succeeded' ? 0 : (previous?.consecutiveFailures ?? 0) + 1
  const creds = ctx.credentials
  await upsertHealth(
    rc.db,
    rc.profile.id,
    target.platform,
    target.mode,
    {
      status:
        f && ['auth_required', 'auth_expired', 'auth_revoked', 'scope_missing'].includes(f.kind)
          ? 'auth_required'
          : f && (f.kind === 'rate_limited' || f.kind === 'quota_exceeded')
            ? 'rate_limited'
            : status === 'succeeded'
              ? 'healthy'
              : status === 'partial'
                ? 'degraded'
                : 'failing',
      tokenStatus: target.account ? (f && ['auth_expired', 'auth_revoked'].includes(f.kind) ? 'expired' : tokenStatusOf(creds, rc.now)) : 'not_applicable',
      lastAttemptAt: rc.now,
      ...(status !== 'failed' ? { lastSuccessAt: rc.now } : {}),
      ...(failed.length
        ? { lastFailureAt: rc.now, lastFailureKind: f?.kind ?? failed[0]!.errorKind ?? 'unknown', lastFailureReason: f?.message ?? failed[0]!.detail ?? null }
        : {}),
      consecutiveFailures: consecutive,
      backoffUntil: status === 'succeeded' ? null : new Date(rc.now.getTime() + backoffMs(consecutive)),
      rateLimit,
    },
    rc.now,
  )
  if (status !== 'succeeded') {
    await recordEvent(rc.db, {
      profileId: rc.profile.id,
      level: status === 'failed' ? 'error' : 'warn',
      category: 'collection',
      platform: target.platform,
      message: `${target.platform} collection ${status}: ${f?.message ?? failed.map((s) => `${s.name}: ${s.detail}`).join('; ')}`,
      context: { steps },
      at: rc.now,
    })
  }
  return {
    status,
    startedAt: startedAt.toISOString(),
    finishedAt: rc.clock().toISOString(),
    itemsUpserted,
    snapshotsWritten,
    steps,
    ...(f ? { error: { kind: f.kind, message: f.message } } : {}),
  }
}

/** Collect every target concurrently; one platform's failure never affects another. */
export async function runCollectionStage(rc: RunContext, options: { useQuotaReserve: boolean; skipBackoff?: boolean }): Promise<CollectionOutput> {
  const output: CollectionOutput = { platformResults: {}, comments: new Map() }
  const targets = await collectionTargets(rc)
  const settled = await Promise.allSettled(
    targets.map(async (target) => {
      const health = await getHealth(rc.db, rc.profile.id, target.platform, target.mode)
      if (!options.skipBackoff && health?.backoffUntil && health.backoffUntil > rc.now && rc.trigger === 'schedule') {
        const result: PlatformRunResult = {
          status: 'skipped',
          startedAt: rc.now.toISOString(),
          finishedAt: rc.now.toISOString(),
          itemsUpserted: 0,
          snapshotsWritten: 0,
          steps: [{ name: 'backoff', status: 'skipped', detail: `Backing off after failures until ${health.backoffUntil.toISOString()}` }],
        }
        return [target.platform, result] as const
      }
      return [target.platform, await collectPlatform(rc, target, output, options.useQuotaReserve)] as const
    }),
  )
  for (const s of settled) {
    if (s.status === 'fulfilled') output.platformResults[s.value[0]] = s.value[1]
    else rc.logger.error('Platform collection crashed', { error: s.reason })
  }
  return output
}
