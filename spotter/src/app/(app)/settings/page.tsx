import { and, desc, eq, inArray } from 'drizzle-orm'
import { FlaskConical, Radio, RotateCcw } from 'lucide-react'
import { getEnv } from '@/core/config/env'
import { parseSettings } from '@/core/config/settings'
import { isConfigured } from '@/core/connectors/registry'
import { getDb } from '@/core/db/client'
import { trendClusters, trendScores } from '@/core/db/schema'
import { COMPONENT_LABEL } from '@/core/analytics/scoring'
import { FIT_COMPONENT_KEYS, PLATFORM_LABEL, PLATFORMS, TREND_COMPONENT_KEYS } from '@/core/domain/types'
import { requireProfile } from '@/server/auth/session'
import { resetDemo, switchDataMode } from '@/server/actions/settings'
import { Badge, Button, Callout, PageHeader } from '@/components/ui/primitives'
import { Field, compactInputClass } from '@/components/ui/fields'
import { SectionForm } from '@/components/settings/section-form'
import { WeightsEditor, type WeightSample } from '@/components/settings/weights-editor'
import { TrendFitSlider } from '@/components/settings/trend-fit-slider'

import { timeZoneOptions } from '@/lib/timezones'

export const metadata = { title: 'Settings' }

const TREND_DESCRIPTIONS: Record<string, string> = {
  velocity: 'How fast its posts gain views right now, against posts of the same age.',
  outperformance: 'How far posts run above their own creators’ usual views.',
  repetition: 'How many independent creators are doing it, and how alike their posts are.',
  engagement: 'Comments, shares and saves per view against the niche norm.',
  recency: 'How fresh the posts are.',
  acceleration: 'Momentum: performance-weighted posts in the last 3 days vs the 3 before.',
}
const FIT_LABELS: Record<string, string> = { topic: 'Topic', niche: 'Niche', format: 'Format', style: 'Style', platform: 'Platform', length: 'Length' }
const FIT_DESCRIPTIONS: Record<string, string> = {
  topic: 'Closeness to topics you already cover, adjusted by how they perform for you.',
  niche: 'Overlap with your niche keywords and subtopics.',
  format: 'How the trend’s main format performs for you.',
  style: 'How its tone (educational, comedy, opinion…) performs for you.',
  platform: 'How strong you are on the platforms where it is happening.',
  length: 'How videos of its typical length perform for you.',
}

const selectClass = `${compactInputClass} appearance-none`

async function samples(profileId: string, dataMode: 'demo' | 'live') {
  const db = await getDb()
  const clusters = await db
    .select()
    .from(trendClusters)
    .where(and(eq(trendClusters.creatorProfileId, profileId), eq(trendClusters.dataMode, dataMode), eq(trendClusters.status, 'active')))
    .orderBy(desc(trendClusters.latestTrendScore))
    .limit(8)
  if (!clusters.length) return { trend: [] as WeightSample[], fit: [] as WeightSample[] }
  const latest = await db
    .selectDistinctOn([trendScores.clusterId], { clusterId: trendScores.clusterId, components: trendScores.components })
    .from(trendScores)
    .where(inArray(trendScores.clusterId, clusters.map((c) => c.id)))
    .orderBy(trendScores.clusterId, desc(trendScores.computedAt))
  return {
    trend: clusters.flatMap((c) => {
      const row = latest.find((l) => l.clusterId === c.id)
      return row ? [{ id: c.id, label: c.label, components: row.components, current: c.latestTrendScore ?? 0 }] : []
    }),
    fit: clusters.flatMap((c) => (c.latestFitComponents ? [{ id: c.id, label: c.label, components: c.latestFitComponents, current: c.latestFitScore ?? 0 }] : [])),
  }
}

export default async function SettingsPage() {
  const { profile } = await requireProfile()
  const settings = parseSettings(profile.settings)
  const env = getEnv()
  const s = await samples(profile.id, profile.dataMode)
  const zones = timeZoneOptions(profile.timezone)
  const times = [...settings.schedule.times, '', ''].slice(0, Math.max(4, settings.schedule.times.length + 1))
  const liveReady = PLATFORMS.filter((p) => isConfigured(p, env))
  const keys = { anthropic: !!env.ANTHROPIC_API_KEY, openai: !!env.OPENAI_API_KEY, voyage: !!env.VOYAGE_API_KEY }

  return (
    <>
      <PageHeader title="Settings" description="Everything that shapes what SPOTTER collects and how it ranks. Secrets (API keys, client secrets) are never set here — they live in the server’s environment." />
      <nav aria-label="Settings sections" className="mb-6 flex flex-wrap gap-1.5 text-[13px]">
        {[
          ['data', 'Data source'],
          ['schedule', 'Schedule'],
          ['weights', 'Trend Score'],
          ['fit', 'Creator Fit'],
          ['gates', 'Evidence gates'],
          ['niche', 'Niche'],
          ['platforms', 'Platforms'],
          ['discovery', 'Discovery'],
          ['ai', 'AI'],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-line bg-surface px-3 py-1 text-ink-2 hover:text-ink">
            {label}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-6">
        <section id="data" className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h2 className="text-[16px] font-semibold text-ink">Data source</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {profile.dataMode === 'demo' ? (
              <Badge tone="warning" icon={FlaskConical}>
                Demo data
              </Badge>
            ) : (
              <Badge tone="good" icon={Radio}>
                Live data
              </Badge>
            )}
            <span className="text-[13px] text-ink-2">
              {profile.dataMode === 'demo'
                ? 'A simulated fitness world, collected through the real connectors and pipeline. Nothing on screen is real platform data.'
                : 'Only your connected accounts and official platform APIs.'}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.dataMode === 'demo' ? (
              <>
                <form action={switchDataMode}>
                  <input type="hidden" name="mode" value="live" />
                  <Button type="submit" variant="primary" size="sm">
                    <Radio aria-hidden className="size-3.5" /> Switch to live data
                  </Button>
                </form>
                <form action={resetDemo}>
                  <Button type="submit" variant="secondary" size="sm">
                    <RotateCcw aria-hidden className="size-3.5" /> Rebuild the demo
                  </Button>
                </form>
              </>
            ) : (
              <form action={switchDataMode}>
                <input type="hidden" name="mode" value="demo" />
                <Button type="submit" variant="secondary" size="sm">
                  <FlaskConical aria-hidden className="size-3.5" /> Explore the demo
                </Button>
              </form>
            )}
          </div>
          {profile.dataMode === 'demo' && liveReady.length === 0 ? (
            <Callout tone="neutral" className="mt-4">
              No platform credentials are configured on this server yet, so live mode would have nothing to connect. API_SETUP.md explains where each value goes.
            </Callout>
          ) : null}
          <p className="mt-3 text-[12px] text-muted">Switching never deletes anything: demo and live data are stored apart and never mixed in analysis.</p>
        </section>

        <SectionForm id="schedule" title="Schedule & recommendations" description="When collection runs (in your time zone) and how often today’s opportunities are rebuilt.">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-[13px] font-medium text-ink">
                <input type="checkbox" name="enabled" defaultChecked={settings.schedule.enabled} className="size-4 accent-[var(--accent)]" />
                Collect automatically
              </label>
              <Field label="Run times (24-hour)" hint="Leave a box empty to remove it. Default: morning, afternoon, evening.">
                <div className="grid grid-cols-4 gap-2">
                  {times.map((t, i) => (
                    <input key={i} name="time" type="time" defaultValue={t} className={compactInputClass} aria-label={`Run time ${i + 1}`} />
                  ))}
                </div>
              </Field>
              <Field label="Time zone">
                <select name="timezone" defaultValue={profile.timezone} className={selectClass}>
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex flex-col gap-3">
              <Field label="Refresh recommendations">
                <select name="frequency" defaultValue={settings.recommendations.frequency} className={selectClass}>
                  <option value="daily">Once a day (after the first run)</option>
                  <option value="every_run">After every run</option>
                  <option value="weekly">Once a week</option>
                </select>
              </Field>
              <Field label="Ideas per refresh" hint="SPOTTER shows fewer when fewer trends pass the evidence gates.">
                <input name="count" type="number" min={3} max={15} defaultValue={settings.recommendations.count} className={compactInputClass} />
              </Field>
            </div>
          </div>
        </SectionForm>

        <SectionForm
          id="weights"
          title="Trend Score weights"
          description="How much each measured component counts. Shares are normalised to 100%; components without data are left out for that trend and their share goes to the rest. Saving re-scores the current trends right away."
        >
          <WeightsEditor keys={TREND_COMPONENT_KEYS} labels={COMPONENT_LABEL} descriptions={TREND_DESCRIPTIONS} initial={settings.trend.weights} samples={s.trend} />
        </SectionForm>

        <SectionForm id="fit" title="Creator Fit & ranking" description="How a trend’s fit for you is judged, and how Opportunity balances a hot trend against a good fit.">
          <div className="mb-6">
            <TrendFitSlider initial={Math.round(settings.fit.trendWeight * 100)} />
          </div>
          <WeightsEditor keys={FIT_COMPONENT_KEYS} labels={FIT_LABELS} descriptions={FIT_DESCRIPTIONS} initial={settings.fit.weights} samples={s.fit} />
        </SectionForm>

        <SectionForm id="gates" title="Evidence gates" description="What a trend needs before it can be recommended. Stricter gates mean fewer, better-supported ideas.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Look back (days)" hint="3–60">
              <input name="lookbackDays" type="number" min={3} max={60} defaultValue={settings.trend.lookbackDays} className={compactInputClass} />
            </Field>
            <Field label="Minimum confidence" hint="0–100">
              <input name="minConfidence" type="number" min={0} max={100} defaultValue={settings.trend.minConfidence} className={compactInputClass} />
            </Field>
            <Field label="Minimum posts" hint="1–25">
              <input name="minContentCount" type="number" min={1} max={25} defaultValue={settings.trend.minContentCount} className={compactInputClass} />
            </Field>
            <Field label="Minimum creators" hint="1–10">
              <input name="minCreatorCount" type="number" min={1} max={10} defaultValue={settings.trend.minCreatorCount} className={compactInputClass} />
            </Field>
            <Field label="Breakout multiple" hint="A single post this many times its creator’s normal counts on its own">
              <input name="breakoutMultiple" type="number" min={2} max={100} step={0.5} defaultValue={settings.trend.breakoutMultiple} className={compactInputClass} />
            </Field>
          </div>
        </SectionForm>

        <SectionForm id="niche" title="Niche" description="Used to judge niche fit and to screen out off-topic posts. Comma-separated.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Niche">
              <input name="label" defaultValue={settings.niche.label} className={compactInputClass} />
            </Field>
            <Field label="Subtopics">
              <input name="subtopics" defaultValue={settings.niche.subtopics.join(', ')} className={compactInputClass} />
            </Field>
            <Field label="Keywords" className="md:col-span-2">
              <textarea name="keywords" rows={3} defaultValue={settings.niche.keywords.join(', ')} className={`${compactInputClass} h-auto py-2`} />
            </Field>
            <Field label="Exclude posts mentioning" hint="e.g. topics you never cover" className="md:col-span-2">
              <input name="excludeKeywords" defaultValue={settings.niche.excludeKeywords.join(', ')} className={compactInputClass} />
            </Field>
          </div>
        </SectionForm>

        <SectionForm id="platforms" title="Platform weighting" description="How much each platform’s posts count in trend scores (1 = normal, 0 = ignore, up to 3).">
          <div className="grid gap-4 sm:grid-cols-3">
            {PLATFORMS.map((p) => (
              <Field key={p} label={PLATFORM_LABEL[p]}>
                <input name={p} type="number" min={0} max={3} step={0.1} defaultValue={settings.platformWeights[p]} className={compactInputClass} />
              </Field>
            ))}
          </div>
        </SectionForm>

        <SectionForm
          id="discovery"
          title="Discovery"
          description="Where public trend candidates come from. TikTok has no official API for other creators’ videos, so discovery runs on YouTube and Instagram only."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="YouTube searches (one per line)" hint={`search.list is limited to ${env.YOUTUBE_SEARCH_DAILY_LIMIT} calls a day; with ${settings.schedule.times.length} runs a day, keep queries × runs under that.`}>
              <textarea name="queries" rows={8} defaultValue={settings.discovery.youtube.queries.join('\n')} className={`${compactInputClass} h-auto py-2 font-mono text-[12px]`} />
            </Field>
            <div className="flex flex-col gap-4">
              <Field label="YouTube channels to watch (channel IDs)" hint="Their new uploads are read from the uploads playlist — cheap on quota.">
                <textarea name="channelIds" rows={3} defaultValue={settings.discovery.youtube.channelIds.join('\n')} className={`${compactInputClass} h-auto py-2 font-mono text-[12px]`} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Searches per run">
                  <input name="maxSearchesPerRun" type="number" min={0} max={50} defaultValue={settings.discovery.youtube.maxSearchesPerRun} className={compactInputClass} />
                </Field>
                <Field label="Search window (days)">
                  <input name="publishedWithinDays" type="number" min={1} max={30} defaultValue={settings.discovery.youtube.publishedWithinDays} className={compactInputClass} />
                </Field>
                <Field label="Track posts for (days)">
                  <input name="trackDays" type="number" min={1} max={30} defaultValue={settings.discovery.youtube.trackDays} className={compactInputClass} />
                </Field>
              </div>
            </div>
            <Field label="Instagram hashtags" hint="Needs Meta’s Instagram Public Content Access approval; 30 different hashtags per 7 days.">
              <input name="hashtags" defaultValue={settings.discovery.instagram.hashtags.join(', ')} className={compactInputClass} />
            </Field>
            <Field label="Instagram accounts to watch (usernames)" hint="Professional accounts only, read through Business Discovery.">
              <textarea name="businessAccounts" rows={3} defaultValue={settings.discovery.instagram.businessAccounts.join('\n')} className={`${compactInputClass} h-auto py-2 font-mono text-[12px]`} />
            </Field>
          </div>
        </SectionForm>

        <SectionForm
          id="ai"
          title="AI providers"
          description="AI classifies posts, groups them by meaning and writes briefs. It never produces a score. The built-in local provider works offline; LLM providers need an API key in the server environment."
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Field label="Language model">
              <select name="provider" defaultValue={settings.ai.provider} className={selectClass}>
                <option value="local">Built-in (offline)</option>
                <option value="anthropic">Anthropic {keys.anthropic ? '' : '(key not set)'}</option>
                <option value="openai">OpenAI {keys.openai ? '' : '(key not set)'}</option>
              </select>
            </Field>
            <Field label="Model" hint="Blank = provider default">
              <input name="model" defaultValue={settings.ai.model ?? ''} placeholder="default" className={compactInputClass} />
            </Field>
            <Field label="Embeddings">
              <select name="embeddingProvider" defaultValue={settings.ai.embeddingProvider} className={selectClass}>
                <option value="local">Built-in (offline)</option>
                <option value="openai">OpenAI {keys.openai ? '' : '(key not set)'}</option>
                <option value="voyage">Voyage AI {keys.voyage ? '' : '(key not set)'}</option>
              </select>
            </Field>
            <Field label="Embedding model" hint="Blank = provider default">
              <input name="embeddingModel" defaultValue={settings.ai.embeddingModel ?? ''} placeholder="default" className={compactInputClass} />
            </Field>
            <Field label="Max posts per run" hint="Cost control for LLMs">
              <input name="maxItemsPerRun" type="number" min={10} max={2000} defaultValue={settings.ai.maxItemsPerRun} className={compactInputClass} />
            </Field>
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Keys are read from <span className="font-mono">ANTHROPIC_API_KEY</span>, <span className="font-mono">OPENAI_API_KEY</span> and <span className="font-mono">VOYAGE_API_KEY</span> on the
            server. If a provider fails, SPOTTER falls back to the built-in one for that run and logs it.
          </p>
        </SectionForm>
      </div>
    </>
  )
}
