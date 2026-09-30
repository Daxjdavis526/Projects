import Link from 'next/link'
import { redirect } from 'next/navigation'
import { and, eq, ne } from 'drizzle-orm'
import { Check, FlaskConical, Link2, Radio } from 'lucide-react'
import { getEnv } from '@/core/config/env'
import { DEFAULT_NICHE_LABEL, DEFAULT_SUBTOPICS, parseSettings } from '@/core/config/settings'
import { createConnector, isConfigured } from '@/core/connectors/registry'
import { describeScope } from '@/core/connectors/scopes'
import { getDb } from '@/core/db/client'
import { platformAccounts } from '@/core/db/schema'
import { PLATFORM_LABEL, type Platform } from '@/core/domain/types'
import { countUsers } from '@/core/services/users'
import { getProfileFor, getSessionUser, type Profile } from '@/server/auth/session'
import { connectPlatform } from '@/server/actions/connections'
import { setupChooseMode, setupFinish, setupNext, setupNiche, setupSchedule } from '@/server/actions/setup'
import { CreateAccountForm } from '@/components/auth/create-account-form'
import { LegalLinks } from '@/components/legal-page'
import { Logo } from '@/components/shell/logo'
import { Badge, Button, Callout, PlatformDot } from '@/components/ui/primitives'
import { Field, compactInputClass } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { timeZoneOptions } from '@/lib/timezones'

export const metadata = { title: 'Set up' }

const STEPS = ['Account', 'YouTube', 'Instagram', 'TikTok', 'Niche', 'Schedule', 'Done'] as const
const PLATFORM_STEP: Record<number, Platform> = { 2: 'youtube', 3: 'instagram', 4: 'tiktok' }
const WHY: Record<Platform, string> = {
  youtube: 'Your videos and channel analytics teach SPOTTER what works for you, and YouTube search finds public trend candidates.',
  instagram: 'Your posts and insights feed your performance model; with the Facebook Login path, watchlist accounts and hashtags add public trends.',
  tiktok: 'Your videos and their counts feed your performance model. TikTok offers no official way for apps to read other creators’ videos.',
}
const OAUTH_ERRORS: Record<string, string> = {
  denied: 'Permission was not granted, so nothing was connected.',
  invalid_state: 'That sign-in attempt expired or was already used. Try again.',
  not_configured: 'This platform is not configured on the server yet.',
  exchange_failed: 'The platform rejected the connection. Check the server log.',
  wrong_mode: 'The data source changed during sign-in. Try again.',
}

function Stepper({ current, reached }: { current: number; reached: number }) {
  return (
    <ol className="mb-8 flex items-center gap-1 overflow-x-auto">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        const reachable = n >= 2 && n <= reached && n !== current
        const body = (
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium whitespace-nowrap', active ? 'bg-ink text-plane' : done ? 'text-ink' : 'text-muted')}>
            <span className={cn('grid size-4 place-items-center rounded-full text-[10px]', active ? 'bg-plane text-ink' : done ? 'bg-good text-white' : 'border border-line-strong')}>
              {done ? <Check aria-hidden className="size-3" /> : n}
            </span>
            {label}
          </span>
        )
        return (
          <li key={label} aria-current={active ? 'step' : undefined}>
            {reachable ? <Link href={`/setup?step=${n}`}>{body}</Link> : body}
          </li>
        )
      })}
    </ol>
  )
}

async function connected(profile: Profile) {
  const db = await getDb()
  const mode = profile.dataMode === 'demo' ? 'mock' : 'live'
  return db
    .select()
    .from(platformAccounts)
    .where(and(eq(platformAccounts.creatorProfileId, profile.id), eq(platformAccounts.mode, mode), ne(platformAccounts.status, 'disconnected')))
}

export default async function SetupPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  // Request data first (session cookie, search params): the page is per-request, never prerendered at build time.
  const params = await searchParams
  const user = await getSessionUser()
  const db = await getDb()
  if (!user) {
    if ((await countUsers(db)) > 0) redirect('/login?returnTo=/setup')
    return (
      <Shell>
        <Stepper current={1} reached={1} />
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">Welcome to SPOTTER</h1>
        <p className="mt-1.5 mb-6 text-[14px] text-ink-2">
          SPOTTER watches fitness content across YouTube, Instagram and TikTok, finds what is gaining unusual traction, and turns the trends that fit you into
          video ideas. Start with a local account for this installation.
        </p>
        <CreateAccountForm />
      </Shell>
    )
  }
  const profile = await getProfileFor(user.id)
  if (!profile) redirect('/login')
  if (profile.setupCompletedAt) redirect('/')
  const reached = Math.max(2, profile.setupStep)
  const step = Math.min(reached, Math.max(2, Number(params.step) || reached))
  const env = getEnv()
  const settings = parseSettings(profile.settings)
  const accounts = await connected(profile)
  const demo = profile.dataMode === 'demo'
  const anyLive = (['youtube', 'instagram', 'tiktok'] as Platform[]).some((p) => isConfigured(p, env))

  if (PLATFORM_STEP[step]) {
    const platform = PLATFORM_STEP[step]!
    const account = accounts.find((a) => a.platform === platform)
    const liveConnector = createConnector(platform, 'live', { env, clock: () => new Date() })
    const missing = liveConnector.auth.missingConfiguration()
    const canConnect = demo ? !!profile.demoAnchorAt : missing.length === 0
    return (
      <Shell>
        <Stepper current={step} reached={reached} />
        {step === 2 ? (
          <div className="mb-6 rounded-2xl border border-line bg-surface-2/60 p-4">
            <div className="text-[13px] font-semibold text-ink">Where should SPOTTER get its data?</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <form action={setupChooseMode}>
                <input type="hidden" name="mode" value="live" />
                <button type="submit" className={cn('flex w-full flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left', !demo ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2')}>
                  <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                    <Radio aria-hidden className="size-4" /> My real accounts
                  </span>
                  <span className="text-[12px] text-ink-2">{anyLive ? 'Uses the platform credentials configured on this server.' : 'No platform credentials are configured on this server yet.'}</span>
                </button>
              </form>
              <form action={setupChooseMode}>
                <input type="hidden" name="mode" value="demo" />
                <button type="submit" className={cn('flex w-full flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left', demo && profile.demoAnchorAt ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:bg-surface-2')}>
                  <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                    <FlaskConical aria-hidden className="size-4" /> Demo data
                  </span>
                  <span className="text-[12px] text-ink-2">A simulated fitness world, run through the real pipeline. Switch to live any time.</span>
                </button>
              </form>
            </div>
          </div>
        ) : null}

        <h1 className="flex items-center gap-2 text-[24px] font-semibold tracking-[-0.02em] text-ink">
          <PlatformDot platform={platform} className="size-3" />
          Connect {PLATFORM_LABEL[platform]}
          {demo ? (
            <Badge tone="warning" icon={FlaskConical}>
              demo account
            </Badge>
          ) : null}
        </h1>
        <p className="mt-1.5 text-[14px] text-ink-2">{WHY[platform]}</p>
        {params.oauth_error && params.platform === platform ? (
          <Callout tone="critical" className="mt-4">
            {OAUTH_ERRORS[params.oauth_error] ?? OAUTH_ERRORS.exchange_failed}
          </Callout>
        ) : null}
        <ul className="mt-5 flex flex-col gap-1.5 rounded-xl border border-line bg-surface-2/60 p-4 text-[13px] text-ink-2">
          {liveConnector.auth.requestedScopes.map((s) => (
            <li key={s} className="flex gap-2">
              <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-good-text" />
              {describeScope(s)}
            </li>
          ))}
          <li className="mt-1 text-[12px] text-muted">Read-only. SPOTTER never posts, edits or deletes anything.</li>
        </ul>

        {account ? (
          <Callout tone="good" className="mt-5" title={`Connected as ${account.username ? `@${account.username.replace(/^@/, '')}` : (account.displayName ?? 'your account')}`}>
            You can reconnect or disconnect later under Connections.
          </Callout>
        ) : !demo && missing.length ? (
          <Callout tone="warning" className="mt-5" title="Not configured on this server">
            Add <span className="font-mono text-[12px]">{missing.join(', ')}</span> to the server’s <span className="font-mono text-[12px]">.env</span> file and restart (API_SETUP.md shows where
            each value comes from), or skip this platform for now.
          </Callout>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {!account && canConnect ? (
            <form action={connectPlatform}>
              <input type="hidden" name="platform" value={platform} />
              <input type="hidden" name="returnTo" value={`/setup?step=${step}`} />
              <Button type="submit" variant="primary">
                <Link2 aria-hidden className="size-4" /> Connect {PLATFORM_LABEL[platform]}
              </Button>
            </form>
          ) : null}
          {demo && !profile.demoAnchorAt ? <span className="text-[13px] text-ink-2">Choose a data source above first.</span> : null}
          <form action={setupNext}>
            <input type="hidden" name="step" value={step} />
            <Button type="submit" variant={account ? 'primary' : 'ghost'}>
              {account ? 'Continue' : 'Skip for now'}
            </Button>
          </form>
        </div>
      </Shell>
    )
  }

  if (step === 5) {
    return (
      <Shell>
        <Stepper current={5} reached={reached} />
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">Your niche</h1>
        <p className="mt-1.5 mb-6 text-[14px] text-ink-2">SPOTTER uses this to judge which trends belong to your world, and to leave out the ones that don’t.</p>
        <form action={setupNiche} className="flex flex-col gap-5">
          <Field label="Niche">
            <input name="label" defaultValue={settings.niche.label || DEFAULT_NICHE_LABEL} className={compactInputClass} />
          </Field>
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-ink">Subtopics</legend>
            <div className="flex flex-wrap gap-2">
              {[...new Set([...DEFAULT_SUBTOPICS, ...settings.niche.subtopics])].map((s) => (
                <label key={s} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-ink has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
                  <input type="checkbox" name="subtopic" value={s} defaultChecked={settings.niche.subtopics.includes(s)} className="accent-[var(--accent)]" />
                  {s}
                </label>
              ))}
            </div>
            <input name="extraSubtopics" placeholder="Add more, comma-separated (e.g. calisthenics, strongman)" className={cn(compactInputClass, 'mt-3')} />
          </fieldset>
          <Field label="Keywords" hint="Words that mark a post as yours-adjacent. Comma-separated.">
            <textarea name="keywords" rows={3} defaultValue={settings.niche.keywords.join(', ')} className={`${compactInputClass} h-auto py-2`} />
          </Field>
          <Field label="Never recommend posts about" hint="Optional, comma-separated">
            <input name="excludeKeywords" defaultValue={settings.niche.excludeKeywords.join(', ')} className={compactInputClass} />
          </Field>
          <div>
            <Button type="submit" variant="primary">
              Continue
            </Button>
          </div>
        </form>
      </Shell>
    )
  }

  if (step === 6) {
    const times = [...settings.schedule.times, '', ''].slice(0, 4)
    return (
      <Shell>
        <Stepper current={6} reached={reached} />
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">How often?</h1>
        <p className="mt-1.5 mb-6 text-[14px] text-ink-2">SPOTTER collects on a schedule and rebuilds your list of video ideas. Platforms’ rate limits are respected either way.</p>
        <form action={setupSchedule} className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-ink">New recommendations</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ['daily', 'Every morning', 'Once a day, after the first run'],
                ['every_run', 'After every run', 'Up to three times a day'],
                ['weekly', 'Weekly', 'One planning list a week'],
              ].map(([value, label, hint]) => (
                <label key={value} className="flex cursor-pointer flex-col gap-0.5 rounded-xl border border-line bg-surface px-4 py-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
                  <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
                    <input type="radio" name="frequency" value={value} defaultChecked={settings.recommendations.frequency === value} className="accent-[var(--accent)]" />
                    {label}
                  </span>
                  <span className="pl-5 text-[12px] text-ink-2">{hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Collection times" hint="Morning, afternoon and evening by default">
              <div className="grid grid-cols-4 gap-2">
                {times.map((t, i) => (
                  <input key={i} name="time" type="time" defaultValue={t} className={compactInputClass} aria-label={`Collection time ${i + 1}`} />
                ))}
              </div>
            </Field>
            <Field label="Ideas per list" hint="5–10; fewer when fewer trends pass the evidence gates">
              <input name="count" type="number" min={5} max={10} defaultValue={Math.min(10, Math.max(5, settings.recommendations.count))} className={compactInputClass} />
            </Field>
          </div>
          <Field label="Time zone">
            <select name="timezone" defaultValue={profile.timezone} className={`${compactInputClass} appearance-none`}>
              {timeZoneOptions(profile.timezone).map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <Button type="submit" variant="primary">
              Continue
            </Button>
          </div>
        </form>
      </Shell>
    )
  }

  // Step 7
  return (
    <Shell>
      <Stepper current={7} reached={reached} />
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-ink">Ready</h1>
      <p className="mt-1.5 mb-5 text-[14px] text-ink-2">
        {demo
          ? 'SPOTTER will build ten days of simulated history through the real pipeline — about a minute — then show today’s opportunities.'
          : 'SPOTTER will run its first collection now. Trends need a few runs of history to be measured properly; the first recommendations appear once enough evidence exists.'}
      </p>
      <ul className="mb-6 flex flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-4 text-[13px]">
        {(['youtube', 'instagram', 'tiktok'] as Platform[]).map((p) => {
          const a = accounts.find((x) => x.platform === p)
          return (
            <li key={p} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-ink">
                <PlatformDot platform={p} />
                {PLATFORM_LABEL[p]}
              </span>
              <span className="text-ink-2">{a ? `Connected${a.username ? ` as @${a.username.replace(/^@/, '')}` : ''}` : demo ? 'Will connect a demo account' : 'Skipped'}</span>
            </li>
          )
        })}
        <li className="flex items-center justify-between gap-2 border-t border-line pt-2">
          <span className="text-ink">Niche</span>
          <span className="text-right text-ink-2">{settings.niche.label}</span>
        </li>
        <li className="flex items-center justify-between gap-2">
          <span className="text-ink">Schedule</span>
          <span className="text-ink-2">
            {settings.schedule.times.join(', ')} ({profile.timezone})
          </span>
        </li>
      </ul>
      <form action={setupFinish}>
        <Button type="submit" variant="primary" size="lg">
          Open my dashboard
        </Button>
      </form>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-[680px]">
        <div className="mb-8">
          <Logo />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">{children}</div>
        <LegalLinks className="mt-4" />
      </div>
    </main>
  )
}
