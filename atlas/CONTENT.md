# Writing content for the Physics Atlas

This is the guide for writing lessons, equation dissections and boss battles.
It is complete enough to work from alone. Read it in full once, then read two
finished lessons as models:

- `content/math1220/C2-2.1.js` — a mathematics lesson (integration by parts)
- `content/phys2210/M5.3.js` — a physics lesson with diagram visuals
- `content/gr/S09.i.js` — a Road to Einstein lesson (Intuition Mode)
- `content/gr/EQ.1.js` — an equation dissection
- `content/prog/P0.1.js` — a programming lesson with coding exercises

**Never open anything under `atlas/vendor/`** (KaTeX, Pyodide, fonts). They
are downloaded libraries, some of them megabytes on one line.

## The loop

```sh
# 1. write content/<course>/<MODULE>.<n>.js  (the id must already be in content/<course>/index.js)
node atlas/tools/register.mjs                           # 2. list it in content/loads.js
node atlas/test/content.test.mjs math1220.C2-2.3        # 3. validate one lesson (or a whole course: math1220)
node atlas/tools/shots.mjs /tmp/x lesson:math1220.C2-2.3 dark   # 4. screenshot every step, then LOOK at them
```

`node atlas/test/all.mjs` runs every test file at once (do that before you
report). The content test runs every generator over 25 seeds and checks, for every
variant: the structure, that every answer key passes the grader and every
distractor fails it, that all TeX renders in KaTeX, that no backslash was
eaten by a JavaScript string, and that every visual names a simulation that
exists with parameters it accepts. A lesson is not done until it passes **and**
its screenshots look right. Several bugs in this repository were only ever
visible in a screenshot.

The lesson ids and titles are fixed in `content/<course>/index.js`. A lesson
`math1220.C2-2.3` is the third lesson of module `C2-2` and lives in
`content/math1220/C2-2.3.js`. Do not edit the index files or any shared code
(`src/`, other courses, other people's lessons); if a title or prerequisite
looks wrong, say so in your report instead.

## What a lesson is

Every lesson follows the same arc, and the player enforces it:

1. **Introduction** — 2 to 5 sentences: what the idea is, the one equation
   that carries it, and why a physicist cares. Then `symbols`: **every symbol
   in the main equation explained**, with units. The learner learns visually
   and wants every symbol explained — never leave one undefined.
2. **Explore** — an interactive visual (`visual`), with a `lead` that says
   what to look at and 2–3 `tasks` ("Double the mass: the slope halves").
3. **Worked example** — revealed one step at a time. Each step has a short
   `label` and says *why*, not just what. End with a sense check where one
   exists (units, limits, size).
4. **Practice** — 4 to 8 problems, shown one at a time, with hints, retries,
   a one-sentence micro-teaching line, an explanation and (optionally) a full
   solution. A miss queues a fresh variant of the same problem.
5. **Checkpoint** — 2 to 4 unassisted problems (no hints, one try). At least
   one should be a **transfer** problem in a new context (`transfer: true`).
6. **Summary** — automatic.

Two lighter kinds exist: `kind: 'concept'` (a short conceptual lesson; the
worked example is optional, 3+ practice) and `kind: 'dissection'` (an equation
taken apart symbol by symbol; see below).

### Lesson fields

```js
import { lesson, mcq, multi, num, expr, order, match } from '../../src/core/content.js';
import { nice, sig, fmt, frac, polyTeX } from '../../src/core/format.js';   // only what you use
const t = String.raw;    // write every string that contains TeX as t`…`

export default lesson({
  id: 'math1220.C2-2.3',           // must match the file name and the index entry
  title: 'Trigonometric integrals: sines and cosines',   // as in the index
  minutes: 8,                      // honest time for a first pass
  difficulty: 2,                   // 1 easy … 4 hard
  intro: t`…`,                     // markup (below); may contain a $$display$$ equation
  equation: t`…`,                  // optional: the one equation, shown large (bare TeX, no $)
  symbols: [{ tex: '\\omega', text: 'angular frequency, in rad/s' }],   // tex is bare TeX
  why: t`…`,                       // one sentence: why this matters later (shown with a target icon)
  visual: { type: 'graph', title: '…', lead: t`…`, tasks: ['…', '…'], params: { … }, caption: t`…` },
  example: { prompt: t`…`, visual: { … } /* optional */, steps: [{ label: 'Choose', text: t`…` }, …], answer: t`…` },
  practice: [ … ],                 // 4–8 items
  checkpoint: [ … ],               // 2–4 items
  sources: [{ label: 'OpenStax University Physics Vol. 1, §6.1', url: 'https://openstax.org/…' }],
  // Road to Einstein lessons only:
  mode: 'intuition',               // or 'derivation' — must match the file (.i / .d)
  badges: ['est-obs'],             // the step's honesty badges, as in content/gr/index.js
});
```

Prerequisites live in the course index (`content/<course>/index.js`): the
catalog, the skill map and the "builds on" note all read them from there. Do
not put `prereqs` in a lesson file — it would be ignored.

### Markup

All prose fields use a small Markdown: paragraphs (blank line), `**bold**`,
`*italic*`, `` `code` ``, fenced code blocks (```` ```python ```` … ```` ``` ````,
on lines of their own), `- ` lists, `> ` callouts, `[links](https://…)`,
inline math `$…$` and display math `$$…$$`. Nothing inside code is read as
math or emphasis. Inside `` t`…` `` a backtick must be typed `` \` `` —
the markup reads `` \` `` as a plain backtick, so `` t`Use \`x**2\`.` `` works.

Inside math, a comma is punctuation to TeX: `$6,371$` renders "6, 371".
Write thousands as `$6{,}371$` or with a thin space, `$6\,371$`.

**Write every string that contains a backslash as `` t`…` `` (String.raw).**
In an ordinary string `'\frac'` silently becomes a form feed plus `rac`; the
test catches this ("escape damage"), but it is easier not to make the mistake.
Inside `` t`…` `` you can still interpolate: `` t`$\frac{${a}}{${b}}$` ``.
`$${x}$` is a dollar sign followed by an interpolation — it works.

`symbols[].tex`, `equation` and dissection `parts[].tex` are **bare TeX**
(no dollar signs). `symbols[].text` is markup.

## Problems (items)

Every item, of every type, has:

| field | |
|---|---|
| `id` | unique within the lesson, short and stable (`'x-exp-kx'`) |
| `difficulty` | 1–4; difficulty 3+ needs **two or more hints** (a hint ladder) |
| `prompt` | markup — the question |
| `hints` | 1+ strings, each **stronger** than the last; the last nearly gives the method away |
| `teach` | **one sentence** of micro-teaching shown after the first try: the idea this problem tests |
| `explain` | why the answer is right — shown when the problem ends |
| `solution` | optional fuller worked solution (collapsed) |
| `visual` | optional simulation spec drawn above the problem (see Visuals) |
| `transfer` | `true` for a problem in a new context (checkpoints need at least one) |
| `kind` | `'error'` for find-the-error problems (shown as "Find the error") |

Hints never cost XP and never lower a score; the mastery model only takes them
as weaker evidence. Write hints to *help*: "Pick $u$ to be the factor that gets
simpler when differentiated", not "Think about it."

### Multiple choice — `mcq`

Exactly **four** choices, all distinct, `answer` is the index of the right
one (the player shuffles the order). Give every distractor a `why` that
diagnoses the misconception it represents — that text is what a learner who
picked it sees.

```js
mcq({ id: 'which-method', difficulty: 2,
  prompt: 'Which integral is best done by integration by parts?',
  choices: [t`$\int x\cos x\,dx$`, t`$\int 2x\cos(x^2)\,dx$`, t`$\int \cos^2 x\,dx$`, t`$\int \frac{dx}{1+x^2}$`],
  answer: 0,
  why: { 1: t`The $2x$ is the derivative of the inside function — that is a substitution.`, 2: '…', 3: '…' },
  hints: ['…'], teach: '…', explain: '…' })
```

Distractors must be **plausible wrong answers** — the result of a real slip
(sign error, missing factor of 2, the classic misconception), never filler.
Set `fixedOrder: true` only when the order is meaningful ("all of the above"
style is banned anyway).

### Several correct — `multi`

`choices` (4+), `answer: [0, 2]`, optional `why` per wrong choice.

### Number — `num`

```js
num({ id: 'f-over-m', difficulty: 1,
  gen(r) {
    const m = r.int(2, 9), a = r.int(2, 8), F = m * a;
    return {
      prompt: t`What is the acceleration of a ${m} kg object under a net force of ${F} N?`,
      answer: a, units: 'm/s^2', tol: { rel: 1e-3 },
      errors: [{ value: F * m, feedback: 'You multiplied force by mass. Solve F = ma for a.' }],
      hints: ['…'], teach: '…', explain: t`$a = F/m = ${a}\ \text{m/s}^2$.`,
    };
  } })
```

- `answer` is a number **in `units`** (an SI or common unit string: `'m/s^2'`,
  `'kN'`, `'J/(kg K)'`, `'eV'`, `'ly'`, `'arcsec'`, `'N^-1'`, `'yr'`, `'Msun'`…).
  The unit is printed beside the box; a learner may also type any compatible
  unit (`4 km` for an answer in m) and it is converted. `unitMode: 'typed'`
  makes typing a unit compulsory. Omit `units` for pure numbers.
- `tol: { rel, abs }` — default is 1% relative. Match the precision you ask
  for: "to 3 significant figures" → `rel: 0.005`.
- `errors: [{ value, feedback }]` — the numbers a specific slip produces, with
  feedback naming the slip. In a generator, a slip's value can coincide with
  the answer for some parameters (sin and cos at 45°, a factor of 2 when the
  answer is 0) — the test fails then; leave such an error out for those
  variants or choose parameters that keep them apart. The grader also detects sign errors, powers of ten,
  factors of 2 and degree/radian mix-ups by itself.
- `sigfigs: 3` adds a gentle note when the learner gives a different number.

### Expression — `expr`

```js
expr({ id: 'x-sin-kx', difficulty: 2,
  gen(r) {
    const k = r.int(2, 4);
    return {
      prompt: t`Find $\displaystyle\int x\sin(${k}x)\,dx$.`,
      answer: `-x cos(${k}x)/${k} + sin(${k}x)/${k * k}`,     // Atlas syntax, below
      answerTeX: t`-\frac{x\cos(${k}x)}{${k}} + \frac{\sin(${k}x)}{${k * k}}`,  // how to display it
      vars: { x: [-2, 2] },          // every variable, with a sampling range where the answer is defined
      mode: 'constant',              // 'exact' (default) | 'constant' (antiderivatives: any +C) | 'equation'
      errors: [{ answer: `x cos(${k}x)/${k} - sin(${k}x)/${k * k}`, feedback: '…' }],
      hints: ['…'], teach: '…', explain: '…',
    };
  } })
```

Answers are checked by evaluating both expressions at random points, so any
equivalent form is accepted. **Choose `vars` ranges where the answer is
defined** (positive for `ln x`, away from poles). `mode: 'equation'` compares
equations up to a nonzero multiple (`y = 2x + 1` ≡ `2y - 4x = 2`).
Other fields: `forbid: ['sqrt']` (the answer must not use a function),
`lhs: 'v(t)'` (shown before the box), `keys: [['ω', 'omega']]` (extra keypad
buttons).

**Atlas expression syntax** (what learners type, and what you write in
`answer`): `+ - * / ^`, brackets, implicit multiplication (`2x`, `x(x+1)`,
`mgh` = m·g·h when m, g, h are declared), functions with or without brackets
(`sin x`, `sin^2 x`, `sin^-1 x`), `sqrt cbrt abs exp ln log log2 log10
sin cos tan sec csc cot asin acos atan sinh cosh tanh gamma erf min max`
(and `arcsin` etc.), constants `pi`, `e` (unless declared as a variable),
Greek names (`omega`, `theta`, `Delta`…) or the Unicode letters, and
subscripted names declared as such (`v_0`, `r_s`, `k_B`, `omega_0` — declare
them in `vars` with the underscore). **`log` is base 10; `ln` is natural.**
`a/bc` means (a/b)·c, as on a calculator. A name ending in a digit after
letters (`x2`) is rejected as ambiguous unless declared (`v0`).

### Ordering — `order`

`items` listed **in the correct order** (3+); the player shuffles them.
Good for the steps of a derivation or an experimental procedure.

### Matching — `match`

`left` (2+), `right` (at least as many), `answer: [rightIndexForLeft0, …]`.
Optional `diagram`: an inline SVG string shown above the rows.

### Slider and point (answer *in* the picture)

Write these as plain objects. `instruction` replaces the line under the
picture ("Drag the point to …").

```js
{ type: 'slider', id: 'set-angle', difficulty: 2, prompt: '…',
  visual: { type: 'projectile', params: { … } },     // any sim with a slider
  param: 'angle',                                      // the slider key the answer is read from
  answer: [44, 46],                                    // accepted range
  instruction: 'Set the launch angle for the longest range, then check.', hints: […], teach: '…', explain: '…' }

{ type: 'point', id: 'centroid', difficulty: 3, prompt: '…',
  visual: { type: 'graph', params: { x: [0, 3], y: [0, 2], curves: […],
    drag: [{ key: 'p', x: 0.5, y: 0.5, snap: 0.05 }] } },   // the first drag point is the answer
  answer: { x: 1.2, y: 0.6 }, tol: { x: 0.1, y: 0.1 },
  instruction: 'Drag the point to the centre of mass.', hints: […], teach: '…', explain: '…' }
```

The drag point's coordinates are available to the graph's other expressions
as `px` and `py` (for `key: 'p'`), so a readout can show them.

### Coding exercise — `code`

Python, checked by running it — in the browser's Python worker for the
learner, and in Node (Pyodide, the same build) by `test/code.test.mjs`, which
requires the reference solution to pass every test and the starter not to.

```js
code({ id: 'ke-function', difficulty: 2,
  prompt: t`Write a function \`kinetic_energy(m, v)\` that **returns** $\tfrac12 m v^2$.`,
  starter: t`def kinetic_energy(m, v):
    pass
`,
  answer: t`def kinetic_energy(m, v):
    return 0.5 * m * v**2`,                      // the reference solution
  tests: [                                        // Python expressions, evaluated after the program runs
    { name: 'kinetic_energy(2, 3) is 9 J', code: 'abs(kinetic_energy(2, 3) - 9) < 1e-12' },
    { name: 'the program prints the result', code: '"300000" in _stdout' },   // _stdout = everything printed
  ],
  hints: ['…', '…'], teach: '…', explain: '…' })
```

The program runs in a fresh namespace; each test is a Python expression
evaluated in it, and passes if truthy. Test names are what a learner sees next
to ✓ or ✗, so make them say what is being checked. Compare floats with a
tolerance. Programs may import `numpy`, `scipy`, `matplotlib`, `sympy`,
`mpmath` (loaded on demand — the first NumPy import costs a few seconds).
Write code with `` t`…` `` so `\n` inside Python strings survives. Run
`node atlas/test/code.test.mjs <lesson-id>` after `content.test.mjs`.

### Generators

A generator `gen(r)` returns the fields that vary, and **computes the numbers
and the answer key together**, so a printed number and its key can never
disagree. Never type a computed answer by hand. `r` is a seeded RNG:

| | |
|---|---|
| `r.int(lo, hi)` | integer in [lo, hi], inclusive |
| `r.intExcept(lo, hi, [0])` | integer in [lo, hi] other than those listed |
| `r.float(lo, hi, step)` | float in [lo, hi), rounded to `step` (e.g. 0.1) |
| `r.pick(array)` | one element |
| `r.sign()`, `r.bool(p)` | ±1; true with probability p |
| `r.shuffle(array)`, `r.perm(n)` | a shuffled copy; a permutation of 0…n−1 |

Pick parameters so every variant is clean and sensible: avoid answers of 0,
degenerate cases, and huge or ugly numbers unless the lesson is about them.
For multiple-choice generators, make sure the four choices stay **distinct**
for every seed (the test checks 25). Fixed (non-generated) items are fine for
conceptual questions.

`src/core/format.js` has formatting helpers: `nice(x)` (a short readable
number), `sig(x, n)` (n significant figures, as text), `fmt(x)`, `tex(x)`
(a number as TeX, with ×10ⁿ), `frac(x)` (a rational number as a reduced TeX
fraction: 0.75 → `\frac{3}{4}`), `polyTeX([a0, a1, a2])` (a polynomial),
`term(c, 'x', first)` (a signed term for building expressions), `deg`, `rad`.

## Visuals

A visual is `{ type, params, caption, … }`, where `type` names a simulation in
`src/viz/sims/<type>.js`. The lesson's `visual` is the big interactive one; an
item's `visual` is drawn small above the problem (no "Try this" tasks).
**Give at least 80% of problems a meaningful visual** — the graph of the
function being integrated or differentiated, the force diagram, the region
being revolved, the partial sums, the spacetime diagram, the circuit, the
field lines — and every lesson an Explore visual. This learner learns
visually, and the brief sets 80% as the bar. Only problems with genuinely
nothing to draw (a definition, a reading of an error message) go without.
The test prints each lesson's share and lists lessons below 60%; a static
`graph` with one curve and a few points is often all a problem needs.

The library (read the header comment of a sim's file for its full options):

| type | what it draws | key params |
|---|---|---|
| `graph` | functions, parametric/polar curves, series partial sums, shaded areas, Riemann sums, a draggable tangent/secant, points, arrows, h/v lines, readouts — all from expressions of `x` and slider keys | `x`, `y` (ranges), `aspect` (`'wide'`, `'square'`), `equal`, `xlabel`, `ylabel` (`''` hides), `xticks`, `yticks`, `grid`, `axes` (false hides), `sliders`, `choices`, `constants`, `curves: [{ fn \| param+t \| polar+theta \| sum+k, color, width, dash, domain, label, labelAt, labelDx, labelDy, when }]`, `shade: [{ fn, lower, from, to, color, alpha }]`, `riemann`, `tangent: { fn, at, secant }`, `points: [{ x, y, label, color, when }]`, `arrows: [{ from: [x, y], to: [x, y], label }]`, `vlines: [{ x, label }]`, `hlines: [{ y, label }]`, `drag`, `readouts: [{ label, expr, unit, digits }]`. Positions, ranges and `when` may be expressions; `x0` is the tangent point; readouts may also use `slope`, `secant`, `riemann`, `integral` |
| `surface3d` | a rotatable surface z = f(x, y) or parametric (u, v) ↦ (x, y, z); tangent plane and gradient; level curves; curves on the surface | `z` or `surface`, `domain`, `sliders`, `tangentAt: ['px','py']`, `levels`, `curves: [{ param: [x, y, z], t: [a, b] }]`, `colorBy`, `zscale`, `target: [x, y, z]` (what the camera looks at), `yaw`, `pitch`, `dist`, `readouts` |
| `field2d` | a vector field (P, Q) with arrows, tracer particles, a draggable probe (divergence, curl), optional potential contours and a loop for Green's theorem | `P`, `Q`, `x`, `y`, `sliders`, `potential`, `loop: { r }` |
| `phase` | a phase portrait of x′ = f, y′ = g (click to add trajectories; equilibrium type from a matrix), or `slope: true` for a slope field of y′ = f(t, y) with Euler vs RK4 | `fx`, `fy`, `matrix`, `seeds` / `slope`, `f`, `start`, `h` |
| `diagram` | static force diagrams: a block with labelled force arrows, a block on an incline | `kind: 'block' \| 'incline'`, `mass`, `forces: [{ dir (deg), label, size (0–1) }]`, `angle` |
| `force-cart` | a cart pushed by a force with friction; v–t graph | `F`, `m`, `mu` |
| `projectile` | projectile motion with optional quadratic drag | `v0`, `angle`, `h0`, `g`, `drag`, `k` |
| `oscillator` | spring or pendulum; damping, driving, energy bars; exact vs small-angle pendulum | `kind: 'spring' \| 'pendulum'`, `m`, `k`, `b`, `F0`, `wd`, `x0`, `L`, `theta0` |
| `wave` | travelling, superposed and standing waves on a string | `mode: 'travel' \| 'super' \| 'standing'`, `A`, `lambda`, `f`, `n` |
| `spacetime` | a Minkowski diagram with a boosted frame, draggable events, light cone, simultaneity lines, invariant hyperbolae | `beta`, `events`, `range` |
| `worldlines` | proper time along two worldlines between the same events (twin paradox) | `T`, `tx`, `tt` |
| `orbit` | Newtonian vs Schwarzschild orbits, effective potential, ISCO, plunge | `mode`, `r0`, `L`, `turns`, `compare` |
| `ibp-area` | integration by parts as two areas | `pair: 'xcos' \| 'ln'` |
| `code-runner` | an editable, runnable Python snippet with its output and figures (atlas.plot or Matplotlib) — the Explore step of a programming lesson | `code`, `rows` |

Sliders take `{ key, label, min, max, step, value, unit, explain, logScale }`;
`label` and `explain` are markup, `unit` is TeX. Every slider needs an
`explain` — one line saying what the parameter means physically.

**Captions must say what is simplified or not to scale.** "Arrows show
direction only." "Drag is quadratic with a fixed coefficient; real drag
varies with speed." That honesty is the house style.

**A problem's picture must not show its answer.** A readout of the very
quantity asked for, or the point marked where the learner is asked to find
it, gives the game away — show the setting, not the result (many sims take
options to hide readouts or labels; read their headers). The answer can
appear in the explanation's picture instead, by showing it after the attempt.

Expressions in `graph`, `surface3d`, `field2d` and `phase` use the Atlas
syntax above; the test parses all of them, so a typo fails the test rather
than drawing nothing.

### A new simulation

When no existing sim can show the idea, write one: `src/viz/sims/<name>.js`
(pick a specific name; check it does not exist). It exports

```js
export const defaults = { … };                 // default params
export function mount(F, P) { … }              // F = the frame, P = defaults + spec.params
export function validate(P) { return []; }     // optional, Node-safe: list of problems
```

The frame `F` gives you: `F.canvas({ aspect: 'wide' | 'square' | '', label })`
→ `{ canvas, box, overlay }` (HiDPI handled by `Plot`); `F.slider({ … })`,
`F.choice({ key, label, options: [[value, text], …], value })`,
`F.toggle({ key, label, value })`, `F.button({ label, onClick })` — values in
`F.params[key]`; `F.onChange(fn)`; `F.draw(fn)` (your redraw, called on
resize and theme change); `F.readout([[label, texValue], …])`;
`F.caption(text)`; `F.animate((dt, t) => …, { force })` (pauses off-screen
and under reduced motion); `F.onDestroy(fn)`. Return
`{ get: (key) => … }` if an item reads a value from it.

Draw with `Plot` from `src/viz/plot.js` (2D, world coordinates, theme colours:
`'accent' 'accent2' 'gold' 'good' 'warn' 'bad' 'violet' 'teal' 'ink' 'ink2'
'ink3' 'ink4'`) or `View3D` from `src/viz/three-d.js`. Read those two files'
method lists before writing. Put any real physics in a DOM-free module under
`src/viz/model/` and test it headlessly — `src/viz/model/gravity.js` and
`test/models.test.mjs` are the pattern. A sim must work in both themes, at
phone width, with keyboard (sliders are native inputs), and must not animate
under reduced motion unless the learner presses Play.

## Honesty rules (non-negotiable)

- Say what is **observed**, what is **derived**, what is **mathematically
  allowed but unobserved**, what is **speculative**, and what is a **teaching
  model**. Road to Einstein lessons carry badges: `est-obs` (established,
  observed), `est-der` (established, derived), `math` (mathematically allowed),
  `spec` (speculative), `open` (open question), `refuted` (a refuted claim),
  `model` (teaching model). Dissection parts can carry their own badge.
- **Never present hypothetical warp drives or traversable wormholes as
  demonstrated or achievable technologies.** They are solutions on paper that
  need negative energy densities nobody knows how to produce in bulk.
- **Never use the rubber-sheet analogy as though it were the actual
  description of curved spacetime.** If you use it at all, label it a teaching
  model and say where it fails (it uses gravity to explain gravity; it shows
  only space, while most of everyday gravity is the curvature of *time*).
- Simulations say what they simplify. Approximations are named
  ("small-angle", "no air resistance", "weak field").
- Numbers are real and sourced where they are measurements (CODATA, PDG,
  Planck 2018, IAU). Use `sources` for the textbook or paper.
- Never claim mastery from completion; never shame a wrong answer.

## Conventions

- SI units unless the field's convention differs (eV in atomic physics, natural
  units in GR — always say "with $c = 1$" when you use them).
- GR: **Carroll's conventions, signature (−, +, +, +)**; Greek indices run
  0–3, Latin 1–3; the Einstein summation convention is introduced in
  `gr.S03.d` — before that, write sums out.
- Vectors bold or with arrows, consistently within a lesson: `\vec F`.
- `ln` is the natural log everywhere.
- Spell in British/US consistently within a lesson; the Atlas leans British
  ("metre", "centre") in prose. Use real typographic punctuation: ’ “ ” — –.
- Second person, present tense, plain words. Short sentences. No filler
  ("It is important to note that…"). Bold the one phrase per paragraph that
  matters.

## Who the learner is

The default learner has completed Calculus I and an introductory Python
course, is taking Calculus II and calculus-based Physics I, has engineering and
aerospace experience, and is drawn to general relativity, black holes,
gravitational waves, astrophysics, propulsion and theoretical physics. They
learn visually and want every symbol explained. So:

- **transfer problems** are a chance to use rockets, nozzles, orbits,
  satellites, re-entry, GPS, pulsars, black holes, LIGO;
- never assume a symbol is known — define it at first use, in words;
- show the picture before the algebra when you can.

## Equation dissections (`kind: 'dissection'`)

The equation is written with each part marked `\part{n}{…}`, numbered in
the order the parts are listed. The player shows the equation large; tapping a
symbol (or stepping through) highlights it and shows its card.

```js
export default lesson({
  id: 'gr.EQ.1', kind: 'dissection', title: 'Einstein’s field equations with Λ',
  equation: t`\part{1}{R_{\mu\nu}} - \part{2}{\tfrac12 R\,g_{\mu\nu}} + \part{3}{\Lambda g_{\mu\nu}} = \part{4}{\frac{8\pi G}{c^4}}\,\part{5}{T_{\mu\nu}}`,
  intro: t`…`,
  parts: [
    { tex: t`R_{\mu\nu}`, name: 'the Ricci tensor', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`…what it is and what it means physically…`, more: t`…optional deeper note…` },
    …
  ],
  readAloud: t`The whole equation, said in one plain sentence.`,
  practice: [ … ],     // 3+
  checkpoint: [ … ],   // 2+
});
```

Every part needs a name and an explanation of what it *means*, not only what
it *is*. Use `$$…$$` of the equation in practice prompts and ask about its
parts; `\underbrace{…}_{\text{?}}` in a prompt is a good way to point at one.

## Boss battles (`content/<course>/boss.js`)

A boss is a short story in rounds of unassisted problems that mix the course's
skills — the kind of multi-step problem the course exists to make solvable.

```js
import { boss, mcq, num, expr } from '../../src/core/content.js';
const t = String.raw;
export default boss({
  title: 'The Infinite Series Challenge',
  intro: t`…the setting, in two or three sentences…`,
  pass: 0.7,
  rounds: [
    { title: 'Converge or diverge', story: t`…`, items: [
      num({ id: 'r1-sum', skill: 'math1220.C2-4.3', difficulty: 3, … }),   // skill: the lesson it draws on
      … ] },
    …                                                                        // 3+ rounds, 8–12 items in all
  ],
});
```

Every item **must** name the lesson whose skill it measures (`skill`), so the
result moves the right mastery estimate. Boss items follow all the item rules
(hints are still required — they appear in later review, not in the battle).

## Before you call a lesson done

- [ ] `node atlas/test/content.test.mjs <lesson-id>` passes (and
      `node atlas/test/code.test.mjs <lesson-id>` if it has coding exercises).
- [ ] Screenshots of every step (`tools/shots.mjs … lesson:<id> dark`) look
      right: no clipped equations, no overlapping labels, nothing empty.
      Check one in `light` too.
- [ ] Every symbol in the main equation is in `symbols`.
- [ ] Practice ramps from recognition to calculation to a twist; every
      distractor is a real misconception with its own `why`.
- [ ] At least one transfer problem in the checkpoint.
- [ ] The physics is right. Recompute anything you assert. Units on every
      physical number.
- [ ] Captions and text say what is approximate.
