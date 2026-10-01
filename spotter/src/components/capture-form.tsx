'use client'

import { useActionState } from 'react'
import { capturePost, type CaptureState } from '@/server/actions/capture'
import { Button, Callout } from '@/components/ui/primitives'
import { Field, compactInputClass } from '@/components/ui/fields'

export function CaptureForm() {
  const [state, action, pending] = useActionState<CaptureState, FormData>(capturePost, { ok: false, message: null })
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.message ? <Callout tone={state.ok ? 'good' : 'critical'}>{state.message}</Callout> : null}
      <Field label="Post link" hint="YouTube video or Short, Instagram post or Reel, or TikTok video. SPOTTER does not open the link.">
        <input name="url" type="url" required placeholder="https://www.tiktok.com/@creator/video/…" className={compactInputClass} />
      </Field>
      <Field label="Caption or title, as shown">
        <textarea name="text" rows={3} className={`${compactInputClass} h-auto py-2`} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Creator handle">
          <input name="handle" placeholder="@creator" className={compactInputClass} />
        </Field>
        <Field label="Their followers">
          <input name="followers" placeholder="e.g. 48k" className={compactInputClass} />
        </Field>
        <Field label="Posted">
          <input name="postedAt" type="datetime-local" className={compactInputClass} />
        </Field>
        <Field label="Views">
          <input name="views" placeholder="e.g. 1.2m" className={compactInputClass} />
        </Field>
        <Field label="Likes">
          <input name="likes" className={compactInputClass} />
        </Field>
        <Field label="Comments">
          <input name="comments" className={compactInputClass} />
        </Field>
      </div>
      <div>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save post'}
        </Button>
      </div>
    </form>
  )
}
