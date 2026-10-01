import Link from 'next/link'
import { Logo } from '@/components/shell/logo'

/** Layout for the public policy pages: readable column, no sign-in required. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10 sm:py-14">
      <Logo />
      <h1 className="mt-10 text-[28px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
      <p className="mt-1 text-[13px] text-muted">Last updated {updated}</p>
      <div className="legal mt-8 flex flex-col gap-7 text-[15px] leading-relaxed text-ink-2">{children}</div>
      <LegalLinks className="mt-12 border-t border-line pt-6" />
    </main>
  )
}

export function LegalSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="mb-2 text-[17px] font-semibold text-ink">{title}</h2>
      <div className="flex flex-col gap-2.5">{children}</div>
    </section>
  )
}

/** Privacy and terms, always one click away (YouTube III.A.2(a); TikTok asks for visible links). */
export function LegalLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Policies" className={className}>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
        <li>
          <Link href="/privacy" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
            Privacy policy
          </Link>
        </li>
        <li>
          <Link href="/terms" className="underline decoration-line-strong underline-offset-2 hover:text-ink">
            Terms of use
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export const ext = 'underline decoration-line-strong underline-offset-2 hover:text-ink'
