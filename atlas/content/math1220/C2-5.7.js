// Series in physics: small-angle and low-speed approximations — the first
// terms of a series in a small number, and the next term that says when the
// approximation fails. Bridge to relativity: kinetic energy and GPS clocks.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';

const t = String.raw;
const C = 299792458;                  // m/s, exact
const GM_EARTH = 3.986004418e14;      // m^3/s^2 (IERS/WGS 84)
const R_EARTH = 6.371e6;              // m, mean radius
const GM_SUN = 1.32712440018e20;      // m^3/s^2 (IAU)
const R_SUN = 6.957e8;                // m, IAU nominal solar radius
const DAY = 86400;
const RAD = Math.PI / 180;

// relative error, in %, of ½mv² against (γ − 1)mc²
const keError = (b) => { const g = 1 / Math.sqrt(1 - b * b); return ((g - 1 - (b * b) / 2) / (g - 1)) * 100; };
const solveKE = (pct) => { let lo = 0, hi = 0.99; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (keError(m) < pct) lo = m; else hi = m; } return lo; };

export default lesson({
  id: 'math1220.C2-5.7',
  title: 'Series in physics: small-angle and low-speed approximations',
  minutes: 12, difficulty: 3,
  equation: t`\gamma = \left(1 - \frac{v^2}{c^2}\right)^{-1/2} = 1 + \frac12\frac{v^2}{c^2} + \frac38\frac{v^4}{c^4} + \cdots`,
  intro: t`Many formulas in introductory physics are the first terms of a series in some small number — and the next term of the series tells you when they stop working. Three you will meet again and again:

- **small angles**: $\sin\theta \approx \theta$, which makes a pendulum’s period $2\pi\sqrt{L/g}$ independent of its swing;
- **low speeds**: $\gamma \approx 1 + \frac{v^2}{2c^2}$, which turns the relativistic kinetic energy $(\gamma - 1)mc^2$ into $\tfrac12 mv^2$;
- **weak gravity**: $\sqrt{1 - \frac{2GM}{rc^2}} \approx 1 - \frac{GM}{rc^2}$, the rate of a clock near a mass — the correction every GPS satellite needs.

Each is a Taylor or binomial polynomial in a dimensionless small quantity: $\theta$, $v/c$ or $GM/rc^2$.`,
  symbols: [
    { tex: '\\theta', text: 'an angle, in **radians** (the series of $\\sin$ needs radians)' },
    { tex: 'v', text: 'speed, in m/s' },
    { tex: 'c', text: 'the speed of light, $299\\,792\\,458$ m/s exactly' },
    { tex: '\\gamma', text: t`the **Lorentz factor**, dimensionless and $\ge 1$: moving clocks tick slower by $1/\gamma$, and kinetic energy is $(\gamma - 1)mc^2$` },
    { tex: 'm', text: 'the mass of the moving object, in kg' },
    { tex: 'G', text: t`Newton’s gravitational constant, $6.674\times10^{-11}\ \text{N m}^2/\text{kg}^2$` },
    { tex: 'M', text: 'the mass of the planet or star doing the attracting, in kg' },
    { tex: 'r', text: 'distance from the centre of that mass, in m' },
    { tex: '\\tfrac{GM}{rc^2}', text: t`a dimensionless measure of how strong gravity is: $7\times10^{-10}$ at Earth’s surface, $2\times10^{-6}$ at the Sun’s, $0.5$ at a black hole’s horizon` },
  ],
  why: t`Away from black holes, general relativity is mostly done this way: the weak-field metric, the bending of starlight and the post-Newtonian expansions used for the early inspiral of the black holes LIGO detects all keep the first terms in a small parameter. Knowing when that parameter stops being small is knowing when you need the full theory.`,
  visual: {
    type: 'graph',
    title: 'The Lorentz factor and its series',
    lead: t`Grey: the exact $\gamma = 1/\sqrt{1 - \beta^2}$ against speed $\beta = v/c$. Gold: two terms of its binomial series, $1 + \frac{\beta^2}{2}$. Teal (dashed): three terms. The readouts give the error of the gold approximation, both in $\gamma$ itself and in the kinetic energy $(\gamma - 1)mc^2 \approx \tfrac12 mv^2$.`,
    tasks: [
      'At β = 0.1 — 30 000 km/s, far faster than any spacecraft — γ ≈ 1 + β²/2 is off by only 0.004%, yet ½mv² is already 0.75% short of the true kinetic energy.',
      'Find the speed where ½mv² falls 10% short: about β = 0.36.',
      'Push β towards 1: γ shoots up without limit while every polynomial stays finite. The series converges only for β < 1 and is only useful well below it.',
    ],
    params: {
      x: [0, 1], y: [0.95, 3], xlabel: 'β = v/c', ylabel: 'γ',
      sliders: [{ key: 'b', label: 'Speed $\\beta = v/c$', min: 0.01, max: 0.99, step: 0.01, value: 0.3, explain: 'Speed as a fraction of the speed of light.' }],
      curves: [
        { fn: '1/sqrt(1 - x^2)', domain: [0, 0.999], color: 'ink3', width: 1.8 },
        { fn: '1 + x^2/2', color: 'gold' },
        { fn: '1 + x^2/2 + 3x^4/8', color: 'teal', dash: true },
      ],
      vlines: [{ x: 'b', label: 'β', color: 'accent2' }],
      points: [{ x: 'b', y: '1/sqrt(1 - b^2)', color: 'ink2' }, { x: 'b', y: '1 + b^2/2', color: 'gold' }],
      readouts: [
        { label: 'speed', expr: 'b*299792.458', unit: '\\mathrm{km/s}', digits: 4 },
        { label: '$\\gamma$', expr: '1/sqrt(1 - b^2)', digits: 5 },
        { label: '$1 + \\beta^2/2$', expr: '1 + b^2/2', digits: 5 },
        { label: 'error in $\\gamma$', expr: '(1/sqrt(1 - b^2) - 1 - b^2/2)*sqrt(1 - b^2)*100', unit: '\\%', digits: 3 },
        { label: 'error in $\\tfrac12mv^2$', expr: '(1/sqrt(1 - b^2) - 1 - b^2/2)/(1/sqrt(1 - b^2) - 1)*100', unit: '\\%', digits: 3 },
      ],
    },
    caption: t`Exact curves. Kinetic energy is $(\gamma - 1)mc^2$, a small difference, so its relative error is much larger than that of $\gamma$: the first neglected term, $\frac38\beta^4$, is compared with $\frac12\beta^2$ rather than with 1.`,
  },
  example: {
    prompt: t`A GPS satellite orbits at $r = 26\,560$ km from Earth’s centre. By how much does its clock gain or lose per day relative to a clock on the ground? Use $GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $R_\oplus = 6371$ km and $c = 2.998\times10^{8}$ m/s.`,
    steps: [
      { label: 'Two first-order effects', text: t`For a clock at radius $r$ moving at speed $v$, general relativity gives its rate relative to a clock far away:
$$\frac{d\tau}{dt} = \sqrt{1 - \frac{2GM}{rc^2} - \frac{v^2}{c^2}} \approx 1 - \frac{GM}{rc^2} - \frac{v^2}{2c^2}$$
(weak field, slow speed). Higher up means a faster clock; faster motion means a slower one.` },
      { label: 'Gravity term', text: t`$\frac{GM}{c^2} = 4.435\times10^{-3}$ m, so relative to the ground the satellite runs fast by
$$\frac{GM}{c^2}\left(\frac{1}{R_\oplus} - \frac{1}{r}\right) = 4.435\times10^{-3}\,(1.570 - 0.377)\times10^{-7} = 5.29\times10^{-10}.$$
Times $86\,400$ s: **+45.7 μs per day**.` },
      { label: 'Speed term', text: t`Orbital speed $v = \sqrt{GM/r} = 3.874$ km/s, so $\frac{v^2}{2c^2} = 8.35\times10^{-11}$: **−7.2 μs per day**. (The ground clock’s own speed from Earth’s rotation changes this by about 0.1 μs; we neglect it.)` },
      { label: 'Net effect', text: t`$45.7 - 7.2 = 38.5$ μs per day fast. Light travels $11.5$ km in $38.5$ μs, so without the correction GPS ranges would drift by about 10 km every day.` },
      { label: 'Was first order enough?', text: t`The neglected terms are of order $\left(\frac{GM}{R_\oplus c^2}\right)^2 = (7\times10^{-10})^2 \approx 5\times10^{-19}$ — about $4\times10^{-14}$ s per day. The linear approximations are better than any clock can measure.` },
    ],
    answer: t`The satellite clock gains about $38.5$ μs per day: $+45.7$ μs from weaker gravity, $-7.2$ μs from its speed. GPS clocks are built to run slow by this amount before launch.`,
  },
  practice: [
    mcq({
      id: 'next-term-sin', difficulty: 1,
      prompt: t`$\sin\theta \approx \theta$ keeps the first term of the Maclaurin series of $\sin$. What is the first term it neglects?`,
      choices: [t`$-\dfrac{\theta^3}{6}$`, t`$-\dfrac{\theta^2}{2}$`, t`$+\dfrac{\theta^3}{3}$`, t`$-\dfrac{\theta^3}{3}$`],
      answer: 0,
      why: {
        1: t`That is the second term of $\cos\theta$. The sine has only odd powers.`,
        2: t`That is the correction for $\tan\theta \approx \theta$: $\tan\theta = \theta + \frac{\theta^3}{3} + \cdots$`,
        3: t`The denominator is $3! = 6$, not 3.`,
      },
      hints: [t`$\sin\theta = \theta - \frac{\theta^3}{3!} + \frac{\theta^5}{5!} - \cdots$`],
      teach: t`The size of a first-order approximation’s error is set by the first neglected term — for $\sin\theta \approx \theta$, that is $\theta^3/6$.`,
      visual: { type: 'graph', params: { x: [0, 1.6], y: [0, 1.6], xlabel: 'θ (rad)', ylabel: '', curves: [{ fn: 'x', color: 'gold' }, { fn: 'sin(x)', color: 'ink3', width: 1.8 }], shade: [{ fn: 'x', lower: 'sin(x)', from: 0, to: 1.6, color: 'violet', alpha: 0.3 }] }, caption: t`$\theta$ (gold) and $\sin\theta$ (grey). The violet gap is what $\sin\theta \approx \theta$ throws away; it opens like a cube.` },
      explain: t`$\sin\theta = \theta - \frac{\theta^3}{6} + \cdots$, so $\sin\theta \approx \theta$ overestimates by about $\frac{\theta^3}{6}$ — a relative error of about $\frac{\theta^2}{6}$.`,
    }),
    num({
      id: 'small-angle-error', difficulty: 2,
      gen(r) {
        const d = r.pick([5, 10, 15, 20, 30]), th = d * RAD;
        const est = (th * th) / 6 * 100;
        return {
          prompt: t`Estimate, from the first neglected term, the relative error (in %) of $\sin\theta \approx \theta$ at $\theta = ${d}^\circ$.`,
          answer: est, units: '%', tol: { rel: 0.05 },
          errors: [{ value: (d * d) / 6 * 100, feedback: 'Convert the angle to radians first: the series of sin is written in radians.' }],
          hints: [t`The relative error is about $\frac{\theta^3/6}{\theta} = \frac{\theta^2}{6}$.`, t`$${d}^\circ = ${nice(th, 4)}$ rad.`],
          teach: t`The relative error of $\sin\theta \approx \theta$ is about $\theta^2/6$, with $\theta$ in radians.`,
          explain: t`$\theta = ${nice(th, 4)}$ rad, so $\frac{\theta^2}{6} = ${nice(est / 100, 3)} = ${nice(est, 3)}\%$. (Exactly: $\frac{\theta - \sin\theta}{\sin\theta} = ${nice(((th - Math.sin(th)) / Math.sin(th)) * 100, 3)}\%$.)`,
          visual: {
            type: 'graph',
            params: { x: [0, 1.6], y: [0, 1.6], xlabel: 'θ (rad)', curves: [{ fn: 'x', color: 'gold' }, { fn: 'sin(x)', color: 'ink3' }], vlines: [{ x: th, label: `${d}°` }] },
            caption: t`$\theta$ (gold) and $\sin\theta$ (grey). The gap opens like $\theta^3/6$.`,
          },
        };
      },
    }),
    mcq({
      id: 'pendulum-60', difficulty: 2,
      prompt: t`The small-angle formula $T = 2\pi\sqrt{L/g}$ comes from replacing $\sin\theta$ by $\theta$ in the pendulum’s equation of motion. Released from $60^\circ$, the real pendulum’s period is:`,
      choices: ['About 7% longer than the formula', 'About 7% shorter than the formula', 'Exactly what the formula says — the period does not depend on the swing', 'About 50% longer than the formula'],
      answer: 0,
      why: {
        1: t`$\sin\theta < \theta$, so the real restoring torque is *weaker* than the linear model’s, and a weaker pull means a slower swing.`,
        2: 'That is only true for small swings, where sin θ ≈ θ holds.',
        3: t`At $60^\circ$ ($1.05$ rad) $\sin\theta$ falls short of $\theta$ by roughly 20% at the extremes of the swing and by less elsewhere; the period grows by about 7%, not 50%.`,
      },
      hints: [t`Compare $\sin\theta$ with $\theta$: which is bigger for $\theta > 0$?`, 'A weaker restoring torque means a slower swing.'],
      teach: t`Because $\sin\theta < \theta$, large swings are slower than the small-angle formula predicts.`,
      explain: t`The restoring torque is $mgL\sin\theta$, smaller than the linear model’s $mgL\theta$, so the pendulum takes longer. Solving the full equation gives $T = 1.073 \times 2\pi\sqrt{L/g}$ at $60^\circ$ — about 7% longer. At $10^\circ$ it is only 0.2% longer.`,
      visual: { type: 'oscillator', params: { kind: 'pendulum', theta0: 60, L: 1 } },
    }),
    num({
      id: 'orbit-clock-speed', difficulty: 2,
      gen(r) {
        const [name, v] = r.pick([['the International Space Station', 7660], ['the Hubble Space Telescope', 7590], ['a GPS satellite', 3874], ['a geostationary satellite', 3075]]);
        const lag = ((v / C) ** 2 / 2) * DAY * 1e6;
        return {
          prompt: t`${name[0].toUpperCase() + name.slice(1)} moves at $${nice(v / 1000, 4)}$ km/s. Using $\gamma \approx 1 + \frac{v^2}{2c^2}$, by how many microseconds per day does its clock fall behind because of its **speed alone**? ($c = 2.998\times10^8$ m/s.)`,
          answer: lag, units: 'μs', tol: { rel: 0.01 },
          hints: [t`A moving clock runs slow by the fraction $1 - \frac{1}{\gamma} \approx \frac{v^2}{2c^2}$.`, t`$\frac{v^2}{2c^2} = \frac{(${v})^2}{2(2.998\times10^8)^2}$; multiply by $86\,400$ s and convert to μs.`],
          teach: t`To first order a moving clock loses the fraction $\frac{v^2}{2c^2}$ of its time.`,
          visual: { type: 'graph', params: { x: [0, 10], y: [0, 50], xlabel: 'speed (km/s)', ylabel: 'μs lost per day', curves: [{ fn: '86400e6*(1000x)^2/(2*299792458^2)', color: 'accent' }], vlines: [{ x: v / 1000, label: `${nice(v / 1000, 3)} km/s` }] }, caption: t`Time lost per day to speed alone, $86\,400\,\text{s}\times\frac{v^2}{2c^2}$, for orbital speeds. It grows as the square of the speed.` },
          explain: t`$\frac{v^2}{2c^2} = ${tex((v / C) ** 2 / 2, 3)}$, and $${tex((v / C) ** 2 / 2, 3)}\times 86\,400\ \text{s} = ${nice(lag, 3)}$ μs per day. (Gravity works the other way and partly cancels this; the worked example has both.)`,
        };
      },
    }),
    num({
      id: 'ke-breakdown', difficulty: 3,
      gen(r) {
        const pct = r.pick([1, 2, 5]);
        const beta = solveKE(pct);
        return {
          prompt: t`At what speed, as a fraction of $c$, does $\tfrac12mv^2$ underestimate the true kinetic energy $(\gamma - 1)mc^2$ by ${pct}%?`,
          answer: beta, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((8 * pct) / 300), feedback: t`Divide the first neglected term by the kept one: $\frac{\frac38\beta^4}{\frac12\beta^2} = \frac34\beta^2$, not $\frac{3}{8}\beta^2$.` }, { value: (4 * pct) / 300, feedback: t`You found $\beta^2$; take the square root.` }],
          hints: [t`$(\gamma - 1)mc^2 = mc^2\left(\frac{\beta^2}{2} + \frac{3\beta^4}{8} + \cdots\right)$.`, t`The relative error of keeping only $\frac{\beta^2}{2}$ is about $\frac{3\beta^4/8}{\beta^2/2} = \frac34\beta^2$.`, t`Solve $\frac34\beta^2 = ${pct / 100}$.`],
          teach: t`Kinetic energy is $(\gamma - 1)mc^2$; the relative size of its first correction is $\frac34\beta^2$.`,
          visual: { type: 'graph', params: { x: [0, 0.6], y: [0, 0.27], xlabel: 'β = v/c', ylabel: '', curves: [{ fn: '1/sqrt(1 - x^2) - 1', color: 'ink3', width: 1.8 }, { fn: 'x^2/2', color: 'gold', dash: true }] }, caption: t`Kinetic energy per $mc^2$: exact $\gamma - 1$ (grey) against $\frac12\beta^2$ (gold). The relative gap between them is what you are solving for.` },
          explain: t`$\frac34\beta^2 = ${pct / 100}$ gives $\beta = ${nice(Math.sqrt((4 * pct) / 300), 4)}$; solving exactly gives $\beta = ${nice(beta, 4)}$, about $${nice((beta * C) / 1000, 3)}$ km/s. Below that, $\tfrac12mv^2$ is good to ${pct}%.`,
        };
      },
    }),
    num({
      id: 'gnss-gravity', difficulty: 3,
      gen(r) {
        const [name, rk] = r.pick([['GPS', 26560], ['Galileo', 29600], ['GLONASS', 25510], ['a geostationary', 42164]]);
        const rr = rk * 1000, gc2 = GM_EARTH / C / C;
        const gain = gc2 * (1 / R_EARTH - 1 / rr) * DAY * 1e6;
        return {
          prompt: t`${name === 'a geostationary' ? 'A geostationary satellite orbits' : `A ${name} satellite orbits`} at $r = ${rk.toLocaleString('en-US').replace(/,/g, '\\,')}$ km from Earth’s centre. Using $\sqrt{1 - \frac{2GM}{rc^2}} \approx 1 - \frac{GM}{rc^2}$, how many microseconds per day does its clock **gain** from gravity alone, compared with a clock on the ground at $R_\oplus = 6371$ km? ($GM_\oplus = 3.986\times10^{14}\ \text{m}^3/\text{s}^2$, $c = 2.998\times10^8$ m/s.)`,
          answer: gain, units: 'μs', tol: { rel: 0.01 },
          errors: [
            { value: (gc2 / rr) * DAY * 1e6, feedback: t`That compares the satellite with a clock far from Earth. The ground clock also runs slow, by $\frac{GM}{R_\oplus c^2}$: use the difference $\frac{GM}{c^2}\left(\frac{1}{R_\oplus} - \frac1r\right)$.` },
            { value: (gc2 / R_EARTH) * DAY * 1e6, feedback: t`That is the ground clock’s offset alone. Subtract the satellite’s, $\frac{GM}{rc^2}$.` },
          ],
          hints: [t`Each clock runs slow by $\frac{GM}{rc^2}$ at its own $r$. The satellite gains the difference.`, t`$\frac{GM}{c^2} = 4.435\times10^{-3}$ m. Compute $\frac{GM}{c^2}\left(\frac{1}{R_\oplus} - \frac{1}{r}\right)$ and multiply by $86\,400$ s.`],
          teach: t`In a weak field a clock’s rate is $1 - \frac{GM}{rc^2}$, so the higher clock gains $\frac{GM}{c^2}\left(\frac{1}{r_1} - \frac{1}{r_2}\right)$.`,
          visual: { type: 'graph', params: { x: [6.371, 45], y: [0, 62], xlabel: 'r (thousand km)', ylabel: 'μs gained per day', curves: [{ fn: '4.435028e-3*(1/6.371e6 - 1/(x*1e6))*86400e6', color: 'accent' }], hlines: [{ y: 4.435028e-3 / 6.371e6 * 86400e6, label: 'clock far from Earth', color: 'ink3' }], vlines: [{ x: rk / 1000, label: name.replace('a geostationary', 'GEO') }] }, caption: t`Gravity’s gain per day for a clock at radius $r$ compared with one on the ground. It levels off towards the dashed line: a clock infinitely far away gains $60$ μs a day.` },
          explain: t`$4.435\times10^{-3}\left(\frac{1}{6.371\times10^6} - \frac{1}{${nice(rr / 1e6, 5)}\times10^6}\right) = ${tex(gain / DAY / 1e6, 3)}$; times $86\,400$ s that is $${nice(gain, 3)}$ μs per day.`,
        };
      },
    }),
    mcq({
      id: 'weak-field-fails', difficulty: 2,
      prompt: t`Where does $\sqrt{1 - \frac{2GM}{rc^2}} \approx 1 - \frac{GM}{rc^2}$ stop being accurate to 1%?`,
      choices: [
        t`At the surface of a neutron star, where $\frac{GM}{rc^2} \approx 0.17$`,
        t`At the surface of the Sun, where $\frac{GM}{rc^2} \approx 2\times10^{-6}$`,
        t`At the surface of a white dwarf, where $\frac{GM}{rc^2} \approx 3\times10^{-4}$`,
        t`On Earth, where $\frac{GM}{rc^2} \approx 7\times10^{-10}$`,
      ],
      answer: 0,
      why: {
        1: t`The error is about $\frac{x^2}{2} = 2\times10^{-12}$ here — the approximation is superb.`,
        2: t`The error is about $\frac{x^2}{2} \approx 5\times10^{-8}$: still excellent.`,
        3: t`The error is about $2\times10^{-19}$; GPS can use the linear formula with room to spare.`,
      },
      hints: [t`The first neglected term of $\sqrt{1 - 2x}$ is $-\frac{x^2}{2}$.`, t`Which $x$ makes $\frac{x^2}{2}$ bigger than $0.01$?`],
      teach: t`An approximation fails when its small parameter is no longer small: for weak-field clocks, when $GM/rc^2$ reaches about $0.1$.`,
      explain: t`With $x = 0.17$: exact $\sqrt{1 - 0.34} = 0.81$, approximate $0.83$ — a 2% error. Near a neutron star, and certainly near a black hole (where $x \to 0.5$ and the exact rate goes to 0 while the approximation gives $0.5$), you need the full formula.`,
      visual: {
        type: 'graph',
        params: { x: [0, 0.5], y: [0, 1.05], xlabel: 'x = GM/rc²', curves: [{ fn: 'sqrt(1 - 2x)', domain: [0, 0.5], color: 'ink3' }, { fn: '1 - x', color: 'gold' }, { fn: '1 - x - x^2/2', color: 'teal', dash: true }] },
        caption: t`Exact clock rate $\sqrt{1 - 2x}$ (grey) against the first-order (gold) and second-order (teal, dashed) approximations. $x = 0.5$ is a black hole’s horizon.`,
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-parker', difficulty: 2,
      prompt: t`At its closest approach in December 2024, NASA’s Parker Solar Probe moved at about $192$ km/s, the fastest any spacecraft has flown. Using $\gamma \approx 1 + \frac{v^2}{2c^2}$, how many **milliseconds** per day did its clock lose because of its speed alone? ($c = 2.998\times10^8$ m/s.)`,
      answer: ((192e3 / C) ** 2 / 2) * DAY * 1e3, units: 'ms', tol: { rel: 0.01 },
      hints: [t`The fraction lost is $\frac{v^2}{2c^2}$. Multiply by $86\,400$ s.`],
      teach: t`Even the fastest spacecraft has $v/c \sim 10^{-3}$, so the first term of the series is all you need.`,
      explain: t`$\frac{v}{c} = 6.40\times10^{-4}$, so $\frac{v^2}{2c^2} = 2.05\times10^{-7}$, and over $86\,400$ s that is $17.7$ ms per day. The next term, $\frac38\frac{v^4}{c^4}$, is $10^{-6}$ times smaller.`,
    }),
    num({
      id: 'cp-neutron-star', difficulty: 3,
      gen(r) {
        const M = r.pick([1.2, 1.4, 2.0]), Rk = r.pick([11, 12, 13]);
        const x = (M * GM_SUN) / C / C / (Rk * 1000);
        const ex = Math.sqrt(1 - 2 * x), err = ((1 - x - ex) / ex) * 100;
        return {
          prompt: t`A neutron star has mass $${M}\,M_\odot$ and radius $${Rk}$ km. By what percentage does the weak-field approximation $1 - \frac{GM}{Rc^2}$ overestimate the exact clock rate $\sqrt{1 - \frac{2GM}{Rc^2}}$ at its surface? Use $\frac{GM_\odot}{c^2} = 1.477$ km.`,
          answer: err, units: '%', tol: { rel: 0.02 },
          errors: [{ value: x * 100, feedback: t`That is $\frac{GM}{Rc^2}$ itself. Compare $1 - x$ with $\sqrt{1 - 2x}$.` }, { value: (x * x) / 2 * 100, feedback: t`That is the first neglected term, $\frac{x^2}{2}$ — but here $x$ is not small, so the later terms matter too. Compute the exact square root.` }],
          hints: [t`$x = \frac{GM}{Rc^2} = \frac{${M}\times 1.477\ \text{km}}{${Rk}\ \text{km}}$.`, t`Compute $\frac{(1 - x) - \sqrt{1 - 2x}}{\sqrt{1 - 2x}}\times100\%$.`],
          teach: 'When the small parameter is about 0.2, even the first neglected term underestimates the error: compute the exact expression.',
          visual: { type: 'graph', params: { x: [0, 0.3], y: [0.6, 1.02], xlabel: 'x = GM/Rc²', ylabel: 'clock rate', curves: [{ fn: 'sqrt(1 - 2x)', color: 'ink3', width: 1.8 }, { fn: '1 - x', color: 'gold', dash: true }], vlines: [{ x, label: `x = ${nice(x, 3)}` }] }, caption: t`Exact $\sqrt{1 - 2x}$ (grey) against $1 - x$ (gold); the dashed line marks this star’s surface.` },
          explain: t`$x = ${nice(x, 3)}$: exact $\sqrt{1 - 2x} = ${nice(ex, 4)}$, approximate $1 - x = ${nice(1 - x, 4)}$, an overestimate of $${nice(err, 3)}\%$. The first neglected term alone, $\frac{x^2}{2}$, would suggest only $${nice((x * x) / 2 * 100, 2)}\%$.`,
        };
      },
    }),
    num({
      id: 'cp-solar-redshift', difficulty: 3, transfer: true,
      prompt: t`Light leaving the Sun’s surface loses energy climbing out of its gravity: its frequency is lower by the factor $\sqrt{1 - \frac{2GM_\odot}{R_\odot c^2}}$, a fractional **redshift** $z$. Use the weak-field approximation to find $z$, and express it as the speed $cz$ a Doppler shift would need to mimic it. ($GM_\odot = 1.327\times10^{20}\ \text{m}^3/\text{s}^2$, $R_\odot = 6.957\times10^8$ m, $c = 2.998\times10^8$ m/s.)`,
      answer: GM_SUN / (R_SUN * C), units: 'm/s', tol: { rel: 0.01 },
      errors: [{ value: (2 * GM_SUN) / (R_SUN * C), feedback: t`The square root halves the exponent: $\sqrt{1 - 2x} \approx 1 - x$, so $z \approx x = \frac{GM}{Rc^2}$, not $2x$.` }],
      hints: [t`$\sqrt{1 - 2x} \approx 1 - x$ with $x = \frac{GM_\odot}{R_\odot c^2}$, so $z \approx x$.`, t`$cz = \frac{GM_\odot}{R_\odot c}$.`],
      teach: 'A weak gravitational redshift is z ≈ GM/(Rc²), the first term of a binomial series.',
      explain: t`$z \approx \frac{GM_\odot}{R_\odot c^2} = 2.12\times10^{-6}$, so $cz = \frac{1.327\times10^{20}}{(6.957\times10^{8})(2.998\times10^{8})} \approx 636$ m/s. Spectroscopic measurements of sunlight agree with this to about 1%.`,
    }),
    mcq({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      prompt: t`The waveforms LIGO searches for are built partly from the **post-Newtonian expansion**, a series in powers of $v/c$ for two orbiting black holes. In the last orbits before the black holes of GW150914 merged, their orbital speed reached about half the speed of light. What does that imply?`,
      choices: [
        t`The neglected terms are no longer small, so the merger has to be modelled with full numerical relativity`,
        t`Nothing: any series converges if you keep enough terms`,
        t`The expansion becomes more accurate near merger, because the signal is strongest there`,
        t`The black holes must have been moving faster than light, which is impossible`,
      ],
      answer: 0,
      why: {
        1: t`A series in $v/c$ is useful only while $v/c$ is small; at $v/c \approx 0.5$ each correction is not much smaller than the last.`,
        2: 'Signal strength has nothing to do with how fast a series in v/c converges.',
        3: t`Half the speed of light is $v/c \approx 0.5$ — slower than light, just not *slow*.`,
      },
      hints: [t`A series in $\frac{v}{c}$: what happens to the size of each successive term when $\frac{v}{c} \approx 0.5$?`, 'Compare with the Lorentz factor: at β = 0.5, how good is 1 + β²/2?'],
      teach: t`A truncated series is trustworthy only while its expansion parameter is small; near merger $v/c$ is not.`,
      visual: { type: 'graph', params: { x: [0, 0.7], y: [0.98, 1.45], xlabel: 'v/c', ylabel: 'γ', curves: [{ fn: '1/sqrt(1 - x^2)', color: 'ink3', width: 1.8 }, { fn: '1 + x^2/2', color: 'gold', dash: true }], vlines: [{ x: 0.5, label: 'v/c ≈ 0.5' }] }, caption: t`An analogue: the Lorentz factor (grey) against its two-term series (gold). At $v/c \approx 0.5$ the neglected terms are clearly not negligible.` },
      explain: t`For the slow early inspiral, a few terms in $v/c$ describe the signal well. At $v/c \approx 0.5$ the neglected terms are comparable to the kept ones (compare $\gamma$ at $\beta = 0.5$: $1.155$ exact against $1.125$ from two terms). So the late inspiral and merger are computed by solving Einstein’s equations numerically, and the waveform models are calibrated against those simulations.`,
    }),
  ],
  sources: [
    { label: 'N. Ashby, “Relativity in the Global Positioning System”, Living Reviews in Relativity 6, 1 (2003)', url: 'https://doi.org/10.12942/lrr-2003-1' },
    { label: 'OpenStax University Physics Vol. 3, §5.9 Relativistic Energy', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-9-relativistic-energy' },
    { label: 'B. P. Abbott et al. (LIGO/Virgo), “Observation of Gravitational Waves from a Binary Black Hole Merger”, PRL 116, 061102 (2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102' },
  ],
});
