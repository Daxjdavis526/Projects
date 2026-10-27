// Why gravity must be curvature: the tower argument — Derivation Mode.
// Schild's argument: energy conservation forces a redshift for light climbing
// a tower; in a flat, static spacetime with the tower at rest in an inertial
// frame, two pulses travel congruent worldlines and arrive as far apart as
// they left — no redshift. Contradiction. Keeping the static picture, clocks
// must tick at height-dependent rates, √(−g₀₀) with g₀₀ = −(1 + 2Φ/c²); that
// alone could still be flat spacetime in accelerated coordinates (Marsh &
// Nissim-Sabat), but a field that points different ways in different places
// — tides — cannot be: that is curvature. Then maximal aging with this g₀₀
// gives back Newton's free fall.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { C, GM_EARTH, R_EARTH, GM_SUN, g0, AU, sci, round } from './_deriv.js';

const t = String.raw;

// the tower diagram: height z across (0 to 1), coordinate time t up (c = 1, h = 1), metric
// ds² = −(1 + k z) dt² + dz² with k = 2gh/c² (exaggerated). Light climbs along t(z) = 2z/(√(1 + kz) + 1);
// the bottom clock ticks every unit of t, the top clock every 1/√(1 + k).
const E1 = 0.5, E2 = 1.5;            // emission times of the two pulses at the bottom
function towerParams(extra = {}) {
  const pulse = (te) => ({ param: ['t', `${te} + 2*t/(sqrt(1 + k*t) + 1)`], t: [0, 1], color: 'gold', width: 2.2 });
  const arrive = (te) => `${te} + 2/(sqrt(1 + k) + 1)`;
  const ticks = [];
  for (let n = 1; n <= 3; n++) ticks.push({ x: 0, y: n, color: 'accent', r: 3.5 });
  for (let n = 1; n <= 6; n++) ticks.push({ x: 1, y: `${n}/sqrt(1 + k)`, color: 'violet', r: 3.5, when: `step(3.25 - ${n}/sqrt(1 + k))` });
  return {
    x: [-0.65, 1.65], y: [0, 3.3], equal: true, axesAt: 'edge', xlabel: 'height z / h', ylabel: 'coordinate time ct / h',
    curves: [
      { param: ['0', 't'], t: [0, 3.3], color: 'accent', width: 2.6, label: 'bottom clock', labelAt: 3.05, labelDx: -84, labelDy: 0 },
      { param: ['1', 't'], t: [0, 3.3], color: 'violet', width: 2.6, label: 'top clock', labelAt: 3.05, labelDx: 8, labelDy: 0 },
      pulse(E1), pulse(E2),
    ],
    points: [
      ...ticks,
      { x: 0, y: E1, color: 'gold', r: 5, label: 'pulse 1 sent', labelDx: -86, labelDy: 0 },
      { x: 0, y: E2, color: 'gold', r: 5, label: 'pulse 2 sent', labelDx: -86, labelDy: 0 },
      { x: 1, y: arrive(E1), color: 'gold', r: 5, label: 'received', labelDx: 10, labelDy: 0 },
      { x: 1, y: arrive(E2), color: 'gold', r: 5, label: 'received', labelDx: 10, labelDy: 0 },
    ],
    ...extra,
  };
}
const towerPicture = (k, caption) => ({ type: 'graph', params: towerParams({ constants: { k } }), caption });

// the energy cycle: drop a mass, make light, send it up, rebuild the mass (schematic)
const cyclePicture = {
  type: 'graph',
  params: {
    x: [-3.2, 3.2], y: [-0.5, 3.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [{ param: ['-2.4 + 4.8*t', '0'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['-2.4 + 4.8*t', '2.4'], t: [0, 1], color: 'ink3', width: 1.5, dash: true }],
    arrows: [
      { from: [-1.2, 2.25], to: [-1.2, 0.2], color: 'accent', label: 'm falls: gains mgh', labelDx: -134, labelDy: 40 },
      { from: [-0.9, 0.08], to: [0.9, 0.08], color: 'ink3' },
      { from: [1.2, 0.2], to: [1.2, 2.25], color: 'gold', label: 'light climbs', labelDx: 10, labelDy: 40 },
      { from: [0.9, 2.32], to: [-0.9, 2.32], color: 'ink3' },
    ],
    points: [
      { x: -1.2, y: 2.4, color: 'accent', r: 6, label: 'mass m', labelDx: -54, labelDy: -12 },
      { x: 0, y: 0.08, r: 0.01, color: 'ink2', label: 'mass → light: E = mc² + mgh', labelDx: 0, labelDy: 16, labelAlign: 'center' },
      { x: 0, y: 2.4, r: 0.01, color: 'ink2', label: 'light → mass again', labelDx: 0, labelDy: -14, labelAlign: 'center' },
      { x: 2.5, y: 1.2, r: 0.01, color: 'ink3', label: 'height h', labelDx: 0, labelDy: 0, labelAlign: 'center' },
    ],
  },
  caption: 'Schematic of an idealized machine (a thought experiment, not a device): if the light reached the top with all of mc² + mgh, each cycle would create energy mgh from nothing.',
};

// a uniformly accelerated rocket in flat spacetime: floor x² − t² = 1, ceiling x² − t² = 2.25 (c = 1)
const rindlerPicture = (caption) => {
  const pulses = [-0.4, 0.4].map((te) => { const xe = Math.sqrt(1 + te * te), u = xe - te, ta = (2.25 - u * u) / (2 * u); return [te, xe, ta, u + ta]; });
  return {
    type: 'graph',
    params: {
      x: [-0.2, 2.6], y: [-1.1, 1.9], equal: true, xlabel: 'x', ylabel: 'ct',
      curves: [
        { fn: 'x', color: 'warn', dash: true, width: 1.3 }, { fn: '-x', color: 'warn', dash: true, width: 1.3 },
        { param: ['sqrt(1 + t^2)', 't'], t: [-1.1, 1.9], color: 'accent', width: 2.6, label: 'floor', labelAt: -0.9, labelDx: 8, labelDy: 0 },
        { param: ['sqrt(2.25 + t^2)', 't'], t: [-1.1, 1.9], color: 'violet', width: 2.6, label: 'ceiling', labelAt: -0.9, labelDx: 8, labelDy: 0 },
        ...pulses.map(([te, xe, ta, xa]) => ({ param: [`${round(xe)} + ${round(xa - xe)}*t`, `${te} + ${round(ta - te)}*t`], t: [0, 1], color: 'gold', width: 2 })),
      ],
      points: pulses.flatMap(([te, xe, ta, xa]) => [{ x: round(xe), y: te, color: 'gold', r: 4 }, { x: round(xa), y: round(ta), color: 'gold', r: 4 }]),
    },
    caption,
  };
};

// test masses around a freely falling observer near Earth: stretch along the vertical, squeeze across
const tidesPicture = (caption) => {
  const pts = [], arrows = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4, x = Math.cos(a), y = Math.sin(a);
    pts.push({ x: round(x), y: round(y), color: 'accent', r: 4.5 });
    if (Math.hypot(-0.4 * x, 0.8 * y) > 1e-6) arrows.push({ from: [round(x), round(y)], to: [round(1.0 * x - 0.4 * x), round(y + 0.8 * y)], color: 'gold' });
  }
  return {
    type: 'graph',
    params: { x: [-2.8, 2.8], y: [-2.1, 2.1], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', arrows, points: [...pts, { x: 0, y: 0, r: 3, color: 'ink' }, { x: 0, y: -2.0, r: 0.01, color: 'teal', label: '↓ toward Earth’s centre', labelDx: 0, labelDy: 0, labelAlign: 'center' }] },
    caption,
  };
};

export default lesson({
  id: 'gr.S06.d',
  title: 'Why gravity must be curvature: the tower argument',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der', 'model'],
  intro: t`Alfred Schild’s tower argument turns two facts into a statement about geometry. **Energy conservation** forces light climbing a tower to lose energy: otherwise you could drop a mass, turn it into light, send the light up, rebuild the mass and come out ahead. But **in a flat, static spacetime** two light pulses sent up the tower follow identical paths shifted in time, so they arrive exactly as far apart as they left — no redshift. The only way out is for clocks at different heights to tick at different rates: the metric’s time–time component $g_{00}$ must depend on height, as above. And because Earth’s pull points different ways in different places, no change of coordinates can make that flat everywhere at once: **gravity is the curvature of spacetime**.`,
  equation: t`ds^2 \approx -\left(1 + \frac{2\Phi}{c^2}\right)c^2\,dt^2 + dx^2 + dy^2 + dz^2`,
  symbols: [
    { tex: '\\Phi', text: t`Newton’s potential, in J/kg: $gz$ at height $z$ near the ground, $-GM/r$ in general` },
    { tex: 'g_{00} = -(1 + 2\\Phi/c^2)', text: t`the time–time component of the metric. A clock at rest records $d\tau = \sqrt{-g_{00}}\,dt$, so clocks where $\Phi$ is higher tick faster` },
    { tex: 't', text: t`coordinate time: the label a static observer gives to events, shared by all heights. It is not what clocks at different heights read` },
    { tex: 'dx,\\ dy,\\ dz', text: t`spatial steps. The space part is left flat here: its own correction, also of size $\Phi/c^2$, matters only for fast-moving things such as light (step 24)` },
    { tex: 'ds^2', text: t`the interval between two nearby events, as in step 3 — now with a coefficient that varies with position` },
  ],
  why: t`This is the first metric of the Road whose components vary from place to place, and the first sign of curvature that no coordinates remove. Steps 8 to 14 turn both into exact mathematics; step 19 recovers Newton from exactly this $g_{00}$.`,
  visual: {
    type: 'graph',
    title: 'Two pulses up a static tower',
    lead: t`A static tower drawn in coordinate time: the bottom clock (blue) and the top clock (violet) at rest, two light pulses (gold) sent up one unit of coordinate time apart. Because nothing changes with $t$, pulse 2’s path is pulse 1’s shifted up — so they always arrive one unit apart. The slider sets how much faster the top clock ticks.`,
    tasks: [
      'At 0 — flat spacetime — both clocks tick alike: the top receives one pulse per tick, exactly as sent. No redshift, which energy conservation forbids.',
      'Raise the slider: the pulses still arrive one unit of t apart, but the top clock now ticks more often in between. It measures a longer period — a redshift.',
      'Notice the pulses’ paths bend: light’s coordinate speed, √(−g₀₀), changes with height, though every local observer still measures c.',
    ],
    params: towerParams({
      sliders: [{ key: 'k', label: t`How much faster the top clock ticks, $2gh/c^2$ (exaggerated)`, min: 0, max: 0.8, step: 0.01, value: 0.4, explain: t`For a 22.5 m tower on Earth it is $4.9\times10^{-15}$; here it is made visible.` }],
      readouts: [
        { label: t`coordinate time between arrivals, $\Delta t$`, expr: '1', digits: 3 },
        { label: 'top clock’s time between arrivals', expr: 'sqrt(1 + k)', digits: 4 },
        { label: t`$f_\text{top}/f_\text{bottom}$`, expr: '1/sqrt(1 + k)', digits: 4 },
      ],
    }),
    caption: t`Units with $c = 1$ and tower height $h = 1$; metric $ds^2 = -(1 + kz)\,dt^2 + dz^2$ with $k = 2gh/c^2$. Dots on each clock’s worldline mark its ticks of proper time. Exaggerated about $10^{14}$ times.`,
  },
  example: {
    prompt: t`Show that energy conservation and a flat, static spacetime cannot both hold for light climbing a tower of height $h$ in uniform gravity $g$ — and find what the metric must look like instead.`,
    visual: towerPicture(0, t`The flat, static case: the second pulse’s worldline is a copy of the first, shifted up by $\Delta t$; both clocks tick alike, so the top receives exactly the frequency sent. Units with $c = 1$, $h = 1$.`),
    steps: [
      { label: 'Energy bookkeeping', text: t`Drop a mass $m$ from the top. At the bottom it has energy $mc^2 + mgh$ (for $gh \ll c^2$). Convert all of it into light — an idealized machine, a thought experiment — and send the light up. Photon energy is $E = h_\text{P}f$ ($h_\text{P}$ is Planck’s constant), so energy and frequency are one.` },
      { label: 'No perpetual motion', text: t`At the top, rebuild the mass. If the light arrived with more than $mc^2$, every cycle would create energy. So $E_\text{top} = mc^2$, and $\dfrac{f_\text{top}}{f_\text{bottom}} = \dfrac{mc^2}{mc^2 + mgh} \approx 1 - \dfrac{gh}{c^2}$: **light must be redshifted climbing the tower**.` },
      { label: 'Suppose spacetime were flat', text: t`Take the tower to be at rest in a global inertial frame, with metric $-c^2dt^2 + dz^2$. Send two crests up, $\Delta t$ apart. The set-up is static — nothing depends on $t$ — so the second crest’s worldline is the first one shifted by $\Delta t$, and they arrive $\Delta t$ apart. Clocks at rest in an inertial frame read $d\tau = dt$ at every height, so both measure the same period.` },
      { label: 'Contradiction', text: t`Flatness says $f_\text{top} = f_\text{bottom}$; energy conservation says $f_\text{top} < f_\text{bottom}$. The assumption must go: **a frame at rest on Earth is not an inertial frame of a flat spacetime**.` },
      { label: 'What the metric must be', text: t`Keep what is surely true — the tower is static, so arrivals are still $\Delta t$ apart in coordinate time — and let clock rates depend on height: $d\tau = \sqrt{-g_{00}(z)}\,dt$. Then $\dfrac{f_\text{top}}{f_\text{bottom}} = \sqrt{\dfrac{g_{00}(0)}{g_{00}(h)}}$, and matching $1 - gh/c^2$ for every height forces $g_{00} = -\left(1 + \dfrac{2gz}{c^2}\right)$, or in general $-(1 + 2\Phi/c^2)$.` },
      { label: 'Is that curvature yet?', text: t`Not by itself. A rocket accelerating at $g$ through flat spacetime shows the same redshift — the equivalence principle again — and in coordinates riding with it the metric has exactly this $g_{00}$. No argument from the redshift *alone* proves curvature (Marsh and Nissim-Sabat, 1975).` },
      { label: 'What forces curvature', text: t`Earth’s field is not uniform: towers at the North and South Poles need “up” in opposite directions, and $g$ weakens with height. One accelerating frame can mimic gravity at one place, never everywhere at once. What no choice of frame removes are the second derivatives of $\Phi$ — the tides of step 1. In the metric they appear as curvature (step 14). **Gravity is curved spacetime, and near Earth its time part does almost all the work.**` },
    ],
    answer: t`Energy conservation demands $f_\text{top} = f_\text{bottom}(1 - gh/c^2)$; a flat static spacetime gives $f_\text{top} = f_\text{bottom}$. Hence $g_{00} = -(1 + 2\Phi/c^2)$ varies with height — and since the field varies in direction and strength (tides), no coordinates make it flat: spacetime is curved.`,
  },
  practice: [
    expr({
      id: 'energy-ratio', difficulty: 2,
      prompt: t`In the energy cycle, the light leaves the bottom with $E_\text{bottom} = mc^2 + mgh$ and must reach the top with $E_\text{top} = mc^2$. Write the exact ratio $E_\text{top}/E_\text{bottom}$ — equal to $f_\text{top}/f_\text{bottom}$ — in terms of $g$, $h$ and $c$.`,
      answer: 'c^2/(c^2 + g h)', answerTeX: t`\frac{c^2}{c^2 + gh}`,
      lhs: t`f_\text{top}/f_\text{bottom}`,
      vars: { g: [0.5, 2], h: [0.5, 2], c: [1, 3] },
      errors: [
        { answer: '1 - g h/c^2', feedback: t`That is the first-order form, accurate when $gh \ll c^2$. The exact bookkeeping gives $mc^2/(mc^2 + mgh)$.` },
        { answer: '(c^2 + g h)/c^2', feedback: 'Upside down: light gains energy falling and loses it climbing, so the top receives less.' },
      ],
      hints: [t`Divide $E_\text{top} = mc^2$ by $E_\text{bottom} = mc^2 + mgh$.`, t`The mass cancels: $\dfrac{mc^2}{mc^2 + mgh} = \dfrac{c^2}{c^2 + gh}$.`],
      teach: 'Energy conservation fixes the climbing light’s energy ratio: c²/(c² + gh) ≈ 1 − gh/c².',
      explain: t`$\dfrac{E_\text{top}}{E_\text{bottom}} = \dfrac{c^2}{c^2 + gh} = \dfrac{1}{1 + gh/c^2} \approx 1 - \dfrac{gh}{c^2}$. With $E = h_\text{P}f$ the same ratio holds for frequencies. (The $mgh$ itself is Newtonian; the exact general-relativistic result depends on $\Phi$ through $g_{00}$, and agrees to this order.)`,
      visual: cyclePicture,
    }),
    num({
      id: 'redshift-from-g00', difficulty: 2,
      gen(r) {
        const [h, where] = r.pick([[146, 'up the 146 m Bremen drop tower'], [1000, 'up a 1000 m cliff'], [8849, 'from sea level to the summit of Mount Everest (8849 m)'], [22.5, 'up the 22.5 m Harvard tower']]);
        const ans = (g0 * h) / C ** 2;
        return {
          prompt: t`With $g_{00} = -(1 + 2gz/c^2)$, light sent ${where} arrives with $\dfrac{f_\text{top}}{f_\text{bottom}} = \sqrt{\dfrac{g_{00}(0)}{g_{00}(h)}} = \dfrac{1}{\sqrt{1 + 2gh/c^2}}$. Find the fractional redshift $1 - f_\text{top}/f_\text{bottom}$ to first order. ($g = 9.81\ \text{m/s}^2$.)`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: t`The square root halves it: $(1 + 2x)^{-1/2} \approx 1 - x$, so the shift is $gh/c^2$, not $2gh/c^2$.` }],
          hints: [t`For small $x$, $(1 + 2x)^{-1/2} \approx 1 - x$.`, t`So $1 - f_\text{top}/f_\text{bottom} \approx gh/c^2 = 9.81\times${h}/(2.998\times10^{8})^2$.`],
          teach: 'Clock rates go as √(−g₀₀): a g₀₀ that changes by 2gh/c² gives a redshift of gh/c².',
          explain: t`$1 - (1 + 2gh/c^2)^{-1/2} \approx gh/c^2 = ${sci(ans)}$. (A calculator taking the square root directly would lose this to rounding: $2gh/c^2$ is far below its precision. Expand first.)`,
          visual: towerPicture(0.3, t`The setting with an exaggerated $2gh/c^2 = 0.3$: the top clock (violet) ticks faster than the bottom one (blue), so it counts more ticks between the two arriving pulses.`),
        };
      },
    }),
    num({
      id: 'thrown-ball', difficulty: 3,
      gen(r) {
        const v0 = r.pick([5, 10, 20]);
        const T = (2 * v0) / g0, ans = v0 ** 3 / (3 * g0 * C * C);
        return {
          prompt: t`With this metric, a slow clock at height $h(t)$ moving at speed $v(t)$ gains on a clock left on the ground by $\Delta\tau - T = \dfrac{1}{c^2}\displaystyle\int_0^T\left(g\,h - \tfrac12 v^2\right)dt$. A clock is thrown straight up at $v_0 = ${v0}$ m/s and caught at launch height: $h = v_0t - \tfrac12 gt^2$, $v = v_0 - gt$, $T = 2v_0/g$. How much more time, in seconds, does it record than the ground clock? ($g = 9.81\ \text{m/s}^2$.)`,
          answer: ans, units: 's', tol: { rel: 0.01 },
          integrand: `(9.81*(${v0}*x - 4.905*x^2) - 0.5*(${v0} - 9.81*x)^2)/${C * C}`, limits: [0, T],
          errors: [
            { value: (2 * v0 ** 3) / (3 * g0 * C * C), feedback: t`That is the height bonus alone. The speed penalty, $\tfrac{1}{c^2}\int\tfrac12 v^2dt = v_0^3/(3gc^2)$, takes back half of it.` },
            { value: -ans, feedback: 'The height bonus wins: the thrown clock records more time than the ground clock, not less.' },
          ],
          hints: [t`$\displaystyle\int_0^T g\,h\,dt = g\left(\frac{v_0T^2}{2} - \frac{gT^3}{6}\right) = \frac{2v_0^3}{3g}$ and $\displaystyle\int_0^T\tfrac12 v^2\,dt = \frac{v_0^3}{3g}$.`, t`So $\Delta\tau - T = \dfrac{v_0^3}{3gc^2} = \dfrac{${v0}^3}{3(9.81)(2.998\times10^{8})^2}$ s.`],
          teach: 'With g₀₀ = −(1 + 2gh/c²), a thrown clock gains (1/c²)∫(gh − ½v²)dt: twice as much from height as it loses to speed.',
          explain: t`The height bonus is $\dfrac{2v_0^3}{3gc^2}$ and the speed penalty $\dfrac{v_0^3}{3gc^2}$, so the thrown clock gains $\dfrac{v_0^3}{3gc^2} = ${sci(ans)}$ s. Tiny — and it is positive for the real free-fall path, which (next question) is the path that makes it largest.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, round(T * 1.05)], y: [round(-0.6 * v0 * v0), round(0.6 * v0 * v0)], xlabel: 't (s)', ylabel: 'integrand × c²  (m²/s²)',
              curves: [
                { fn: `9.81*(${v0}*x - 4.905*x^2)`, domain: [0, round(T)], color: 'gold', label: 'g h', labelAt: round(T / 2), labelDx: -10, labelDy: -12 },
                { fn: `-0.5*(${v0} - 9.81*x)^2`, domain: [0, round(T)], color: 'violet', label: '−½v²', labelAt: round(T * 0.12), labelDx: 6, labelDy: 14 },
                { fn: `9.81*(${v0}*x - 4.905*x^2) - 0.5*(${v0} - 9.81*x)^2`, domain: [0, round(T)], color: 'accent', width: 2.8 },
              ],
              shade: [{ fn: `9.81*(${v0}*x - 4.905*x^2) - 0.5*(${v0} - 9.81*x)^2`, from: 0, to: round(T), color: 'accent', alpha: 0.18 }],
            },
            caption: t`The two parts of the integrand (times $c^2$) for the thrown clock: the height bonus $gh$ (gold), the speed penalty $-\tfrac12v^2$ (violet), and their sum (blue). The signed blue area divided by $c^2$ is the time gained.`,
          },
        };
      },
    }),
    expr({
      id: 'best-apex', difficulty: 3,
      prompt: t`Compare trial paths that leave the ground at $t = 0$ and return at $t = T$: $h(t) = 4H\,t(T - t)/T^2$, a parabola with apex $H$. Their gain over the ground clock works out to $\Delta\tau - T = \dfrac{1}{c^2}\left(\dfrac{2}{3}gHT - \dfrac{8H^2}{3T}\right)$. Which apex $H$ gives the **most** proper time?`,
      answer: 'g T^2/8', answerTeX: t`\frac{gT^2}{8}`,
      lhs: 'H',
      vars: { g: [0.5, 2], T: [0.5, 3] },
      errors: [
        { answer: 'g T^2/2', feedback: t`That is how far a body falls in time $T$. Set the derivative of the gain with respect to $H$ to zero.` },
        { answer: 'g T^2/4', feedback: t`Check the derivative: $\dfrac{d}{dH}\left(\dfrac{2}{3}gHT - \dfrac{8H^2}{3T}\right) = \dfrac{2}{3}gT - \dfrac{16H}{3T}$.` },
      ],
      hints: [t`Differentiate the bracket with respect to $H$: $\dfrac{2}{3}gT - \dfrac{16H}{3T}$, and set it to zero.`, t`$\dfrac{16H}{3T} = \dfrac{2}{3}gT$ gives $H = \dfrac{gT^2}{8}$.`],
      teach: 'Maximizing the proper time with g₀₀ = −(1 + 2gh/c²) picks out the free-fall parabola: Newton’s law of falling bodies as maximal aging.',
      explain: t`$H = gT^2/8$ — exactly the apex of a body in free fall for a flight of duration $T$, since it rises for $T/2$: $\tfrac12 g(T/2)^2 = gT^2/8$. Of all the paths, the one that falls freely makes its clock tick the most. Steps 9 and 12 make this the rule for every free body: **free fall maximizes proper time**.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 2.1], y: [0, 8.2], xlabel: 't (s)', ylabel: 'height h (m)',
          curves: [1.5, 3, 6, 7.5].map((H, k) => ({ fn: `4*${H}*x*(2 - x)/4`, domain: [0, 2], color: ['ink3', 'accent', 'violet', 'teal'][k], label: `H = ${H} m`, labelAt: 1, labelDx: -26, labelDy: -10 })),
        },
        caption: t`Some trial paths between the same two events, $T = 2$ s apart. Each clock’s proper time depends on its whole path; which apex wins is the question.`,
      },
    }),
    mcq({
      id: 'redshift-alone', difficulty: 3,
      prompt: 'Does the gravitational redshift, on its own, prove that spacetime is curved?',
      choices: [
        'No: a rocket accelerating through flat spacetime shows the same redshift. What no frame can remove is the variation of the field from place to place — tides — and that is curvature',
        'Yes: any redshift between clocks at rest means spacetime is curved',
        'No: the redshift is just the Doppler effect of the Earth’s rotation',
        'Yes: in flat spacetime light can never lose energy',
      ],
      answer: 0,
      why: {
        1: 'Clocks at rest in an accelerating rocket also disagree, and that is flat spacetime described in accelerated coordinates.',
        2: 'Earth’s rotation is small and is corrected for; the redshift is there for a tower at either pole, where the rotation moves nothing.',
        3: 'Light does lose energy relative to an accelerating receiver in flat spacetime: the Doppler shift in the rocket is exactly that.',
      },
      hints: ['What would the same experiment give in a rocket accelerating at g far from any star?', 'Which feature of Earth’s gravity could no single accelerating frame imitate?'],
      teach: 'The redshift shows that a frame at rest on Earth is not inertial; curvature is what remains in every frame — the tides.',
      explain: 'Schild’s argument proves that the Earth-fixed frame is not an inertial frame of flat spacetime. An accelerating frame in flat spacetime reproduces the redshift locally (the equivalence principle). Curvature is the part of gravity no frame removes: the change of the field’s direction and strength across space, felt as tides (Marsh and Nissim-Sabat, 1975).',
      visual: rindlerPicture(t`A rocket accelerating uniformly through **flat** spacetime: its floor (blue) and ceiling (violet) follow hyperbolae; light pulses (gold) run at 45°. The ceiling receives them farther apart than they left — the same redshift as a tower, with no curvature anywhere. Units with $c = 1$.`),
    }),
    order({
      id: 'schild-order', difficulty: 2,
      prompt: 'Put the steps of Schild’s argument in order.',
      items: [
        t`Energy conservation: light climbing height $h$ arrives with frequency lower by $gh/c^2$.`,
        'Assume the tower is at rest in an inertial frame of a flat spacetime.',
        'The set-up is static, so the second pulse’s worldline is the first shifted in time: arrivals are as far apart as departures.',
        'In an inertial frame both clocks tick alike, so there is no redshift — a contradiction.',
        t`So clock rates must depend on height: $g_{00} = -(1 + 2\Phi/c^2)$ — and because the field varies from place to place, spacetime is curved.`,
      ],
      hints: ['The physical input — energy — comes first; the assumption to be refuted comes second.', 'The conclusion about g₀₀ comes from keeping the static picture but dropping flatness.'],
      teach: 'Schild’s argument: energy demands a redshift, a flat static spacetime forbids one, so the metric’s g₀₀ must vary — and with a non-uniform field, spacetime must be curved.',
      explain: 'Energy conservation → redshift. Flat + static → congruent pulse worldlines → no redshift. Contradiction → the Earth frame is not inertial in a flat spacetime → clocks run at √(−g₀₀) with g₀₀ depending on height; with tides, no coordinates flatten it.',
      visual: towerPicture(0, t`The assumption under test: a flat, static spacetime, in which the two pulses’ worldlines are parallel copies and both clocks tick alike. Units with $c = 1$, $h = 1$.`),
    }),
    num({
      id: 'curvature-scale', difficulty: 3,
      prompt: t`Curvature has units of 1/length². A rough measure near a mass is the vertical tidal acceleration per metre of separation, $2GM/r^3$, divided by $c^2$; its inverse square root, $\mathcal{R} = c\sqrt{r^3/(2GM)}$, is the distance over which spacetime’s curvature becomes noticeable. Compute $\mathcal{R}$ at Earth’s surface, in astronomical units. ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R_\oplus = 6371$ km, $1\ \text{AU} = 1.496\times10^{11}$ m.)`,
      answer: (C * Math.sqrt(R_EARTH ** 3 / (2 * GM_EARTH))) / AU, units: 'AU', tol: { rel: 0.01 },
      errors: [
        { value: (C * Math.sqrt(R_EARTH ** 3 / GM_EARTH)) / AU, feedback: t`Keep the 2: along the vertical the tidal term is $2GM/r^3$.` },
        { value: Math.sqrt(R_EARTH ** 3 / (2 * GM_EARTH)) / AU, feedback: t`Multiply by $c$ to turn the time $\sqrt{r^3/2GM}$ into a length.` },
      ],
      hints: [t`$2GM/R^3 = 2(3.986\times10^{14})/(6.371\times10^{6})^3 = ${sci((2 * GM_EARTH) / R_EARTH ** 3)}\ \text{s}^{-2}$.`, t`$\mathcal{R} = c/\sqrt{${sci((2 * GM_EARTH) / R_EARTH ** 3)}}$ m; divide by $1.496\times10^{11}$.`],
      teach: 'Near Earth spacetime is curved on a scale of about an astronomical unit — far larger than any laboratory, which is why gravity looks like a force.',
      explain: t`$\mathcal{R} = c\sqrt{R^3/(2GM)} = ${sci(C * Math.sqrt(R_EARTH ** 3 / (2 * GM_EARTH)))}$ m $\approx ${fmt((C * Math.sqrt(R_EARTH ** 3 / (2 * GM_EARTH))) / AU, 3)}$ AU. A laboratory, or a falling elevator, is a tiny patch of that — locally flat, as the equivalence principle says. (This is an order-of-magnitude scale, not a precise radius of anything.)`,
      visual: tidesPicture(t`What the curvature does: test masses around a freely falling observer near Earth drift apart along the vertical and together across it, at rates set by $2GM/r^3$ and $GM/r^3$. Arrow lengths are not to scale.`),
    }),
    mcq({
      id: 'rubber-sheet', difficulty: 2,
      prompt: t`**A teaching model under scrutiny.** The rubber-sheet picture — a heavy ball denting a stretched sheet — shows only curved *space*. In this lesson’s metric, what makes a dropped apple fall?`,
      choices: [
        t`The height dependence of $g_{00}$: clocks tick faster higher up, and the free path is the one of most proper time`,
        'The dent in space: the apple rolls down it, like a marble on the sheet',
        t`The spatial part of the metric, $dx^2 + dy^2 + dz^2$`,
        'A force between the apple and the Earth that the metric adds on top',
      ],
      answer: 0,
      why: {
        1: 'The sheet’s marble rolls only because real gravity pulls it down: the model uses gravity to explain gravity. And for a slow apple, curved space matters only at order (v/c)².',
        2: t`In this approximation the spatial part is flat; even its real correction affects a slow apple only at order $(v/c)^2$.`,
        3: 'In general relativity there is no gravitational force: the metric replaces it.',
      },
      hints: ['Which coefficient of the metric did the tower argument force to depend on height?', 'The previous questions’ maximal-aging calculation used only g₀₀.'],
      teach: 'For slow bodies, gravity is almost entirely the variation of g₀₀ — curved time — which the rubber sheet leaves out.',
      explain: t`The maximal-aging calculation used only $g_{00} = -(1 + 2gz/c^2)$ and gave Newton’s parabola. The rubber sheet is a teaching model that fails twice: its marbles need real gravity to roll, and it shows no time at all.`,
      visual: {
        type: 'surface3d',
        params: {
          z: '-1.2/sqrt(x^2 + y^2 + 0.35)', domain: [[-3, 3], [-3, 3]], n: 34, axes: false, pitch: 0.55, dist: 9,
          curves: [{ param: ['(2.6 - 0.12t)cos(t)', '(2.6 - 0.12t)sin(t)', '-1.2/sqrt((2.6 - 0.12t)^2 + 0.35) + 0.06'], t: [0, 14], color: 'gold' }],
        },
        caption: 'The rubber sheet, drawn only to be criticized: a teaching model, not a picture of spacetime. It has no time in it, and its marble rolls only because something else pulls it down.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-neutron', difficulty: 3, transfer: true,
      gen(r) {
        const [m, rk] = r.pick([[1.4, 12], [1.4, 11], [2.0, 12], [2.0, 13], [1.4, 13]]);
        const ans = (C * Math.sqrt((rk * 1e3) ** 3 / (2 * m * GM_SUN))) / 1e3;
        return {
          prompt: t`Use the same curvature scale, $\mathcal{R} = c\sqrt{r^3/(2GM)}$, at the surface of a neutron star of ${m} solar masses and radius ${rk} km. Find $\mathcal{R}$ in kilometres. ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$.)`,
          answer: ans, units: 'km', tol: { rel: 0.01 },
          errors: [
            { value: (C * Math.sqrt((rk * 1e3) ** 3 / (m * GM_SUN))) / 1e3, feedback: t`Keep the 2 in $2GM/r^3$.` },
            { value: (C * Math.sqrt(rk ** 3 / (2 * m * GM_SUN))) / 1e3, feedback: 'Convert the radius to metres before cubing it.' },
          ],
          hints: [t`$GM = ${m}\times1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $r = ${rk}\times10^{3}$ m.`, t`$\mathcal{R} = 2.998\times10^{8}\times\sqrt{r^3/(2GM)}$ m.`],
          teach: 'When the curvature scale is comparable to the body itself, gravity is strong and only general relativity will do.',
          explain: t`$\mathcal{R} = ${fmt(ans, 3)}$ km — about the size of the star itself, against about an AU for Earth. Spacetime there is curved on the scale of the object: no small-correction picture survives, which is why neutron stars are modelled with the full field equations.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 6.5], y: [0, 9.5], xlabel: 'log₁₀(radius in km)', ylabel: 'log₁₀(curvature scale in km)',
              curves: [{ fn: 'x', color: 'warn', dash: true, label: 'curvature scale = radius: strong gravity', labelAt: 4.2, labelDx: 8, labelDy: 12 }],
              points: [
                { x: round(Math.log10(R_EARTH / 1e3)), y: round(Math.log10((C * Math.sqrt(R_EARTH ** 3 / (2 * GM_EARTH))) / 1e3)), color: 'teal', label: 'Earth' },
                { x: round(Math.log10(6.957e5)), y: round(Math.log10((C * Math.sqrt(6.957e8 ** 3 / (2 * GM_SUN))) / 1e3)), color: 'gold', label: 'Sun' },
                { x: round(Math.log10(7000)), y: round(Math.log10((C * Math.sqrt(7e6 ** 3 / (2 * GM_SUN))) / 1e3)), color: 'violet', label: 'white dwarf', labelDx: 9, labelDy: 12 },
              ],
            },
            caption: 'Curvature scale against size, on powers-of-ten axes, at the surface of three bodies. Far above the dashed line, gravity is a small correction; where does a neutron star land?',
          },
        };
      },
    }),
    mcq({
      id: 'cp-poles', difficulty: 3,
      prompt: 'Identical towers stand at the North Pole and at the South Pole, and light climbing each is redshifted by gh/c². Why can no single accelerating frame in flat spacetime reproduce both?',
      choices: [
        'The two towers need accelerations pointing in opposite directions — each “up”, away from Earth’s centre — and one frame accelerates only one way',
        'It can: one frame accelerating upward at g reproduces both',
        'Light travels at a different speed at each pole',
        'The poles have different temperatures, which changes the clocks',
      ],
      answer: 0,
      why: {
        1: '“Upward” at the South Pole is downward at the North Pole, as seen from Earth’s centre. A frame accelerating one way gives redshift at one tower and blueshift at the other.',
        2: 'Every local measurement of light’s speed gives c at both poles.',
        3: 'Temperature is controlled and corrected for; the effect is geometric, not thermal.',
      },
      hints: ['In which direction does each tower’s “up” point?', 'An accelerating frame mimics gravity pointing one way, everywhere.'],
      teach: 'A field that changes direction from place to place cannot be removed by any single frame; that leftover is spacetime curvature.',
      explain: 'Each tower can be described locally by an accelerating frame, but the two frames accelerate in opposite directions. Patching such local frames together over the whole Earth fails — the mismatch is the tidal field, the second derivatives of Φ, which is curvature.',
      visual: {
        type: 'graph',
        params: {
          x: [-3, 3], y: [-2.25, 2.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'teal', width: 2.4 }, { param: ['0', '1 + 0.45*t'], t: [0, 1], color: 'ink2', width: 5 }, { param: ['0', '-1 - 0.45*t'], t: [0, 1], color: 'ink2', width: 5 }],
          arrows: [{ from: [0.35, 1.2], to: [0.35, 1.95], color: 'gold', label: 'up', labelDx: 8, labelDy: 0 }, { from: [0.35, -1.2], to: [0.35, -1.95], color: 'gold', label: 'up', labelDx: 8, labelDy: 0 }],
          points: [{ x: 0, y: 0, r: 3, color: 'ink', label: 'Earth’s centre', labelDx: 8, labelDy: 10 }],
        },
        caption: 'Towers at the two poles, not to scale. Each one’s “up” — the direction an imitating rocket would have to accelerate — points away from Earth’s centre, opposite to the other’s.',
      },
    }),
    expr({
      id: 'cp-g00', difficulty: 3,
      prompt: t`A static spacetime has $ds^2 = -A(z)\,c^2dt^2 + dz^2$ near the ground, with $A(0) = 1$. Clocks at rest read $d\tau = \sqrt{A}\,dt$, and arrival spacings in $t$ equal departure spacings, so light from height 0 arrives at height $z$ with $f_z/f_0 = \sqrt{A(0)/A(z)}$. Redshift experiments find $f_z/f_0 = 1 - gz/c^2$ to first order. What is $A(z)$, to first order in $gz/c^2$?`,
      answer: '1 + 2g z/c^2', answerTeX: t`1 + \frac{2gz}{c^2}`,
      lhs: 'A(z)',
      vars: { g: [0.5, 2], z: [0.5, 2], c: [2, 4] },
      errors: [
        { answer: '1 + g z/c^2', feedback: t`The square root halves the change: $\sqrt{1/A} = 1 - gz/c^2$ needs $A = 1 + 2gz/c^2$.` },
        { answer: '1 - 2g z/c^2', feedback: 'Then higher clocks would tick slower, and light would be blueshifted climbing.' },
      ],
      hints: [t`Write $A = 1 + \epsilon$: then $\sqrt{1/A} \approx 1 - \epsilon/2$.`, t`Match $1 - \epsilon/2 = 1 - gz/c^2$.`],
      teach: 'A redshift of gz/c² between heights requires a metric coefficient g₀₀ = −(1 + 2gz/c²): the factor 2 comes from the square root in dτ = √(−g₀₀) dt.',
      explain: t`$\sqrt{1/(1 + \epsilon)} \approx 1 - \epsilon/2 = 1 - gz/c^2$, so $\epsilon = 2gz/c^2$ and $g_{00} = -A = -\left(1 + \dfrac{2gz}{c^2}\right) = -\left(1 + \dfrac{2\Phi}{c^2}\right)$ with $\Phi = gz$: the metric this lesson set out to find, read off from experiment.`,
      visual: towerPicture(0.5, t`The static tower again (exaggerated): equal coordinate spacing of arrivals, but a top clock that ticks $\sqrt{A(h)}$ times as fast. Units with $c = 1$, $h = 1$.`),
    }),
  ],
  sources: [
    { label: 'Misner, Thorne & Wheeler, Gravitation (1973), §7.3: gravitational redshift implies spacetime is curved', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
    { label: 'Marsh & Nissim-Sabat (1975), Gravitational red shift and spacetime curvature, Am. J. Phys.', url: 'https://www.gemarsh.com/archives/61' },
    { label: 'Taylor, Wheeler & Bertschinger, Exploring Black Holes (2nd ed.): the principle of maximal aging', url: 'https://www.eftaylor.com/exploringblackholes/' },
  ],
});
