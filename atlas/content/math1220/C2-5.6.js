// The binomial series — (1 + x)^r for any real power r: the binomial theorem
// that never stops, valid for |x| < 1.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, tex as texNum } from '../../src/core/format.js';
import { binom, rational, ratTeX, ratPoly } from './_powerseries.js';

const t = String.raw;

// a power r written for an exponent: 1/2, -3/2, 3
const expTeX = (r) => { const [p, q] = rational(r); return q === 1 ? String(p) : `${p}/${q}`; };
const POWERS = [1 / 2, -1 / 2, 1 / 3, -1 / 3, 3 / 2, -3 / 2];
const coef = 'gamma(r + 1)/(gamma(k + 1) gamma(r - k + 1))';   // C(r, k) for r not a negative integer

export default lesson({
  id: 'math1220.C2-5.6',
  title: 'The binomial series',
  minutes: 10, difficulty: 2,
  intro: t`For a whole number $r$, the binomial theorem expands $(1 + x)^r$ into finitely many terms. Newton noticed that the same pattern works for **any real power** — a square root ($r = \tfrac12$), an inverse square root ($r = -\tfrac12$) — if you let it run for ever:

$$(1+x)^r = \sum_{n=0}^{\infty} \binom{r}{n} x^n, \qquad |x| < 1,$$

$$(1+x)^r = 1 + rx + \frac{r(r-1)}{2!}x^2 + \frac{r(r-1)(r-2)}{3!}x^3 + \cdots$$

When $r$ is a whole number the coefficients eventually hit a factor of zero and the series stops. Otherwise it is infinite, with radius of convergence 1. This one series is behind a great many of the “small correction” formulas in physics.`,
  symbols: [
    { tex: 'r', text: 'any real number: the power, such as $\\tfrac12$ for a square root or $-1$ for a reciprocal' },
    { tex: 'x', text: 'the small quantity; the series needs $|x| < 1$' },
    { tex: '\\binom{r}{n}', text: t`the generalised **binomial coefficient** $\frac{r(r-1)\cdots(r-n+1)}{n!}$: $n$ falling factors on top, $n!$ underneath; $\binom{r}{0} = 1$` },
    { tex: 'n!', text: '$n$ factorial, as in every Taylor series — this is the Maclaurin series of $(1+x)^r$' },
  ],
  why: t`Square roots and inverse powers of “one plus something small” are everywhere: $\sqrt{1 - v^2/c^2}$ in relativity, $(1 + h/R)^{-2}$ for gravity at altitude, $\sqrt{1 - 2GM/rc^2}$ for clocks near a mass.`,
  visual: {
    type: 'graph',
    title: 'One pattern for every power',
    lead: t`Gold: the binomial series of $(1+x)^r$ up to $x^N$. Grey: the function itself. Dashed lines mark $x = \pm 1$, the edge of the interval of convergence. The readout shows the newest coefficient, $\binom{r}{N}$.`,
    tasks: [
      'Choose r = 3 and raise N past 3: nothing changes, because the series stops — it is the ordinary binomial theorem.',
      'Choose r = 1/2 or r = −1/2: the series never stops, and it matches the grey curve only between the dashed lines.',
      'With r = −1/2 and N large, compare the two dashed lines: at x = 1 the partial sums still settle (slowly); at x = −1 they run away, as the function does.',
    ],
    params: {
      x: [-1.5, 2.2], y: [-1, 4],
      choices: [{ key: 'r', label: 'Power $r$', options: [[0.5, 'r = 1/2'], [-0.5, 'r = −1/2'], [1 / 3, 'r = 1/3'], [1.5, 'r = 3/2'], [3, 'r = 3']], value: 0.5, explain: 'Non-integer powers give an infinite series.' }],
      sliders: [{ key: 'N', label: 'Highest power $N$', min: 0, max: 30, step: 1, value: 3, explain: 'Keeps the terms up to $x^N$.' }],
      curves: [
        { fn: '(1 + x)^r', color: 'ink3', width: 1.6 },
        { sum: `${coef} x^k`, k: [0, 'N'], color: 'gold' },
      ],
      vlines: [{ x: -1, label: 'x = −1' }, { x: 1, label: 'x = 1' }],
      readouts: [{ label: 'newest coefficient $\\binom{r}{N}$', expr: 'floor(1e9*gamma(r + 1)/(gamma(N + 1) gamma(r - N + 1)) + 0.5)/1e9', digits: 4 }],
    },
    caption: t`Coefficients are computed exactly, through $\binom{r}{n} = \frac{\Gamma(r+1)}{n!\,\Gamma(r-n+1)}$. For $r = \tfrac13$ the grey curve continues below $x = -1$ as the real cube root, where the series does not converge. At the endpoints: for $r > 0$ the series converges at both; for $-1 < r < 0$ only at $x = 1$.`,
  },
  example: {
    prompt: t`Write the first four terms of the binomial series of $\sqrt{1+x}$, and use them to estimate $\sqrt{26}$.`,
    steps: [
      { label: 'Coefficients for r = 1/2', text: t`$\binom{1/2}{1} = \tfrac12$, $\;\binom{1/2}{2} = \frac{\frac12\cdot(-\frac12)}{2!} = -\frac18$, $\;\binom{1/2}{3} = \frac{\frac12\cdot(-\frac12)\cdot(-\frac32)}{3!} = \frac{1}{16}$.` },
      { label: 'The series', text: t`$\sqrt{1+x} = 1 + \dfrac{x}{2} - \dfrac{x^2}{8} + \dfrac{x^3}{16} - \cdots$, valid for $|x| < 1$.` },
      { label: 'Make x small', text: t`$\sqrt{26}$ is not of the form $\sqrt{1 + \text{small}}$, but $\sqrt{26} = \sqrt{25}\sqrt{1 + \tfrac{1}{25}} = 5\sqrt{1 + 0.04}$. Now $x = 0.04$ is well inside the interval.` },
      { label: 'Add up', text: t`$1 + 0.02 - 0.0002 + 0.000004 = 1.019804$, so $\sqrt{26} \approx 5 \times 1.019804 = 5.09902$.` },
      { label: 'Sense check', text: t`A calculator gives $\sqrt{26} = 5.0990195$. After the first term the series alternates, so the error is below the next term, $5\cdot\tfrac{5}{128}(0.04)^4 = 5\times10^{-7}$ — and the actual error is $4.9\times10^{-7}$.` },
    ],
    answer: t`$\sqrt{1+x} = 1 + \frac{x}{2} - \frac{x^2}{8} + \frac{x^3}{16} - \cdots$, and $\sqrt{26} \approx 5.09902$ (error below $5\times10^{-7}$).`,
  },
  practice: [
    num({
      id: 'coefficient-2', difficulty: 1,
      gen(r) {
        const p = r.pick(POWERS), c = binom(p, 2);
        return {
          prompt: t`Compute the binomial coefficient $\dbinom{${expTeX(p)}}{2}$ — the coefficient of $x^2$ in the series of $(1+x)^{${expTeX(p)}}$. (A fraction is fine.)`,
          answer: c, tol: { rel: 1e-4 },
          errors: [{ value: p * (p - 1), feedback: t`Divide by $2! = 2$.` }, { value: (p * (p + 1)) / 2, feedback: t`The second factor is $r - 1$, not $r + 1$: the factors fall, $r(r-1)(r-2)\cdots$` }],
          hints: [t`$\binom{r}{2} = \frac{r(r-1)}{2!}$, even when $r$ is a fraction.`],
          teach: t`The generalised binomial coefficient uses falling factors: $\binom{r}{2} = \frac{r(r-1)}{2}$.`,
          explain: t`$\binom{${expTeX(p)}}{2} = \frac{(${ratTeX(p)})(${ratTeX(p - 1)})}{2} = ${ratTeX(c)}$.`,
        };
      },
    }),
    expr({
      id: 'three-terms', difficulty: 2,
      gen(r) {
        const p = r.pick(POWERS), k = r.pick([2, 3, -2]);
        const key = ratPoly([1, p * k, binom(p, 2) * k * k]);
        const inner = k > 0 ? t`1 + ${k}x` : t`1 - ${-k}x`;
        return {
          prompt: t`Find the first three terms of the binomial series of $(${inner})^{${expTeX(p)}}$.`,
          answer: key.text, answerTeX: key.tex,
          vars: { x: [-1, 1] },
          errors: [
            { answer: ratPoly([1, p * k, binom(p, 2) * k]).text, feedback: t`Substitute the whole $${k}x$: the $x^2$ term carries $(${k}x)^2 = ${k * k}x^2$.` },
            { answer: ratPoly([1, p * k, 2 * binom(p, 2) * k * k]).text, feedback: t`The $x^2$ coefficient is $\frac{r(r-1)}{2!}$ — keep the $2!$.` },
          ],
          hints: [t`Use $(1+u)^r = 1 + ru + \frac{r(r-1)}{2}u^2 + \cdots$ with $u = ${k}x$ and $r = ${expTeX(p)}$.`, t`$\binom{${expTeX(p)}}{2} = ${ratTeX(binom(p, 2))}$; multiply it by $(${k}x)^2$.`],
          teach: t`Substitute the whole small quantity, coefficient and all, for $u$ in $(1+u)^r$.`,
          explain: t`With $u = ${k}x$: $1 + (${ratTeX(p)})(${k}x) + (${ratTeX(binom(p, 2))})(${k}x)^2 = ${key.tex}$, valid for $|x| < \tfrac1{${Math.abs(k)}}$.`,
        };
      },
    }),
    num({
      id: 'cube-root', difficulty: 2,
      gen(r) {
        const [N, d] = r.pick([[10, 30], [2, 0.1], [3, 0.5], [4, 1], [5, 2]]);
        const x = d / N ** 3, v = N * (1 + x / 3 - (x * x) / 9);
        return {
          prompt: t`Use the first three terms of the binomial series to estimate $\sqrt[3]{${N ** 3 + d}}$ to 6 significant figures.`,
          answer: v, tol: { rel: 5e-6 },
          errors: [{ value: N * (1 + x / 3), feedback: t`That is only two terms. Add $\binom{1/3}{2}x^2 = -\frac{x^2}{9}$.` }],
          hints: [t`Factor out the nearest perfect cube: $${N ** 3 + d} = ${N ** 3}\left(1 + \frac{${d}}{${N ** 3}}\right)$.`, t`$\sqrt[3]{${N ** 3 + d}} = ${N}\,(1 + x)^{1/3}$ with $x = ${nice(x, 4)}$, and $(1+x)^{1/3} \approx 1 + \frac{x}{3} - \frac{x^2}{9}$.`],
          teach: 'Factor out the big part so that what remains is (1 + small): then the binomial series converges fast.',
          visual: {
            type: 'graph',
            params: { x: [-0.9, 1.5], y: [0, 1.6], curves: [{ fn: '(1 + x)^(1/3)', color: 'ink3' }, { fn: '1 + x/3 - x^2/9', color: 'gold', dash: true }], vlines: [{ x, label: t`x = ${nice(x, 3)}` }] },
            caption: t`$(1+x)^{1/3}$ (grey) and its three-term series (gold, dashed). Your $x$ is tiny, so the two agree to many digits there.`,
          },
          explain: t`$x = \frac{${d}}{${N ** 3}} = ${nice(x, 4)}$, so $\sqrt[3]{${N ** 3 + d}} \approx ${N}\left(1 + \frac{x}{3} - \frac{x^2}{9}\right) = ${nice(v, 7)}$. (Calculator: $${nice(Math.cbrt(N ** 3 + d), 7)}$.)`,
        };
      },
    }),
    mcq({
      id: 'outside-interval', difficulty: 2,
      prompt: t`Why can’t you estimate $\sqrt5$ by putting $x = 4$ into $\sqrt{1+x} = 1 + \frac{x}{2} - \frac{x^2}{8} + \cdots$?`,
      choices: [
        t`$x = 4$ is outside $|x| < 1$, so the series diverges; write $\sqrt5 = 2\sqrt{1 + \tfrac14}$ instead`,
        t`The series only works for whole-number powers`,
        t`It works, but needs many more terms because $4$ is large`,
        t`It works only if you also add a correction term for $x > 1$`,
      ],
      answer: 0,
      why: {
        1: t`The whole point of the binomial series is that $r$ can be any real number, such as $\tfrac12$.`,
        2: t`More terms make it worse: beyond the radius the terms grow, so the partial sums run away.`,
        3: 'No correction rescues a divergent series; you have to change what you expand.',
      },
      hints: [t`What is the radius of convergence of the binomial series?`, t`Factor out the nearest perfect square so the leftover $x$ is small.`],
      teach: 'Outside its radius a series is useless, however many terms you take — rescale the problem so x is small.',
      visual: {
        type: 'graph',
        params: { x: [-1.2, 5], y: [-1, 4], curves: [{ fn: 'sqrt(1 + x)', color: 'ink3' }, { sum: `${coef} x^k`, k: [0, 8], color: 'gold' }], constants: { r: 0.5 }, vlines: [{ x: 1, label: 'x = 1' }, { x: 4, label: 'x = 4' }] },
        caption: t`$\sqrt{1+x}$ (grey) and its series up to $x^8$ (gold). Past $x = 1$ the partial sums leave the curve.`,
      },
      explain: t`The terms grow like $|x|^n = 4^n$, so the partial sums diverge. Instead $\sqrt5 = \sqrt4\sqrt{1 + \tfrac14} = 2\left(1 + \tfrac18 - \tfrac{1}{128} + \cdots\right) \approx 2.234$, against the true $2.2361$.`,
    }),
    mcq({
      id: 'when-terminates', difficulty: 2,
      prompt: t`For which powers $r$ does the binomial series of $(1+x)^r$ have only finitely many nonzero terms?`,
      choices: ['When r is 0 or a positive whole number', 'When r is negative', 'When r is a fraction such as 1/2', 'Never: it is always an infinite series'],
      answer: 0,
      why: {
        1: t`For $r = -1$ the series is $1 - x + x^2 - x^3 + \cdots$, which never stops.`,
        2: t`For $r = \tfrac12$ no falling factor $r - k$ is ever zero, so no coefficient vanishes.`,
        3: t`For $r = 3$, every coefficient from $\binom{3}{4}$ on contains the factor $3 - 3 = 0$.`,
      },
      hints: [t`Look at the factors $r(r-1)(r-2)\cdots(r-n+1)$. When can one of them be zero?`],
      teach: t`The series stops exactly when a falling factor $r - k$ hits zero, which needs $r$ to be a non-negative integer.`,
      explain: t`If $r$ is a whole number $m \ge 0$, every $\binom{m}{n}$ with $n > m$ contains the factor $m - m = 0$, so the series is the finite binomial expansion. Otherwise no factor vanishes and the series is infinite.`,
    }),
    num({
      id: 'alternating-bound', difficulty: 3,
      gen(r) {
        const b = r.pick([0.1, 0.2, 0.3]);
        const B = b ** 3 / 16;
        return {
          prompt: t`For $0 < x < 1$, the series $\sqrt{1+x} = 1 + \frac{x}{2} - \frac{x^2}{8} + \frac{x^3}{16} - \frac{5x^4}{128} + \cdots$ alternates after its first term, with terms shrinking in size. Use that to bound the error of the three-term estimate $\sqrt{${1 + b}} \approx 1 + \frac{${b}}{2} - \frac{${b}^2}{8}$.`,
          answer: B, tol: { rel: 0.01 },
          errors: [{ value: (b * b) / 8, feedback: 'That is the last term you kept. The bound is the first term you left out.' }],
          hints: [t`For an alternating series with terms decreasing in size, the error is less than the first omitted term.`, t`The first omitted term is $\frac{x^3}{16}$ at $x = ${b}$.`],
          teach: 'When a binomial series alternates, the first omitted term bounds the error — no derivatives needed.',
          explain: t`The error is less than $\frac{${b}^3}{16} = ${texNum(B, 3)}$. Indeed $\sqrt{${1 + b}} - \left(1 + ${b / 2} - ${nice((b * b) / 8)}\right) = ${texNum(Math.sqrt(1 + b) - (1 + b / 2 - (b * b) / 8), 3)}$.`,
        };
      },
    }),
    expr({
      id: 'inverse-sqrt-square', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 4]);
        const key = ratPoly([1, 0, k / 2, 0, (3 * k * k) / 8]);
        const inner = k === 1 ? 'x^2' : t`${k}x^2`;
        return {
          prompt: t`Find the terms up to $x^4$ of the series of $\dfrac{1}{\sqrt{1 - ${inner}}}$.`,
          answer: key.text, answerTeX: key.tex,
          vars: { x: [-0.4, 0.4] },
          errors: [
            { answer: ratPoly([1, 0, -k / 2, 0, (3 * k * k) / 8]).text, feedback: t`Substitute $u = -${inner}$: the minus signs from $r = -\tfrac12$ and from $u$ cancel in the $x^2$ term.` },
            ...(k === 1 ? [] : [{ answer: ratPoly([1, 0, k / 2, 0, (3 * k) / 8]).text, feedback: t`Square the whole $u$: $u^2 = ${k * k}x^4$.` }]),
          ],
          hints: [t`Write it as $(1 + u)^{-1/2}$ with $u = -${inner}$.`, t`$(1+u)^{-1/2} = 1 - \frac{u}{2} + \frac{3u^2}{8} - \cdots$`],
          teach: t`Substituting $u = -x^2$ into $(1+u)^{-1/2}$ gives only even powers, all with positive signs.`,
          explain: t`$(1+u)^{-1/2} = 1 - \frac12u + \frac38u^2 - \cdots$ with $u = -${inner}$ gives $${key.tex} + \cdots$, valid for $|x| < ${{ 1: '1', 2: t`\tfrac{1}{\sqrt2}`, 4: t`\tfrac12` }[k]}$. With $x = v/c$ and $k = 1$ this is the Lorentz factor — the next lesson.`,
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-three-terms', difficulty: 2,
      gen(r) {
        const p = r.pick(POWERS), k = r.pick([2, 3]);
        const key = ratPoly([1, -p * k, binom(p, 2) * k * k]);
        return {
          prompt: t`Find the first three terms of the binomial series of $(1 - ${k}x)^{${expTeX(p)}}$.`,
          answer: key.text, answerTeX: key.tex,
          vars: { x: [-1, 1] },
          errors: [{ answer: ratPoly([1, p * k, binom(p, 2) * k * k]).text, feedback: t`Here $u = -${k}x$, so the $x$ term changes sign.` }],
          hints: [t`$u = -${k}x$ in $(1+u)^r = 1 + ru + \frac{r(r-1)}{2}u^2 + \cdots$`, t`With $r = ${expTeX(p)}$: $\binom{r}{2} = ${ratTeX(binom(p, 2))}$, and $u^2 = ${k * k}x^2$.`],
          teach: 'A minus sign inside the bracket flips the odd powers.',
          explain: t`$1 + (${ratTeX(p)})(-${k}x) + (${ratTeX(binom(p, 2))})(${k * k}x^2) = ${key.tex}$.`,
        };
      },
    }),
    num({
      id: 'cp-coefficient-3', difficulty: 3,
      gen(r) {
        const p = r.pick(POWERS), c = binom(p, 3);
        return {
          prompt: t`What is the coefficient of $x^3$ in the binomial series of $(1+x)^{${expTeX(p)}}$? (A fraction is fine.)`,
          answer: c, tol: { rel: 1e-4 },
          errors: [{ value: p * (p - 1) * (p - 2), feedback: t`Divide by $3! = 6$.` }, { value: (p * (p + 1) * (p + 2)) / 6, feedback: t`The factors fall: $r(r-1)(r-2)$.` }],
          hints: [t`$\binom{r}{3} = \frac{r(r-1)(r-2)}{3!}$.`, t`Here $r = ${ratTeX(p)}$, $r - 1 = ${ratTeX(p - 1)}$, $r - 2 = ${ratTeX(p - 2)}$.`],
          teach: t`$\binom{r}{n}$ has $n$ falling factors over $n!$, for any real $r$.`,
          explain: t`$\frac{(${ratTeX(p)})(${ratTeX(p - 1)})(${ratTeX(p - 2)})}{6} = ${ratTeX(c)}$.`,
        };
      },
    }),
    num({
      id: 'cp-gravity-altitude', difficulty: 3, transfer: true,
      gen(r) {
        const pct = r.pick([0.5, 1]), R = 6371;
        const h = R * Math.sqrt(pct / 100 / 3);
        return {
          prompt: t`Gravity at altitude $h$ above a planet of radius $R$ is $g = g_0\left(1 + \frac{h}{R}\right)^{-2}$, and engineers often use the linear approximation $g \approx g_0\left(1 - \frac{2h}{R}\right)$. Estimate, from the size of the **first neglected term** of the binomial series, the altitude in km at which this approximation is off by ${pct}% of $g_0$. Use $R = 6371$ km for Earth.`,
          answer: h, units: 'km', tol: { rel: 0.05 },
          errors: [{ value: R * (pct / 100 / 3), feedback: t`Solve $3\left(\frac hR\right)^2 = ${pct / 100}$ for $h$: it needs a square root.` }, { value: R * Math.sqrt(pct / 100), feedback: t`The coefficient of $x^2$ in $(1+x)^{-2}$ is $\binom{-2}{2} = \frac{(-2)(-3)}{2} = 3$.` }],
          hints: [t`$(1+x)^{-2} = 1 - 2x + 3x^2 - 4x^3 + \cdots$ with $x = h/R$.`, t`The first neglected term is $3x^2$. Set $3x^2 = ${pct / 100}$.`, t`$x = \sqrt{${pct / 100}/3}$, then $h = xR$.`],
          teach: 'The error of a truncated binomial series is roughly the first term you dropped; set it equal to your tolerance.',
          explain: t`$3\left(\frac{h}{R}\right)^2 = ${pct / 100}$ gives $\frac hR = ${nice(Math.sqrt(pct / 100 / 3), 3)}$ and $h \approx ${Math.round(h)}$ km${pct === 1 ? ' — a little below the International Space Station, which orbits at about 420 km' : ''}. Solving the exact equation instead gives ${pct === 1 ? 382 : 267} km; the first neglected term is an estimate, not a bound.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §6.4 Working with Taylor Series (the binomial series)', url: 'https://openstax.org/books/calculus-volume-2/pages/6-4-working-with-taylor-series' },
  ],
});
