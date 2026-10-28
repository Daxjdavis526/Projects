// Boundary-value problems against initial-value problems: conditions at two
// ends instead of two at one point, and no uniqueness theorem — one solution,
// none or infinitely many. Shooting (adjust the starting slope until the far
// end is hit), the three cases for y″ + k²y = 0, a rod with heat generation and
// a tensioned cable (always unique), forcing that resonates with the interval,
// sinh when nothing oscillates, and Euler buckling as the transfer — the load
// at which "straight" stops being the only answer.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { co, sg, lead } from './_second.js';
import { fpic, n, lab } from './_laplace.js';

const t = String.raw;

/** Shots y = m·sin(kx) from y(0) = 0 for several slopes m (a static picture), optionally with a target. */
function shots(k, X, slopes, caption, target = null, ymax = 2.4) {
  return fpic(null, [0, X], [-ymax, ymax], caption, {
    xlabel: 'x', ylabel: 'y',
    curves: slopes.map((m, i) => ({ fn: `${m / k}*sin(${k}x)`, color: ['violet', 'teal', 'good', 'warn', 'accent2'][i % 5], width: 1.6, dash: true })),
    points: target ? [{ x: target[0], y: target[1], color: 'gold', r: 6, label: target[2] ?? 'target', labelDx: 10, labelDy: -10 }] : undefined,
  });
}

// the count-the-solutions cases for y″ + 4y = 0, y(0) = 0, y(L) = B
const LS = [[Math.PI / 2, t`\tfrac{\pi}{2}`], [Math.PI / 4, t`\tfrac{\pi}{4}`], [Math.PI, t`\pi`], [(3 * Math.PI) / 4, t`\tfrac{3\pi}{4}`], [Math.PI / 3, t`\tfrac{\pi}{3}`], [Math.PI / 6, t`\tfrac{\pi}{6}`]];

export default lesson({
  id: 'math2280.DE-8.1',
  title: 'Boundary-value problems versus initial-value problems',
  minutes: 12, difficulty: 2,
  intro: t`An **initial-value problem** fixes $y$ and $y'$ at one point, and the existence and uniqueness theorem then promises exactly one solution. A **boundary-value problem** fixes one condition at each end of an interval instead — a string held at both ends, a beam pinned at both ends, a rod with each end at a set temperature:

$$y'' + p(x)\,y' + q(x)\,y = g(x), \qquad y(a) = \alpha, \quad y(b) = \beta$$

Now nothing is promised. The general solution still has two constants, but they are fitted at two different points, and the two equations for them can have **one solution, none, or infinitely many**. For $y'' + y = 0$ with $y(0) = 0$: if $y(\pi/2) = 1$, the only solution is $\sin x$; if $y(\pi) = 1$, there is none, because every solution through the origin, $c\sin x$, returns to zero at $\pi$; and if $y(\pi) = 0$, every $c\sin x$ works.`,
  symbols: [
    { tex: t`x`, text: 'the independent variable — usually a position along a string, beam or rod, in m' },
    { tex: t`[a, b]`, text: 'the interval, with the conditions imposed at its two ends' },
    { tex: t`\alpha,\ \beta`, text: t`the boundary values: $y(a) = \alpha$, $y(b) = \beta$ (a deflection, a temperature)` },
    { tex: t`p,\ q`, text: t`the coefficients, functions of $x$; the equation is linear in $y$` },
    { tex: t`g(x)`, text: 'the forcing: a load, a heat source; homogeneous when g = 0' },
  ],
  why: t`Statics, steady heat flow and every standing wave are boundary-value problems — and their failures of uniqueness are not defects: they are where buckling loads, resonant frequencies and quantum energy levels come from.`,
  visual: {
    type: 'graph',
    title: 'Shooting at a target',
    lead: t`Solve $y'' + y = 0$ by **shooting**: start at $y(0) = 0$ with slope $m$ — an initial-value problem, solved by $y = m\sin x$ — and adjust $m$ until the curve hits the boundary value $y(L) = B$ (gold). Move the far end $L$ and the target $B$.`,
    tasks: [
      'With L = 2 and B = 1, slide m until the curve hits the target: exactly one slope does (m = 1/sin 2 ≈ 1.10).',
      'Set L = 3.14 ≈ π: every shot comes back to almost exactly 0 there. With B = 1 none can hit (no solution); with B = 0 all of them do (infinitely many).',
      'Set L = 3 and B = 1: the slope needed, B/sin L, is about 7 — near π the problem is hypersensitive to its data.',
    ],
    params: {
      x: [0, 6.3], y: [-3, 3], xlabel: 'x', ylabel: 'y',
      sliders: [
        { key: 'm', label: 'Starting slope $m = y\'(0)$', min: -3, max: 3, step: 0.01, value: 0.6, explain: 'The free choice when you shoot: an initial-value problem for every m.' },
        { key: 'L', label: 'Far end $L$', min: 0.5, max: 6, step: 0.01, value: 2, explain: 'Where the second boundary condition is imposed.' },
        { key: 'B', label: 'Boundary value $B = y(L)$', min: -2, max: 2, step: 0.05, value: 1, explain: 'The value the solution must reach at the far end.' },
      ],
      curves: [
        { fn: 'm*sin(x)', color: 'ink3', dash: true, width: 1.4 },
        { fn: 'm*sin(x)', color: 'accent', width: 2.8, domain: [0, 'L'] },
      ],
      vlines: [{ x: 'L', label: 'x = L', color: 'ink3' }],
      points: [{ x: 0, y: 0, color: 'accent', r: 4.5 }, { x: 'L', y: 'B', color: 'gold', r: 6, label: 'target', labelDx: 10, labelDy: -10 }],
      readouts: [
        { label: 'where the shot lands, $m\\sin L$', expr: 'm*sin(L)', digits: 3 },
        { label: 'the slope that hits, $B/\\sin L$', expr: 'B/sin(L)', digits: 3 },
      ],
    },
    caption: t`Every curve here solves $y'' + y = 0$ with $y(0) = 0$. Shooting turns a boundary-value problem into a sequence of initial-value problems; numerical solvers do the same, adjusting $m$ automatically.`,
  },
  example: {
    prompt: t`For which lengths $L$ and boundary values $B$ does $y'' + 4y = 0$, $y(0) = 0$, $y(L) = B$ have exactly one solution, none, or infinitely many?`,
    visual: shots(2, 3.3, [2, 1, -1.5], t`Three solutions through $y(0) = 0$, $y = c\sin 2x$: whatever their slope, they all return to zero at $x = \pi/2$ and $x = \pi$.`, null, 1.3),
    steps: [
      { label: 'General solution', text: t`Characteristic roots $\pm 2i$: $\;y = c_1\cos 2x + c_2\sin 2x$.` },
      { label: 'First boundary', text: t`$y(0) = c_1 = 0$, so $y = c_2\sin 2x$ — one constant left for one condition.` },
      { label: 'Second boundary', text: t`$y(L) = c_2\sin 2L = B$.` },
      { label: 'Three cases', text: t`If $\sin 2L \ne 0$: $c_2 = B/\sin 2L$, **exactly one** solution, for every $B$. If $\sin 2L = 0$ — that is $L = \pi/2, \pi, 3\pi/2, \ldots$ — the condition reads $0 = B$: **no solution** if $B \ne 0$, and **infinitely many** ($c_2$ free) if $B = 0$.` },
      { label: 'Compare the IVP', text: t`$y(0) = 0$, $y'(0) = m$ always gives exactly one solution, $\tfrac{m}{2}\sin 2x$. The boundary problem asks something different: not “where does this start go?” but “which start arrives at $B$?”` },
      { label: 'Sense check', text: t`The special lengths are the half-periods of $\sin 2x$, where the homogeneous problem ($B = 0$) has nonzero solutions. Those exceptional cases are the subject of the next lesson: eigenvalues.` },
    ],
    answer: t`Exactly one solution, $y = \dfrac{B}{\sin 2L}\sin 2x$, unless $L$ is a multiple of $\pi/2$; then none if $B \ne 0$ and infinitely many ($c\sin 2x$) if $B = 0$.`,
  },
  practice: [
    mcq({
      id: 'count', difficulty: 2,
      gen(r) {
        const [L, LT] = r.pick(LS), B = r.pick([0, 1, 3]);
        const s2 = Math.sin(2 * L), zero = Math.abs(s2) < 1e-9;
        const ans = !zero ? 0 : B === 0 ? 2 : 1;
        const WHY = {
          0: { 1: t`$\sin(2\cdot${LT}) = ${n(s2)} \ne 0$, so $c_2 = ${B}/${n(s2)}$ fits the far end.`, 2: t`Since $\sin 2L \ne 0$, only one value of $c_2$ satisfies $c_2\sin 2L = ${B}$.` },
          1: { 0: t`Solving $c_2\sin 2L = ${B}$ needs $\sin 2L \ne 0$, and here $\sin(2\cdot${LT}) = 0$.`, 2: t`$c_2\cdot 0 = ${B}$ holds for no $c_2$, let alone all of them.` },
          2: { 0: t`$\sin(2\cdot${LT}) = 0$, so $c_2\cdot 0 = 0$ holds for **every** $c_2$, not just one.`, 1: t`$c_2\cdot 0 = 0$ is true for every $c_2$: each $c_2\sin 2x$ is a solution.` },
        };
        const why = { ...WHY[ans], 3: 'A linear problem never has exactly two solutions: the difference of two solves the homogeneous problem, and so does every multiple of it.' };
        return {
          prompt: t`How many solutions does $y'' + 4y = 0$, $\;y(0) = 0$, $\;y(${LT}) = ${B}$ have?`,
          choices: ['Exactly one', 'None', 'Infinitely many', 'Exactly two'],
          answer: ans, why,
          hints: [t`Every solution with $y(0) = 0$ is $c\sin 2x$.`, t`Evaluate $\sin 2L$ at $L = ${LT}$: can $c\sin 2L$ equal ${B}?`],
          teach: t`Fit the general solution to both boundary conditions: the count depends on whether the homogeneous problem has a nonzero solution.`,
          explain: t`$y = c\sin 2x$ and $\sin(2\cdot${LT}) = ${n(s2)}$. ${!zero ? t`So $c = ${B}/${n(s2)}$: exactly one solution${B === 0 ? ', the zero function' : ''}.` : B === 0 ? t`So $c\cdot 0 = 0$ holds for every $c$: infinitely many solutions, $c\sin 2x$.` : t`So $c\cdot 0 = ${B}$ is impossible: no solution.`}`,
          visual: shots(2, 3.3, [2, 1, -1.5], t`Solutions of $y'' + 4y = 0$ with $y(0) = 0$: the family $c\sin 2x$, for three values of $c$.`, null, 1.3),
        };
      },
    }),
    expr({
      id: 'rod', difficulty: 2,
      gen(r) {
        const L = r.pick([1, 2]), T0 = r.pick([300, 350]), T1 = r.pick([300, 400, 450]), G = r.pick([100, 200, 400]);
        const ans = `${T0} + (${T1 - T0})*x/${L} + ${G / 2}*x*(${L} - x)`;
        return {
          prompt: t`A rod of length ${L} m generates heat uniformly inside, so its steady temperature obeys $T'' = -${G}$ (in K/m²). Its ends are held at $T(0) = ${T0}$ K and $T(${L}) = ${T1}$ K. Find $T(x)$.`,
          answer: ans, answerTeX: t`${T0}${T1 === T0 ? '' : sg((T1 - T0) / L, 'x')} + ${G / 2}\,x(${L} - x)`, lhs: 'T(x)',
          vars: { x: [0, L] },
          errors: [{ answer: `${T0} + (${T1 - T0})*x/${L}`, feedback: t`That is the rod with no heat generation, $T'' = 0$. The source adds a hump: integrate $T'' = -${G}$ twice.` }],
          hints: [t`Integrate twice: $T = -${G / 2}x^2 + c_1x + c_2$.`, t`$T(0) = ${T0}$ gives $c_2$; $T(${L}) = ${T1}$ gives $c_1$.`],
          teach: t`When the equation has no nonzero solution satisfying zero boundary values (here $T'' = 0$, $T(0) = T(L) = 0$ forces $T = 0$), the boundary-value problem has exactly one solution.`,
          explain: t`$T = ${T0}${T1 === T0 ? '' : sg((T1 - T0) / L, 'x')} + ${G / 2}\,x(${L} - x)$: the straight line between the end temperatures plus a parabola that vanishes at both ends. Its peak, ${fmt(T0 + (T1 - T0) / 2 + (G * L * L) / 8, 4)} K or so near the middle, is what a designer checks.`,
          visual: fpic(null, [0, L], [Math.min(T0, T1) - 40, Math.max(T0, T1) + (G * L * L) / 8 + 60], t`The two boundary conditions: the ends held at ${T0} K and ${T1} K. The rod between them is hotter than either.`, { xlabel: 'x (m)', ylabel: 'K', points: [{ x: 0, y: T0, color: 'gold', r: 6, label: `${T0} K`, labelDx: 10, labelDy: 12 }, { x: L, y: T1, color: 'gold', r: 6, label: `${T1} K`, labelDx: -56, labelDy: 12 }] }),
        };
      },
    }),
    expr({
      id: 'unique', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3), a = r.intExcept(-4, 4, [0]), b = r.intExcept(-4, 4, [0, a]);
        const LT = k === 1 ? t`\tfrac{\pi}{2}` : t`\tfrac{\pi}{${2 * k}}`;
        return {
          prompt: t`Solve $y'' + ${co(k * k)}y = 0$ with $y(0) = ${a}$ and $y(${LT}) = ${b}$.`,
          answer: `${a}*cos(${k}x) + (${b})*sin(${k}x)`, answerTeX: t`${lead(a, `\\cos ${co(k)}x`)}${sg(b, `\\sin ${co(k)}x`)}`, lhs: 'y(x)',
          vars: { x: [0, 2] },
          errors: [{ answer: `${b}*cos(${k}x) + (${a})*sin(${k}x)`, feedback: t`At $x = 0$ the sine vanishes, so $y(0)$ fixes the cosine’s coefficient; at $x = ${LT}$ the cosine vanishes, so $y(${LT})$ fixes the sine’s.` }],
          hints: [t`$y = c_1\cos ${co(k)}x + c_2\sin ${co(k)}x$.`, t`At $x = ${LT}$: $\cos(\pi/2) = 0$ and $\sin(\pi/2) = 1$.`],
          teach: t`Fit both constants of the general solution, one at each end.`,
          explain: t`$y(0) = c_1 = ${a}$ and $y(${LT}) = c_2 = ${b}$: $\;y = ${lead(a, `\\cos ${co(k)}x`)}${sg(b, `\\sin ${co(k)}x`)}$. Unique, because $\sin(${k}\cdot${LT}) = 1 \ne 0$.`,
          visual: fpic(null, [-0.1, Math.PI / (2 * k) + 0.4], [-5, 5], t`The two boundary conditions: $y(0) = ${a}$ and $y(${LT}) = ${b}$.`, { xlabel: 'x', ylabel: 'y', points: [{ x: 0, y: a, color: 'gold', r: 6, label: `y(0) = ${lab(a)}`, labelDx: 10, labelDy: -10 }, { x: Math.PI / (2 * k), y: b, color: 'gold', r: 6, label: `${lab(b)}`, labelDx: 10, labelDy: -10 }], vlines: [{ x: Math.PI / (2 * k), color: 'ink3' }] }),
        };
      },
    }),
    num({
      id: 'shoot', difficulty: 2,
      gen(r) {
        const L = r.pick([1, 1.5, 2, 2.5]), B = r.pick([0.5, 1, 1.5, -1]);
        const m = B / Math.sin(L);
        return {
          prompt: t`Shooting: $y'' + y = 0$, $y(0) = 0$, $y(${L}) = ${B}$. With what starting slope $y'(0) = m$ does the shot $y = m\sin x$ hit the target?`,
          answer: m, tol: { rel: 0.005 },
          errors: [{ value: B / L, feedback: t`That aims in a straight line. The shot curves: it is $m\sin x$, so solve $m\sin ${L} = ${B}$.` }, { value: B * Math.sin(L), feedback: t`Divide by $\sin ${L}$, do not multiply.` }],
          hints: [t`The shot lands at $y(${L}) = m\sin ${L}$.`],
          teach: 'Shooting fits the free starting slope so that the solution of the initial-value problem meets the far boundary condition.',
          explain: t`$m = \dfrac{${B}}{\sin ${L}} = \dfrac{${B}}{${fmt(Math.sin(L), 4)}} = ${fmt(m, 4)}$. It works because $\sin ${L} \ne 0$; at $L = \pi$ no slope would do.`,
          visual: shots(1, Math.max(3.2, L + 0.5), [0.5, 1.5, 2.5, -1], t`Four trial shots $m\sin x$ (dashed) and the target $(${L}, ${B})$.`, [L, B]),
        };
      },
    }),
    mcq({
      id: 'resonant-bc', difficulty: 3,
      prompt: t`How many solutions does $y'' + y = 1$, $\;y(0) = 0$, $\;y(\pi) = 0$ have?`,
      choices: ['None', 'Exactly one', 'Infinitely many', 'Exactly two'],
      answer: 0,
      why: {
        1: t`The general solution is $1 + c_1\cos x + c_2\sin x$; try to fit it — the two conditions contradict each other.`,
        2: t`That happens for the **homogeneous** problem $y'' + y = 0$ with these conditions. The forcing changes it.`,
        3: 'A linear problem never has exactly two solutions.',
      },
      hints: [t`General solution: $y = 1 + c_1\cos x + c_2\sin x$.`, t`$y(0) = 0$ forces $c_1 = -1$. Then what is $y(\pi)$, whatever $c_2$ is?`],
      teach: t`When the homogeneous problem has a nonzero solution, a forced boundary-value problem has either no solution or infinitely many — it depends on the forcing.`,
      explain: t`$y(0) = 1 + c_1 = 0$ gives $c_1 = -1$, so $y = 1 - \cos x + c_2\sin x$, and then $y(\pi) = 1 + 1 + 0 = 2$ for every $c_2$: never 0. This is the **Fredholm alternative**: because $\sin x$ solves the homogeneous problem, the forcing $g$ must satisfy $\int_0^\pi g\sin x\,dx = 0$ for any solution to exist — and $\int_0^\pi \sin x\,dx = 2 \ne 0$.`,
      visual: fpic(null, [0, 3.3], [-1.2, 3.2], t`Every solution with $y(0) = 0$: $1 - \cos x + c\sin x$ for four values of $c$. Look at where they all arrive at $x = \pi$.`, { xlabel: 'x', ylabel: 'y', curves: [-1.5, -0.5, 0.5, 1.5].map((c, i) => ({ fn: `1 - cos(x) + ${c}*sin(x)`, color: ['violet', 'teal', 'good', 'warn'][i], dash: true, width: 1.6 })), vlines: [{ x: Math.PI, label: 'x = π', color: 'gold' }] }),
    }),
    num({
      id: 'cable', difficulty: 2,
      gen(r) {
        const L = r.pick([6, 8, 10]), w = r.pick([15, 20, 30]), T = r.pick([2000, 3000, 5000]);
        const sag = (w * L * L) / (8 * T);
        return {
          prompt: t`A tensioned umbilical cable on a launch tower spans ${L} m between two supports at the same height. It weighs $w = ${w}$ N/m and is pulled with tension $T = ${T}$ N, so for small sag its height obeys $T\,y'' = w$ with $y(0) = y(${L}) = 0$. How far below the supports does its midpoint hang?`,
          answer: sag * 100, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: (sag * 100) * 2, feedback: t`Check the constant: $y = \frac{w}{2T}x(x - L)$, so at $x = L/2$ the sag is $\frac{w}{2T}\cdot\frac{L^2}{4} = \frac{wL^2}{8T}$.` }, { value: (w * L * L) / (2 * T) * 100, feedback: t`That is $\frac{w}{2T}L^2$, the parabola evaluated at the far end without the factor $(x - L)$. At the middle it is $\frac{wL^2}{8T}$.` }],
          hints: [t`Integrate twice: $y = \dfrac{w}{2T}x^2 + c_1x + c_2$, then fit both ends.`, t`$y = \dfrac{w}{2T}x(x - ${L})$; evaluate at the midpoint.`],
          teach: 'With y″ prescribed and both ends pinned, the boundary-value problem has exactly one solution: a parabola through the supports.',
          explain: t`$y = \dfrac{${w}}{2\times${T}}x(x - ${L})$, and at $x = ${L / 2}$ m the sag is $\dfrac{wL^2}{8T} = \dfrac{${w}\times${L * L}}{8\times${T}} = ${fmt(sag, 3)}$ m $= ${fmt(sag * 100, 3)}$ cm. A small-sag approximation: a hanging cable is really a catenary, a cosh curve, which this parabola matches when the sag is small.`,
          visual: fpic(null, [-0.5, L + 0.5], [-1.2, 0.5], t`The two boundary conditions: the cable is held at height 0 at $x = 0$ and $x = ${L}$ m. (Vertical scale exaggerated.)`, { xlabel: 'x (m)', ylabel: 'y (m)', points: [{ x: 0, y: 0, color: 'gold', r: 6, label: 'support', labelDx: 8, labelDy: -12 }, { x: L, y: 0, color: 'gold', r: 6, label: 'support', labelDx: -56, labelDy: -12 }] }),
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-sinh', difficulty: 2,
      gen(r) {
        const k = r.int(1, 3), B = r.intExcept(-4, 5, [0]);
        return {
          prompt: t`Solve $y'' - ${co(k * k)}y = 0$ with $y(0) = 0$ and $y(1) = ${B}$.`,
          answer: `${B}*sinh(${k}x)/sinh(${k})`, answerTeX: t`${B}\,\frac{\sinh ${co(k)}x}{\sinh ${k}}`, lhs: 'y(x)',
          vars: { x: [0, 1] },
          errors: [{ answer: `${B}*sin(${k}x)/sin(${k})`, feedback: t`With $-${co(k * k)}y$ the roots are real, $\pm ${k}$: the solutions are exponentials, or $\cosh$ and $\sinh$ — not sines.` }, { answer: `${B}*sinh(${k}x)`, feedback: t`Check the far end: $\sinh ${k} \ne 1$, so the coefficient is $${B}/\sinh ${k}$.` }],
          hints: [t`Roots $\pm ${k}$: write $y = c_1\cosh ${co(k)}x + c_2\sinh ${co(k)}x$.`, t`$y(0) = 0$ kills the $\cosh$; then $c_2\sinh ${k} = ${B}$.`],
          teach: t`When the solutions do not oscillate, they cannot return to zero, so the boundary-value problem has exactly one solution.`,
          explain: t`$y = ${B}\dfrac{\sinh ${co(k)}x}{\sinh ${k}}$, and it is unique: $\sinh$ vanishes only at 0, so no nonzero solution can satisfy $y(0) = y(1) = 0$.`,
          visual: fpic(null, [-0.1, 1.2], [Math.min(0, B) - 1, Math.max(0, B) + 1], t`The boundary conditions $y(0) = 0$ and $y(1) = ${B}$.`, { xlabel: 'x', ylabel: 'y', points: [{ x: 0, y: 0, color: 'gold', r: 6 }, { x: 1, y: B, color: 'gold', r: 6, label: `y(1) = ${lab(B)}`, labelDx: -70, labelDy: -12 }] }),
        };
      },
    }),
    num({
      id: 'cp-buckling', difficulty: 3, transfer: true,
      gen(r) {
        const I = r.pick([1.2, 2, 3.5]), L = r.pick([1.5, 2, 2.5]), E = 70;
        const P = (Math.PI ** 2 * E * 1e9 * I * 1e-7) / (L * L) / 1000;
        return {
          prompt: t`A pin-ended aluminium strut in an interstage ($E = ${E}$ GPa, $I = ${I}\times10^{-7}$ m⁴, length ${L} m) carries a compressive load $P$. A small sideways deflection $y(x)$ obeys $EI\,y'' + P\,y = 0$ with $y(0) = y(${L}) = 0$. The straight strut, $y = 0$, always solves this. At what smallest load does a bent solution exist too — the Euler buckling load?`,
          answer: P, units: 'kN', tol: { rel: 0.005 },
          errors: [{ value: (E * 1e9 * I * 1e-7) / (L * L) / 1000, feedback: t`Bent solutions are $\sin\big(\sqrt{P/EI}\,x\big)$; they vanish at $x = L$ when $\sqrt{P/EI}\,L = \pi$, so $\pi^2$ appears.` }, { value: P / 4, feedback: t`That is the load for a strut fixed at one end and free at the other (length $2L$ in the formula). Both ends here are pinned.` }],
          hints: [t`With $k^2 = P/(EI)$ the equation is $y'' + k^2y = 0$; $y(0) = 0$ leaves $y = c\sin kx$.`, t`A bent solution needs $\sin kL = 0$ with $c \ne 0$: the smallest is $kL = \pi$, so $P = \pi^2EI/L^2$.`],
          teach: 'Buckling is a boundary-value problem gaining a nonzero solution: the load at which the straight shape stops being the only one.',
          explain: t`$P_\text{cr} = \dfrac{\pi^2EI}{L^2} = \dfrac{\pi^2\times${E}\times10^9\times${I}\times10^{-7}}{${L}^2} = ${fmt(P, 3)}$ kN. Below it only $y = 0$ satisfies both ends; at it, $c\sin(\pi x/${L})$ does for any $c$ — the linear model cannot say how far it bends, only that it can. Real struts with small imperfections fail somewhat below this load.`,
          visual: fpic(null, [-0.2, L + 0.2], [-0.5, 0.5], t`The strut’s two pinned ends, where $y = 0$. The question is whether any shape other than the straight line can join them. (Deflection would be exaggerated.)`, { xlabel: 'x (m)', ylabel: 'y', curves: [{ fn: '0', color: 'ink2', width: 3, domain: [0, L] }], points: [{ x: 0, y: 0, color: 'gold', r: 6, label: 'pin', labelDx: 8, labelDy: -12 }, { x: L, y: 0, color: 'gold', r: 6, label: 'pin', labelDx: -30, labelDy: -12 }], arrows: [{ from: [-0.15, 0.25], to: [0, 0.02], color: 'bad', label: 'P', labelDx: -14, labelDy: -6 }, { from: [L + 0.15, 0.25], to: [L, 0.02], color: 'bad' }] }),
        };
      },
    }),
    mcq({
      id: 'cp-myth', difficulty: 2,
      prompt: t`Which statement about linear boundary-value problems is true?`,
      choices: [
        'A linear equation with smooth coefficients can still have no solution meeting its boundary conditions',
        'Like an initial-value problem, a linear boundary-value problem always has exactly one solution',
        'If a linear boundary-value problem has two different solutions, it has exactly two',
        'Changing only the boundary values never changes how many solutions there are',
      ],
      answer: 0,
      why: {
        1: t`The uniqueness theorem is about conditions at one point. $y'' + y = 0$, $y(0) = 0$, $y(\pi) = 1$ has none.`,
        2: 'The difference of two solutions solves the homogeneous problem, and so does any multiple of it: two solutions mean infinitely many.',
        3: t`For $y'' + y = 0$, $y(0) = 0$, $y(\pi) = B$: none for $B = 1$, infinitely many for $B = 0$.`,
      },
      hints: ['Recall the three cases for y″ + y = 0 with y(0) = 0 and y(π) = B.'],
      teach: 'A boundary-value problem can have one, none or infinitely many solutions; the homogeneous problem decides which.',
      explain: t`The existence and uniqueness theorem needs both conditions at one point. Fitting at two points gives a linear system for the constants, which may be singular — and then there is no solution or a whole family.`,
      visual: shots(1, 3.6, [0.5, 1, 2, -1], t`Solutions of $y'' + y = 0$ with $y(0) = 0$ (dashed) and the target $y(\pi) = 1$.`, [Math.PI, 1, 'y(π) = 1']),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §4.1 Boundary value problems', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Boundary value problems', url: 'https://tutorial.math.lamar.edu/Classes/DE/BoundaryValueProblem.aspx' },
  ],
});
