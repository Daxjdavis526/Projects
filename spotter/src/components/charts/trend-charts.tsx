'use client'

import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { Platform } from '@/core/domain/types'
import { PLATFORM_LABEL } from '@/core/domain/types'
import { ChartFrame, TooltipBox, compactNumber, formatDay, formatDayTime } from './chart-frame'

const AXIS = { stroke: 'var(--axis)', tick: { fill: 'var(--muted)', fontSize: 11 }, tickLine: false, axisLine: { stroke: 'var(--axis)' } } as const
const GRID = { stroke: 'var(--grid)', strokeWidth: 1, vertical: false } as const
const STAGE_NAME: Record<string, string> = { emerging: 'Emerging', accelerating: 'Accelerating', mature: 'Mature', declining: 'Declining' }

export interface HistoryPoint {
  t: number
  score: number
  confidence: number
  stage: string
  momentum: number | null
  viewsPerHour: number | null
  posts3d: number | null
}

/** A single-series line over time with a crosshair tooltip and an end marker. */
function TimeLine({
  data,
  dataKey,
  timeZone,
  domain,
  format,
  label,
  extra,
}: {
  data: Array<Record<string, number | string | null>>
  dataKey: string
  timeZone: string
  domain?: [number, number]
  format: (v: number) => string
  label: string
  extra?: (row: Record<string, number | string | null>) => Array<{ label: string; value: string }>
}) {
  const last = data.length - 1
  return (
    <LineChart responsive style={{ width: '100%', height: 210 }} data={data} margin={{ top: 12, right: 18, bottom: 0, left: 0 }}>
      <CartesianGrid {...GRID} />
      <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(t: number) => formatDay(t, timeZone)} minTickGap={36} {...AXIS} />
      <YAxis domain={domain ?? [0, 'auto']} tickFormatter={(v: number) => format(v)} width={44} {...AXIS} axisLine={false} />
      <Tooltip
        cursor={{ stroke: 'var(--axis)', strokeWidth: 1 }}
        content={({ active, payload }) => {
          if (!active || !payload?.length) return null
          const row = payload[0]!.payload as Record<string, number | string | null>
          const v = row[dataKey]
          return (
            <TooltipBox
              heading={formatDayTime(row.t as number, timeZone)}
              rows={[{ label, value: typeof v === 'number' ? format(v) : '—', color: 'var(--accent)' }, ...(extra ? extra(row) : [])]}
            />
          )
        }}
      />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        connectNulls
        isAnimationActive={false}
        dot={(props: { cx?: number; cy?: number; index?: number }) =>
          props.index === last && props.cx !== undefined && props.cy !== undefined ? (
            <circle key="end" cx={props.cx} cy={props.cy} r={4} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
          ) : (
            <g key={props.index} />
          )
        }
        activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }}
      />
    </LineChart>
  )
}

export function ScoreHistoryChart({ history, timeZone }: { history: HistoryPoint[]; timeZone: string }) {
  const data = history.map((h) => ({ ...h }))
  return (
    <ChartFrame
      title="Trend Score over time"
      subtitle="Recomputed after every collection run"
      table={{ columns: ['Time', 'Trend Score', 'Confidence', 'Stage'], rows: history.map((h) => [formatDayTime(h.t, timeZone), Math.round(h.score), Math.round(h.confidence), STAGE_NAME[h.stage] ?? h.stage]) }}
    >
      <TimeLine
        data={data}
        dataKey="score"
        timeZone={timeZone}
        domain={[0, 100]}
        format={(v) => String(Math.round(v))}
        label="Trend Score"
        extra={(row) => [
          { label: 'Confidence', value: String(Math.round(Number(row.confidence))) },
          { label: 'Stage', value: STAGE_NAME[String(row.stage)] ?? String(row.stage) },
        ]}
      />
    </ChartFrame>
  )
}

export function MomentumChart({ history, timeZone }: { history: HistoryPoint[]; timeZone: string }) {
  const data = history.filter((h) => h.momentum !== null).map((h) => ({ ...h }))
  return (
    <ChartFrame
      title="Momentum"
      subtitle="Posts in the trailing 3 days, each weighted by how far it beat its creator’s normal"
      table={{ columns: ['Time', 'Momentum', 'Posts in 3 days'], rows: data.map((h) => [formatDayTime(h.t, timeZone), (h.momentum ?? 0).toFixed(1), h.posts3d ?? '—']) }}
    >
      <TimeLine
        data={data}
        dataKey="momentum"
        timeZone={timeZone}
        format={(v) => (Math.round(v * 10) / 10).toString()}
        label="Momentum"
        extra={(row) => [{ label: 'Posts in 3 days', value: String(row.posts3d ?? '—') }]}
      />
    </ChartFrame>
  )
}

export function ViewsPerHourChart({ history, timeZone }: { history: HistoryPoint[]; timeZone: string }) {
  const data = history.filter((h) => h.viewsPerHour !== null).map((h) => ({ ...h }))
  if (data.length === 0) {
    return (
      <ChartFrame title="Views per hour" table={{ columns: ['Time', 'Views/hour'], rows: [] }}>
        <p className="px-4 py-10 text-center text-[13px] text-muted">No view counts over time for these posts: the platforms involved do not expose them.</p>
      </ChartFrame>
    )
  }
  return (
    <ChartFrame
      title="Views per hour"
      subtitle="All tracked posts in the trend combined. Big accounts dominate this number, so the stage uses momentum instead."
      table={{ columns: ['Time', 'Views/hour'], rows: data.map((h) => [formatDayTime(h.t, timeZone), Math.round(h.viewsPerHour ?? 0).toLocaleString('en-US')]) }}
    >
      <TimeLine data={data} dataKey="viewsPerHour" timeZone={timeZone} format={compactNumber} label="Views/hour" />
    </ChartFrame>
  )
}

export interface DayCount {
  day: string
  t: number
  youtube: number
  instagram: number
  tiktok: number
}

const PLATFORM_ORDER: Platform[] = ['youtube', 'instagram', 'tiktok']

/** New posts per day by platform: stacked columns, 2px surface gaps, rounded top. */
export function PostsPerDayChart({ days, timeZone, platforms }: { days: DayCount[]; timeZone: string; platforms: Platform[] }) {
  const present = PLATFORM_ORDER.filter((p) => platforms.includes(p))
  const top = present.at(-1)
  return (
    <ChartFrame
      title="New posts per day"
      subtitle="By publication date, including posts discovered later"
      legend={present.map((p) => ({ label: PLATFORM_LABEL[p], color: `var(--${p})` }))}
      table={{ columns: ['Day', ...present.map((p) => PLATFORM_LABEL[p]), 'Total'], rows: days.map((d) => [formatDay(d.t, timeZone), ...present.map((p) => d[p]), present.reduce((s, p) => s + d[p], 0)]) }}
    >
      <BarChart responsive style={{ width: '100%', height: 210 }} data={days} margin={{ top: 12, right: 18, bottom: 0, left: 0 }} barCategoryGap="22%">
        <CartesianGrid {...GRID} />
        <XAxis dataKey="t" tickFormatter={(t: number) => formatDay(t, timeZone)} minTickGap={24} {...AXIS} />
        <YAxis allowDecimals={false} width={32} {...AXIS} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'var(--surface-2)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const row = payload[0]!.payload as DayCount
            return (
              <TooltipBox
                heading={formatDay(row.t, timeZone)}
                rows={[...present.map((p) => ({ label: PLATFORM_LABEL[p], value: String(row[p]), color: `var(--${p})` })), { label: 'Total', value: String(present.reduce((s, p) => s + row[p], 0)) }]}
              />
            )
          }}
        />
        {present.map((p) => (
          <Bar
            key={p}
            dataKey={p}
            stackId="posts"
            fill={`var(--${p})`}
            stroke="var(--surface)"
            strokeWidth={2}
            maxBarSize={24}
            radius={p === top ? [4, 4, 0, 0] : 0}
            isAnimationActive={false}
            name={PLATFORM_LABEL[p]}
          />
        ))}
      </BarChart>
    </ChartFrame>
  )
}

export interface SizeBucket {
  label: string
  creators: number
}

/** Who is posting it: creators by follower count. One series, labels on the caps. */
export function CreatorSizeChart({ buckets }: { buckets: SizeBucket[] }) {
  return (
    <ChartFrame
      title="Creator sizes"
      subtitle="Independent creators in this trend, by followers"
      table={{ columns: ['Followers', 'Creators'], rows: buckets.map((b) => [b.label, b.creators]) }}
    >
      <BarChart responsive style={{ width: '100%', height: 210 }} data={buckets} margin={{ top: 22, right: 18, bottom: 0, left: 0 }} barCategoryGap="30%">
        <CartesianGrid {...GRID} />
        <XAxis dataKey="label" {...AXIS} interval={0} />
        <YAxis allowDecimals={false} width={32} {...AXIS} axisLine={false} />
        <Tooltip
          cursor={{ fill: 'var(--surface-2)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const row = payload[0]!.payload as SizeBucket
            return <TooltipBox heading={`${row.label} followers`} rows={[{ label: 'Creators', value: String(row.creators), color: 'var(--accent)' }]} />
          }}
        />
        <Bar dataKey="creators" fill="var(--accent)" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
          <LabelList dataKey="creators" position="top" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ChartFrame>
  )
}

/** A daily account metric (one platform, one measure) — one series per chart, never two y-scales. */
export function DailySeriesChart({ title, subtitle, points, timeZone }: { title: string; subtitle?: string; points: Array<{ t: number; value: number }>; timeZone: string }) {
  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      table={{ columns: ['Day', 'Value'], rows: points.map((p) => [formatDay(p.t, timeZone), Math.round(p.value).toLocaleString('en-US')]) }}
    >
      {points.length > 1 ? (
        <TimeLine data={points.map((p) => ({ ...p }))} dataKey="value" timeZone={timeZone} format={compactNumber} label={title} />
      ) : (
        <p className="px-4 py-10 text-center text-[13px] text-muted">Not enough days collected yet.</p>
      )}
    </ChartFrame>
  )
}
