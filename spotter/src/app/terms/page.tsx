/**
 * Terms of use for this installation. Short on purpose: SPOTTER is a tool
 * one creator runs for themselves. It carries the statement YouTube's
 * Developer Policies III.A.1 require (users agree to the YouTube Terms of
 * Service) and points to the platforms' own terms. Public: no sign-in needed.
 */
import { connection } from 'next/server'
import { getEnv } from '@/core/config/env'
import { ext, LegalPage, LegalSection } from '@/components/legal-page'

export const metadata = { title: 'Terms of use' }

const UPDATED = '2026-09-29'

export default async function TermsPage() {
  // Rendered per request, so OPERATOR_NAME comes from the running server, not the build.
  await connection()
  const env = getEnv()
  const operator = env.OPERATOR_NAME ?? 'the person who runs it'
  return (
    <LegalPage title="Terms of use" updated={UPDATED}>
      <p>
        This SPOTTER installation is run by {operator} for their own content planning. By signing in and using it you accept these terms and the{' '}
        <a className={ext} href="/privacy">
          privacy policy
        </a>
        .
      </p>

      <LegalSection title="Platform terms">
        <p>
          SPOTTER uses YouTube API Services: by using SPOTTER you agree to be bound by the{' '}
          <a className={ext} href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer noopener">
            YouTube Terms of Service
          </a>
          .
        </p>
        <p>
          When you connect Instagram or TikTok, their own terms continue to apply to your accounts (
          <a className={ext} href="https://help.instagram.com/581066165581870" target="_blank" rel="noreferrer noopener">
            Instagram Terms of Use
          </a>
          ,{' '}
          <a className={ext} href="https://www.tiktok.com/legal/page/us/terms-of-service/en" target="_blank" rel="noreferrer noopener">
            TikTok Terms of Service
          </a>
          ). SPOTTER only reads data through the platforms&apos; official APIs and never posts on your behalf.
        </p>
      </LegalSection>

      <LegalSection title="What the recommendations are">
        <p>
          Trend scores are computed from public numbers the platforms report, and video ideas are suggestions built on them. They can be wrong or incomplete, and
          what you publish is your decision. Posts by other creators are shown for reference and link to the original; they remain their creators&apos; work.
        </p>
      </LegalSection>

      <LegalSection title="Your data">
        <p>
          How data is collected, kept and deleted is described in the{' '}
          <a className={ext} href="/privacy">
            privacy policy
          </a>
          . Disconnecting an account in SPOTTER deletes what was collected through it.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
