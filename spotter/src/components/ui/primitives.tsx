/**
 * Small, server-safe UI primitives. Interactive pieces live in their own
 * client components.
 */
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Info,
  Minus,
  Sparkles,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { Platform, TrendStage } from '@/core/domain/types'
import { PLATFORM_LABEL } from '@/core/domain/types'
import { cn } from '@/lib/cn'

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function Card({ className, children, as: Tag = 'section', ...rest }: React.HTMLAttributes<HTMLElement> & { as?: 'section' | 'article' | 'div' }) {
  return (
    <Tag className={cn('rounded-2xl border border-line bg-surface shadow-card', className)} {...rest}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, subtitle, action, className }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pt-4 pb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[13px] text-ink-2">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function PageHeader({ title, description, actions, eyebrow }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{eyebrow}</div> : null}
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {description ? <p className="mt-1.5 max-w-3xl text-[14px] text-ink-2">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap'
const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: 'border border-line-strong bg-surface text-critical-text hover:bg-critical-soft',
}
const buttonSizes = { sm: 'h-8 px-3 text-[13px]', md: 'h-10 px-4 text-[14px]', lg: 'h-11 px-5 text-[15px]' }

export function buttonClass(variant: ButtonVariant = 'secondary', size: keyof typeof buttonSizes = 'md', className?: string): string {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: keyof typeof buttonSizes }) {
  return <button className={buttonClass(variant, size, className)} {...rest} />
}

export function ButtonLink({
  href,
  variant = 'secondary',
  size = 'md',
  className,
  children,
  external,
}: {
  href: string
  variant?: ButtonVariant
  size?: keyof typeof buttonSizes
  className?: string
  children: React.ReactNode
  external?: boolean
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={buttonClass(variant, size, className)}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

type Tone = 'neutral' | 'accent' | 'good' | 'warning' | 'critical'
const toneClass: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-2 border-line',
  accent: 'bg-accent-soft text-accent-text border-transparent',
  good: 'bg-good-soft text-good-text border-transparent',
  warning: 'bg-warning-soft text-warning-text border-transparent',
  critical: 'bg-critical-soft text-critical-text border-transparent',
}

export function Badge({ tone = 'neutral', icon: Icon, children, className, title }: { tone?: Tone; icon?: LucideIcon; children: React.ReactNode; className?: string; title?: string }) {
  return (
    <span title={title} className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] leading-5 font-medium whitespace-nowrap', toneClass[tone], className)}>
      {Icon ? <Icon aria-hidden className="size-3.5" strokeWidth={2.25} /> : null}
      {children}
    </span>
  )
}

const STAGE_META: Record<TrendStage, { label: string; icon: LucideIcon; color: string; soft: string }> = {
  emerging: { label: 'Emerging', icon: Sparkles, color: 'var(--stage-emerging)', soft: 'var(--stage-emerging-soft)' },
  accelerating: { label: 'Accelerating', icon: TrendingUp, color: 'var(--stage-accelerating)', soft: 'var(--stage-accelerating-soft)' },
  mature: { label: 'Mature', icon: Minus, color: 'var(--stage-mature)', soft: 'var(--stage-mature-soft)' },
  declining: { label: 'Declining', icon: ArrowDownRight, color: 'var(--stage-declining)', soft: 'var(--stage-declining-soft)' },
}

export function StageBadge({ stage, className, estimated }: { stage: TrendStage; className?: string; estimated?: boolean }) {
  const meta = STAGE_META[stage]
  const Icon = meta.icon
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] leading-5 font-semibold whitespace-nowrap', className)}
      style={{ color: meta.color, background: meta.soft }}
      title={estimated ? 'Based on only a handful of posts so far' : undefined}
    >
      <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
      {meta.label}
      {estimated ? <span className="font-normal opacity-80">· early</span> : null}
    </span>
  )
}

export function PlatformDot({ platform, className }: { platform: Platform; className?: string }) {
  return <span aria-hidden className={cn('inline-block size-2 shrink-0 rounded-full', className)} style={{ background: `var(--${platform})` }} />
}

export function PlatformTag({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-2', className)}>
      <PlatformDot platform={platform} />
      {PLATFORM_LABEL[platform]}
    </span>
  )
}

export function PlatformList({ platforms }: { platforms: Platform[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {platforms.map((p) => (
        <PlatformTag key={p} platform={p} />
      ))}
    </span>
  )
}

export type StatusKind = 'good' | 'warning' | 'serious' | 'critical' | 'idle'
const STATUS_META: Record<StatusKind, { icon: LucideIcon; tone: Tone }> = {
  good: { icon: CheckCircle2, tone: 'good' },
  warning: { icon: AlertTriangle, tone: 'warning' },
  serious: { icon: AlertTriangle, tone: 'warning' },
  critical: { icon: XCircle, tone: 'critical' },
  idle: { icon: CircleDashed, tone: 'neutral' },
}

/** State always carries an icon and a word, never color alone. */
export function StatusBadge({ status, children, title }: { status: StatusKind; children: React.ReactNode; title?: string }) {
  const meta = STATUS_META[status]
  return (
    <Badge tone={meta.tone} icon={meta.icon} title={title}>
      {children}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

/** A 0–100 score as a meter: the fill is the accent, the track a lighter step of it. */
export function Meter({ value, label, className, size = 'md' }: { value: number | null; label?: string; className?: string; size?: 'sm' | 'md' }) {
  const v = value === null ? null : Math.max(0, Math.min(100, value))
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label ? <span className="w-12 shrink-0 text-[12px] text-muted">{label}</span> : null}
      <div
        className={cn('relative flex-1 overflow-hidden rounded-full bg-accent-soft', size === 'sm' ? 'h-1.5' : 'h-2')}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v ?? undefined}
        aria-label={label}
      >
        {v !== null ? <div className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${v}%` }} /> : null}
      </div>
      <span className="tabular w-7 shrink-0 text-right text-[13px] font-semibold text-ink">{v === null ? '—' : Math.round(v)}</span>
    </div>
  )
}

export function StatTile({ label, value, hint, delta, className }: { label: string; value: React.ReactNode; hint?: React.ReactNode; delta?: { value: string; direction: 'up' | 'down' | 'flat'; good?: boolean } | null; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-card', className)}>
      <div className="text-[12px] font-medium text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-[24px] leading-none font-semibold tracking-[-0.02em] text-ink">{value}</div>
        {delta ? (
          <span
            className={cn(
              'inline-flex items-center text-[12px] font-semibold',
              delta.direction === 'flat' ? 'text-muted' : delta.good ? 'text-good-text' : 'text-critical-text',
            )}
          >
            {delta.direction === 'up' ? <ArrowUpRight aria-hidden className="size-3.5" /> : delta.direction === 'down' ? <ArrowDownRight aria-hidden className="size-3.5" /> : null}
            {delta.value}
          </span>
        ) : null}
      </div>
      {hint ? <div className="mt-1.5 text-[12px] text-ink-2">{hint}</div> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export function Callout({ tone = 'neutral', title, children, icon, className, action }: { tone?: Tone; title?: React.ReactNode; children?: React.ReactNode; icon?: LucideIcon; className?: string; action?: React.ReactNode }) {
  const Icon = icon ?? (tone === 'critical' ? XCircle : tone === 'warning' ? AlertTriangle : tone === 'good' ? CheckCircle2 : Info)
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]', toneClass[tone], className)} role={tone === 'critical' ? 'alert' : 'status'}>
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2.25} />
      <div className="min-w-0 flex-1 text-ink-2">
        {title ? <div className="font-semibold text-ink">{title}</div> : null}
        {children ? <div className={cn(title ? 'mt-0.5' : '')}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function EmptyState({ icon: Icon = CircleDashed, title, children, action }: { icon?: LucideIcon; title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <Icon aria-hidden className="size-6 text-muted" />
      <div className="text-[15px] font-semibold text-ink">{title}</div>
      {children ? <div className="max-w-md text-[13px] text-ink-2">{children}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-line', className)} />
}

/** Label + value rows ("definition list"), for metadata panels. */
export function KeyValues({ rows, className }: { rows: Array<[React.ReactNode, React.ReactNode]>; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]', className)}>
      {rows.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="min-w-0 text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
