# SPOTTER: start here

## What this is

SPOTTER is a personal assistant for planning fitness videos.

Every day, thousands of lifting and fitness videos go up on YouTube,
Instagram and TikTok. A few of them take off, and when several creators'
videos on the same subject take off at once, that subject is a **trend**.
Spotting those early, and knowing which ones suit *you*, is hard to do by
scrolling.

SPOTTER does it for you:

1. **It watches.** Three times a day it reads public fitness posts and your
   own posts through each platform's official API.
2. **It groups.** Posts about the same thing ("how deep should you squat?",
   "is the bench arch cheating?") are grouped into trends.
3. **It measures.** Each trend gets a **Trend Score** from 0 to 100: how fast
   its posts are gaining views, how far they beat their creators' usual
   numbers, how many different creators are on it, and whether it's speeding
   up or fading.
4. **It checks the fit.** Each trend also gets a **Fit score** from 0 to 100:
   how close it is to what *your* audience already responds to, based on your
   own past posts.
5. **It suggests videos.** Every day it picks the best 5–10 trends and writes
   a video idea for each: an angle, an opening line (the "hook"), a title, a
   caption and a timed outline, plus the example posts that prove the trend
   is real.

Every number shows how it was worked out, so you never have to take a score
on faith. If a platform doesn't share something, SPOTTER says so instead of
guessing.

## The two ways to run it

- **Demo mode:** fake creators, fake posts, nothing to sign up for. Use it to
  learn the app. Takes about five minutes to set up.
- **Live mode:** your real accounts and real platform data. Needs some
  one-time setup with Google, Meta and TikTok (see "Going live" below).

Start with the demo.

## Try the demo

You need a computer with **Node.js 22** or newer
([nodejs.org](https://nodejs.org)).

1. Open a terminal in the `spotter` folder and run:
   ```sh
   npm install
   npm run dev
   ```
2. Open **http://localhost:3000** in your browser.
3. **Create your account.** Your name, email and a password. This account
   lives only on your computer.
4. **Choose "Demo data"**, then click **Connect** for YouTube, Instagram and
   TikTok. Each opens a pretend sign-in screen; click **Allow**.
5. **Pick your niche** (the default is Fitness / Bodybuilding / Strength
   Training) and **how often you want new ideas** (daily is the default).
6. Click **Open my dashboard**. SPOTTER builds ten days of pretend history, which takes
   about a minute, and then your dashboard fills in.

To stop SPOTTER, press `Ctrl+C` in the terminal. Run `npm run dev` again to
start it later; everything is kept.

## Using it day to day

The menu on the left (along the top on a phone) has these pages:

| Page | What it's for |
|---|---|
| **Today** | Start here. Your video ideas for today, best first. |
| **Trends** | Every trend SPOTTER is tracking, and what stage it's at. |
| **Your performance** | How your own posts do compared with your normal. |
| **History** | Ideas from earlier days, and the ones you saved or filmed. |
| **Connections** | Connect or disconnect accounts, and see what each platform lets SPOTTER read. |
| **Collection status** | When SPOTTER last checked each platform, and anything that went wrong. |
| **Settings** | Schedule, your niche, how scores are weighted, and more. |

### Reading a video idea (the Today page)

Each card is one idea:

- **Opportunity** (the big number) is what the list is sorted by: the Trend
  score and your Fit score combined.
- **Trend** is how hot the subject is right now. **Fit** is how well it
  suits you.
- The **stage** tells you where the trend is in its life:
  - **Emerging**: brand new and growing. The earliest chance.
  - **Accelerating**: established and still picking up speed. A good time.
  - **Mature**: steady. Still works, but others are already on it.
  - **Declining**: fading. Usually skip.
- **Suggested hook**, **Your angle**, **Title idea** and **Caption idea** are
  starting points to make the video your own. They aren't scripts to copy.
- **Why it matters** gives the evidence, and the "Why you" part says why it
  suits you.
- **Script outline** is a second-by-second plan for the video.
- **Evidence** lists real example posts from other creators. Open them to
  see what's working, then do your own take.

Underneath each idea:

- **Save** keeps it for later.
- **Mark filmed** records that you made it.
- **Dismiss** hides it.

**Open trend** shows the full detail, explained further down.

The filters at the top narrow the list by time range, platform, topic, stage
or confidence. **Refresh now** (top right) checks the platforms immediately
instead of waiting for the next scheduled check.

### Looking deeper at a trend

Click **Open trend** on an idea, or any trend on the Trends page, to see:

- how its score has moved over time;
- what each part of the score is and why it got that number;
- the posts in it, with which ones beat their creator's usual numbers;
- the formats, hooks and sounds those posts have in common.

**Draft a video brief** writes a fresh idea for any trend, even one that isn't
in today's list.

### Making it yours (Settings)

- **Schedule:** when SPOTTER checks the platforms. The default is 7am, 1pm
  and 7pm.
- **Niche:** your subject and subtopics, and words to exclude.
- **Trend Score / Creator Fit:** how much each part of the score counts. Move
  a slider and the preview shows the effect.
- **Creator Fit** also has the one slider that matters most: how much you
  care about "hot right now" versus "right for me".

## Going live

When you're ready for real data:

1. **Get the platform credentials.** Each platform makes you register a
   developer app, which gives you an ID and a secret. [API_SETUP.md](API_SETUP.md)
   walks you through each one in plain English.
2. **Put them in a `.env` file** next to SPOTTER: copy `.env.example`, rename
   the copy to `.env` and fill in the blanks. Never paste these values into
   SPOTTER's pages, a chat, or anywhere public.
3. **Restart SPOTTER**, go to **Settings → Data source** and click
   **Switch to live data**.
4. **Open Connections** and connect your real accounts. Each one sends you to
   the platform to approve access.
5. After the next scheduled check, or after you press **Refresh now**, your
   dashboard fills with real trends.

Live use also needs SPOTTER running on a server with a web address that
starts with `https://`, so the platforms can send you back after you approve
access. [README.md](README.md#running-in-production) covers that.

### Good to know before going live

- **Some features need the platform's approval first.** The Connections page
  shows which ones:
  - YouTube trends are shown but not scored until Google approves your
    project.
  - Instagram hashtag search needs Meta's review.
  - TikTok only lets SPOTTER read your own videos.
- **The AI is optional.** SPOTTER works on its own for free. Adding an
  Anthropic or OpenAI key in `.env`, then choosing it in **Settings → AI**,
  gives it better topic names and more natural writing.
- **You're always in control.** Disconnecting an account deletes everything
  SPOTTER collected through it, right away.

## If something looks wrong

- **The dashboard is empty:** check **Collection status**. A first check can
  take a minute, and the demo needs about a minute to build its history.
- **A platform shows "Needs attention":** go to **Connections** and click
  **Reconnect**.
- **A number looks surprising:** open the trend. Every score shows its parts
  and the posts behind it.

For how SPOTTER works inside, see [ARCHITECTURE.md](ARCHITECTURE.md). For
what each platform does and doesn't allow, see
[CAPABILITIES.md](CAPABILITIES.md).
