import { Suspense } from 'react'
import Link from 'next/link'
import { Flame, Zap } from 'lucide-react'
import { TREND_STAGES, type TrendStage } from '@/core/domain/types'
import { requireProfile } from '@/server/auth/session'
import { getStageCounts, getTopicOptions, getTrendRows } from '@/server/queries/trends'
import { Badge, Card, EmptyState, PageHeader, PlatformDot, StageBadge } from '@/components/ui/primitives'
import { FilterBar } from '@/components/filter-bar'
import { Sparkline } from '@/components/sparkline'
import { filtersToQuery, parseFilters } from '@/lib/filters'
import { multiple, relativeTime } from '@/lib/format'
import { cn } from '@/lib/cn'

export const metadata = { title: 'Trends' }

const TABS: Array<{ key: TrendStage | null; label: string }> = [
  { key: null, label: 'All' },
  { key: 'emerging', label: 'Emerging' },
  { key: 'accelerating', label: 'Accelerating' },
  { key: 'mature', label: 'Mature' },
  { key: 'declining', label: 'Declining' },
]
const SORTS = [
  { key: 'opportunity', label: 'Opportunity' },
  { key: 'trend', label: 'Trend Score' },
  { key: 'fit', label: 'Fit' },
  { key: 'recent', label: 'Latest activity' },
] as const

function ScoreCell({ value, strong }: { value: number | null; strong?: boolean }) {
  return <span className={cn('tabular text-[14px]', strong ? 'font-semibold text-ink' : 'text-ink-2')}>{value === null ? '—' : Math.round(value)}</span>
}

export default async function TrendsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { profile } = await requireProfile()
  const params = await searchParams
  const filters = parseFilters(params)
  const sortParam = typeof params.sort === 'string' ? params.sort : 'opportunity'
  const sort = (SORTS.find((s) => s.key === sortParam)?.key ?? 'opportunity') as (typeof SORTS)[number]['key']
  const [rows, counts, topics] = await Promise.all([getTrendRows(profile, filters, { sort }), getStageCounts(profile, filters), getTopicOptions(profile)])
  const now = new Date()
  const hrefFor = (over: Partial<typeof filters> & { sort?: string }) => {
    const q = filtersToQuery({ ...filters, ...over })
    const sortPart = (over.sort ?? sort) !== 'opportunity' ? `sort=${over.sort ?? sort}` : ''
    return `/trends${q}${sortPart ? (q ? '&' : '?') + sortPart : ''}`
  }

  return (
    <>
      <PageHeader
        title="Trends"
        description="Every active trend SPOTTER is tracking: topics, formats and debates gaining unusual traction, grouped by meaning rather than hashtags. Stage comes from measured momentum, never from the AI."
      />
      <Suspense>
        <FilterBar topics={topics} showStage={false} />
      </Suspense>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Stage" className="flex flex-wrap gap-1 rounded-2xl border border-line bg-surface-2 p-1">
          {TABS.map((tab) => {
            const active = filters.stage === tab.key
            const n = counts[tab.key ?? 'all'] ?? 0
            return (
              <Link
                key={tab.label}
                href={hrefFor({ stage: tab.key })}
                aria-current={active ? 'page' : undefined}
                className={cn('inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium', active ? 'bg-surface text-ink shadow-card' : 'text-ink-2 hover:text-ink')}
              >
                {tab.label}
                <span className="tabular text-[12px] text-muted">{n}</span>
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
          <span className="text-muted">Sort</span>
          {SORTS.map((s) => (
            <Link key={s.key} href={hrefFor({ sort: s.key })} className={cn('rounded-lg px-2 py-1', sort === s.key ? 'bg-surface-2 font-semibold text-ink' : 'hover:text-ink')}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={Flame} title="No trends match">
            Try a longer time range or fewer filters. New trends appear after collection runs find related posts from several creators.
          </EmptyState>
        ) : (
          <div role="table" aria-label="Trends" className="min-w-0">
            <div role="row" className="hidden grid-cols-[minmax(0,1fr)_110px_64px_56px_56px_150px_104px] items-center gap-4 border-b border-line bg-surface-2/60 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted lg:grid">
              <span role="columnheader">Trend</span>
              <span role="columnheader">Stage</span>
              <span role="columnheader" className="text-right" title="Opportunity = weighted mix of Trend Score and Creator Fit">Opp.</span>
              <span role="columnheader" className="text-right">Trend</span>
              <span role="columnheader" className="text-right">Fit</span>
              <span role="columnheader">Momentum</span>
              <span role="columnheader">Score, 10 days</span>
            </div>
            {rows.map((r) => (
              <Link
                key={r.id}
                href={`/trends/${r.id}`}
                role="row"
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-line px-5 py-3.5 last:border-b-0 hover:bg-surface-2/60 lg:grid-cols-[minmax(0,1fr)_110px_64px_56px_56px_150px_104px]"
              >
                <div role="cell" className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-ink">{r.label}</span>
                    {r.isBreakout ? (
                      <Badge tone="accent" icon={Zap}>
                        Breakout
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      {r.platforms.map((p) => (
                        <PlatformDot key={p} platform={p} />
                      ))}
                    </span>
                    <span>
                      {r.itemCount} posts · {r.creatorCount} creators
                    </span>
                    <span>active {relativeTime(r.lastActivityAt, now)}</span>
                    {r.confidence !== null ? <span>confidence {Math.round(r.confidence)}</span> : null}
                  </div>
                </div>
                <div role="cell" className="lg:order-none">
                  {r.stage ? <StageBadge stage={r.stage} /> : null}
                </div>
                <div role="cell" className="hidden text-right lg:block">
                  <ScoreCell value={r.opportunityScore} strong />
                </div>
                <div role="cell" className="hidden text-right lg:block">
                  <ScoreCell value={r.trendScore} />
                </div>
                <div role="cell" className="hidden text-right lg:block">
                  <ScoreCell value={r.fitScore} />
                </div>
                <div role="cell" className="hidden text-[12px] text-ink-2 lg:block">
                  {r.momentumPerDay !== null ? (
                    <>
                      <span className="tabular font-semibold text-ink">{multiple(r.momentumPerDay)}</span> per day
                      <div className="text-muted">{r.postsLast3Days ?? 0} posts in 3 days</div>
                    </>
                  ) : (
                    <span className="text-muted">not enough data</span>
                  )}
                </div>
                <div role="cell" className="hidden lg:block">
                  <Sparkline points={r.history} label={`Trend Score over time for ${r.label}`} />
                </div>
                <div className="col-span-2 flex gap-4 text-[12px] text-ink-2 lg:hidden">
                  <span>
                    Opportunity <b className="tabular text-ink">{r.opportunityScore === null ? '—' : Math.round(r.opportunityScore)}</b>
                  </span>
                  <span>
                    Trend <b className="tabular text-ink">{r.trendScore === null ? '—' : Math.round(r.trendScore)}</b>
                  </span>
                  <span>
                    Fit <b className="tabular text-ink">{r.fitScore === null ? '—' : Math.round(r.fitScore)}</b>
                  </span>
                  {r.momentumPerDay !== null ? <span>{multiple(r.momentumPerDay)}/day</span> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
      <p className="mt-3 text-[12px] text-muted">
        Showing trends with posts in the selected time range. Stages: {TREND_STAGES.map((s) => s).join(' → ')}. Opportunity weighs Trend Score against Creator Fit as set in Settings.
      </p>
    </>
  )
}
