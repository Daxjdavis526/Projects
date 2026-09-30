'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/core/db/client'
import { recommendations } from '@/core/db/schema'
import { getProfileFor, requireUser } from '../auth/session'

const STATUSES = ['new', 'saved', 'dismissed', 'used'] as const

/** Save, dismiss or mark a recommendation as used. Scoped to the signed-in creator's own rows. */
export async function setRecommendationStatus(form: FormData): Promise<void> {
  const user = await requireUser()
  const profile = await getProfileFor(user.id)
  if (!profile) return
  const id = String(form.get('id') ?? '')
  const status = String(form.get('status') ?? '')
  if (!/^[0-9a-f-]{36}$/.test(id) || !(STATUSES as readonly string[]).includes(status)) return
  const db = await getDb()
  await db
    .update(recommendations)
    .set({ status: status as (typeof STATUSES)[number] })
    .where(and(eq(recommendations.id, id), eq(recommendations.creatorProfileId, profile.id)))
  revalidatePath('/')
  revalidatePath('/history')
}
