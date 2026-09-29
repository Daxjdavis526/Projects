import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Clapperboard, ExternalLink, Music2, Quote, Zap } from 'lucide-react'
import { COMPONENT_LABEL } from '@/core/analytics/scoring'
import { FIT_COMPONENT_KEYS, PLATFORM_LABEL, TREND_COMPONENT_KEYS, type Platform } from '@/core/domain/types'
import { requireProfile } from '@/server/auth/session'
import { getTrendDetail, type TrendMemberView } from '@/server/queries/trends'
import { Badge, Callout, Card, CardHeader, EmptyState, Meter, PlatformDot, PlatformList, StageBadge } from '@/components/ui/primitives'
import { CreatorSizeChart, MomentumChart, PostsPerDayChart, ScoreHistoryChart, ViewsPerHourChart, type DayCount, type SizeBucket } from '@/components/charts/trend-charts'
import { ScoreBreakdown } from '@/components/score-breakdown'
import { DraftBriefButton } from '@/components/brief-panel'
import { EvidencePosts } from '@/components/evidence-posts'
import { compact, dateTime, duration, multiple, relativeTime } from '@/lib/format'

export const metadata = { title: 'Trend' }

const FIT_LABEL: Record<string, string> = { topic: 'Topic', niche: 'Niche', format: 'Format', style: 'Style', platform: 'Platform', length: 'Length' }

function dayKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

function postsPerDay(members: TrendMemberView[], timeZone: string, days = 14): DayCount[] {
  const now = Date.now()
  const out: DayCount[] = []
  const index = new Map<string, DayCount>()
  for (let i = days - 1; i >= 0; i--) {
    const t = now - i * 86_400_000
    const row: DayCount = { day: dayKey(new Date(t), timeZone), t, youtube: 0, instagram: 0, tiktok: 0 }
    out.push(row)
    index.set(row.day, row)
  }
  for (const m of members) {
    if (!m.publishedAt) continue
    const row = index.get(dayKey(m.publishedAt, timeZone))
    if (row) row[m.platform] += 1
  }
  return out
}

function sizeBuckets(members: TrendMemberView[]): { buckets: SizeBucket[]; unknown: number } {
  const edges: Array<[string, number]> = [
    ['<10K', 1e4],
    ['10–50K', 5e4],
    ['50–250K', 2.5e5],
    ['250K–1M', 1e6],
    ['1M+', Infinity],
  ]
  const seen = new Map<string, number | null>()
  let unknown = 0
  for (const m of members) {
    const key = m.creatorHandle ?? m.creatorName
    if (!key) {
      unknown++
      continue
    }
    if (!seen.has(`${m.platform}:${key}`)) seen.set(`${m.platform}:${key}`, m.followers)
  }
  const buckets = edges.map(([label]) => ({ label, creators: 0 }))
  for (const followers of seen.values()) {
    if (followers === null) {
      unknown++
      continue
    }
    const i = edges.findIndex(([, max]) => followers < max)
    buckets[i]!.creators++
  }
  return { buckets, unknown }
}

function Chips({ items, empty }: { items: Array<{ value: string; count: number }>; empty: string }) {
  if (!items.length) return <p className="text-[13px] text-muted">{empty}</p>
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <li key={i.value} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[12px] text-ink">
          {i.value}
          <span className="tabular text-muted">{i.count}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function TrendPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await requireProfile()
  const trend = await getTrendDetail(profile, (await params).id)
  if (!trend) notFound()
  const tz = profile.timezone
  const now = new Date()
  const days = postsPerDay(trend.members, tz)
  const { buckets, unknown } = sizeBuckets(trend.members)
  const ranked = [...trend.members].sort((a, b) => (b.outperformance ?? -1) - (a.outperformance ?? -1) || (b.views ?? 0) - (a.views ?? 0))
  const p = trend.patterns
  const brief = trend.brief

  return (
    <>
      <Link href="/trends" className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-ink">
        <ChevronLeft aria-hidden className="size-4" /> Trends
      </Link>

      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {trend.stage ? <StageBadge stage={trend.stage} /> : null}
            {trend.isBreakout ? (
              <Badge tone="accent" icon={Zap}>
                Breakout
              </Badge>
            ) : null}
            {trend.status !== 'active' ? <Badge>{trend.status === 'merged' ? 'Merged into another trend' : 'Dormant'}</Badge> : null}
          </div>
          <h1 className="mt-2.5 text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">{trend.label}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-2">
            <PlatformList platforms={trend.platforms} />
            <span>{trend.members.length} posts</span>
            <span>first spotted {dateTime(trend.firstDetectedAt, tz, 'day')}</span>
            <span>latest post {relativeTime(trend.lastActivityAt, now)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-5 rounded-2xl border border-line bg-surface px-5 py-4 shadow-card">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Opportunity</div>
            <div className="text-[40px] leading-none font-semibold tracking-[-0.03em] text-ink">{trend.opportunityScore === null ? '—' : Math.round(trend.opportunityScore)}</div>
          </div>
          <div className="flex w-48 flex-col gap-1.5">
            <Meter label="Trend" value={trend.trendScore} size="sm" />
            <Meter label="Fit" value={trend.fitScore} size="sm" />
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <span className="w-12">Conf.</span>
              <span className="tabular font-semibold text-ink">{trend.confidence === null ? '—' : Math.round(trend.confidence)}</span>
              <span>of 100</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Why this is a trend" subtitle="Measured facts first; the summary is written by the AI layer and never sets a number" />
            <div className="px-5 pb-5 text-[14px]">
              {trend.summary ? <p className="mb-3 leading-relaxed text-ink">{trend.summary}</p> : null}
              <ul className="flex flex-col gap-1.5 text-ink-2">
                {trend.explanationLines.map((l, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {l}
                  </li>
                ))}
              </ul>
              {trend.stageBasis ? (
                <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-[13px] text-ink-2">
                  <span className="font-semibold text-ink">Stage:</span> {trend.stageBasis}
                </p>
              ) : null}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreHistoryChart history={trend.history} timeZone={tz} />
            <MomentumChart history={trend.history} timeZone={tz} />
            <PostsPerDayChart days={days} timeZone={tz} platforms={trend.platforms as Platform[]} />
            <ViewsPerHourChart history={trend.history} timeZone={tz} />
          </div>

          <Card>
            <CardHeader
              title="Trend Score breakdown"
              subtitle="Six measured components. Weights are yours to change in Settings; a component without data is left out and its weight shared by the rest."
            />
            {trend.components ? (
              <ScoreBreakdown components={trend.components} labels={COMPONENT_LABEL} order={TREND_COMPONENT_KEYS} />
            ) : (
              <EmptyState title="Not scored yet" />
            )}
          </Card>

          <Card>
            <CardHeader title="Supporting posts" subtitle={`Posts in this trend, strongest against their creators’ normal first. ${trend.members.some((m) => m.dataOrigin === 'demo') ? 'Simulated posts are not linked.' : 'Links open the post on its platform.'}`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-[13px]">
                <thead>
                  <tr className="border-y border-line bg-surface-2/60 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                    <th className="px-5 py-2">Post</th>
                    <th className="px-3 py-2">Creator</th>
                    <th className="px-3 py-2 text-right">Views</th>
                    <th className="px-3 py-2 text-right">Views/hr</th>
                    <th className="px-3 py-2 text-right" title="Views ÷ what this creator normally gets by the same age">vs usual</th>
                    <th className="px-5 py-2 text-right">Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.slice(0, 30).map((m) => {
                    const href = m.dataOrigin === 'demo' ? null : m.url
                    return (
                      <tr key={m.id} className="border-b border-line last:border-b-0">
                        <td className="max-w-[340px] px-5 py-2.5">
                          <div className="flex items-start gap-2">
                            <PlatformDot platform={m.platform} className="mt-1.5" />
                            <div className="min-w-0">
                              <div className="truncate font-medium text-ink" title={m.title ?? undefined}>
                                {href ? (
                                  <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex max-w-full items-center gap-1 hover:underline">
                                    <span className="truncate">{m.title ?? 'Untitled'}</span>
                                    <ExternalLink aria-hidden className="size-3 shrink-0 text-muted" />
                                  </a>
                                ) : (
                                  (m.title ?? 'Untitled')
                                )}
                              </div>
                              <div className="text-[12px] text-muted">
                                {[m.format, m.hookType ? `${m.hookType.toLowerCase()} hook` : null, m.durationSeconds ? duration(m.durationSeconds) : null].filter(Boolean).join(' · ')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="truncate text-ink">{m.creatorName ?? <span className="text-muted">not shared by {PLATFORM_LABEL[m.platform]}</span>}</div>
                          <div className="text-[12px] text-muted">{m.followers !== null ? `${compact(m.followers)} followers` : ''}</div>
                        </td>
                        <td className="tabular px-3 py-2.5 text-right text-ink">{m.views !== null ? compact(m.views) : <span className="text-muted" title="This platform does not expose view counts here">n/a</span>}</td>
                        <td className="tabular px-3 py-2.5 text-right text-ink-2">{m.viewsPerHour !== null ? compact(m.viewsPerHour) : '—'}</td>
                        <td className="tabular px-3 py-2.5 text-right font-semibold text-ink">{m.outperformance !== null ? multiple(m.outperformance) : <span className="font-normal text-muted">—</span>}</td>
                        <td className="tabular px-5 py-2.5 text-right text-ink-2">{m.publishedAt ? relativeTime(m.publishedAt, now) : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {ranked.length > 30 ? <p className="px-5 py-3 text-[12px] text-muted">Showing 30 of {ranked.length} posts.</p> : null}
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader
              title="Your video brief"
              subtitle={brief ? (brief.source === 'on_demand' ? `Drafted ${relativeTime(brief.createdAt, now)} on request` : `From the ${dateTime(brief.createdAt, tz, 'day')} recommendations (#${brief.rank})`) : 'An original angle for you — never a copy of these posts'}
            />
            <div className="px-5 pb-5">
              {brief ? (
                <div className="flex flex-col gap-4 text-[13px]">
                  <figure className="rounded-xl bg-surface-2 px-4 py-3">
                    <figcaption className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                      <Quote aria-hidden className="size-3" /> Suggested hook
                    </figcaption>
                    <blockquote className="text-[15px] leading-snug font-semibold text-ink">{brief.suggestedHook}</blockquote>
                  </figure>
                  <div>
                    <div className="font-semibold text-ink">Angle</div>
                    <p className="mt-0.5 text-ink-2">{brief.suggestedAngle}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">Title idea</div>
                    <p className="mt-0.5 text-ink-2">{brief.titleConcept}</p>
                  </div>
                  {brief.captionConcept ? (
                    <div>
                      <div className="font-semibold text-ink">Caption idea</div>
                      <p className="mt-0.5 text-ink-2">{brief.captionConcept}</p>
                    </div>
                  ) : null}
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-ink">
                      <Clapperboard aria-hidden className="size-3.5 text-muted" /> Script outline
                    </div>
                    <ol className="mt-1.5 flex flex-col gap-1.5">
                      {brief.structure.map((b, i) => (
                        <li key={i} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2">
                          <span className="tabular text-muted">
                            {b.startSec}–{b.endSec}s
                          </span>
                          <span className="text-ink-2">
                            <span className="font-semibold text-ink">{b.label}.</span> {b.direction}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  {brief.alternativeAngles.length ? (
                    <div>
                      <div className="font-semibold text-ink">Other angles</div>
                      <ul className="mt-1 list-disc pl-4 text-ink-2">
                        {brief.alternativeAngles.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <p className="text-[12px] text-muted">{brief.generationNote ?? `Written by ${brief.generatedBy}`}</p>
                  <DraftBriefButton clusterId={trend.id} label="Draft another version" />
                </div>
              ) : (
                <div className="flex flex-col gap-3 text-[13px] text-ink-2">
                  <p>This trend is not in today’s recommendations. You can still get an angle, hook, title and script outline built from its evidence and your own strengths.</p>
                  <DraftBriefButton clusterId={trend.id} />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Fit for you" subtitle={trend.fitScore !== null ? `Creator Fit ${Math.round(trend.fitScore)} of 100, from your own posts` : 'Not computed yet'} />
            {trend.fitComponents && Object.keys(trend.fitComponents).length ? (
              <ScoreBreakdown components={trend.fitComponents} labels={FIT_LABEL} order={FIT_COMPONENT_KEYS} />
            ) : (
              <p className="px-5 pb-5 text-[13px] text-muted">Fit appears after SPOTTER has analysed enough of your own posts.</p>
            )}
          </Card>

          <Card>
            <CardHeader title="Recurring patterns" subtitle="What these posts have in common (counts of posts)" />
            <div className="flex flex-col gap-4 px-5 pb-5">
              <div>
                <div className="mb-1.5 text-[12px] font-semibold text-muted">Formats</div>
                <Chips items={p?.formats ?? []} empty="No dominant format." />
              </div>
              <div>
                <div className="mb-1.5 text-[12px] font-semibold text-muted">Hook types</div>
                <Chips items={p?.hookTypes ?? []} empty="No dominant hook type." />
              </div>
              <div>
                <div className="mb-1.5 text-[12px] font-semibold text-muted">Tone</div>
                <Chips items={p?.styles ?? []} empty="—" />
              </div>
              <div>
                <div className="mb-1.5 text-[12px] font-semibold text-muted">Who it is for</div>
                <Chips items={p?.audiences ?? []} empty="—" />
              </div>
              {p?.exercises.length ? (
                <div>
                  <div className="mb-1.5 text-[12px] font-semibold text-muted">Exercises</div>
                  <Chips items={p.exercises} empty="—" />
                </div>
              ) : null}
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                  <Music2 aria-hidden className="size-3.5" /> Sounds
                </div>
                {p?.audio?.length ? (
                  <Chips items={p.audio} empty="—" />
                ) : (
                  <p className="text-[13px] text-muted">Not available: none of these platforms’ APIs report which sound a public post uses.</p>
                )}
              </div>
              {p?.hooks.length ? (
                <div>
                  <div className="mb-1.5 text-[12px] font-semibold text-muted">Openings that worked (for reference — write your own)</div>
                  <ul className="flex flex-col gap-1.5 text-[13px] text-ink-2">
                    {p.hooks.map((h, i) => (
                      <li key={i} className="border-l-2 border-line pl-2.5">
                        “{h.value}”{h.example ? <span className="text-muted"> — {h.example}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Card>

          <CreatorSizeChart buckets={buckets} />
          {unknown ? (
            <Callout tone="neutral">
              {unknown} post{unknown === 1 ? '' : 's'} came from Instagram hashtag search, which does not say who posted — counted as partial evidence, not as independent creators.
            </Callout>
          ) : null}
          {brief?.evidence.examples.length ? (
            <Card>
              <CardHeader title="Strongest examples" subtitle="The posts the brief was built on" />
              <div className="px-5 pb-5">
                <EvidencePosts posts={brief.evidence.examples} />
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  )
}
