'use client'

import { useActionState, useSyncExternalStore } from 'react'
import { createFirstAccount, type FormState } from '@/server/auth/actions'
import { Button, Callout } from '@/components/ui/primitives'
import { Field, inputClass } from '@/components/ui/fields'

export function CreateAccountForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createFirstAccount, { error: null })
  // The browser's zone, read without a hydration mismatch (the server renders "UTC").
  const timezone = useSyncExternalStore(
    () => () => {},
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    () => 'UTC',
  )
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="timezone" value={timezone} />
      {state.error ? <Callout tone="critical">{state.error}</Callout> : null}
      <Field label="Your name">
        <input name="displayName" required maxLength={80} autoComplete="name" defaultValue={state.values?.displayName} className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" defaultValue={state.values?.email} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" hint="At least 10 characters">
          <input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
        </Field>
        <Field label="Confirm password">
          <input name="confirm" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
        </Field>
      </div>
      <p className="text-[12px] text-muted">This account lives only on this server. Your time zone ({timezone}) is used for the collection schedule; you can change it later.</p>
      <p className="text-[12px] text-muted">
        By creating an account you agree to the{' '}
        <a href="/privacy" target="_blank" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
          privacy policy
        </a>{' '}
        and{' '}
        <a href="/terms" target="_blank" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
          terms of use
        </a>
        , including the YouTube Terms of Service.
      </p>
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? 'Creating…' : 'Create account'}
      </Button>
    </form>
  )
}
