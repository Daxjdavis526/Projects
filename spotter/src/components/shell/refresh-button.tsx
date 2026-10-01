'use client'

import { useActionState } from 'react'
import { RefreshCw } from 'lucide-react'
import { refreshNow, type RefreshState } from '@/server/actions/runs'
import { buttonClass } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'

export function RefreshButton({ running }: { running: boolean }) {
  const [state, action, pending] = useActionState<RefreshState, FormData>(refreshNow, { message: null, error: null, at: 0 })
  const busy = pending || running
  const text = state.error ?? state.message
  return (
    <form action={action} className="relative">
      <button type="submit" disabled={busy} className={buttonClass('secondary', 'sm')}>
        <RefreshCw aria-hidden className={cn('size-3.5', busy && 'animate-spin')} />
        {running ? 'Collecting…' : pending ? 'Starting…' : 'Refresh now'}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {text}
      </span>
      {text ? (
        // Keyed by the result time: each new result replays the fade-in/out once.
        <span key={state.at} aria-hidden className="toast pointer-events-none absolute right-0 top-10 z-20 w-72 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] text-ink-2 shadow-pop">
          {text}
        </span>
      ) : null}
    </form>
  )
}
