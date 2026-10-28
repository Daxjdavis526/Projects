// Domains of dependence and causality for the wave equation: the value at
// (x0, t0) depends only on data in [x0 − ct0, x0 + ct0]; data at a point
// influence only the cone |x − x1| ≤ ct. Finite propagation speed — the 1D
// light cone — against the heat equation, which depends on everything.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, xtPlane, SRC } from './_pde.js';

const t = String.raw;
const AU = 1.495978707e11, C = 2.99792458e8;

export default lesson({
  id: 'st-b.B3.3',
  title: 'Domains of dependence and causality',
  minutes: 11, difficulty: 2,
  intro: t`Read d’Alembert’s formula backwards. The value $u(x_0, t_0)$ uses $f$ at the two points $x_0 \pm ct_0$ and $g$ on the interval between them — and **nothing else**. Change the initial data anywhere outside

$$[\,x_0 - c\,t_0,\; x_0 + c\,t_0\,]$$

and $u(x_0, t_0)$ does not notice. In the $x$–$t$ plane this interval is the base of a triangle bounded by the two characteristics through $(x_0, t_0)$: the **domain of dependence**. Turned around, data at a point $x_1$ can affect only the wedge $|x - x_1| \le ct$, its **range of influence**. Signals travel at speed $c$ and no faster. In relativity these triangles are light cones, and causality — no influence outside the future light cone — is exactly this property of the wave equation’s characteristics.`,
  symbols: [
    { tex: t`(x_0, t_0)`, text: 'an event: a place and a time at which you ask for $u$' },
    { tex: t`x_0 \pm c\,t_0`, text: 'the feet of the two characteristics through it: the ends of its domain of dependence' },
    { tex: 'c', text: 'the wave speed (m/s): the maximum speed at which anything about $u$ can travel' },
    { tex: t`|x - x_1| \le c\,t`, text: 'the range of influence of the data at $x_1$: a wedge opening upward at slope $1/c$' },
  ],
  why: t`Every statement about causality in relativity — horizons, the domain of dependence of an initial-data slice in numerical relativity, why nothing escapes a black hole — is this geometry of characteristic cones, in curved spacetime.`,
  visual: {
    type: 'pde-player',
    title: 'The probe and its cone',
    lead: t`Drag the gold probe to any event $(x, t)$. For the wave equation, the gold triangle is its domain of dependence: only the initial data on its base matter. Switch to the heat equation and the dependence covers the whole line.`,
    tasks: [
      'Put the probe in an unshaded region: its cone misses the initial pulse entirely, so u there is exactly zero.',
      'Raise the probe: its cone widens at slope 1/c — later events depend on more of the initial line.',
      'Switch to heat: there is no cone. The probe’s value depends on the initial data everywhere, however far away.',
    ],
    params: { mode: 'wave', modes: ['wave', 'heat'], init: 'pluck', profile: 'box', w: 1, c: 2, D: 0.5, x: [-10, 10], tmax: 4, t: 1, probe: [5, 1.5], controls: ['mode', 'c', 'D', 't'] },
    caption: t`Exact solutions on an infinite line; the initial data are a square pulse on $|x| < 1$. The triangle is drawn for the wave equation only; the heat equation has no finite domain of dependence.`,
  },
  example: {
    prompt: t`A long string ($c = 2$ m/s) is disturbed at $t = 0$ only on the stretch $2 \le x \le 3$ m. A sensor sits at $x = 10$ m. When does it first feel anything, and when does it stop changing? Compare a string that was only displaced there with one that was only struck.`,
    visual: xtPlane({ x: [0, 12], y: [0, 6], xticks: 12, yticks: 6, xlabel: 'x (m)', ylabel: 't (s)',
      shade: [{ fn: '6', lower: 'max(0, max((2 - x)/2, (x - 3)/2))', from: -10, to: 20, color: 'gold', alpha: 0.18 }],
      curves: [{ fn: '(x - 3)/2', color: 'violet', width: 2, domain: [3, 12] }, { fn: '(x - 2)/2', color: 'violet', width: 2, domain: [2, 12] }],
      vlines: [{ x: 10, label: 'sensor', color: 'gold' }], points: [{ x: 10, y: 3.5, label: 'first signal', color: 'accent', labelDx: -86 }, { x: 10, y: 4, label: 'last change', color: 'accent', labelDx: -86, labelDy: -2 }] },
      t`The range of influence of the disturbed stretch (shaded): it grows by $c = 2$ m/s each way. The right-moving edge characteristics from $x = 3$ and $x = 2$ (violet) cross the sensor’s line at 3.5 s and 4 s.`),
    steps: [
      { label: 'Range of influence', text: t`Data on $[2, 3]$ can affect only $2 - 2t \le x \le 3 + 2t$. The sensor at $x = 10$ is inside once $3 + 2t \ge 10$: $t = 3.5$ s. Before that its reading is exactly unchanged.` },
      { label: 'Displaced only', text: t`With $g = 0$, $u(10, t) = \tfrac12 f(10 - 2t) + \tfrac12 f(10 + 2t)$. Only the first term can be nonzero, and only while $2 \le 10 - 2t \le 3$: from $t = 3.5$ to $4$ s. The right-moving half passes and the sensor returns to zero.` },
      { label: 'Struck only', text: t`With $f = 0$, $u(10, t) = \tfrac{1}{4}\int_{10 - 2t}^{10 + 2t} g\,ds$. Once $10 - 2t \le 2$ (after $t = 4$ s) the interval contains the whole kick, and $u$ stays at $\tfrac14\int_2^3 g\,ds$ **for ever**.` },
      { label: 'Lesson', text: t`Nothing arrives early in either case: causality. But in one dimension a kick leaves a permanent wake behind its front, while a displacement passes cleanly by. (In three dimensions both pass cleanly — Huygens’ principle, which is why we hear sharp sounds; module B9.)` },
    ],
    answer: t`First signal at $t = 3.5$ s. The displaced string’s sensor changes only for $3.5 \le t \le 4$ s; the struck string’s sensor changes from 3.5 s on and stays displaced after 4 s.`,
  },
  practice: [
    num({
      id: 'left-end', difficulty: 1,
      gen(r) {
        const c = r.pick([1, 2, 3]), x0 = r.pick([2, 4, 6]), t0 = r.pick([1, 1.5, 2]);
        const a = x0 - c * t0;
        return {
          prompt: t`For $u_{tt} = ${c * c}u_{xx}$ (so $c = ${c}$ m/s), $u(${x0}, ${t0})$ depends on the initial data on an interval $[a, b]$. Find $a$, in metres.`,
          visual: xtPlane({ x: [-6, 12], y: [0, 3], xticks: 9, yticks: 3, xlabel: 'x (m)', ylabel: 't (s)', points: [{ x: x0, y: t0, label: `(${x0}, ${t0})`, color: 'gold' }] }, 'The event in the x–t plane.'),
          answer: a, units: 'm', tol: { rel: 0, abs: 0.05 },
          errors: [{ value: x0 - c * c * t0, feedback: t`The speed is $c = ${c}$, the square root of the coefficient $${c * c}$.` }, { value: x0 + c * t0, feedback: 'That is the right end, b.' }].filter((e) => e.value !== a),
          hints: [t`The interval is $[x_0 - ct_0,\ x_0 + ct_0]$.`],
          teach: 'The domain of dependence of (x₀, t₀) is [x₀ − ct₀, x₀ + ct₀].',
          explain: t`$a = x_0 - ct_0 = ${x0} - ${c}(${t0}) = ${a}$ m, and $b = ${x0 + c * t0}$ m.`,
        };
      },
    }),
    num({
      id: 'first-arrival', difficulty: 2,
      gen(r) {
        const c = r.pick([5, 20, 50]), b = r.pick([1, 2]), d = r.pick([30, 60, 100]);
        const xs = b + d, T = d / c;
        return {
          prompt: t`A long cable ($c = ${c}$ m/s) is disturbed at $t = 0$ only on $0 \le x \le ${b}$ m. A sensor at $x = ${xs}$ m reads exactly zero until when? Give $t$ in seconds.`,
          visual: xtPlane({ x: [-2, xs + 5], y: [0, 1.6 * T], xticks: 8, yticks: 4, xlabel: 'x (m)', ylabel: 't (s)', shade: [{ fn: `${1.6 * T}`, lower: `max(0, (x - ${b})/${c}, -x/${c})`, from: -2, to: xs + 5, color: 'gold', alpha: 0.18 }], vlines: [{ x: xs, label: 'sensor', color: 'gold' }] }, 'The range of influence of the disturbed stretch (shaded), and the sensor’s position.'),
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: xs / c, feedback: t`Measure from the nearest disturbed point, $x = ${b}$ m, not from $x = 0$.` }].filter((e) => Math.abs(e.value - T) > 0.03 * T),
          hints: ['The earliest signal comes from the nearest end of the disturbed stretch.', t`$t = (x_s - ${b})/c$.`],
          teach: 'Nothing reaches a point before the nearest data, travelling at c, could get there.',
          explain: t`The range of influence reaches $x = ${xs}$ when $${b} + ${c}t = ${xs}$: $t = ${d}/${c} = ${tex(T)}$ s. Before that, $u$ there is exactly zero — not small, zero.`,
        };
      },
    }),
    mcq({
      id: 'which-feels', difficulty: 2,
      prompt: t`Initial data are nonzero only on the gold stretch $[-1, 1]$; $c = 1$. Which of the marked events is **guaranteed** to have $u = 0$?`,
      visual: xtPlane({ x: [-6, 6], y: [0, 4], xticks: 12, yticks: 4, xlabel: 'x (m)', ylabel: 't (s)', curves: [{ fn: '0*x', color: 'gold', width: 6, domain: [-1, 1] }],
        points: [{ x: 4.5, y: 3, label: 'P' }, { x: 3.5, y: 3, label: 'Q', labelDy: 14 }, { x: 0, y: 3.5, label: 'R' }, { x: -2, y: 2, label: 'S' }] }, t`The disturbed stretch at $t = 0$ (gold) and four events.`),
      choices: ['P', 'Q', 'R', 'S'],
      answer: 0,
      why: {
        1: t`Q = (3.5, 3) has $|x| = 3.5 < 1 + 3 = 4$: it is inside the range of influence.`,
        2: 'R is right above the data, deep inside the range of influence.',
        3: t`S = (−2, 2) has $|x| = 2 < 1 + 2$: inside.`,
      },
      hints: [t`An event feels the data only if its domain of dependence $[x - t, x + t]$ overlaps $[-1, 1]$.`],
      teach: 'An event is untouched by data whose range of influence does not reach it.',
      explain: t`P = (4.5, 3): its domain of dependence is $[1.5, 7.5]$, which misses $[-1, 1]$, so $u = 0$ there exactly. The other events’ intervals overlap the data. (Being inside does not force $u \ne 0$ — inside the cone of a pluck, $u$ can be zero again — but outside it must be zero.)`,
    }),
    mcq({
      id: 'wake', difficulty: 2,
      prompt: t`A long string is struck (given a sideways velocity) on a short stretch, without being displaced. Long after the waves have passed a distant sensor, what does the sensor read?`,
      visual: player({ mode: 'wave', init: 'strike', profile: 'box', w: 0.8, c: 2, t: 3.5, tmax: 4, x: [-10, 10], probe: [6, 3.5] }, t`A struck string with a probe at $x = 6$ m, $t = 3.5$ s; below, its domain of dependence (gold) contains the whole kicked stretch.`),
      choices: ['a constant, nonzero displacement', 'zero: the wave has passed', 'an oscillation that never dies out', 'a displacement that slowly decays back to zero'],
      answer: 0,
      why: {
        1: 'That is true of a displaced (plucked) string; a struck one leaves a wake.',
        2: 'Nothing on an ideal infinite string oscillates in place after the fronts pass.',
        3: 'The ideal wave equation has no decay; the plateau stays until reflections or damping change it.',
      },
      hints: [t`$u = \tfrac{1}{2c}\int_{x - ct}^{x + ct} g\,ds$. Once the interval contains the whole kick, what is it?`],
      teach: 'In 1D, velocity data fill the whole interior of the light cone: a kick leaves a permanent plateau.',
      explain: t`Once $[x - ct, x + ct]$ contains the struck stretch, $u = \tfrac{1}{2c}\int g\,ds$ — a constant. One-dimensional waves from velocity data have a wake; in three dimensions they would not (Huygens’ principle).`,
    }),
    {
      type: 'point', id: 'earliest', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 2]), x1 = r.pick([0, 1]), xs = r.pick([5, 6, 7]);
        const T = (xs - x1) / c;
        return {
          prompt: t`With $c = ${c}$ m/s, a disturbance starts at the single point $x = ${x1}$ m at $t = 0$. Drag the point to the **earliest** event at $x = ${xs}$ m that it can influence.`,
          instruction: 'Drag the point to the earliest event at that position the disturbance can reach, then check.',
          answer: { x: xs, y: T }, tol: { x: 0.2, y: 0.15 },
          visual: xtPlane({ x: [-1, 8], y: [0, 7], xticks: 9, yticks: 7, xlabel: 'x (m)', ylabel: 't (s)', points: [{ x: x1, y: 0, label: 'source', color: 'gold' }], vlines: [{ x: xs, color: 'ink3' }], drag: [{ key: 'p', x: 3, y: 5, snap: 0.1 }] }, t`The source event and the line $x = ${xs}$ m.`),
          hints: ['The range of influence is bounded by the characteristics leaving the source.', t`The right-hand one is $x = ${x1} + ${c}t$.`],
          teach: 'The edge of the range of influence is the characteristic leaving the source at speed c.',
          explain: t`The right-moving characteristic reaches $x = ${xs}$ at $t = (${xs} - ${x1})/${c} = ${tex(T)}$ s: the event $(${xs}, ${tex(T)})$. Earlier events at that place lie outside the cone.`,
        };
      },
    },
    mcq({
      id: 'heat-contrast', difficulty: 2,
      prompt: t`For the heat equation $u_t = D\,u_{xx}$ on the whole line, which initial data does $u(x_0, t_0)$ depend on, for $t_0 > 0$?`,
      visual: player({ mode: 'heat', profile: 'box', w: 1, D: 0.5, t: 1, tmax: 3, x: [-10, 10], probe: [6, 1.5] }, 'The heat equation from a square pulse, with a probe at x = 6 m: its value depends on the initial temperature everywhere (shaded below).'),
      choices: [t`on all of it, everywhere on the line`, t`on the data in $[x_0 - Dt_0,\ x_0 + Dt_0]$`, t`on the data within $\sqrt{2Dt_0}$ of $x_0$ only`, t`only on $u(x_0, 0)$`],
      answer: 0,
      why: {
        1: t`$D$ is not a speed (it has units m²/s), and the heat equation has no characteristics to bound a cone.`,
        2: t`$\sqrt{2Dt_0}$ is how far heat typically spreads, but the kernel $e^{-x^2/4Dt}$ is never exactly zero: far data contribute, very weakly.`,
        3: 'That would be a law with no spatial coupling at all.',
      },
      hints: [t`The solution is $\int \Phi(x_0 - y, t_0)\,f(y)\,dy$ with the Gaussian kernel $\Phi$. Where is $\Phi$ zero?`],
      teach: 'The heat equation has an infinite domain of dependence: no cone, no finite signal speed.',
      explain: t`$u(x_0, t_0) = \int \Phi(x_0 - y, t_0)f(y)\,dy$, and the Gaussian kernel is positive for every $y$. Change $f$ anywhere and $u(x_0, t_0)$ changes, if only by an astronomically small amount — infinite propagation speed (lesson B4.3).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mars', difficulty: 2, transfer: true,
      gen(r) {
        const d = r.pick([0.52, 1.0, 1.52, 2.52]);
        const T = (d * AU) / C / 60;
        return {
          prompt: t`Mars is ${d} AU from Earth. Mission control sends a command at $t = 0$. What is the earliest time, in minutes, at which anything Earth does at $t = 0$ can affect the rover? (1 AU = $1.496\times10^{11}$ m, $c = 2.998\times10^8$ m/s.)`,
          visual: { type: 'graph', params: { x: [-0.5, 3], y: [0, 26], aspect: 'wide', xlabel: 'distance from Earth (AU)', ylabel: 't (min)', axesAt: 'edge', shade: [{ fn: '26', lower: `max(0, x*${AU / C / 60})`, from: 0, to: 3, color: 'gold', alpha: 0.15 }], curves: [{ fn: `x*${AU / C / 60}`, color: 'gold', width: 2, domain: [0, 3] }], vlines: [{ x: d, label: 'Mars', color: 'warn' }] }, caption: 'The future light cone of an event on Earth (shaded): Mars is affected only inside it. Planetary motion during the trip is neglected.' },
          answer: T, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: 2 * T, feedback: 'That is the round trip; the question asks one way.' }, { value: T * 60, feedback: 'That is in seconds.' }],
          hints: ['Nothing travels faster than light: the edge of the light cone is the first possible influence.', t`$t = d/c$ with $d$ in metres.`],
          teach: 'Causality: an event can influence only its future light cone.',
          explain: t`$t = \dfrac{${d}\times1.496\times10^{11}}{2.998\times10^8} \approx ${tex(T * 60)}$ s $\approx ${tex(T)}$ min. A rover must act on its own for at least twice that long before any reply to its report can arrive.`,
        };
      },
    }),
    num({
      id: 'cp-ligo', difficulty: 2, transfer: true,
      prompt: t`The two LIGO detectors, at Hanford and Livingston, are 3002 km apart. Gravitational waves travel at the speed of light. What is the largest possible difference between the arrival times of one wave at the two sites, in milliseconds?`,
      visual: { type: 'graph', params: { x: [-1.5, 4.5], y: [0, 15], aspect: 'wide', xlabel: 'position (1000 km)', ylabel: 't (ms)', axesAt: 'edge', curves: [{ fn: `(x + 1)*1e6/${C}*1000`, color: 'gold', width: 2, domain: [-1, 4.5], label: 'wavefront along the baseline', labelAt: 2.6, labelDy: -12 }], vlines: [{ x: 0, label: 'Hanford', color: 'accent' }, { x: 3.002, label: 'Livingston', color: 'accent' }] }, caption: 'A wavefront arriving along the line joining the detectors gives the greatest delay; from any other direction the delay is shorter. The Earth’s curvature is ignored (the true straight-line distance is used).' },
      answer: 3002e3 / C * 1000, units: 'ms', tol: { rel: 0.01 },
      errors: [{ value: 3002e3 / C, feedback: 'That is in seconds.' }],
      hints: ['The delay is greatest when the wave travels along the line from one site to the other.', t`$\Delta t = d/c$.`],
      teach: 'Arrival-time differences at separated detectors are bounded by the light travel time between them.',
      explain: t`$\Delta t_{\max} = \dfrac{3.002\times10^6}{2.998\times10^8} \approx 10.0$ ms. GW150914 arrived at Livingston 6.9 ms before Hanford — inside the bound, as causality requires, and the difference helped locate the source on the sky.`,
    }),
    num({
      id: 'cp-region', difficulty: 2,
      gen(r) {
        const a = r.pick([-1, 0]), b = r.pick([1, 2]), c = r.pick([3, 4]), T = r.pick([1, 2]);
        const len = b - a + 2 * c * T;
        return {
          prompt: t`At $t = 0$ a long string is disturbed only on $${a} \le x \le ${b}$ m, and $c = ${c}$ m/s. At $t = ${T}$ s, how long is the stretch of string that could possibly be disturbed, in metres?`,
          visual: xtPlane({ x: [-12, 12], y: [0, 2.5], xticks: 12, yticks: 5, xlabel: 'x (m)', ylabel: 't (s)', curves: [{ fn: '0*x', color: 'gold', width: 6, domain: [a, b] }] }, t`The disturbed stretch at $t = 0$.`),
          answer: len, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: b - a + c * T, feedback: 'The influence spreads both ways: each end moves out by ct.' }, { value: 2 * c * T, feedback: 'Add the length of the initially disturbed stretch.' }],
          hints: [t`The range of influence of $[a, b]$ at time $t$ is $[a - ct,\ b + ct]$.`],
          teach: 'A disturbed region grows by ct at each end.',
          explain: t`$[${a} - ${c * T},\ ${b} + ${c * T}] = [${a - c * T}, ${b + c * T}]$: length $${len}$ m.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, SRC.evans, { label: 'LIGO Scientific and Virgo Collaborations, Observation of gravitational waves from a binary black hole merger, Phys. Rev. Lett. 116, 061102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' }],
});
