// Power-series solutions near an ordinary point: substitute Σaₙxⁿ, shift the
// indices, and turn the equation into a recurrence. Airy's equation (the
// solutions that oscillate on one side and grow on the other), the radius of
// convergence set by singular points in the complex plane, recognising a
// closed form, Hermite's recurrence and why only terminating series are
// allowed in the quantum oscillator — and a neutron bouncing on a mirror.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { nice, tex, frac } from '../../src/core/format.js';
import { gammaFn } from '../../src/core/expr.js';
import { r6, sg } from './_second.js';

const t = String.raw;

// Airy's equation y″ = xy: the two basis series, written with the gamma function
const Y1 = 'gamma(2/3)*x^(3k)/(9^k*gamma(k + 1)*gamma(k + 2/3))';
const Y2 = 'gamma(4/3)*x^(3k + 1)/(9^k*gamma(k + 1)*gamma(k + 4/3))';
const y1 = (x) => { let s = 0; for (let m = 0; m <= 60; m++) s += (gammaFn(2 / 3) * x ** (3 * m)) / (9 ** m * gammaFn(m + 1) * gammaFn(m + 2 / 3)); return s; };
const y2 = (x) => { let s = 0; for (let m = 0; m <= 60; m++) s += (gammaFn(4 / 3) * x ** (3 * m + 1)) / (9 ** m * gammaFn(m + 1) * gammaFn(m + 4 / 3)); return s; };
const AI0 = 0.355028053887817, AIP0 = 0.258819403792807;    // Ai(0) and −Ai′(0)
const A1 = 2.338107410459767;                                // first zero of Ai(−s)

// a neutron above a mirror (CODATA 2018 ħ and mₙ)
const HBAR = 1.054571817e-34, MN = 1.67492749804e-27;

export default lesson({
  id: 'math2280.DE-7.1',
  title: 'Power-series solutions near ordinary points',
  minutes: 14, difficulty: 3,
  intro: t`Most linear equations with variable coefficients have no solution in familiar functions. But near a point where the coefficients are smooth — an **ordinary point** — the solution is a power series,

$$y = \sum_{n=0}^{\infty} a_nx^n.$$

Substitute it, shift the summation indices so that every sum runs over the same power $x^n$, and demand that the coefficient of each power vanish: the differential equation becomes a **recurrence** that builds each $a_n$ from earlier ones, with $a_0 = y(0)$ and $a_1 = y'(0)$ left free — the two constants of a second-order equation. The series converges at least as far as the nearest **singular point**, a point where the coefficients blow up — and that point may lie in the complex plane.`,
  symbols: [
    { tex: 'x', text: 'the independent variable, here measured from the expansion point $x_0 = 0$' },
    { tex: 'a_n', text: 'the coefficient of $x^n$, fixed by the recurrence' },
    { tex: 'a_0,\\ a_1', text: 'the free constants: $a_0 = y(0)$, $a_1 = y\'(0)$' },
    { tex: 'n', text: 'the summation index; shifting it ($n \\to n + 2$) lines up powers coming from $y\'\'$, $y\'$ and $y$' },
    { tex: 'R', text: 'the radius of convergence: at least the distance from $x_0$ to the nearest singular point, real or complex' },
  ],
  why: t`Series are how the special functions of physics — Airy, Bessel, Legendre, Hermite — are first met and computed, and the recurrence that makes a series stop is how quantization first appears in quantum mechanics.`,
  visual: {
    type: 'graph',
    title: 'Airy’s equation, one term at a time',
    lead: t`Airy’s equation $y'' = xy$ is a spring whose stiffness grows steadily: for $x < 0$ it pulls back, harder and harder; for $x > 0$ it pushes away. Its series solutions, $y_1$ (blue, from $y(0) = 1$, $y'(0) = 0$) and $y_2$ (violet, from $y(0) = 0$, $y'(0) = 1$), are drawn summed to $N + 1$ terms; the dashed curves are the same series summed far enough to be exact on this picture.`,
    tasks: [
      t`At $N = 1$ the partial sums $1 + \tfrac{x^3}{6}$ and $x + \tfrac{x^4}{12}$ follow the true curves only near $x = 0$. Add terms: the agreement spreads outward.`,
      t`Airy’s equation has no singular points at all, so the series converge for every $x$ — but at $x = -8$ it takes about 15 terms, because the terms grow before they shrink.`,
      t`Left of 0 the solutions oscillate ever faster with shrinking swings; right of 0 they grow. One equation, two behaviours — it describes light near a rainbow’s edge and a quantum particle at a turning point.`,
    ],
    params: {
      x: [-9, 2.4], y: [-1.6, 3.6], aspect: 'wide', xlabel: 'x', ylabel: 'y',
      sliders: [{ key: 'N', label: 'Highest term index $N$', min: 0, max: 16, step: 1, value: 1, explain: 'Each series is summed over its first $N + 1$ nonzero terms ($x^0, x^3, \\dots$ for $y_1$).' }],
      curves: [
        { sum: Y1, k: [0, 40], color: 'ink3', width: 1.4, dash: true },
        { sum: Y2, k: [0, 40], color: 'ink3', width: 1.4, dash: true },
        { sum: Y1, k: [0, 'N'], color: 'accent', width: 2.4 },
        { sum: Y2, k: [0, 'N'], color: 'violet', width: 2.4 },
      ],
    },
    caption: t`Blue and violet: partial sums of the two basis series. Dashed: each series summed to 41 terms, accurate to drawing precision across this window. Only finitely many terms can ever be added; for large $|x|$ a computer uses other methods.`,
  },
  example: {
    prompt: t`Find the power-series solutions of Airy’s equation $y'' = xy$ about $x = 0$, through the $x^7$ terms.`,
    visual: {
      type: 'graph',
      params: {
        x: [-8, 2.2], y: [-1.2, 3.4], aspect: 'wide', xlabel: 'x', ylabel: 'y',
        curves: [{ sum: Y1, k: [0, 40], color: 'accent', width: 2.4 }, { sum: Y2, k: [0, 40], color: 'violet', width: 2.4 }],
        points: [
          { x: 1.75, y: r6(y1(1.75)), r: 0.01, color: 'accent', label: 'y₁', labelDx: 8, labelDy: 6 },
          { x: 1.2, y: r6(y2(1.2)), r: 0.01, color: 'violet', label: 'y₂', labelDx: -22, labelDy: -4 },
        ],
      },
      caption: t`The two basis solutions: $y_1$ starts at 1 with zero slope, $y_2$ at 0 with slope 1. Every solution is $a_0y_1 + a_1y_2$.`,
    },
    steps: [
      { label: 'Substitute', text: t`$y = \sum a_nx^n$ gives $y'' = \sum_{n\ge2} n(n - 1)a_nx^{n-2}$ and $xy = \sum_{n\ge0} a_nx^{n+1}$.` },
      { label: 'Shift the indices', text: t`Rename so both sums carry $x^n$: $y'' = \sum_{n\ge0}(n + 2)(n + 1)a_{n+2}x^n$ and $xy = \sum_{n\ge1}a_{n-1}x^n$. The second starts at $n = 1$: it has no constant term.` },
      { label: 'Match powers', text: t`$x^0$: $2a_2 = 0$, so $a_2 = 0$. For $n \ge 1$: $(n + 2)(n + 1)a_{n+2} = a_{n-1}$, the **recurrence** $a_{n+2} = \dfrac{a_{n-1}}{(n + 2)(n + 1)}$. It links coefficients three apart.` },
      { label: 'Run it', text: t`$a_3 = \dfrac{a_0}{6}$, $a_4 = \dfrac{a_1}{12}$, $a_5 = \dfrac{a_2}{20} = 0$, $a_6 = \dfrac{a_3}{30} = \dfrac{a_0}{180}$, $a_7 = \dfrac{a_4}{42} = \dfrac{a_1}{504}$.` },
      { label: 'Read off the solutions', text: t`$y = a_0\left(1 + \dfrac{x^3}{6} + \dfrac{x^6}{180} + \cdots\right) + a_1\left(x + \dfrac{x^4}{12} + \dfrac{x^7}{504} + \cdots\right) = a_0y_1 + a_1y_2$, with $a_0 = y(0)$ and $a_1 = y'(0)$.` },
      { label: 'Sense check', text: t`Near 0, $y_1'' = x + \tfrac{x^4}{6} + \cdots = x\,y_1$ ✓. Each step divides by roughly $n^2$, so the terms eventually shrink faster than any power grows: the series converge for every $x$ — as they must, since $y'' = xy$ has no singular points.` },
    ],
    answer: t`$y = a_0\left(1 + \tfrac{x^3}{6} + \tfrac{x^6}{180} + \cdots\right) + a_1\left(x + \tfrac{x^4}{12} + \tfrac{x^7}{504} + \cdots\right)$, from $a_{n+2} = a_{n-1}/((n + 2)(n + 1))$, $a_2 = 0$.`,
  },
  practice: [
    num({
      id: 'cos-coefficient', difficulty: 2,
      gen(r) {
        const k = r.pick([1, 2, 3]), which = r.pick([4, 6]);
        const ans = which === 4 ? k ** 4 / 24 : -(k ** 6) / 720;
        const kk = k * k === 1 ? '' : k * k;
        return {
          prompt: t`The series solution of $y'' + ${kk}y = 0$ with $y(0) = 1$ and $y'(0) = 0$ obeys the recurrence $a_{n+2} = -\dfrac{${k * k}\,a_n}{(n + 2)(n + 1)}$. Find $a_{${which}}$.`,
          answer: ans, tol: { rel: 1e-6 },
          errors: [{ value: which === 4 ? k ** 4 / 8 : -(k ** 6) / 48, feedback: t`Each step divides by $(n + 2)(n + 1)$ — both factors: $a_2 = -\tfrac{${k * k}}{2\cdot1}$, $a_4 = -\tfrac{${k * k}\,a_2}{4\cdot3}$${which === 6 ? t`, $a_6 = -\tfrac{${k * k}\,a_4}{6\cdot5}$` : ''}.` }],
          hints: [t`Start from $a_0 = 1$: $a_2 = -\dfrac{${k * k}}{2\cdot1}$.`, t`Then $a_4 = -\dfrac{${k * k}\,a_2}{4\cdot3}${which === 6 ? t`$ and $a_6 = -\dfrac{${k * k}\,a_4}{6\cdot5}` : ''}$.`],
          teach: 'Running a recurrence is bookkeeping: start from a₀ and a₁ and apply it step by step, every factor included.',
          explain: t`$a_2 = -\tfrac{${k * k}}{2}$, $a_4 = \tfrac{${k ** 4}}{24}${which === 6 ? t`$, $a_6 = -\tfrac{${k ** 6}}{720}` : ''}$ — the coefficients of $\cos ${k === 1 ? '' : k}x = 1 - \tfrac{(${k}x)^2}{2!} + \tfrac{(${k}x)^4}{4!} - \tfrac{(${k}x)^6}{6!} + \cdots$. The recurrence has rebuilt the Taylor series of the cosine.`,
          visual: {
            type: 'graph',
            params: {
              x: [r6(-3.6 / k), r6(3.6 / k)], y: [-1.6, 1.6], aspect: 'wide', xlabel: 'x', ylabel: 'y',
              curves: [
                { fn: `cos(${k}*x)`, color: 'ink3', width: 1.4, dash: true },
                { fn: `1 - ${k * k}*x^2/2`, color: 'gold', width: 1.8 },
                { sum: `(-1)^j*(${k}*x)^(2j)/gamma(2j + 1)`.replace(/j/g, 'k'), k: [0, 4], color: 'accent', width: 2.2 },
              ],
            },
            caption: t`The true solution (dashed), the series through $x^2$ (gold) and through $x^8$ (blue): more terms, a wider stretch of agreement.`,
          },
        };
      },
    }),
    mcq({
      id: 'index-shift', difficulty: 2, kind: 'error',
      prompt: t`For $y'' + x\,y = 0$ a student writes $y'' = \sum (n + 2)(n + 1)a_{n+2}x^n$ and $xy = \sum a_{n+1}x^n$, and gets the recurrence $a_{n+2} = -\dfrac{a_{n+1}}{(n + 2)(n + 1)}$. With $a_0 = 1$, $a_1 = 0$ every later coefficient comes out zero, so the “solution” is $y = 1$. What went wrong?`,
      choices: [
        t`Multiplying by $x$ raises every power by one: $xy = \sum a_nx^{n+1} = \sum a_{n-1}x^n$, so the recurrence links $a_{n+2}$ to $a_{n-1}$`,
        t`The shift in $y''$ is wrong: it should be $\sum n(n - 1)a_nx^n$`,
        t`Nothing: $y = 1$ does solve the equation`,
        t`The recurrence should link $a_{n+2}$ to $a_n$, as for $y'' + y = 0$`,
      ],
      answer: 0,
      why: {
        1: t`$y''$ is fine: $\sum n(n - 1)a_nx^{n-2}$ with $n \to n + 2$ gives $(n + 2)(n + 1)a_{n+2}x^n$. The slip is in $xy$.`,
        2: t`For $y = 1$: $y'' + xy = 0 + x \neq 0$.`,
        3: t`That would be right for $y'' + y = 0$; the factor $x$ shifts the index by one more.`,
      },
      hints: [t`Write $xy = \sum a_nx^{n+1}$ and rename the index so the power is $x^n$.`, t`Put $m = n + 1$: $\sum a_{m-1}x^m$. Which coefficient multiplies $x^n$?`],
      teach: 'Multiplying by x shifts powers up by one, so in the xⁿ coefficient the index goes down by one — the commonest slip in series solutions.',
      explain: t`$xy = \sum_{n\ge1}a_{n-1}x^n$, so the correct recurrence is $a_{n+2} = -\dfrac{a_{n-1}}{(n + 2)(n + 1)}$ (with $a_2 = 0$), giving $y = 1 - \tfrac{x^3}{6} + \tfrac{x^6}{180} - \cdots$. A quick check catches the slip: substitute the result back into the equation.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.5, 4], y: [-1.5, 2], aspect: 'wide', xlabel: 'x', ylabel: 'y',
          curves: [
            { fn: '1', color: 'warn', width: 2, dash: true, label: 'the student’s y = 1', labelAt: -2.4, labelDx: 4, labelDy: -10 },
            { sum: Y1.replace('x^(3k)', '(-x)^(3k)'), k: [0, 40], color: 'accent', width: 2.4 },
          ],
        },
        caption: t`The true solution of $y'' + xy = 0$ with $y(0) = 1$, $y'(0) = 0$ (blue) and the student’s constant (orange, dashed).`,
      },
    }),
    num({
      id: 'radius', difficulty: 2,
      gen(r) {
        const [al, be] = r.pick([[1, 2], [-1, 2], [2, 1], [0, 3], [-2, 1]]), x0 = r.pick([0, 1]);
        const R = Math.hypot(x0 - al, be);
        const b = -2 * al, c = al * al + be * be;
        return {
          prompt: t`Without solving it: the equation $(x^2${sg(b, 'x')}${sg(c, '')})\,y'' + x\,y' - y = 0$ has power-series solutions about $x_0 = ${x0}$. At least how large is their radius of convergence?`,
          answer: R, tol: { rel: 0.003 },
          errors: [
            { value: be, feedback: t`Measure the distance from $x_0 = ${x0}$ to the singular points $${al} \pm ${be}i$ themselves, not just their height above the real axis.` },
            ...(Math.abs(x0 - al) > 0.01 ? [{ value: Math.abs(x0 - al), feedback: t`That is the distance to the singular points’ *real part*. They sit at $${al} \pm ${be}i$, off the real axis.` }] : []),
          ].filter((e) => Math.abs(e.value - R) > 0.003 * R),
          hints: [t`Singular points are where the coefficient of $y''$ vanishes: solve $x^2${sg(b, 'x')}${sg(c, '')} = 0$.`, t`The roots are $${al} \pm ${be}i$. The radius is at least their distance from $x_0 = ${x0}$ in the complex plane.`],
          teach: 'A series about an ordinary point converges at least out to the nearest singular point — measured in the complex plane.',
          explain: t`The singular points are $x = ${al} \pm ${be}i$, at distance $\sqrt{(${x0} - (${al}))^2 + ${be}^2} = ${nice(R)}$ from $x_0 = ${x0}$. Although the coefficients are smooth for every real $x$, the complex singularities limit the series: $R \ge ${nice(R)}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4, 4], y: [-3.5, 3.5], equal: true, aspect: 'wide', xlabel: 'Re x', ylabel: 'Im x',
              points: [
                { x: al, y: be, color: 'bad', r: 5, label: 'singular', labelDx: 8, labelDy: -8 },
                { x: al, y: -be, color: 'bad', r: 5, label: 'singular', labelDx: 8, labelDy: 14 },
                { x: x0, y: 0, color: 'gold', r: 5, label: `x₀ = ${x0}`, labelDx: 8, labelDy: 14 },
              ],
            },
            caption: 'The complex x-plane: the expansion point (gold) and the two singular points of the equation (red), both off the real line.',
          },
        };
      },
    }),
    expr({
      id: 'closed-form', difficulty: 3,
      gen(r) {
        const s = r.pick([1, -1]);
        const eq = s > 0 ? t`y'' - x\,y' - y = 0` : t`y'' + x\,y' + y = 0`;
        return {
          prompt: t`Solve $${eq}$ with $y(0) = 1$, $y'(0) = 0$ by series, and recognise the sum: give $y$ in closed form.`,
          answer: `e^(${s}*x^2/2)`, answerTeX: t`e^{${s < 0 ? '-' : ''}x^2/2}`, lhs: 'y(x)',
          vars: { x: [-1.5, 1.5] },
          errors: [{ answer: `e^(${s}*x^2)`, feedback: t`Check $a_2$: the recurrence gives $a_2 = ${s < 0 ? '-' : ''}\tfrac12$, so $y = 1 ${s < 0 ? '-' : '+'} \tfrac{x^2}{2} + \cdots$, the start of $e^{${s < 0 ? '-' : ''}x^2/2}$.` }, { answer: `cosh(x)`, feedback: t`$\cosh x = \sum x^{2m}/(2m)!$; here the denominators are $2^m m!$.` }].filter((e) => !(s < 0 && e.answer === 'cosh(x)')),
          hints: [t`Substituting, the $x^n$ coefficient gives $(n + 2)(n + 1)a_{n+2} ${s > 0 ? '-' : '+'} (n + 1)a_n = 0$, so $a_{n+2} = ${s < 0 ? '-' : ''}\dfrac{a_n}{n + 2}$.`, t`With $a_0 = 1$: $a_2 = ${s < 0 ? '-' : ''}\tfrac12$, $a_4 = \tfrac{1}{2\cdot4}$, $a_6 = ${s < 0 ? '-' : ''}\tfrac{1}{2\cdot4\cdot6}$, … so $a_{2m} = \dfrac{(${s})^m}{2^m m!}$. Compare with $e^u = \sum u^m/m!$.`],
          teach: 'Sometimes the recurrence produces a series you know — here the exponential, with u = ±x²/2.',
          explain: t`$a_{2m} = \dfrac{(${s})^m}{2^m m!}$ and the odd ones vanish, so $y = \sum_m \dfrac{(${s < 0 ? '-' : ''}x^2/2)^m}{m!} = e^{${s < 0 ? '-' : ''}x^2/2}$. Check: $y' = ${s < 0 ? '-' : ''}xy$ and $y'' = ${s < 0 ? '-' : ''}y + x^2y$, so $y'' ${s > 0 ? '-' : '+'} xy' ${s > 0 ? '-' : '+'} y = 0$ ✓.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.5, 2.5], y: [s > 0 ? 0 : -0.4, s > 0 ? 6 : 1.4], aspect: 'wide', xlabel: 'x', ylabel: 'y',
              curves: [1, 2, 3].map((N, k) => ({ sum: `(${s}*x^2/2)^k/gamma(k + 1)`, k: [0, N], color: ['gold', 'teal', 'accent'][k], width: 2 })),
            },
            caption: 'The partial sums through x², x⁴ and x⁶ (gold, teal, blue): a familiar function is taking shape.',
          },
        };
      },
    }),
    num({
      id: 'hermite', difficulty: 3,
      gen(r) {
        const [parity, deg] = r.pick([['even', 4], ['even', 6], ['odd', 3], ['odd', 5]]);
        const nu = deg, E = nu + 0.5;
        return {
          prompt: t`For the quantum harmonic oscillator, Schrödinger’s equation (in units where $\hbar\omega$ is the energy unit) becomes, after writing $\psi = y\,e^{-x^2/2}$, Hermite’s equation $y'' - 2x\,y' + 2\nu y = 0$ with energy $E = (\nu + \tfrac12)\hbar\omega$. Its series recurrence is $a_{k+2} = \dfrac{2(k - \nu)}{(k + 2)(k + 1)}\,a_k$. A non-terminating series grows like $e^{x^2}$ and makes $\psi$ blow up, so only terminating ones are allowed. For the ${parity} solution whose polynomial ends at $x^{${deg}}$, what is $E/\hbar\omega$?`,
          answer: E, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [{ value: nu, feedback: t`That is $\nu$. The energy is $E = (\nu + \tfrac12)\hbar\omega$ — the oscillator never sits at zero energy.` }, { value: deg / 2 + 0.5, feedback: t`The series ends after $x^{${deg}}$ when the numerator $2(k - \nu)$ vanishes at $k = ${deg}$: that fixes $\nu = ${deg}$, not the number of terms.` }].filter((e) => Math.abs(e.value - E) > 1e-6),
          hints: [t`The series stops after $x^{${deg}}$ if $a_{${deg + 2}} = 0$, that is if $2(${deg} - \nu) = 0$.`, t`So $\nu = ${deg}$, and $E = (\nu + \tfrac12)\hbar\omega$.`],
          teach: 'A series that must terminate allows only special values of a parameter — the first sight of quantized energy levels.',
          explain: t`The recurrence’s numerator vanishes at $k = \nu$, so the ${parity} series ends at $x^{${deg}}$ when $\nu = ${deg}$: $E = (${deg} + \tfrac12)\hbar\omega = ${E}\,\hbar\omega$. The allowed energies are evenly spaced, $\hbar\omega$ apart, starting from $\tfrac12\hbar\omega$ — the vibrational ladder of molecules and of trapped ions.`,
          visual: {
            type: 'graph',
            params: {
              x: [-4.2, 4.2], y: [-3, 4], aspect: 'wide', xlabel: 'x', ylabel: 'ψ',
              curves: [
                { fn: 'x^2/2', color: 'ink4', width: 1.4, dash: true, label: 'potential', labelAt: 2.6, labelDx: 6, labelDy: 0 },
                { fn: '(1 - 2x^2)*exp(-x^2/2)', color: 'good', width: 2.2, label: 'ν = 2: series stops', labelAt: -3.3, labelDx: -10, labelDy: 16 },
                { sum: '4^k*gamma(k - 1.1)/(gamma(-1.1)*gamma(2k + 1))*x^(2k)*exp(-x^2/2)', k: [0, 70], color: 'bad', width: 2.2, label: undefined },
              ],
              points: [{ x: 2.9, y: 3.2, r: 0.01, color: 'bad', label: 'ν = 2.2: runs away', labelDx: -60, labelDy: 0 }],
            },
            caption: t`Even solutions for two values of $\nu$: at $\nu = 2$ the series stops and $\psi$ dies away (green); at $\nu = 2.2$ it never stops, and $\psi$ blows up (red). Only the first can describe a particle. Dashed: the potential well.`,
          },
        };
      },
    }),
    code({
      id: 'airy-coeffs', difficulty: 3,
      prompt: t`Write \`airy_coeffs(a0, a1, N)\` that returns the list $[a_0, a_1, \dots, a_{N-1}]$ of series coefficients of Airy’s equation $y'' = xy$, using $a_2 = 0$ and $a_{n+2} = \dfrac{a_{n-1}}{(n + 2)(n + 1)}$. Then sum 40 terms to get $y(2)$ for $y(0) = 1$, $y'(0) = 0$, and set \`y_ivp\` to the value \`scipy.integrate.solve_ivp\` gives for the same problem at $x = 2$, to compare.`,
      starter: t`import numpy as np
from scipy.integrate import solve_ivp

def airy_coeffs(a0, a1, N):
    a = [0.0] * N
    # fill in a[0], a[1] and the recurrence
    return a

y_series = None     # the series summed to 40 terms at x = 2
y_ivp = None        # solve_ivp's value at x = 2
`,
      answer: t`import numpy as np
from scipy.integrate import solve_ivp

def airy_coeffs(a0, a1, N):
    a = [0.0] * N
    a[0], a[1] = a0, a1                 # a[2] stays 0
    for n in range(1, N - 2):
        a[n + 2] = a[n - 1] / ((n + 2) * (n + 1))
    return a

a = airy_coeffs(1.0, 0.0, 40)
y_series = sum(c * 2.0**n for n, c in enumerate(a))

sol = solve_ivp(lambda x, y: [y[1], x * y[0]], (0, 2), [1.0, 0.0], rtol=1e-11, atol=1e-12)
y_ivp = sol.y[0, -1]
print(y_series, y_ivp, y_series - y_ivp)`,
      tests: [
        { name: t`the coefficients start $1, 0, 0, \tfrac16, 0, 0, \tfrac1{180}$`, code: 'all(abs(u - v) < 1e-15 for u, v in zip(airy_coeffs(1, 0, 7), [1, 0, 0, 1/6, 0, 0, 1/180]))' },
        { name: t`with $a_0 = 0$, $a_1 = 1$: $a_4 = \tfrac1{12}$ and $a_7 = \tfrac1{504}$`, code: 'abs(airy_coeffs(0, 1, 8)[4] - 1/12) < 1e-15 and abs(airy_coeffs(0, 1, 8)[7] - 1/504) < 1e-15' },
        { name: t`the series gives $y(2) = 2.730883\ldots$`, code: 'abs(y_series - 2.73088301789015) < 1e-10' },
        { name: 'solve_ivp agrees to about a millionth', code: 'abs(y_ivp - 2.73088301789015) < 1e-6' },
      ],
      hints: [t`Set \`a[0], a[1] = a0, a1\`, then loop \`for n in range(1, N - 2): a[n + 2] = a[n - 1] / ((n + 2) * (n + 1))\`.`, t`For \`solve_ivp\` write the equation as a system: \`lambda x, y: [y[1], x * y[0]]\`, from \`[1.0, 0.0]\` on \`(0, 2)\`; take \`sol.y[0, -1]\`. Use tight tolerances such as \`rtol=1e-11\`.`],
      teach: 'A recurrence is a few lines of code, and comparing its sum with a numerical integrator is the standard check that both are right.',
      explain: t`The coefficients fall off like $1/n^2$ per step, so 40 terms give $y(2) = 2.7308830\ldots$ to machine precision, and the integrator agrees to its tolerance. Two independent methods agreeing is how special-function libraries are tested.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coefficient', difficulty: 2,
      gen(r) {
        const [c, d] = r.pick([[1, 1], [1, 2], [2, 1], [2, 3], [-1, 3], [1, 3]]);
        const a2 = -d / 2, a4 = (-(2 * c + d) * a2) / 12;
        return {
          prompt: t`For $y''${sg(c, t`x\,y'`)}${sg(d, 'y')} = 0$ with $y(0) = 1$, $y'(0) = 0$, the series coefficients obey $a_{n+2} = -\dfrac{${c === 1 ? '' : c === -1 ? '-' : c}n${sg(d, '')}}{(n + 2)(n + 1)}\,a_n$. Find $a_4$.`,
          answer: a4, tol: { rel: 1e-6 },
          errors: [{ value: (d * d) / 24, feedback: t`At $n = 2$ the numerator is $${c === 1 ? '' : c === -1 ? '-' : c}\cdot2${sg(d, '')}$, not just ${d}: the $x\,y'$ term contributes $${c}n$.` }].filter((e) => Math.abs(e.value - a4) > 1e-9),
          hints: [t`$a_2 = -\dfrac{${d}}{2\cdot1}\,a_0$, then $a_4 = -\dfrac{${2 * c + d}}{4\cdot3}\,a_2$.`],
          teach: 'Apply the recurrence at n = 0, then n = 2, keeping every term of its numerator.',
          explain: t`$a_2 = ${frac(a2)}$ and $a_4 = -\dfrac{${2 * c + d}}{12}\cdot\left(${frac(a2)}\right) = ${frac(a4)}$.`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.5, 6.5], y: [r6(Math.min(-0.5, a2 - 0.3)), 1.4], aspect: 'wide', xlabel: 'n', ylabel: 'aₙ', xticks: 6,
              points: [
                { x: 0, y: 1, color: 'accent', r: 5, label: 'a₀ = 1', labelDx: 8, labelDy: -8 },
                { x: 1, y: 0, color: 'accent', r: 5, label: 'a₁ = 0', labelDx: 8, labelDy: -8 },
                { x: 2, y: r6(a2), color: 'accent', r: 5, label: `a₂ = ${a2 < 0 ? '−' : ''}${Math.abs(a2)}`, labelDx: 8, labelDy: -8 },
                { x: 3, y: 0, color: 'accent', r: 5 },
                { x: 4, y: 0, color: 'gold', r: 0.01, label: 'a₄ = ?', labelDx: -14, labelDy: -10 },
              ],
              arrows: [{ from: [2.15, r6(a2)], to: [3.85, 0.05], color: 'gold', width: 1.6, dash: [5, 4] }],
            },
            caption: 'The coefficients so far: the odd ones vanish (they come from a₁ = 0), and the recurrence carries a₂ two steps on to a₄.',
          },
        };
      },
    }),
    num({
      id: 'cp-radius', difficulty: 3,
      gen(r) {
        const [x0, xs] = r.pick([[1, 3], [2, 4], [-1, 2], [0.5, 2.5]]);
        const R = Math.min(Math.hypot(x0, 1), Math.abs(xs - x0));
        const real = Math.abs(xs - x0);
        return {
          prompt: t`The equation $(x^2 + 1)(x - ${xs})\,y'' + y' + y = 0$ is expanded in a power series about $x_0 = ${x0}$. What is the guaranteed radius of convergence?`,
          answer: R, tol: { rel: 0.003 },
          errors: [{ value: real, feedback: t`$x = ${xs}$ is the nearest *real* singular point, but $x^2 + 1 = 0$ adds two more, at $\pm i$, at distance $\sqrt{${x0}^2 + 1}$.` }].filter((e) => Math.abs(e.value - R) > 0.003 * R),
          hints: [t`Find every zero of the coefficient of $y''$ — complex ones included.`, t`The singular points are $${xs}$, $i$ and $-i$; measure each one’s distance from $x_0 = ${x0}$ and take the smallest.`],
          teach: 'The guaranteed radius is the distance to the nearest singular point of all — complex ones count as much as real ones.',
          explain: t`Distances from $x_0 = ${x0}$: to $${xs}$ it is $${nice(real)}$; to $\pm i$ it is $\sqrt{${x0}^2 + 1} = ${nice(Math.hypot(x0, 1))}$. The smaller, $${nice(R)}$, is the guaranteed radius.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3, 5], y: [-2.2, 2.2], equal: true, aspect: 'wide', xlabel: 'Re x', ylabel: 'Im x',
              points: [
                { x: 0, y: 1, color: 'bad', r: 5, label: 'i', labelDx: 8, labelDy: -6 }, { x: 0, y: -1, color: 'bad', r: 5, label: '−i', labelDx: 8, labelDy: 14 },
                { x: xs, y: 0, color: 'bad', r: 5, label: `${xs}`, labelDx: 6, labelDy: -8 },
                { x: x0, y: 0, color: 'gold', r: 5, label: `x₀ = ${x0}`, labelDx: -18, labelDy: 18 },
              ],
            },
            caption: 'The expansion point (gold) and the three singular points (red) in the complex plane.',
          },
        };
      },
    }),
    num({
      id: 'cp-bouncer', difficulty: 3, transfer: true,
      gen(r) {
        const g = r.pick([9.81, 9.807]);
        const z0 = Math.cbrt((HBAR * HBAR) / (2 * MN * MN * g)), z1 = A1 * z0;
        return {
          prompt: t`Neutrons dropped onto a horizontal mirror cannot sit at any height: in 2002 an experiment at the ILL in Grenoble saw their quantum states. Above the mirror, Schrödinger’s equation $-\dfrac{\hbar^2}{2m}\psi'' + mgz\,\psi = E\psi$ becomes **Airy’s equation** $\psi_{ss} = s\,\psi$ after the substitution $z = z_0s + E/mg$, with length scale $z_0 = \left(\dfrac{\hbar^2}{2m^2g}\right)^{1/3}$. The mirror forces $\psi = 0$ at $z = 0$, and for the lowest state that happens where the decaying Airy solution $\mathrm{Ai}(s)$ has its first zero, at $s = -2.338$. So the lowest state’s classical bounce height is $E/mg = 2.338\,z_0$. Find it in micrometres, with $\hbar = 1.0546\times10^{-34}$ J·s, $m = 1.6749\times10^{-27}$ kg and $g = ${g}$ m/s².`,
          answer: z1 * 1e6, units: 'µm', tol: { rel: 0.005 },
          errors: [{ value: z0 * 1e6, feedback: t`That is $z_0$. The bounce height is $2.338\,z_0$.` }, { value: Math.cbrt((HBAR * HBAR) / (2 * MN * g)) * A1 * 1e6, feedback: t`The mass enters squared: $z_0 = (\hbar^2/2m^2g)^{1/3}$ — one $m$ from the kinetic term, one from $mgz$.` }],
          hints: [t`$\hbar^2 = 1.112\times10^{-68}$ and $2m^2g = 2(1.6749\times10^{-27})^2(${g})$.`, t`$z_0 = (\hbar^2/2m^2g)^{1/3} \approx 5.87\ \mu\text{m}$; multiply by 2.338.`],
          teach: 'Airy’s equation is the Schrödinger equation of a uniform force; its zeros set the quantized heights of a particle bouncing in gravity.',
          explain: t`$z_0 = \left(\dfrac{\hbar^2}{2m^2g}\right)^{1/3} = ${tex(z0 * 1e6, 3)}\ \mu\text{m}$, so the lowest state reaches $2.338\,z_0 = ${tex(z1 * 1e6, 3)}\ \mu\text{m}$ — about the width of a hair, with an energy $mg\times2.338z_0 \approx 1.4$ peV. Higher states sit at the later zeros of Ai: 4.088, 5.521, … times $z_0$, unevenly spaced, unlike the oscillator’s ladder.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 6], y: [-0.5, 3.6], aspect: 'wide', xlabel: 'height z / z₀', ylabel: '',
              curves: [
                { fn: 'x', color: 'ink4', width: 1.4, dash: true, label: 'potential mgz', labelAt: 4.6, labelDx: 6, labelDy: 6 },
                { sum: `${r6(A1 / 41)} + 1.2*(${AI0}*${Y1.replace(/x/g, '(x - 2.338107)')} - ${AIP0}*${Y2.replace(/x/g, '(x - 2.338107)')})`, k: [0, 40], color: 'accent', width: 2.4 },
              ],
              hlines: [{ y: A1, label: 'energy level', color: 'gold' }],
              vlines: [{ x: 0, label: 'mirror', color: 'ink2' }],
            },
            caption: t`The lowest state’s wave function (blue), drawn at its energy level (gold): zero at the mirror, largest in the middle, and leaking a little above the classical bounce height where the level meets the potential. Heights in units of $z_0$, energy in units of $mgz_0$.`,
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §7.1–7.2 Power series and series solutions', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'NIST Digital Library of Mathematical Functions, Ch. 9 Airy and related functions', url: 'https://dlmf.nist.gov/9' },
    { label: 'V. V. Nesvizhevsky et al., “Quantum states of neutrons in the Earth’s gravitational field”, Nature 415, 297 (2002)', url: 'https://doi.org/10.1038/415297a' },
  ],
});
