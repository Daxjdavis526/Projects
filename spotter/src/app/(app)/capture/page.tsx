import { ExternalLink, Inbox, Trash2 } from 'lucide-react'
import { getEnv } from '@/core/config/env'
import { listCaptures } from '@/core/assisted/capture'
import { getDb } from '@/core/db/client'
import { requireProfile } from '@/server/auth/session'
import { removeCapture } from '@/server/actions/capture'
import { PLATFORM_LABEL } from '@/core/domain/types'
import { Callout, Card, CardHeader, EmptyState, PageHeader, PlatformDot, buttonClass } from '@/components/ui/primitives'
import { CaptureForm } from '@/components/capture-form'
import { compact, relativeTime } from '@/lib/format'

export const metadata = { title: 'Captured posts' }

export default async function CapturePage() {
  const { profile } = await requireProfile()
  const env = getEnv()
  const intro = (
    <>
      Saw something in the app that SPOTTER cannot reach through an official API? Paste it here. SPOTTER never fetches the page, never automates a browser, and never
      works around a platform’s limits — this is your own note, labelled as manual data wherever it appears.
    </>
  )
  if (!env.ASSISTED_DISCOVERY_ENABLED) {
    return (
      <>
        <PageHeader title="Captured posts" description={intro} />
        <Card>
          <EmptyState icon={Inbox} title="Assisted discovery is off">
            It is optional and disabled by default. To use it, set <span className="font-mono text-[12px]">ASSISTED_DISCOVERY_ENABLED=true</span> in the server environment and restart.
          </EmptyState>
        </Card>
      </>
    )
  }
  const now = new Date()
  const rows = await listCaptures(await getDb())
  return (
    <>
      <PageHeader title="Captured posts" description={intro} />
      {profile.dataMode === 'demo' ? (
        <Callout tone="warning" className="mb-6">
          This workspace shows demo data. Captured posts are real-world notes, so they are kept with live data and appear there.
        </Callout>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <CaptureForm />
        </Card>
        <Card>
          <CardHeader title="Captured" subtitle="Analysed with the next run. Numbers are as you entered them, once — they never update." />
          {rows.length ? (
            <ul className="border-t border-line">
              {rows.map((r) => (
                <li key={r.id} className="flex items-start gap-3 border-b border-line px-5 py-3 last:border-b-0">
                  <PlatformDot platform={r.platform} className="mt-1.5" />
                  <div className="min-w-0 flex-1 text-[13px]">
                    <a href={r.url ?? '#'} target="_blank" rel="noreferrer noopener" className="inline-flex max-w-full items-center gap-1 font-medium text-ink hover:underline">
                      <span className="truncate">{r.title ?? r.caption?.split('\n')[0] ?? r.url}</span>
                      <ExternalLink aria-hidden className="size-3 shrink-0 text-muted" />
                    </a>
                    <div className="text-[12px] text-muted">
                      {PLATFORM_LABEL[r.platform]} · {r.handle ? `@${r.handle} · ` : ''}
                      {r.views !== null ? `${compact(r.views)} views · ` : ''}
                      captured {relativeTime(r.capturedAt, now)}
                    </div>
                  </div>
                  <form action={removeCapture}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className={buttonClass('ghost', 'sm', 'px-2')} aria-label="Delete captured post">
                      <Trash2 aria-hidden className="size-3.5" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Inbox} title="Nothing captured yet" />
          )}
        </Card>
      </div>
    </>
  )
}
