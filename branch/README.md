# BRANCH

A full-screen audiovisual toy. Luminous branching structures — part lightning,
part blood vessel, part root system — grow across black in real time, and the
music drives their physics.

## Running it

Any static web server works. It is a single self-contained HTML file with no
build step and no dependencies.

    cd branch
    python3 -m http.server 8000
    # open http://localhost:8000

Opening `index.html` directly from disk works too, except that the
`audio/track.mp3` auto-load is blocked by browser file:// rules. Use the
**Load** button or drag a file in instead.

## The music

Two original instrumentals are generated live in the browser by the Web Audio
API — no audio files, nothing pre-recorded. Every kick, bass note and chord is
scheduled sample-accurately at play time.

| Track | Feel |
|---|---|
| Obsidian Dawn | 126 BPM, four-on-the-floor, dark techno |
| Catacomb | 112 BPM, swung breakbeat, dark cinematic |
| Solar Kuduro | 104 BPM, dembow / reggaeton, anthemic |
| Iron Lung | 92 BPM, half-time heavy rock, distorted power chords |

Press **T** to cycle between them.

All four follow the same nine-section shape: atmospheric intro → rising rhythm →
build → drop → energetic middle → second build → bigger drop → atmospheric
outro, running roughly 2:55 to 3:45 depending on tempo.

### Listening to something else entirely

BRANCH can also analyse audio it isn't playing — a browser tab, or the room.

- **Tab** (or `C`) — asks you to pick a browser tab to share, with the
  "also share tab audio" box ticked. Play Spotify, Apple Music or YouTube in
  that tab and the visuals follow it.
- **Mic** (or `M`) — listens through the microphone. Works with anything that
  makes a sound, including a phone on a speaker.

Captured audio only ever reaches the analyser, never the output, so there is no
echo and no microphone feedback. Volume is whatever the original source is
playing at — BRANCH's own volume slider does nothing in this mode.

Streaming services can't be connected to directly: their audio is delivered
under DRM that a web page is not permitted to read. Capturing the tab sidesteps
that, because the browser hands over the sound rather than the service.

### Playing your own track

Three ways, in order of convenience:

1. **Load** button in the control bar (or press `L`).
2. **Drag an audio file** anywhere onto the window.
3. **Drop a file at `audio/track.mp3`** — it is picked up automatically at
   startup, ahead of the built-in tracks. `.wav` works too.

Nothing is hard-coded to a timeline. The visuals read the audio spectrum live,
so a file the program has never seen behaves exactly like the built-in ones.

## Controls

Hidden until the mouse moves.

| | |
|---|---|
| `Space` | play / pause |
| `R` | restart |
| `F` | fullscreen |
| `X` | reduced flashing |
| `T` | switch built-in track |
| `L` | load an audio file |
| `C` | listen to a shared browser tab |
| `M` | listen through the microphone |

Plus volume and a **Force** slider that scales the overall growth intensity.

## On a phone

The visualisation itself runs well on a phone; the interface needed the work.

- The control bar spans the screen as two rows with touch-sized targets, and
  clears the home indicator via the safe-area inset.
- **Tab** is hidden on touch devices — mobile browsers cannot capture tab
  audio. **Load** and **Mic** both work. Fullscreen hides itself on iOS
  Safari, which has no element fullscreen.
- Mobile browsers fire `resize` continuously as the address bar hides and
  shows, and a real resize reallocates every canvas and clears the artwork.
  Height-only changes small enough to be browser chrome are ignored, so the
  structures survive scrolling; a genuine rotation still rebuilds.
- The reduced-flashing toggle on the title card deliberately does not start
  playback. On a phone it used to sit near the middle of the screen, so it
  swallowed the very tap meant to begin — and because the idle system is
  already growing behind the title card, it looked alive while never having
  started. It now sits near the bottom, and tapping it says what to do next.
- iOS only lets audio begin from inside a user gesture, and an `await` ends
  that gesture even when it resolves immediately. Everything audio-related in
  `begin()` therefore runs synchronously in the tap, including a one-sample
  silent buffer to unlock the context; the check for a project track happens
  afterwards. A later tap re-arms a context iOS suspended while backgrounded.
- If there is still no sound, check the iPhone's silent switch — it mutes web
  audio. After six seconds of silence the page says so itself.

## Installing it as an app

`index.html` ships with a web app manifest, an icon and the Apple standalone
meta tags, so once it is served over https it installs to a home screen and
launches full-screen with no browser chrome — and, importantly, as a top-level
page rather than inside anyone's frame.

- **iPhone/iPad:** open the URL in Safari → Share → *Add to Home Screen*.
- **Android:** open in Chrome → menu → *Install app* / *Add to Home screen*.

A file opened from the Files app on iOS runs in a restricted preview where
scripts may not execute; a phone needs the page served over http(s).

## If a phone stays silent

iOS routes Web Audio through the *ambient* audio category, which the physical
ring/silent switch mutes — even at full volume, and even though the page is
producing sound. Media elements play through the *media* category, which the
switch does not mute. The **Sound fix** button, shown only on touch devices,
re-routes the mix through a media element for that reason. MediaStream
playback is uneven across Safari versions, so it is opt-in and reverts by
itself if the browser refuses.

Quick way to tell what is wrong: if the branches are pulsing in time with the
music, sound *is* being generated and the device is muting it — check the ring
switch, then Sound fix. If they are not reacting at all, playback never
started.

## Photosensitivity

The visualisation flashes in time with major musical events. **Reduced
flashing** is available on the title screen before anything starts, in the
control bar, and on the `X` key. It cuts flash strength to about a sixth and
removes the bright wash entirely.

## How it works

Growth tips choose a direction each step from four competing terms:

    next = normalize( attraction + persistence + noise + fieldBias )

- **attraction** — space colonisation. Tips are recruited by nearby attractor
  points and consume them on arrival. Recruitment is restricted to a forward
  cone, which is what stops branches spiralling back into food they have
  already passed. This is the angiogenesis / root-foraging behaviour.
- **persistence** — the current heading, weighted heavily, plus a turn-rate
  limit that scales with thickness. Trunks bend gently; twigs whip around.
- **noise** — angular jitter applied every few steps rather than continuously,
  so branches travel in straight leader runs and change direction at discrete
  points, with occasional sharp kinks. That is the probabilistic path selection
  of a dielectric breakdown model.
- **fieldBias** — a slow global flow field giving whole regions a grain.

### Colour and scale follow the kind of sound

True instrument separation isn't possible live in a browser, so BRANCH reads
the *character* of the sound instead, from three standard measurements:
spectral centroid (how bright it is), spectral flatness (noisy like a cymbal
versus tonal like a bass note), and how long energy has been sustaining.

Every reading — and every driver of speed, brightness, glow and tip count —
is normalised against the range that track actually uses. A running mean and
mean absolute deviation put the track's typical value at the middle of the
scale, so a threshold means the same thing on a sparse ambient piece and on a
loudness-war master. This matters more than it sounds: commercial masters are
compressed nearly flat, and absolute thresholds tuned on dynamic material
simply never trip on them.

The reading is held over about half a second rather than sampled
instantaneously, because networks spawn on kicks and sampling at that instant
would only ever report "the kick is loud".

Each new network then *samples* from the three characters weighted by their
current scores, rather than all taking whichever is currently leading. Picking
the leader put a single colour on the whole screen at a time; sampling gives a
dominant colour with a real minority of the others, and the balance shifts as
the music does.

| Character | Sound | Grows like |
|---|---|---|
| **Ice** (blue-white) | bright, noisy, percussive — hats, snares, transients | fine, fast, jagged lightning |
| **Jade** (green) | held and tonal — pads, sustained chords | long smooth sweeping arcs, vine-like |
| **Ember** (crimson) | low and heavy — kick and bass dominance | thick, slow, arterial |

Ice stays dominant at roughly 60–70% of networks; the other two are accents.
Alongside colour, three things scale independently:

- **Loudness** sets how large the structure becomes — the attractor cloud's
  radius and point count.
- **How long the sound sustains** sets how long the network keeps growing.
- **The character itself** sets thickness, jitter, turn rate and how readily
  branches kink — which is why a pad grows like a vine and a kick like an
  artery, from the same equation with different weights.

An occupancy grid stops branches piling into occupied space and detects the
moment two independent networks meet, which draws a connecting bolt.

The music scales growth speed, branching probability, noise amplitude,
brightness, glow, thickness and the number of live tips. Six analysis bands
feed it, with spectral-flux onset detection for kicks and a fast/slow low-band
energy pair that identifies builds and drops from the audio alone.

Rendering is three additive canvas layers over black: a trail layer holding all
growth and fading slowly, a trunk layer so a kick can re-light the primary
structure in one composite, and two downsampled copies for bloom. Old geometry
is never swept — the fade *is* the cleanup, which is why segment count costs
nothing per frame.

The system is self-limiting: as the canvas fills, growth speed, per-segment
brightness and glow all fall while the fade accelerates, so no musical event
can white the screen out. A frame-time governor trims tip count and the wide
bloom tap on slower machines.

## Layout

    index.html      built, standalone — this is the one you open
    src/page.html   source (no html/head/body wrapper, for embedding)
    build.sh        wraps src/page.html into index.html
    audio/          drop track.mp3 here to override the built-in music
