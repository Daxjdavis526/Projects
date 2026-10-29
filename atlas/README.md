# The Physics Atlas

An interactive academy for the mathematics and physics of a physics degree —
from algebra to Einstein's field equations — built around Utah State
University's B.S. in Physics (Professional Emphasis) and extended with a
graduate-level route to general relativity. Every lesson has an interactive
visual, a worked example revealed step by step, practice problems with hints
and instant feedback, and an unassisted checkpoint; spaced review, mastery
estimates, XP, achievements and boss battles sit on top.

Live: https://daxjdavis526.github.io/Projects/atlas/

Static files, no build step, no server, no account. Progress lives in your
browser (IndexedDB) and can be exported and imported from Settings.

## What is in it

- **30 courses and 1,243 lessons — all built — with about 12,000 practice
  and checkpoint problems (98% with a picture), 30 boss battles and 160
  simulations** (the gallery shows 168 configurations of them). Two courses
  share lessons rather than copy them: Linear Algebra and Differential
  Equations is built from the two courses it combines, and Intermediate Modern
  Physics takes its relativity from the Road to Einstein, so the courses list
  1,341 lesson places in all. Six tracks: Mathematics (M0
  foundations, Calculus I–III, linear algebra, differential equations),
  Physics (PHYS 2210 → 4710, optics), Experimental Physics (labs, research),
  Scientific Computing, the Mathematics of Spacetime (seven advanced tracks:
  tensors, PDEs, differential geometry, complex analysis, Fourier methods,
  numerics, proof and analysis) and **The Road to Einstein's Field Equations**
  — 37 steps, each in an Intuition and a Derivation mode, plus fourteen
  equation dissections.
- **Coverage is honest.** The Coverage page lists every planned lesson, its
  source, and whether it is built. Unbuilt lessons appear greyed out with a
  "planned" chip; nothing pretends to exist. See the count on that page.
- **Provenance on every course**: required by the degree, an entry
  requirement, reconstructed (USU's catalog rows for that block could not be
  read, so the placement is inferred), a real USU course this degree does not
  require, or supplementary. Each has an evidence grade from the research in
  `reports/Physics Atlas curriculum and design.md`.
- **Honesty badges on the Road to Einstein**: Established · observed,
  Established · derived, Mathematically allowed, Speculative, Open question,
  Refuted claim, Teaching model. Wormholes and warp drives are taught as what
  they are — solutions on paper with impossible requirements — and the
  rubber-sheet picture is labelled a teaching model where it appears at all.

## Using it

- **Home** recommends the next lesson whose prerequisites you have, shows due
  reviews, the daily challenge and your weekly goal.
- **Library → course → lesson.** A lesson: Introduction (every symbol
  explained) → Explore (the simulation, with things to try) → Worked example
  (one step at a time) → Practice (one problem at a time; hints, retries, the
  solution after an attempt, and a fresh variant of anything you miss) →
  Checkpoint (no hints, one try) → Summary. "I know this — test me" skips
  straight to the checkpoint.
- **Answers**: multiple choice (keys 1–4 pick), numbers with units (type
  `4.2 km/s` or just the number; any compatible unit is converted, a wrong
  dimension is named), expressions (`x^2 sin x`, `e^(-t/2)`, `sqrt(2gh)`;
  a live preview shows exactly how your input was read; `log` is base 10,
  `ln` natural), ordering, matching, and answers set directly on a graph.
- **Review** schedules every skill with FSRS-6 (retention target in
  Settings). **Daily challenge**, **boss battles** (one per course), a
  **placement diagnostic**, a **skill map** of the prerequisite graph, and
  **Progress** (levels, achievements, a study heatmap, and how well your
  confidence matches your accuracy).
- **Simulations**: every interactive model, outside any lesson.
- **Code lab**: real Python 3.14 (CPython compiled to WebAssembly by
  Pyodide) in a worker, with NumPy, SciPy, Matplotlib, SymPy and mpmath —
  each loaded the first time a program imports it — and a Stop button that
  really stops runaway code.
- **Settings**: dark (default), light or system theme; reduced motion;
  retention target; an optional weekly study goal (streaks are opt-in and
  forgiving); export, import and reset.

## How mastery works — and what it does not claim

Mastery has five states: Not started → Learning → Developing → Proficient →
Mastered. They are moved only by evidence, never by finishing a lesson:

- an Elo-style estimate of the chance you answer a typical problem on the
  skill correctly, updated by every response — first-try, unaided answers
  count fully; answers after hints or retries count less; viewing the
  solution counts as a miss;
- gates on top of the estimate: Proficient needs at least six responses,
  three unaided successes across two problem templates and a passed
  checkpoint; Mastered also needs a success after a delay, a success in a new
  context, and successes on three different days.

The Atlas shows the checklist behind every state. The thresholds are
heuristics, not a calibrated psychometric model, and the interface says so.
XP rewards effort (attempts, reviews, checkpoints) and is never reduced by
hints; asking for help is never punished.

## Architecture

```
atlas/
  index.html            the shell: KaTeX, the app module, the theme before first paint
  css/atlas.css         one stylesheet, dark and light tokens
  src/core/             DOM-free engine — expression parser, units, answer checker,
                        FSRS-6, mastery, progress replay, planning, content model
  src/ui/               app shell, router, pages, the lesson player and question types
  src/viz/              plotting (Plot), a small software 3D renderer (View3D),
                        DOM-free physics models (model/) and the simulations (sims/)
  src/lab/              the Python worker and its plotting bridge
  content/              course indexes (every planned lesson), lesson files, bosses,
                        achievements, the simulation gallery, loads.js (generated)
  test/                 headless Node tests
  tools/                register.mjs (lesson registry), shots.mjs (screenshots)
  vendor/               KaTeX 0.19.0, Pyodide 314.0.7 (+ NumPy, SciPy, Matplotlib, SymPy,
                        mpmath wheels), fonts — do not edit
```

- **Content is data.** A lesson is an ES module exporting `lesson({…})`.
  Problems are fixed objects or *generators* that compute their numbers and
  their answer key together from a seeded random stream, so a printed number
  and its key can never disagree, and every retry is a fresh variant.
- **Everything with logic runs in Node.** The engine and the physics models
  import no DOM, so the tests run headlessly.
- **Progress is an append-only event log** (visits, responses, checkpoints,
  bosses) replayed into state on load; export/import merges logs by event id.
- **Simulations** are plain modules (`mount(frame, params)`) configured by
  data: the generic ones (`graph`, `surface3d`, `field2d`, `phase`) take
  expressions and sliders, so a lesson can build a new interactive picture
  without new code.

Writing content: see [CONTENT.md](CONTENT.md).

## Tests

```sh
node atlas/test/all.mjs             # every test file below, one line each
node atlas/test/check.test.mjs      # expression parser, units, every grader
node atlas/test/engine.test.mjs     # FSRS-6, mastery, progress replay, planning
node atlas/test/models.test.mjs     # orbits, relativity and numerics behind the simulations
node atlas/test/content.test.mjs    # every lesson, every generator over 25 seeds, every visual
node atlas/test/code.test.mjs       # every coding exercise, run in real Python (Pyodide in Node)
node atlas/test/gr-*.test.mjs …     # the DOM-free models behind individual simulations
node atlas/tools/register.mjs --check
node atlas/tools/shots.mjs /tmp/shots pages      # screenshots (Playwright)
```

The content test checks, for every variant of every problem, that the answer
key passes the grader, every distractor fails it, all TeX renders, no
backslash was eaten by a JavaScript string, and every visual names a
simulation that exists with parameters it accepts.

## What is accurate, and what is approximated

- **Orbits around a black hole** integrate the exact Schwarzschild orbit
  equation (geometric units). The tests check the innermost stable circular
  orbit at 6M with E = √(8/9), the photon sphere at 3M with critical impact
  parameter 3√3 M, the weak-field perihelion advance 6πM/p, and the 1.75″
  deflection of starlight at the Sun's limb. Newtonian orbits close exactly.
  The pictures are drawn in Schwarzschild coordinates, which are only one
  way to label the spacetime.
- **Special relativity** (boosts, intervals, proper time, velocity addition,
  Doppler factors) is exact.
- **Mechanics simulations** integrate their equations with RK4; the
  pendulum is the exact nonlinear one, shown beside the small-angle
  approximation; projectile drag is quadratic with a fixed coefficient.
  Diagrams draw arrows proportional to the given sizes, not to scale in
  newtons, and say so.
- **Answer checking** of expressions is by evaluation at random points
  (as WeBWorK does), which accepts every equivalent form; it can in
  principle be fooled by an expression that agrees with the key at those
  points and nowhere else.
- **Python** is the real interpreter and the real libraries — Pyodide's own
  builds of NumPy 2.4, SciPy 1.18 and Matplotlib 3.10, vendored and checked
  against the SHA-256 hashes in Pyodide's lock file. Matplotlib draws off
  screen (Agg) and figures come back as images; it cannot animate or take
  mouse input in the lab.
- **Material data**: cryogenic properties (boiling points and latent heats
  of LN₂ and LOX, the contraction and specific heat of 304 stainless and
  6061 aluminium) were taken from standard references and checked where a
  source could be reached; the NIST cryogenics and WebBook pages could not
  be reached while building, so the fit coefficients in
  `content/phys2210/_thermal.js` reproduce the published values at 77 K
  and 293 K but have not been checked against NIST line by line.
- **USU's program**: the degree's structure is verified, but several catalog
  pages could not be read during research; those placements are marked
  "reconstructed" with their evidence grade, and the report explains each.
