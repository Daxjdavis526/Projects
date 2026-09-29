import { Suspense } from 'react'
import Link from 'next/link'
import { Lightbulb, Sparkles, TrendingUp } from 'lucide-react'
import { requireProfile } from '@/server/auth/session'
import { getToday } from '@/server/queries/today'
import { getTopicOptions, getTrendRows } from '@/server/queries/trends'
import { getWorkspaceStatus } from '@/server/queries/workspace'
import { Card, CardHeader, EmptyState, PageHeader, buttonClass } from '@/components/ui/primitives'
import { FilterBar } from '@/components/filter-bar'
import { OpportunityCardView } from '@/components/opportunity-card'
import { TrendMiniList } from '@/components/trend-mini-list'
import { StatusSummary } from '@/components/status-summary'
import { parseFilters } from '@/lib/filters'
import { dateTime, integer, plural } from '@/lib/format'

export const metadata = { title: 'Today' }

export default async function TodayPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { profile } = await requireProfile()
  const filters = parseFilters(await searchParams)
  const [today, topics, emerging, accelerating, status] = await Promise.all([
    getToday(profile, filters),
    getTopicOptions(profile),
    getTrendRows(profile, { ...filters, stage: 'emerging' }, { sort: 'trend', limit: 5 }),
    getTrendRows(profile, { ...filters, stage: 'accelerating' }, { sort: 'trend', limit: 5 }),
    getWorkspaceStatus(profile),
  ])
  const tz = profile.timezone

  return (
    <>
      <PageHeader
        eyebrow={dateTime(new Date(), tz, 'day')}
        title="Today’s opportunities"
        description={
          today.batch ? (
            <>
              {plural(today.cards.length + today.hiddenByFilters, 'video idea')} ranked by how hot each trend is and how well it fits you. Built{' '}
              {dateTime(today.batch.createdAt, tz, 'time')} from {integer(today.totals.postsTracked)} posts by {integer(today.totals.creatorsTracked)} creators in
              the last 14 days.
            </>
          ) : (
            'Video ideas ranked by how hot each trend is and how well it fits you.'
          )
        }
        actions={
          <Link href="/trends" className={buttonClass('secondary', 'sm')}>
            All {today.totals.activeTrends} trends
          </Link>
        }
      />
      <Suspense>
        <FilterBar topics={topics} />
      </Suspense>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          {today.cards.length ? (
            today.cards.map((card) => <OpportunityCardView key={card.id} card={card} timeZone={tz} />)
          ) : (
            <Card>
              {today.batch ? (
                <EmptyState icon={Lightbulb} title="No opportunities match these filters">
                  {today.hiddenByFilters} of today’s ideas are hidden by the filters above.
                </EmptyState>
              ) : (
                <EmptyState
                  icon={Lightbulb}
                  title={status.activeRun || status.demoSetup?.status === 'running' || status.demoSetup?.status === 'queued' ? 'Your first ideas are being prepared' : 'No opportunities yet'}
                  action={
                    <Link href="/collection" className={buttonClass('secondary', 'sm')}>
                      Collection status
                    </Link>
                  }
                >
                  Recommendations appear after the first collection run finds trends that pass the evidence gates (minimum posts, creators and confidence — all in
                  Settings). SPOTTER never pads the list to reach a number.
                </EmptyState>
              )}
            </Card>
          )}
          {today.batch && today.cards.length > 0 && today.cards.length < 5 && !today.hiddenByFilters ? (
            <p className="text-[13px] text-ink-2">
              Only {plural(today.cards.length, 'trend')} passed the evidence gates today. SPOTTER shows fewer ideas rather than weaker ones.
            </p>
          ) : null}
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <Card>
            <CardHeader title={<span className="inline-flex items-center gap-2"><Sparkles aria-hidden className="size-4" style={{ color: 'var(--stage-emerging)' }} />Emerging</span>} subtitle="Young trends that are growing" />
            <TrendMiniList rows={emerging} empty="No young trends are growing in this view." />
          </Card>
          <Card>
            <CardHeader title={<span className="inline-flex items-center gap-2"><TrendingUp aria-hidden className="size-4" style={{ color: 'var(--stage-accelerating)' }} />Accelerating</span>} subtitle="Established trends picking up speed" />
            <TrendMiniList rows={accelerating} empty="No established trend is speeding up in this view." />
          </Card>
          <Card>
            <CardHeader title="What works for you" subtitle="From your own posts, against your own normal" action={<Link href="/performance" className="text-[13px] font-medium text-accent-text hover:underline">Details</Link>} />
            <div className="px-5 pb-4">
              {today.insights.length ? (
                <ul className="flex flex-col gap-2.5 text-[13px] text-ink-2">
                  {today.insights.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted">Patterns appear once enough of your own posts are at least 36 hours old.</p>
              )}
            </div>
          </Card>
          <StatusSummary status={status} />
        </aside>
      </div>
    </>
  )
}
