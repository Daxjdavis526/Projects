/**
 * TikTok webhook: https://<APP_URL>/api/webhooks/tiktok
 * Handles `authorization.removed` (the creator revoked access in TikTok).
 */
import { type NextRequest, NextResponse } from 'next/server'
import { getEnv } from '@/core/config/env'
import { getDb } from '@/core/db/client'
import { getLogger } from '@/core/observability/logger'
import { handlePlatformDeauthorization, verifyTikTokSignature } from '@/core/services/deauthorization'

export async function POST(request: NextRequest) {
  const env = getEnv()
  const raw = await request.text()
  if (!env.TIKTOK_CLIENT_SECRET || !verifyTikTokSignature(request.headers.get('tiktok-signature'), raw, env.TIKTOK_CLIENT_SECRET)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }
  let event: { event?: string; user_openid?: string }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  if (event.event === 'authorization.removed' && event.user_openid) {
    await handlePlatformDeauthorization(await getDb(), env, getLogger('webhooks'), 'tiktok', event.user_openid)
  }
  // Acknowledge every verified event (TikTok retries on non-2xx).
  return NextResponse.json({ ok: true })
}
