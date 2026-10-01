import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PLATFORM_LABEL, PLATFORMS, type Platform } from '@/core/domain/types'
import { requireProfile } from '@/server/auth/session'
import { getCollection, type RunRow } from '@/server/queries/collection'
import { getWorkspaceStatus } from '@/server/queries/workspace'
import { Badge, Card, CardHeader, EmptyState, KeyValues, PageHeader, PlatformDot, StatusBadge, type StatusKind } from '@/components/ui/primitives'
import { platformHealth } from '@/components/status-summary'
import { dateTime, integer, relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

export const metadata = { title: 'Collection status' }

const RUN_STATUS: Record<string, { kind: StatusKind; label: string }> = {
  queued: { kind: 'idle', label: 'Queued' },
  running: { kind: 'warning', label: 'Running' },
  succeeded: { kind: 'good', label: 'Succeeded' },
  partial: { kind: 'warning', label: 'Partial' },
  failed: { kind: 'critical', label: 'Failed' },
  cancelled: { kind: 'idle', label: 'Cancelled' },
  skipped: { kind: 'idle', label: 'Skipped' },
}
const TRIGGER: Record<string, string> = { schedule: 'Scheduled', manual: 'Refresh now', setup: 'Setup', cli: 'Command line', backfill: 'Demo backfill', demo_setup: 'Demo history' }

function seconds(a: Date | null, b: Date | null): string {
  if (!a || !b) return '—'
  const s = Math.max(0, (b.getTime() - a.getTime()) / 1000)
  return s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

function RunDetails({ run }: { run: RunRow }) {
  const platforms = Object.entries(run.platformResults) as Array<[Platform, NonNullable<RunRow['platformResults'][Platform]>]>
  return (
    <div className="grid gap-4 px-5 pb-4 pl-11 text-[12px] lg:grid-cols-2">
      <div>
        <div className="mb-1.5 font-semibold text-ink">Platforms</div>
        {platforms.length ? (
          <ul className="flex flex-col gap-2">
            {platforms.map(([p, r]) => (
              <li key={p}>
                <div className="flex items-center gap-2">
                  <PlatformDot platform={p} />
                  <span className="font-medium text-ink">{PLATFORM_LABEL[p]}</span>
                  <StatusBadge status={RUN_STATUS[r.status]?.kind ?? 'idle'}>{RUN_STATUS[r.status]?.label ?? r.status}</StatusBadge>
                  <span className="text-muted">
                    {integer(r.itemsUpserted)} posts · {integer(r.snapshotsWritten)} snapshots
                  </span>
                </div>
                {r.error ? <div className="mt-1 text-critical-text">{r.error.message}</div> : null}
                <ul className="mt-1 flex flex-wrap gap-1">
                  {r.steps.map((s, i) => (
                    <li key={i} title={s.detail ?? undefined}>
                      <Badge tone={s.status === 'ok' ? 'neutral' : s.status === 'failed' ? 'critical' : 'warning'}>
                        {s.name.replace(/_/g, ' ')}
                        {s.items !== undefined ? ` · ${s.items}` : ''}
                        {s.status !== 'ok' ? ` · ${s.status}` : ''}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No platform work recorded.</p>
        )}
      </div>
      <div>
        <div className="mb-1.5 font-semibold text-ink">Analysis stages</div>
        <ul className="flex flex-col gap-1">
          {run.steps.map((s, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <StatusBadge status={s.status === 'ok' ? 'good' : s.status === 'failed' ? 'critical' : 'idle'}>{s.name}</StatusBadge>
              <span className="text-muted">{s.counts ? Object.entries(s.counts).map(([k, v]) => `${k} ${v}`).join(' · ') : ''}</span>
              {s.detail ? <span className="text-ink-2">{s.detail}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default async function CollectionPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { profile } = await requireProfile()
  const params = await searchParams
  const [status, data] = await Promise.all([
    getWorkspaceStatus(profile),
    getCollection(profile, { level: params.level ?? null, includeBackfill: params.all === '1' }),
  ])
  const tz = profile.timezone
  const now = new Date()
  const s = status.settings.schedule

  return (
    <>
      <PageHeader
        title="Collection status"
        description="When SPOTTER collects, what each platform returned, and anything that went wrong. One platform failing never stops the others."
      />
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Schedule" subtitle={`Times are in ${tz}`} />
          <div className="px-5 pb-5">
            <KeyValues
              rows={[
                ['Runs at', s.enabled ? s.times.join(', ') : 'Paused'],
                ['Next run', status.nextScheduledAt ? `${dateTime(status.nextScheduledAt, tz, 'short')} (${relativeTime(status.nextScheduledAt, now)})` : '—'],
                ['Last run', status.lastRun?.finishedAt ? `${relativeTime(status.lastRun.finishedAt, now)} · ${RUN_STATUS[status.lastRun.status]?.label ?? status.lastRun.status}` : 'none yet'],
                ['Recommendations', status.settings.recommendations.frequency === 'daily' ? 'Refreshed once a day' : status.settings.recommendations.frequency === 'weekly' ? 'Refreshed weekly' : 'Refreshed every run'],
              ]}
            />
            <Link href="/settings#schedule" className="mt-3 inline-block text-[13px] font-medium text-accent-text hover:underline">
              Change schedule
            </Link>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Platforms" subtitle="Health from the latest attempts. Failures back off exponentially — 15 minutes, then 30, 60, 120… up to 6 hours — for scheduled runs; “Refresh now” always tries." />
          <ul className="flex flex-col px-5 pb-4">
            {PLATFORMS.map((p) => {
              const ps = status.platforms.find((x) => x.platform === p)!
              const h = platformHealth(ps)
              const rl = ps.health?.rateLimit as { used?: number | null; limit?: number | null; remaining?: number | null; windowLabel?: string | null; note?: string | null } | null
              return (
                <li key={p} className="grid gap-2 border-t border-line py-3 first:border-t-0 sm:grid-cols-[150px_minmax(0,1fr)]">
                  <div className="flex items-center gap-2">
                    <PlatformDot platform={p} />
                    <span className="text-[13px] font-medium text-ink">{PLATFORM_LABEL[p]}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-[12px] text-ink-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={h.kind}>{h.label}</StatusBadge>
                      {ps.health?.lastSuccessAt ? <span>last success {relativeTime(ps.health.lastSuccessAt, now)}</span> : null}
                      {ps.health?.tokenStatus && ps.health.tokenStatus !== 'healthy' && ps.health.tokenStatus !== 'not_applicable' ? <span>token: {ps.health.tokenStatus}</span> : null}
                    </div>
                    {ps.health?.lastFailureReason && ps.health.lastFailureAt ? (
                      <div className={cn(ps.health.consecutiveFailures ? 'text-critical-text' : 'text-muted')}>
                        {ps.health.consecutiveFailures ? `${ps.health.consecutiveFailures} failure${ps.health.consecutiveFailures === 1 ? '' : 's'} in a row · ` : 'Earlier: '}
                        {ps.health.lastFailureKind ? `${ps.health.lastFailureKind.replace(/_/g, ' ')} — ` : ''}
                        {ps.health.lastFailureReason} ({relativeTime(ps.health.lastFailureAt, now)})
                      </div>
                    ) : null}
                    {ps.health?.backoffUntil && ps.health.backoffUntil > now ? <div>Backing off until {dateTime(ps.health.backoffUntil, tz, 'time')}.</div> : null}
                    {rl && (rl.limit || rl.note) ? (
                      <div className="text-muted">
                        {rl.note ?? `Rate limit: ${integer(rl.used ?? 0)} of ${integer(rl.limit ?? 0)}${rl.windowLabel ? ` ${rl.windowLabel}` : ''}`}
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader title="YouTube quota today" subtitle={status.dataMode === 'demo' ? 'Simulated calls are counted separately from your real quota.' : 'Every metered call is counted before it is sent; scheduled runs keep a reserve for manual refreshes.'} />
        <ul className="grid gap-4 px-5 pb-5 md:grid-cols-3">
          {data.quota.map((q) => {
            const pct = q.dailyLimit ? Math.min(100, (q.used / q.dailyLimit) * 100) : 0
            return (
              <li key={q.bucket}>
                <div className="flex items-baseline justify-between gap-2 text-[13px]">
                  <span className="font-medium text-ink">{q.label}</span>
                  <span className="tabular text-ink-2">
                    {integer(q.used)} / {integer(q.dailyLimit)} {q.unit}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-accent-soft" role="meter" aria-valuemin={0} aria-valuemax={q.dailyLimit} aria-valuenow={q.used} aria-label={q.label}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 90 ? 'var(--critical)' : pct > 70 ? 'var(--warning)' : 'var(--accent)' }} />
                </div>
                <div className="mt-1 text-[12px] text-muted">
                  {integer(q.calls)} calls · resets {dateTime(q.resetsAt, tz, 'time')}
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card className="mb-6 overflow-hidden">
        <CardHeader
          title="Runs"
          subtitle="Newest first. Open a run to see what each platform and stage did."
          action={
            <Link href={params.all === '1' ? '/collection' : '/collection?all=1'} className="text-[13px] font-medium text-accent-text hover:underline">
              {params.all === '1' ? 'Hide backfill' : 'Show backfill runs'}
            </Link>
          }
        />
        {data.runs.length ? (
          <ul className="border-t border-line">
            {data.runs.map((run) => {
              const st = RUN_STATUS[run.status] ?? { kind: 'idle' as StatusKind, label: run.status }
              const platforms = Object.entries(run.platformResults) as Array<[Platform, { status: string }]>
              return (
                <li key={run.id} className="border-b border-line last:border-b-0">
                  <details className="group">
                    <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-surface-2/60 sm:grid-cols-[20px_190px_140px_minmax(0,1fr)_80px]">
                      <ChevronRight aria-hidden className="hidden size-4 text-muted transition-transform group-open:rotate-90 sm:block" />
                      <span className="text-[13px] text-ink">
                        {dateTime(run.clockAt ?? run.requestedAt, tz, 'short')}
                        <span className="block text-[12px] text-muted">{TRIGGER[run.trigger] ?? run.trigger}</span>
                      </span>
                      <span>
                        <StatusBadge status={st.kind}>{st.label}</StatusBadge>
                      </span>
                      <span className="hidden flex-wrap items-center gap-3 text-[12px] text-ink-2 sm:flex">
                        {platforms.map(([p, r]) => (
                          <span key={p} className="inline-flex items-center gap-1">
                            <PlatformDot platform={p} />
                            {r.status}
                          </span>
                        ))}
                        {run.error ? <span className="truncate text-critical-text">{run.error}</span> : null}
                      </span>
                      <span className="tabular hidden text-right text-[12px] text-muted sm:block">{seconds(run.startedAt, run.finishedAt)}</span>
                    </summary>
                    <RunDetails run={run} />
                  </details>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState title="No runs yet">The first run starts at the next scheduled time, or press “Refresh now”.</EmptyState>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Event log"
          subtitle="Connector failures, token refreshes, AI fallbacks. Secrets are redacted before anything is stored."
          action={
            <div className="flex gap-1 text-[12px]">
              {[
                ['', 'All'],
                ['warn', 'Warnings'],
                ['error', 'Errors'],
              ].map(([v, label]) => (
                <Link key={label} href={v ? `/collection?level=${v}` : '/collection'} className={cn('rounded-lg px-2 py-1', (params.level ?? '') === v ? 'bg-surface-2 font-semibold text-ink' : 'text-ink-2 hover:text-ink')}>
                  {label}
                </Link>
              ))}
            </div>
          }
        />
        {data.events.length ? (
          <ul className="max-h-[520px] overflow-y-auto border-t border-line text-[13px]">
            {data.events.map((e) => (
              <li key={e.id} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-b border-line px-5 py-2 last:border-b-0 sm:grid-cols-[150px_90px_minmax(0,1fr)]">
                <span className="tabular text-[12px] text-muted">{dateTime(e.createdAt, tz, 'short')}</span>
                <span className="hidden sm:block">
                  <Badge tone={e.level === 'error' ? 'critical' : e.level === 'warn' ? 'warning' : 'neutral'}>{e.category}</Badge>
                </span>
                <span className="text-ink-2">
                  {e.platform ? <span className="mr-1.5 font-medium text-ink">{PLATFORM_LABEL[e.platform as Platform] ?? e.platform}</span> : null}
                  {e.message}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nothing logged">Events appear here as collection runs.</EmptyState>
        )}
      </Card>
    </>
  )
}
