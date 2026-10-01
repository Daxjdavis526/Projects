import Link from 'next/link'
import { Bookmark, Check, History as HistoryIcon, Wand2 } from 'lucide-react'
import { requireProfile } from '@/server/auth/session'
import { getHistory } from '@/server/queries/history'
import { Badge, Card, CardHeader, EmptyState, PageHeader, StageBadge } from '@/components/ui/primitives'
import { dateTime, relativeTime } from '@/lib/format'

export const metadata = { title: 'History' }

export default async function HistoryPage() {
  const { profile } = await requireProfile()
  const { batches, pastTrends } = await getHistory(profile)
  const tz = profile.timezone
  const now = new Date()
  const kept = batches.flatMap((b) => b.items.filter((i) => i.status === 'saved' || i.status === 'used').map((i) => ({ ...i, createdAt: b.createdAt })))

  return (
    <>
      <PageHeader title="History" description="Earlier recommendations, what you saved or filmed, and trends that have run their course." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-6">
          {batches.length === 0 ? (
            <Card>
              <EmptyState icon={HistoryIcon} title="No recommendations yet">Each refresh’s ideas are kept here for 90 days.</EmptyState>
            </Card>
          ) : (
            batches.map((b) => (
              <Card key={b.batchId}>
                <CardHeader
                  title={b.source === 'on_demand' ? 'Brief on request' : `Recommendations · ${dateTime(b.createdAt, tz, 'day')}`}
                  subtitle={`${dateTime(b.createdAt, tz, 'short')} · ${b.items.length} idea${b.items.length === 1 ? '' : 's'}`}
                  action={b.source === 'on_demand' ? <Wand2 aria-hidden className="size-4 text-muted" /> : null}
                />
                <ul className="border-t border-line">
                  {b.items.map((i) => (
                    <li key={i.id} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3 border-b border-line px-5 py-3 last:border-b-0">
                      <span className="tabular pt-0.5 text-[13px] font-semibold text-muted">{i.rank || '—'}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {i.clusterId ? (
                            <Link href={`/trends/${i.clusterId}`} className="truncate text-[14px] font-medium text-ink hover:underline">
                              {i.trendLabel}
                            </Link>
                          ) : (
                            <span className="truncate text-[14px] font-medium text-ink">{i.trendLabel}</span>
                          )}
                          <StageBadge stage={i.stage} />
                          {i.status === 'saved' ? (
                            <Badge tone="accent" icon={Bookmark}>
                              Saved
                            </Badge>
                          ) : null}
                          {i.status === 'used' ? (
                            <Badge tone="good" icon={Check}>
                              Filmed
                            </Badge>
                          ) : null}
                          {i.status === 'dismissed' ? <Badge>Dismissed</Badge> : null}
                        </div>
                        <p className="mt-1 truncate text-[13px] text-ink-2">“{i.suggestedHook}”</p>
                      </div>
                      <span className="tabular text-[14px] font-semibold text-ink" title="Opportunity score at the time">
                        {Math.round(i.opportunityScore)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))
          )}
        </div>
        <aside className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader title="Saved and filmed" subtitle="Ideas you kept" />
            {kept.length ? (
              <ul className="border-t border-line">
                {kept.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 last:border-b-0">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">{i.trendLabel}</span>
                      <span className="text-[12px] text-muted">{relativeTime(i.createdAt, now)}</span>
                    </span>
                    {i.status === 'used' ? <Badge tone="good">Filmed</Badge> : <Badge tone="accent">Saved</Badge>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 pb-5 text-[13px] text-muted">Use Save or Mark filmed on an idea to keep it here.</p>
            )}
          </Card>
          <Card>
            <CardHeader title="Faded trends" subtitle="Declining or dormant, with the peak Trend Score each reached" />
            {pastTrends.length ? (
              <ul className="border-t border-line">
                {pastTrends.map((t) => (
                  <li key={t.id} className="border-b border-line last:border-b-0">
                    <Link href={`/trends/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-surface-2/60">
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">{t.label}</span>
                        <span className="text-[12px] text-muted">
                          {t.status === 'dormant' ? 'dormant' : 'declining'} · last post {relativeTime(t.lastActivityAt, now)}
                        </span>
                      </span>
                      <span className="tabular shrink-0 text-right text-[12px] text-ink-2">
                        peak <b className="text-ink">{t.peakScore === null ? '—' : Math.round(t.peakScore)}</b>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 pb-5 text-[13px] text-muted">No trend has faded yet.</p>
            )}
          </Card>
        </aside>
      </div>
    </>
  )
}
