import Link from 'next/link'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-xl" aria-label="SPOTTER home">
      <svg aria-hidden viewBox="0 0 64 64" className="size-8 shrink-0">
        <rect width="64" height="64" rx="16" fill="var(--ink)" />
        <path d="M14 44 L26 30 L34 37 L50 19" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="19" r="5" fill="var(--plane)" />
      </svg>
      {compact ? null : (
        <span className="leading-none">
          <span className="block text-[15px] font-bold tracking-[0.12em] text-ink">SPOTTER</span>
          <span className="mt-1 block text-[11px] font-medium text-muted">Trend intelligence</span>
        </span>
      )}
    </Link>
  )
}
