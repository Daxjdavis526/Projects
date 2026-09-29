import Link from 'next/link'
import { FlaskConical, LogOut, Radio } from 'lucide-react'
import { policyFor } from '@/core/compliance/policy'
import { getEnv } from '@/core/config/env'
import { PLATFORM_LABEL } from '@/core/domain/types'
import { requireProfile } from '@/server/auth/session'
import { signOut } from '@/server/auth/actions'
import { getWorkspaceStatus } from '@/server/queries/workspace'
import { Badge, Callout, PlatformDot, buttonClass } from '@/components/ui/primitives'
import { LiveRefresher } from '@/components/shell/live-refresher'
import { Logo } from '@/components/shell/logo'
import { SideNav, TopNav } from '@/components/shell/nav'
import { RefreshButton } from '@/components/shell/refresh-button'
import { ThemeToggle } from '@/components/shell/theme-toggle'
import { relativeTime, dateTime } from '@/lib/format'
import { cn } from '@/lib/cn'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireProfile()
  const status = await getWorkspaceStatus(profile)
  const env = getEnv()
  const now = new Date()
  const running = !!status.activeRun || (status.demoSetup?.status === 'queued' || status.demoSetup?.status === 'running')
  const trouble = status.platforms.filter((p) => p.state === 'needs_reauth' || p.state === 'error')
  // Platforms whose data can appear on these pages, with the attribution their terms ask for.
  const sources =
    status.dataMode === 'live'
      ? status.platforms
          .filter((p) => p.state !== 'not_connected' || (p.platform === 'youtube' && !!env.YOUTUBE_API_KEY))
          .map((p) => policyFor(p.platform, env, 'live'))
      : []

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-7 border-r border-line bg-plane px-4 py-5 lg:flex">
        <div className="px-1">
          <Logo />
        </div>
        <SideNav showCapture={env.ASSISTED_DISCOVERY_ENABLED} />
        <div className="mt-auto flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-surface p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Platforms</div>
            <ul className="flex flex-col gap-1.5">
              {status.platforms.map((p) => (
                <li key={p.platform} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="flex min-w-0 items-center gap-2 text-ink-2">
                    <PlatformDot platform={p.platform} />
                    {PLATFORM_LABEL[p.platform]}
                  </span>
                  <span className={cn('truncate text-[12px]', p.state === 'connected' ? 'text-ink' : p.state === 'not_connected' ? 'text-muted' : 'text-critical-text')}>
                    {p.state === 'connected' ? (p.username ? `@${p.username.replace(/^@/, '')}` : 'Connected') : p.state === 'not_connected' ? 'Not connected' : 'Needs attention'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-ink">{user.displayName}</div>
              <div className="truncate text-[12px] text-muted">{user.email}</div>
            </div>
            <form action={signOut}>
              <button type="submit" className={buttonClass('ghost', 'sm', 'px-2')} aria-label="Sign out" title="Sign out">
                <LogOut aria-hidden className="size-4" />
              </button>
            </form>
          </div>
          <ThemeToggle className="self-start" />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-line bg-plane/90 px-4 py-2.5 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Logo compact />
            </div>
            {status.dataMode === 'demo' ? (
              <Link href="/settings#data" title="Simulated creators and posts. Nothing on screen is real platform data.">
                <Badge tone="warning" icon={FlaskConical}>
                  Demo data
                </Badge>
              </Link>
            ) : (
              <Badge tone="good" icon={Radio}>
                Live data
              </Badge>
            )}
            <div className="hidden min-w-0 truncate text-[13px] text-ink-2 sm:block">
              {running ? (
                <span className="font-medium text-ink">{status.demoSetup && (status.demoSetup.status === 'queued' || status.demoSetup.status === 'running') ? 'Building your demo history…' : 'Collecting now…'}</span>
              ) : status.lastRun?.finishedAt ? (
                <>
                  Updated {relativeTime(status.lastRun.finishedAt, now)}
                  {status.nextScheduledAt ? <span className="text-muted"> · next {dateTime(status.nextScheduledAt, status.timezone, 'time')}</span> : null}
                </>
              ) : (
                'No collection yet'
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <RefreshButton running={running} />
            </div>
          </div>
          <div className="mt-2.5 lg:hidden">
            <TopNav showCapture={env.ASSISTED_DISCOVERY_ENABLED} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 lg:px-8 lg:py-8">
          {trouble.length ? (
            <Callout
              tone="critical"
              className="mb-6"
              title={`${trouble.map((p) => PLATFORM_LABEL[p.platform]).join(' and ')} ${trouble.length === 1 ? 'needs' : 'need'} attention`}
              action={
                <Link href="/connections" className={buttonClass('secondary', 'sm')}>
                  Review
                </Link>
              }
            >
              {trouble[0]!.health?.lastFailureReason ?? 'The connection stopped working.'} Collection continues for the other platforms.
            </Callout>
          ) : null}
          {children}
        </main>
        <footer className="mx-auto w-full max-w-[1320px] px-4 pb-8 text-[12px] text-muted lg:px-8">
          {status.dataMode === 'demo' ? (
            <p>Demo data: the creators, posts and numbers are simulated. Nothing here comes from a platform.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {sources.map((policy) => (
                <li key={policy.platform}>
                  {policy.attribution}
                  {policy.attributionLinks.map((l) => (
                    <span key={l.href}>
                      {' · '}
                      <a href={l.href} target="_blank" rel="noreferrer noopener" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
                        {l.label}
                      </a>
                    </span>
                  ))}
                  {policy.restrictionNote ? <span className="block text-muted">{policy.restrictionNote}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </footer>
      </div>
      {running ? <LiveRefresher /> : null}
    </div>
  )
}
