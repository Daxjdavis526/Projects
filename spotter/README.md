# SPOTTER

> **New here? Read [GUIDE.md](GUIDE.md)** — what SPOTTER is and how to use it, in plain English.

**Trend intelligence for one fitness creator.** SPOTTER watches fitness and
lifting content on YouTube, Instagram and TikTok through their official APIs,
finds the subjects gaining unusual traction, works out which of them suit
*this* creator, and turns the best 5–10 into video ideas: an angle, a hook,
a title and caption concept, and a timed outline, with the evidence behind
each one.

Unlike the rest of this repository, SPOTTER is a **server application**
(Next.js, PostgreSQL, a background worker). It has to be: it holds OAuth
tokens, runs collection three times a day and keeps history. GitHub Pages
serves nothing usable from this folder; run it locally or on a server.

- It runs on **simulated data first**, before any credential exists, through
  the same code paths the live connectors use.
- Every number comes from a **deterministic, inspectable engine**: the Trend
  Score, Creator Fit and Opportunity scores show their components, inputs and
  weights, and the weights are yours to change. AI only classifies posts and
  writes the briefs; it never produces a score.
- It **never fabricates a value**. What a platform does not expose is shown
  as unavailable, not estimated. [CAPABILITIES.md](CAPABILITIES.md) is the
  matrix of what each platform does and does not allow.

## Screens

| | |
|---|---|
| **Today** | 5–10 ranked opportunities (Opportunity = weighted Trend × Fit), each with the suggested angle, hook, title, caption, script outline and example posts; plus Emerging and Accelerating trends and what works for you. Filters: time range, platform, topic, stage, minimum confidence. |
| **Trends** | Every tracked trend with its stage (Emerging, Accelerating, Mature, Declining), score, fit, momentum sparkline and confidence. |
| **Trend detail** | Score history, the six Trend Score components and six Fit components with their inputs and explanations, the posts behind it, recurring formats/hooks/sounds, and an on-demand video brief. |
| **Your performance** | Your posts against *your own* normal on each platform: account series, lifts by topic, format, hook, length, posting window, and the patterns worth knowing. |
| **History** | Earlier recommendations, what you saved or filmed, and trends that have run their course. |
| **Connections** | Connect / reconnect / disconnect each platform, “connected as @handle”, last sync, granted permissions, token health, and what each platform lets SPOTTER measure. Tokens are never shown. |
| **Collection status** | Every run, each platform's steps, quota use, rate limits, back-off, and the event log. |
| **Settings** | Schedule, recommendation frequency, score weights (with a live preview), evidence gates, niche and subtopics, platform weighting, discovery queries and watchlists, AI providers. |
| **Setup** | A seven-step wizard: account → YouTube → Instagram → TikTok (skippable) → niche → recommendation frequency → dashboard. |

## Quick start (demo, no credentials)

Requires Node.js 22.12 or newer.

```sh
cd spotter
npm install
npm run dev          # http://localhost:3000
```

Open the page, create the local account, choose **Demo data**, and connect the
three demo accounts on the simulated consent screens. SPOTTER backfills ten
days of simulated history in the background (under a minute) and the
dashboard fills in. Nothing leaves your machine.

With no `DATABASE_URL`, SPOTTER uses an embedded PostgreSQL (PGlite) under
`.data/`. For a real PostgreSQL:

```sh
docker compose up -d db
echo 'DATABASE_URL=postgres://spotter:spotter@localhost:5432/spotter' >> .env
npm run dev
```

Or build the demo from the command line: `npm run demo:seed` (prints the
sign-in password once).

## Going live

1. Copy `.env.example` to `.env` **on the machine that runs SPOTTER** and fill
   it in. [API_SETUP.md](API_SETUP.md) walks through each platform in plain
   English: which console, which settings and permissions, the addresses to
   register, and what needs the platform's approval. Secrets belong in that
   file or your host's environment settings only, never in the app or
   anywhere else.
2. Set `OPERATOR_NAME` and `PRIVACY_CONTACT`: SPOTTER serves a privacy
   policy at `/privacy` and terms of use at `/terms`, generated from what this
   installation actually does. Those are the URLs the platforms ask for when
   you set up and review your apps.
3. Restart, open **Settings → Data source**, switch to live data, and connect
   your accounts on **Connections**.
4. Watch **Collection status** after the first run.

The live connectors are implemented against the official documentation
(checked 2026-09-29) and tested against fixture responses written to the
documented response shapes. They have
**not yet been exercised against real accounts**: treat each as
*implemented, awaiting credentials/approval* until your first live run
succeeds. Several capabilities also need a platform's review before they work
at all (YouTube's derived-metrics approval, Meta's App Review for hashtag
search, TikTok's app review); the Connections page shows the status of each.

## Running in production

```sh
openssl rand -base64 32        # → TOKEN_ENCRYPTION_KEY in .env
docker compose up -d --build   # PostgreSQL + SPOTTER on 127.0.0.1:3000
```

- Put it behind HTTPS (a reverse proxy such as Caddy or nginx) and set
  `APP_URL` to the public https URL: OAuth redirect URIs are derived from it,
  and session cookies are `Secure` in production.
- `TOKEN_ENCRYPTION_KEY` is required in production. Losing it means
  reconnecting every platform; rotating it is supported
  (`TOKEN_ENCRYPTION_KEY_PREVIOUS`).
- The worker runs inside the web process by default. For more isolation, set
  `RUN_WORKER_IN_WEB=false` and run `npm run worker` as its own process; any
  number of workers can run, and each run is claimed by exactly one.
- Without Docker: `npm ci && npm run build && npm start`.
- Back up the PostgreSQL database; it is the only state.

## Commands

| | |
|---|---|
| `npm run dev` | development server with the in-process worker |
| `npm run build` / `npm start` | production build / server |
| `npm run worker` | the scheduler and collector as a separate process |
| `npm run collect` | run one collection now and print each platform's steps (good for testing credentials) |
| `npm run demo:seed [-- --days 14]` | build the demo workspace from the command line |
| `npm run calibrate:embeddings` | suggest clustering thresholds for a remote embedding model from your collected posts |
| `npm run db:migrate` / `npm run db:generate` | apply / generate database migrations |
| `npm run typecheck`, `npm run lint`, `npm test` | checks; `npm run check` runs all three |

## How it works

```
 connectors ──► snapshots ──► AI stage ──► trends ──► personalisation ──► recommendations
 (official APIs,  (time series   (classify +   (cluster by    (your posts vs      (gates, rank,
  or the demo      of every       embed each    meaning, score  your own normal)    diversify,
  transport)       post's stats)  post)         0–100, stage)                       write briefs)
```

Collection runs at 07:00, 13:00 and 19:00 in your time zone (configurable),
each platform isolated from the others, with quota budgets, rate-limit
back-off and exponential retry. [ARCHITECTURE.md](ARCHITECTURE.md) has the
details: the data model, every formula, the AI layer, security and failure
handling.

## What is measured, what is estimated, what is unavailable

Blunt, because the numbers drive decisions:

- **Measured:** views, likes, comments (and shares/saves where a platform
  gives them) of each post, re-read every run and kept as a time series; your
  own analytics where the platform provides them (YouTube watch time,
  Instagram reach and saves, …); subscriber/follower counts as the platforms
  report them (YouTube rounds them to three significant figures).
- **Estimated, and labelled as such:** a post's *expected* views at its age
  (from the creator's own history when there is enough of it, otherwise from
  follower count and niche norms); views per hour before two snapshots exist
  (lifetime average); the pace of a typical post in the niche.
- **Heuristic by design:** the Trend Score and Creator Fit are weighted sums
  of shaped ratios. The shapes and default weights are judgement, not a fitted
  model; they are shown, explained and adjustable. The lifecycle stages come
  from momentum thresholds (≥1.15×/day accelerating, ≤0.85× declining, below
  45% of the 10-day peak declining).
- **Classification can be wrong.** The built-in classifier knows the fitness
  topics in its lexicon and puts anything else in “General training content”.
  An LLM provider names new topics but can also misjudge them. Topic labels
  never change a score directly; grouping comes from embeddings.
- **Unavailable, and never invented:** other creators' TikTok videos (no
  official API for a commercial app), Instagram hashtag results' authors and
  view counts, any platform's sound/music for other creators' posts, YouTube
  captions of other creators' videos, a YouTube “is a Short” flag. See
  [CAPABILITIES.md](CAPABILITIES.md).
- **The demo world is synthetic.** Its creators, posts and numbers are
  generated; handles end in `.demo` and nothing in it links anywhere.

## Security and privacy

- OAuth 2.0 authorization code flow; `state` is random, single-use, bound to
  the signed-in user and valid 10 minutes (only its SHA-256 is stored); PKCE
  (S256) where the platform supports it (Google). Code exchange and every
  token stay on the server.
- Tokens are encrypted at rest with AES-256-GCM (`TOKEN_ENCRYPTION_KEY`),
  refreshed before they expire, and deleted on disconnect together with
  everything collected through that account.
- Local accounts use scrypt password hashing; sessions are random tokens
  (stored hashed) in `HttpOnly`, `SameSite=Lax` cookies, `Secure` with the
  `__Host-` prefix in production; sign-in is rate limited. Server actions
  verify the request origin.
- Logs and stored events pass through a redactor that strips tokens, codes,
  signatures and API keys.
- Platform-initiated removal is honoured: Meta's deauthorize and data-deletion
  callbacks (signed-request verified) and TikTok's `authorization.removed`
  webhook (signature verified) delete the account's data immediately.
- Platform data rules are enforced in code (`src/core/compliance/policy.ts`),
  e.g. other channels' YouTube statistics are kept at most 30 days until
  YouTube approves derived metrics.
- The optional browser-assisted capture (`ASSISTED_DISCOVERY_ENABLED`, off by
  default) only records a link and the numbers *you* saw. SPOTTER never
  scrapes, automates a browser, or works around a platform's limits.

## AI providers

The built-in provider works offline and costs nothing. For better topic
naming and writing, set `ANTHROPIC_API_KEY` (default model
`claude-opus-5-5`, with Anthropic's server-side refusal fallback enabled) or
`OPENAI_API_KEY` (default `gpt-6-luna`; `OPENAI_BASE_URL` points it at a
local OpenAI-compatible server such as Ollama) and choose the provider in
**Settings → AI**. Embeddings can come from OpenAI or Voyage AI. When a
provider fails, the affected posts use the built-in provider for that run and
are retried next run; a rejected key or rate limit pauses the provider for a
few minutes instead of failing post after post.

## Testing

`npm test` runs about 160 tests with no network and no credentials: the
analytics engine, each connector and LLM provider against fixture responses
written to the documented shapes (no live calls), and the whole pipeline end to end on an
in-memory PostgreSQL (including switching to and losing a remote embedding
provider), plus OAuth state handling, webhook signatures and token refresh.
GitHub Actions runs typecheck, lint, tests and a production build on every
change (`.github/workflows/spotter.yml`).

## Layout

```
src/
  app/                 Next.js routes: pages, OAuth callback, webhooks, health
  components/          UI (charts are accessible, with table views)
  server/              session auth, server actions, page queries (server-only)
  core/
    connectors/        PlatformConnector: youtube/, instagram/, tiktok/, capabilities, HTTP client
    demo/              the simulated world and its fake platform APIs
    pipeline/          collect → AI → trends → personalise → recommend; scheduler, worker, retention
    analytics/         baselines, velocity, momentum, scoring, lifecycle, clustering, fit, ranking
    ai/                AIProvider/EmbeddingProvider; local/ (offline) and remote/ (Anthropic, OpenAI, Voyage)
    db/                Drizzle schema and client (PostgreSQL or PGlite)
    security/          encryption, passwords, random tokens
    compliance/        platform data policies as code
drizzle/               SQL migrations
scripts/               worker, collect, demo seed, migrate, embedding calibration
test/                  vitest suites and API response fixtures
```
