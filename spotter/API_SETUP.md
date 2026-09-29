# SPOTTER API setup

**Docs checked 2026-09-29.**

This guide shows you how to get every credential SPOTTER can use: Google (YouTube), Meta (Instagram), TikTok, and the optional AI providers. You do it all yourself, on each platform's own developer site. SPOTTER never asks you for a secret.

Platforms rename console screens and change their rules often. If this guide and a platform's current docs disagree, trust the platform's docs. Where the official docs did not answer a question, this guide says "not confirmed in the docs as of 2026-09-29".

[CAPABILITIES.md](CAPABILITIES.md) is the companion reference. It lists what each platform gives SPOTTER, quotes the official docs behind each point, and collects the [things not verified](CAPABILITIES.md#things-not-verified). Be aware that SPOTTER's live connectors have [not yet run against a real account](CAPABILITIES.md#verification-state-nothing-here-has-touched-a-live-api). They are built and tested against the documented behaviour, so your first live connection is also their first real test.

**You can skip all of this to try SPOTTER.** With no credentials at all, it runs in demo mode on simulated data (1.6).

## Contents

1. [Before you start](#1-before-you-start)
2. [YouTube (Google Cloud)](#2-youtube-google-cloud)
3. [Instagram (Meta)](#3-instagram-meta)
4. [TikTok](#4-tiktok)
5. [AI providers (optional)](#5-ai-providers-optional)
6. [After you add credentials](#6-after-you-add-credentials)
7. [Checklist of every variable](#7-checklist-of-every-variable)

---

## 1. Before you start

### 1.1 What each platform gives you

| | YouTube | Instagram | TikTok |
|---|---|---|---|
| What SPOTTER reads | Your channel, videos and YouTube Analytics. Public videos found by keyword search and channel watchlists | Your professional account, posts and insights. On the Facebook Login path, also other professional accounts by username, and hashtag search | Your own public videos and profile counts. Nothing from other creators |
| Works for your own account without platform review? | Yes | Yes | Only in TikTok's Sandbox test mode |
| Approval that changes what SPOTTER can do | YouTube's "Analytics & Reporting" approval. Until then YouTube data is shown but not scored (2.9) | App Review and Business Verification, for hashtag search (3.7) | App review to leave Sandbox. Hard to pass for a personal tool (4.8) |
| Variables | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, optional `YOUTUBE_API_KEY` | `INSTAGRAM_APP_ID` + `INSTAGRAM_APP_SECRET`, or `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` |

Every platform is optional and independent. Set up the ones you want, in any order.

### 1.2 A public HTTPS address (`APP_URL`)

For live data, SPOTTER needs a fixed public address that starts with `https://`, for example `https://spotter.example.com`. Put it in `APP_URL`.

- Give the scheme and host only (plus a port, if it isn't the standard one). Add no path: SPOTTER must be served from the root of that address.
- Every registration below is built from this address. Decide it first. If it changes later, you must update every registration.
- Use HTTPS in production. SPOTTER's sign-in cookie only works over HTTPS in production (or on `localhost`).
- YouTube: Google's own examples use an `http://localhost` redirect, so you can try YouTube on a local copy (with its own Google Cloud project, see 2.2).
- Instagram: Meta's deauthorize and data deletion callbacks must reach SPOTTER from the internet. Whether Meta accepts a `localhost` redirect URI is not confirmed in the docs as of 2026-09-29.
- TikTok: redirect URIs must start with `https`, and the webhook must reach SPOTTER from the internet.

Hosting is outside this guide; [README.md → Running in production](README.md#running-in-production) covers it. With `docker compose up -d --build`, SPOTTER listens only on `127.0.0.1:3000`, so a reverse proxy that handles HTTPS must sit in front of it.

### 1.3 The addresses you will register

Each platform checks that the address it sends you back to matches one you registered, character for character. Google's docs put it plainly: "the `http` or `https` scheme, case, and trailing slash ('`/`') must all match." SPOTTER builds every address from `APP_URL`:

| Platform | Setting | Value, with `APP_URL=https://spotter.example.com` |
|---|---|---|
| Google | OAuth client: authorized redirect URI | `https://spotter.example.com/api/oauth/youtube/callback` |
| Meta (either login path) | Valid OAuth redirect URI | `https://spotter.example.com/api/oauth/instagram/callback` |
| Meta | Deauthorize callback URL | `https://spotter.example.com/api/webhooks/meta/deauthorize` |
| Meta | Data deletion request URL | `https://spotter.example.com/api/webhooks/meta/data-deletion` |
| TikTok | Login Kit redirect URI | `https://spotter.example.com/api/oauth/tiktok/callback` |
| TikTok | Webhook callback URL | `https://spotter.example.com/api/webhooks/tiktok` |

Use no trailing slash and no query string. The Instagram redirect ends in `/instagram/callback` on both Meta login paths.

SPOTTER also serves the public policy pages the platforms ask for. It builds them from its own code and your server's configuration:

| Page | Address | Register it as |
|---|---|---|
| Privacy policy | `https://spotter.example.com/privacy` | The privacy policy URL for Google (OAuth consent screen and verification), Meta (app settings) and TikTok (app settings) |
| Terms of use | `https://spotter.example.com/terms` | The terms of service URL for Google and TikTok, and for Meta if it asks |
| How to delete your data | `https://spotter.example.com/privacy#deletion` | Wherever Meta asks for data deletion instructions. The deletion callback URL above stays as it is |

- The privacy policy says SPOTTER uses YouTube API Services, and links Google's Privacy Policy and YouTube's Terms of Service. It explains how to revoke access on Google's security settings page. It also lists what is collected, which AI services receive post text (from the current AI selection), the cookie and browser storage used, how long data is kept, and how to have it deleted.
- The terms of use state that users agree to be bound by the YouTube Terms of Service, and link Instagram's and TikTok's terms.
- Links to both pages appear on the sign-in page, in the setup wizard and at the foot of every page.
- Set `OPERATOR_NAME` and `PRIVACY_CONTACT` so the pages name you and give a contact. YouTube's Developer Policies (III.A.2) require a privacy contact.

Be clear about what these pages are. They describe what the software does on your server; they are not legal advice. You, as the operator, remain responsible for your own legal obligations. Whether each platform's reviewers accept these pages is not confirmed in the docs as of 2026-09-29.

### 1.4 Where secrets go

Secrets live in one place only: the environment of the server that runs SPOTTER.

1. On that machine, copy the template: `cp .env.example .env`. Both files sit next to `package.json`.
2. Fill in values as you collect them. Leave anything you don't use empty.
3. Or skip the file, and enter the same variable names in your hosting provider's environment settings.
4. Restart SPOTTER after every change. It reads its settings once, when it starts.

The rules:

- **Never paste a secret into a chat** (including an AI assistant), an email, a ticket or a screenshot.
- **Never type a secret into SPOTTER's UI or into browser code.** SPOTTER has no field for them and never displays them. Its logs and its event log redact them.
- `.env` is excluded from git. Never commit it.
- The only passwords you type are your own account passwords, on Google's, Meta's or TikTok's own pages.
- If a secret leaks, replace it on the platform's developer site, update `.env`, and restart.

`npm run dev`, `npm start` and the command-line scripts (`npm run worker`, `npm run collect`, `npm run calibrate:embeddings` and the rest) all load `.env` the same way, when you start them from the folder that holds it. A variable already set in the environment wins over the file. `docker compose up -d --build` reads the same `.env`, and refuses to start SPOTTER until `TOKEN_ENCRYPTION_KEY` is set.

If you run the worker as a separate process (`RUN_WORKER_IN_WEB=false`), it must use the same values as the web server, above all the same `TOKEN_ENCRYPTION_KEY`. Outside Docker, start it in production as `NODE_ENV=production npm run worker`. The Docker image already sets `NODE_ENV=production`.

### 1.5 `TOKEN_ENCRYPTION_KEY`

SPOTTER encrypts every platform token it stores (AES-256-GCM). The key is 32 random bytes. Generate one with either command:

```sh
openssl rand -base64 32
```

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Put the output (44 characters) in `TOKEN_ENCRYPTION_KEY`. A 64-character hex key also works.

- **Required in production.** Without it, SPOTTER starts, logs an error, and cannot connect any account.
- In development, if it is empty, SPOTTER generates a key and keeps it in `.data/dev-secrets.json`.
- Keep a copy somewhere safe, such as a password manager. If the key is lost, stored tokens cannot be decrypted and you must reconnect every platform. Your collected data is not encrypted with this key, so it is not lost.

**Rotating the key**

1. Generate a new key.
2. Move the current value to `TOKEN_ENCRYPTION_KEY_PREVIOUS`. Put the new key in `TOKEN_ENCRYPTION_KEY`.
3. Restart SPOTTER, and a separate worker if you run one. SPOTTER now encrypts with the new key and can still read tokens encrypted with the old one.
4. Keep `TOKEN_ENCRYPTION_KEY_PREVIOUS` for about 60 days. Whenever SPOTTER refreshes an account's tokens, it re-encrypts everything it stores for that account with the new key, including a refresh token the platform kept unchanged. YouTube and TikTok tokens are refreshed within about a day. Instagram's 60-day token is refreshed only a week before it expires. To finish at once instead, press **Reconnect** for every connected platform on the Connections page.
5. Remove `TOKEN_ENCRYPTION_KEY_PREVIOUS` and restart.

An account that currently needs reconnecting is not refreshed, so it moves to the new key only when you reconnect it. If you remove the previous key too early, SPOTTER reports "No key available for encrypted value". Put the old key back, or reconnect the affected platform.

### 1.6 Demo mode

With no credentials, `npm run dev` starts SPOTTER on a simulated fitness world with an embedded database. Demo accounts connect through the same sign-in code as real ones, using simulated consent pages. Demo and live data are stored apart and never mixed, and switching between them deletes nothing. When your credentials are in place, switch to live data (section 6).

---

## 2. YouTube (Google Cloud)

Official guides: [OAuth 2.0 for web server apps](https://developers.google.com/identity/protocols/oauth2/web-server) · [Manage app audience](https://support.google.com/cloud/answer/15549945) · [Quota costs](https://developers.google.com/youtube/v3/determine_quota_cost) · [YouTube API Services Developer Policies](https://developers.google.com/youtube/terms/developer-policies) · [Compliance guide](https://developers.google.com/youtube/terms/developer-policies-guide) · SPOTTER's YouTube details: [CAPABILITIES.md → YouTube](CAPABILITIES.md#youtube)

Google reorganises its console often. This section names a screen only where Google's docs name it (the OAuth consent screen, Clients, Data Access, Quotas). Elsewhere it says what to do, not which menu to click.

**You need:** the Google account that owns your YouTube channel.

### 2.1 What SPOTTER asks Google for

SPOTTER requests two read-only permissions ("scopes"). It never uploads, edits or deletes anything.

| Scope | Google's description | What SPOTTER uses it for |
|---|---|---|
| `https://www.googleapis.com/auth/youtube.readonly` | "View your YouTube account" | Your channel, your video list and each video's public stats |
| `https://www.googleapis.com/auth/yt-analytics.readonly` | "View YouTube Analytics reports for your YouTube content" | Watch time, average view duration and percentage, engaged views, shares and subscribers gained per video |

YouTube Analytics requires the first scope as well. Approve both on Google's consent screen. If you decline Analytics, the Connections page shows "Own private analytics: Permission not granted" until you reconnect and approve it. Analytics data lags 48 to 72 hours.

### 2.2 Create a project

1. Open the Google Cloud console (console.cloud.google.com) and sign in.
2. Create a new project for SPOTTER.
3. Use this one project for your live SPOTTER. YouTube's policies ask for one API project per app, and they forbid creating extra projects to get more quota ("sharding"). Google's OAuth policies ask for a separate project per deployment tier, so a local test copy gets its own project.

### 2.3 Enable the two APIs

In the project, find each API by name and enable it:

- **YouTube Data API v3**
- **YouTube Analytics API**

### 2.4 Configure the OAuth consent screen

1. **User type:** External.
2. **App name:** anything, such as "SPOTTER". Don't put "YouTube" or "YT" in it. YouTube's [Branding Guidelines](https://developers.google.com/youtube/terms/branding-guidelines) forbid using the YouTube name in your application's name.
3. **Scopes:** on the Data Access page, add the two scopes from 2.1, exactly as written. The console marks each scope as non-sensitive, sensitive or restricted. Neither is on Google's restricted list. Whether Google classes them as sensitive is not confirmed in the docs as of 2026-09-29; the console will show you.
4. **Test users:** add the Google account that owns your channel. While the app is in Testing, only listed test users (up to 100) can sign in.
5. **Publishing status. Read this part carefully.**
   - **Testing:** Google's refresh tokens expire after 7 days. SPOTTER then loses access every week, and you must reconnect.
   - **In production:** tokens don't expire weekly. If the scopes count as sensitive and the app isn't verified, Google shows an "unverified app" warning at sign-in, and you click through it. Google's help says personal-use apps ("fewer than 100 users") can keep working this way without verification. An unverified app is limited to 100 new users over its whole lifetime, which doesn't matter for one creator.
   - **Recommended:** publish the app to In production, then reconnect YouTube once. Google's help says "Authorizations by a test user will expire seven days from the time of consent".
6. **Privacy policy and terms:** wherever the consent screen or Google's verification asks for them, give `APP_URL/privacy` and `APP_URL/terms` (1.3). Google's OAuth policies require a production app to have a homepage with a privacy policy and terms of service. Visitors to `APP_URL` see SPOTTER's sign-in page, which links both. Whether Google accepts a sign-in page as the homepage is not confirmed in the docs as of 2026-09-29.
7. **Verification is optional for you.** You need it only to remove the warning or to serve other people. It needs a privacy policy "hosted within the same domain as your application's home page" (SPOTTER's `/privacy` is), a verified domain, a justification for each scope, and a demo video uploaded to YouTube as Unlisted. Google says it "typically takes 3-5 business days".

More: [Unverified apps](https://support.google.com/cloud/answer/7454865) · [When verification is not needed](https://support.google.com/cloud/answer/13464323) · [Sensitive scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification) · [Refresh token expiration](https://developers.google.com/identity/protocols/oauth2#expiration)

### 2.5 Create the OAuth client

1. On the Clients page, create an OAuth client. Application type: **Web application**.
2. Add one authorized redirect URI: `APP_URL` followed by `/api/oauth/youtube/callback`. For example: `https://spotter.example.com/api/oauth/youtube/callback`.
3. For a local test project, use `http://localhost:3000/api/oauth/youtube/callback` with `APP_URL=http://localhost:3000`.
4. Copy the **client ID** into `GOOGLE_CLIENT_ID` and the **client secret** into `GOOGLE_CLIENT_SECRET`.

SPOTTER needs nothing else on the client.

### 2.6 Optional: an API key

`YOUTUBE_API_KEY` lets YouTube discovery (keyword searches and watchlist channels) run before you connect your channel. Once your channel is connected, SPOTTER makes every YouTube call with your channel's sign-in and does not use the key.

1. In the same project, create an API key. Its calls count against the same quota as your sign-in.
2. Restrict the key so it can only call the **YouTube Data API v3**.
3. Don't limit it to requests from particular websites. SPOTTER calls YouTube from your server, never from a browser, so that kind of restriction would block it.
4. Put the key in `YOUTUBE_API_KEY`. Treat it as a secret.

### 2.7 Fill in `.env`

```dotenv
GOOGLE_CLIENT_ID=paste-your-client-id
GOOGLE_CLIENT_SECRET=paste-your-client-secret
YOUTUBE_API_KEY=
GOOGLE_OAUTH_PKCE=true
```

`GOOGLE_OAUTH_PKCE=true` adds PKCE (S256) to the sign-in as extra protection. Google documents PKCE only for installed apps, although its discovery document advertises S256 for every client. Whether Google supports it for web server apps like SPOTTER is not confirmed in the docs as of 2026-09-29. If connecting YouTube fails and the server log mentions `code_challenge` or `code_verifier`, set it to `false` and restart.

### 2.8 Quota

A new project gets three separate daily budgets ("buckets"):

| Bucket | Default | What SPOTTER uses it for | Variable |
|---|---|---|---|
| General | 10,000 units a day | `videos.list`, `channels.list`, `playlistItems.list`, `commentThreads.list`, 1 unit per call | `YOUTUBE_DAILY_QUOTA=10000` |
| `search.list` | 100 calls a day, in its own bucket since 2026-06-01. Each extra results page is another call | Keyword discovery | `YOUTUBE_SEARCH_DAILY_LIMIT=100` |
| `videos.batchGetStats` | 10,000 units a day, in its own bucket since 2026-06-03 | Re-reading views, likes and comments of tracked videos | `YOUTUBE_BATCH_STATS_DAILY_LIMIT=10000` |

- Quotas reset at midnight Pacific Time.
- Search is the tight budget. By default SPOTTER runs 16 searches per run and 3 runs a day, which uses 48 of the 100 calls. If you add searches (Settings → Discovery) or runs (Settings → Schedule), keep searches per run × runs per day under the limit.
- SPOTTER counts every metered call before it sends it. Scheduled runs hold back a share of each bucket, set by `YOUTUBE_QUOTA_RESERVE_FRACTION` (default `0.1`, allowed 0 to 0.5), so **Refresh now** still works late in the day.
- These variables tell SPOTTER your project's real limits. Raise them only after Google grants you more quota. If they are set too high, Google refuses calls with `quotaExceeded`.
- Collection status → "YouTube quota today" shows usage. The Google Cloud console's Quotas panel shows the project's actual limits.
- SPOTTER does not budget YouTube Analytics calls. Google does not publish a default daily Analytics quota (not confirmed in the docs as of 2026-09-29).
- YouTube's policies say a project "inactive for 90 consecutive days" may lose its credentials or quota.

### 2.9 Trend scoring on YouTube data needs YouTube's approval

This is the biggest YouTube limitation. Read it before you rely on YouTube trends.

YouTube's Developer Policies (III.E.4.h) say your app must not "access or use API Data to create new or derived data or metrics". Without approval, YouTube's compliance guide allows "simple mathematical calculations" but forbids custom "scores" and ratios, and forbids inferring a video's content category. SPOTTER's trend scores, AI categorisation and personalisation are derived metrics of that kind. Since 1 June 2026, audited developers with an analytics use case can apply for permission to create derived metrics and store statistics for longer (Developer Policies III.L and the [derived metrics policy](https://developers.google.com/youtube/terms/derived-metrics-policy)).

SPOTTER takes the cautious reading. YouTube's guide leaves it unclear whether a simple number such as views per hour needs approval. SPOTTER keeps every derived analysis of YouTube data switched off until you tell it you have the approval:

| | `YOUTUBE_DERIVED_METRICS_APPROVED=false` (default) | `YOUTUBE_DERIVED_METRICS_APPROVED=true` |
|---|---|---|
| Your channel's videos and analytics | Collected and shown as YouTube reports them | Also used for AI categorisation and personalisation |
| Other channels' videos (search, watchlists) | Collected and shown as reported. Not scored, not categorised by AI | Used for trend scores, clustering and AI categorisation |
| Top public comments (AI input only, never stored) | Not read | Read for the fastest-growing videos, 1 quota unit each |
| Other channels' statistics are kept for | 30 days (Developer Policies III.E.4.b) | Up to 36 months (SPOTTER keeps 1,080 days) |
| Other channels' titles, names and descriptions | Refreshed or deleted within 30 days | The same. The amendment keeps the 30-day rule for these |
| Connections → "Public trend discovery" | Needs app review | Limited (by the search quota) |
| Connections → "Comment text" | Needs app review | Available |
| Footer of every page (live mode) | "Data from YouTube" with its links, plus a note that scoring stays off until approval | "Data from YouTube" with its links |

Either way, disconnecting YouTube in SPOTTER deletes your YouTube data at once. If SPOTTER loses access without a disconnect (for example, you revoke it in your Google account, or the sign-in stops refreshing), it deletes the data collected through your channel 28 days after it first noticed the loss, unless you reconnect before then. That is two days inside YouTube's 30-day limit, to allow for the time it takes to notice the loss and for the once-a-day clean-up. Failed retries don't restart that clock.

**How to apply:** complete a YouTube API compliance audit using the [YouTube API Services Audit and Quota Extension Form](https://support.google.com/youtube/contact/yt_api_form). YouTube's derived-metrics page says you accept its terms by selecting "Section 5: Use Cases, API Integration, and Feature Implementation", then "Analytics & Reporting" as your use case. It also says "Your API Service must reflect an analytics use case on YouTube", and that you "must distinguish these metrics from metrics sourced from API Data". Breaking these rules "may result in API quota reduction or termination of your API access". The docs checked give no review timeline, and approval is not guaranteed.

**Only after YouTube approves**, set `YOUTUBE_DERIVED_METRICS_APPROVED=true` and restart. SPOTTER cannot check the approval for you. Setting it without approval puts you in breach of YouTube's policies.

### 2.10 Asking for more quota

More than the default quota needs the same audit: "If you would like to request additional quota beyond the default allocation, you must first complete an audit" ([Quota and Compliance Audits](https://developers.google.com/youtube/v3/guides/quota_and_compliance_audits)). Use the same form and describe your use case. You may use any extra quota only for the use case YouTube approved.

The audit reviews your whole deployment against the Developer Policies. Here is where SPOTTER itself stands on three rules that concern the app:

- **Attribution (III.F.2.a):** in live mode, the footer of every page says "Data from YouTube", with links to the YouTube Terms of Service and the Google Privacy Policy. Every example post names the platform it came from and links to the original. Whether this meets YouTube's attribution rules in full is for the audit to judge.
- **YouTube's Terms (III.A.1):** the policy asks for a link to YouTube's Terms of Service, and a statement in your own terms of use that users "are agreeing to be bound by the YouTube Terms of Service". SPOTTER's terms of use at `APP_URL/terms` make that statement, with the link. The same statement appears when you create your SPOTTER account ("By creating an account you agree to the privacy policy and terms of use, including the YouTube Terms of Service"), and on YouTube's card on the Connections page.
- **Privacy policy (III.A.2):** `APP_URL/privacy` says SPOTTER uses YouTube API Services, links the Google Privacy Policy, explains how to revoke access on Google's security settings page, and gives the contact you set in `PRIVACY_CONTACT`. It also describes what is collected, how it is used and shared, and the cookies used. Links to it are on every page, and you agree to it when you create your account.

These pages describe what the software does. Your own legal obligations remain yours, and whether YouTube's auditors accept the pages is not confirmed in the docs as of 2026-09-29.

---

## 3. Instagram (Meta)

Official guides: [Instagram Platform overview](https://developers.facebook.com/documentation/instagram-platform/overview) · [Create an app](https://developers.facebook.com/documentation/instagram-platform/create-an-instagram-app) · [App Review](https://developers.facebook.com/documentation/instagram-platform/app-review) · [Business Login for Instagram](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/business-login) · SPOTTER's Instagram details: [CAPABILITIES.md → Instagram](CAPABILITIES.md#instagram)

**You need:** an Instagram **professional** account (Business or Creator). SPOTTER cannot use a personal account, so switch the account to professional in the Instagram app first. For the Facebook Login path, you also need a Facebook Page linked to that account.

### 3.1 Choose a login path first

Meta offers two setups, and "Your app can either use Facebook Login or Instagram Login but not both." SPOTTER supports both. You choose one with `INSTAGRAM_AUTH_MODE`.

| | `instagram_login` (default) | `facebook_login` |
|---|---|---|
| You sign in with | Your Instagram account | Your Facebook account |
| Facebook Page | Not needed | Required. It must be linked to the Instagram account, and you must be able to do admin-level tasks on it |
| Your profile, posts and Reels | Yes | Yes |
| Your insights: per-post views, reach, likes, comments, shares, saves, Reels watch time; daily account reach | Yes | Yes |
| Other professional accounts, by exact username (Business Discovery) | **No** | Yes: followers, and recent posts' likes, comments and Reels views (views include paid ones). No saves, shares or insights |
| Hashtag search | **No** | Yes, after App Review and Business Verification. Top posts and posts from the last 24 hours. No author name, no views |
| Permissions SPOTTER requests | `instagram_business_basic`, `instagram_business_manage_insights` | `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement` |
| Variables | `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, optional `FACEBOOK_LOGIN_CONFIG_ID` |

In plain terms: **Instagram Login cannot search or read anyone else's account.** (It can see posts that tag or mention you, which SPOTTER does not use.) Instagram trend discovery needs the Facebook Login path, a linked Page, and, for hashtags, Meta's review. If you only want your own performance data, start with Instagram Login.

Neither path can read personal (non-professional) accounts. Neither reveals which track a Reel uses, only whether its audio is licensed music or original sound. Comment text on your posts would need a comment-management permission, which SPOTTER does not request; the Connections page lists it as "Not used by SPOTTER". Switching paths later means changing the Meta app's setup and reconnecting Instagram in SPOTTER.

### 3.2 Register as a Meta developer

Sign in at [developers.facebook.com](https://developers.facebook.com) with your Facebook account and register as a developer.

### 3.3 Create the app

1. In the App Dashboard, create a new app. Follow Meta's [Create an app](https://developers.facebook.com/documentation/instagram-platform/create-an-instagram-app) guide.
2. The exact app type and use case labels on Meta's create-app screens are not confirmed in the docs as of 2026-09-29. Choose the option that gives your app the **Instagram** product.
3. Keep the app in Development mode. Section 3.7 explains why that is enough for your own account.

### 3.4 Path A: Instagram Login (`INSTAGRAM_AUTH_MODE=instagram_login`)

Meta's docs put these settings under **Instagram > API setup with Instagram login** in the App Dashboard.

1. **Add your Instagram account.** Meta's guide says: "Add an Instagram account. This account must be public." You can add it under App Roles > Roles, or under Instagram > API Setup with Instagram login. Meta's changelog describes testers accepting an invitation. How you accept it is not described in Meta's current docs (not confirmed as of 2026-09-29).
2. **Add the redirect URI** `APP_URL` + `/api/oauth/instagram/callback` to the list of valid OAuth redirect URIs. Meta warns that the dashboard "might have added a trailing slash to your URIs". SPOTTER sends the URI without one, so check the saved value.
3. **Add the two callback URLs** in the business login settings (3.6).
4. **Copy the credentials.** Meta's docs locate the ID at "Instagram > API setup with Instagram login > 3. Set up Instagram business login > Business login settings > Instagram App ID". Copy it, and the Instagram app secret that goes with it. These are *not* the Meta app's own ID and secret.

```dotenv
INSTAGRAM_AUTH_MODE=instagram_login
INSTAGRAM_APP_ID=paste-your-instagram-app-id
INSTAGRAM_APP_SECRET=paste-your-instagram-app-secret
```

A known gap in Meta's docs: its insights pages and its create-app guide list `instagram_business_manage_insights`, but some of Meta's permission lists leave it out. Which list is right is not confirmed in the docs as of 2026-09-29. If "Own private analytics" shows "Permission not granted" after you connect, this permission is the cause.

### 3.5 Path B: Facebook Login (`INSTAGRAM_AUTH_MODE=facebook_login`)

Meta's [get-started guide](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/get-started) lists the prerequisites: an Instagram Business or Creator account, "A Facebook Page connected to that account", and "A Facebook Developer account that can perform Tasks on that Page".

1. Link your Instagram professional account to a Facebook Page you manage.
2. Add Facebook Login for Business to the app. Meta's [Facebook Login for Business](https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business) docs say the configuration ID (`config_id`) "has replaced `scope`". Create a configuration that requests the four permissions from 3.1, and put its ID in `FACEBOOK_LOGIN_CONFIG_ID`. If that variable is empty, SPOTTER sends the permission list instead.
3. Register the redirect URI `APP_URL` + `/api/oauth/instagram/callback` in the app's Facebook Login settings. The word really is `instagram`: the address is the same on both paths.
4. Register the two callback URLs (3.6).
5. Make sure the Facebook account you will sign in with has a role on the app. In Development mode, only people with a role can grant permissions.
6. Copy the Meta app's own **App ID** and **App Secret** from the App Dashboard.

```dotenv
INSTAGRAM_AUTH_MODE=facebook_login
FACEBOOK_APP_ID=paste-your-meta-app-id
FACEBOOK_APP_SECRET=paste-your-meta-app-secret
FACEBOOK_LOGIN_CONFIG_ID=paste-your-configuration-id
```

When you connect, if Facebook asks which Pages or Instagram accounts to share, include your Instagram account's Page. Otherwise SPOTTER reports "No Instagram professional account linked to a Facebook Page you manage was found."

If your access to the Page comes only through a Business Manager role, Meta's docs say reading media also needs `ads_management` or `ads_read`. SPOTTER does not request those, so sign in with a Facebook account that has a direct role on the Page.

### 3.6 Deauthorize and data deletion callbacks

Meta calls SPOTTER when you remove the app in your Instagram or Facebook settings, or when you ask Meta to have your data deleted. Register both:

| Meta setting | Value |
|---|---|
| Deauthorize callback URL | `APP_URL` + `/api/webhooks/meta/deauthorize` |
| Data deletion request URL | `APP_URL` + `/api/webhooks/meta/data-deletion` |

- Instagram Login: Meta's create-app guide puts both in the business login settings ("Add your Deauthorize callback URL / Add your Data deletion request URL").
- Facebook Login: Meta's docs say you "can enable a deauthorize callback through the App Dashboard". The [data deletion callback guide](https://developers.facebook.com/documentation/development/create-an-app/app-dashboard/data-deletion-callback) covers the other one.

What SPOTTER does with them: it checks Meta's signature against `INSTAGRAM_APP_SECRET` or `FACEBOOK_APP_SECRET`, whichever is set. Then it immediately deletes the stored tokens and everything collected through that account. A deletion request gets a confirmation code and a public status page at `APP_URL/data-deletion?code=…`, as Meta requires. For the Instagram Login path, Meta does not document which secret signs these requests or which user ID they carry (not confirmed as of 2026-09-29). SPOTTER accepts either secret, and matches the Instagram account ID, the app-scoped ID or the Facebook user ID.

Meta's Platform Terms also require a privacy policy that tells users how to request deletion of their data. SPOTTER's privacy policy does this in its deletion section. Put `APP_URL/privacy` in the app's Privacy Policy URL setting. Wherever Meta asks for data deletion instructions, give `APP_URL/privacy#deletion`. The two callback URLs above stay as they are.

### 3.7 Roles, App Review and Business Verification

- **Your own account needs no App Review.** Meta: "If your app only serves your Instagram professional account or an account you manage, Standard Access is all your app needs." Meta's App Review table marks review "Not required" for "My app is only for a business I own or manage." Meta also warns that "some features might not work properly until your app has been granted Advanced Access."
- **Development mode:** "Apps in Development mode can only request permissions from role users." Your Instagram account (Path A) or Facebook account (Path B) must have a role on the app.
- **Business Verification** is required for Advanced Access, for publishing the app ("You're required to connect your app to a business that has completed Business Verification before you can publish your app"), and for Instagram Public Content Access. Meta: "If your app will only be used by app users who have a role on the app itself you do not need to complete verification."
- **Hashtag search** needs App Review for the [Instagram Public Content Access](https://developers.facebook.com/docs/features-reference/instagram-public-content-access) feature and the `instagram_basic` permission, and that feature "is only available with business verification". Meta's docs don't settle whether hashtag search works for role users without review (not confirmed as of 2026-09-29). SPOTTER simply tries. If Meta refuses, SPOTTER pauses hashtag searches for 7 days, and the Connections page says "Hashtag Search is not approved for this app yet" until the pause ends.
- **Business Discovery:** Meta's [guide](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/business-discovery) lists the permissions it needs (`instagram_basic`, `instagram_manage_insights`, `pages_read_engagement`) and names no separate review.
- **If you do go through App Review**, Meta requires app settings including a Privacy Policy URL (use `APP_URL/privacy`), an app icon, a category and a business email. It also wants "at least 1 successful API call" before you request Advanced Access. Apps with Advanced Access must complete Data Use Checkup every year.

More: [App modes](https://developers.facebook.com/documentation/development/build-and-test/app-modes) · [Business Verification](https://developers.facebook.com/documentation/development/release/business-verification) · [Hashtag search](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-facebook-login/hashtag-search)

### 3.8 Hashtag limits, tokens and API version

- **Hashtag limit:** Meta allows "a maximum of 30 unique hashtags on behalf of an Instagram Business or Creator Account within a rolling, 7 day period", and fetching a hashtag's posts counts as querying it. SPOTTER stops at 25 new hashtags per 7 days to leave headroom. Set hashtags in Settings → Discovery → "Instagram hashtags" (up to 30). The "Instagram accounts to watch" list on the same page feeds Business Discovery.
- **Tokens:** SPOTTER swaps the sign-in for a long-lived token, which lasts about 60 days.
  - Instagram Login: SPOTTER refreshes the token automatically a week before expiry, once it is at least 24 hours old. Meta: "Tokens that have not been refreshed in 60 days will expire and can no longer be refreshed." If SPOTTER is switched off for weeks, reconnect.
  - Facebook Login: SPOTTER tries to extend the token a week before expiry, but Meta documents only the exchange of a short-lived token for a long-lived one. Whether extending works is not confirmed in the docs as of 2026-09-29, so plan to reconnect about every 60 days. Meta also stops data access after "90 days, based on when the user was last active" ([details](https://developers.facebook.com/documentation/facebook-login/auth-vs-data)); after that, only a reconnect helps.
- **`META_GRAPH_API_VERSION`** defaults to `v26.0`, released 2026-07-29, with no retirement date announced yet. Change it only when Meta retires the version ([versions table](https://developers.facebook.com/docs/graph-api/changelog/versions)).
- **Rate limits:** Meta counts calls per app and user over a rolling 24 hours ("4800 * Number of Impressions"). Business Discovery and hashtag search have separate hourly limits. When Meta says to slow down, SPOTTER backs off.

---

## 4. TikTok

Official guides: [Register your app](https://developers.tiktok.com/docs/en/getting-started-create-an-app) · [Login Kit for Web](https://developers.tiktok.com/docs/en/login-kit-web) · [Scopes](https://developers.tiktok.com/docs/en/scopes-overview) · [Sandbox](https://developers.tiktok.com/docs/en/add-a-sandbox) · [App review guidelines](https://developers.tiktok.com/docs/en/app-review-guidelines) · [Token management](https://developers.tiktok.com/docs/en/oauth-user-access-token-management) · SPOTTER's TikTok details: [CAPABILITIES.md → TikTok](CAPABILITIES.md#tiktok)

### 4.1 Read this first

- **TikTok is optional. You can skip this whole section.** SPOTTER uses TikTok only for your own videos.
- **No official TikTok API lets a commercial app read other creators' videos.** The Research API is only for academic and non-profit researchers: to "I am a creator, advertiser, or commercial user. Am I eligible…?", its [FAQ](https://developers.tiktok.com/docs/en/research-api-faq) answers "No." The Commercial Content API covers ads, with EEA data only. TikTok's API for Business has a [Discovery API](https://business-api.tiktok.com/portal/docs?id=1825127469285442) for trending hashtags, but only for companies with a business developer account and an ad account. SPOTTER does not implement it, and SPOTTER does not scrape.
- **Going live may be impossible for a personal tool.** TikTok's review guidelines say: "Apps must not be for private or personal use." See 4.8.

What SPOTTER gets:
- display name and avatar (`user.info.basic`)
- username, bio and profile link (`user.info.profile`)
- follower, following, like and video counts (`user.info.stats`)
- your **public** videos, with description (up to 150 characters), duration, publish time, and view, like, comment and share counts (`video.list`)

What TikTok's API does not give it: saves, the sound a video uses, a hashtag field, transcripts, watch time, reach or audience data.

### 4.2 Create a developer account and an app

1. Sign up at [developers.tiktok.com](https://developers.tiktok.com).
2. Register an app. TikTok's rules: the name "should match the app or website name and not describe your app". The icon must be 1024 × 1024 px, JPEG, JPG or PNG, up to 5 MB.
3. Enter `APP_URL/terms` as the Terms of Service URL and `APP_URL/privacy` as the Privacy Policy URL (1.3).
4. For apps created after 9 September 2024, TikTok requires verification of the Terms of Service URL, the Privacy Policy URL and the website URL, by domain or by URL prefix (you upload a signature file). SPOTTER has no built-in way to serve that signature file. TikTok: "For Sandbox environments, URL verification is only required for Content Posting API". SPOTTER doesn't use that API, so verification matters only if you submit for review.

### 4.3 Add Login Kit, the Display API and the scopes

TikTok's integration steps say: "Add Login Kit, Display API, and scopes". The current portal's exact product names are not confirmed in the docs as of 2026-09-29 (its pages need a login). Add these scopes:

| Scope | TikTok's description | Approval |
|---|---|---|
| `user.info.basic` | "Read a user's profile info (open id, avatar, display name ...)" | Added by default with Login Kit |
| `user.info.profile` | "Read access to profile_web_link, profile_deep_link, bio_description, is_verified." | Needs approval |
| `user.info.stats` | "Read access to a user's statistical data, such as likes count, follower count, following count, and video count" | Needs approval |
| `video.list` | "Read a user's public videos on TikTok" | Needs approval |

Users can grant some scopes and refuse others. The Connections page shows what you granted.

### 4.4 Register the redirect URI

In Login Kit's web settings, register `APP_URL` + `/api/oauth/tiktok/callback`. TikTok's rules for web redirect URIs:

- absolute, and starting with `https`
- static: no query parameters, and no `#`
- shorter than 512 characters, with at most 10 per app
- an exact match with what SPOTTER sends

So `http://localhost` cannot be used. Whether `https://localhost` works for a web app is not confirmed in the docs as of 2026-09-29. Test TikTok on your real HTTPS address.

### 4.5 Register the webhook

Add TikTok's Webhooks product, and set the callback URL to `APP_URL` + `/api/webhooks/tiktok`. It must use HTTPS. TikTok subscribes you to all events.

SPOTTER acts on `authorization.removed`, which TikTok sends when you disconnect SPOTTER in TikTok, or when your account is deleted, banned or changes age. SPOTTER then deletes the stored tokens and your TikTok data. It acknowledges other events and ignores them. It checks TikTok's signature with `TIKTOK_CLIENT_SECRET` and rejects signatures more than 5 minutes old, so keep your server's clock accurate. More: [webhooks overview](https://developers.tiktok.com/docs/en/webhooks-overview).

### 4.6 Sandbox: connect your own account

TikTok's Sandbox "allows you to try out integrations without having to submit your app for review".

1. Create a sandbox. You can have up to 5.
2. Add your TikTok account as a **target user**. You can add up to 10. TikTok asks for that account's login credentials on its own developer site; this is the one place a TikTok password goes. Then log in to the account and agree to the TikTok Developer Terms of Service. TikTok says results "may take up to an hour to show".
3. Target users can then sign in through Login Kit, so you can connect TikTok from SPOTTER.

Sandbox is TikTok's testing environment. TikTok's docs neither endorse nor forbid running a real deployment in Sandbox for good (not confirmed in the docs as of 2026-09-29). Until an account is connected, the Connections page marks your TikTok profile, videos and share counts "Needs app review", because TikTok gives an unapproved app no API access except for Sandbox target users. That is expected: a target user can still connect.

### 4.7 Fill in `.env`

```dotenv
TIKTOK_CLIENT_KEY=paste-your-client-key
TIKTOK_CLIENT_SECRET=paste-your-client-secret
```

Copy the client key and client secret from the developer portal. If the portal shows separate credentials for your sandbox, use those while you work in Sandbox (not confirmed in the docs as of 2026-09-29).

### 4.8 App review (leaving Sandbox): be realistic

TikTok's FAQ says: "you will not have access to the APIs until your application has been approved." Sandbox is the exception. The [review guidelines](https://developers.tiktok.com/docs/en/app-review-guidelines) include these rules:

- "Apps must not be for private or personal use."
- "Apps that are still in development or testing will not be approved."
- "Your website URL cannot be a landing page or login page. You must have an externally facing fully developed website." Its Privacy Policy and Terms of Service links must be visible there and working. SPOTTER's sign-in page does show working links to its privacy policy and terms, but it is a login page, so a self-hosted SPOTTER still does not meet this rule.
- You need at least one demo video of the whole flow (up to 5 videos, 50 MB each). If the app has never been approved, you must record it in Sandbox, on the same domain as your website URL, showing every product and scope.
- "Only request permissions and features that your app needs."

A self-hosted SPOTTER used by one creator is a personal tool behind a login page. By TikTok's own wording, it is unlikely to pass review. TikTok says: "We do not provide an official review timeline or any guarantees for approval." Its [FAQ](https://developers.tiktok.com/docs/en/getting-started-faq) says review "may take several days to two weeks". Any change after approval must be reviewed again.

Also read TikTok's [Developer Terms](https://www.tiktok.com/legal/page/global/tik-tok-developer-terms-of-service/en). Without TikTok's written consent, they forbid use "for any commercial or unauthorized purpose" (§III.3(c)). They also forbid building "databases, or similar records" on content (§III.3(h)). SPOTTER stores only your own video metrics and deletes them when you disconnect. Have the terms reviewed before you use SPOTTER commercially.

### 4.9 Tokens

- Access tokens last 24 hours. SPOTTER refreshes them automatically.
- Refresh tokens are valid "for 365 days after the initial issuance", and TikTok may issue a new one at each refresh. SPOTTER stores the new one. TikTok's FAQ says tokens "can be extended to a maximum of one year". Whether a refresh extends the 365 days is not confirmed in the docs as of 2026-09-29.
- So **reconnect TikTok once a year.** The Connections page shows "reconnect before" and the date.
- The rate limit is 600 requests per minute per endpoint. SPOTTER uses a tiny fraction of that.

---

## 5. AI providers (optional)

SPOTTER works fully offline with its built-in provider. AI classifies posts, groups them by meaning and writes video briefs. **It never produces a score.** Trend scores are calculated by fixed rules.

A remote provider can group posts more accurately and write better briefs. It costs money per use, and it receives post text (titles, captions, hashtags and, where collected, top comments) and trend summaries. YouTube data from the API is not sent until you have YouTube's approval (2.9). Posts you capture by hand (the optional `ASSISTED_DISCOVERY_ENABLED` feature) are your own observations, not API data, so they are analysed whatever their platform. The privacy policy at `APP_URL/privacy` names the AI services that receive post text, based on the current selection.

| Provider | Used for | Variable | Default model | Where to get a key |
|---|---|---|---|---|
| Built-in (offline) | Everything | none | — | — |
| Anthropic | Language model | `ANTHROPIC_API_KEY` | `claude-opus-5-5` | The Anthropic Console ([API keys and authentication](https://platform.claude.com/docs/en/manage-claude/authentication)) |
| OpenAI | Language model and/or embeddings | `OPENAI_API_KEY` | `gpt-6-luna`; embeddings `text-embedding-3-small` at 512 dimensions | Your OpenAI platform account |
| OpenAI-compatible server | The same as OpenAI | `OPENAI_BASE_URL`, plus a key only if the server needs one | Set your own; OpenAI's defaults won't exist there (5.3) | Your own server |
| Voyage AI | Embeddings only | `VOYAGE_API_KEY` | `voyage-4-lite` at 512 dimensions | Your Voyage AI dashboard |

### 5.1 Choosing a provider

- **Settings → AI** has "Language model", "Model", "Embeddings" and "Embedding model". A choice made there wins. Leave a model field blank to use the provider's default.
- `AI_PROVIDER` (`local`, `anthropic` or `openai`) and `EMBEDDING_PROVIDER` (`local`, `openai` or `voyage`) set a server-wide default. They apply only while the Settings choice is "Built-in (offline)".
- `AI_MODEL` and `EMBEDDING_MODEL` apply when the Settings model field is blank and the provider in use is the one named in `AI_PROVIDER` or `EMBEDDING_PROVIDER`.
- If the chosen provider has no key, SPOTTER uses the built-in one, and Settings → AI names the missing variable. "In use now" shows what is actually running.

### 5.2 Cost control and failures

- **Settings → AI → "Max posts per run"** caps how many posts go to a remote provider in each run. The default is 200, and the range is 10 to 2,000. Lower it to limit spending.
- If a remote provider fails, the built-in provider handles the affected posts, and SPOTTER tries the remote one again next run. A rejected key pauses the provider for 15 minutes, a rate limit for 5 minutes, and an outage (timeouts or server errors that persist after retries) for 2 minutes. Collection status → Event log lists these fallbacks.
- **Claude's refusal fallback is automatic.** For the Claude 5-family models SPOTTER knows (`claude-opus-5-5`, `claude-opus-5`, `claude-sonnet-5-5`, `claude-fable-5-1`), SPOTTER turns on Anthropic's server-side refusal fallback. If a safety classifier declines a request, Anthropic re-runs it on the model it recommends for that case, inside the same call. Settings → AI shows "refusal fallback on". SPOTTER never uses a request that is still declined; the built-in provider handles those posts. There is nothing to configure.

### 5.3 A local server (Ollama and others)

You can point the OpenAI option at any OpenAI-compatible server:

```dotenv
AI_PROVIDER=openai
OPENAI_BASE_URL=http://localhost:11434/v1
AI_MODEL=a-chat-model-your-server-has
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=an-embedding-model-your-server-has
```

- `http://localhost:11434/v1` is Ollama's address. No key is needed unless your server asks for one.
- Set the model names. The defaults are OpenAI's (`gpt-6-luna`, `text-embedding-3-small`), and a local server won't have them.
- The server must support OpenAI-style `/chat/completions` with JSON-schema structured output, and `/embeddings` if you use it for embeddings. When a local model's answer fails SPOTTER's checks, the built-in provider handles that post.

### 5.4 Embedding thresholds

Embeddings decide which posts belong to the same trend. SPOTTER's thresholds for OpenAI and Voyage are **uncalibrated starting points**:

| Key | Meaning | OpenAI default | Voyage default |
|---|---|---|---|
| `join` | Similarity a post needs to join an existing trend | 0.55 | 0.64 |
| `create` | Similarity posts need to form a new trend together | 0.60 | 0.68 |
| `merge` | Trends at least this similar are merged | 0.85 | 0.88 |
| `fitLow` | Similarity at which topic fit is 0 | 0.25 | 0.40 |
| `fitHigh` | Similarity at which topic fit is 100 | 0.62 | 0.72 |

If trends come out too broad or too fragmented, override some or all of these values with JSON:

```dotenv
EMBEDDING_THRESHOLDS={"join":0.58,"create":0.62}
```

- `join`, `create` and `merge` must be between 0 and 1. `fitLow` and `fitHigh` must be between −1 and 1, with `fitHigh` above `fitLow`.
- If the JSON is invalid, has unknown keys or has a value out of range, SPOTTER ignores the whole override, uses the defaults, and says so in Settings → AI, naming the allowed ranges.
- For suggested values based on your own data, run `npm run calibrate:embeddings` after a few collection runs with the model configured. It reads the same `.env` as SPOTTER, and it reads stored vectors only, so it makes no API calls and costs nothing. If you use the embedded database (no `DATABASE_URL`), stop SPOTTER first: that database supports only one process at a time.
- Changing the embedding model starts a new set of vectors. SPOTTER never compares vectors from different models.

---

## 6. After you add credentials

1. **Restart SPOTTER**, and the separate worker if you run one. Settings are read only at start-up.
2. **Switch to live data.** Settings → Data source → **Switch to live data** takes you to the Connections page. During first-time setup, choose "My real accounts" instead. Switching deletes nothing.
3. **Connect each platform** on the Connections page. Press **Connect** for the platform, approve on the platform's own page, and you are sent back. Use the browser where you are signed in to SPOTTER, and finish within 10 minutes.
4. **Read the platform's card.** It shows the connected account, the token status, each permission (granted or not granted), and the list "What SPOTTER can do with YouTube" (or Instagram, or TikTok). Each item in that list has one status:

| Status shown | Meaning | What to do |
|---|---|---|
| Available | Works now | Nothing |
| Limited | Works, with a restriction explained next to it | Read the note |
| Permission not granted | Supported, but you didn't approve the permission when you connected | Reconnect and approve it |
| Needs app review | The API offers it, but the platform must approve your app first (for YouTube, the approval in 2.9) | See that platform's section |
| Not configured | This platform's server credentials are missing | Set the variables the card lists, then restart |
| Not used by SPOTTER | The API offers it, but SPOTTER doesn't use it. The note next to it says why | Nothing |
| Not offered by the API | The official API doesn't provide this for SPOTTER's use | Nothing. It is a platform limit |

5. **Watch the first run on the Collection status page.** It starts at the next scheduled time, or when you press **Refresh now**. The page shows each platform's health, "YouTube quota today", every run with what each platform and stage did, and an event log of failures, token refreshes and AI fallbacks. A failing platform backs off (15 minutes, then 30, 60 and so on, up to 6 hours) for scheduled runs. **Refresh now** always tries.

### 6.1 Common problems

| You see | Likely cause | Fix |
|---|---|---|
| "Not configured on this server" | Variables missing, or SPOTTER not restarted | Set the variables it lists, then restart |
| The platform reports a redirect URI mismatch | The registered address differs from `APP_URL` + the callback path | Compare them character by character: `https`, host, port, no trailing slash |
| "That sign-in attempt was not valid" | It took over 10 minutes, was used twice, or began in another browser | Start again from the Connections page |
| "The platform rejected the connection" | Wrong secret, the Instagram and Meta app IDs mixed up, or (YouTube) PKCE refused | Check the server log. For PKCE, see 2.7 |
| "This Google account has no YouTube channel" | You signed in with a different Google account | Reconnect and pick the account that owns the channel |
| YouTube needs reconnecting every week | The OAuth app is still in Testing | Publish it (2.4), then reconnect once |
| "No Instagram professional account linked to a Facebook Page you manage" | Facebook Login path without a linked Page | Link the Page, or switch to `INSTAGRAM_AUTH_MODE=instagram_login` |
| Connections says "Hashtag Search is not approved for this app yet" | No Instagram Public Content Access | App Review (3.7). SPOTTER tries again after 7 days |
| TikTok won't connect | Your account is not a Sandbox target user, and the app is not approved | See 4.6 |
| "No key available for encrypted value" | `TOKEN_ENCRYPTION_KEY` changed | Put the old key in `TOKEN_ENCRYPTION_KEY_PREVIOUS`, or reconnect (1.5) |
| You can't sign in to SPOTTER in production | The site is served over `http` | Use HTTPS (1.2) |

### 6.2 Recurring chores

- **TikTok:** reconnect once a year. The date is on the Connections card.
- **Instagram, Facebook Login path:** plan to reconnect about every 60 days, and whenever data access lapses (90 days after you were last active).
- **Instagram, Instagram Login path:** reconnect only if SPOTTER was off long enough for the 60-day token to expire.
- **After rotating `TOKEN_ENCRYPTION_KEY`:** remove `TOKEN_ENCRYPTION_KEY_PREVIOUS` after about 60 days (1.5).
- **YouTube:** nothing, once the OAuth app is In production.
- **Meta Graph API version:** once a year, check that `META_GRAPH_API_VERSION` is not being retired.

---

## 7. Checklist of every variable

"Secret: yes" means the value may only live in `.env` or your host's environment settings. The other values are not sensitive, but they belong in the same place.

| Variable | Needed for | Where to get it | Secret |
|---|---|---|---|
| `APP_URL` | Live data: every redirect and callback | Your public HTTPS address (1.2) | No |
| `NODE_ENV` | — | Set automatically: `production` by `npm start` and in the Docker image, `development` by `npm run dev`. Outside Docker, start a separate worker as `NODE_ENV=production npm run worker` | No |
| `DATABASE_URL` | Production (recommended) | Your PostgreSQL server. `docker compose up -d db` starts a local one (URL in `.env.example`); `docker compose up -d --build` sets it for you. Empty means the embedded database, for demo and trial use | Yes |
| `PGLITE_DATA_DIR` | Embedded database only | Default `.data/pglite` | No |
| `AUTO_MIGRATE` | — | Default `true`: apply database migrations at start-up | No |
| `TOKEN_ENCRYPTION_KEY` | Production: connecting any account. Docker Compose won't start SPOTTER without it | Generate it (1.5) | Yes |
| `TOKEN_ENCRYPTION_KEY_PREVIOUS` | Key rotation only, for about 60 days | Your old key (1.5) | Yes |
| `LOG_LEVEL` | Optional | `debug`, `info`, `warn` or `error` | No |
| `LOG_FORMAT` | Optional | `json` or `pretty` | No |
| `RUN_WORKER_IN_WEB` | — | Default `true`. Set `false` if you run `npm run worker` separately | No |
| `WORKER_POLL_INTERVAL_MS` | — | Default `15000` | No |
| `GOOGLE_CLIENT_ID` | YouTube | Google Cloud OAuth client (2.5) | No |
| `GOOGLE_CLIENT_SECRET` | YouTube | Google Cloud OAuth client (2.5) | Yes |
| `YOUTUBE_API_KEY` | Optional: YouTube discovery before you connect | Google Cloud API key (2.6) | Yes |
| `GOOGLE_OAUTH_PKCE` | YouTube | Default `true`. Set `false` only if Google rejects PKCE (2.7) | No |
| `YOUTUBE_DAILY_QUOTA` | YouTube | Default `10000`. Raise only after Google grants more (2.8) | No |
| `YOUTUBE_SEARCH_DAILY_LIMIT` | YouTube | Default `100` (2.8) | No |
| `YOUTUBE_BATCH_STATS_DAILY_LIMIT` | YouTube | Default `10000` (2.8) | No |
| `YOUTUBE_QUOTA_RESERVE_FRACTION` | YouTube | Default `0.1`, range 0 to 0.5 (2.8) | No |
| `YOUTUBE_DERIVED_METRICS_APPROVED` | YouTube trend scoring | `true` only after YouTube's approval (2.9) | No |
| `INSTAGRAM_AUTH_MODE` | Instagram | `instagram_login` (default) or `facebook_login` (3.1) | No |
| `INSTAGRAM_APP_ID` | Instagram, Instagram Login path | Meta App Dashboard, Instagram API setup (3.4) | No |
| `INSTAGRAM_APP_SECRET` | Instagram, Instagram Login path | The same place (3.4) | Yes |
| `FACEBOOK_APP_ID` | Instagram, Facebook Login path | Meta App Dashboard (3.5) | No |
| `FACEBOOK_APP_SECRET` | Instagram, Facebook Login path | Meta App Dashboard (3.5) | Yes |
| `FACEBOOK_LOGIN_CONFIG_ID` | Optional, Facebook Login path | Your Facebook Login for Business configuration (3.5) | No |
| `META_GRAPH_API_VERSION` | Instagram | Default `v26.0` (3.8) | No |
| `TIKTOK_CLIENT_KEY` | TikTok | TikTok developer portal (4.7) | No |
| `TIKTOK_CLIENT_SECRET` | TikTok: sign-in and webhook | TikTok developer portal (4.7) | Yes |
| `AI_PROVIDER` | Optional | `local`, `anthropic` or `openai` (5.1) | No |
| `AI_MODEL` | Optional | A model name. Blank means the provider's default (5.1) | No |
| `ANTHROPIC_API_KEY` | Optional: Claude | The Anthropic Console (5) | Yes |
| `OPENAI_API_KEY` | Optional: OpenAI | Your OpenAI platform account (5) | Yes |
| `OPENAI_BASE_URL` | Optional: a local or compatible server | Your server's address (5.3) | No |
| `EMBEDDING_PROVIDER` | Optional | `local`, `openai` or `voyage` (5.1) | No |
| `EMBEDDING_MODEL` | Optional | A model name. Blank means the provider's default (5.1) | No |
| `VOYAGE_API_KEY` | Optional: Voyage embeddings | Your Voyage AI dashboard (5) | Yes |
| `EMBEDDING_THRESHOLDS` | Optional | JSON. `npm run calibrate:embeddings` suggests values (5.4) | No |
| `ASSISTED_DISCOVERY_ENABLED` | Optional | Default `false`. Lets you paste in posts you saw yourself. Nothing is fetched. Captured posts are analysed on any platform | No |
| `MOCK_FAULTS` | Demo only | Simulated failures, such as `tiktok:rate_limited` | No |
