/** Form field styling shared by server and client components. */
import { cn } from '@/lib/cn'

export const inputClass =
  'h-11 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

export const compactInputClass =
  'h-9 w-full rounded-xl border border-line-strong bg-surface px-3 text-[14px] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

export function Field({ label, hint, children, className }: { label: React.ReactNode; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="text-[12px] text-muted">{hint}</span> : null}
    </label>
  )
}
