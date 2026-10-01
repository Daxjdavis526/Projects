'use client'

import { useActionState } from 'react'
import { signIn, type FormState } from '@/server/auth/actions'
import { Button, Callout } from '@/components/ui/primitives'
import { inputClass } from '@/components/ui/fields'

export function SignInForm({ returnTo }: { returnTo: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, { error: null })
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      {state.error ? <Callout tone="critical">{state.error}</Callout> : null}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink">Email</span>
        <input name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      <Button type="submit" variant="primary" size="lg" disabled={pending} className="mt-1">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
