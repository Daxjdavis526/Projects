/**
 * Meta "Data Deletion Request URL": https://<APP_URL>/api/webhooks/meta/data-deletion
 * Deletes immediately and answers with a status URL and confirmation code, as Meta requires.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { appUrl, getEnv } from '@/core/config/env'
import { getDb } from '@/core/db/client'
import { getLogger } from '@/core/observability/logger'
import { handleDataDeletionRequest, parseSignedRequest } from '@/core/services/deauthorization'

export async function POST(request: NextRequest) {
  const env = getEnv()
  const form = await request.formData().catch(() => null)
  const signed = form?.get('signed_request')
  const secrets = [env.INSTAGRAM_APP_SECRET, env.FACEBOOK_APP_SECRET].filter((s): s is string => !!s)
  const data = typeof signed === 'string' && secrets.length ? parseSignedRequest(signed, secrets) : null
  if (!data?.user_id) return NextResponse.json({ error: 'invalid signed_request' }, { status: 400 })
  const code = await handleDataDeletionRequest(await getDb(), env, getLogger('webhooks'), 'instagram', String(data.user_id))
  return NextResponse.json({ url: appUrl(`/data-deletion?code=${encodeURIComponent(code)}`), confirmation_code: code })
}
