/**
 * A tiny, non-interactive trend line for lists: the de-emphasis hue for the
 * history, the accent for the current point. The exact values are always
 * beside it (the score) or on the trend page (chart + table).
 */
export function Sparkline({ points, width = 96, height = 28, label }: { points: Array<{ t: number; score: number }>; width?: number; height?: number; label: string }) {
  if (points.length < 2) return <span className="inline-block text-[11px] text-muted" style={{ width }}>new</span>
  const xs = points.map((p) => p.t)
  const ys = points.map((p) => p.score)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.max(0, Math.min(...ys) - 5)
  const maxY = Math.min(100, Math.max(...ys) + 5)
  const pad = 4
  const x = (t: number) => pad + ((t - minX) / Math.max(1, maxX - minX)) * (width - pad * 2)
  const y = (v: number) => height - pad - ((v - minY) / Math.max(1, maxY - minY)) * (height - pad * 2)
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ')
  const last = points.at(-1)!
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="shrink-0 overflow-visible">
      <path d={d} fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" opacity={0.7} />
      <circle cx={x(last.t)} cy={y(last.score)} r={3.5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
    </svg>
  )
}
