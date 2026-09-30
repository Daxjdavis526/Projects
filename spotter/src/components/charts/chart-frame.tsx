'use client'

import { useState } from 'react'
import { Table2, LineChart as LineIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Card chrome for a chart: title, optional legend, and a chart/table switch.
 * Every chart has a table twin, so no value is reachable only by hovering.
 */
export function ChartFrame({
  title,
  subtitle,
  legend,
  table,
  children,
  className,
}: {
  title: string
  subtitle?: string
  legend?: Array<{ label: string; color: string; kind?: 'line' | 'box' }>
  table: { columns: string[]; rows: Array<Array<string | number>> }
  children: React.ReactNode
  className?: string
}) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  return (
    <section className={cn('rounded-2xl border border-line bg-surface shadow-card', className)}>
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-[12px] text-ink-2">{subtitle}</p> : null}
        </div>
        <div role="tablist" aria-label={`${title} view`} className="inline-flex shrink-0 rounded-lg border border-line bg-surface-2 p-0.5">
          {(['chart', 'table'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              type="button"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn('grid size-7 place-items-center rounded-md text-muted', view === v && 'bg-surface text-ink shadow-card')}
              title={v === 'chart' ? 'Chart' : 'Table'}
            >
              {v === 'chart' ? <LineIcon aria-hidden className="size-3.5" /> : <Table2 aria-hidden className="size-3.5" />}
              <span className="sr-only">{v === 'chart' ? 'Show chart' : 'Show table'}</span>
            </button>
          ))}
        </div>
      </div>
      {legend && legend.length > 1 && view === 'chart' ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-5 pt-2 text-[12px] text-ink-2">
          {legend.map((l) => (
            <li key={l.label} className="inline-flex items-center gap-1.5">
              {l.kind === 'line' ? (
                <span aria-hidden className="inline-block h-0.5 w-3.5 rounded-full" style={{ background: l.color }} />
              ) : (
                <span aria-hidden className="inline-block size-2.5 rounded-[3px]" style={{ background: l.color }} />
              )}
              {l.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="px-2 pt-2 pb-3">
        {view === 'chart' ? (
          children
        ) : (
          <div className="max-h-[260px] overflow-auto px-3">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-surface">
                <tr>
                  {table.columns.map((c, i) => (
                    <th key={c} className={cn('border-b border-line py-1.5 font-semibold text-muted', i ? 'text-right' : 'text-left')}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, i) => (
                      <td key={i} className={cn('tabular border-b border-line py-1.5 text-ink-2', i ? 'text-right' : 'text-left')}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

/** Tooltip body: values lead, labels follow; series keyed with a short line. */
export function TooltipBox({ heading, rows }: { heading: string; rows: Array<{ label: string; value: string; color?: string }> }) {
  return (
    <div className="min-w-[150px] rounded-xl border border-line bg-surface px-3 py-2 text-[12px] shadow-pop">
      <div className="mb-1 text-muted">{heading}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-ink-2">
            {r.color ? <span aria-hidden className="inline-block h-0.5 w-3 rounded-full" style={{ background: r.color }} /> : null}
            {r.label}
          </span>
          <span className="tabular font-semibold text-ink">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

export function formatDay(t: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone }).format(new Date(t))
}

export function formatDayTime(t: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone }).format(new Date(t))
}

export function compactNumber(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e6) return `${Math.round((n / 1e6) * 10) / 10}M`
  if (abs >= 1e4) return `${Math.round(n / 1e3)}K`
  if (abs >= 1e3) return `${Math.round((n / 1e3) * 10) / 10}K`
  return String(Math.round(n))
}
