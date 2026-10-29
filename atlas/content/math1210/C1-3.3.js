// Power, sum and constant-multiple rules — the three rules that differentiate
// every polynomial and every power law in one line.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt, frac, polyTeX } from '../../src/core/format.js';

const t = String.raw;

const GM = 398600.4418;                                   // km³/s², Earth
const period = (a) => 2 * Math.PI * Math.sqrt(a ** 3 / GM) / 60;   // minutes

export default lesson({
  id: 'math1210.C1-3.3',
  title: 'Power, sum and constant-multiple rules',
  minutes: 9, difficulty: 2,
  intro: t`Working every derivative from the limit is slow. Three rules do most of the work. The **power rule**, for any real exponent $n$:

$$\frac{d}{dx}\,x^n = n\,x^{n-1}$$

The **constant-multiple rule**, $(cf)' = cf'$, and the **sum rule**, $(f + g)' = f' + g'$. Together they differentiate any polynomial term by term, and — after rewriting roots and reciprocals as powers ($\sqrt{x} = x^{1/2}$, $1/x^2 = x^{-2}$) — every power law in physics. A constant on its own has derivative $0$.`,
  symbols: [
    { tex: 'x^n', text: 'a power of $x$; $n$ may be any real number — positive, negative or fractional' },
    { tex: 'n\\,x^{n-1}', text: 'its derivative: bring the exponent down as a factor, then lower the exponent by one' },
    { tex: 'c', text: 'a constant: it rides along unchanged, $(cf)\' = cf\'$' },
    { tex: "(f + g)'", text: 'the derivative of a sum is the sum of the derivatives' },
  ],
  why: t`Every polynomial trajectory, inverse-square force and Kepler-type scaling law is differentiated with these rules — usually in your head.`,
  visual: {
    type: 'graph',
    title: 'The power rule, live',
    lead: t`The blue curve is $y = x^n$. Drag the gold point along it: the readouts compare the measured tangent slope with the rule’s prediction $n x^{n-1}$. Change $n$ and reveal the derivative curve.`,
    tasks: [
      t`$n = 2$: the slope at $x$ is $2x$. $n = 0.5$: it is $\frac{1}{2\sqrt x}$, steep near $0$ and flattening out.`,
      t`$n = -1$: the curve $1/x$ always falls, and the slope is $-1/x^2$ — negative everywhere.`,
      t`$n = 1$ gives slope $1$ everywhere, and $n = 0$ gives a flat line with slope $0$. The rule covers both.`,
    ],
    params: {
      x: [-0.1, 3.1], y: [-4, 8], aspect: 'wide',
      sliders: [{ key: 'n', label: t`Exponent $n$`, min: -2, max: 3, step: 0.1, value: 2, explain: t`The power in $y = x^n$.` }],
      choices: [{ key: 'show', label: t`Curve of $n x^{n-1}$`, options: [[0, 'hidden'], [1, 'shown']], value: 0, explain: 'Draw the derivative the power rule predicts, dashed.' }],
      curves: [
        { fn: 'x^n', color: 'accent', domain: [0.12, 3.1] },
        { fn: 'n*x^(n - 1)', color: 'violet', dash: true, width: 1.6, domain: [0.12, 3.1], when: 'show' },
      ],
      tangent: { fn: 'x^n', at: 1.5 },
      hlines: [{ y: 0, color: 'ink4' }],
      readouts: [
        { label: '$x$', expr: 'x0', digits: 3 },
        { label: 'measured slope', expr: 'slope', digits: 4 },
        { label: t`rule: $n x^{n-1}$`, expr: 'n*x0^(n - 1)', digits: 4 },
      ],
    },
    caption: t`Drawn for $x > 0$, where $x^n$ is defined for every real $n$. The measured slope is a numerical derivative; the agreement is the power rule at work.`,
  },
  example: {
    prompt: t`Differentiate $f(x) = 4x^3 - 6\sqrt{x} + \dfrac{2}{x^2} + 7$, and evaluate $f'(1)$.`,
    visual: { type: 'graph', params: { x: [0.25, 2.2], y: [-6, 30], aspect: 'wide', curves: [{ fn: '4*x^3 - 6*sqrt(x) + 2/x^2 + 7', color: 'accent' }, { fn: '7 + 5*(x - 1)', color: 'gold', dash: true, domain: [0.4, 1.8] }], points: [{ x: 1, y: 7, color: 'gold', label: '(1, 7)' }] }, caption: t`$y = f(x)$ and its tangent at $x = 1$, of slope $f'(1) = 5$.` },
    steps: [
      { label: 'Rewrite as powers', text: t`$f(x) = 4x^3 - 6x^{1/2} + 2x^{-2} + 7$. Every term is now a constant times a power of $x$.` },
      { label: 'Term by term', text: t`Sum rule, then constant-multiple and power rules on each term: $4\cdot 3x^2 - 6\cdot\tfrac12 x^{-1/2} + 2\cdot(-2)x^{-3} + 0$.` },
      { label: 'Tidy', text: t`$f'(x) = 12x^2 - \dfrac{3}{\sqrt x} - \dfrac{4}{x^3}$. The constant $7$ disappeared: it does not change any slope.` },
      { label: 'Evaluate', text: t`$f'(1) = 12 - 3 - 4 = 5$.` },
      { label: 'Why it works', text: t`For whole-number $n$, $(x + h)^n = x^n + n x^{n-1}h + (\text{terms with } h^2)$, so the difference quotient is $n x^{n-1} + (\text{terms with } h) \to n x^{n-1}$. The rocket of lesson C1-3.1, $h(t) = 0.25t^3 + 4t^2$, now gives $h'(t) = 0.75t^2 + 8t$ and $h'(4) = 44$ m/s in one line.` },
    ],
    answer: t`$f'(x) = 12x^2 - \dfrac{3}{\sqrt x} - \dfrac{4}{x^3}$, and $f'(1) = 5$.`,
  },
  practice: [
    expr({
      id: 'poly', difficulty: 1,
      gen(r) {
        const a = r.intExcept(-5, 5, [0]), b = r.intExcept(-6, 6, [0]), c = r.intExcept(-9, 9, [0]), d = r.intExcept(-9, 9, [0]);
        const coefs = [d, c, 0, b, a];
        return {
          prompt: t`Differentiate $f(x) = ${polyTeX(coefs)}$.`,
          lhs: "f'(x)",
          answer: `${4 * a}x^3 + (${3 * b})x^2 + (${c})`, answerTeX: polyTeX([c, 0, 3 * b, 4 * a]),
          vars: { x: [-2, 2] }, derivativeOf: `${a}x^4 + (${b})x^3 + (${c})x + (${d})`,
          errors: [{ answer: `${4 * a}x^3 + (${3 * b})x^2 + (${c}) + (${d})`, feedback: t`The constant term has derivative $0$.` }, { answer: `${4 * a}x^4 + (${3 * b})x^3 + (${c})x`, feedback: t`Bring the exponent down *and* lower it by one: $\frac{d}{dx}x^4 = 4x^3$.` }],
          hints: ['Differentiate term by term with the power rule.', t`$\frac{d}{dx}x^4 = 4x^3$, $\frac{d}{dx}x^3 = 3x^2$, $\frac{d}{dx}x = 1$, and a constant gives $0$.`],
          teach: 'A polynomial is differentiated term by term: each power drops by one and its old exponent becomes a factor.',
          explain: t`$f'(x) = ${polyTeX([c, 0, 3 * b, 4 * a])}$.`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-30, 30], aspect: 'wide', curves: [{ fn: `${a}*x^4 + (${b})*x^3 + (${c})*x + (${d})`, color: 'accent' }] }, caption: t`$y = f(x)$ on $[-2, 2]$.` },
        };
      },
    }),
    expr({
      id: 'roots-negpowers', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 4, 6, 8]), b = r.int(1, 6), k = r.pick([1, 2, 3]);
        const bTeX = k === 1 ? t`\dfrac{${b}}{x}` : t`\dfrac{${b}}{x^{${k}}}`;
        return {
          prompt: t`Differentiate $g(x) = ${a}\sqrt{x} + ${bTeX}$.`,
          lhs: "g'(x)",
          answer: `${a / 2}/sqrt(x) - ${b * k}/x^${k + 1}`,
          answerTeX: t`\frac{${a / 2}}{\sqrt{x}} - \frac{${b * k}}{x^{${k + 1}}}`,
          vars: { x: [0.5, 3] }, derivativeOf: `${a}*sqrt(x) + ${b}/x^${k}`,
          errors: [{ answer: `${a / 2}/sqrt(x) + ${b * k}/x^${k + 1}`, feedback: t`$\frac{${b}}{x^{${k}}} = ${b}x^{-${k}}$: the exponent $-${k}$ comes down as a *negative* factor.` }, { answer: `${a / 2}/sqrt(x) - ${b * k}/x^${k - 1}`, feedback: t`Lowering $-${k}$ by one gives $-${k + 1}$, not $-${k - 1}$: negative exponents move further from zero.` }],
          hints: [t`Rewrite: $g(x) = ${a}x^{1/2} + ${b}x^{-${k}}$.`, t`$\frac{d}{dx}x^{1/2} = \tfrac12 x^{-1/2}$ and $\frac{d}{dx}x^{-${k}} = -${k}x^{-${k + 1}}$.`],
          teach: 'Rewrite roots and reciprocals as powers before using the power rule; negative exponents become more negative.',
          explain: t`$g'(x) = ${a}\cdot\tfrac12 x^{-1/2} + ${b}\cdot(-${k})x^{-${k + 1}} = \dfrac{${a / 2}}{\sqrt x} - \dfrac{${b * k}}{x^{${k + 1}}}$.`,
          visual: { type: 'graph', params: { x: [0, 4], y: [0, 3 * a], aspect: 'wide', curves: [{ fn: `${a}*sqrt(x) + ${b}/x^${k}`, color: 'accent', domain: [0.2, 4] }] }, caption: t`$y = g(x)$ for $x > 0$.` },
        };
      },
    }),
    mcq({
      id: 'which-correct', difficulty: 2,
      prompt: 'Which derivative is correct?',
      choices: [t`$\dfrac{d}{dx}x^{\pi} = \pi x^{\pi - 1}$`, t`$\dfrac{d}{dx}\pi^{x} = x\pi^{x - 1}$`, t`$\dfrac{d}{dx}\dfrac{1}{x^3} = \dfrac{1}{3x^2}$`, t`$\dfrac{d}{dx}\sqrt{x} = \tfrac12 x^{1/2}$`],
      answer: 0,
      why: { 1: t`$\pi^x$ has the variable in the *exponent*: it is an exponential, not a power, and the power rule does not apply (its derivative is $\pi^x\ln\pi$).`, 2: t`Rewrite $1/x^3 = x^{-3}$ first: the derivative is $-3x^{-4}$. The power rule does not pass through a denominator.`, 3: t`The exponent must also drop by one: $\tfrac12 x^{-1/2}$.` },
      hints: ['The power rule needs the variable in the base and a constant exponent.'],
      teach: 'The power rule applies to xⁿ with a constant exponent n — any real n, including π — and never to aˣ.',
      explain: t`$\pi$ is just a constant exponent, so $x^\pi$ obeys the power rule. The others misuse it: on an exponential, through a denominator, or without lowering the exponent.`,
    }),
    num({
      id: 'slope-at', difficulty: 2,
      gen(r) {
        const a = r.int(1, 3), b = r.int(1, 9), c = r.int(1, 8), x0 = r.pick([1, 2, -1, -2]);
        const f = (x) => a * x ** 3 - b * x + c / x;
        const d = 3 * a * x0 * x0 - b - c / (x0 * x0);
        const lo = x0 > 0 ? 0.4 : -3.2, hi = x0 > 0 ? 3.2 : -0.4;
        return {
          prompt: t`Find the slope of $y = ${a === 1 ? '' : a}x^3 - ${b}x + \dfrac{${c}}{x}$ at $x = ${x0}$.`,
          answer: d, tol: { rel: 0.002, abs: 0.002 },
          errors: [...(Math.abs(f(x0) - d) > 0.05 ? [{ value: f(x0), feedback: t`That is $y(${x0})$, the height. Differentiate first, then substitute.` }] : []), ...(Math.abs(3 * a * x0 * x0 - b + c / (x0 * x0) - d) > 0.05 ? [{ value: 3 * a * x0 * x0 - b + c / (x0 * x0), feedback: t`$\frac{d}{dx}\frac{${c}}{x} = -\frac{${c}}{x^2}$: the sign is negative.` }] : [])],
          hints: [t`$y' = ${3 * a}x^2 - ${b} - \dfrac{${c}}{x^2}$.`],
          teach: 'Differentiate first, then substitute the point.',
          explain: t`$y'(${x0}) = ${3 * a}(${x0 * x0}) - ${b} - \frac{${c}}{${x0 * x0}} = ${nice(d)}$.`,
          visual: { type: 'graph', params: { x: [lo, hi], y: [Math.min(f(lo), f(hi), f(x0)) - 3, Math.max(f(lo), f(hi), f(x0)) + 3], aspect: 'wide', curves: [{ fn: `${a}*x^3 - ${b}*x + ${c}/x`, color: 'accent' }], points: [{ x: x0, y: f(x0), color: 'gold' }] }, caption: t`The curve near $x = ${x0}$ (it is undefined at $x = 0$).` },
        };
      },
    }),
    num({
      id: 'drag-power', difficulty: 2,
      gen(r) {
        const v = r.pick([20, 25, 30, 35]);
        const k = 0.5 * 1.2 * 0.30 * 2.2, ans = 3 * k * v * v;
        return {
          prompt: t`The power a car spends against air drag is $P(v) = kv^3$, with $k = \tfrac12\rho C_d A = ${nice(k)}$ kg/m (air density $1.2\ \text{kg/m}^3$, drag coefficient $0.30$, frontal area $2.2\ \text{m}^2$). Find $dP/dv$ at $v = ${v}$ m/s — the extra watts needed per extra m/s.`,
          answer: ans, units: 'W s/m', tol: { rel: 0.005 },
          errors: [{ value: k * v ** 3, feedback: t`That is $P$ itself. The question asks for its derivative, $3kv^2$.` }, { value: k * v * v, feedback: t`The power rule brings the exponent down: $\frac{d}{dv}v^3 = 3v^2$.` }],
          hints: [t`$\dfrac{dP}{dv} = 3kv^2$.`],
          teach: 'A cubic power law has a quadratic derivative: each extra m/s costs more power the faster you already go.',
          explain: t`$P'(v) = 3(${nice(k)})(${v})^2 = ${fmt(ans, 4)}$ W per m/s. At $${v}$ m/s drag already takes $${fmt(k * v ** 3)}$ W.`,
          visual: { type: 'graph', params: { x: [0, 42], y: [0, 32000], aspect: 'wide', xlabel: 'v (m/s)', ylabel: 'P (W)', curves: [{ fn: `${k}*x^3`, color: 'accent' }], points: [{ x: v, y: k * v ** 3, color: 'gold' }] }, caption: 'Aerodynamic drag power only, with a constant drag coefficient; rolling resistance and drivetrain losses are left out.' },
        };
      },
    }),
    num({
      id: 'accel', difficulty: 2,
      gen(r) {
        const p = r.pick([0.5, 1, 2]), q = r.int(1, 4), s = r.int(1, 4), tt = r.int(1, 3);
        const acc = 6 * p * tt - 2 * q;
        const vel = 3 * p * tt * tt - 2 * q * tt + s;
        const okA = Math.abs(acc) > 0.1 ? acc : acc + 6 * p;   // avoid a zero answer: move to the next second
        const T2 = Math.abs(acc) > 0.1 ? tt : tt + 1;
        return {
          prompt: t`A cart’s position on a track is $x(t) = ${p === 1 ? '' : nice(p)}t^3 - ${q === 1 ? '' : q}t^2 + ${s === 1 ? '' : s}t$ (metres, seconds). Find its acceleration at $t = ${T2}$ s.`,
          answer: okA, units: 'm/s^2', tol: { rel: 0.003, abs: 0.003 },
          errors: [...(Math.abs(vel - okA) > 0.05 && T2 === tt ? [{ value: vel, feedback: t`That is the velocity $x'(${T2})$. Acceleration is the *second* derivative.` }] : [])],
          hints: [t`$v(t) = x'(t) = ${nice(3 * p)}t^2 - ${2 * q}t + ${s}$.`, t`$a(t) = v'(t) = ${nice(6 * p)}t - ${2 * q}$.`],
          teach: 'Acceleration is the derivative of velocity, the second derivative of position.',
          explain: t`$a(t) = ${nice(6 * p)}t - ${2 * q}$, so $a(${T2}) = ${nice(okA)}\ \text{m/s}^2$.`,
          visual: { type: 'mech-graphlink', params: { x: `${p}*t^3 - ${q}*t^2 + ${s}*t`, T: 4, panels: ['x'], track: 'horizontal', readouts: ['t', 'x'], time: 0 }, caption: 'The cart and its position graph; the velocity and acceleration panels are hidden. Press Play to watch it move.' },
        };
      },
    }),
    mcq({
      id: 'denominator-error', difficulty: 3, kind: 'error',
      prompt: t`A student writes $\dfrac{d}{dx}\left(\dfrac{1}{2x^3}\right) = \dfrac{1}{6x^2}$. What went wrong?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [-1, 4], aspect: 'wide', curves: [{ fn: '1/(2*x^3)', color: 'accent', domain: [0.5, 3] }] }, caption: t`$y = \frac{1}{2x^3}$ for $x > 0$: falling, so its derivative must be negative there — the student’s answer is positive.` },
      choices: [t`They differentiated the denominator; rewrite as $\tfrac12 x^{-3}$, giving $-\tfrac32 x^{-4}$`, t`Nothing: it is correct`, t`Only the sign is wrong: it should be $-\dfrac{1}{6x^2}$`, t`The answer should be $\dfrac{1}{6x^4}$`],
      answer: 0,
      why: { 1: t`The function falls for $x > 0$, so its slope there must be negative; $\frac{1}{6x^2}$ is positive.`, 2: t`The power is wrong too: $x^{-3}$ becomes $x^{-4}$, not $x^{-2}$.`, 3: t`The exponent is right but the sign and the factor are not: $\tfrac12\cdot(-3) = -\tfrac32$.` },
      hints: [t`Write the function as $\tfrac12 x^{-3}$.`, t`Apply the power rule: $\tfrac12\cdot(-3)x^{-4}$.`],
      teach: 'Never differentiate “just the denominator”: rewrite 1/xⁿ as x⁻ⁿ, then use the power rule.',
      explain: t`$\frac{d}{dx}\left(\tfrac12 x^{-3}\right) = -\tfrac32 x^{-4} = -\dfrac{3}{2x^4}$. The student differentiated $2x^3$ to $6x^2$ and left it in the denominator.`,
    }),
    num({
      id: 'horizontal-tangent', difficulty: 2,
      gen(r) {
        const k = r.int(2, 4);
        return {
          prompt: t`At what $x > 0$ does $f(x) = x^3 - ${3 * k * k}x$ have a horizontal tangent?`,
          answer: k, tol: { rel: 1e-6, abs: 0.002 },
          errors: [{ value: k * k, feedback: t`$3x^2 = ${3 * k * k}$ gives $x^2 = ${k * k}$ — take the square root.` }],
          hints: [t`Horizontal tangent: $f'(x) = 0$.`, t`$f'(x) = 3x^2 - ${3 * k * k} = 0$.`],
          teach: t`A horizontal tangent is where $f'(x) = 0$.`,
          explain: t`$3x^2 = ${3 * k * k} \Rightarrow x = \pm${k}$; the positive one is $x = ${k}$, a local minimum.`,
          visual: { type: 'graph', params: { x: [-2.2 * k, 2.2 * k], y: [-3 * k ** 3, 3 * k ** 3], aspect: 'wide', curves: [{ fn: `x^3 - ${3 * k * k}*x`, color: 'accent' }] }, caption: t`$y = x^3 - ${3 * k * k}x$.` },
        };
      },
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-mixed', difficulty: 2,
      gen(r) {
        const a = r.int(1, 4), b = r.pick([3, 6, 9]), c = r.int(1, 5);
        return {
          prompt: t`Differentiate $h(x) = ${a === 1 ? '' : a}x^5 - ${b}x^{2/3} + \dfrac{${c}}{x}$.`,
          lhs: "h'(x)",
          answer: `${5 * a}x^4 - ${(2 * b) / 3}x^(-1/3) - ${c}/x^2`,
          answerTeX: t`${5 * a}x^4 - ${(2 * b) / 3}x^{-1/3} - \frac{${c}}{x^2}`,
          vars: { x: [0.5, 3] }, derivativeOf: `${a}x^5 - ${b}x^(2/3) + ${c}/x`,
          errors: [{ answer: `${5 * a}x^4 - ${(2 * b) / 3}x^(-1/3) + ${c}/x^2`, feedback: t`$\frac{d}{dx}\,${c}x^{-1} = -${c}x^{-2}$: the sign flips.` }],
          hints: [t`Rewrite $\frac{${c}}{x} = ${c}x^{-1}$; $\frac{d}{dx}x^{2/3} = \tfrac23 x^{-1/3}$.`],
          teach: 'Rewrite every term as a power, then apply the power rule term by term.',
          explain: t`$h'(x) = ${5 * a}x^4 - ${(2 * b) / 3}x^{-1/3} - \dfrac{${c}}{x^2}$.`,
          visual: { type: 'graph', params: { x: [0, 1.8], y: [-12, 30], aspect: 'wide', curves: [{ fn: `${a}*x^5 - ${b}*x^(2/3) + ${c}/x`, color: 'accent', domain: [0.1, 1.8] }] }, caption: t`$y = h(x)$ for $x > 0$.` },
        };
      },
    }),
    num({
      id: 'cp-kepler', difficulty: 3, transfer: true,
      gen(r) {
        const [name, a] = r.pick([['a GPS satellite', 26560], ['a geostationary satellite', 42164], ['the Hubble Space Telescope', 6906]]);
        const T = period(a), ans = 1.5 * T / a;
        return {
          prompt: t`Kepler’s third law gives a circular orbit’s period as $T = k\,a^{3/2}$, where $a$ is the orbital radius. For ${name}, $a = ${a}$ km and $T = ${nice(Math.round(T * 10) / 10)}$ min. Find $dT/da$ there, in minutes per km.`,
          answer: ans, units: 'min/km', tol: { rel: 0.005 },
          errors: [{ value: T / a, feedback: t`The power rule brings down the exponent $\tfrac32$: $\frac{dT}{da} = \tfrac32 k a^{1/2} = \tfrac32\,T/a$.` }, { value: (2 / 3) * T / a, feedback: t`The factor is the exponent, $\tfrac32$, not its reciprocal.` }],
          hints: [t`$\dfrac{dT}{da} = \tfrac32 k\,a^{1/2}$. You do not need $k$: divide by $T = k a^{3/2}$.`, t`$\dfrac{dT}{da} = \dfrac32\cdot\dfrac{T}{a}$.`],
          teach: t`For a power law $y = kx^n$, $y' = n\,y/x$: the relative change of $y$ is $n$ times the relative change of $x$.`,
          explain: t`$\dfrac{dT}{da} = \dfrac32\cdot\dfrac{${nice(Math.round(T * 10) / 10)}}{${a}} = ${fmt(ans)}$ min/km: raising the orbit by $10$ km adds about $${fmt(ans * 600, 2)}$ s to the period.`,
          visual: { type: 'graph', params: { x: [0, 46000], y: [0, 1600], aspect: 'wide', xlabel: 'a (km)', ylabel: 'T (min)', curves: [{ fn: `2*pi*sqrt(x^3/${GM})/60`, color: 'accent', domain: [6600, 46000] }], points: [{ x: a, y: T, color: 'gold' }] }, caption: 'Period against orbital radius for circular orbits around Earth (spherical Earth, no drag).' },
        };
      },
    }),
    num({
      id: 'cp-rest', difficulty: 2,
      gen(r) {
        const a = r.int(1, 2), b = r.int(3, 5);
        const B = 1.5 * (a + b), C = 3 * a * b;
        return {
          prompt: t`A particle moves along a line with $x(t) = t^3 - ${nice(B)}t^2 + ${C}t$ (metres, seconds). It is momentarily at rest twice. When is the **second** time?`,
          answer: b, units: 's', tol: { rel: 1e-6, abs: 0.005 },
          errors: [{ value: a, feedback: t`That is the first time it is at rest. The question asks for the later one.` }],
          hints: [t`At rest means $v = x'(t) = 0$.`, t`$x'(t) = 3t^2 - ${nice(2 * B)}t + ${C} = 3(t - ${a})(t - ${b})$.`],
          teach: 'A moving object is momentarily at rest where its position’s derivative is zero.',
          explain: t`$v(t) = 3t^2 - ${nice(2 * B)}t + ${C} = 3(t - ${a})(t - ${b})$, zero at $t = ${a}$ s and $t = ${b}$ s; the second is $${b}$ s.`,
          visual: { type: 'graph', params: { x: [0, b + 1.5], y: [-5, Math.max(...[0, a, b, b + 1.5].map((s) => s ** 3 - B * s * s + C * s)) + 4], aspect: 'wide', xlabel: 't (s)', ylabel: 'x (m)', curves: [{ fn: `x^3 - ${B}*x^2 + ${C}*x`, color: 'accent' }] }, caption: 'Position against time. Where the graph is flat, the particle is at rest.' },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 1, §3.3 Differentiation rules', url: 'https://openstax.org/books/calculus-volume-1/pages/3-3-differentiation-rules' },
  ],
});
