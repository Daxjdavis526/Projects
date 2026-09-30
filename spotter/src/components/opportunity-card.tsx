import Link from 'next/link'
import { ArrowRight, Bookmark, Check, ChevronRight, Clapperboard, EyeOff, Quote } from 'lucide-react'
import type { OpportunityCard as Card } from '@/server/queries/today'
import { setRecommendationStatus } from '@/server/actions/recommendations'
import { Badge, Meter, PlatformList, StageBadge, buttonClass } from '@/components/ui/primitives'
import { Sparkline } from '@/components/sparkline'
import { EvidencePosts } from '@/components/evidence-posts'
import { multiple, plural } from '@/lib/format'
import { cn } from '@/lib/cn'

function StatusButton({ id, status, current, label, icon: Icon }: { id: string; status: string; current: string; label: string; icon: typeof Check }) {
  const on = current === status
  return (
    <form action={setRecommendationStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={on ? 'new' : status} />
      <button type="submit" className={buttonClass('ghost', 'sm', cn(on && 'bg-accent-soft text-accent-text'))} aria-pressed={on}>
        <Icon aria-hidden className="size-3.5" />
        {on && status === 'saved' ? 'Saved' : on && status === 'used' ? 'Used' : label}
      </button>
    </form>
  )
}

export function OpportunityCardView({ card, timeZone }: { card: Card; timeZone: string }) {
  const total = card.structure.at(-1)?.endSec ?? null
  const e = card.evidence
  return (
    <article className="rounded-2xl border border-line bg-surface shadow-card" aria-labelledby={`opp-${card.id}`}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular grid size-6 place-items-center rounded-lg bg-ink text-[12px] font-bold text-plane" aria-label={`Rank ${card.rank}`}>
              {card.rank}
            </span>
            <StageBadge stage={card.stage} />
            {card.status === 'used' ? <Badge tone="good">Filmed</Badge> : null}
          </div>
          <h3 id={`opp-${card.id}`} className="mt-2.5 text-[19px] leading-snug font-semibold tracking-[-0.015em] text-ink">
            {card.clusterId ? (
              <Link href={`/trends/${card.clusterId}`} className="hover:underline hover:decoration-line-strong hover:underline-offset-4">
                {card.trendLabel}
              </Link>
            ) : (
              card.trendLabel
            )}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
            <PlatformList platforms={card.platforms} />
            <span>{plural(e.itemCount, 'post')}</span>
            <span>{plural(e.creatorCount, 'creator')}</span>
            {e.outperformingCreators ? <span>{e.outperformingCreators} at 3×+ their usual views</span> : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Opportunity</div>
            <div className="text-[34px] leading-none font-semibold tracking-[-0.03em] text-ink">{Math.round(card.opportunityScore)}</div>
          </div>
          <div className="flex w-44 flex-col gap-1.5">
            <Meter label="Trend" value={card.trendScore} size="sm" />
            <Meter label="Fit" value={card.fitScore} size="sm" />
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4">
        <p className="text-[14px] leading-relaxed text-ink">{card.oneLiner}</p>
        <figure className="mt-3.5 rounded-xl bg-surface-2 px-4 py-3">
          <figcaption className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            <Quote aria-hidden className="size-3" /> Suggested hook
          </figcaption>
          <blockquote className="text-[16px] leading-snug font-semibold text-ink">{card.suggestedHook}</blockquote>
        </figure>
        <dl className="mt-3.5 grid gap-3 text-[13px] sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="font-semibold text-ink">Your angle</dt>
            <dd className="mt-0.5 leading-relaxed text-ink-2">{card.suggestedAngle}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Title idea</dt>
            <dd className="mt-0.5 text-ink-2">{card.titleConcept}</dd>
          </div>
          {card.captionConcept ? (
            <div>
              <dt className="font-semibold text-ink">Caption idea</dt>
              <dd className="mt-0.5 text-ink-2">{card.captionConcept}</dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="font-semibold text-ink">Why it matters</dt>
            <dd className="mt-0.5 leading-relaxed text-ink-2">{card.whyItMatters}</dd>
          </div>
        </dl>
      </div>

      <div className="divide-y divide-line border-t border-line">
        <details className="group px-5 py-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px] font-semibold text-ink">
            <ChevronRight aria-hidden className="size-4 text-muted transition-transform group-open:rotate-90" />
            <Clapperboard aria-hidden className="size-3.5 text-muted" />
            Script outline{total ? ` · ${total}s` : ''}
          </summary>
          <ol className="mt-3 flex flex-col gap-2 pl-6">
            {card.structure.map((beat, i) => (
              <li key={i} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 text-[13px]">
                <span className="tabular text-muted">
                  {beat.startSec}–{beat.endSec}s
                </span>
                <span>
                  <span className="font-semibold text-ink">{beat.label}.</span> <span className="text-ink-2">{beat.direction}</span>
                </span>
              </li>
            ))}
          </ol>
          {card.alternativeAngles.length ? (
            <div className="mt-3 pl-6 text-[13px]">
              <div className="font-semibold text-ink">Other angles</div>
              <ul className="mt-1 list-disc pl-4 text-ink-2">
                {card.alternativeAngles.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </details>
        <details className="group px-5 py-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[13px] font-semibold text-ink">
            <ChevronRight aria-hidden className="size-4 text-muted transition-transform group-open:rotate-90" />
            Evidence · {plural(e.examples.length, 'example post')}
          </summary>
          <div className="mt-3 pl-6">
            <ul className="mb-3 list-disc pl-4 text-[13px] text-ink-2">
              {e.summaryLines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
            <EvidencePosts posts={e.examples} timeZone={timeZone} />
            {e.ownPriorPost ? (
              <p className="mt-3 text-[13px] text-ink-2">
                You covered this before: <span className="font-medium text-ink">{e.ownPriorPost.title ?? 'an earlier post'}</span>
                {e.ownPriorPost.lift ? ` (${multiple(e.ownPriorPost.lift)} your normal views)` : ''}.
              </p>
            ) : null}
          </div>
        </details>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
        <div className="flex items-center gap-3">
          {card.clusterId ? (
            <Link href={`/trends/${card.clusterId}`} className={buttonClass('secondary', 'sm')}>
              Open trend <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          ) : null}
          {card.history.length > 1 ? (
            <span className="hidden items-center gap-2 text-[12px] text-muted sm:flex">
              <Sparkline points={card.history} label={`Trend Score over the last days, now ${Math.round(card.trendScore)}`} />
              Trend Score, 10 days
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <StatusButton id={card.id} status="saved" current={card.status} label="Save" icon={Bookmark} />
          <StatusButton id={card.id} status="used" current={card.status} label="Mark filmed" icon={Check} />
          <StatusButton id={card.id} status="dismissed" current={card.status} label="Dismiss" icon={EyeOff} />
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-2 rounded-b-2xl bg-surface-2/60 px-5 py-2 text-[11px] text-muted">
        <span>Confidence {Math.round(card.confidence)} of 100</span>
        <span>{card.generationNote ?? `Written by ${card.generatedBy}`}</span>
      </div>
    </article>
  )
}
