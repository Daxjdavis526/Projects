import Link from 'next/link'
import { BarChart3, ExternalLink } from 'lucide-react'
import { PLATFORM_LABEL } from '@/core/domain/types'
import { requireProfile } from '@/server/auth/session'
import { getPerformance } from '@/server/queries/performance'
import { Card, CardHeader, EmptyState, PageHeader, PlatformDot, PlatformTag, StatTile, buttonClass } from '@/components/ui/primitives'
import { DailySeriesChart } from '@/components/charts/trend-charts'
import { LiftBars } from '@/components/lift-bars'
import { compact, duration, multiple, percent, relativeTime } from '@/lib/format'

export const metadata = { title: 'Your performance' }

const WHAT_IS_MEASURED = {
  youtube: 'Public view, like and comment counts for every video; daily views, watch time and subscribers from YouTube Analytics (48–72 hours behind).',
  instagram: 'Views, likes, comments, saves, shares and reach per post from Instagram insights; daily reach for the account.',
  tiktok: 'View, like, comment and share counts per video (Display API). TikTok does not offer watch time, reach or audience data to apps like this.',
} as const

export default async function PerformancePage() {
  const { profile } = await requireProfile()
  const data = await getPerformance(profile)
  const tz = profile.timezone
  const now = new Date()
  const k = data.kpis
  const change = k.medianViews30d !== null && k.medianViewsPrev30d ? k.medianViews30d / k.medianViewsPrev30d - 1 : null

  if (!data.accounts.length) {
    return (
      <>
        <PageHeader title="Your performance" />
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Connect an account to see your own analytics"
            action={
              <Link href="/connections" className={buttonClass('primary', 'sm')}>
                Connections
              </Link>
            }
          >
            SPOTTER learns what works for you from your own posts, and uses it to rank trends by fit.
          </EmptyState>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Your performance"
        description="Every number here compares your posts with your own normal on the same platform at the same age — not with anyone else."
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Posts, last 30 days" value={k.posts30d} hint={`${data.accounts.map((a) => `${a.posts} on ${PLATFORM_LABEL[a.platform]}`).join(' · ')} tracked`} />
        <StatTile
          label="Median views per post"
          value={compact(k.medianViews30d)}
          delta={change === null ? null : { value: `${change >= 0 ? '+' : ''}${Math.round(change * 100)}%`, direction: change > 0.02 ? 'up' : change < -0.02 ? 'down' : 'flat', good: change > 0 }}
          hint="Posts 2–32 days old, vs the 30 days before"
        />
        <StatTile label="Median vs your normal" value={multiple(k.medianLift30d)} hint="1× = exactly your usual views at that age" />
        <StatTile label="Engagement rate" value={percent(k.engagementRate30d, 1)} hint="Likes, comments, shares and saves per view" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          {data.series.length ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {data.series.map((s) => (
                <DailySeriesChart key={`${s.platform}-${s.metric}`} title={`${PLATFORM_LABEL[s.platform]} · ${s.label}`} subtitle="From the platform’s own analytics for your account" points={s.points} timeZone={tz} />
              ))}
            </div>
          ) : null}

          <Card>
            <CardHeader title="What works for you" subtitle="Your views against your normal, grouped by what the post was. Bars are faded where the evidence is thin; the number after · is how many posts." />
            <div className="grid gap-x-10 gap-y-6 px-5 pb-5 lg:grid-cols-2">
              {data.lifts.length ? (
                data.lifts.map((d) => (
                  <section key={d.dimension}>
                    <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">{d.label}</h3>
                    <LiftBars rows={d.rows.slice(0, 8)} />
                  </section>
                ))
              ) : (
                <p className="text-[13px] text-muted">Patterns appear once enough of your posts are at least 36 hours old.</p>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent posts" subtitle="Newest first. “vs normal” compares each post with what you usually get on that platform by the same age." />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-[13px]">
                <thead>
                  <tr className="border-y border-line bg-surface-2/60 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                    <th className="px-5 py-2">Post</th>
                    <th className="px-3 py-2 text-right">Views</th>
                    <th className="px-3 py-2 text-right">Likes</th>
                    <th className="px-3 py-2 text-right">Comments</th>
                    <th className="px-3 py-2 text-right">vs normal</th>
                    <th className="px-5 py-2 text-right">Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {data.posts.map((p) => {
                    const href = p.dataOrigin === 'demo' ? null : p.url
                    return (
                      <tr key={p.id} className="border-b border-line last:border-b-0">
                        <td className="max-w-[300px] px-5 py-2.5">
                          <div className="flex items-start gap-2">
                            <PlatformDot platform={p.platform} className="mt-1.5" />
                            <div className="min-w-0">
                              <div className="truncate font-medium text-ink" title={p.title ?? undefined}>
                                {href ? (
                                  <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex max-w-full items-center gap-1 hover:underline">
                                    <span className="truncate">{p.title ?? 'Untitled'}</span>
                                    <ExternalLink aria-hidden className="size-3 shrink-0 text-muted" />
                                  </a>
                                ) : (
                                  (p.title ?? 'Untitled')
                                )}
                              </div>
                              <div className="truncate text-[12px] text-muted">{[p.topic, p.format, p.durationSeconds ? duration(p.durationSeconds) : null].filter(Boolean).join(' · ')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="tabular px-3 py-2.5 text-right text-ink">{compact(p.views)}</td>
                        <td className="tabular px-3 py-2.5 text-right text-ink-2">{compact(p.likes)}</td>
                        <td className="tabular px-3 py-2.5 text-right text-ink-2">{compact(p.comments)}</td>
                        <td className="tabular px-3 py-2.5 text-right font-semibold text-ink">
                          {p.lift !== null ? multiple(p.lift) : <span className="font-normal text-muted" title="Too new to judge (under 36 hours), or no baseline yet">—</span>}
                        </td>
                        <td className="tabular px-5 py-2.5 text-right text-ink-2">{p.publishedAt ? relativeTime(p.publishedAt, now) : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Patterns worth knowing" subtitle="The strongest, best-supported differences" />
            <ul className="flex flex-col gap-2.5 px-5 pb-5 text-[13px] text-ink-2">
              {data.insights.length ? (
                data.insights.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    {line}
                  </li>
                ))
              ) : (
                <li className="text-muted">Not enough history yet.</li>
              )}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Accounts" subtitle="What each platform lets SPOTTER measure" />
            <ul className="flex flex-col px-5 pb-5">
              {data.accounts.map((a) => (
                <li key={a.platform} className="border-t border-line py-3 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <PlatformTag platform={a.platform} />
                    <span className="text-[12px] text-muted">{a.lastSyncAt ? `synced ${relativeTime(a.lastSyncAt, now)}` : 'not synced yet'}</span>
                  </div>
                  <div className="mt-1 text-[13px] text-ink">
                    {a.username ? `@${a.username.replace(/^@/, '')}` : 'Connected'}
                    {a.followers !== null ? <span className="text-muted"> · {compact(a.followers)} followers</span> : null}
                  </div>
                  <p className="mt-1 text-[12px] text-ink-2">{WHAT_IS_MEASURED[a.platform]}</p>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  )
}
