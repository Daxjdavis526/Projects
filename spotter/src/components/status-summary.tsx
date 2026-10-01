import Link from 'next/link'
import { PLATFORM_LABEL } from '@/core/domain/types'
import type { PlatformStatus, WorkspaceStatus } from '@/server/queries/workspace'
import { Card, CardHeader, PlatformDot, StatusBadge, type StatusKind } from '@/components/ui/primitives'
import { dateTime, relativeTime } from '@/lib/format'

export function platformHealth(p: PlatformStatus): { kind: StatusKind; label: string } {
  if (p.state === 'not_connected') return { kind: 'idle', label: 'Not connected' }
  if (p.state === 'needs_reauth') return { kind: 'critical', label: 'Reconnect needed' }
  if (p.state === 'error') return { kind: 'critical', label: 'Error' }
  const h = p.health
  if (!h) return { kind: 'idle', label: 'Waiting for first sync' }
  if (h.status === 'rate_limited') return { kind: 'warning', label: 'Rate limited' }
  if (h.status === 'failing') return { kind: 'critical', label: 'Failing' }
  if (h.status === 'degraded') return { kind: 'warning', label: 'Partly working' }
  if (h.tokenStatus === 'expiring') return { kind: 'warning', label: 'Token expiring' }
  return { kind: 'good', label: 'Healthy' }
}

export function StatusSummary({ status }: { status: WorkspaceStatus }) {
  const now = new Date()
  const tz = status.timezone
  return (
    <Card>
      <CardHeader
        title="Collection"
        subtitle={
          status.lastRun?.finishedAt
            ? `Last run ${relativeTime(status.lastRun.finishedAt, now)} (${status.lastRun.status})${status.nextScheduledAt ? ` · next ${dateTime(status.nextScheduledAt, tz, 'time')}` : ''}`
            : 'No completed run yet'
        }
        action={
          <Link href="/collection" className="text-[13px] font-medium text-accent-text hover:underline">
            Details
          </Link>
        }
      />
      <ul className="flex flex-col px-5 pb-4">
        {status.platforms.map((p) => {
          const h = platformHealth(p)
          return (
            <li key={p.platform} className="flex items-center justify-between gap-3 border-t border-line py-2 first:border-t-0">
              <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink">
                <PlatformDot platform={p.platform} />
                {PLATFORM_LABEL[p.platform]}
                {p.lastSyncAt ? <span className="truncate text-[12px] text-muted">· synced {relativeTime(p.lastSyncAt, now)}</span> : null}
              </span>
              <StatusBadge status={h.kind} title={p.health?.lastFailureReason ?? undefined}>
                {h.label}
              </StatusBadge>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
