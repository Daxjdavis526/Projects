// Power series and the radius of convergence — a polynomial that never stops,
// and the distance from its centre beyond which it stops making sense.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';

const t = String.raw;

// (x − h) written the way a textbook would: x − 3, x + 2
const shift = (h) => (h > 0 ? t`x - ${h}` : t`x + ${-h}`);

// a small graph of the N-term partial sum of a series (no radius markers: the
// learner finds the radius; the picture only shows where the sums misbehave)
const partialSums = (term, k0, span, y, caption) => ({
  type: 'graph',
  params: { x: [-span, span], y, curves: [{ sum: term, k: [k0, 30], color: 'gold' }] },
  caption,
});

// the size of the nth term at x = 2 for the four series of 'which-everywhere'
const fact = (n) => { let p = 1; for (let k = 2; k <= n; k++) p *= k; return p; };
const TERMS = [[(n) => 2 ** n / fact(n), 'good'], [(n) => fact(n) * 2 ** n, 'bad'], [(n) => 2 ** n, 'warn'], [(n) => (n ? 2 ** n / (n * n) : null), 'violet']]
  .flatMap(([f, color]) => Array.from({ length: 11 }, (_, n) => ({ x: n, y: f(n), color, r: 4 })).filter((p) => p.y !== null && p.y <= 12));

export default lesson({
  id: 'math1220.C2-5.1',
  title: 'Power series and the radius of convergence',
  minutes: 10, difficulty: 2,
  intro: t`A **power series** is a polynomial that never stops:

$$\sum_{n=0}^{\infty} c_n (x-a)^n = c_0 + c_1(x-a) + c_2(x-a)^2 + c_3(x-a)^3 + \cdots$$

Choose a number for $x$ and it becomes an ordinary series of numbers, which converges or does not. The remarkable fact is that the verdict depends only on **the distance from the centre**: there is a radius $R$ such that the series converges for every $x$ with $|x - a| < R$ and diverges for every $x$ with $|x - a| > R$. You find $R$ with the ratio test. Inside that radius a power series is a perfectly good function — the form in which physics writes $\sin\theta$, $e^{x}$ and the Lorentz factor.`,
  symbols: [
    { tex: 'x', text: 'the variable: for each value of $x$ the series is a series of numbers' },
    { tex: 'a', text: 'the **centre**; the series is built from powers of the distance $x - a$' },
    { tex: 'c_n', text: 'the **coefficients** — fixed numbers, one for each power' },
    { tex: 'n', text: t`the summation index $n = 0, 1, 2, \ldots$, which is also the power of $(x - a)$` },
    { tex: 'R', text: t`the **radius of convergence**, $0 \le R \le \infty$: convergence for $|x-a| < R$, divergence for $|x - a| > R$. When the limit exists, $R = \lim_{n\to\infty} |c_n / c_{n+1}|$` },
  ],
  why: t`The radius tells you how far from the centre a series approximation can be trusted. Beyond it, adding more terms makes the answer worse, not better.`,
  visual: {
    type: 'graph',
    title: 'Inside the radius the partial sums settle; outside they explode',
    lead: t`The gold curve is the partial sum $S_N(x) = \sum_{n=0}^{N} \left(\frac{x-a}{R}\right)^{n}$ — a geometric series with centre $a$ and ratio $\frac{x-a}{R}$, so it converges exactly when $|x - a| < R$. The grey curve is the function it converges to there, $\frac{R}{R - (x - a)}$. The dashed lines mark $x = a - R$ and $x = a + R$.`,
    tasks: [
      'Raise N to 40: between the dashed lines the gold curve locks onto the grey one; outside them it shoots off the screen.',
      'Move the probe p outside the dashed lines: the grey function still has a value there, but the partial sums never settle on it.',
      'Slide the centre a and the radius R: the interval of convergence is always centred at a.',
    ],
    params: {
      x: [-5, 5], y: [-3, 6],
      sliders: [
        { key: 'N', label: 'Highest power $N$', min: 0, max: 40, step: 1, value: 4, explain: 'The partial sum keeps the terms $n = 0, 1, \\ldots, N$.' },
        { key: 'a', label: 'Centre $a$', min: -2, max: 2, step: 0.5, value: 0, explain: 'The series is built from powers of $x - a$.' },
        { key: 'R', label: 'Radius $R$', min: 0.5, max: 3, step: 0.25, value: 2, explain: 'Successive terms differ by the factor $(x-a)/R$.' },
        { key: 'p', label: 'Probe point $p$', min: -5, max: 5, step: 0.1, value: 1, explain: 'The readouts evaluate the series at $x = p$.' },
      ],
      curves: [
        { fn: 'R/(R - (x - a))', color: 'ink3', width: 1.6 },
        { sum: '((x - a)/R)^k', k: [0, 'N'], color: 'gold' },
      ],
      vlines: [{ x: 'a - R', label: 'a − R', color: 'accent2' }, { x: 'a + R', label: 'a + R', color: 'accent2' }],
      points: [{ x: 'p', y: '(1 - ((p - a)/R)^(N + 1))/(1 - (p - a)/R)', color: 'gold' }],
      readouts: [
        { label: 'ratio-test limit $|p - a|/R$', expr: 'abs(p - a)/R', digits: 3 },
        { label: '$S_N(p)$', expr: '(1 - ((p - a)/R)^(N + 1))/(1 - (p - a)/R)', digits: 5 },
        { label: 'function at $p$', expr: 'R/(R - (p - a))', digits: 5 },
      ],
    },
    caption: t`The partial sums are computed exactly. The grey function $\frac{R}{R-(x-a)}$ exists everywhere except $x = a + R$, but the series equals it only between the dashed lines. Curves leaving the plot are clipped.`,
  },
  example: {
    prompt: t`Find the centre and the radius of convergence of
$$\sum_{n=0}^{\infty} \frac{(n+1)\,(x+1)^n}{5^n}.$$`,
    steps: [
      { label: 'Read off the pieces', text: t`Write $x + 1$ as $x - (-1)$: the centre is $a = -1$. The coefficients are $c_n = \dfrac{n+1}{5^n}$.` },
      { label: 'Ratio of successive terms', text: t`For a fixed $x$, the ratio test looks at
$$\left|\frac{a_{n+1}}{a_n}\right| = \frac{(n+2)\,|x+1|^{n+1}/5^{n+1}}{(n+1)\,|x+1|^{n}/5^{n}} = \frac{n+2}{n+1}\cdot\frac{|x+1|}{5}.$$` },
      { label: 'Take the limit', text: t`As $n \to \infty$, $\frac{n+2}{n+1} \to 1$, so the limit is $L = \dfrac{|x+1|}{5}$.` },
      { label: 'Apply the ratio test', text: t`The series converges absolutely when $L < 1$, that is $|x + 1| < 5$, and diverges when $|x+1| > 5$. So $R = 5$.` },
      { label: 'Sense check', text: t`The shortcut $R = \lim |c_n/c_{n+1}| = \lim \frac{n+1}{n+2}\cdot 5 = 5$ agrees. A factor that grows like a power of $n$, such as $n + 1$, never changes the radius — the $5^n$ sets it.` },
    ],
    answer: t`Centre $a = -1$ and radius $R = 5$: the series converges absolutely for $-6 < x < 4$ and diverges for $x < -6$ and $x > 4$. The two endpoints, $x = -6$ and $x = 4$, need their own check — that is the next lesson.`,
  },
  practice: [
    mcq({
      id: 'centre-radius', difficulty: 1,
      gen(r) {
        const h = r.intExcept(-5, 5, [0]), b = r.int(2, 6);
        return {
          prompt: t`Where is $\displaystyle\sum_{n=0}^{\infty} \frac{(${shift(h)})^n}{${b}^n}$ centred, and what is its radius of convergence?`,
          choices: [t`centre $${h}$, radius $${b}$`, t`centre $${-h}$, radius $${b}$`, t`centre $${h}$, radius $\tfrac{1}{${b}}$`, t`centre $${-h}$, radius $\tfrac{1}{${b}}$`],
          answer: 0,
          why: {
            1: t`The series is built from powers of $x - a$, so $(${shift(h)})$ means $a = ${h}$. Read the sign backwards.`,
            2: t`The terms shrink by the factor $|${shift(h)}|/${b}$, which is below 1 when $|${shift(h)}| < ${b}$: the radius is $${b}$, not $\tfrac1{${b}}$.`,
            3: t`Two slips: the centre is $${h}$ (powers of $x - a$), and the radius is $${b}$ (the ratio $|${shift(h)}|/${b}$ must be below 1).`,
          },
          hints: [t`Match $(${shift(h)})$ to the pattern $(x - a)$.`, t`The ratio of successive terms is $\frac{|${shift(h)}|}{${b}}$. For which $x$ is it less than 1?`],
          teach: t`A series in powers of $(x - a)$ is centred at $a$, and it converges for $|x - a| < R$.`,
          visual: { type: 'graph', params: { x: [h - 2 * b, h + 2 * b], y: [-2, 6], curves: [{ sum: `((x - (${h}))/${b})^k`, k: [0, 25], color: 'gold' }] }, caption: 'The partial sum with 26 terms: flat where the series converges, running away where it does not.' },
          explain: t`It is a geometric series with ratio $\frac{${shift(h)}}{${b}}$, so it converges exactly when $|${shift(h)}| < ${b}$: centre $${h}$, radius $${b}$.`,
        };
      },
    }),
    num({
      id: 'radius-n-power', difficulty: 2,
      gen(r) {
        const b = r.int(2, 5), p = r.pick([1, 2]);
        const np = p === 1 ? 'n' : 'n^2';
        return {
          prompt: t`Find the radius of convergence of $\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{${np}\cdot ${b}^n}$.`,
          answer: b, tol: { rel: 1e-3 },
          errors: [{ value: 1 / b, feedback: t`That is $\lim |c_{n+1}/c_n|$. The radius is its reciprocal: the series converges when $|x|/${b} < 1$.` }],
          hints: [t`Use the ratio test on $a_n = \frac{x^n}{${np}\cdot${b}^n}$.`, t`$\left|\frac{a_{n+1}}{a_n}\right| = \frac{${p === 1 ? 'n' : 'n^2'}}{${p === 1 ? '(n+1)' : '(n+1)^2'}}\cdot\frac{|x|}{${b}} \to \frac{|x|}{${b}}$. Set that below 1.`],
          teach: t`Powers of $n$ in the coefficients never change the radius; the geometric factor does.`,
          explain: t`$\left|\frac{a_{n+1}}{a_n}\right| \to \frac{|x|}{${b}}$, which is less than 1 exactly when $|x| < ${b}$. So $R = ${b}$.`,
          visual: partialSums(t`x^k/(k^${p}*${b}^k)`, 1, 2 * b, [-3, 5], t`The partial sum with 30 terms. Where it stays put, the series converges; where it shoots off, it diverges.`),
        };
      },
    }),
    num({
      id: 'radius-reciprocal', difficulty: 2,
      gen(r) {
        const b = r.int(2, 5), h = r.intExcept(-3, 3, [0]);
        return {
          prompt: t`Find the radius of convergence of $\displaystyle\sum_{n=1}^{\infty} \frac{${b}^n\,(${shift(h)})^n}{n}$. (A fraction such as 1/3 is fine.)`,
          answer: 1 / b, tol: { rel: 0.005 },
          errors: [{ value: b, feedback: t`The terms grow by a factor of about $${b}\,|${shift(h)}|$ each time. That is below 1 when $|${shift(h)}| < \tfrac1{${b}}$.` }, { value: h, feedback: t`That is the centre. The radius is the half-width of the interval of convergence.` }],
          hints: [t`Ratio test: compute $\left|\frac{a_{n+1}}{a_n}\right|$ and take $n \to \infty$.`, t`The limit is $${b}\,|${shift(h)}|$. Solve $${b}\,|${shift(h)}| < 1$.`],
          teach: t`A large geometric factor in the coefficients means a small radius: $c_n = b^n$ gives $R = 1/b$.`,
          visual: { type: 'graph', params: { x: [h - 2 / b, h + 2 / b], y: [-3, 5], curves: [{ sum: `(${b}*(x - (${h})))^k/k`, k: [1, 30], color: 'gold' }] }, caption: 'The partial sum with 30 terms, on a narrow window around the centre.' },
          explain: t`$\left|\frac{a_{n+1}}{a_n}\right| = \frac{n}{n+1}\cdot ${b}\,|${shift(h)}| \to ${b}\,|${shift(h)}|$, which is below 1 when $|${shift(h)}| < \tfrac{1}{${b}}$. So $R = \tfrac{1}{${b}} \approx ${nice(1 / b)}$.`,
        };
      },
    }),
    mcq({
      id: 'which-everywhere', difficulty: 2,
      prompt: 'Which power series converges for every real number x?',
      choices: [t`$\displaystyle\sum_{n=0}^{\infty} \frac{x^n}{n!}$`, t`$\displaystyle\sum_{n=0}^{\infty} n!\,x^n$`, t`$\displaystyle\sum_{n=0}^{\infty} x^n$`, t`$\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{n^2}$`],
      answer: 0,
      why: {
        1: t`Here $\left|\frac{a_{n+1}}{a_n}\right| = (n+1)|x| \to \infty$ for every $x \ne 0$: the radius is $0$, and it converges only at its centre.`,
        2: t`This is the geometric series: it converges only for $|x| < 1$.`,
        3: t`The $n^2$ helps at the endpoints $x = \pm 1$, but the ratio still tends to $|x|$, so $R = 1$.`,
      },
      hints: ['Apply the ratio test to each and see which limit is 0 for every x.', t`For $\frac{x^n}{n!}$: $\left|\frac{a_{n+1}}{a_n}\right| = \frac{|x|}{n+1}$.`],
      teach: t`Factorials in the denominator beat any power of $x$, giving $R = \infty$; factorials in the numerator give $R = 0$.`,
      visual: { type: 'graph', params: { x: [-0.5, 10.5], y: [0, 12], xlabel: 'n', ylabel: '', points: TERMS }, caption: t`The size of the $n$th term at $x = 2$. Green: $\frac{x^n}{n!}$. Red: $n!\,x^n$. Amber: $x^n$. Violet: $\frac{x^n}{n^2}$. Points above 12 are off the chart.` },
      explain: t`For $\sum x^n/n!$, $\left|\frac{a_{n+1}}{a_n}\right| = \frac{|x|}{n+1} \to 0 < 1$ for every $x$, so $R = \infty$. (Its sum is $e^x$.)`,
    }),
    num({
      id: 'radius-even-powers', difficulty: 3,
      gen(r) {
        const s = r.int(2, 6), b = s * s;
        return {
          prompt: t`Find the radius of convergence of $\displaystyle\sum_{n=0}^{\infty} \frac{x^{2n}}{${b}^n}$.`,
          answer: s, tol: { rel: 1e-3 },
          errors: [{ value: b, feedback: t`The terms are powers of $x^2$, not $x$: the ratio test gives $x^2/${b} < 1$, so take a square root.` }, { value: 1 / b, feedback: t`Invert nothing here: the series converges when $x^2 < ${b}$.` }],
          hints: [t`Only even powers appear. Treat it as a geometric series in $\frac{x^2}{${b}}$.`, t`It converges when $\frac{x^2}{${b}} < 1$.`, t`$x^2 < ${b}$ means $|x| < \sqrt{${b}}$.`],
          teach: t`When a series uses $x^{2n}$, the ratio test gives a condition on $x^2$; take its square root to get $R$.`,
          explain: t`$\left|\frac{a_{n+1}}{a_n}\right| = \frac{x^2}{${b}}$, which is below 1 when $|x| < \sqrt{${b}} = ${s}$. So $R = ${s}$.`,
          visual: partialSums(t`(x^2/${b})^k`, 0, 2 * s, [-1, 6], t`The partial sum with 31 terms (powers up to $x^{60}$).`),
        };
      },
    }),
    mcq({
      id: 'converge-diverge-points', difficulty: 2,
      prompt: t`A power series centred at $0$ converges at $x = 4$ and diverges at $x = -6$. Which statement **must** be true?`,
      choices: [t`It converges at $x = -3$.`, t`It converges at $x = 5$.`, t`It diverges at $x = -5$.`, t`It converges at $x = -4$.`],
      answer: 0,
      why: {
        1: t`All you know is $4 \le R \le 6$. If $R = 4$, then $x = 5$ lies outside the radius and the series diverges there.`,
        2: t`If $R = 6$, then $x = -5$ lies inside the radius and the series converges there.`,
        3: t`$x = -4$ is at distance exactly 4, which could be an endpoint ($R = 4$). Endpoints can behave differently: the series could converge at $4$ and diverge at $-4$.`,
      },
      hints: ['Convergence at x = 4 means R ≥ 4. Divergence at x = −6 means R ≤ 6.', t`Which point is guaranteed to be strictly inside the radius, whatever $R$ in $[4, 6]$ is?`],
      teach: t`Convergence at a point puts it within the radius ($R \ge$ its distance); divergence puts it outside or on the edge ($R \le$ its distance).`,
      explain: t`Converging at $x = 4$ forces $R \ge 4$; diverging at $x = -6$ forces $R \le 6$. Only $x = -3$ satisfies $|x| < 4 \le R$, so only there is convergence guaranteed.`,
      visual: {
        type: 'graph',
        params: { aspect: 'wide', x: [-7, 7], y: [-0.6, 0.6], yticks: 1, points: [{ x: 4, y: 0, color: 'good', label: 'converges' }, { x: -6, y: 0, color: 'bad', label: 'diverges' }, { x: 0, y: 0, color: 'ink3', label: 'centre' }] },
        caption: 'The two facts you are given, on the number line.',
      },
    }),
    mcq({
      id: 'reciprocal-slip', difficulty: 3, kind: 'error',
      prompt: t`A student finds the radius of convergence of $\sum_{n=0}^{\infty} \frac{x^n}{3^n}$:

$$\left|\frac{c_{n+1}}{c_n}\right| = \frac{1/3^{n+1}}{1/3^{n}} = \frac13, \quad\text{so } R = \tfrac13.$$

What went wrong?`,
      choices: [
        t`$R$ is the reciprocal of that limit: the terms shrink when $|x|/3 < 1$, so $R = 3$`,
        t`The ratio should include the $n = 0$ term, which changes $R$`,
        t`Every geometric series has $R = 1$`,
        t`Nothing — the radius really is $\tfrac13$`,
      ],
      answer: 0,
      why: {
        1: 'A single term never affects convergence, and the ratio is the same for every n here.',
        2: t`Only the geometric series in $x$ itself has $R = 1$; here the ratio is $x/3$.`,
        3: t`Try $x = 1$: the series $\sum (1/3)^n$ converges, yet $1 > \tfrac13$. So $R$ must be bigger than $\tfrac13$.`,
      },
      hints: ['The ratio test is applied to the terms, which include the power of x.', t`$\left|\frac{a_{n+1}}{a_n}\right| = \frac{|x|}{3}$. When is that less than 1?`],
      teach: t`$\lim |c_{n+1}/c_n|$ is not $R$; it is $1/R$ — the ratio test needs $|x - a|\cdot\lim|c_{n+1}/c_n| < 1$.`,
      visual: { type: 'graph', params: { x: [-5, 5], y: [-2, 5], curves: [{ fn: '3/(3 - x)', domain: [-5, 2.95], color: 'ink3', width: 1.5 }, { sum: '(x/3)^k', k: [0, 30], color: 'gold' }], vlines: [{ x: -1 / 3, color: 'bad' }, { x: 1 / 3, label: '±1/3', color: 'bad' }, { x: -3, color: 'good' }, { x: 3, label: '±3', color: 'good' }] }, caption: t`The 31-term partial sum (gold) agrees with $\frac{3}{3 - x}$ (grey) far beyond $\pm\tfrac13$ — all the way out to $\pm 3$.` },
      explain: t`With the $x$ included, the ratio is $|x|/3$, below 1 exactly when $|x| < 3$. So $R = 3$, the reciprocal of the student’s $\tfrac13$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-radius', difficulty: 2,
      gen(r) {
        const b = r.int(2, 7), h = r.intExcept(-4, 4, [0]);
        return {
          prompt: t`Find the radius of convergence of $\displaystyle\sum_{n=0}^{\infty} \frac{(${shift(h)})^n}{(n^2 + 1)\,${b}^n}$.`,
          answer: b, tol: { rel: 1e-3 },
          errors: [{ value: 1 / b, feedback: t`Invert that: the condition is $|${shift(h)}|/${b} < 1$.` }, { value: h, feedback: 'That is the centre, not the radius.' }],
          hints: [t`Ratio test; the factor $\frac{n^2+1}{(n+1)^2+1}$ tends to 1.`],
          teach: t`The radius comes from the geometric part of the coefficients; polynomial factors in $n$ do not change it.`,
          explain: t`$\left|\frac{a_{n+1}}{a_n}\right| = \frac{n^2+1}{(n+1)^2+1}\cdot\frac{|${shift(h)}|}{${b}} \to \frac{|${shift(h)}|}{${b}}$, so $R = ${b}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-radius-zero', difficulty: 2,
      prompt: t`A power series centred at $a$ has radius of convergence $R = 0$. Where does it converge?`,
      choices: [t`Only at $x = a$`, 'Nowhere', 'Everywhere', t`On the interval $(a - 1, a + 1)$`],
      answer: 0,
      why: {
        1: t`At $x = a$ every term after $c_0$ is $c_n \cdot 0^n = 0$, so the series is just $c_0$ there — it always converges at its centre.`,
        2: t`That is $R = \infty$.`,
        3: t`$R = 0$ means it diverges at every distance greater than 0 from the centre.`,
      },
      hints: [t`What is every term $c_n (x - a)^n$ with $n \ge 1$ when $x = a$?`],
      teach: 'Every power series converges at its own centre; R = 0 means that is the only place.',
      explain: t`At $x = a$ the series collapses to $c_0$; everywhere else $|x - a| > 0 = R$, so it diverges. An example is $\sum n!\,x^n$.`,
    }),
    multi({
      id: 'cp-kepler', difficulty: 3, transfer: true,
      prompt: t`To predict where a body is on its orbit, astronomers solve Kepler’s equation $E - e\sin E = M$ for the angle $E$. One classic solution writes $E$ as a **power series in the eccentricity** $e$. For each position on the orbit this is an ordinary power series in $e$, and the smallest of their radii of convergence is $0.6627$ (the *Laplace limit*): below it the series converges everywhere on the orbit, above it somewhere it does not.

For which orbits can you use the series safely? Select all that apply.`,
      choices: ['Earth around the Sun (e = 0.017)', 'Mercury around the Sun (e = 0.21)', 'A geostationary transfer orbit (e ≈ 0.73)', 'Halley’s Comet (e = 0.97)'],
      answer: [0, 1],
      why: { 2: 'e ≈ 0.73 is beyond the radius 0.6627: for some positions on the orbit the partial sums do not settle.', 3: 'e = 0.97 is far beyond the radius; orbit codes solve Kepler’s equation iteratively (Newton’s method) instead.' },
      hints: ['Compare each eccentricity with the radius 0.6627.', 'Inside the radius: converges. Beyond it: the series fails somewhere on the orbit.'],
      teach: 'A power series is trustworthy only inside its radius of convergence, whatever the physical context.',
      visual: { type: 'graph', params: { x: [-8, 2], y: [-4, 4], equal: true, xlabel: '', ylabel: '', curves: [0.017, 0.21, 0.73, 0.97].map((e, k) => ({ polar: `${1 + e}/(1 + ${e}*cos(theta))`, theta: [0, 2 * Math.PI], color: ['accent', 'good', 'warn', 'bad'][k], width: 1.8 })), points: [{ x: 0, y: 0, color: 'gold', r: 5 }] }, caption: 'The four orbits’ shapes, scaled to the same closest approach, with the Sun (gold) at a focus. Blue: e = 0.017. Green: 0.21. Amber: 0.73. Red: 0.97, which runs far off the chart.' },
      explain: t`Earth ($e = 0.017$) and Mercury ($e = 0.21$) are well inside the radius $0.6627$. A transfer orbit ($e \approx 0.73$) and Halley’s Comet ($e = 0.97$) are outside it, so real orbit software solves Kepler’s equation iteratively instead.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §6.1 Power Series and Functions', url: 'https://openstax.org/books/calculus-volume-2/pages/6-1-power-series-and-functions' },
  ],
});
