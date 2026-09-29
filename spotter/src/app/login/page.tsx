import { redirect } from 'next/navigation'
import { getDb } from '@/core/db/client'
import { countUsers } from '@/core/services/users'
import { getSessionUser } from '@/server/auth/session'
import { SignInForm } from '@/components/auth/sign-in-form'
import { Logo } from '@/components/shell/logo'
import { Callout } from '@/components/ui/primitives'

export const metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (await getSessionUser()) redirect('/')
  const db = await getDb()
  if ((await countUsers(db)) === 0) redirect('/setup')
  const params = await searchParams
  const returnTo = params.returnTo && /^\/(?![/\\])/.test(params.returnTo) ? params.returnTo : '/'
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">Sign in</h1>
          <p className="mt-1 mb-6 text-[14px] text-ink-2">Your trend dashboard is waiting.</p>
          {params.reason === 'session_expired' ? (
            <Callout tone="warning" className="mb-4">
              Your session ended during a platform sign-in. Sign in again, then reconnect from Connections.
            </Callout>
          ) : null}
          <SignInForm returnTo={returnTo} />
        </div>
        <p className="mt-6 text-center text-[12px] text-muted">SPOTTER runs on your own server. Your data and tokens stay here.</p>
      </div>
    </main>
  )
}
