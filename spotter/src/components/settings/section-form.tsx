'use client'

import { useActionState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { saveSettingsSection, type SaveState } from '@/server/actions/settings'
import { Button } from '@/components/ui/primitives'

/** A settings section: its own form, save button and result message. */
export function SectionForm({ id, title, description, children }: { id: string; title: string; description?: React.ReactNode; children: React.ReactNode }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveSettingsSection, { ok: false, message: null })
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-line bg-surface shadow-card">
      <form action={action}>
        <input type="hidden" name="section" value={id} />
        <div className="px-5 pt-5 pb-1">
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-1 max-w-3xl text-[13px] text-ink-2">{description}</p> : null}
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? 'Saving…' : 'Save'}
          </Button>
          {state.message ? (
            <span role="status" className={`inline-flex items-center gap-1.5 text-[13px] ${state.ok ? 'text-good-text' : 'text-critical-text'}`}>
              {state.ok ? <CheckCircle2 aria-hidden className="size-4" /> : <XCircle aria-hidden className="size-4" />}
              {state.message}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  )
}
