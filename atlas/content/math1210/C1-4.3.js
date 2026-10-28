// Extreme values — where a continuous function on a closed interval is
// largest and smallest: critical points and endpoints, nothing else.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { N, curveFig, fitY } from './_c1kit.js';

const t = String.raw;

// the Explore cubic: local max at x = 1, local min at x = 2
const CUBIC = '2*x^3 - 9*x^2 + 12*x';
const cubic = (x) => 2 * x ** 3 - 9 * x ** 2 + 12 * x;

// max-Q in a toy launch: constant acceleration A from rest, isothermal atmosphere
const RHO0 = 1.225, H = 8500;
const q = (tt, A) => 0.5 * RHO0 * Math.exp(-A * tt * tt / (2 * H)) * (A * tt) ** 2;     // Pa
const Qexpr = (A) => `0.5*${RHO0}*e^(-${A}*x^2/${2 * H})*(${A}*x)^2/1000`;           // kPa

// absolute max and min of f on [a, b] from a list of critical points
function extremes(f, a, b, crit) {
  const xs = [a, b, ...crit.filter((c) => c > a && c < b)];
  const vals = xs.map((x) => [x, f(x)]);
  return { max: vals.reduce((m, v) => (v[1] > m[1] ? v : m)), min: vals.reduce((m, v) => (v[1] < m[1] ? v : m)), vals };
}

export default lesson({
  id: 'math1210.C1-4.3',
  title: 'Extreme values',
  minutes: 10, difficulty: 2,
  intro: t`The **Extreme Value Theorem**: a function that is continuous on a closed interval $[a, b]$ takes on an absolute maximum and an absolute minimum there. And it can only take them at a few places — the **critical points**, where $f'(c) = 0$ or $f'(c)$ does not exist, and the two endpoints:

$$\text{candidates} = \{\,a,\; b\,\} \cup \{\,c \in (a, b) : f'(c) = 0 \text{ or } f'(c) \text{ does not exist}\,\}$$

So the **closed-interval method** is: find the critical points inside the interval, evaluate $f$ at them and at both endpoints, and compare. A physical quantity over a flight, a shift or a burn lives on exactly such an interval — and its worst case is often at an endpoint.`,
  symbols: [
    { tex: '[a, b]', text: 'a closed interval: both endpoints included. Without them the theorem can fail' },
    { tex: 'c', text: 'a **critical point**: an interior point where $f\'(c) = 0$ (a flat tangent) or $f\'(c)$ does not exist (a corner or cusp)' },
    { tex: "f'(c)", text: 'the derivative at $c$' },
    { tex: '\\text{absolute max / min}', text: 'the largest and smallest values of $f$ on the whole interval — not merely compared with nearby points' },
  ],
  why: t`Maximum dynamic pressure on a rocket, the peak temperature of a re-entry shield, the closest approach of two orbits: the design case of almost every engineering load is an extreme value on a closed interval.`,
  visual: {
    type: 'graph',
    title: 'Candidates on a closed interval',
    lead: t`The curve is $f(x) = 2x^3 - 9x^2 + 12x$, which has flat tangents at $x = 1$ and $x = 2$. The sliders choose the interval $[a, b]$; the solid part of the curve is the part that counts. Gold dots mark the endpoints, violet dots the critical points that lie inside.`,
    tasks: [
      t`Set $[0, 3]$: the candidates are $f(0) = 0$, $f(1) = 5$, $f(2) = 4$ and $f(3) = 9$. Both absolute extremes are at endpoints; the local maximum at $1$ is not the absolute one.`,
      t`Set $[0.6, 2.4]$: now both extremes are interior, at the critical points — $f(0.6) = 4.39$ and $f(2.4) = 4.61$ lie between $4$ and $5$.`,
      t`Set $a$ above $1$: the critical point at $1$ drops out of the list, and with it the bump.`,
    ],
    params: {
      x: [-0.7, 3.4], y: [-9.5, 13], aspect: 'wide',
      sliders: [
        { key: 'a', label: t`Left end $a$`, min: -0.5, max: 1.5, step: 0.1, value: 0, explain: t`The interval’s left endpoint, included in the interval.` },
        { key: 'b', label: t`Right end $b$`, min: 1.6, max: 3.2, step: 0.1, value: 3, explain: t`The interval’s right endpoint, included in the interval.` },
      ],
      curves: [{ fn: CUBIC, color: 'ink3', dash: true, width: 1.2 }, { fn: CUBIC, color: 'accent', domain: ['a', 'b'] }],
      vlines: [{ x: 'a', color: 'gold' }, { x: 'b', color: 'gold' }],
      points: [
        { x: 'a', y: '2*a^3 - 9*a^2 + 12*a', color: 'gold', r: 6 },
        { x: 'b', y: '2*b^3 - 9*b^2 + 12*b', color: 'gold', r: 6 },
        { x: 1, y: 5, color: 'violet', r: 6, label: 'f′ = 0', when: 'step(1 - a)*step(b - 1)' },
        { x: 2, y: 4, color: 'violet', r: 6, label: 'f′ = 0', labelDy: 18, when: 'step(2 - a)*step(b - 2)' },
      ],
      readouts: [
        { label: t`$f(a)$`, expr: '2*a^3 - 9*a^2 + 12*a', digits: 3 },
        { label: t`$f(1)$`, expr: '5', digits: 3 },
        { label: t`$f(2)$`, expr: '4', digits: 3 },
        { label: t`$f(b)$`, expr: '2*b^3 - 9*b^2 + 12*b', digits: 3 },
      ],
    },
    caption: t`A cubic chosen for clean critical points; it stands for any smooth quantity tracked over a fixed window. The values $f(1)$ and $f(2)$ count only while those points lie inside $[a, b]$.`,
  },
  example: {
    prompt: t`A toy launch: a rocket rises vertically from rest with constant acceleration $a = 10\ \text{m/s}^2$, through an atmosphere of density $\rho = \rho_0 e^{-h/H}$ ($\rho_0 = 1.225\ \text{kg/m}^3$, $H = 8.5$ km). Its dynamic pressure, the aerodynamic load on its nose, is $q = \tfrac12\rho v^2$. Find the maximum of $q$ during the first $120$ s.`,
    visual: curveFig({ fn: Qexpr(10), x: [-4, 125], y: [-3, 44], xlabel: 't (s)', ylabel: 'q (kPa)', domain: [0, 120], points: [{ x: 0, y: 0, color: 'gold' }, { x: 120, y: q(120, 10) / 1000, color: 'gold' }, { x: N(Math.sqrt(2 * H / 10)), y: q(Math.sqrt(2 * H / 10), 10) / 1000, color: 'violet', label: 'max-Q' }], caption: t`Dynamic pressure against time: it climbs as the rocket speeds up, then falls as the air thins. Constant acceleration and an isothermal atmosphere are simplifications; real launchers throttle back through max-Q, which comes at a few tens of kilopascals, roughly 10 to 14 km up.` }),
    steps: [
      { label: 'Write q in time', text: t`$v = at$ and $h = \tfrac12at^2$, so $q(t) = \tfrac12\rho_0\,a^2t^2\,e^{-at^2/(2H)}$ on the closed interval $[0, 120]$ s. It is continuous, so the maximum exists.` },
      { label: 'Differentiate', text: t`Product and chain rules: $q'(t) = \tfrac12\rho_0a^2\,e^{-at^2/(2H)}\left(2t - \dfrac{at^3}{H}\right)$.` },
      { label: 'Critical points', text: t`The exponential is never zero, so $q' = 0$ needs $t\left(2 - \dfrac{at^2}{H}\right) = 0$: $t = 0$ (an endpoint) or $t^2 = \dfrac{2H}{a} = \dfrac{17\,000}{10}$, so $t = 41.2$ s.` },
      { label: 'Compare the candidates', text: t`$q(0) = 0$. $q(41.2\ \text{s}) = \tfrac12(1.225)(412.3)^2e^{-1} = 38.3$ kPa. $q(120\ \text{s}) = 0.18$ kPa, high in thin air. The largest is the interior critical point: **max-Q is $38$ kPa at $t = 41$ s**.` },
      { label: 'Read the physics', text: t`At $t^2 = 2H/a$ the altitude is $h = \tfrac12at^2 = H$: in this model max-Q always comes at one scale height, $8.5$ km, whatever the acceleration.` },
    ],
    answer: t`$q_{\max} \approx 38$ kPa at $t = \sqrt{2H/a} = 41$ s, altitude $8.5$ km.`,
  },
  practice: [
    mcq({
      id: 'evt-hypotheses', difficulty: 2,
      prompt: t`For which function does the Extreme Value Theorem **guarantee** both an absolute maximum and an absolute minimum?`,
      visual: { type: 'graph', params: { x: [-0.3, 2.3], y: [-0.3, 1.3], aspect: 'wide', curves: [{ fn: 'x', color: 'accent', domain: [0, 0.995] }, { fn: '0', color: 'accent', domain: [1, 2] }], points: [{ x: 1, y: 1, color: 'accent', r: 5, label: 'not included' }, { x: 0, y: 0, color: 'accent' }, { x: 1, y: 0, color: 'accent' }, { x: 2, y: 0, color: 'accent' }] }, caption: t`One of the candidates: $f(x) = x$ for $x < 1$, $0$ for $x \ge 1$, on $[0, 2]$. It climbs toward $1$ but never reaches it.` },
      choices: [t`$x^2$ on $[-1, 2]$`, t`$1/x$ on $(0, 1]$`, t`$\tan x$ on $[0, \pi/2)$`, t`$f(x) = x$ for $x < 1$, $0$ for $x \ge 1$, on $[0, 2]$`],
      answer: 0,
      why: {
        1: t`The interval is not closed: $1/x$ grows without bound as $x \to 0^+$, so there is no maximum.`,
        2: t`The interval is open at $\pi/2$, and $\tan x \to \infty$ there.`,
        3: t`The function is not continuous at $1$: its values approach $1$ but never reach it, so there is no maximum.`,
      },
      hints: ['The theorem needs two things: a continuous function and a closed, bounded interval.'],
      teach: 'Continuity on a closed interval guarantees both extremes; drop either hypothesis and an extreme can go missing.',
      explain: t`$x^2$ is continuous on the closed interval $[-1, 2]$: its maximum is $4$ at $x = 2$ and its minimum $0$ at $x = 0$. Each of the others breaks one hypothesis, and each loses its maximum.`,
    }),
    num({
      id: 'closed-interval', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[-2, 1.5], [-1.5, 3], [0, 2], [-3, 1], [-1.5, 1.5]]), wantMax = r.bool(0.5);
        const f = (x) => x ** 3 - 3 * x;
        const E = extremes(f, a, b, [-1, 1]), ans = wantMax ? E.max[1] : E.min[1];
        const crit = [-1, 1].filter((c) => c > a && c < b).map(f);
        const critOnly = wantMax ? Math.max(...crit) : Math.min(...crit);
        return {
          prompt: t`Find the absolute **${wantMax ? 'maximum' : 'minimum'}** value of $f(x) = x^3 - 3x$ on $[${a}, ${b}]$.`,
          answer: ans, tol: { rel: 0.005, abs: 0.01 },
          errors: Math.abs(critOnly - ans) > 0.01 ? [{ value: critOnly, feedback: t`That is the best critical value. Check the endpoints too: $f(${a}) = ${nice(f(a))}$ and $f(${b}) = ${nice(f(b))}$.` }] : [],
          hints: [t`$f'(x) = 3x^2 - 3 = 0$ at $x = \pm1$. Keep those inside $[${a}, ${b}]$.`, t`Evaluate $f$ at the surviving critical points and at $x = ${a}$ and $x = ${b}$.`],
          teach: 'The closed-interval method: critical points inside, plus both endpoints — then compare values.',
          explain: t`Candidates: ${E.vals.map(([x, v]) => t`$f(${nice(x)}) = ${nice(v, 4)}$`).join(', ')}. The ${wantMax ? 'largest' : 'smallest'} is $${nice(ans, 4)}$, at $x = ${nice(wantMax ? E.max[0] : E.min[0])}$.`,
          visual: curveFig({ fn: 'x^3 - 3*x', x: [-3.4, 3.4], y: [-5, 5], curves: [{ fn: 'x^3 - 3*x', color: 'accent', width: 3, domain: [a, b] }], color: 'ink3', extra: { vlines: [{ x: a, color: 'gold' }, { x: b, color: 'gold' }] }, caption: t`$y = x^3 - 3x$; the interval $[${a}, ${b}]$ lies between the gold lines. Values outside it do not count.` }),
        };
      },
    }),
    mcq({
      id: 'flat-not-extreme', difficulty: 2,
      prompt: t`You find that $f'(c) = 0$. What must be true?`,
      visual: curveFig({ fn: 'x^3', x: [-1.6, 1.6], y: [-2, 2], at: 0, f: (x) => x ** 3, df: (x) => 3 * x * x, span: 0.8, caption: t`$y = x^3$ has a flat tangent at $0$, yet it rises straight through: no maximum or minimum there.` }),
      choices: [t`$c$ is a critical point, which may or may not be an extremum`, t`$f$ has a local maximum or minimum at $c$`, t`$f$ has an absolute extremum at $c$`, t`$f''(c) = 0$`],
      answer: 0,
      why: {
        1: t`$x^3$ at $0$ is the counterexample: a flat tangent where the function keeps climbing.`,
        2: t`Not even a local one is guaranteed — and absolute extremes may be at the endpoints instead.`,
        3: t`$x^2$ has $f'(0) = 0$ but $f''(0) = 2$. The first derivative says nothing about the second.`,
      },
      hints: [t`Think of $y = x^3$ at $x = 0$.`],
      teach: t`$f'(c) = 0$ makes $c$ a candidate, not a winner: an extremum needs a comparison of values, or a sign change of $f'$.`,
      explain: t`A zero derivative marks a **candidate**. At an interior extremum $f'$ must be $0$ (or undefined), but the converse fails, as $x^3$ shows.`,
    }),
    mcq({
      id: 'cusp-candidates', difficulty: 3,
      prompt: t`For $f(x) = x^{2/3}(x - 5)$ on $[-1, 4]$, the derivative is $f'(x) = \dfrac{5(x - 2)}{3x^{1/3}}$. Which list contains **every** candidate for the absolute extremes?`,
      visual: curveFig({ fn: 'cbrt(x)^2*(x - 5)', x: [-1.6, 4.6], y: [-7, 1.5], domain: [-1, 4], caption: t`$y = x^{2/3}(x - 5)$ on $[-1, 4]$. Look closely at $x = 0$: the curve comes to a point.` }),
      choices: [t`$x = -1,\ 0,\ 2,\ 4$`, t`$x = 2$ only`, t`$x = 0$ and $x = 2$`, t`$x = -1$ and $x = 4$`],
      answer: 0,
      why: {
        1: t`$x = 2$ is where $f' = 0$, but $f'$ is also **undefined** at $x = 0$ (a cusp), and the endpoints always count.`,
        2: t`Those are the critical points; the endpoints $-1$ and $4$ are candidates too — and here the minimum is at $x = -1$.`,
        3: t`The endpoints alone miss the interior critical points; here the maximum is at the cusp, $x = 0$.`,
      },
      hints: [t`Where is $f' = 0$? Where is $f'$ undefined?`, t`Then add both endpoints.`],
      teach: t`Critical points include where $f'$ does not exist — corners and cusps — as well as where it is zero.`,
      explain: t`$f'(2) = 0$; $f'(0)$ is undefined; plus the endpoints. Values: $f(-1) = -6$, $f(0) = 0$, $f(2) = -4.76$, $f(4) = -2.52$. The maximum, $0$, is at the cusp; the minimum, $-6$, at an endpoint.`,
    }),
    num({
      id: 'moon-hop', difficulty: 2,
      gen(r) {
        const v0 = r.pick([4, 6, 8]), T = r.pick([2, 3, 4, 6]), g = 1.62;
        const apex = v0 / g, h = (tt) => v0 * tt - 0.5 * g * tt * tt;
        const ans = T < apex ? h(T) : h(apex);
        const errs = T < apex ? [{ value: h(apex), feedback: t`That is the apex height, but the apex comes at $t = ${nice(apex, 3)}$ s — after the window closes. Here the maximum is at the endpoint $t = ${T}$ s.` }] : [{ value: h(T), feedback: t`That is the height at the end of the window. The apex, at $t = ${nice(apex, 3)}$ s, lies inside the window and is higher.` }];
        return {
          prompt: t`A small lunar hopper leaves the ground at $${v0}$ m/s straight up; its height is $h(t) = ${v0}t - 0.81t^2$ m (lunar gravity $1.62\ \text{m/s}^2$). What is the greatest height it reaches during the first $${T}$ s?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: errs,
          hints: [t`Critical point: $h'(t) = ${v0} - 1.62t = 0$ at $t = ${nice(apex, 3)}$ s. Is that inside $[0, ${T}]$?`, t`Compare $h$ at the endpoints $0$ and $${T}$ s, and at the critical point if it is inside.`],
          teach: 'A maximum on a time window can sit at the end of the window, if the turning point comes later.',
          explain: T < apex ? t`The apex at $${nice(apex, 3)}$ s is outside $[0, ${T}]$, so $h$ rises throughout and the maximum is $h(${T}) = ${nice(ans, 4)}$ m.` : t`The apex at $${nice(apex, 3)}$ s is inside $[0, ${T}]$: $h = ${nice(ans, 4)}$ m, above both $h(0) = 0$ and $h(${T}) = ${nice(h(T), 4)}$ m.`,
          visual: { type: 'graph', params: { x: [-0.3, 10.5], y: [-2, 21], aspect: 'wide', xlabel: 't (s)', ylabel: 'h (m)', curves: [{ fn: `${v0}*x - 0.81*x^2`, color: 'ink3', dash: true, width: 1.2, domain: [0, 2 * apex] }, { fn: `${v0}*x - 0.81*x^2`, color: 'accent', domain: [0, T] }], vlines: [{ x: T, color: 'gold', label: `${T} s` }] }, caption: t`The whole hop (dashed) and the window $[0, ${T}]$ s (solid). No air on the Moon, so the path is an exact parabola in time.` },
        };
      },
    }),
    num({
      id: 'max-q-time', difficulty: 2,
      gen(r) {
        const A = r.pick([12, 15, 20, 25]);
        const ans = Math.sqrt(2 * H / A);
        return {
          prompt: t`In the toy launch of the worked example, $q(t) = \tfrac12\rho_0a^2t^2e^{-at^2/(2H)}$ with $H = 8500$ m. A more powerful rocket accelerates at $a = ${A}\ \text{m/s}^2$. At what time does it pass max-Q?`,
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(H / A), feedback: t`Setting $2t - \dfrac{at^3}{H} = 0$ gives $t^2 = \dfrac{2H}{a}$ — keep the factor 2.` }, { value: 2 * H / A, feedback: t`That is $t^2$. Take the square root.` }],
          hints: [t`$q'(t) = 0$ when $2t - \dfrac{at^3}{H} = 0$.`, t`For $t > 0$: $t = \sqrt{2H/a}$.`],
          teach: t`Set the derivative to zero, discard the factor that never vanishes (the exponential), and solve what is left.`,
          explain: t`$t = \sqrt{\dfrac{2\times 8500}{${A}}} = ${nice(ans, 3)}$ s, when the rocket is again at $h = H = 8.5$ km — sooner than the $41$ s of the slower rocket, and at a higher $q$ of $${nice(q(ans, A) / 1000, 3)}$ kPa.`,
          visual: curveFig({ fn: Qexpr(A), x: [-3, 92], y: fitY((x) => q(x, A) / 1000, 0, 90), xlabel: 't (s)', ylabel: 'q (kPa)', domain: [0, 92], caption: t`Dynamic pressure against time at $a = ${A}\ \text{m/s}^2$, in the same toy model: constant acceleration, isothermal air.` }),
        };
      },
    }),
    mcq({
      id: 'find-error-endpoints', difficulty: 3, kind: 'error',
      prompt: t`A student finds the absolute maximum of $f(x) = x^3 - 3x$ on $[-2, 3]$: “$f'(x) = 3x^2 - 3 = 0$ at $x = \pm1$. $f(-1) = 2$ and $f(1) = -2$, so the maximum is $2$.” What is wrong?`,
      visual: curveFig({ fn: 'x^3 - 3*x', x: [-2.4, 3.4], y: [-3.5, 19.5], domain: [-2, 3], caption: t`$y = x^3 - 3x$ on the whole interval $[-2, 3]$.` }),
      choices: [
        t`The endpoints were not checked: $f(3) = 18$ is the maximum`,
        t`$x = 1$ is the maximum, because $f'(1) = 0$ too`,
        t`$f(-2)$ is larger: the maximum is at the left endpoint`,
        t`$x^3$ grows without bound, so there is no maximum`,
      ],
      answer: 0,
      why: {
        1: t`$f(1) = -2$ is a local **minimum**. A zero derivative alone does not make a maximum.`,
        2: t`$f(-2) = -8 + 6 = -2$, smaller than $2$. It is the right endpoint that wins.`,
        3: t`On a closed interval a continuous function always has a maximum (Extreme Value Theorem); only on the whole real line does $x^3$ grow forever.`,
      },
      hints: [t`The closed-interval method has two kinds of candidate. Which kind was skipped?`, t`Evaluate $f(-2)$ and $f(3)$.`],
      teach: 'Never skip the endpoints: on a closed interval they are candidates as much as the critical points are.',
      explain: t`Candidates: $f(-2) = -2$, $f(-1) = 2$, $f(1) = -2$, $f(3) = 18$. The maximum is $18$ at the endpoint $x = 3$; the minimum $-2$ is shared by $x = -2$ and $x = 1$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-quartic', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[-1, 3], [-3, 1], [1, 3], [-2.5, 2.5], [-1, 2.5]]), wantMax = r.bool(0.5);
        const f = (x) => x ** 4 - 8 * x * x;
        const E = extremes(f, a, b, [-2, 0, 2]), ans = wantMax ? E.max[1] : E.min[1];
        return {
          prompt: t`Find the absolute **${wantMax ? 'maximum' : 'minimum'}** value of $f(x) = x^4 - 8x^2$ on $[${a}, ${b}]$.`,
          answer: ans, tol: { rel: 0.005, abs: 0.01 },
          hints: [t`$f'(x) = 4x^3 - 16x = 4x(x - 2)(x + 2)$.`],
          teach: 'Critical points inside, both endpoints, compare.',
          explain: t`Candidates: ${E.vals.map(([x, v]) => t`$f(${nice(x)}) = ${nice(v, 4)}$`).join(', ')}. The ${wantMax ? 'maximum' : 'minimum'} is $${nice(ans, 4)}$.`,
          visual: curveFig({ fn: 'x^4 - 8*x^2', x: [-3.4, 3.4], y: [-19, 26], color: 'ink3', curves: [{ fn: 'x^4 - 8*x^2', color: 'accent', width: 3, domain: [a, b] }], extra: { vlines: [{ x: a, color: 'gold' }, { x: b, color: 'gold' }] }, caption: t`$y = x^4 - 8x^2$; the interval $[${a}, ${b}]$ lies between the gold lines.` }),
        };
      },
    }),
    num({
      id: 'cp-apogee', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([11000, 13000, 15000]), e = r.pick([0.1, 0.3, 0.5, 0.6]);
        const rmax = p / (1 - e), ans = rmax - 6371;
        return {
          prompt: t`A satellite’s distance from Earth’s centre is $r(\theta) = \dfrac{${String(p).replace(/(\d{3})$/, '\\,$1')}}{1 + ${e}\cos\theta}$ km, where $\theta$ is its angle around the orbit, $0 \le \theta \le 2\pi$. Find its greatest **altitude** above the surface, taking Earth’s radius as $6371$ km.`,
          answer: ans, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: rmax, feedback: t`That is the distance from Earth’s **centre**. Subtract the radius, $6371$ km, for the altitude.` }, { value: p / (1 + e) - 6371, feedback: t`That is the **lowest** point, at $\theta = 0$, where the denominator is largest.` }],
          hints: [t`$r'(\theta) = \dfrac{${String(p).replace(/(\d{3})$/, '\\,$1')}\cdot ${e}\sin\theta}{(1 + ${e}\cos\theta)^2}$, zero at $\theta = 0$, $\pi$ and $2\pi$.`, t`$r$ is largest where $1 + ${e}\cos\theta$ is smallest: at $\theta = \pi$, $r = \dfrac{${String(p).replace(/(\d{3})$/, '\\,$1')}}{1 - ${e}}$.`],
          teach: 'Extremes of a periodic quantity over one full period sit at its critical points — here perigee and apogee.',
          explain: t`Candidates: $r(0) = r(2\pi) = ${nice(p / (1 + e), 5)}$ km and $r(\pi) = ${nice(rmax, 5)}$ km. Apogee altitude $= ${nice(rmax, 5)} - 6371 = ${nice(ans, 5)}$ km.`,
          visual: curveFig({ fn: `${p}/(1 + ${e}*cos(x))`, x: [-0.3, 6.6], y: [0, 1.15 * rmax], xlabel: 'θ (rad)', ylabel: 'r (km)', domain: [0, 2 * Math.PI], extra: { hlines: [{ y: 6371, label: 'Earth’s surface' }] }, caption: t`Distance from Earth’s centre around one orbit: a Kepler ellipse with Earth at a focus. No drag, no perturbations.` }),
        };
      },
    }),
    mcq({
      id: 'cp-no-critical', difficulty: 2,
      prompt: t`A thrust profile $F(t)$ is continuous on $[0, 8]$ s and differentiable inside, and $F'(t) \ne 0$ everywhere in $(0, 8)$. Where are its absolute maximum and minimum?`,
      visual: curveFig({ fn: '200 + 100*(1 - e^(-x/2))', x: [-0.4, 8.6], y: [180, 320], xlabel: 't (s)', ylabel: 'F (kN)', domain: [0, 8], caption: t`One profile that fits: thrust rising throughout the window.` }),
      choices: ['At the endpoints, t = 0 s and t = 8 s', 'Nowhere: with no critical point there are no extremes', 'At the midpoint, t = 4 s', 'It cannot be decided without the formula'],
      answer: 0,
      why: {
        1: t`The Extreme Value Theorem still guarantees both extremes; with no interior critical point they can only be at the endpoints.`,
        2: t`At an interior extremum the derivative would have to be $0$, and it never is.`,
        3: t`The formula decides which endpoint is the maximum, but not that the extremes are at the endpoints — that is already settled.`,
      },
      hints: ['List the candidates of the closed-interval method. Which are left?'],
      teach: 'With no critical points inside, the only candidates left are the endpoints.',
      explain: t`The candidates are critical points and endpoints; there are no critical points, so both extremes are at $t = 0$ and $t = 8$ s. Since $F'$ never changes sign, $F$ is monotone — rising here, so the minimum is at $0$ and the maximum at $8$ s.`,
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 1, §4.3 Maxima and minima', url: 'https://openstax.org/books/calculus-volume-1/pages/4-3-maxima-and-minima' }],
});
