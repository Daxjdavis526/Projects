'use client'

import { useActionState } from 'react'
import { Wand2 } from 'lucide-react'
import { draftBrief, type BriefState } from '@/server/actions/briefs'
import { Button, Callout } from '@/components/ui/primitives'

export function DraftBriefButton({ clusterId, label = 'Draft a video brief' }: { clusterId: string; label?: string }) {
  const [state, action, pending] = useActionState<BriefState, FormData>(draftBrief, { error: null })
  return (
    <form action={action} className="flex flex-col items-start gap-3">
      <input type="hidden" name="clusterId" value={clusterId} />
      <Button type="submit" variant="primary" disabled={pending}>
        <Wand2 aria-hidden className="size-4" />
        {pending ? 'Drafting…' : label}
      </Button>
      {state.error ? <Callout tone="critical">{state.error}</Callout> : null}
    </form>
  )
}
