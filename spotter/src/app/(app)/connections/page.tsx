import Link from 'next/link'
import { ExternalLink, KeyRound, Link2, ShieldCheck, Unplug } from 'lucide-react'
import { policyFor } from '@/core/compliance/policy'
import { getEnv } from '@/core/config/env'
import { CAPABILITY_LABEL, type CapabilityStatus } from '@/core/connectors/types'
import { describeScope } from '@/core/connectors/scopes'
import { PLATFORM_LABEL } from '@/core/domain/types'
import { requireProfile } from '@/server/auth/session'
import { connectPlatform, disconnectPlatform } from '@/server/actions/connections'
import { getConnections, type ConnectionView } from '@/server/queries/connections'
import { Badge, Button, Callout, Card, KeyValues, PageHeader, PlatformDot, StatusBadge, type StatusKind } from '@/components/ui/primitives'
import { platformHealth } from '@/components/status-summary'
import { compact, dateTime, relativeTime } from '@/lib/format'

export const metadata = { title: 'Connections' }

const CAP_STATUS: Record<CapabilityStatus, { kind: StatusKind; label: string }> = {
  available: { kind: 'good', label: 'Available' },
  limited: { kind: 'warning', label: 'Limited' },
  needs_permission: { kind: 'warning', label: 'Permission not granted' },
  needs_review: { kind: 'warning', label: 'Needs app review' },
  not_configured: { kind: 'idle', label: 'Not configured' },
  not_implemented: { kind: 'idle', label: 'Not used by SPOTTER' },
  unavailable: { kind: 'idle', label: 'Not offered by the API' },
}

const OAUTH_ERRORS: Record<string, string> = {
  denied: 'Permission was not granted, so nothing was connected.',
  invalid_state: 'That sign-in attempt was not valid (expired, already used, or started elsewhere). Please try again.',
  not_configured: 'This platform is not configured on the server yet. See API_SETUP.md for the settings it needs.',
  wrong_mode: 'The workspace switched between demo and live data during sign-in. Please try again.',
  exchange_failed: 'The platform rejected the connection. Check the server log and the app settings in the platform’s developer console.',
  unknown_platform: 'Unknown platform.',
}

function tokenLine(v: ConnectionView, now: Date): string {
  const t = v.status.token
  if (!t) return 'No token stored'
  const parts: string[] = []
  if (t.accessTokenExpiresAt) {
    parts.push(t.accessTokenExpiresAt > now ? `access token valid ${relativeTime(t.accessTokenExpiresAt, now).replace('in ', 'for ')}` : 'access token expired')
  }
  const autoRefresh = v.capabilities.items.some((i) => i.key === 'token_refresh' && i.status === 'available')
  parts.push(t.hasRefreshToken || autoRefresh ? 'refreshes automatically' : 'no refresh available — reconnect when it expires')
  if (t.refreshTokenExpiresAt) parts.push(`reconnect before ${t.refreshTokenExpiresAt.toISOString().slice(0, 10)}`)
  if (t.refreshFailures) parts.push(`${t.refreshFailures} failed refresh${t.refreshFailures === 1 ? '' : 'es'}`)
  return parts.join(' · ')
}

function PlatformCard({ view, demo, timeZone }: { view: ConnectionView; demo: boolean; timeZone: string }) {
  const s = view.status
  const now = new Date()
  const platform = s.platform
  const name = PLATFORM_LABEL[platform]
  const health = platformHealth(s)
  const connected = s.state !== 'not_connected'
  const canConnect = demo || view.missingConfiguration.length === 0
  const policy = policyFor(platform, getEnv(), 'live')
  const granted = new Set(s.grantedScopes)
  return (
    <Card as="article" aria-labelledby={`conn-${platform}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0">
          <h2 id={`conn-${platform}`} className="flex items-center gap-2 text-[18px] font-semibold text-ink">
            <PlatformDot platform={platform} className="size-2.5" />
            {name}
          </h2>
          <p className="mt-1 text-[13px] text-ink-2">
            {view.capabilities.apiName}
            {demo ? ' · simulated demo account' : ''}
          </p>
        </div>
        <StatusBadge status={health.kind} title={s.health?.lastFailureReason ?? undefined}>
          {health.label}
        </StatusBadge>
      </div>

      <div className="px-5 py-4">
        {connected ? (
          <KeyValues
            rows={[
              ['Connected as', <span key="u" className="font-medium">{s.username ? `@${s.username.replace(/^@/, '')}` : (s.displayName ?? 'Account')}{s.displayName && s.username ? <span className="text-muted"> · {s.displayName}</span> : null}</span>],
              ...(s.followerCount !== null ? ([['Followers', compact(s.followerCount)]] as Array<[string, string]>) : []),
              ['Connected', s.connectedAt ? dateTime(s.connectedAt, timeZone, 'short') : '—'],
              ['Last sync', s.lastSyncAt ? `${relativeTime(s.lastSyncAt, now)} (${dateTime(s.lastSyncAt, timeZone, 'short')})` : 'not yet'],
              ['Token', tokenLine(view, now)],
              ...(s.health?.lastFailureReason && s.health.consecutiveFailures ? ([['Last problem', `${s.health.lastFailureReason} (${relativeTime(s.health.lastFailureAt, now)})`]] as Array<[string, string]>) : []),
              ...(s.health?.backoffUntil && s.health.backoffUntil > now ? ([['Next retry', `after ${dateTime(s.health.backoffUntil, timeZone, 'time')} (backing off)`]] as Array<[string, string]>) : []),
            ]}
          />
        ) : (
          <p className="text-[13px] text-ink-2">
            Not connected. SPOTTER asks only for read-only permissions; it never posts, edits or deletes anything on your account.
          </p>
        )}
        {!demo && view.missingConfiguration.length ? (
          <Callout tone="warning" icon={KeyRound} className="mt-4" title="Not configured on this server">
            Set <span className="font-mono text-[12px]">{view.missingConfiguration.join(', ')}</span> in the server’s environment (your <span className="font-mono text-[12px]">.env</span> file), then restart.
            API_SETUP.md walks through creating the app and where each value comes from. Secrets are never entered in this page.
          </Callout>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
        {canConnect ? (
          <form action={connectPlatform}>
            <input type="hidden" name="platform" value={platform} />
            <input type="hidden" name="returnTo" value="/connections" />
            <Button type="submit" variant={connected && s.state === 'connected' ? 'secondary' : 'primary'} size="sm">
              <Link2 aria-hidden className="size-3.5" />
              {connected ? 'Reconnect' : `Connect ${name}`}
            </Button>
          </form>
        ) : null}
        {connected ? (
          <details className="group relative">
            <summary className="inline-flex h-8 cursor-pointer list-none items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">
              <Unplug aria-hidden className="size-3.5" /> Disconnect…
            </summary>
            <div className="absolute left-0 z-10 mt-2 w-80 rounded-xl border border-line bg-surface p-4 text-[13px] shadow-pop">
              <p className="text-ink-2">
                SPOTTER will revoke its access at {name} where {name} allows it, delete the stored tokens, and delete the posts and analytics collected
                through this account. Trends from public data stay.
              </p>
              <form action={disconnectPlatform} className="mt-3">
                <input type="hidden" name="platform" value={platform} />
                <input type="hidden" name="returnTo" value="/connections" />
                <Button type="submit" variant="danger" size="sm">
                  Disconnect and delete
                </Button>
              </form>
            </div>
          </details>
        ) : null}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-muted">
          <ShieldCheck aria-hidden className="size-3.5" />
          OAuth 2.0{view.usesPkce ? ' with PKCE' : ''} · state-checked · tokens encrypted at rest
        </span>
      </div>

      <div className="border-t border-line px-5 py-4">
        <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Permissions</h3>
        <ul className="flex flex-col gap-1.5 text-[13px]">
          {view.requestedScopes.map((scope) => (
            <li key={scope} className="flex items-start gap-2">
              {connected ? (
                granted.has(scope) ? (
                  <Badge tone="good">granted</Badge>
                ) : (
                  <Badge tone="warning">not granted</Badge>
                )
              ) : (
                <Badge>requested</Badge>
              )}
              <span className="text-ink-2">
                {describeScope(scope)} <span className="font-mono text-[11px] text-muted">{scope.replace('https://www.googleapis.com/auth/', '')}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-line px-5 py-4">
        <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">What SPOTTER can do with {name}</h3>
        <ul className="flex flex-col">
          {view.capabilities.items.map((item) => {
            const st = CAP_STATUS[item.status]
            return (
              <li key={item.key} className="grid grid-cols-1 gap-1 border-t border-line py-2.5 first:border-t-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[13px] font-medium text-ink">{CAPABILITY_LABEL[item.key]}</span>
                  <StatusBadge status={st.kind}>{st.label}</StatusBadge>
                </div>
                <div className="text-[13px] text-ink-2">
                  {item.summary}
                  {item.docs?.length ? (
                    <span className="ml-1 inline-flex flex-wrap gap-2">
                      {item.docs.map((d) => (
                        <a key={d} href={d} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-0.5 text-[12px] text-accent-text hover:underline">
                          docs <ExternalLink aria-hidden className="size-3" />
                        </a>
                      ))}
                    </span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
        {view.capabilities.notes.length ? (
          <ul className="mt-3 list-disc pl-4 text-[12px] text-muted">
            {view.capabilities.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        ) : null}
        {!demo && policy.attributionLinks.length ? (
          <p className="mt-3 text-[12px] text-muted">
            {platform === 'youtube' ? 'By connecting YouTube you agree to be bound by the ' : `${policy.attribution}: `}
            {policy.attributionLinks.map((l, i) => (
              <span key={l.href}>
                {i > 0 ? ' · ' : ''}
                <a href={l.href} target="_blank" rel="noreferrer noopener" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
                  {l.label}
                </a>
              </span>
            ))}
            {platform === 'youtube' ? '.' : ''}
          </p>
        ) : null}
        <p className="mt-3 text-[11px] text-muted">Checked against official documentation on {view.capabilities.docsCheckedOn}.</p>
      </div>
    </Card>
  )
}

export default async function ConnectionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { profile } = await requireProfile()
  const params = await searchParams
  const views = await getConnections(profile)
  const demo = profile.dataMode === 'demo'
  const platformName = params.platform && params.platform in PLATFORM_LABEL ? PLATFORM_LABEL[params.platform as keyof typeof PLATFORM_LABEL] : 'The platform'
  return (
    <>
      <PageHeader
        title="Connections"
        description={
          demo
            ? 'This workspace uses simulated demo accounts, connected through the same OAuth code path as real ones. Switch to live data in Settings once your API credentials are in place.'
            : 'Your accounts on each platform. Each one is independent: if one fails or needs reconnecting, the others keep collecting.'
        }
      />
      {params.connected ? (
        <Callout tone="good" className="mb-6" title={`${PLATFORM_LABEL[params.connected as keyof typeof PLATFORM_LABEL] ?? 'Account'} connected`}>
          The next collection run will pull your profile, posts and analytics. Use “Refresh now” to start it immediately.
        </Callout>
      ) : null}
      {params.disconnected ? (
        <Callout tone="neutral" className="mb-6" title={`${PLATFORM_LABEL[params.disconnected as keyof typeof PLATFORM_LABEL] ?? 'Account'} disconnected`}>
          Tokens and the data collected through that account were deleted.
        </Callout>
      ) : null}
      {params.oauth_error ? (
        <Callout tone="critical" className="mb-6" title={`${platformName} was not connected`}>
          {OAUTH_ERRORS[params.oauth_error] ?? OAUTH_ERRORS.exchange_failed}
        </Callout>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        {views.map((v) => (
          <PlatformCard key={v.status.platform} view={v} demo={demo} timeZone={profile.timezone} />
        ))}
        <Card className="p-5 xl:col-span-2">
          <h2 className="text-[15px] font-semibold text-ink">Browser-assisted discovery</h2>
          <p className="mt-1 max-w-3xl text-[13px] text-ink-2">
            Optional and off by default (<span className="font-mono text-[12px]">ASSISTED_DISCOVERY_ENABLED</span>). When on, you can paste posts you saw while browsing into
            SPOTTER yourself. It never scrapes, automates a browser, or works around a platform’s limits — official APIs stay the only automated source.{' '}
            <Link href="/capture" className="text-accent-text hover:underline">
              Captured posts
            </Link>
          </p>
        </Card>
      </div>
    </>
  )
}
