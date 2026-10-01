import { multiple } from '@/lib/format'

/**
 * Diverging bars around "your normal" (1×): above in the accent, below in
 * red, on a log scale so 2× and 0.5× are the same distance from the middle.
 * Values are printed beside every bar, so color never carries them alone.
 */
export function LiftBars({ rows }: { rows: Array<{ value: string; lift: number; postCount: number; confidence: number }> }) {
  const maxLog = Math.max(Math.log(2), ...rows.map((r) => Math.abs(Math.log(r.lift))))
  return (
    <ul className="flex flex-col gap-1.5">
      {rows.map((r) => {
        const log = Math.log(r.lift)
        const width = Math.min(50, (Math.abs(log) / maxLog) * 50)
        const up = log >= 0
        return (
          <li key={r.value} className="grid grid-cols-[minmax(0,150px)_minmax(0,1fr)_88px] items-center gap-3 text-[13px]">
            <span className="truncate text-ink" title={r.value}>
              {r.value}
            </span>
            <span className="relative h-4" aria-hidden>
              <span className="absolute inset-y-0 left-1/2 w-px bg-axis" style={{ background: 'var(--axis)' }} />
              <span
                className="absolute top-1/2 h-2.5 -translate-y-1/2"
                style={{
                  left: up ? '50%' : `${50 - width}%`,
                  width: `${Math.max(width, 0.6)}%`,
                  background: up ? 'var(--accent)' : 'var(--critical)',
                  borderRadius: up ? '0 4px 4px 0' : '4px 0 0 4px',
                  opacity: 0.35 + 0.65 * Math.min(1, r.confidence * 1.5),
                }}
              />
            </span>
            <span className="tabular text-right">
              <span className="font-semibold text-ink">{multiple(r.lift)}</span> <span className="text-[12px] text-muted">· {r.postCount}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
