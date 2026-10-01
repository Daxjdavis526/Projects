/**
 * The installation's privacy policy, generated from what this code actually
 * does and how this server is configured (which platforms and AI providers),
 * so it cannot drift from the implementation. Public: no sign-in needed.
 *
 * It covers what YouTube's Developer Policies III.A.2 require (uses YouTube
 * API Services, Google Privacy Policy link, revocation via Google's security
 * settings, contact) and what Meta's Platform Terms ask for (how to request
 * deletion). It describes the software's behaviour; the operator remains
 * responsible for their own legal obligations.
 */
import { connection } from 'next/server'
import { selectProviders } from '@/core/ai/registry'
import { policyFor } from '@/core/compliance/policy'
import { getEnv } from '@/core/config/env'
import { parseSettings } from '@/core/config/settings'
import { getDb } from '@/core/db/client'
import { creatorProfiles } from '@/core/db/schema'
import { ext, LegalPage, LegalSection } from '@/components/legal-page'

export const metadata = { title: 'Privacy policy' }

const UPDATED = '2026-09-29'

export default async function PrivacyPage() {
  await connection()
  const env = getEnv()
  const db = await getDb()
  const [profile] = await db.select({ settings: creatorProfiles.settings }).from(creatorProfiles).limit(1)
  const { ai, embedder } = selectProviders(parseSettings(profile?.settings), env)
  const yt = policyFor('youtube', env, 'live')
  const operator = env.OPERATOR_NAME ?? 'the person who runs this installation'
  const officialOpenAI = !env.OPENAI_BASE_URL || new URL(env.OPENAI_BASE_URL).host === 'api.openai.com'
  const processors = [
    ai.name === 'anthropic' ? 'Anthropic (Claude), to classify post text and write video ideas' : null,
    ai.name === 'openai' ? (officialOpenAI ? 'OpenAI, to classify post text and write video ideas' : 'a language-model server run by the operator') : null,
    embedder.name === 'openai' ? (officialOpenAI ? 'OpenAI, to turn post text into embeddings for grouping' : 'an embedding server run by the operator') : null,
    embedder.name === 'voyage' ? 'Voyage AI, to turn post text into embeddings for grouping' : null,
  ].filter((p): p is string => !!p)

  return (
    <LegalPage title="Privacy policy" updated={UPDATED}>
      <p>
        This SPOTTER installation is run by {operator} to plan their own social media content. It finds fitness content that is gaining traction and suggests
        videos to make. This page explains what it collects, why, where it goes, how long it is kept and how to have it deleted.
      </p>

      <LegalSection title="Who to contact">
        <p>
          {env.PRIVACY_CONTACT ? (
            <>
              Questions or requests about privacy: <span className="text-ink">{env.PRIVACY_CONTACT}</span>.
            </>
          ) : (
            <>Questions or requests about privacy go to the operator of this installation.</>
          )}
        </p>
      </LegalSection>

      <LegalSection title="Platforms this app uses">
        <p>
          SPOTTER uses <strong className="text-ink">YouTube API Services</strong>. By using it you agree to be bound by the{' '}
          <a className={ext} href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer noopener">
            YouTube Terms of Service
          </a>
          , and Google&apos;s handling of data is described in the{' '}
          <a className={ext} href="http://www.google.com/policies/privacy" target="_blank" rel="noreferrer noopener">
            Google Privacy Policy
          </a>
          .
        </p>
        <p>It also uses the Instagram Platform (Meta) and TikTok for Developers (Login Kit and the Display API), only through their official APIs.</p>
      </LegalSection>

      <LegalSection title="What is collected">
        <p>
          <strong className="text-ink">From accounts you connect</strong> (only with your permission, and only what each platform lets you grant): your profile (name,
          handle, follower and video counts), your posts and their public counts (views, likes, comments, shares), and the analytics the platform provides for your own
          account (for example watch time, reach and saves).
        </p>
        <p>
          <strong className="text-ink">About other creators&apos; public posts</strong>, through the platforms&apos; official discovery features: the post&apos;s title
          or caption, hashtags, publish time, duration, public counts, and the creator&apos;s public handle and follower count. The top public comments of some YouTube
          videos are read as input for classification and are not stored.
        </p>
        <p>
          <strong className="text-ink">Posts you record yourself</strong>, if the capture feature is turned on: the link and the numbers you type in. Nothing is fetched
          from the link.
        </p>
        <p>
          <strong className="text-ink">Your SPOTTER account</strong>: name, email, a password hash, and your settings.
        </p>
      </LegalSection>

      <LegalSection title="How it is used">
        <p>
          To measure which subjects are gaining traction, compare how your own posts perform against your normal, and suggest videos. The data is not sold, not used
          for advertising, and not shared with anyone other than the services listed below.
        </p>
      </LegalSection>

      <LegalSection title="Where it goes">
        <p>Everything is stored in this installation&apos;s own database. Sign-in tokens from the platforms are encrypted there and never shown in the app.</p>
        <p>Requests go to the platforms themselves (Google/YouTube, Meta/Instagram, TikTok) to read the data described above.</p>
        {processors.length ? (
          <p>
            Post text (titles, captions, hashtags, and YouTube comments as described above) is also sent to: {processors.join('; ')}. They process it to return a
            result and do not receive your platform tokens.
          </p>
        ) : (
          <p>This installation classifies and writes with SPOTTER&apos;s built-in, offline methods: post text is not sent to any AI service.</p>
        )}
      </LegalSection>

      <LegalSection title="Cookies and browser storage">
        <p>
          One cookie keeps you signed in (HttpOnly, removed when you sign out or it expires). Your light/dark display preference is stored in your browser. There are
          no analytics, tracking or advertising cookies.
        </p>
      </LegalSection>

      <LegalSection title="How long it is kept">
        <p>Data from your own accounts is kept while the account is connected and deleted as soon as you disconnect it (or remove the app on the platform).</p>
        <p>
          Other creators&apos; YouTube statistics are kept at most {yt.publicStatsRetentionDays} days, and other YouTube data is refreshed or deleted within{' '}
          {yt.publicMetadataRefreshDays} days. If SPOTTER loses access to your YouTube account and it is not restored, the data collected through it is deleted
          within {yt.authorizationRecheckDays} days. Other platforms&apos; public data is kept up to {policyFor('instagram', env, 'live').publicStatsRetentionDays} days; older measurements
          are thinned out along the way.
        </p>
      </LegalSection>

      <LegalSection id="deletion" title="Revoking access and deleting your data">
        <p>
          In SPOTTER, open <strong className="text-ink">Connections</strong> and choose <strong className="text-ink">Disconnect</strong>: SPOTTER revokes its access
          where the platform allows it, deletes the stored tokens and deletes everything collected through that account, immediately.
        </p>
        <p>
          You can also remove SPOTTER on the platform&apos;s side at any time. For Google and YouTube, in addition to the steps above, you can revoke access on the{' '}
          <a className={ext} href="https://security.google.com/settings/security/permissions" target="_blank" rel="noreferrer noopener">
            Google security settings page
          </a>
          . When Instagram or TikTok tells SPOTTER that you removed it, SPOTTER deletes the data collected through that account straight away; Instagram deletion
          requests get a confirmation code you can check on the <a className={ext} href="/data-deletion">data deletion status page</a>.
        </p>
        <p>To delete your SPOTTER account itself, ask the operator (see &ldquo;Who to contact&rdquo;).</p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>This page describes the software as it runs on this server. If what SPOTTER collects changes, this page changes with it, with a new date above.</p>
      </LegalSection>
    </LegalPage>
  )
}
