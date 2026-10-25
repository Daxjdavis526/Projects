# WORLDLINE

*a short film about general relativity*

An animated teaching film, about twenty-one minutes long, that walks from
Newton's gravity to the open problems of 2026: special relativity from a light
clock, spacetime and the twins, the equivalence principle, gravitational time
dilation and GPS, curvature and geodesics, the metric and Einstein's field
equations, black holes, gravitational waves, cosmology, the experimental
evidence, the research frontiers, and how to study the subject. It is the
companion to the guide in this repository,
[`reports/Beginners guide to general relativity.md`](../reports/), and every
number it states comes from there.

Live: https://daxjdavis526.github.io/Projects/worldline/

There is no video file and no audio file. Every frame is drawn on a canvas as
it plays, the equations are typeset by KaTeX over it, and the score and every
sound are synthesised with WebAudio. Press **Begin**, turn the sound up, and
press **F** for full screen.

## Controls

| key | |
|---|---|
| Space / K | play, pause |
| ← / → | back / forward ten seconds |
| [ / ] | previous / next scene |
| M | sound on / off |
| F | full screen |

Drag the bar at the bottom to scrub; its ticks are the chapters.
`?t=SECONDS` or `?scene=ID&at=SECONDS` starts somewhere else; `?mute` starts
silent; `?q=0.5` renders at half resolution on a slow machine.

## Chapters

| chapter | scene | what it shows |
|---|---|---|
| — | `title` | a light cone and a worldline |
| Prologue | `newton` | Newton's law; the Moon; Mercury's orbit precessing; Vulcan |
| Special relativity | `lightclock`, `muons` | the two postulates; a light clock at rest and one at 0.6c; γ(v); muons on Mount Washington; length contraction |
| Spacetime | `train`, `cones` | lightning and a train; the spacetime diagram and a tilted "now"; the interval; light cones; proper time; the twins |
| Gravity | `elevator`, `clocks` | falling elevator, rocket, room on Earth; light bending in the rocket; clocks in a tower; GPS |
| Curvature | `geodesics` | walkers on a globe; balls falling together; an orbit as a helix; the thrown ball's proper time; the rubber sheet |
| Einstein's equations | `equations` | line elements; the hyperbola of equal proper time; a circle on a sphere; the field equations; Ricci and Weyl curvature as a ball of particles |
| Black holes | `blackhole` | collapse; the horizon; hovering clocks; light rays and the photon sphere; a precessing orbit; the accretion disk; Kerr; the EHT rings; the singularity |
| Gravitational waves | `waves` | plus and cross; an inspiral and its chirp, heard; LIGO; the scale of the measurement; GW170817; 390 candidates; LISA |
| The universe | `cosmos` | the scale factor; v ∝ d from any galaxy; redshift; the Friedmann equations; the expansion history; the energy budget; open tensions |
| Evidence | `evidence` | gravitational lensing; the record of tests |
| Frontiers | `frontiers` | the Planck length; quantum gravity; entanglement experiments; the Page curve; cosmic censorship; numerical relativity; what is science fiction |
| Your path | `path` | the coursework from Calculus II to research; questions for a professor |

## How it works

```
index.html        the page, the title screen, the transport bar, the equation layer
src/script.js     the film as data: scenes, every caption and every equation,
                  timed automatically from the length of each caption (pure)
src/film.js       the projector: canvas sizing, the clock, captions, the KaTeX
                  equation layer, controls
src/physics.js    every formula the pictures are computed from (pure)
src/data.js       every number the film says, with its source (pure)
src/timing.js     moments shared by pictures and sound: clock ticks, the chirp (pure)
src/kit.js        maths, easing, deterministic noise, colour (pure)
src/paint.js      drawing helpers: text, lines, glows, clocks, spacetime axes
src/scenes/*.js   one draw function per scene
src/music.js      the score as a list of events (pure)
src/score.js      the WebAudio synthesiser: live, or offline for the video
```

**Everything is a pure function of time.** Each scene's `draw(ctx, t)` paints
the frame for scene time `t` from nothing, so any moment can be drawn on its
own — which is how scrubbing works and how `tools/` renders frames.

**Captions drive the timing.** A scene lists its narration; `layout()` gives
each line at least one second per fifteen characters, and the scene animates
against the times its captions appear (`s.at[i]`). Rewording a line re-times
the pictures with it.

**The equations are real typesetting.** They are LaTeX strings in
`src/script.js`, rendered once by KaTeX into an HTML layer laid out in the
film's 1920 × 1080 frame and faded with the scenes.

**The sound follows the physics.** The two light clocks tick audibly, the moving
one γ = 1.25 times slower; the three clocks hovering near the black hole tick
at 100%, 82% and 30% of the distant rate; and the chirp is the same waveform
the gravitational-wave scene draws, played at its real 35–250 Hz sweep and
gently saturated so small speakers carry it. Under it, a soft pad in D major
and a rising bell figure at each chapter.

## What is computed, and what is drawn

Computed from the equations, and checked by `test/physics.test.mjs`:

- **The light clocks.** The moving clock's pulse runs a zigzag at exactly the
  speed of light on screen, so its tick period is γP; the half-tick triangle
  is the real one. The tick counters run 5 : 4.
- **Simultaneity.** The strikes, the light from them and the observers'
  receptions are placed by the Lorentz transformation; the passenger's line
  of "now" has slope v/c.
- **The twins.** Each twin's worldline is marked off in years of that twin's
  own clock (6 for the traveller, 10 at home), from `travellerAt`.
- **Muons.** Each muon decays at its own exponential lifetime (mean 2.2 μs); one
  lane runs clocks at the rest rate (about 5% arrive), the other at the
  measured 8.8× slower (about 72% arrive). The muon's own view contracts the
  mountain by the same 8.8, so both stories give the same count.
- **GPS.** +45.8, −7.2 and +38.6 μs/day and 10.22999999543 MHz are computed
  from Ashby's formulas; the orbit is drawn to scale with Earth.
- **The thrown ball.** The proper time each candidate path collects is the
  closed form (2/3)(v₀³/gc²)(k − k²/2), checked against a numerical integral;
  free fall wins.
- **Light around a black hole.** Rays are integrated from the photon orbit
  equation d²u/dφ² + u = (3/2) r_s u²; those aimed inside 3√3/2 r_s are
  captured; the weak-field limit reproduces 2r_s/b.
- **The precessing orbit.** A bound orbit between 6 and 12 r_s integrated from
  the Schwarzschild geodesic equation with its exact constants of motion; it
  advances 96° per loop, and it is not exaggerated.
- **The hovering clocks** run at √(1 − r_s/r).
- **The chirp.** The leading-order (quadrupole) inspiral for a 30-solar-mass
  chirp mass, which takes about 0.17 s from 35 Hz to merger.
- **Lensing.** The arcs and the Einstein ring are the source's outline mapped
  through the point-mass lens equation.
- **The expansion history.** a(t) for flat ΛCDM with the Planck 2018 contents,
  integrated from the Friedmann equation: 13.8 billion years to today, with
  the turn from slowing to speeding up at z ≈ 0.6.

Drawn, approximated or exaggerated — each labelled on screen:

- **Mercury's precession** is shown about 300,000 times too fast (GR's real
  excess over Newton is 0.10″ per orbit). Its ellipse and its Kepler motion
  are real.
- **Tiny effects are blown up**: the redshift in the rocket and the tower, the
  rate difference between the tower clocks, the light bending in the rocket,
  the tidal convergence of the falling balls, the deformations of the ball of
  particles, the stretching by a gravitational wave (about 10²⁰ times), and
  LIGO's arm changes (about 10²⁰ times).
- **The merger and ring-down** of the chirp are sketched — they need numerical
  relativity — and joined in phase to the computed inspiral. The neutron-star
  waveform in the GW170817 timeline is schematic.
- **The Kerr hole** is drawn at spin 0.9 of the maximum with its horizon and
  ergosphere from the Boyer–Lindquist formulas, scaled 2.2× so they can be
  seen.
- **The EHT rings and the microwave background are illustrations**, not the
  published images or data, and say so.
- **The accretion disk** is a cloud of points on Keplerian orbits, sped up; its
  brightness profile is invented.
- **The Page curve** is a sketch, and the "quantum foam" is an impression.
- **Orbit sizes** in the space-station and LISA pictures are not to scale.

`test/film.test.mjs` also checks that every number in the narration is
either a sourced fact in `src/data.js` or listed in the test with the reason
it needs no source (dates, definitions, chosen inputs, checked calculations).

## Developing

No build step. Serve the repository and open `/worldline/`:

```sh
python3 -m http.server          # from the repo root
node worldline/test/physics.test.mjs
node worldline/test/film.test.mjs
```

Two tools drive headless Chromium through Playwright:

```sh
node worldline/tools/frames.mjs out/ blackhole@46 waves      # PNG frames
node worldline/tools/frames.mjs sheet.png train cones@50     # a contact sheet
node worldline/tools/render.mjs worldline.mp4                # the whole film as MP4 (needs ffmpeg)
node worldline/tools/render.mjs --audio-only score.wav       # just the soundtrack
```

`render.mjs` renders the score offline in one-minute chunks with a warm-up and
a crossfade between them, captures the frames as page screenshots (so the
typeset equations are included) in three parallel browsers, and encodes with
libx264 and AAC.

Vendored under `vendor/`: the fonts Cormorant Garamond and Jost (SIL Open Font
License, texts included) and KaTeX 0.16.11 (MIT, licence included; only the
minified script, the stylesheet and the WOFF2 fonts).
