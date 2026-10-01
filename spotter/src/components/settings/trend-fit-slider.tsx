'use client'

import { useState } from 'react'

/** Opportunity = w × Trend Score + (1 − w) × Creator Fit, with a worked example. */
export function TrendFitSlider({ initial }: { initial: number }) {
  const [w, setW] = useState(initial)
  const example = (trend: number, fit: number) => Math.round((w / 100) * trend + (1 - w / 100) * fit)
  return (
    <div className="rounded-xl border border-line bg-surface-2/60 p-4">
      <label className="flex flex-col gap-2">
        <span className="flex items-baseline justify-between text-[13px]">
          <span className="font-medium text-ink">Opportunity balance</span>
          <span className="tabular text-ink-2">
            {w}% Trend · {100 - w}% Fit
          </span>
        </span>
        <input type="range" name="trendWeight" min={0} max={100} value={w} onChange={(e) => setW(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
      </label>
      <p className="mt-2 text-[12px] text-ink-2">
        With this balance a trend scoring <b>96</b> that fits you <b>31</b> gets <b className="tabular text-ink">{example(96, 31)}</b>, while one scoring <b>86</b> that fits <b>94</b> gets{' '}
        <b className="tabular text-ink">{example(86, 94)}</b>
        {example(86, 94) > example(96, 31) ? ' — the better fit ranks first.' : ' — the hotter trend ranks first.'}
      </p>
    </div>
  )
}
