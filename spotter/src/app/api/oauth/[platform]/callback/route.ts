/**
 * OAuth redirect URI: https://<APP_URL>/api/oauth/<platform>/callback
 * Register exactly this URL with each platform (see API_SETUP.md).
 */
import { type NextRequest, NextResponse } from 'next/server'
import { appUrl } from '@/core/config/env'
import { getProfileFor, getSessionUser } from '@/server/auth/session'
import { completeAuthorization, OAuthFlowError, parsePlatform } from '@/server/oauth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const q = request.nextUrl.searchParams
  const user = await getSessionUser()
  if (!user) return NextResponse.redirect(appUrl('/login?reason=session_expired'))
  const profile = await getProfileFor(user.id)
  if (!profile) return NextResponse.redirect(appUrl('/setup'))
  let platform: string = 'unknown'
  try {
    platform = parsePlatform((await params).platform)
    const result = await completeAuthorization({
      userId: user.id,
      profile,
      platform: platform as ReturnType<typeof parsePlatform>,
      state: q.get('state'),
      code: q.get('code'),
      error: q.get('error') ?? q.get('error_reason'),
    })
    const target = new URL(result.returnTo, appUrl('/'))
    target.searchParams.set('connected', platform)
    return NextResponse.redirect(target)
  } catch (err) {
    const code = err instanceof OAuthFlowError ? err.code : 'exchange_failed'
    const back = new URL(profile.setupCompletedAt ? '/connections' : '/setup', appUrl('/'))
    back.searchParams.set('oauth_error', code)
    back.searchParams.set('platform', platform)
    return NextResponse.redirect(back)
  }
}
