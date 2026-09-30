import Link from 'next/link'
import type { TrendRow } from '@/server/queries/trends'
import { EmptyState } from '@/components/ui/primitives'
import { Sparkline } from '@/components/sparkline'
import { multiple } from '@/lib/format'

export function TrendMiniList({ rows, empty }: { rows: TrendRow[]; empty: string }) {
  if (!rows.length) return <EmptyState title="Nothing here right now">{empty}</EmptyState>
  return (
    <ul className="flex flex-col">
      {rows.map((r) => (
        <li key={r.id} className="border-t border-line first:border-t-0">
          <Link href={`/trends/${r.id}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-surface-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-ink">{r.label}</div>
              <div className="text-[12px] text-muted">
                {r.postsLast3Days ?? 0} posts in 3 days{r.momentumPerDay ? ` · ${multiple(r.momentumPerDay)}/day` : ''}
              </div>
            </div>
            <Sparkline points={r.history} width={64} height={24} label={`Trend Score history for ${r.label}`} />
            <span className="tabular w-7 text-right text-[14px] font-semibold text-ink">{r.trendScore === null ? '—' : Math.round(r.trendScore)}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
