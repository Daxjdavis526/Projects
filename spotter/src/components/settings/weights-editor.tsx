'use client'

import { useMemo, useState } from 'react'
import type { ScoreComponent } from '@/core/domain/types'

export interface WeightSample {
  id: string
  label: string
  components: Record<string, ScoreComponent>
  current: number
}

/**
 * Sliders for score weights with a live preview: the trends on screen are
 * re-scored from their stored components as you drag, using the same rule
 * as the engine (weighted mean over the components that have data).
 */
export function WeightsEditor({
  keys,
  labels,
  descriptions,
  initial,
  samples,
}: {
  keys: readonly string[]
  labels: Record<string, string>
  descriptions: Record<string, string>
  initial: Record<string, number>
  samples: WeightSample[]
}) {
  const [values, setValues] = useState<Record<string, number>>(() => Object.fromEntries(keys.map((k) => [k, Math.round((initial[k] ?? 0) * 100)])))
  const total = keys.reduce((s, k) => s + (values[k] ?? 0), 0)
  const preview = useMemo(() => {
    return samples
      .map((s) => {
        let sum = 0
        let weight = 0
        for (const k of keys) {
          const c = s.components[k]
          const w = values[k] ?? 0
          if (!c || c.score === null || w <= 0) continue
          sum += c.score * w
          weight += w
        }
        return { ...s, next: weight ? Math.round((sum / weight) * 10) / 10 : 0 }
      })
      .sort((a, b) => b.next - a.next)
  }, [samples, values, keys])

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <ul className="flex flex-col gap-3.5">
        {keys.map((k) => {
          const share = total ? Math.round(((values[k] ?? 0) / total) * 100) : 0
          return (
            <li key={k}>
              <label className="flex flex-col gap-1">
                <span className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="font-medium text-ink">{labels[k] ?? k}</span>
                  <span className="tabular text-ink-2">
                    {share}% <span className="text-muted">of the score</span>
                  </span>
                </span>
                <input
                  type="range"
                  name={k}
                  min={0}
                  max={100}
                  step={1}
                  value={values[k] ?? 0}
                  onChange={(e) => setValues((v) => ({ ...v, [k]: Number(e.target.value) }))}
                  className="w-full accent-[var(--accent)]"
                  aria-describedby={`${k}-desc`}
                />
                <span id={`${k}-desc`} className="text-[12px] text-muted">
                  {descriptions[k]}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
      <div className="rounded-xl border border-line bg-surface-2/60 p-4">
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Preview on current trends</div>
        {preview.length ? (
          <ol className="flex flex-col gap-1.5 text-[13px]">
            {preview.map((p) => {
              const delta = Math.round(p.next - p.current)
              return (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-ink">{p.label}</span>
                  <span className="tabular shrink-0">
                    <b className="text-ink">{Math.round(p.next)}</b>
                    {delta ? <span className={delta > 0 ? 'text-good-text' : 'text-critical-text'}> {delta > 0 ? `+${delta}` : delta}</span> : null}
                  </span>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="text-[13px] text-muted">No scored trends yet.</p>
        )}
      </div>
    </div>
  )
}
