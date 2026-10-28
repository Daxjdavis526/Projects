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
  lab: true,                       // a lab lesson (virtual experiment): counts toward the Experimenter achievement
  // Road to Einstein lessons only:
  mode: 'intuition',               // or 'derivation' — must match the file (.i / .d)
  badges: ['est-obs'],             // the step's honesty badges, as in content/gr/index.js
});
```

Prerequisites live in the course index (`content/<course>/index.js`): the
catalog, the skill map and the "builds on" note all read them from there. Do
not put `prereqs` in a lesson file — it would be ignored.

### Markup

Every text field is markup — `prompt`, `hints`, `teach`, `explain`,
`solution`, `choices`, `why`, `errors[].feedback`, coding `tests[].name`,
`intro`, captions — except a worked-example step's short `label` (plain
text shown in capitals, so no TeX and no symbol labels: `g` would read "G"), and
the right-hand options of a matching problem (shown in a drop-down, which
cannot typeset: simple math is spelled in Unicode — `$x^2$` as x², `$\sqrt{x}$`
as √x, `$\vec F$` as F⃗ — and the test fails an option it cannot spell) and
labels that a simulation draws on its canvas (plain text; Unicode is fine).
A list must be its own paragraph: leave a blank line before it. Markup has no
tables; for a small one, use display math with `\begin{array}{c|c} … \hline … \end{array}`
(text cells in `\text{…}`).
Every line a learner reads is checked the same way, `teach` and `hints`
included: `$e^{rt}$`, not e^{rt}. Inside math, format numbers with `tex(x)`, not
`fmt(x)` — `fmt` gives computer notation (`1.2e-7`) for very large or small
numbers, which the test rejects. Keep a unit with its number inside the math:
`$4.7\,\mu\text{F}$` cannot break between μ and F at a line end.
Formatting helpers that return TeX (`tex(x)`, `frac(x)`, `polyTeX`, a
`×10ⁿ` number) must land inside `$…$` (`t\`about $${tex(x)}$ m\``); labels that
a simulation draws on its canvas — graph point, curve and arrow labels and
axis titles among them — are plain text, not TeX: give them plain numbers and
Unicode symbols (eᵣ, rₛ, gₜₜ, uʳ, η, θ, ², ⁻¹). The test rejects `$`, `\cmd`,
`x_y` and `x^y` in a `graph`'s labels; other sims' labels it cannot read. Unicode has subscript
digits and only some letters (ₐ ₑ ₒ ₓ ₕ ₖ ₗ ₘ ₙ ₚ ₛ ₜ), so write "v (drift)", not v_d.
Outside `$…$` nothing is TeX: `U_g`, `v^2` or `\,` in prose print exactly
as typed — put every symbol, subscript and thin space inside math, and the
whole phrase around it ("the ratio $E_n / E_{2n}$", not "the ratio E_n/E_2n").
The test flags TeX commands and subscripts it finds in prose — and that
includes Explore `lead`s, `tasks` and captions, which are markup too — and
computer notation (`1.97e7`) anywhere a reader sees it: write powers of ten
with `tex(x)` inside math.
Show the lesson's main equation once: either as `equation` (the large
display above the intro) or as a `$$…$$` line inside `intro`, not both.

All prose fields use a small Markdown: paragraphs (blank line), `**bold**`,
`*italic*`, `` `code` ``, fenced code blocks (```` ```python ```` … ```` ``` ````,
on lines of their own), `- ` lists, `> ` callouts, `[links](https://…)`,
inline math `$…$` and display math `$$…$$`. Nothing inside code is read as
math or emphasis. Inside `` t`…` `` a backtick must be typed `` \` `` —
the markup reads `` \` `` as a plain backtick, so `` t`Use \`x**2\`.` `` works.

Inside math, a comma is punctuation to TeX: `$6,371$` renders "6, 371".
Brace multi-letter subscripts and commands in them: `v_{\max}`, `T_{\text{eff}}`
(KaTeX rejects `v_\max`).
Write thousands as `$6{,}371$` or with a thin space, `$6\,371$` — and never
put `toLocaleString()` output inside math (its commas render as "42, 164").
Outside math, write thousands as plain text: "6 371 km" or "6,371 km".
Inline math does not wrap: on a 390 px phone a long `$…$` runs off the
screen. Break a long chain into several pieces at its `=` signs
(`$a = b$, $= c$`) or give it a display line (`$$…$$`). A display line
overflows too when it is wider than a phone: stack it with
`\begin{gathered}…\\…\end{gathered}` or an `aligned` block.
A number in math followed by its unit in prose (`$${v}$ km/s`) may wrap
between the two; keep them together with the unit inside the math,
`$${v}\ \text{km/s}$`, or a no-break space (`$${v}$\u00a0km/s`).
Inside math, a bare integer of five or more digits is grouped for you when it
is typeset (`42164` shows as 42 164; four digits stay whole, decimals and
exponents are left alone), so `String(n)` is fine there; in prose, group it
yourself. A generated number that falls into e-notation (`1.2e+5`) inside math
fails the test — format very big and small numbers with `\times 10^{5}`
(`nice()` can produce e-notation for values ≥ 10⁵ or < 10⁻³: use `tex()`). The test rejects the words NaN,
undefined, Infinity and null anywhere inside math, `\text{undefined}`
included: a slope that does not exist is "has no value" or "is not defined"
in prose, or $\pm\infty$ when it diverges.

A link to another lesson is `[the ratio test](#/lesson/math1220.C2-4.8)`; to a
gallery simulation, `[the resonance explorer](#/explore/resonance)`.

Canvas labels (graph labels, sim captions drawn on the canvas) are plain text,
not TeX: use Unicode (`θ̂`, `ẍ`, `v⃗`, `rₛ`, `x²`) — combining hats, dots and
arrows are drawn over their letter.

**Write every string that contains a backslash as `` t`…` `` (String.raw).**
A template literal *inside* a `` t`…` `` (`` t`${k ? `\times` : ''}` ``) is an
ordinary one again and eats its backslashes: tag it too (`` t`\times` ``). The
content test catches this in lessons; in a sim file only a screenshot will.
And `${` inside `` t`…` `` is always JavaScript, even in TeX: `$${\star}F$`
breaks the module ("Invalid or unexpected token") — write `$\star F$`.
In an ordinary string `'\frac'` silently becomes a form feed plus `rac`; the
test catches this ("escape damage"), but it is easier not to make the mistake.
Inside `` t`…` `` you can still interpolate: `` t`$\frac{${a}}{${b}}$` ``.
`$${x}$` is a dollar sign followed by an interpolation — it works. But
`\${x}` is *not* an interpolation (the backslash escapes it): to put a TeX
command held in a variable after a backslash, put the backslash in the value
(`const fn = '\\cos'; t`$${fn}x$``) or write `${'\\'}${name}`.

`symbols[].tex`, `equation` and dissection `parts[].tex` are **bare TeX**
(no dollar signs). `symbols[].text` is markup.

## Problems (items)

Every item, of every type, has:

| field | |
|---|---|
| `id` | unique within the lesson, short and stable (`'x-exp-kx'`) |
| `difficulty` | 1–4; difficulty 3+ needs **two or more hints** (a hint ladder) — checkpoint items too: they come back in later reviews, where hints are offered |
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

The player letters the choices A–D, so do not label points in the
problem's picture A, B, C — use P, Q, R (or numbers) instead. It also
shuffles them, so an `explain` or `why` never says "the second choice": name
the choice by what it says.

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
  `'kN'`, `'J/(kg K)'`, `'eV'`, `'ly'`, `'arcsec'`, `'mas'`, `'uas'`, `'N^-1'`, `'yr'`, `'Msun'`…;
  the full table is `UNITS` in `src/core/units.js`; a space multiplies, as in
  `'N m'`). Temperatures may be in
  `'K'` or `'°C'`: a learner may type either, and a bare temperature is
  converted with the 273.15 offset. A temperature *change* is the same number
  in K and °C: mark such an item `difference: true` so no offset is applied.
  A sound level takes `'dB'` (read as a plain number: "85 dB" is 85). Radio flux
  densities take `'Jy'` (10⁻²⁶ W m⁻² Hz⁻¹, with prefixes: mJy, μJy); cross-sections `'b'` (barns: mb, fb).
  The unit is printed beside the box; a learner may also type any compatible
  unit (`4 km` for an answer in m) and it is converted. `unitMode: 'typed'`
  makes typing a unit compulsory. Omit `units` for pure numbers. Angles take
  `'deg'` or `'rad'`, rotation rates `'rpm'`. (A slider's `unit` is TeX, so it
  may be words: `'\\mathrm{thousand\\ km}'`.)
- A generator may `throw` to guard a numerical check while you write it, but
  every seed the test tries must succeed: a throw on any seed fails the item.
- `tol: { rel, abs }` — default is 1% relative. Match the precision you ask
  for: "to 3 significant figures" → `rel: 0.005`. The two add: giving only
  `abs` keeps the default 1% relative part, so an exact integer answer wants
  `tol: { rel: 0, abs: 0.5 }` (or `rel: 1e-9`). Unit symbols are SI's: `'g'` is
  grams (write `'m/s^2'` for an acceleration), `'Gyr'` a billion years.
- `errors: [{ value, feedback }]` — the numbers a specific slip produces, with
  feedback naming the slip. In a generator, a slip's value can coincide with
  the answer — or merely land inside its tolerance — for some parameters (sin
  and cos at 45°, a factor of 2 when the answer is 0, a correction smaller
  than 1%); the test fails then, on any of the seeds it tries. Drop such an
  error for those variants, e.g. `errors: [...].filter((e) => Math.abs(e.value
  - ans) > 0.03 * Math.abs(ans))`, or choose parameters that keep them apart. The grader also detects sign errors, powers of ten,
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
In `mode: 'constant'` with several variables the constant may depend on every
variable except the one integrated over (`wrt`, default the first in `vars`):
∫ 2xy dx = x²y + C(y). For a potential function, whose constant is one
number, set `wrt: '*'`.
Other fields: `form: 'expanded'` or `form: 'factored'` (once the value is right, the answer must be fully multiplied out — no bracketed sum multiplied, divided by, raised to a power or negated — or be a product at the top level; for "expand" and "factor" tasks, which would otherwise accept the question typed back; it cannot tell whether a factor is irreducible), `forbid: ['sqrt']` (the answer must not use a function),
`lhs: 'v(t)'` (TeX shown before the box — the `=` is added for you, so do not
write `'y ='`), `keys: [['ω', 'omega']]` (extra keypad buttons). A variable
with a Greek or decorated name, such as Δv, is declared in `vars` as `'Δv'` and
given a key, `keys: [['Δv', 'Δv']]`, so the learner can type it. `ħ` cannot be a variable name: declare `hbar` and give it a key labelled ħ, `keys: [['ħ', 'hbar']]`.

**Atlas expression syntax** (what learners type, and what you write in
`answer`): `+ - * / ^`, brackets, implicit multiplication (`2x`, `x(x+1)`,
`mgh` = m·g·h when m, g, h are declared), functions with or without brackets
(`sin x`, `sin^2 x`, `sin^-1 x`), `sqrt cbrt abs exp ln log log2 log10
sin cos tan sec csc cot asin acos atan sinh cosh tanh gamma erf min max
step round floor ceil atan2`, `besselj(n, x)` (Jₙ, integer n)
(and `arcsin` etc.), constants `pi`, `e` (unless declared as a variable),
Greek names (`omega`, `theta`, `Delta`…) or the Unicode letters, and
subscripted names declared as such (`v_0`, `r_s`, `k_B`, `omega_0` — declare
them in `vars` with the underscore). **`log` is base 10; `ln` is natural.**
`a/bc` means (a/b)·c, as on a calculator. A name ending in a digit after
letters (`x2`) is rejected as ambiguous unless declared (`v0`).

### Let the test check your calculus

Give a calculus problem the function it is about, and the content test
verifies the key by calculus — it has caught real slips:

- `expr({ …, integrand: 'x*e^(2x)' })` — the answer, differentiated
  numerically, must equal the integrand at sample points (any `+C` is fine);
- `expr({ …, derivativeOf: 'x^3*sin(x)' })` — the answer must equal the
  derivative of that function;
- `num({ …, integrand: 'x^2*e^(-x)', limits: [0, 'inf'] })` — the answer must
  equal the definite integral (computed by tanh–sinh quadrature, which copes
  with infinite limits and integrable endpoint singularities).

The functions use the item's `vars` (the first one is the variable of
differentiation or integration; set `wrt` to choose another). The player
ignores these fields.

A solution of a differential equation y′ = f(t, y) can be checked the same
way: give `integrand` as f with the answer substituted for y (for y′ = −ky
with answer `y0*e^(-k t)`, `integrand: '-k*y0*e^(-k t)'`), and the test checks
that the answer's derivative is that right-hand side.

The test's quadrature handles smooth integrands, kinks and jumps, but not an
oscillatory integrand over an infinite range (cos kx/(x² + a²)) or a very sharp
peak (a resonance with damping ratio below about 0.1): for those, leave out
`integrand` and check the key yourself with a script.

### Ordering — `order`

`items` listed **in the correct order** (3+); the player shuffles them.
Good for the steps of a derivation or an experimental procedure.
An `order` item takes a `visual` like any other. Keep each step short: on a
phone the steps sit in a narrow column beside the move buttons, so a long
display equation wraps badly — split a derivation into more, shorter steps.

### Matching — `match`

`left` (2+), `right` (at least as many), `answer: [rightIndexForLeft0, …]`.
Optional `diagram`: an inline SVG string shown above the rows. The `left`
entries are markup (TeX works); the `right` options appear in a drop-down,
which cannot show TeX — write them as plain text (Unicode is fine: x², √x,
π, θ, ∫).

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
as `px` and `py` (for `key: 'p'`), so a readout can show them — but a readout
that shows the answer gives it away, so think before adding one. A slider
item's `answer` range must contain values the slider can actually reach (its
`min`, `max` and `step` grid), or the problem cannot be solved. A point item
works with any sim whose `get('point')` returns `{ x, y }` (graph, field2d,
de-plane …), and both kinds may use `gen` like any other item.

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
evaluated in it, and passes if truthy. An expression, not a statement: no
`assert`, `=`, `for` or `import` (a SyntaxError fails every run) — use
`all(… for … in …)`, `abs(…) < tol`, `np.allclose(…)` (if the program imported
`np`), or a helper the reference program defines. Test names are what a learner sees next
to ✓ or ✗, so make them say what is being checked. Compare floats with a
tolerance. Programs may import `numpy`, `scipy`, `matplotlib`, `sympy`,
`mpmath` (loaded on demand — the first NumPy import costs a few seconds).
The versions are Pyodide's: Python 3.14, NumPy 2.4, SciPy 1.18, Matplotlib
3.10 — check an API exists there (the research notes quote newer releases).
A test should read the program's own `fig` and `ax`, not `plt.gcf()` (figures
are closed between exercises in the test, but be explicit). Since Python 3.12
the built-in `sum()` of floats is compensated (exact-ish), so a round-off
demonstration must accumulate in a loop. Timings in the browser vary from run to run: warm up once and report the best
of three before printing a speed-up. Write code with `` t`…` `` so `\n`
inside Python strings survives. Run
`node atlas/test/code.test.mjs <lesson-id>` after `content.test.mjs`.

The same test also runs every `code-runner` snippet (an Explore step, or one
anywhere else in the lesson) with the browser's helper modules, draws its
figures, and fails if it raises or prints anything on stderr — a NumPy
`RuntimeWarning` shows the learner red text before they have typed a thing.
It does not check what a snippet prints: if a lesson's prose quotes a number
the snippet prints, run the snippet and copy the number from its output.

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

Inside `t\`…\`` a `${…}` is always an interpolation; write `\${` only if you
want the characters `${` themselves (they will not be substituted).

Interpolating right after a `$`: `$${x}$` is math holding x, but a lone
`${x}` is only the interpolation. So a template reading `T = ${R3} = 0$`
opens no math and leaves a stray `$` at the end; write `T = $${R3} = 0$`
(the test catches the odd `$`).

If you edit lesson files with a script, keep the TeX raw there too: in an
ordinary Python string `\v`, `\t`, `\r`, `\f`, `\b` and `\n` become control
characters (`\vec` → vertical tab + "ec"). Use raw strings (`r'''…'''`); the
content test catches the damage.

When a generator builds an expression or TeX from pieces, bracket each
piece: with `HX = '1 + x'`, `${HX}^2` reads as `1 + x^2`, so write
`(${HX})^2`. The same goes for a negative number spliced after an operator.

A generator always returns an object — never `null` or `undefined` to mean
"try another seed"; pick parameters that cannot fail instead. It must vary
the prompt or the answer, not only the picture (the test checks that its
variants differ).

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
| `graph` | functions, parametric/polar curves, series partial sums, shaded areas, Riemann sums, a draggable tangent/secant, points, arrows, h/v lines, readouts — all from expressions of `x` and slider keys | `x`, `y` (ranges), `aspect` (`'wide'`, `'square'`), `equal`, `xlabel`, `ylabel` (`''` hides), `xticks`, `yticks` (about how many ticks; `0` hides them and their numbers), `xlog`, `ylog` (the coordinates are log₁₀ of the quantity and the axis is labelled 1, 10, 10², …), `grid`, `axes` (false hides), `sliders`, `choices`, `constants`, `curves: [{ fn \| param+t \| polar+theta \| sum+k, color, width, dash, domain, label, labelAt, labelDx, labelDy, when }]`, `shade: [{ fn, lower, from, to, color, alpha }]`, `riemann`, `tangent: { fn, at, secant }`, `points: [{ x, y, label, labelDx, labelDy, color, r, hollow, when }]` (`r: 0` for a label with no dot; `hollow: true` for an open circle — a hole in a graph), `arrows: [{ from: [x, y], to: [x, y], color, width, dash, label, labelDx, labelDy, labelAlign }]`, `vlines: [{ x, label, color, when }]`, `hlines: [{ y, label, color, when }]`, `drag`, `readouts: [{ label, expr, unit, digits, zero, when }]` (digits: significant figures, ≥ 1; values below `zero`, default 10⁻¹², print as 0 to hide round-off — set `zero: 0` for genuinely tiny quantities such as 10⁻³⁵ m), `legend: [{ label, color, dash, point }]` with `legendAt: 'tl' | 'tr' | 'bl' | 'br'` (plain-text labels, drawn in a box in that corner). Positions, ranges and `when` (on curves, points, shade, lines and arrows — drawn while nonzero; use `step(a - b)` for a ≥ b — `step` is 0 below its jump, 1 above and ½ at it; `min`/`max` clamp; to show one curve per value of a choice `n`, give each `when: 'step(0.5 - abs(k - n))'` with its own k) may be expressions; `axesAt: 'edge'` keeps the axes on the frame; point labels sit about 9 px right of and above the point (`labelDx`, `labelDy`, `labelAlign` move them — screen pixels, with `labelDy` positive *downward*); an arrow's label sits at its tip; `equal: true` keeps one unit the same length on both axes by widening one range, so labels near a nominal edge move; `x0` is the tangent point; readouts, point coordinates and `hlines`/`vlines` may also use `slope`, `secant`, `riemann`, `integral` (an average-value line: `hlines: [{ y: 'integral / (b - a)' }]`) A curve's label is anchored at its point at `labelAt` and drawn 6 px right and 12 px above it by default, so on a rising curve it often sits on the line: nudge with `labelDx`/`labelDy` (labelDy positive is *down*). Axis labels are plain text and cannot take `^` (put such a quantity in a readout, where TeX works). Labels sit on a middle baseline, so `labelAlign: 'center'` with `labelDx: 0, labelDy: 0` centres one on its point. Powers associate to the right: `10^x^2` is $10^{x^2}$; write `(10^x)^2` for the other. There is no `a ? b : c`: use `step`, `min` and `max`. A parametric or polar curve is drawn through 1000 points (`samples: 4000` on a curve for a sharp feature such as a narrow resonance). Slider, choice and constant keys must not be names the graph uses: `x`, `slope`, `secant`, `riemann`, `integral`, and `t` beside a parametric curve, `theta` beside a polar one, `k` beside a series, `x0` with a tangent. |
| `surface3d` | a rotatable surface z = f(x, y) or parametric (u, v) ↦ (x, y, z); tangent plane and gradient; level curves; curves on the surface | `z` or `surface`, `domain`, `sliders`, `tangentAt: ['px','py']`, `levels`, `curves: [{ param: [x, y, z], t: [a, b], when }]`, `colorBy`, `zscale` (scales every height — surface, parametric surface and curves alike; give curves their true z), `target: [x, y, z]` (what the camera looks at), `yaw`, `pitch`, `dist`, `readouts` It has no points or arrows (use `calc-vectors3d` for those), and draws a tangent plane only for a graph z = f(x, y). In every 3D sim, `yaw` turns the camera about the z-axis: change it when a vector points straight at the viewer. |
| `field2d` | a vector field (P, Q) with arrows, tracer particles, a draggable probe (divergence, curl), optional potential contours and a loop for Green's theorem | `P`, `Q`, `x`, `y`, `sliders`, `potential`, `loop: { r }`, `probe: [x, y]` (or `false`), `readout: false` (hides the numbers), `choices` Its divergence readout is the 2D divergence: right for fields in the plane (long cylinders, line charges), wrong for a slice through a 3D field (a dipole, a point charge) — hide it there. |
| `phase` | a phase portrait of x′ = f, y′ = g (click to add trajectories; equilibrium type from a matrix), or `slope: true` for a slope field of y′ = f(t, y) with Euler vs RK4 | `fx`, `fy`, `matrix`, `seeds` / `slope`, `f`, `start`, `h`, `hRange: [min, max]` (the Euler-step slider; default [0.05, 1]) |
| `diagram` | static force diagrams: a block with labelled force arrows, a block on an incline | `kind: 'block' \| 'incline'`, `mass`, `forces: [{ dir (deg), label, size (0–1) }]`, `angle` |
| `force-cart` | a cart pushed by a force with friction; v–t graph | `F`, `m`, `mu` |
| `mech-graphlink` | one motion, three linked graphs: a cart (or ball) with strobe trail and v, a arrows above x–t, v–t and a–t on one time axis; tangents and signed areas; Play; a `time` slider for "set the moment when…" slider items | read its header: motion as x(t), v(t), a(t) or constant-acceleration segments |
| `projectile` | projectile motion with optional quadratic drag | `v0`, `angle`, `h0`, `g`, `drag`, `k` |
| `oscillator` | spring or pendulum; damping, driving, energy bars; exact vs small-angle pendulum | `kind: 'spring' \| 'pendulum'`, `m`, `k`, `b`, `F0`, `wd`, `x0`, `L`, `theta0` |
| `wave` | travelling, superposed and standing waves on a string | `mode: 'travel' \| 'super' \| 'standing'`, `A`, `lambda`, `f`, `n` |
| `spacetime` | a Minkowski diagram with a boosted frame, draggable events, light cone, simultaneity lines, invariant hyperbolae | `beta`, `events: [[t, x], …]`, `names` (event labels; default A, B …), `range`, `signature` (`'+---'` default, reading Δt² − Δx²; `'-+++'` reads Δs² = −Δt² + Δx², the convention of PHYS 3710 and the GR lessons) |
| `worldlines` | proper time along two worldlines between the same events (twin paradox) | `T`, `tx`, `tt` |
| `orbit` | Newtonian vs Schwarzschild orbits, effective potential, ISCO, plunge | `mode`, `r0`, `L`, `turns`, `compare` |
| `ibp-area` | integration by parts as two areas | `pair: 'xcos' \| 'ln'` |
| `code-runner` | an editable, runnable Python snippet with its output and figures (atlas.plot or Matplotlib) — the Explore step of a programming lesson | `code`, `rows` (the editor shows at most 20 rows unless set) |

Simulations written for particular courses — reuse them anywhere they fit
(their header comments list every option):

| type | what it shows |
|---|---|
| `calc-polar` | polar and parametric curves, swept areas as thin wedges (½∫r²dθ), tangents, arc length, conics with focus and directrix, Kepler's equation with equal-time sectors A preset may carry its own sliders and window. |
| `calc-quadrature` | midpoint, trapezoid and Simpson approximations on a function or sampled data, with the error, the error bound and a log–log error panel Its `functions[].a` and `.b` are numbers, not expression strings. |
| `calc-series` | partial sums with error bands, sequences with an ε-band, ratio and root tests, cobwebs, integral-test rectangles (`readout: false` hides the numbers) |
| `calc-vectors3d` | (camera `yaw` and `pitch` in radians; in the default view a vector near (2, 1, 1) points at the viewer — turn the camera) a rotatable 3D scene: vectors with components, points, lines, planes and normals, parallelograms, curves, spheres — all driven by sliders (readouts below 10⁻¹² show as 0: work in units where the numbers are ordinary) |
| `c3-contour` | (x and y share one scale: give a window with the canvas's aspect, 16:10 by default or 2:1 when wide) a contour map of z = f(x, y) with labelled levels, a highlighted level on a slider, a probe, and the 3D surface sliced by the plane z = c Curve expressions cannot use the probe's `px`, `py`; only readouts can. |
| `c3-coords` | cylindrical or spherical coordinates as three surfaces meeting at a point, turning unit vectors, the volume-element box (`edgeLabels: false` hides its edge lengths); `radius: 's'` names the cylindrical radius $s$ as Griffiths does (default ρ) |
| `c3-curve` | a point riding a space curve: T, N, B frame, osculating circle, acceleration split into tangential and normal parts (gravity-turn preset) `vectors: 'bold'` writes its labels **T**, **N**, **B** instead of arrows. |
| `c3-boxes`, `c3-slicer`, `c3-jacobian` | boxes under a surface summing to a double integral; a region sliced in strips both ways (the two orders' limits); a change of variables stretching each cell by its Jacobian |
| `c3-lineint`, `c3-cells`, `c3-flux` | a bead riding a path through a vector field with F·dr adding up; a region cut into cells whose inner edges cancel (Green's theorem, the FTC); a 3D field through tiltable surfaces — the flux integrand, curl through butterfly nets, the divergence theorem `c3-flux`: `flip: true` reverses the normal *and* the drawn direction of the rim (Stokes's orientation follows the normal); its point and surface labels are plain text, not TeX (unlike `calc-vectors3d`) `arrows: false` hides the field arrows but not the normals: add `normals: false`. |
| `c3-roots` | a constant-coefficient second-order equation: its characteristic roots in the complex plane beside the motion they make; forced mode with the resonance curve |
| `la-vectors`, `la-rowreduce`, `la-map2d` | vectors in Rⁿ as stem plots beside the plane two of them span; exact-fraction elimination step by step (echelon, Gauss–Jordan, LU) with each row drawn as a line or plane; a 2×2 matrix as a map of the plane — draggable columns, composition in either order, the inverse, eigen-lines, a morph slider |
| `la-subspaces` | Strang's four subspaces as squares sized by dimension, with exact bases; slider entries change the rank; subspaces can be renamed (self-stresses, mechanisms) and a dimension hidden as “?” |
| `la-svd` | a 2×2 matrix acting on the unit circle as turn–stretch–turn with its singular vectors (rank-1 toggle); a computed picture beside its rank-k approximation with singular values on a log scale |
| `la-det` | two columns' parallelogram, coloured by the sign of the determinant with an orientation arrow; the ad − bc proof by pieces; Cramer's rule as a ratio of areas |
| `de-slopefield`, `de-stepper` | slope fields with isoclines, a phase line with labelled equilibria and solution curves added by clicking; Euler, improved Euler, midpoint and RK4 stage by stage, with a log–log panel of error against h |
| `de-plane`, `de-tracedet`, `de-modes` | phase planes of any 2D system (nullclines, typed equilibria, eigenvector lines, conserved-quantity contours and separatrices, launchable trajectories, e^{At} carrying a shape); the trace–determinant map beside the phase portrait; coupled masses and CO₂ with normal modes, beats and energy bars |
| `de-poles` | the poles of a transfer function H(s), draggable in the s-plane, beside the exact impulse or step response, each pole's term, and the gain |H(iω)| with the probe iω |
| `py-memory`, `py-sort` | Python's memory as names pointing at objects (frames, lists, dicts, NumPy views into a buffer), stepped line by line from authored steps; insertion sort, merge sort and binary search one comparison at a time |
| `mech-graphlink` | one motion as a moving body above linked x–t, v–t and a–t graphs |
| `mech-fbd` | free-body diagrams beside their situations: blocks, slopes, ropes, pulleys, Atwood machines, elevators |
| `mech-frames` | Newton's first law seen from the ground and from an accelerating train car |
| `mech-drag` | falling with quadratic drag: forces to scale, v–t approaching terminal speed |
| `mech-energy` | a potential-energy landscape with a draggable total-energy line, turning points and equilibria |
| `mech-collide` | 1D and 2D collisions with momentum and kinetic-energy charts, restitution, the centre of mass |
| `mech-rotor` | a rigid body about a fixed axis: moments of inertia, the parallel-axis theorem, torques with lever arms |
| `mech-kepler` | Kepler orbits with real data (ISS, GPS, the Moon, Mercury, Halley, S2) and Newton's cannon |
| `ten-basis` | a 2D vector or a covector (a stack of level lines) against a draggable basis: old-basis ghost, dual basis, components, the pairing as lines crossed; `get('point')` returns the arrow's tip; `rotate` and `dragBasis` cannot be combined |
| `ten-metric` | form mode: a (0,2) tensor fed draggable arrows (lowering an index as a stack of lines, the metric's unit circle or light-cone hyperbolae, raising, tensor products, signature); chart mode: Tissot ellipses on polar, sphere, half-plane, Minkowski and skewed charts with a measured segment |
| `gr-light-clock` | two light clocks, one moving: time dilation from the constancy of c |
| `gr-coordinates` | one flat plane under different coordinate labels: lengths agree, components do not |
| `gr-sphere-transport` | parallel transport around a loop on a sphere: the arrow returns rotated by area/R² |
| `gr-elevator` | Einstein's elevator in four situations, with the tides a small box cannot hide |
| `gr-timewarp` | a thrown clock's proper time: height speeds it, speed slows it, free fall ages most |
| `gr-lensing` | a ray-traced point-mass lens: drag a galaxy behind it, make an Einstein ring |
| `gr-dustball` | a freely falling ball of dust: tidal stretching and squeezing, the Ricci volume change |
| `gr-friedmann` | solutions a(t) of the Friedmann equation for matter plus Λ: the universe's possible fates |
| `gr-chirp` | a gravitational-wave chirp and what it does to a detector's arms |
| `mech-tank`, `mech-flow` | pressure in vessels of any shape, manometers, buoyancy; flow through a narrowing pipe, Bernoulli, a Pitot-static probe |
| `therm-gas` | a 3D hard-sphere gas: pressure from wall impacts against nRT/V, a live speed histogram against Maxwell–Boltzmann, mixtures |
| `therm-pv` | PV diagrams: processes with work as area, cycles (Carnot, Otto, Brayton) and refrigerators, energy flows, a T–S panel A `free` (free-expansion) leg must join two states at the same temperature. |
| `em-circuit` | (a compact picture — a worked example's — hides the currents unless `show: { I: true }`) nine fixed DC layouts (series, parallel, ladder, bridge, two-loop, RC, a firing circuit) solved by nodal analysis: moving charge, voltage colouring, bulb brightness, RC V(t) |
| `em-capacitor` | a parallel-plate capacitor with a sliding dielectric, battery connected or not: Q, V, C and stored energy |
| `lab-bench` | twenty-eight virtual experiments (pendulum, free fall, carts, friction, track, collisions, a spun disc, springs, calorimetry; field mapping, Ohm's law and resistivity, RC decay, a coil's field, induction, refraction and lenses, slits and gratings, string resonance…): noisy readings into a table, linearized data with error bars, a least-squares fit with uncertainties and χ²/dof, residuals, an injectable systematic error, a histogram of repeats |
| `wave-string` | waves on a string as moving beads: travelling pulses and harmonics, speed from tension and linear density, superposition, a driven string's standing waves and resonances |
| `wave-sound` | sound as air parcels: displacement against pressure, intensity, standing waves in open and closed pipes, audible beats |
| `wave-doppler` | wavefronts from a moving source and a moving observer: crowding ahead, stretching behind, the Mach cone past Mach 1 |
| `em-coulomb` | draggable point charges with every Coulomb force drawn to scale, action–reaction pairs, the net force (tip-to-tail and components) |
| `em-charging` | a charged ball near a neutral conductor or insulator: induction, polarization, grounding, and spheres sharing charge on contact |
| `em-field` | point charges, rods, line charges, sheets, charged balls and shells, a uniform field, a conducting sphere: field vectors and lines, labelled equipotentials, a probe for E and V, 3D Gaussian surfaces with their flux, charged particles launched through the field |
| `em-lorentz` | a charged particle circling, spiralling or drifting (E×B) in fields; a mass spectrometer and a velocity selector |
| `em-bfield` | field lines of wires, loops, solenoids and toroids; a draggable Amperian loop; forces between parallel currents |
| `em-faraday` | electromagnetic induction: a loop crossing a field, a magnet and a coil, a ramping field with its induced E, a bar on rails, a transformer — flux, emf and Lenz's law |
| `em-generator` | a 3D coil turning between magnet poles, as a generator (slip rings or commutator) or a motor |
| `em-ac` | a coil answering back, RL growth and decay, LC oscillation with its energy sloshing, phasors beside their waves, the series RLC circuit, resonance curves |
| `em-wave`, `em-gap`, `em-spectrum` | a 3D plane light wave (E ⟂ B ⟂ travel); Ampère's loop round a charging capacitor with two surfaces (displacement current); the electromagnetic spectrum on one log scale |
| `optics-rays` | rays traced exactly or paraxially: Snell's law, total internal reflection, Brewster's angle and Fresnel reflection, prisms with dispersion, fibres, a single refracting surface, thin lenses and mirrors with principal rays, telescopes and microscopes |
| `optics-waves` | interference and diffraction from sums of phasors: single and double slits, gratings, thin-film colours, a Michelson interferometer, Airy patterns and Rayleigh's limit, polarizers |
| `qm-photoelectric`, `qm-compton` | light on a metal (stopping voltage, Millikan's plot of K against f); a photon scattering off an electron (momentum triangle, Δλ against angle) |
| `qm-slits`, `qm-hydrogen` | electrons through slits arriving one at a time and building fringes; hydrogen's levels and series, the spectrum in true colour, Bohr orbits or probability clouds |
| `qm-binding`, `qm-decay` | binding energy per nucleon from Atomic Mass Evaluation masses (AME2016; for AME2020 values use `content/phys3710/_nuclear.js`) with the liquid-drop curve; a sample decaying nucleus by nucleus against the exponential law |
| `nuc-chain` | activities of every member of a decay chain from Bateman's solution: secular and transient equilibrium, the Mo-99 → Tc-99m generator, radon, the U-238 series (NUBASE2020 half-lives) | `chain` (`pair`, `moly`, `radon`, `radium`, `u238`), `ratio` (pair), `logy`, `time`, `peak`, `number`, `controls`, `readout`, `hide` — see the file header |
| `pde-player` | one initial profile evolved exactly by transport (with decay), variable-speed transport, the wave or the heat equation; the x–t plane with characteristics and a draggable probe showing its domain of dependence | `mode`, `modes`, `profile`, `A`, `w`, `x0`, `c`, `lambda`, `speed`, `init`, `D`, `t`, `tmax`, `x`, `xt`, `chars`, `sheet`, `probe`, `halves`, `flux`, `energy` — see the file header |
| `pde-walk` | seeded random walkers over the histogram of their positions against the heat-equation Gaussian of spread √(2Dt) | `N`, `dx`, `dt`, `p` (≠ ½ drifts), `steps`, `nmax`, `xr`, `seed`, `curve`, `controls`, `play`, `readout` |
| `pde2-membrane` | modes of a rectangular or circular membrane from above (nodal lines) or in 3D, a frequency ladder against whole multiples, two modes mixed into Chladni-like patterns | `shape`, `aspect`, `m`, `n`, `mix`, `view`, `toggle`, `nodal`, `ladder`, `count`, `harmonics`, `c`, `L`, `play`, `controls`, `readout`, `hide` |
| `pde2-fourier` | linked x-space and k-space panels: each equation's multiplier G(k) for heat, waves, Laplace in a half-plane and a dispersive Schrödinger-type equation | `eq`, `eqs`, `profile`, `w`, `D`, `c`, `beta`, `t`, `tmax`, `x`, `k`, `mult`, `labels`, `controls`, `play`, `readout`, `hide` |
| `pde3-burgers` | Burgers' equation solved exactly (Lax–Oleinik): u(x, t) with the folded three-valued profile and its shocks, and the x–t plane with characteristics stopping at shocks, the first crossing t*, shock paths and fans; bump, sine, square, step and N-wave profiles; optional conservative or non-conservative upwind dots | see the file header |
| `dg-frenet` | the fundamental theorem of curves: a space curve built from κ(s) and τ(s) by integrating the Frenet–Serret equations, a point riding it with its frame | `kappa`, `tau` (expressions of `s` and slider keys), `length`, `sliders`, `choices`, `constants`, `ghost`, `at`, `show`, `readouts`, `play`, `speed`, `fixed`, `yaw`, `pitch` |
| `cm-polar` | plane-polar kinematics: the rotating r̂ and θ̂ and the acceleration split into r̈, −rθ̇², rθ̈ and 2ṙθ̇, head to tail and as bars | `r`, `theta` (expressions of t), `T`, `at`, `presets`, `sliders`, `show`, `bars`, `values`, `scale`, `x`, `y`, `fixed`, `readouts`, `labels` |
| `cm-resonance` | a driven damped oscillator: amplitude (or A² with its Lorentzian and 2β width) against drive frequency, the phase lag, and drive and response in time | `w0`, `beta`, `w`, `f0`, `wmax`, `panels`, `y`, `lorentz`, `width`, `sliders`, `ranges`, `marks`, `readouts`, `cycles` |
| `cm-fourier` | a periodic force (pulse, square, sawtooth, triangle), its partial sums, its harmonics against an oscillator's gain curve, and the summed response | `wave`, `h`, `d`, `tau`, `w0`, `beta`, `N`, `panels`, `sliders`, `ranges`, `nmax`, `units`, `readouts`, `values`, `response` |
| `cx-map` | a complex function as a map: a z-plane grid (Cartesian or polar) beside its image, colour-by-value, Möbius maps with slider coefficients, branch cuts with a lap counter, the amplitwist disc and f′, Jacobian and Cauchy–Riemann readouts; `get('point')` answers point items | `f` (z2 z3 inv exp log sqrt pow mobius joukowski sin cos conj uv), `fns`, `a`–`d`, `p`, `u`, `v`, `layout`, `x`, `y`, `wx`, `wy`, `grid`, `view`, `curves`, `points` … — see the file header |
| `cx2-contour` | a contour integral as little arrows f·Δz, beside the same arrows laid head to tail from 0; a draggable contour, the integral (or ÷ 2πi), winding numbers and the ML bound; colour view, annuli, integrands as complex expressions | see the file header |
| `cx3-flow` | ideal flow past a cylinder or a Joukowski airfoil: streamlines carried over from the circle plane, the Kutta condition, stagnation points, released dot rows (no equal transit time), speed shading | see the file header |
| `cx3-causal` | draggable poles in the ω-plane beside the response in time (closing the contour by the sign of t), and Re/Im χ with its Kramers–Kronig reconstruction | see the file header |
| `th-einstein` | two Einstein solids exchanging quanta at random above the exact Ω_A·Ω_B bars, the 1/√N sharpening of the peak, or every microstate of a small solid in stars and bars | `mode` (pair, list), `NA`, `NB`, `q`, `N`, `start`, `scale`, `x`, `tie`, `qper`, `controls`, `ranges`, `cells`, `visits`, `panels`, `numbers`, `play`, `readouts`, `hide` — see the file header |
| `wv-chain` | N masses on springs (fixed, free or ring ends): start in a mode, pluck a mass or launch a pulse, motion as an exact sum of modes, beside the dispersion curve ω = 2√(k/m)|sin(qa/2)| with ω = vq and the cutoff | `N`, `bc`, `k`, `start`, `n`, `pluck`, `x0`, `width`, `view`, `panels`, `ghost`, `line`, `spectrum`, `labels`, `controls`, `maxN`, `play`, `time`, `readouts`, `hide` — see the file header |
| `wv2-junction` | a pulse meeting the junction of two strings, solved exactly: the strings, the energy density with flux arrows, and bars of energy on each side against r² and 4Z₁Z₂/(Z₁ + Z₂)² | see the file header |
| `em3-relax` | Laplace's equation in a box solved by relaxation (Jacobi, Gauss–Seidel, SOR), walls at set voltages and an optional electrode, a second guess converging alongside, a log convergence panel and a probe against the exact series | `n`, `aspect`, `walls`, `top`, `electrode`, `init`, `method`, `sweeps`, `compare`, `exact`, `probe`, `levels`, `labels`, `history`, `controls`, `play`, `readout`, `hide` |
| `em3-images` | a draggable charge beside a grounded plane or a grounded or neutral sphere: the image charge, equal-flux field lines, induced-charge shading, a σ panel, force and induced-charge readouts | `geometry`, `q`, `pos`, `R`, `ground`, `x`, `image`, `lines`, `equip`, `shade`, `force`, `panel`, `drag`, `controls`, `readout`, `hide` |
| `cm2-vary` | a true path, a family of varied paths, and the functional (length, bead travel time or action) against the variation — flat at the true path | `preset`, `n`, `alpha`, `T`, `sliders`, `modes`, `panels`, `ghosts`, `marks`, `readouts`, `labels` |
| `cm2-race` | beads racing downhill on a line, a circular arc, a cycloid, a steep curve and a drop; a tautochrone mode | `mode`, `x1`, `curves`, `p`, `sliders`, `a`, `times`, `play`, `at`, `slow`, `labels` |
| `cm2-noether` | a puck over potential contours beside its conserved quantities in time, with a slider that breaks a rotation, translation or time symmetry | `kind`, `kinds`, `eps`, `sliders`, `show`, `panels`, `play`, `labels`, `readout` |
| `cm3-orbit` | an orbit beside its effective-potential curve: a draggable energy line, turning points matched to dashed circles, Play at the true rate; inverse-square, power-law or Newton + GR forces; apsidal angle and advance per orbit | see the file header |
| `num-float` | the bits of a float64 or float32 coloured by field: flip a bit, step to the neighbouring floats, read the exact stored decimal and the gap; presets such as 0.1 and 2⁵³ + 1 mark the true value | see the file header |
| `qm4-sg` | an oven or a prepared state feeding up to three Stern–Gerlach analysers (z, x, y or a tilted n̂(θ)), each passing its + beam, its − beam, or both recombined unobserved; atoms one at a time or by thousands against \|⟨±n\|ψ⟩\|² | see the file header |
| `m0-unitcircle` | drag a point round the unit circle: cosine and sine as projections, radian ticks, quadrant signs and the reference angle; `unroll` beside the sine/cosine graph; `inverse` with the principal branch bold and other solutions hollow; `get('theta')` answers slider items | see the file header |
| `mp-blackbody` | Planck's law for any temperature, with the Rayleigh–Jeans and Wien curves and real sources (the CMB, the Sun, stars) |
| `mp-shells`, `mp-laser`, `mp-molecule` | atoms built electron by electron (orbital boxes, quantum numbers, the periodic table, real ionization energies); two-, three- and four-level lasers with inversion and threshold; a diatomic molecule's rotational ladders and spectra (CO lines, HCl's P and R branches) |
| `mp-junction` | a p–n junction's band diagram (true widths), moving carriers, the Fermi level splitting under bias, the I–V curve; Si, Ge, GaAs, GaAsP, InGaN; LED and solar-cell modes |
| `mp-schrodinger`, `mp-orbitals` | infinite, finite, harmonic and double wells (levels, ψ and |ψ|², forbidden regions, a sloshing superposition) and scattering off steps and barriers with exact transmission; hydrogen orbitals for n ≤ 5 — a cloud slice, the |Y_lm|² shape, P(r) with its markers, real or complex orbitals |
| `mp-collide` | collisions and decays on the energy–momentum diagram: four-momentum arrows, mass hyperbolas, √s and thresholds, any frame |
| `mp-rutherford`, `mp-franck-hertz`, `mp-packet` | alpha particles on exact Coulomb hyperbolas past a nucleus (against Thomson's atom) with angle and count-rate panels; a mercury or neon Franck–Hertz tube with its current dips; a packet built from plane waves under four dispersion laws, and the x–k trade-off |
| `gr-surface` | curvature measured from inside a surface (sphere, torus, cone, catenoid, cylinder): coordinate basis vectors and Christoffel symbols, geodesics with Clairaut's constant, holonomy of small loops |

In SymPy exercises, `sqrt(g.det())` for spherical coordinates comes out as
`r**2*Abs(sin(theta))`, and derivatives of `Abs` turn into `Piecewise`: give
learners a `sqrt_det` that drops the `Abs` (declare symbols `positive=True`)
before any Laplacian or divergence test.
In TeX `%` starts a comment and swallows the rest: write `\\%` (in a
plain string) or `\%` (in `t\`…\``) wherever a percent sign lands in math —
slider units and readouts included. Inside an environment with columns
(`matrix`, `array`), a row break is `\\` (two backslashes in `t\`…\``); the
test flags an environment with columns, no row break and a lone `\ `.
A slider's range is fixed when it is made: to explore a different range,
give a different visual (or a choice that switches scale).
Choices take `{ key, label, options: [[value, text], …], value, explain }`;
option text is markup like `label`, so `$T_H$` renders.
Sliders take `{ key, label, min, max, step, value, unit, explain, logScale }`;
`label` and `explain` are markup, `unit` is TeX. Every slider needs an
`explain` — one line saying what the parameter means physically.

A worked example's visual is drawn compact: a simulation's secondary panels
(graphs beside the picture) may be hidden there, so put a picture that needs
them in the Explore step or a problem. Symbols such as ⊗ and ⊙ (into and out
of the page) belong in math — `$\otimes$`, `$\odot$` — where KaTeX draws
them; as plain text they fall back to another font.

A visual's `caption` replaces the simulation's default caption — for good: a
sim that calls `F.caption` again as it draws cannot overwrite it.
**Captions must say what is simplified or not to scale.** "Arrows show
direction only." "Drag is quadratic with a fixed coefficient; real drag
varies with speed." That honesty is the house style.

A coding exercise counts as having its picture (its editor and output), as
does a problem whose prompt holds a code listing.

**A problem's picture must not show its answer.** A readout of the very
quantity asked for, or the point marked where the learner is asked to find
it, gives the game away — show the setting, not the result (many sims take
options to hide readouts or labels; read their headers). The answer can
appear in the explanation's picture instead, by showing it after the attempt.

Expressions in `graph`, `surface3d`, `field2d` and `phase` use the Atlas
syntax above; the test parses all of them, so a typo fails the test rather
than drawing nothing.

### A new simulation A Play/Pause control is `F.compact`, `F.animate` and `F.button` together (copy `wv-chain`).

Two `Plot`s on one canvas: `Plot.clear()` wipes the whole canvas, so call it on the first only (see `gr-timewarp`).

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
'ink3' 'ink4'` — `ink` is light on the dark theme and dark on the light one;
`'void'` is near-black in both, for a black hole) or `View3D` from `src/viz/three-d.js`. Read those two files'
method lists before writing. A draggable `plot.handle(get, set, { hollow: true })`
draws only its ring, so it does not hide what it marks; `plot.circle(…, { fill,
alpha, strokeAlpha })` gives the outline its own opacity. Put any real physics in a DOM-free module under
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
    …                                                                        // 3+ rounds, 9–12 items in all
  ],
});
```

The test prints only a boss's failures, so a clean run shows no boss lines.
Every item **must** name the lesson whose skill it measures (`skill`), so the
result moves the right mastery estimate. Boss items follow all the item rules
(hints are still required — they appear in later review, not in the battle);
any item type may use a generator, and the test checks both the first seeds
and the ones the boss page draws. The `intro`, round titles and `story` text
are markup and are checked like prose. Screenshot it with
`node atlas/tools/shots.mjs <dir> boss:<course> dark`, and look at a phone-width
view as well: canvas labels that fit at 1280 px can collide at 390 px.

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
