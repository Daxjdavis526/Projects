import { ChevronRight } from 'lucide-react'
import type { ScoreComponent } from '@/core/domain/types'
import { cn } from '@/lib/cn'

function formatInput(v: number | string | null): string {
  if (v === null) return '—'
  if (typeof v === 'number') return Number.isInteger(v) ? v.toLocaleString('en-US') : String(Math.round(v * 100) / 100)
  return v
}

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).replace(/\b(Vs|Of|On|At|In|To)\b/g, (w) => w.toLowerCase())
}

/**
 * A score's components, each with its 0–100 value, its share of the weight
 * (renormalised over the components that have data) and the plain-English
 * reason. Unavailable components are shown as such, never as zero.
 */
export function ScoreBreakdown({ components, labels, order }: { components: Record<string, ScoreComponent>; labels: Record<string, string>; order: readonly string[] }) {
  const available = order.filter((k) => components[k]?.score !== null && (components[k]?.weight ?? 0) > 0)
  const totalWeight = available.reduce((s, k) => s + (components[k]?.weight ?? 0), 0)
  return (
    <ul className="flex flex-col">
      {order.map((key) => {
        const c = components[key]
        if (!c) return null
        const share = c.score !== null && totalWeight > 0 ? c.weight / totalWeight : 0
        const inputs = Object.entries(c.inputs ?? {})
        return (
          <li key={key} className="border-t border-line first:border-t-0">
            <details className="group">
              <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-5 py-3 sm:grid-cols-[180px_minmax(0,1fr)_48px_72px]">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                  <ChevronRight aria-hidden className="size-3.5 text-muted transition-transform group-open:rotate-90" />
                  {labels[key] ?? key}
                </span>
                <span className="order-3 col-span-2 sm:order-none sm:col-span-1">
                  <span className="relative block h-2 overflow-hidden rounded-full bg-accent-soft" aria-hidden>
                    {c.score !== null ? <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, c.score))}%` }} /> : null}
                  </span>
                </span>
                <span className={cn('tabular text-right text-[14px] font-semibold', c.score === null ? 'text-muted' : 'text-ink')}>{c.score === null ? 'n/a' : Math.round(c.score)}</span>
                <span className="tabular hidden text-right text-[12px] text-muted sm:block" title="Share of the total weight among components with data">
                  {c.score === null ? 'excluded' : `${Math.round(share * 100)}% weight`}
                </span>
              </summary>
              <div className="px-5 pb-3.5 pl-10 text-[13px]">
                <p className="text-ink-2">{c.explanation}</p>
                {inputs.length ? (
                  <dl className="mt-2 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-1 text-[12px]">
                    {inputs.map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-muted">{humanize(k)}</dt>
                        <dd className="tabular text-ink">{formatInput(v)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </details>
          </li>
        )
      })}
    </ul>
  )
}
