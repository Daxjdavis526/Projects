import { eq } from 'drizzle-orm'
import { getDb } from '@/core/db/client'
import { dataDeletionRequests } from '@/core/db/schema'
import { PLATFORM_LABEL } from '@/core/domain/types'
import { Logo } from '@/components/shell/logo'

export const metadata = { title: 'Data deletion status' }

/** Public status page for a platform-initiated data deletion request (linked from Meta). */
export default async function DataDeletionPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const code = (await searchParams).code ?? ''
  const db = await getDb()
  const [req] = /^[\w-]{8,40}$/.test(code) ? await db.select().from(dataDeletionRequests).where(eq(dataDeletionRequests.confirmationCode, code)).limit(1) : []
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[460px] rounded-2xl border border-line bg-surface p-6 shadow-card">
        <Logo />
        <h1 className="mt-6 text-[20px] font-semibold text-ink">Data deletion request</h1>
        {req ? (
          <div className="mt-3 flex flex-col gap-2 text-[14px] text-ink-2">
            <p>
              Confirmation code <span className="font-mono text-ink">{req.confirmationCode}</span> ({PLATFORM_LABEL[req.platform]}).
            </p>
            <p>
              Status: <b className="text-ink">{req.status === 'received' ? 'received' : 'completed'}</b> on {req.completedAt?.toISOString().slice(0, 10) ?? req.requestedAt.toISOString().slice(0, 10)}.
            </p>
            <p>{req.detail}</p>
          </div>
        ) : (
          <p className="mt-3 text-[14px] text-ink-2">No request with that confirmation code was found.</p>
        )}
      </div>
    </main>
  )
}
