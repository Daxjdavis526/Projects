'use server'

import { revalidatePath } from 'next/cache'
import { getEnv } from '@/core/config/env'
import { CaptureError, deleteCapture, saveCapture } from '@/core/assisted/capture'
import { getDb } from '@/core/db/client'
import { getProfileFor, requireUser } from '../auth/session'

export interface CaptureState {
  ok: boolean
  message: string | null
}

const num = (v: FormDataEntryValue | null): number | null => {
  const s = String(v ?? '').trim().toLowerCase().replace(/,/g, '')
  if (!s) return null
  const m = /^(\d+(?:\.\d+)?)\s*([km])?$/.exec(s)
  if (!m) return null
  return Number(m[1]) * (m[2] === 'm' ? 1e6 : m[2] === 'k' ? 1e3 : 1)
}

export async function capturePost(_prev: CaptureState, form: FormData): Promise<CaptureState> {
  if (!getEnv().ASSISTED_DISCOVERY_ENABLED) return { ok: false, message: 'Assisted discovery is turned off on this server.' }
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile) return { ok: false, message: 'Finish setup first.' }
  if (profile.dataMode !== 'live') return { ok: false, message: 'Captured posts belong to live data. Switch the workspace to live data first.' }
  const postedAt = String(form.get('postedAt') ?? '')
  try {
    await saveCapture(
      await getDb(),
      {
        url: String(form.get('url') ?? '').slice(0, 500),
        text: String(form.get('text') ?? '') || null,
        creatorHandle: String(form.get('handle') ?? '') || null,
        creatorFollowers: num(form.get('followers')),
        views: num(form.get('views')),
        likes: num(form.get('likes')),
        comments: num(form.get('comments')),
        postedAt: postedAt ? new Date(postedAt) : null,
      },
      new Date(),
    )
  } catch (err) {
    if (err instanceof CaptureError) return { ok: false, message: err.message }
    throw err
  }
  revalidatePath('/capture')
  return { ok: true, message: 'Saved. It will be analysed with the next collection run.' }
}

export async function removeCapture(form: FormData): Promise<void> {
  if (!getEnv().ASSISTED_DISCOVERY_ENABLED) return
  await requireUser()
  const id = String(form.get('id') ?? '')
  if (!/^[0-9a-f-]{36}$/.test(id)) return
  await deleteCapture(await getDb(), id)
  revalidatePath('/capture')
}
