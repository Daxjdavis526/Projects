# SPOTTER architecture

How SPOTTER turns platform data into ranked video ideas, and why it is built
the way it is. For setup see [README.md](README.md); for what each platform
exposes see [CAPABILITIES.md](CAPABILITIES.md).

## Principles

1. **Numbers are computed, never generated.** Every score is a deterministic
   function of stored measurements, with its components, inputs and weights
   stored beside it and shown in the UI. AI classifies text and writes prose;
   it never sees a weight or produces a number that is displayed as measured.
2. **Missing is missing.** A value a platform does not expose is `null`,
   carried through as "unavailable". Estimates (expected views, early
   velocity) are labelled as estimates wherever they appear.
3. **Platforms are not alike.** One interface, but each connector declares
   what it can do (`capabilities.ts`), and code asks before it calls.
4. **Demo first, through the same code.** The demo world is served by fake
   platform APIs behind the real connectors' HTTP layer, so the demo exercises
   the OAuth flow, pagination, errors, quotas and the whole pipeline.
5. **Failure is local.** A platform, a provider or a stage can fail without
   taking the others down, and every failure leaves a visible trace.
6. **Simulation separate from rendering.** Everything under `src/core` imports
   no React and no Next.js, so it runs under plain Node in tests and scripts.

## Processes

```
                ┌──────────── Next.js server (next start) ────────────┐
 browser ──────►│ pages · server actions · OAuth callback · webhooks  │
                │                                                      │
                │ in-process worker (RUN_WORKER_IN_WEB=true, default) │──► platform APIs
                └───────────────────────┬──────────────────────────────┘    (or the demo transport)
                                        │                                   LLM / embedding APIs
            npm run worker (optional) ──┤
                                        ▼
                                   PostgreSQL  (or embedded PGlite for trying it out)
```

- `src/instrumentation.ts` boots the server: opens the database (migrating
  when `AUTO_MIGRATE` is on, under an advisory lock so web and worker can
  start together) and starts the worker loop unless `RUN_WORKER_IN_WEB=false`.
- The worker polls every 15 s: enqueue due scheduled runs, claim one queued
  run, execute it, heartbeat while running. Several workers may run; the
  database decides who gets what (below).
- The database is the only state. There is no cache and no queue service.

## Data model

Drizzle schema in `src/core/db/schema.ts`; SQL migrations in `drizzle/`.

| table | holds |
|---|---|
| `users`, `sessions` | local accounts (scrypt hashes) and sessions (SHA-256 of the cookie token) |
| `creator_profiles` | the workspace: time zone, data mode (demo/live), all settings as validated JSON, demo world anchor |
| `platform_accounts` | a connected account per platform and mode: handle, followers, granted scopes, status (`connected`, `needs_reauth`, `disconnected`), discovery cursor |
| `oauth_credentials` | access/refresh tokens, AES-256-GCM encrypted, with key id, expiry and refresh failures |
| `oauth_states` | pending authorizations: SHA-256 of `state`, encrypted PKCE verifier, user binding, 10-minute expiry, consumed-at |
| `creators`, `content_items` | the normalized posts (own and others') with their latest counters, per data origin (`demo`, `live`, `manual`) |
| `content_metric_snapshots` | one row per post per collection: the time series every velocity and momentum figure comes from |
| `account_metric_days` | the creator's own daily account series (views, reach, …) |
| `creator_baselines` | each creator's normal: views by post age, from their own history |
| `ai_analysis` | per post: topic, format, hook and hook type, style, audience, controversy, keywords, provider, model, prompt version, input hash |
| `content_embeddings` | one vector per post **per embedding model** (see "Embeddings") |
| `trend_clusters`, `trend_cluster_members` | trends: centroid, stage, latest scores and components; members with similarity and each post's outperformance |
| `trend_scores` | the score history of every trend: components, metrics, confidence, stage per run |
| `creator_content_performance` | lifts of the creator's own posts by topic, format, hook type, style, length, posting window, weekday, platform |
| `recommendations` | each batch's ranked ideas with the brief, the evidence snapshot, scores, and what the creator did (saved, filmed, dismissed) |
| `collection_runs` | every run: trigger, status, per-platform steps and errors, stage results, heartbeat |
| `platform_connector_health`, `api_quota_usage` | per-platform status, token health, rate limits, back-off; quota counted per bucket per day |
| `system_events` | the event log shown on Collection status (redacted) |
| `data_deletion_requests` | deletion requests received from platforms, with confirmation codes |

Content is keyed by `(platform, data_origin, external_id)`. Demo rows never
mix with live rows: every query filters by the profile's data origins.

## Connectors

`src/core/connectors/types.ts` defines `PlatformConnector`:

- an `OAuthFlow` (authorization URL, code exchange, refresh, optional revoke,
  whether it uses PKCE, a refresh policy);
- `fetchOwnProfile`, `fetchOwnContent`, `fetchOwnAnalytics`;
- `discoverPublic` and `refreshPublicMetrics` for trend candidates, each
  returning an explicit `unsupported` status where the platform has no API;
- `capabilities()`, a report built from the implementation, the server
  configuration and the scopes the creator actually granted.

Each returns normalized `ContentItem`s (`src/core/domain/types.ts`): every
metric nullable, with `metricSource` saying where a number came from
(`public_api`, `owner_insights`, `manual`, `simulated`).

All live HTTP goes through `connectors/http.ts`: a timeout on every request;
retries only for network errors, timeouts, 429 and 5xx, with full-jitter
exponential back-off; `Retry-After` honoured up to a ceiling, beyond which the
error surfaces so the scheduler backs off *between* runs rather than holding a
worker; platform error bodies translated into one error taxonomy
(`auth_expired`, `auth_revoked`, `rate_limited`, `quota_exceeded`,
`forbidden`, `schema_changed`, …). YouTube quota is budgeted per bucket before
each call (`connectors/quota.ts`), with a reserve for manual refreshes.

Mock mode is the same connector class with `fetch` replaced by the demo
transport (`src/core/demo/transport/`), which serves the simulated world as
each platform's API would, including errors injected with `MOCK_FAULTS`.

## The pipeline

`src/core/pipeline/runner.ts` executes one run as five stages. A stage that
throws is recorded as failed; later stages still run on what exists.

### 1. Collect (`collect.ts`)

For each connected platform, in isolation: make sure the token is fresh
(`tokens.ts`: refresh when due, store rotated refresh tokens, mark the
account `needs_reauth` when the platform refuses), then fetch own profile,
own content and analytics, run public discovery within its budget, and
re-read the counters of posts still being tracked. Every post read appends a
snapshot. A platform that fails gets back-off recorded in its health row; the
other platforms carry on.

### 2. AI (`analyze.ts`)

New or changed posts (by content hash) are classified in batches of 20, and
every analysed post is embedded. Only platforms whose data policy allows
derived analytics are analysed (`compliance/policy.ts`); posts the creator
captured by hand are analysed on any platform, since they are the creator's
own observations rather than API data. Details under "AI layer".

### 3. Trends (`trends.ts`)

1. **Per-post measurements.** Views per hour from the two latest snapshots
   (falling back to the lifetime average until two exist, flagged as
   estimated); engagements per hour; weighted engagement rate (comments,
   shares and saves count extra); **outperformance** = views ÷ the views
   expected for that creator at that age. The expectation comes from the
   creator's own history (`creator_baselines`) when there are enough posts,
   otherwise from follower count and niche norms, and the method is stored.
2. **Niche pace**: median views/hour of posts in the niche, overall and by age
   bucket (<24 h, 24–72 h, 72–168 h, older), so a post is compared with posts
   *of the same age*.
3. **Clustering** on embeddings (`analytics/clustering.ts`): unassigned posts
   join the nearest active trend whose centroid is at least `join` similar;
   the rest form new trends by leader clustering at `create` (minimum two
   posts); trends whose centroids exceed `merge` are merged. Centroids are
   weighted by attention. Trends with no recent members go dormant.
4. **Scoring** (`analytics/scoring.ts`), below.
5. **Stage** (`analytics/lifecycle.ts`), below.
6. A trend is named by the AI provider (label and one-sentence summary) from
   its top posts when it forms, and renamed each time it has doubled in size
   since; the built-in provider names it from its lexicon.

### 4. Personalize (`personalize.ts`)

The creator's own posts are compared with the creator's own normal on each
platform (same baseline machinery) to get each post's **lift**. Lifts are
aggregated per topic, format, hook type, style, length bucket, posting window,
weekday, platform and controversy, with shrinkage towards 1× so a topic with
two lucky posts does not look like a strength. The result also includes an
embedding centroid for each topic the creator posts about (with that topic's
lift) and a performance-weighted centroid of all their posts.

### 5. Recommend (`recommend.ts`)

Runs when due (daily after the first run of the day by default; also "every
run" or weekly). Each active trend gets a Creator Fit; trends pass the gates;
the survivors are ranked and diversified; the top N (default 7, 3–15) get a
brief. Details below.

## Scores

### Trend Score (0–100)

Six components, each shaped to 0–100, combined as a weighted mean. A
component with no data is `null`, shown as "unavailable", and **drops out**:
the remaining weights are renormalised rather than pretending the missing
component was zero or average.

Two shaping functions recur: `ratioScore(r, k)` maps a ratio around 1 to
0–100 (1× → 50, rising steeply above, falling below: `100·r^k / (r^k + 1)`),
and `logLogistic(x, mid, k)` does the same around `mid`.

| component | default weight | computed from |
|---|---|---|
| Velocity | 0.24 | median post's views/hour ÷ typical views/hour of same-age posts on the same platform (65%), plus the trend's total attention in "typical fresh posts" (35%). Falls back to engagements/hour when a platform reports no views. |
| Relative outperformance | 0.24 | median (70%) and best (30%) of each post's views ÷ its creator's expected views at that age |
| Cross-creator repetition | 0.20 | independent creators on a log scale (2→8 creators matters as much as 8→32), plus the share of posts sharing a format or hook |
| Engagement | 0.14 | weighted engagement rate ÷ the niche norm on the same platform |
| Recency | 0.10 | exponential decay of the median post's age (96 h) and the newest post's age (24 h) |
| Acceleration | 0.08 | momentum growth per day (below) |

Weights are edited in Settings (with a preview on real trends) and applied to
active trends immediately.

**Momentum** is the rate at which *well-performing* posts keep arriving: over
a 72-hour window, each post counts in proportion to how far it outran its
creator's normal (clamped to 0.25–4×) times its platform weight. Growth per
day = ((current + 1) ÷ (previous 72 h + 1))^(1/3). Pseudo-counts keep a trend
with one post from reading as infinite growth.

**Confidence** (0–100) is separate from the score: 30% amount of evidence
(posts), 20% breadth (independent creators), 20% measurement quality
(snapshot coverage and metric completeness), 15% cohesion (how tightly posts
sit around the centroid), 15% share of posts with a creator-specific baseline.
High ≥ 70, medium ≥ 45.

### Stage

From momentum (`STAGE_THRESHOLDS` in `lifecycle.ts`):

| stage | rule |
|---|---|
| Declining | no new posts in six days (unless young); or below 45% of its 10-day momentum peak and still falling; or growth ≤ 0.85×/day |
| Accelerating | growth ≥ 1.15×/day and older than 96 h |
| Emerging | younger than 96 h (growing or steady) |
| Mature | everything else: established and holding steady |

With fewer than four posts the stage is marked *estimated*.

### Creator Fit (0–100)

| component | default weight | computed from |
|---|---|---|
| Topic | 0.35 | similarity of the trend's centroid to the nearest of the creator's own topic centroids, mapped through `fitLow…fitHigh`, nudged by how that topic performs for them |
| Niche | 0.20 | your niche keywords found in the trend's posts, averaged with the classifier's niche relevance; excluded terms subtract |
| Format | 0.15 | your own lift on the trend's dominant format |
| Style | 0.15 | your own lift on the trend's dominant style |
| Platform | 0.10 | your own lift on the platforms carrying the trend, weighted by your platform weights |
| Length | 0.05 | your own lift at the trend's median length |

Missing components drop out as above. Each carries a one-line explanation;
the strongest ones become the "Why you" of a brief.

### Opportunity

`Opportunity = w · Trend + (1 − w) · Fit`, with `w` = 0.5 by default
(Settings → Creator Fit). With equal weights, a trend at 86 with fit 94
(opportunity 90) ranks above one at 96 with fit 31 (63.5).

**Gates** before ranking (Settings → Evidence gates): minimum confidence
(35), minimum posts (3) and independent creators (2), unless a single post is
a breakout (≥ 6× its creator's normal). **Diversity**: a second trend on the
same topic key, or with a near-identical centroid, is skipped in favour of the
next distinct idea. Excluded trends are recorded with the reason.

## AI layer

`src/core/ai/types.ts` defines two interfaces, used everywhere else:

- `AIProvider`: `analyzeContent(posts)`, `describeCluster(sample)`,
  `draftRecommendation(brief)`.
- `EmbeddingProvider`: `embed(texts)`, plus the model id and the clustering
  thresholds calibrated for that model.

Providers (`ai/registry.ts` picks them from Settings, then the environment):

| | classify / name / write | embed |
|---|---|---|
| built-in (`ai/local`) | fitness lexicon classifier (topics, formats, hooks, exercises), template writer with per-topic hooks | concept-aware feature hashing, 256 dims |
| Anthropic (`remote/anthropic.ts`) | official SDK; default `claude-opus-5-5`; structured outputs; effort low for classification, medium for briefs; server-side refusal fallback (`fallbacks: "default"`) on Claude 5-family models | — |
| OpenAI (`remote/openai.ts`) | Chat Completions with strict JSON schema; default `gpt-6-luna`; any OpenAI-compatible server via `OPENAI_BASE_URL` | `text-embedding-3-small` at 512 dims |
| Voyage (`remote/voyage.ts`) | — | `voyage-4-lite` at 512 dims |

Rules that hold for every provider (`remote/prompts.ts`):

- **Post text is data, not instructions.** It is passed as JSON and the
  system prompt says so; IDs are replaced by short aliases (`p1`, `p2`, …).
- **Outputs are schema-constrained and validated again** (zod): unknown
  enum values, missing items and malformed numbers are rejected per post.
- **Briefs only use measured facts.** The brief passed to the writer holds
  the evidence lines and a `facts` block (counts, momentum, multiples); the
  prompt forbids other numbers and copying other creators' titles, and a hook
  that reuses an example title verbatim is rejected.
- **Failure never loses a post.** Posts a provider could not analyse are
  analysed by the built-in provider for that run (recorded as such) and
  retried with the remote provider next run. A brief that fails falls back to
  the templates, with a note saying so.
- **Circuit breaker.** After its retries, an authentication failure pauses a
  provider for 15 minutes, a rate limit for 5, an outage (timeouts, 5xx) for
  2; calls during the pause fail fast. One event per
  run records the failure; API keys are scrubbed from every message.
- **Cost control.** At most `maxItemsPerRun` posts (default 200) go to a
  remote provider per run; unchanged posts are never re-sent (content hash).

### Embeddings

Every post always gets a **local** embedding; a configured remote model adds
its own vector beside it (one row per post per model). Clustering, topic fit
and "your earlier post" matching use **one model per run**: the remote model
once its vectors cover 90% of recent posts, the local vectors until then, and
back to local if coverage later falls below 60% (a failing provider). So
switching models, or losing an API key, never empties the dashboard; the
switch happens in the background and trends re-form once on the new model
(an event says so). Vectors of models no longer configured are deleted.

The thresholds for remote models are **uncalibrated starting points**.
`npm run calibrate:embeddings` compares same-topic and different-topic post
pairs in your own data and suggests values for `EMBEDDING_THRESHOLDS`
(`analytics/calibration.ts`).

## Scheduling and the worker

- **Slots** are local times in the creator's time zone (default 07:00,
  13:00, 19:00; croner). A slot missed while nothing was running is caught up
  once if less than three hours old.
- **Enqueueing is idempotent**: a unique index on (profile, mode,
  scheduled-for) means two workers cannot enqueue the same slot twice.
- **Claiming** uses `FOR UPDATE SKIP LOCKED`: one run, one worker.
- **Heartbeats** every 30 s; a run whose heartbeat is older than 15 minutes
  (the worker restarted or crashed) is marked failed with that reason, and the
  next slot runs normally.
- **Manual refresh** ("Refresh now") queues a run that may use the quota
  reserve; scheduled runs may not.
- **Retention** runs daily: compacts snapshots older than 45 days to one per
  day and older than 180 days to one per post; enforces platform limits from
  `compliance/policy.ts` (e.g. other channels' YouTube statistics ≤ 30 days
  until derived metrics are approved); deletes the authorized data of an
  account whose access has been broken for longer than the platform allows
  (YouTube: 30 days), counted from `access_lost_at`, which records when
  access first broke and is not reset by retries.
- **Demo setup** (`demo_setup` job): the wizard's demo backfill runs the real
  pipeline at each past slot on a simulated clock, in the background.

## Observability

- **Logs**: structured JSON in production (pretty in development), one line
  per event, with run and platform context; every value passes through the
  redactor (`observability/redact.ts`), which removes tokens, codes,
  signatures, cookies and API keys by key name and by pattern.
- **Events**: notable things (token refreshed or refused, platform failures,
  provider fallbacks, embedding switches) go to `system_events`, shown on
  Collection status.
- **Runs**: every run stores per-platform steps, counts and errors.
- **Health**: `GET /api/health` reports database and worker liveness (no
  configuration, no data) for uptime checks and the Docker healthcheck.

## Security

- OAuth: authorization code flow, `state` single-use (SHA-256 stored,
  consumed atomically), bound to the signed-in user and profile, 10-minute
  expiry; PKCE S256 where supported (Google); redirect URIs derived from
  `APP_URL`; code exchange and all tokens server-side.
- Tokens: AES-256-GCM with a key id per ciphertext; key rotation via
  `TOKEN_ENCRYPTION_KEY_PREVIOUS`; never sent to the browser or logged.
- Sessions: 32 random bytes in an `HttpOnly`, `SameSite=Lax` cookie
  (`__Host-` prefixed and `Secure` in production), stored hashed; sign-in
  rate limited; a constant-time dummy hash check for unknown emails.
- CSRF: state changes go through Server Actions (origin checked by Next.js)
  or verified webhooks.
- Webhooks: Meta `signed_request` verified with HMAC-SHA256 against the app
  secret(s); TikTok `Tiktok-Signature` verified over timestamp and body,
  within five minutes.
- Secrets live only in the environment (`src/core/config/env.ts` validates
  it once and names bad variables without printing values). Scripts load
  `.env` files the way Next.js does (`scripts/load-env.ts`).
- Attribution: every page of a live workspace ends with each connected
  platform's attribution and terms links (and YouTube's restriction note
  until derived metrics are approved), from `compliance/policy.ts`; every
  post row names its platform in text.

## Testing

`npm test` (vitest) needs no network and no credentials:

- `test/analytics`: scoring, momentum and stages, baselines, clustering,
  personalization, ranking, calibration.
- `test/connectors`: each live connector against recorded API responses in
  `test/fixtures/` (pagination, errors, token refresh and rotation, quota).
- `test/ai`: the built-in provider; Anthropic, OpenAI and Voyage against
  recorded responses (structured output, refusals, cut-off answers,
  fallbacks, retries, error kinds, no key in messages); provider selection
  and the circuit breaker.
- `test/pipeline`: the whole pipeline on an in-memory PostgreSQL (PGlite)
  over four simulated days, then a remote embedding model switched on and
  broken; token refresh and refusal.
- `test/server`, `test/services`, `test/assisted`: OAuth state handling,
  webhook signatures and deletion, capture parsing.

Visual checks are done by driving Chromium (Playwright) through the pages in
light, dark and phone widths; several layout bugs were only visible there.

## Extending

- **A new platform**: implement `PlatformConnector` and its
  `capabilities()` report, register it in `connectors/registry.ts`, add a
  demo transport so the demo covers it, and record fixtures for tests.
- **A new AI provider**: implement `AIProvider` and/or `EmbeddingProvider`,
  reuse `remote/prompts.ts` for prompts and validation, map errors to
  `AIProviderError` kinds, and add it to `ai/registry.ts`.
