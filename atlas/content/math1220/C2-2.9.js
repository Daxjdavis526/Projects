// Numerical integration: the midpoint and trapezoid rules, concavity, and 1/n² errors.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { midpoint as mid, trapezoid as trap } from '../../src/viz/model/calc-quadrature.js';

const t = String.raw;


// integrands for the computing questions: [atlas text, TeX, function, a, b]
const FUNCS = [
  ['x^2', t`x^2`, (x) => x * x, 0, 2],
  ['x^3', t`x^3`, (x) => x ** 3, 0, 2],
  ['1/x', t`\frac{1}{x}`, (x) => 1 / x, 1, 3],
  ['sqrt(x)', t`\sqrt{x}`, Math.sqrt, 0, 4],
  ['exp(-x^2)', t`e^{-x^2}`, (x) => Math.exp(-x * x), 0, 2],
];
const sumTeX = (vals) => vals.map((v) => nice(+v.toFixed(4))).join(' + ');

export default lesson({
  id: 'math1220.C2-2.9',
  title: 'Numerical integration: midpoint and trapezoid rules',
  minutes: 10, difficulty: 2,
  intro: t`Many integrals have no formula — and a test stand logging thrust has no formula at all, only numbers every few milliseconds. Then you **approximate**. Split $[a, b]$ into $n$ strips of width $\Delta x$. The **midpoint rule** uses rectangles as tall as $f$ at the centre of each strip; the **trapezoid rule** joins the sampled points with straight lines:

$$T_n = \frac{\Delta x}{2}\Big[f(x_0) + 2f(x_1) + 2f(x_2) + \cdots + 2f(x_{n-1}) + f(x_n)\Big]$$

Concavity decides the sign of the error: where $f$ curves upward, the trapezoids overshoot and the midpoint rectangles undershoot — by about half as much. Both errors shrink like $1/n^2$: **double the number of strips and the error drops by a factor of 4.**`,
  symbols: [
    { tex: 'T_n', text: 'the trapezoid estimate of the integral using n strips' },
    { tex: t`\Delta x = \frac{b - a}{n}`, text: 'the strip width — for measured data, the time between samples' },
    { tex: t`x_i = a + i\,\Delta x`, text: t`the sample points, from $x_0 = a$ to $x_n = b$` },
    { tex: t`f(x_i)`, text: 'the sampled heights: values of a formula, or measurements' },
    { tex: '2', text: 'every interior sample is shared by two neighbouring trapezoids, so it counts twice; the two end samples count once' },
    { tex: 'M_n', text: t`the midpoint estimate, $\Delta x\big[f(\bar x_1) + \cdots + f(\bar x_n)\big]$, where $\bar x_i$ is the centre of strip $i$` },
  ],
  why: t`Each interior sample is the right edge of one trapezoid and the left edge of the next — that is the whole reason for the 2s.`,
  visual: {
    type: 'calc-quadrature',
    title: 'Rectangles, trapezoids and the error',
    lead: t`The shaded shapes are what each rule really integrates. The lower panel plots the size of the error against $n$ on logarithmic scales, for both rules.`,
    tasks: [
      'On the concave-down arch, pick Trapezoid: every trapezoid sits under the curve, so the error is negative.',
      'Switch to Midpoint: it overestimates instead, by about half as much.',
      'Watch the ratio E_n / E_2n: close to 4 for both rules. In the lower panel both lines fall with slope −2.',
    ],
    params: {
      functions: [
        { fn: 'sin(x)', a: 0, b: Math.PI, exact: 2, label: 'sin x (concave down)' },
        { fn: 'exp(x)', a: 0, b: 2, exact: Math.exp(2) - 1, label: 'eˣ (concave up)' },
      ],
      rules: ['mid', 'trap'], rule: 'trap', n: 4, nMax: 32, errorPlot: true,
    },
    caption: 'Exact errors, computed against the true integrals. On the log–log panel a straight line of slope −2 means error ∝ 1/n². Rounding error would only appear below about 10⁻¹⁴.',
  },
  example: {
    title: 'Total impulse from a thrust log',
    prompt: t`A small solid motor is fired on a test stand and its thrust is logged every $0.25$ s:

$$\begin{array}{c|ccccccccc} t\ (\text{s}) & 0 & 0.25 & 0.5 & 0.75 & 1.0 & 1.25 & 1.5 & 1.75 & 2.0 \\ \hline F\ (\text{N}) & 0 & 12.8 & 6.2 & 5.1 & 4.9 & 4.8 & 4.6 & 2.1 & 0 \end{array}$$

Estimate the total impulse $I = \int_0^{2} F\,dt$ with the trapezoid rule.`,
    visual: {
      type: 'calc-quadrature',
      params: { data: { y: [0, 12.8, 6.2, 5.1, 4.9, 4.8, 4.6, 2.1, 0], x0: 0, h: 0.25, unit: t`\text{N s}` }, rules: ['trap'], xlabel: 't (s)', ylabel: 'F (N)' },
      caption: 'Illustrative numbers, shaped like a small model-rocket motor’s curve (a sharp ignition spike, a sustain phase, a tail-off). Between samples the rule assumes straight lines.',
    },
    steps: [
      { label: 'Read off the grid', text: t`Spacing $\Delta t = 0.25$ s, $n = 8$ intervals, $9$ samples.` },
      { label: 'Weight the samples', text: t`The ends count once, every interior sample twice: $$0 + 2(12.8 + 6.2 + 5.1 + 4.9 + 4.8 + 4.6 + 2.1) + 0 = 2(40.5) = 81.0\ \text{N}.$$` },
      { label: 'Multiply by Δt/2', text: t`$I \approx \dfrac{0.25}{2}(81.0) = 10.1\ \text{N s}$.` },
      { label: 'Sense check', text: t`The average thrust is $10.1/2.0 \approx 5.1$ N over a 2-second burn — plausible for a motor in this class. The ignition spike lasts barely one sample interval, so the estimate is only as good as the logging rate: a faster log would resolve the peak.` },
    ],
    answer: t`$I \approx 10.1\ \text{N s}$ — the trapezoid rule on measured data.`,
  },
  practice: [
    num({
      id: 'midpoint', difficulty: 2,
      gen(r) {
        const [ftxt, ftex, f, a, b] = r.pick(FUNCS), n = r.pick([2, 4]);
        const h = (b - a) / n, mids = Array.from({ length: n }, (_, i) => a + (i + 0.5) * h);
        const M = mid(f, a, b, n);
        return {
          prompt: t`Estimate $\displaystyle\int_{${a}}^{${b}} ${ftex}\,dx$ with the midpoint rule, $n = ${n}$. Give 3 significant figures.`,
          answer: M, tol: { rel: 0.005 },
          errors: [{ value: trap(f, a, b, n), feedback: 'That is the trapezoid estimate. The midpoint rule samples f at the centre of each strip.' }].filter((e) => Math.abs(e.value - M) > 0.02 * Math.abs(M)),
          hints: [t`$\Delta x = \dfrac{${b} - ${a}}{${n}} = ${nice(h)}$; the strip centres are $${mids.map((m) => nice(m)).join(',\\ ')}$.`, t`$M_{${n}} = ${nice(h)}\,\big[${mids.map((m) => `f(${nice(m)})`).join(' + ')}\big]$.`],
          teach: 'The midpoint rule: strip width times the sum of f at the strip centres.',
          explain: t`$M_{${n}} = ${nice(h)}\,(${sumTeX(mids.map(f))}) = ${fmt(M, 4)}$.`,
          visual: { type: 'graph', params: { x: [a - 0.15 * (b - a), b + 0.15 * (b - a)], y: [0, Math.max(...Array.from({ length: 41 }, (_, i) => f(a + ((b - a) * i) / 40))) * 1.15], curves: [{ fn: ftxt, color: 'accent' }], riemann: { fn: ftxt, from: a, to: b, n, rule: 'mid' } }, caption: 'Each rectangle’s height is f at the centre of its strip.' },
        };
      },
    }),
    num({
      id: 'trapezoid', difficulty: 2,
      gen(r) {
        const [ftxt, ftex, f, a, b] = r.pick(FUNCS), n = r.pick([2, 4]);
        const h = (b - a) / n, xs = Array.from({ length: n + 1 }, (_, i) => a + i * h);
        const T = trap(f, a, b, n);
        const weighted = xs.map((x, i) => (i === 0 || i === n ? f(x) : 2 * f(x)));
        return {
          prompt: t`Estimate $\displaystyle\int_{${a}}^{${b}} ${ftex}\,dx$ with the trapezoid rule, $n = ${n}$. Give 3 significant figures.`,
          answer: T, tol: { rel: 0.005 },
          errors: [{ value: 2 * T, feedback: t`Divide by 2: the trapezoid rule has $\tfrac{\Delta x}{2}$ in front.` }, { value: (h / 2) * xs.reduce((s, x) => s + 2 * f(x), 0), feedback: 'Only the interior samples are doubled; the two end samples count once.' }],
          hints: [t`$\Delta x = ${nice(h)}$; the samples are at $x = ${xs.map((x) => nice(x)).join(',\\ ')}$.`, t`$T_{${n}} = \tfrac{${nice(h)}}{2}\big[f(${nice(a)}) + 2f(${nice(xs[1])}) + \cdots + f(${nice(b)})\big]$.`],
          teach: 'Trapezoid rule: half the spacing times (ends once, interior samples twice).',
          explain: t`$T_{${n}} = \tfrac{${nice(h)}}{2}(${sumTeX(weighted)}) = ${fmt(T, 4)}$.`,
          visual: { type: 'graph', params: { x: [a - 0.15 * (b - a), b + 0.15 * (b - a)], y: [0, Math.max(...Array.from({ length: 41 }, (_, i) => f(a + ((b - a) * i) / 40))) * 1.15], curves: [{ fn: ftxt, color: 'accent' }], riemann: { fn: ftxt, from: a, to: b, n, rule: 'trap' } }, caption: 'Straight lines join the samples; the rule adds up the trapezoids’ areas.' },
        };
      },
    }),
    mcq({
      id: 'concavity', difficulty: 2,
      gen(r) {
        const up = r.bool(0.5);
        const [fn, ftex, a, b, bTeX, jf] = up
          ? r.pick([['exp(x)', t`e^{x}`, 0, 2, '2', Math.exp], ['x^2', t`x^2`, 0, 2, '2', (x) => x * x], ['1/x', t`\tfrac1x`, 1, 3, '3', (x) => 1 / x]])
          : r.pick([['sin(x)', t`\sin x`, 0, Math.PI, t`\pi`, Math.sin], ['sqrt(x)', t`\sqrt x`, 0.25, 4, '4', Math.sqrt], ['ln(x)', t`\ln x`, 1, 4, '4', Math.log]]);
        const I = t`\int_{${a}}^{${bTeX}} ${ftex}\,dx`;
        const top = Math.max(...Array.from({ length: 41 }, (_, i) => jf(a + ((b - a) * i) / 40))) * 1.15;
        return {
          prompt: t`$${ftex}$ is concave ${up ? 'up' : 'down'} on the interval. For $${I}$, which is true for every $n$?`,
          choices: up
            ? [t`$M_n < \text{exact} < T_n$`, t`$T_n < \text{exact} < M_n$`, 'Both rules overestimate', 'Both rules underestimate']
            : [t`$T_n < \text{exact} < M_n$`, t`$M_n < \text{exact} < T_n$`, 'Both rules overestimate', 'Both rules underestimate'],
          answer: 0,
          why: {
            1: up ? 'That is the concave-down pattern. A chord lies above a curve that bends upward.' : 'That is the concave-up pattern. A chord lies below a curve that bends downward.',
            2: 'The two rules err in opposite directions: one uses chords, the other tangent-like flat tops.',
            3: 'The two rules err in opposite directions: one uses chords, the other tangent-like flat tops.',
          },
          hints: ['Picture one strip: where does the chord (the trapezoid’s top) sit relative to the curve?', up ? 'For a curve bending upward the chord lies above it.' : 'For a curve bending downward the chord lies below it.'],
          teach: 'Concave up: trapezoids overestimate and midpoints underestimate; concave down: the reverse.',
          explain: up
            ? t`Chords lie above a concave-up curve, so $T_n$ is too big; the midpoint rectangle’s flat top cuts the curve so that the missing area outweighs the extra, so $M_n$ is too small.`
            : t`Chords lie below a concave-down curve, so $T_n$ is too small, and $M_n$ is too big.`,
          visual: { type: 'graph', params: { x: [a - 0.2, b + 0.2], y: [-0.05 * top, top], curves: [{ fn, color: 'accent' }], riemann: { fn, from: a, to: b, n: 2, rule: 'trap' } }, caption: 'Two trapezoids on the curve. Look at where the chords sit.' },
        };
      },
    }),
    num({
      id: 'distance-from-speed', difficulty: 2,
      gen(r) {
        const dt = r.pick([5, 10]), base = r.pick([[0, 4, 7, 9, 10, 10, 9], [0, 3, 6, 8, 9, 7, 4], [2, 5, 7, 8, 8, 6, 3]]);
        const v = base.map((x) => x + r.pick([0, 0.5]) * (x > 0 ? 1 : 0));
        const n = v.length - 1, D = (dt / 2) * v.reduce((s, x, i) => s + (i === 0 || i === n ? x : 2 * x), 0);
        return {
          prompt: t`A Mars rover’s speed is logged every ${dt} s: $\;${v.map((x) => nice(x)).join(',\\ ')}$ cm/s. Estimate the distance it covers over the ${n * dt} s with the trapezoid rule, in cm.`,
          answer: D, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: dt * v.slice(0, -1).reduce((s, x) => s + x, 0), feedback: 'That is a left-endpoint sum. The trapezoid rule averages each pair of neighbouring samples.' }],
          hints: ['Distance is the integral of speed.', t`$D \approx \tfrac{${dt}}{2}\big[v_0 + 2v_1 + \cdots + 2v_{${n - 1}} + v_{${n}}\big]$.`],
          teach: 'With sampled data, the trapezoid rule is the natural estimate: straight lines between the measurements.',
          explain: t`$D \approx \tfrac{${dt}}{2}\big[${v.map((x, i) => (i === 0 || i === n ? nice(x) : `2(${nice(x)})`)).join(' + ')}\big] = ${nice(D)}$ cm.`,
          visual: { type: 'calc-quadrature', params: { data: { y: v, x0: 0, h: dt }, rules: ['trap'], readout: false, xlabel: 't (s)', ylabel: 'v (cm/s)' }, caption: 'The samples (dots) and the trapezoids the rule adds up. Illustrative numbers.' },
        };
      },
    }),
    mcq({
      id: 'error-scaling', difficulty: 2,
      gen(r) {
        const e = r.pick([0.004, 0.008, 0.012, 0.02]), n = r.pick([10, 20, 50]);
        return {
          prompt: t`The trapezoid rule with $n = ${n}$ has an error of about ${e} for a smooth integrand. About how large is the error with $n = ${2 * n}$?`,
          choices: [String(nice(e / 4)), String(nice(e / 2)), String(nice(e / 16)), String(e)],
          answer: 0,
          why: { 1: 'That assumes the error falls like 1/n. For the trapezoid rule it falls like 1/n².', 2: 'That is Simpson’s rule, whose error falls like 1/n⁴.', 3: 'More strips always help a smooth integrand: the error shrinks.' },
          hints: [t`The trapezoid error is roughly proportional to $1/n^2$.`, 'Doubling n multiplies 1/n² by ¼.'],
          teach: 'Trapezoid and midpoint errors scale like 1/n²: double n, quarter the error.',
          explain: t`$E \propto 1/n^2$, so doubling $n$ divides the error by $4$: about ${nice(e / 4)}.`,
          visual: { type: 'calc-quadrature', params: { functions: [{ fn: 'exp(x)', a: 0, b: 1, exact: Math.E - 1, label: 'eˣ' }], rules: ['trap'], n: 10, nSlider: false, errorPlot: true, readout: false }, caption: t`The trapezoid rule on $\int_0^1 e^x\,dx$ with $n = 10$ (top), and its error for every $n$ on log–log axes (bottom): a straight line of slope $-2$.` },
        };
      },
    }),
    num({
      id: 'relative-error', difficulty: 1,
      gen(r) {
        const n = r.pick([2, 4, 8]), T = trap(Math.exp, 0, 1, n), I = Math.E - 1, T6 = +T.toFixed(6);
        const rel = (Math.abs(T6 - I) / I) * 100;
        return {
          prompt: t`For $\displaystyle\int_0^1 e^x\,dx = e - 1$, the trapezoid rule with $n = ${n}$ gives $T_{${n}} = ${T6}$. What is the relative error, in percent?`,
          answer: rel, tol: { rel: 0.01 },
          errors: [{ value: Math.abs(T6 - I), feedback: 'That is the absolute error. Divide by the exact value and multiply by 100 for a percentage.' }, { value: Math.abs(T6 - I) / I, feedback: 'Right ratio — now express it as a percentage (×100).' }],
          hints: [t`Absolute error $= \lvert T_{${n}} - (e - 1)\rvert$, with $e - 1 \approx 1.718282$.`, 'Relative error = absolute error ÷ exact value, × 100%.'],
          teach: 'Relative error compares the error with the size of the answer itself.',
          explain: t`$\lvert ${T6} - 1.718282\rvert / 1.718282 \times 100\% = ${fmt(rel, 3)}\%$. (It overestimates: $e^x$ is concave up.)`,
          visual: { type: 'graph', params: { x: [-0.1, 1.15], y: [0, 3], curves: [{ fn: 'exp(x)', color: 'accent' }], riemann: { fn: 'exp(x)', from: 0, to: 1, n, rule: 'trap' } }, caption: t`The ${n} trapezoids poke above the concave-up curve $e^x$, so $T_{${n}}$ overestimates.` },
        };
      },
    }),
    num({
      id: 't2n', difficulty: 3,
      gen(r) {
        const n = r.pick([4, 8]), [ftex, f, a, b, ftxt] = r.pick([[t`e^{-x^2}`, (x) => Math.exp(-x * x), 0, 1, 'exp(-x^2)'], [t`\frac{1}{1 + x^2}`, (x) => 1 / (1 + x * x), 0, 1, '1/(1 + x^2)'], [t`\sqrt{1 + x^3}`, (x) => Math.sqrt(1 + x ** 3), 0, 1, 'sqrt(1 + x^3)']]);
        const T = +trap(f, a, b, n).toFixed(6), M = +mid(f, a, b, n).toFixed(6), ans = (T + M) / 2;
        return {
          prompt: t`For $\displaystyle\int_{${a}}^{${b}} ${ftex}\,dx$ you already have $T_{${n}} = ${T}$ and $M_{${n}} = ${M}$. Without evaluating $f$ again, find $T_{${2 * n}}$.`,
          answer: ans, tol: { rel: 2e-6, abs: 2e-7 },
          errors: [{ value: (2 * M + T) / 3, feedback: t`That combination, $(2M_n + T_n)/3$, is Simpson’s $S_{${2 * n}}$ — next lesson. $T_{${2 * n}}$ is a plain average.` }],
          hints: [t`$T_{${2 * n}}$ uses the old sample points plus the midpoints of the old strips, with spacing $\tfrac{\Delta x}{2}$.`, t`Write $T_{${2 * n}} = \tfrac12\cdot\tfrac{\Delta x}{2}\big[\text{old trapezoid sum}\big] + \tfrac{\Delta x}{2}\big[\text{midpoint sum}\big]$.`, t`So $T_{${2 * n}} = \tfrac12(T_{${n}} + M_{${n}})$.`],
          teach: 'Halving the step reuses every old sample: T₂ₙ = (Tₙ + Mₙ)/2.',
          explain: t`$T_{${2 * n}} = \tfrac12(T_{${n}} + M_{${n}}) = \tfrac12(${T} + ${M}) = ${nice(+ans.toFixed(7))}$ — exactly what a fresh ${2 * n}-strip calculation gives, for half the work.`,
          visual: { type: 'graph', params: { x: [a - 0.08, b + 0.08], y: [0, Math.max(f(a), f(b), 1) * 1.25], curves: [{ fn: ftxt, color: 'accent' }], points: [...Array.from({ length: n + 1 }, (_, i) => ({ x: a + ((b - a) * i) / n, y: f(a + ((b - a) * i) / n), color: 'accent2' })), ...Array.from({ length: n }, (_, i) => ({ x: a + ((b - a) * (i + 0.5)) / n, y: f(a + ((b - a) * (i + 0.5)) / n), color: 'gold' }))] }, caption: t`$T_{${2 * n}}$ needs $f$ at the old sample points (blue) and at the midpoints (gold) — exactly the values $T_{${n}}$ and $M_{${n}}$ already used.` },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-trapezoid', difficulty: 2,
      gen(r) {
        const [ftex, f, a, b, bTeX, ftxt] = r.pick([[t`\frac{1}{1 + x^2}`, (x) => 1 / (1 + x * x), 0, 1, '1', '1/(1 + x^2)'], [t`\sin x`, Math.sin, 0, Math.PI, t`\pi`, 'sin(x)'], [t`\ln x`, Math.log, 1, 3, '3', 'ln(x)']]);
        const n = 4, T = trap(f, a, b, n);
        return {
          prompt: t`Estimate $\displaystyle\int_{${a}}^{${bTeX}} ${ftex}\,dx$ with the trapezoid rule, $n = 4$, to 3 significant figures.`,
          answer: T, tol: { rel: 0.005 },
          hints: [t`$\Delta x = (b - a)/4$; weights $1, 2, 2, 2, 1$; multiply by $\Delta x/2$.`],
          teach: 'Trapezoid rule: Δx/2 times (ends once, interior twice).',
          explain: t`$T_4 = ${fmt(T, 4)}$.`,
          visual: { type: 'graph', params: { x: [a - 0.1 * (b - a), b + 0.1 * (b - a)], y: [Math.min(0, f(a)) - 0.1, Math.max(...Array.from({ length: 21 }, (_, i) => f(a + ((b - a) * i) / 20))) * 1.2], curves: [{ fn: ftxt, color: 'accent' }], riemann: { fn: ftxt, from: a, to: b, n: 4, rule: 'trap' } }, caption: 'Four trapezoids under the curve.' },
        };
      },
    }),
    mcq({
      id: 'cp-choose-n', difficulty: 2,
      prompt: t`A trapezoid estimate with $n = 10$ is off by about $0.01$. Roughly what $n$ makes the error about $0.0001$?`,
      choices: ['100', '1000', '10 000', '20'],
      answer: 0,
      why: { 1: 'That would be right if the error fell like 1/n. It falls like 1/n².', 2: 'That would make the error 10⁶ times smaller.', 3: 'Doubling n only quarters the error, to about 0.0025.' },
      hints: ['The error is proportional to 1/n².', 'An error 100 times smaller needs n² 100 times bigger.'],
      teach: 'For an error ∝ 1/n², a factor k in accuracy costs a factor √k in n.',
      explain: t`$100\times$ smaller error needs $n^2$ $100\times$ bigger, so $n$ grows $10\times$: $n \approx 100$.`,
    }),
    num({
      id: 'cp-hot-fire', difficulty: 3, transfer: true,
      gen(r) {
        const peak = r.pick([800, 900, 1000, 1200]);
        const shape = [0, 0.86, 1, 0.97, 0.95, 0.93, 0.92, 0.9, 0.88, 0.52, 0];
        const F = shape.map((s, i) => (i === 0 || i === shape.length - 1 ? 0 : Math.round((s * peak + r.int(-15, 15)) / 10) * 10));
        const h = 0.5, n = F.length - 1, I = (h / 2) * F.reduce((s, x, i) => s + (i === 0 || i === n ? x : 2 * x), 0);
        return {
          prompt: t`A hybrid-motor hot fire is logged every 0.5 s from ignition to shutdown at 5.0 s. Thrust in newtons: $\;${F.join(',\\ ')}$. Estimate the total impulse with the trapezoid rule, to 3 significant figures.`,
          answer: I, units: 'N s', tol: { rel: 0.005 },
          errors: [{ value: 2 * I, feedback: t`Multiply by $\Delta t/2$, not $\Delta t$: the doubled interior samples already count each strip’s two edges.` }],
          hints: [t`Total impulse is $\int F\,dt$.`, t`$I \approx \tfrac{0.5}{2}\big[F_0 + 2F_1 + \cdots + 2F_9 + F_{10}\big]$.`],
          teach: 'Total impulse is the area under the thrust curve; with logged data, the trapezoid rule computes it.',
          explain: t`$I \approx 0.25\times\big[2(${F.slice(1, -1).join(' + ')})\big] = ${fmt(I, 4)}\ \text{N s}$.`,
          visual: { type: 'calc-quadrature', params: { data: { y: F, x0: 0, h }, rules: ['trap'], readout: false, xlabel: 't (s)', ylabel: 'thrust (N)' }, caption: 'Illustrative test-stand data. The trapezoid rule assumes straight lines between samples; a real log is sampled far faster.' },
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §3.6', url: 'https://openstax.org/books/calculus-volume-2/pages/3-6-numerical-integration' }],
});
