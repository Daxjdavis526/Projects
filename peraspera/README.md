# PER ASPERA

*through hardship, to the stars*

An animated short film, about nineteen minutes long, about a kid who looked up.
It follows him through a mission in England cut short by COVID, welding railings
with his brother, racing, meeting his wife, losing a friend, one sentence from
his brother that changed his direction, the worst summer of his life, the
driveway at the end of it, rocket engines, a job that wasn't him, a model he
builds at night, and a farm he hasn't bought yet. At the end he is lying on his
back in the grass, looking up, the way he was at the start.

After the credits there is one more scene: my own guess at what happens next.

Live: https://daxjdavis526.github.io/Projects/peraspera/

There is no video file and no audio file. Every frame is painted on a canvas as
it plays, and every note of the score and every sound effect is synthesised on
the spot with WebAudio. Press **Begin**, turn the sound up, and press **F** for
full screen.

## Controls

| key | |
|---|---|
| Space / K | play, pause |
| ← / → | back / forward ten seconds |
| [ / ] | previous / next scene |
| M | sound on / off |
| F | full screen |

Drag the bar at the bottom to scrub; the ticks on it are the chapters. The bar
hides itself while the film plays and comes back when you move the mouse.

`?t=SECONDS` or `?scene=ID&at=SECONDS` in the URL starts somewhere else; the
scene ids are in `src/script.js`. `?mute` starts silent. `?q=0.5` renders at
half resolution on a slow machine.

## The story, scene by scene

| chapter | scenes | |
|---|---|---|
| The kid | `sky`, `bedroom` | a hill at night; the bedroom where the posters fade and the blinds come down |
| England | `england` | a mission in the rain; the lockdown; going home early |
| Iron | `shop` | welding railings with his brother for their dad |
| Speed | `track`, `podium` | racing, and the medals |
| Her | `meet`, `wedding` | the paddock at sundown; the temple |
| — | `brothers` | the brothers' own shop |
| Loss | `friend` | the orange helmet on the pit wall; a memorial lap |
| The question | `gym`, `apply` | the line; the application sent the same day |
| Summer | `leaving`, `doors`, `goodbyes`, `nights` | pest control, door to door; the people who ran it; the good ones going home; crying alone |
| Home | `driveway` | the new driveway at sunrise |
| Rockets | `school`, `study`, `teststand` | ahead of the class; teaching himself propulsion; an Estes C6 on a thrust stand |
| The job | `cleanroom`, `cad`, `research` | building satellites, from the wrong side of the glass |
| The dream | `code`, `farm`, `lookup` | the engine model, the farm it is for, and the same sky |
| After the credits | `guess`, `future-*` | what I think happens next |

## How it works

```
index.html        the page, the title screen and the transport bar
src/script.js     the film as data: scenes, durations, dissolves, every
                  caption, every sound effect and ambience cue (pure)
src/film.js       the projector: canvas sizing, the clock, dissolves,
                  captions, controls
src/kit.js        maths, easing, deterministic noise, colour (pure)
src/paint.js      skies, stars, the Milky Way, glow, rain, sparks, smoke,
                  heat haze, film grain, text
src/figure.js     the character rig
src/props.js      cars, houses, bikes, laptops, the satellite, a nozzle
src/scenes/*.js   one draw function per scene
src/music.js      the score, composed as a list of events (pure)
src/score.js      the synthesiser that plays it
src/data.js       the numbers the film says are real (pure)
```

**Everything is a pure function of time.** Each scene's `draw(ctx, t)` paints
the whole frame for scene time `t` and keeps nothing between calls: particles
are born at fixed times and fly ballistically, walk cycles come from distance
covered, rain falls modulo its own period. That is what lets you scrub
anywhere, and what lets `tools/frames.mjs` render any frame on its own.

**The clock is the audio hardware.** While sound is running the film reads its
time from the `AudioContext`, and the score is scheduled a third of a second
ahead against that same clock, so picture and music cannot drift apart over
nineteen minutes. Seeking tears down the whole audio graph and rebuilds it from
the new time; pads and long effects already under way rejoin partway through.

**The film is drawn in a virtual 1920 × 1080 frame** and letterboxed to any
window. The canvas backing store is capped near 2560 pixels wide.

**The figures** are faceless and built from tapered capsules: a profile or a
front view, with the same pose vocabulary for both (shoulders and elbows,
hips and knees, a lean, a head tilt, a whole-body roll for lying down). A
figure standing on the ground is planted by its lowest foot, so walking bobs
by itself. They are silhouettes against light and flat colour where a scene is
lit from the front. His brother has his own build.

**The race** is a pseudo-3D road — the technique of 1980s arcade racers —
drawn strip by strip from a closed-form centreline, so the lean of every bike
is its speed squared times the curvature of the road at that point.

**The score** is one theme in D major. It plays first under the title, turns
to D minor for the summer, comes home at the driveway, and ends the film and
the post-credits scene. A rising figure, A–D–E–F♯–A on a bell, is the sound of
looking up; it answers the stars in the first scene and comes back whenever he
does. The instruments are a triangle-and-sine felt piano, detuned-saw pads and
strings with vibrato, a cello, an inharmonic bell, a plucked synth, and drums,
all through a generated reverb, a glue compressor and a limiter. The ambience
(rain, wind, crickets, cicadas, a crowd, fluorescent hum) and the effects (a
MIG welder's crackle, an angle grinder, a bus, door slams, a heartbeat, a
motorcycle shifting through its gears, a hot fire) are synthesised from noise
and oscillators.

## What is real, and what is made up

The story is his, as he told it. The pictures are mine, so the details are
invented: I don't know what his house, his shop, his truck, his bike, his
racing number, his school, his wife, his brother or his friend look like, and
nobody in the film has a face or a name. His race number is a star. His
friend's colour is orange. The shop sign is two crossed hammers because I don't
know the company's name.

Real, and checked by the tests:

- **The Estes C6 thrust curve.** The backyard test stand plots the motor's
  published certification curve live as it burns: a 14.1 N spike at 0.19 s, a
  sustain near 4.4 N, burnout at 1.86 s, 8.8 N·s total. The synthesised roar
  follows the same curve.
- **The equations on the desk** — the thrust equation, specific impulse,
  characteristic velocity, the rocket equation, area ratio — are the real ones.
- **The nozzle** is a proper converging–diverging contour, and in the study
  scene the flow speeds up through the throat.
- **The heat-flux plot** on his screen peaks at the throat, which is where the
  Bartz correlation says it does.
- **The engine on his screen** is internally consistent: 4.4 kN at 262 s of
  sea-level specific impulse is a mass flow of 1.71 kg/s, which is what the
  readout says. The numbers are round, plausible values for a small pressure-fed
  methane–oxygen engine of about a thousand pounds of thrust — an illustration,
  not a design.

Approximated or invented:

- The satellite, the clean room and the CAD bracket are generic.
- The hot fire after the credits is invented, and so is its data: the
  "measured" chamber pressure is the predicted curve with a delay, a 1.5 %
  shortfall and some ripple. The test suite holds it to the "within 1.5 %" the
  screen claims, which is the only sense in which it is true.
- The motorcycle's engine note is a distorted sawtooth, not a recording.
- The temple is a generic white temple with a spire and a gold figure at the
  top, not any particular one.
- The UK lockdown detail — children's rainbows taped in windows — is real;
  which street, which house and which door are not.

**The post-credits scene is a guess.** It is labelled as one, and it is mine:
an engine built on his own land, on a stand his brother welded, firing on a
test that matches the model; his brother on that stage; his kids under the
same stars. It's what I think happens to someone who has already done
everything else in this film.

## Developing

No build step. Serve the directory and open it:

```sh
python3 -m http.server      # from the repo root, then /peraspera/
node peraspera/test/film.test.mjs
```

The test runs headless and checks the timeline (no gaps, dissolves shorter
than the scenes they join), every caption (inside its scene, clear of its
fades, on screen long enough to read at fifteen characters a second, no two
overlapping), the score (every note on a real instrument, in range, inside
the film; the theme in D major and its summer version in D minor; no silent
twenty-second stretch), and the numbers above.

Two tools drive a headless Chromium through Playwright:

```sh
node peraspera/tools/frames.mjs out/ sky@12 gym bedroom@28   # PNG frames
node peraspera/tools/frames.mjs sheet.png england doors      # a contact sheet
node peraspera/tools/audio-check.mjs                         # render the score offline, report levels per scene
node peraspera/tools/audio-check.mjs --spectrogram sky:26:20 spec.png
```

`tools/poses.html` draws the figure rig's poses side by side, for tuning.

The fonts — Cormorant Garamond and Jost — are vendored under
`vendor/fonts/` with their SIL Open Font License texts.
