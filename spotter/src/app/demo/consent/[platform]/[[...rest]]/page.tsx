/**
 * The demo stand-in for a platform's OAuth consent screen. Demo connections
 * run through the real authorization-code flow (state, PKCE, code exchange,
 * token storage), with this page playing the platform's part. It only ever
 * redirects to this app's own callback URL.
 */
import { notFound, redirect } from 'next/navigation'
import { FlaskConical, ShieldCheck } from 'lucide-react'
import { describeScope } from '@/core/connectors/scopes'
import { PLATFORM_LABEL } from '@/core/domain/types'
import { randomToken } from '@/core/security/random'
import { getSessionUser } from '@/server/auth/session'
import { parsePlatform, redirectUriFor } from '@/server/oauth'
import { Badge, PlatformDot, buttonClass } from '@/components/ui/primitives'

export const metadata = { title: 'Demo consent' }

export default async function DemoConsentPage({ params, searchParams }: { params: Promise<{ platform: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  if (!(await getSessionUser())) redirect('/login')
  let platform
  try {
    platform = parsePlatform((await params).platform)
  } catch {
    notFound()
  }
  const q = await searchParams
  const expected = redirectUriFor(platform)
  const redirectUri = q.redirect_uri ?? ''
  const state = q.state ?? ''
  if (redirectUri !== expected || !state || state.length > 200) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <p className="max-w-md text-center text-[14px] text-ink-2">This demo consent link is not valid: it must come from SPOTTER’s own Connect button.</p>
      </main>
    )
  }
  const scopes = (q.scope ?? '').split(/[\s,]+/).filter(Boolean)
  const allow = new URL(redirectUri)
  allow.searchParams.set('code', `demo-${randomToken(12)}`)
  allow.searchParams.set('state', state)
  if (platform === 'tiktok') allow.searchParams.set('scopes', scopes.join(','))
  const deny = new URL(redirectUri)
  deny.searchParams.set('error', 'access_denied')
  deny.searchParams.set('state', state)
  const name = PLATFORM_LABEL[platform]

  return (
    <main className="grid min-h-dvh place-items-center bg-plane px-4 py-10">
      <div className="w-full max-w-[440px] rounded-2xl border border-line bg-surface p-6 shadow-pop sm:p-8">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink">
            <PlatformDot platform={platform} className="size-2.5" />
            {name}
          </span>
          <Badge tone="warning" icon={FlaskConical}>
            Simulated
          </Badge>
        </div>
        <h1 className="mt-5 text-[20px] leading-snug font-semibold tracking-[-0.015em] text-ink">SPOTTER wants to access your {name} account</h1>
        <p className="mt-2 text-[13px] text-ink-2">
          This is a stand-in for {name}’s consent screen, used in demo mode. Allowing connects a simulated account — no real {name} account is involved.
        </p>
        <ul className="mt-5 flex flex-col gap-2 rounded-xl bg-surface-2 p-4 text-[13px] text-ink">
          {(scopes.length ? scopes : ['(the permissions this connector requests)']).map((s) => (
            <li key={s} className="flex gap-2">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-good-text" />
              {describeScope(s)}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-2">
          <a href={deny.toString()} className={buttonClass('secondary', 'md', 'flex-1')}>
            Cancel
          </a>
          <a href={allow.toString()} className={buttonClass('primary', 'md', 'flex-1')}>
            Allow
          </a>
        </div>
      </div>
    </main>
  )
}
