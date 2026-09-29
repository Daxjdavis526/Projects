import { ExternalLink } from 'lucide-react'
import { PLATFORM_LABEL, type EvidenceExample } from '@/core/domain/types'
import { PlatformDot } from '@/components/ui/primitives'
import { compact, multiple, relativeTime } from '@/lib/format'

/**
 * Example posts behind a trend. Only metadata the platform API returned is
 * shown, with a link to the post on the platform — never a copy of it.
 * Simulated (demo) posts are not linked: they do not exist anywhere.
 */

export function EvidencePosts({ posts }: { posts: EvidenceExample[]; timeZone?: string }) {
  const now = new Date()
  if (!posts.length) return <p className="text-[13px] text-muted">No example posts are available for this trend.</p>
  return (
    <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
      {posts.map((p) => {
        const href = p.dataOrigin === 'demo' ? null : p.url
        return (
          <li key={p.contentItemId} className="flex items-start gap-3 px-3 py-2.5">
            <PlatformDot platform={p.platform} className="mt-1.5" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-ink" title={p.title ?? undefined}>
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer noopener" className="inline-flex max-w-full items-center gap-1 hover:underline">
                    <span className="truncate">{p.title ?? 'Untitled post'}</span>
                    <ExternalLink aria-hidden className="size-3 shrink-0 text-muted" />
                  </a>
                ) : (
                  (p.title ?? 'Untitled post')
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-2.5 text-[12px] text-muted">
                <span>{PLATFORM_LABEL[p.platform]}</span>
                <span>{p.creatorName ?? 'Author not shared by platform'}</span>
                {p.creatorFollowerCount !== null ? <span>{compact(p.creatorFollowerCount)} followers</span> : null}
                {p.publishedAt ? <span>{relativeTime(p.publishedAt, now)}</span> : null}
                {p.dataOrigin === 'demo' ? <span className="text-warning-text">simulated</span> : null}
                {p.dataOrigin === 'manual' ? <span title="Captured by you; numbers are what you saw at the time">captured by you</span> : null}
              </div>
            </div>
            <div className="shrink-0 text-right text-[12px]">
              <div className="tabular font-semibold text-ink">{p.views !== null ? `${compact(p.views)} views` : '—'}</div>
              <div className="tabular text-muted">{p.outperformance !== null ? `${multiple(p.outperformance)} usual` : 'no baseline'}</div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
