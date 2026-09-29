'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { X } from 'lucide-react'
import { PLATFORM_LABEL, PLATFORMS, TREND_STAGES } from '@/core/domain/types'
import { RANGES } from '@/lib/filters'
import { cn } from '@/lib/cn'

const STAGE_LABEL = { emerging: 'Emerging', accelerating: 'Accelerating', mature: 'Mature', declining: 'Declining' } as const
const RANGE_LABEL: Record<keyof typeof RANGES, string> = { '1d': 'Last 24 hours', '3d': 'Last 3 days', '7d': 'Last 7 days', '14d': 'Last 14 days', '30d': 'Last 30 days' }

function Select({ label, name, value, onChange, children }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative flex min-w-0 flex-col">
      <span className="sr-only">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={cn(
          'h-9 max-w-[230px] min-w-0 appearance-none truncate rounded-xl border border-line-strong bg-surface py-0 pr-8 pl-3 text-[13px] font-medium text-ink',
          'bg-[length:12px] bg-[position:right_10px_center] bg-no-repeat',
          value ? '' : 'text-ink-2',
        )}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5l3 3 3-3' fill='none' stroke='%237a7873' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")" }}
        aria-label={label}
      >
        {children}
      </select>
    </label>
  )
}

/**
 * One row of filters above everything they scope. State lives in the URL, so
 * views are linkable; without JavaScript the form still submits as a GET.
 */
export function FilterBar({ topics, showRange = true, showStage = true, defaultRange = '14d' }: { topics: Array<{ key: string; label: string }>; showRange?: boolean; showStage?: boolean; defaultRange?: keyof typeof RANGES }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const get = (k: string) => params.get(k) ?? ''
  const update = (name: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(name, value)
    else next.delete(name)
    startTransition(() => router.push(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false }))
  }
  const active = ['platform', 'topic', 'stage', 'conf', 'range'].some((k) => params.get(k))
  return (
    <form method="get" className={cn('mb-6 flex flex-wrap items-center gap-2 transition-opacity', pending && 'opacity-60')} aria-label="Filters">
      {showRange ? (
        <Select label="Time range" name="range" value={get('range') || defaultRange} onChange={update}>
          {Object.keys(RANGES).map((k) => (
            <option key={k} value={k}>
              {RANGE_LABEL[k as keyof typeof RANGES]}
            </option>
          ))}
        </Select>
      ) : null}
      <Select label="Platform" name="platform" value={get('platform')} onChange={update}>
        <option value="">All platforms</option>
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>
            {PLATFORM_LABEL[p]}
          </option>
        ))}
      </Select>
      <Select label="Topic" name="topic" value={get('topic')} onChange={update}>
        <option value="">All topics</option>
        {topics.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </Select>
      {showStage ? (
        <Select label="Stage" name="stage" value={get('stage')} onChange={update}>
          <option value="">All stages</option>
          {TREND_STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABEL[s]}
            </option>
          ))}
        </Select>
      ) : null}
      <Select label="Minimum confidence" name="conf" value={get('conf')} onChange={update}>
        <option value="">Any confidence</option>
        <option value="45">Confidence 45+</option>
        <option value="60">Confidence 60+</option>
        <option value="75">Confidence 75+</option>
        <option value="90">Confidence 90+</option>
      </Select>
      {active ? (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}
          className="inline-flex h-9 items-center gap-1 rounded-xl px-2.5 text-[13px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <X aria-hidden className="size-3.5" />
          Clear
        </button>
      ) : null}
      <noscript>
        <button type="submit" className="h-9 rounded-xl border border-line-strong px-3 text-[13px]">
          Apply
        </button>
      </noscript>
    </form>
  )
}
