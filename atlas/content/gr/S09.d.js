// Proper time as the integral of the line element — Derivation Mode.
// dτ = √(−g_μν dx^μ dx^ν)/c along the worldline; its weak-field expansion
// dτ/dt ≈ 1 + Φ/c² − v²/2c²; the GPS budget from Ashby's inputs; the ISS;
// Hafele–Keating's signs; tower clocks; the clock hypothesis (muons in a
// storage ring); and the exact circular-orbit rate in Schwarzschild.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt, sig } from '../../src/core/format.js';
import { C, GM_EARTH, R_EARTH, GM_MOON, D_MOON, DAY, YEAR, TAU_MU, sci, round, grp } from './_deriv.js';

const t = String.raw;

const C2 = C * C;
const DEG = Math.PI / 180;
const PHI0 = -6.969290134e-10;           // Φ₀/c² on the rotating geoid, centrifugal term included (Ashby 2003)
const A_GPS = 2.656175e7;                // m, GPS orbit radius (Ashby 2003)
const RKM = R_EARTH / 1e3;               // 6371 km
const UDAY = DAY * 1e6;                  // μs per day per unit rate
// rates of an orbiting clock relative to a geoid clock (fractional)
const gravTerm = (a) => -GM_EARTH / (a * C2) - PHI0;
const speedTerm = (a) => -GM_EARTH / (2 * a * C2);
const netTerm = (a) => gravTerm(a) + speedTerm(a);
// the explore's simpler model: non-rotating spherical Earth, x = altitude in 1000 km
const K = (UDAY * GM_EARTH) / C2 / 1e6;  // μs/day × (1000 km)
const R6 = R_EARTH / 1e6;                // 6.371
const gravX = (x) => K * (1 / R6 - 1 / (R6 + x));
const speedX = (x) => -K / 2 / (R6 + x);
const netX = (x) => gravX(x) + speedX(x);

// orbits to scale around Earth (radius 1): [radius in km, label, colour, dashed]
function orbitDiagram(orbits, { range = 5.4, caption, sat = null } = {}) {
  const curves = [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6 }];
  for (const [rkm, label, color, dash, at] of orbits) {
    const q = round(rkm / RKM, 5);
    curves.push({ param: [`${q}*cos(t)`, `${q}*sin(t)`], t: [0, 6.2832], color, width: dash ? 1.2 : 2, dash: !!dash, label, labelAt: at ?? 0.5, labelDx: 6, labelDy: -6 });
  }
  const params = {
    x: [-range * 1.45, range * 1.45], y: [-range, range], equal: true, axes: false, grid: false,
    curves,
    shade: [{ fn: 'sqrt(1 - x^2)', lower: '-sqrt(1 - x^2)', from: -1, to: 1, color: 'accent', alpha: 0.35 }],
  };
  if (sat) {
    const q = sat / RKM, th = 40 * DEG;
    params.points = [
      { x: round(q * Math.cos(th), 4), y: round(q * Math.sin(th), 4), color: 'gold', r: 4.5, label: 'satellite clock', labelDx: 8, labelDy: -8 },
      { x: round(Math.cos(th), 4), y: round(Math.sin(th), 4), color: 'ink', r: 4, label: 'ground clock', labelDx: 8, labelDy: 14 },
    ];
    params.arrows = [{ from: [round(q * Math.cos(th), 4), round(q * Math.sin(th), 4)], to: [round(q * Math.cos(th) - 1.1 * Math.sin(th), 4), round(q * Math.sin(th) + 1.1 * Math.cos(th), 4)], color: 'gold', label: 'v' }];
  }
  return { type: 'graph', params, caption };
}

// Hafele–Keating: Earth from above the North Pole, speeds in the Earth-centred inertial frame
const hkPicture = {
  type: 'graph',
  params: {
    x: [-3.2, 3.2], y: [-2.2, 2.2], equal: true, axes: false, grid: false,
    curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6 }],
    shade: [{ fn: 'sqrt(1 - x^2)', lower: '-sqrt(1 - x^2)', from: -1, to: 1, color: 'accent', alpha: 0.3 }],
    points: [
      { x: 0, y: 1, color: 'ink', r: 4, label: 'ground: ωR', labelDx: -46, labelDy: -12 },
      { x: round(1.18 * Math.cos(25 * DEG), 4), y: round(1.18 * Math.sin(25 * DEG), 4), color: 'gold', r: 4, label: 'eastbound: ωR + v', labelDx: 10, labelDy: 14 },
      { x: round(1.18 * Math.cos(155 * DEG), 4), y: round(1.18 * Math.sin(155 * DEG), 4), color: 'violet', r: 4, label: 'westbound: ωR − v', labelDx: -12, labelDy: -4, labelAlign: 'right' },
      { x: 0, y: 0, color: 'ink3', r: 3, label: 'N', labelDx: 6, labelDy: 14 },
    ],
    arrows: [
      { from: [0, 1], to: [-0.93, 1], color: 'ink' },
      { from: [round(1.18 * Math.cos(25 * DEG), 4), round(1.18 * Math.sin(25 * DEG), 4)], to: [round(1.18 * Math.cos(25 * DEG) - 1.39 * Math.sin(25 * DEG), 4), round(1.18 * Math.sin(25 * DEG) + 1.39 * Math.cos(25 * DEG), 4)], color: 'gold' },
      { from: [round(1.18 * Math.cos(155 * DEG), 4), round(1.18 * Math.sin(155 * DEG), 4)], to: [round(1.18 * Math.cos(155 * DEG) - 0.47 * Math.sin(155 * DEG), 4), round(1.18 * Math.sin(155 * DEG) + 0.47 * Math.cos(155 * DEG), 4)], color: 'violet' },
    ],
  },
  caption: t`Earth seen from above the North Pole, in the Earth-centred inertial frame where the weak-field formula applies (arrows to scale with each other, not with Earth). The ground moves east at $\omega R\cos\lambda$ — 465 m/s at the equator; an eastbound plane adds its airspeed $v$, a westbound one subtracts it.`,
};

export default lesson({
  id: 'gr.S09.d',
  title: 'Proper time as the integral of the line element',
  minutes: 16,
  difficulty: 3,
  mode: 'derivation',
  badges: ['est-obs'],
  intro: t`A clock measures the interval along its own worldline: $c^2\,d\tau^2 = -ds^2$. Add up $d\tau$ along any parametrized path $x^\mu(\lambda)$ and you have the reading of any clock in any spacetime — the parameter drops out, because the integrand is unchanged by relabelling $\lambda$. In the weak-field metric $ds^2 = -(1 + 2\Phi/c^2)\,c^2dt^2 + (1 - 2\Phi/c^2)\,d\vec x^{\,2}$, a clock moving at speed $v$ has $d\tau/dt = \sqrt{1 + 2\Phi/c^2 - (1 - 2\Phi/c^2)\,v^2/c^2} \approx 1 + \Phi/c^2 - v^2/2c^2$: gravity and motion enter as two separate terms that simply add. That one formula budgets GPS, the space station, clocks flown around the world and clocks raised by a few centimetres, to the precision each is measured.`,
  equation: t`\Delta\tau = \frac1c\int\sqrt{-g_{\mu\nu}\,\frac{dx^\mu}{d\lambda}\frac{dx^\nu}{d\lambda}}\;d\lambda \;\approx\; \int\left(1 + \frac{\Phi}{c^2} - \frac{v^2}{2c^2}\right)dt`,
  symbols: [
    { tex: '\\tau', text: 'proper time: what a clock carried along the worldline reads' },
    { tex: '\\lambda', text: t`any parameter along the worldline — coordinate time $t$ is the usual choice; the result does not depend on it` },
    { tex: 'g_{\\mu\\nu}', text: t`the metric; for a timelike worldline $g_{\mu\nu}\,dx^\mu dx^\nu < 0$ (signature $-{+}{+}{+}$), hence the minus sign` },
    { tex: '\\Phi', text: t`the Newtonian potential, $-GM/r$ outside a round body: zero far away, negative near masses` },
    { tex: 'v', text: 'the clock’s speed in the frame where the metric has this form — Earth-centred and non-rotating, for satellites' },
    { tex: 'c', text: t`the speed of light, $${grp(C)}$ m/s` },
  ],
  why: t`Clock comparisons are the most precise measurements in physics, and every one of them — satellite navigation, clocks flown around the world, optical clocks a few centimetres apart in height — is a comparison of two proper-time integrals along two worldlines.`,
  visual: {
    type: 'graph',
    title: 'An orbiting clock against a ground clock',
    lead: t`For a circular orbit of radius $r$, $\Phi = -GM/r$ and $v^2 = GM/r$, so the orbiting clock gains $\dfrac{GM}{c^2}\left(\dfrac1R - \dfrac1r\right)$ on the ground clock from height and loses $\dfrac{GM}{2rc^2}$ to speed, every second.`,
    tasks: [
      t`At the space station’s 400 km the speed term wins: its clocks lose about $${fmt(-netX(0.4), 3)}$ μs a day against ours.`,
      t`Raise the orbit and find where the two terms cancel. Setting $\dfrac1R - \dfrac1r = \dfrac1{2r}$ gives $r = \tfrac32R$ exactly — an altitude of $${grp(Math.round(RKM / 2))}$ km.`,
      t`At GPS altitude, about $${grp(20200)}$ km, the net is $+${fmt(netX(20.19075), 3)}$ μs a day; the worked example redoes it with the geoid’s potential.`,
    ],
    params: {
      x: [0, 40], y: [-34, 58], xlabel: 'orbit altitude (1000 km)', ylabel: 'μs per day',
      sliders: [{ key: 'h', label: 'Orbit altitude', min: 0, max: 40000, step: 50, value: 400, unit: '\\text{km}', explain: t`A circular orbit at this height above a non-rotating Earth of radius $${grp(RKM)}$ km.` }],
      curves: [
        { fn: `${round(K, 6)}*(1/${R6} - 1/(${R6} + x))`, color: 'gold', width: 2.2, label: 'height: gain', labelAt: 11, labelDx: -10, labelDy: -14 },
        { fn: `-${round(K / 2, 6)}/(${R6} + x)`, color: 'violet', width: 2.2, label: 'speed: loss', labelAt: 30, labelDy: 16 },
        { fn: `${round(K, 6)}*(1/${R6} - 1/(${R6} + x)) - ${round(K / 2, 6)}/(${R6} + x)`, color: 'accent', width: 2.8, label: 'net', labelAt: 33, labelDy: 18 },
      ],
      hlines: [{ y: 0, color: 'ink3' }],
      vlines: [{ x: 'h/1000', color: 'ink2' }],
      points: [
        { x: 0.4, y: round(netX(0.4), 4), color: 'ink', r: 3.5, label: 'ISS', labelDx: 8, labelDy: 4 },
        { x: 20.19, y: round(netX(20.19), 4), color: 'ink', r: 3.5, label: 'GPS', labelDx: -8, labelDy: -10, labelAlign: 'right' },
        { x: 35.786, y: round(netX(35.786), 4), color: 'ink', r: 3.5, label: 'geostationary', labelDx: -8, labelDy: -10, labelAlign: 'right' },
      ],
      readouts: [
        { label: 'height term (μs/day)', expr: `${round(K, 6)}*(1/${R6} - 1/(${R6} + h/1000))`, digits: 3 },
        { label: 'speed term (μs/day)', expr: `-${round(K / 2, 6)}/(${R6} + h/1000)`, digits: 3 },
        { label: 'net (μs/day)', expr: `${round(K, 6)}*(1/${R6} - 1/(${R6} + h/1000)) - ${round(K / 2, 6)}/(${R6} + h/1000)`, digits: 3 },
        { label: 'orbital speed (km/s)', expr: `sqrt(398600.4418/(${RKM} + h))`, digits: 3 },
      ],
    },
    caption: t`How much an orbiting clock gains (+) or loses (−) per day against a clock on the ground: height (gold), speed (violet) and their sum (blue). Ground clock on a non-rotating, spherical Earth; Earth’s rotation and flattening shift these numbers by under 0.1 μs a day.`,
  },
  example: {
    prompt: t`Derive the GPS clock correction from Ashby’s inputs: orbit radius $a = ${grp(A_GPS / 1e3)}$ km, $GM_\oplus = ${sci(GM_EARTH, 10)}\ \text{m}^3/\text{s}^2$, and for clocks on Earth’s rotating geoid $\Phi_0/c^2 = ${sci(PHI0, 10)}$ (this includes the ground’s rotation). By how much must the 10.23 MHz satellite clocks be offset?`,
    visual: orbitDiagram([[A_GPS / 1e3, 'GPS orbit', 'gold', false, 2.2]], { range: 5, sat: A_GPS / 1e3, caption: t`To scale: Earth and the GPS orbit, radius $${grp(Math.round(A_GPS / 1e3))}$ km. The satellite clock moves at about 3.9 km/s, high in Earth’s potential well; the ground clock sits deep in it.` }),
    steps: [
      { label: 'The rate formula', text: t`Along the clock’s worldline $d\vec x = \vec v\,dt$, so $c^2d\tau^2 = (1 + 2\Phi/c^2)\,c^2dt^2 - (1 - 2\Phi/c^2)\,v^2dt^2$. Dividing by $c^2dt^2$, dropping $\Phi v^2/c^4$ and taking the square root: $d\tau/dt \approx 1 + \Phi/c^2 - v^2/2c^2$.` },
      { label: 'The ground clock', text: t`Every clock on the geoid ticks at the same rate, $1 + \Phi_0/c^2$, with the effect of the ground’s rotation already folded into $\Phi_0$ — which is why the world’s atomic clocks can be combined into one time scale.` },
      { label: 'The satellite clock', text: t`In a circular orbit $\Phi/c^2 = -GM/(ac^2) = ${sci(-GM_EARTH / (A_GPS * C2), 5)}$ and $v^2 = GM/a$, so $v^2/2c^2 = ${sci(GM_EARTH / (2 * A_GPS * C2), 5)}$.` },
      { label: 'Height', text: t`$-GM/(ac^2) - \Phi_0/c^2 = ${sci(gravTerm(A_GPS), 5)}$; over a day of $${grp(DAY)}$ s that is $+${fmt(gravTerm(A_GPS) * UDAY, 4)}$ μs.` },
      { label: 'Speed', text: t`$-v^2/2c^2$ costs $${fmt(speedTerm(A_GPS) * UDAY, 3)}$ μs a day. Net: the satellite clock gains $${fmt(netTerm(A_GPS) * UDAY, 4)}$ μs a day, a fractional rate of $${sci(netTerm(A_GPS), 5)}$.` },
      { label: 'The fix', text: t`So the clocks are built to tick at $10.23\ \text{MHz}\times(1 - ${sci(netTerm(A_GPS), 5)}) = ${(10.23 * (1 - netTerm(A_GPS))).toFixed(11)}$ MHz on the ground, and arrive in orbit at 10.23 MHz. Uncorrected, they would be ${fmt(netTerm(A_GPS) * 120 * 1e9, 2)} ns off after two minutes — ${fmt(netTerm(A_GPS) * 120 * C, 2)} m of light travel.` },
    ],
    answer: t`$+${fmt(gravTerm(A_GPS) * UDAY, 3)}$ μs/day from height, $${fmt(speedTerm(A_GPS) * UDAY, 3)}$ μs/day from speed, net $+${fmt(netTerm(A_GPS) * UDAY, 3)}$ μs/day; factory frequency ${(10.23 * (1 - netTerm(A_GPS))).toFixed(11)} MHz.`,
  },
  practice: [
    order({
      id: 'rate-order', difficulty: 2,
      prompt: t`Put the steps from the weak-field metric to the clock-rate formula in order.`,
      items: [
        t`Write the metric: $ds^2 = -(1 + 2\Phi/c^2)\,c^2dt^2 + (1 - 2\Phi/c^2)\,d\vec x^{\,2}$.`,
        t`On the clock’s worldline put $d\vec x = \vec v\,dt$ and $c^2d\tau^2 = -ds^2$.`,
        t`Divide by $c^2dt^2$: $(d\tau/dt)^2 = 1 + 2\Phi/c^2 - (1 - 2\Phi/c^2)\,v^2/c^2$.`,
        t`Drop $\Phi v^2/c^4$, which is second order: $(d\tau/dt)^2 \approx 1 + 2\Phi/c^2 - v^2/c^2$.`,
        t`Take the square root with $\sqrt{1 + \epsilon} \approx 1 + \epsilon/2$: $d\tau/dt \approx 1 + \Phi/c^2 - v^2/2c^2$.`,
      ],
      hints: ['Start from the metric and end with the rate.', 'Expand only after the exact expression for (dτ/dt)² is written down.'],
      teach: t`The weak-field clock rate comes from putting the clock’s worldline into the metric and expanding to first order in $\Phi/c^2$ and $v^2/c^2$.`,
      explain: t`The order matters for honesty: the exact expression comes first, and only then are terms of order $c^{-4}$ dropped. Near Earth $|\Phi|/c^2 \approx 7\times10^{-10}$ and $v^2/c^2 \lesssim 10^{-9}$, so the dropped terms are a few parts in $10^{19}$ — still below today’s best optical clocks, which reach about $10^{-18}$.`,
      visual: orbitDiagram([[RKM + 400, 'ISS', 'violet', false, 0.9], [A_GPS / 1e3, 'GPS', 'gold', false, 2.2], [42164, 'geostationary', 'teal', true, 5.75]], { range: 7.2, caption: t`To scale: the orbits whose clocks this lesson budgets — the space station at 400 km, GPS at $${grp(20200)}$ km, and geostationary at $${grp(35786)}$ km.` }),
    }),
    expr({
      id: 'circular-exact', difficulty: 3,
      prompt: t`Beyond the weak field: a clock orbits a black hole on a circle of radius $r$, where the Schwarzschild metric in the equatorial plane is $ds^2 = -\left(1 - \dfrac{2GM}{rc^2}\right)c^2dt^2 + \dfrac{dr^2}{1 - 2GM/rc^2} + r^2\,d\phi^2$. Its angular speed obeys Kepler’s law exactly in these coordinates, $(d\phi/dt)^2 = GM/r^3$. Find $d\tau/dt$.`,
      answer: 'sqrt(1 - 3*G*M/(r*c^2))', answerTeX: t`\sqrt{1 - \dfrac{3GM}{rc^2}}`,
      lhs: t`\dfrac{d\tau}{dt}`,
      vars: { G: [0.5, 1], M: [0.5, 1], r: [4, 8], c: [1, 1.5] },
      errors: [
        { answer: 'sqrt(1 - 2*G*M/(r*c^2))', feedback: t`That is a clock hovering at $r$. The orbiting clock also moves: add $-r^2(d\phi/dt)^2/c^2 = -GM/(rc^2)$.` },
        { answer: '1 - 3*G*M/(2*r*c^2)', feedback: t`That is the first-order expansion — the weak-field answer. The question asks for the exact rate.` },
        { answer: 'sqrt(1 - G*M/(r*c^2))', feedback: t`You kept the speed term but lost the gravitational one, $-2GM/(rc^2)$, from $g_{tt}$.` },
      ],
      hints: [t`With $dr = 0$: $c^2d\tau^2 = \left(1 - \dfrac{2GM}{rc^2}\right)c^2dt^2 - r^2\,d\phi^2$.`, t`Divide by $c^2dt^2$ and use $r^2(d\phi/dt)^2 = GM/r$.`],
      teach: t`On a circular orbit, $(d\tau/dt)^2 = -g_{tt}/c^2 - r^2\Omega^2/c^2 = 1 - 3GM/(rc^2)$: gravity contributes two parts and motion one.`,
      explain: t`$(d\tau/dt)^2 = 1 - \dfrac{2GM}{rc^2} - \dfrac{GM}{rc^2} = 1 - \dfrac{3GM}{rc^2}$. Expanding gives $1 - \tfrac32 GM/(rc^2)$, the weak-field sum of $\Phi/c^2$ and $-v^2/2c^2$. Exactly, the rate reaches zero at $r = 3GM/c^2$, the photon sphere, where only light can circle; at the innermost stable orbit, $6GM/c^2$, it is $1/\sqrt2 = 0.707$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-6.4, 6.4], y: [-4.6, 4.6], equal: true, axes: false, grid: false,
          curves: [
            { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2 },
            { param: ['1.5*cos(t)', '1.5*sin(t)'], t: [0, 6.2832], color: 'bad', width: 1.4, dash: true },
            { param: ['3*cos(t)', '3*sin(t)'], t: [0, 6.2832], color: 'teal', width: 1.4, dash: true },
            { param: ['4.3*cos(t)', '4.3*sin(t)'], t: [0, 6.2832], color: 'gold', width: 2.2 },
          ],
          points: [{ x: round(4.3 * Math.cos(35 * DEG), 4), y: round(4.3 * Math.sin(35 * DEG), 4), color: 'gold', r: 4.5, label: 'orbiting clock', labelDx: 8, labelDy: -8 }],
          arrows: [{ from: [round(4.3 * Math.cos(35 * DEG), 4), round(4.3 * Math.sin(35 * DEG), 4)], to: [round(4.3 * Math.cos(35 * DEG) - 1.2 * Math.sin(35 * DEG), 4), round(4.3 * Math.sin(35 * DEG) + 1.2 * Math.cos(35 * DEG), 4)], color: 'gold' }],
        },
        caption: t`A clock on a circular orbit around a black hole, to scale. Grey: the horizon, at $2GM/c^2$. Red dashed: the photon sphere, $3GM/c^2$, where only light can circle. Teal dashed: the innermost stable circular orbit, $6GM/c^2$. Gold: the clock’s orbit.`,
      },
    }),
    num({
      id: 'gnss-offset', difficulty: 3,
      gen(r) {
        const [name, a] = r.pick([['Galileo', 2.96e7], ['GLONASS', 2.551e7], ['BeiDou (medium orbit)', 2.7906e7]]);
        const ans = 10.23e6 * netTerm(a) * 1e3;                   // mHz
        return {
          prompt: t`The ${name} navigation satellites orbit at $a = ${grp(a / 1e3)}$ km. Their clocks, like GPS’s, should tick at 10.23 MHz as seen from Earth’s geoid ($\Phi_0/c^2 = ${sci(PHI0, 7)}$, $GM_\oplus = ${sci(GM_EARTH, 7)}\ \text{m}^3/\text{s}^2$). By how many millihertz must their frequency be set low before launch?`,
          answer: ans, units: 'mHz', tol: { rel: 0.01 },
          errors: [
            { value: 10.23e6 * gravTerm(a) * 1e3, feedback: t`That is the height term alone; the orbital speed, $v^2 = GM/a$, takes back $GM/(2ac^2)$.` },
            { value: 10.23e6 * (gravTerm(a) - speedTerm(a)) * 1e3, feedback: 'Motion slows a clock: the speed term subtracts from the height gain.' },
            { value: Math.abs(10.23e6 * (-GM_EARTH / (a * C2) + speedTerm(a)) * 1e3), feedback: t`Compare with the ground clock: the rate difference uses $\Phi - \Phi_0$, not $\Phi$ alone — on its own the orbiting clock would seem to run slow.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.abs(ans)),
          hints: [t`Fractional rate gain: $\left(-\dfrac{GM}{ac^2} - \dfrac{\Phi_0}{c^2}\right) - \dfrac{GM}{2ac^2}$.`, t`Multiply that by $10.23\times10^{6}$ Hz and express in mHz.`],
          teach: t`A satellite clock’s rate relative to the geoid is $(\Phi - \Phi_0)/c^2 - v^2/2c^2$; the factory offset is the clock frequency times that.`,
          explain: t`Height: $${sci(gravTerm(a), 4)}$; speed: $${sci(speedTerm(a), 4)}$; net $${sci(netTerm(a), 4)}$, or $+${fmt(netTerm(a) * UDAY, 3)}$ μs a day. Times 10.23 MHz: ${fmt(ans, 4)} mHz low. Higher orbits gain more: Galileo, the highest of the three, gains the most.`,
          visual: orbitDiagram([[A_GPS / 1e3, 'GPS', 'ink3', true, 5.3], [a / 1e3, name.split(' ')[0], 'gold', false, 0.6]], { range: 5.2, caption: t`To scale: the ${name} orbit (gold) and, for comparison, the GPS orbit (dashed).` }),
        };
      },
    }),
    num({
      id: 'iss-stay', difficulty: 3,
      prompt: t`An astronaut spends 182.6 days on the space station, in a circular orbit 400 km up ($r = ${grp(RKM + 400)}$ km). Using the geoid potential $\Phi_0/c^2 = ${sci(PHI0, 7)}$ for the clocks at home and $GM_\oplus = ${sci(GM_EARTH, 7)}\ \text{m}^3/\text{s}^2$, by how many milliseconds does the astronaut’s clock fall behind?`,
      answer: -netTerm(R_EARTH + 4e5) * 182.6 * DAY * 1e3, units: 'ms', tol: { rel: 0.01 },
      errors: [
        { value: -speedTerm(R_EARTH + 4e5) * 182.6 * DAY * 1e3, feedback: t`That is the speed term alone. Being ${400} km higher wins back a little: $(\Phi - \Phi_0)/c^2 = ${sci(gravTerm(R_EARTH + 4e5), 3)}$.` },
        { value: (-speedTerm(R_EARTH + 4e5) + gravTerm(R_EARTH + 4e5)) * 182.6 * DAY * 1e3, feedback: 'Height makes the station clock run fast, not slow: subtract the height gain from the speed loss.' },
      ],
      hints: [t`Speed term: $v^2/2c^2 = GM/(2rc^2)$. Height term: $-GM/(rc^2) - \Phi_0/c^2$.`, t`Net rate times $182.6\times${grp(DAY)}$ s.`],
      teach: t`Low orbits are dominated by speed: the station is barely higher than we are, but moves at 7.7 km/s.`,
      explain: t`Height: $+${fmt(gravTerm(R_EARTH + 4e5) * UDAY, 3)}$ μs/day; speed: $${fmt(speedTerm(R_EARTH + 4e5) * UDAY, 3)}$ μs/day; net $${fmt(netTerm(R_EARTH + 4e5) * UDAY, 3)}$ μs/day. Over 182.6 days the astronaut’s clock falls ${fmt(-netTerm(R_EARTH + 4e5) * 182.6 * DAY * 1e3, 3)} ms behind: she comes home younger by about four and a half thousandths of a second.`,
      visual: orbitDiagram([[RKM + 400, 'ISS, 400 km', 'violet', false, 0.75], [A_GPS / 1e3, 'GPS', 'ink3', true, 2.2]], { range: 5, caption: t`To scale: the space station’s orbit hugs the Earth; GPS (dashed) for comparison.` }),
    }),
    expr({
      id: 'hafele-keating', difficulty: 3,
      prompt: t`Hafele and Keating flew atomic clocks around the world in 1971. In the Earth-centred inertial frame the ground clock moves east at $u = \omega R\cos\lambda$ and an eastbound plane at $u + v$. Using $d\tau/dt \approx 1 + \Phi/c^2 - v^2/2c^2$, find the speed term’s contribution to the airborne clock’s rate relative to the ground clock: $(d\tau/dt)_{\text{plane}} - (d\tau/dt)_{\text{ground}}$ from motion alone.`,
      answer: '-(2*u*v + v^2)/(2*c^2)', answerTeX: t`-\dfrac{2uv + v^2}{2c^2}`,
      lhs: t`\Delta\!\left(\dfrac{d\tau}{dt}\right)_{\text{speed}}`,
      vars: { u: [300, 465], v: [150, 250], c: [3000, 5000] },
      errors: [
        { answer: '-v^2/(2*c^2)', feedback: t`That treats the ground as at rest. In the inertial frame the ground already moves at $u$, so the plane’s speed is $u + v$: $(u + v)^2 - u^2 = 2uv + v^2$.` },
        { answer: '(2*u*v - v^2)/(2*c^2)', feedback: t`That is the westbound case, speed $u - v$: $u^2 - (u - v)^2 = 2uv - v^2$.` },
        { answer: '-(u + v)^2/(2*c^2)', feedback: t`Subtract the ground clock’s own term, $-u^2/2c^2$.` },
      ],
      hints: [t`Speed terms: $-(u + v)^2/2c^2$ for the plane, $-u^2/2c^2$ for the ground.`, t`Subtract and expand $(u + v)^2 - u^2$.`],
      teach: t`Speeds must be measured in an inertial frame: Earth’s rotation makes eastbound clocks lose and westbound clocks gain.`,
      explain: t`$-\dfrac{(u + v)^2 - u^2}{2c^2} = -\dfrac{2uv + v^2}{2c^2}$. At $35^\circ$ latitude ($u \approx 381$ m/s) and $v \approx 230$ m/s this is about $-1.27\times10^{-12}$, near $-190$ ns over some 41 hours of flying; height adds about $+145$ ns. Hafele and Keating, integrating their real flight paths, predicted $-40 \pm 23$ ns eastward and measured $-59 \pm 10$ ns; westward the speed term changes sign, and they predicted $+275 \pm 21$ ns and measured $+273 \pm 7$ ns.`,
      visual: hkPicture,
    }),
    num({
      id: 'tower-clocks', difficulty: 2,
      gen(r) {
        const [h, hText, T, Ttext, Tunit, ctx] = r.pick([
          [0.33, '33 cm', 79 * YEAR, '79 years', 'ns', 'In 2010 a NIST team raised one aluminium-ion clock 33 cm above an identical one and saw it run fast.'],
          [450, '450 m', DAY, 'one day', 'ns', 'In 2020 strontium clocks were compared between the base and the 450 m observatory of Tokyo Skytree.'],
          [1, '1 m', 79 * YEAR, '79 years', 'ns', 'Clocks now resolve height differences of a centimetre.'],
        ]);
        const ans = ((9.8 * h) / C2) * T * 1e9;
        return {
          prompt: t`${ctx} With $g = 9.8\ \text{m/s}^2$, the potential difference is $\Delta\Phi = gh$. How much more does a clock ${hText} higher age over ${Ttext}, in ${Tunit}?`,
          answer: ans, units: Tunit, tol: { rel: 0.01 },
          errors: [
            { value: ((9.8 * h) / C) * T * 1e9, feedback: t`Divide by $c^2$, not $c$: the rate difference is $gh/c^2$, a pure number.` },
            { value: ((9.8 * h) / (2 * C2)) * T * 1e9, feedback: t`No factor $\tfrac12$ here: the potential term in $d\tau/dt$ is $\Phi/c^2$; the $\tfrac12$ belongs to $v^2/2c^2$.` },
          ],
          hints: [t`Fractional rate difference: $\Delta\Phi/c^2 = gh/c^2$.`, t`Multiply by the time in seconds: ${Ttext} $= ${sci(T, 4)}$ s.`],
          teach: t`Two clocks at rest differ in rate by $\Delta\Phi/c^2 = gh/c^2$ — about $10^{-16}$ per metre of height near Earth.`,
          explain: t`$gh/c^2 = ${sci((9.8 * h) / C2, 3)}$; over ${Ttext} ($${sci(T, 4)}$ s) that is ${fmt(ans, 3)} ${Tunit}. Both clocks are at rest, so the whole effect is the $\Phi/c^2$ term — the same physics as Pound and Rebka’s tower, now measured with clocks rather than gamma rays.`,
          visual: {
            type: 'graph',
            params: {
              x: [-3, 3], y: [-0.6, 4.4], equal: true, axes: false, grid: false,
              curves: [
                { param: ['t', '0'], t: [-2.6, 2.6], color: 'ink2', width: 2 },
                { param: ['0*t', 't'], t: [0.25, 3.1], color: 'ink4', width: 1, dash: true },
              ],
              points: [
                { x: 0, y: 0.25, color: 'accent', r: 6, label: 'clock A', labelDx: 14, labelDy: 4 },
                { x: 0, y: 3.1, color: 'gold', r: 6, label: `clock B, ${hText} higher`, labelDx: 14, labelDy: 4 },
              ],
              arrows: [{ from: [-1.4, 0.25], to: [-1.4, 3.1], color: 'ink2', label: 'h' }],
            },
            caption: t`Not to scale: two identical clocks at rest, one ${hText} above the other. The higher one sits at a higher potential, $\Phi + gh$, and runs fast by $gh/c^2$.`,
          },
        };
      },
    }),
    num({
      id: 'muon-ring', difficulty: 3,
      prompt: t`The clock hypothesis says a clock’s rate depends only on its speed, $d\tau/dt = \sqrt{1 - v^2/c^2}$, whatever its acceleration. At CERN in the 1970s, muons circled a storage ring of radius 7.0 m at $\gamma = 29.3$, with a proper acceleration of about $10^{18}\,g$. Their lifetime at rest is ${fmt(TAU_MU * 1e6, 4)} μs. On average, how many times does a muon go around the ring before it decays?`,
      answer: (Math.sqrt(1 - 1 / 29.3 ** 2) * C * 29.3 * TAU_MU) / (2 * Math.PI * 7.0), tol: { rel: 0.01 },
      errors: [
        { value: (C * TAU_MU) / (2 * Math.PI * 7.0), feedback: t`That uses the lifetime at rest. In the lab the muon lives $\gamma\tau_0$.` },
        { value: (C * 29.3 * TAU_MU) / (2 * Math.PI * 14.0), feedback: 'The circumference is 2π × radius = 2π × 7.0 m.' },
        { value: (C * TAU_MU) / 29.3 / (2 * Math.PI * 7.0), feedback: t`Moving clocks run slow, so the lab sees the lifetime stretched: multiply by $\gamma$.` },
      ],
      hints: [t`Lab lifetime: $\gamma\tau_0 = 29.3\times${fmt(TAU_MU * 1e6, 4)}\ \mu\text{s}$; the speed is essentially $c$.`, t`Distance $= v\gamma\tau_0$; divide by the circumference $2\pi\times7.0$ m.`],
      teach: t`Proper time depends on the path through $\sqrt{-g_{\mu\nu}\,dx^\mu dx^\nu}$ only — on speed, not on acceleration — which is why accelerated clocks can be computed at all.`,
      explain: t`$\gamma\tau_0 = ${fmt(29.3 * TAU_MU * 1e6, 4)}$ μs; at $v = ${fmt(Math.sqrt(1 - 1 / 29.3 ** 2), 5)}c$ the muon covers ${fmt((Math.sqrt(1 - 1 / 29.3 ** 2) * C * 29.3 * TAU_MU) / 1e3, 3)} km, or ${fmt((Math.sqrt(1 - 1 / 29.3 ** 2) * C * 29.3 * TAU_MU) / (2 * Math.PI * 7.0), 3)} turns of 44 m. Bailey and colleagues (1977) measured the lifetime in the ring and found it equal to $\gamma\tau_0$ to about 0.1% — the enormous acceleration added nothing, as the clock hypothesis says.`,
      visual: {
        type: 'graph',
        params: {
          x: [-13, 13], y: [-9, 9], equal: true, axes: false, grid: false,
          curves: [{ param: ['7*cos(t)', '7*sin(t)'], t: [0, 6.2832], color: 'accent', width: 2.6, label: 'r = 7.0 m', labelAt: 3.6, labelDx: -70, labelDy: 10 }],
          points: [
            { x: round(7 * Math.cos(50 * DEG), 4), y: round(7 * Math.sin(50 * DEG), 4), color: 'gold', r: 5, label: 'μ', labelDx: 8, labelDy: 16 },
            ...[130, 200, 270, 330].map((a) => ({ x: round(7 * Math.cos(a * DEG), 4), y: round(7 * Math.sin(a * DEG), 4), color: 'gold', r: 3 })),
          ],
          arrows: [
            { from: [round(7 * Math.cos(50 * DEG), 4), round(7 * Math.sin(50 * DEG), 4)], to: [round(7 * Math.cos(50 * DEG) - 4 * Math.sin(50 * DEG), 4), round(7 * Math.sin(50 * DEG) + 4 * Math.cos(50 * DEG), 4)], color: 'gold', label: 'v ≈ c' },
            { from: [round(7 * Math.cos(50 * DEG), 4), round(7 * Math.sin(50 * DEG), 4)], to: [round(4 * Math.cos(50 * DEG), 4), round(4 * Math.sin(50 * DEG), 4)], color: 'violet', label: 'a' },
          ],
        },
        caption: t`The muon storage ring from above (the ring to scale; arrows show directions only): muons circle at nearly $c$, accelerated toward the centre (violet) by the magnetic field — yet their clocks run at the rate set by speed alone.`,
      },
    }),
    mcq({
      id: 'which-tau', difficulty: 3,
      prompt: t`Which expression gives the proper time along a timelike worldline $x^\mu(\lambda)$, in any coordinates? (Dots are $d/d\lambda$; signature $-{+}{+}{+}$.)`,
      choices: [
        t`$\dfrac1c\displaystyle\int\sqrt{-g_{\mu\nu}\,\dot x^\mu\dot x^\nu}\;d\lambda$`,
        t`$\dfrac1c\displaystyle\int\sqrt{g_{\mu\nu}\,\dot x^\mu\dot x^\nu}\;d\lambda$`,
        t`$\dfrac1{c^2}\displaystyle\int\left(-g_{\mu\nu}\,\dot x^\mu\dot x^\nu\right)d\lambda$`,
        t`$\dfrac1c\displaystyle\int\sqrt{-g_{\mu\mu}\,\dot x^\mu\dot x^\mu}\;d\lambda$`,
      ],
      answer: 0,
      why: {
        1: t`For a timelike worldline $g_{\mu\nu}\dot x^\mu\dot x^\nu$ is negative in this signature, so its square root is imaginary. The minus sign is what makes the clock reading real.`,
        2: t`Without the square root the integral changes when you relabel the path: with $\lambda \to 2\lambda$ it halves. A clock reading cannot depend on how you number the points.`,
        3: t`An index may appear at most twice, once up and once down. This keeps only the diagonal of $g_{\mu\nu}$ — in the rotating frame of step 8 it would miss $g_{t\phi'} = \omega r^2$ and get the rider’s clock wrong.`,
      },
      hints: ['Which sign does ds² have for a clock?', 'Check that the expression is unchanged if you reparametrize, λ → f(λ).'],
      teach: t`$\Delta\tau = \frac1c\int\sqrt{-g_{\mu\nu}\dot x^\mu\dot x^\nu}\,d\lambda$: the minus sign makes it real, the square root makes it independent of the parameter, and the full double sum makes it independent of the coordinates.`,
      explain: t`Under $\lambda \to \tilde\lambda(\lambda)$, $\dot x^\mu$ picks up a factor $d\lambda/d\tilde\lambda$, the square root takes one factor out, and $d\tilde\lambda$ cancels it: the integral is a property of the worldline alone. With $\lambda = t$ in flat spacetime it reduces to $\int\sqrt{1 - v^2/c^2}\,dt$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.3, 3.4], y: [0, 3.8], equal: true, xlabel: 'x  (units of c²/α)', ylabel: 'ct  (units of c²/α)',
          curves: [
            { param: ['cosh(t) - 1', 'sinh(t)'], t: [0, 2.03], color: 'accent', width: 2.4 },
            { fn: 'x', domain: [0, 3.4], color: 'warn', dash: true, width: 1.2 },
          ],
          points: Array.from({ length: 9 }, (_, k) => ({ x: round(Math.cosh(k / 4) - 1, 4), y: round(Math.sinh(k / 4), 4), color: 'gold', r: 3.5 })),
        },
        caption: t`An accelerating clock’s worldline with a gold dot at every equal step of its proper time. The steps cover more and more coordinate time as it speeds up; the integral counts the dots, whatever parameter is used to trace the path.`,
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-centre', difficulty: 3,
      prompt: t`Imagine a clock at the centre of the Earth, where gravity cancels and $g = 0$, compared with an identical clock on the surface (both at rest, Earth treated as a uniform ball). The centre clock runs:`,
      choices: [
        'Slower, because the potential is lowest at the centre',
        'Faster, because it feels no gravity at all',
        'At the same rate, because g = 0 there just as far away',
        'Slower, because g is largest at the centre',
      ],
      answer: 0,
      why: {
        1: t`Clock rates follow the potential $\Phi$, not the field $g = |\nabla\Phi|$. Weightlessness does not mean a high potential.`,
        2: t`Far away both $g$ and $\Phi$ vanish. At the centre $g = 0$ but $\Phi = -\tfrac32 GM/R$, lower than anywhere else.`,
        3: t`Inside a uniform ball $g$ falls linearly to zero at the centre; it is largest at the surface.`,
      },
      hints: ['Which quantity appears in dτ/dt: Φ or g?', 'Where is Φ lowest?'],
      teach: t`Gravitational time dilation depends on the potential: $d\tau/dt \approx 1 + \Phi/c^2$, whatever the local $g$.`,
      explain: t`Inside a uniform ball $\Phi(r) = -\dfrac{GM}{2R^3}(3R^2 - r^2)$, so $\Phi_{\text{centre}} - \Phi_{\text{surface}} = -\dfrac{GM}{2R}$. The centre clock loses $GM/(2Rc^2) = ${sci(GM_EARTH / (2 * R_EARTH * C2), 3)}$ — about $${fmt((GM_EARTH / (2 * R_EARTH * C2)) * UDAY, 3)}$ μs a day — although nothing there pulls on it.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 3.2], y: [-1.7, 1.2], xlabel: 'r / R', ylabel: 'in units of GM/R and GM/R²',
          curves: [
            { fn: '-(3 - min(x, 1)^2)/2 + 1 - 1/max(x, 1)', domain: [0, 3.2], color: 'gold', width: 2.6, label: 'potential Φ', labelAt: 2.2, labelDy: 18 },
            { fn: 'min(x, 1/x^2)', domain: [0.001, 3.2], color: 'violet', width: 2.6, label: 'field strength g', labelAt: 2, labelDy: -12 },
          ],
          vlines: [{ x: 1, color: 'ink3', label: 'surface' }],
          hlines: [{ y: 0, color: 'ink3' }],
        },
        caption: t`For a uniform Earth: the field strength $g$ (violet) rises linearly inside and falls as $1/r^2$ outside; the potential $\Phi$ (gold) keeps falling all the way to the centre.`,
      },
    }),
    num({
      id: 'cp-eccentric', difficulty: 3, transfer: true,
      prompt: t`In 2014 two Galileo satellites were launched by mistake into eccentric orbits, with roughly $a = ${grp(28000)}$ km and $e = 0.16$. Integrating $d\tau/dt$ around such an orbit (using $v^2 = GM(2/r - 1/a)$) leaves a periodic part, $\Delta\tau = -\dfrac{2\sqrt{GMa}}{c^2}\,e\sin E$, where $E$ is the eccentric anomaly. With $GM_\oplus = ${sci(GM_EARTH, 7)}\ \text{m}^3/\text{s}^2$, what is its amplitude, in nanoseconds?`,
      answer: ((2 * Math.sqrt(GM_EARTH * 2.8e7)) / C2) * 0.16 * 1e9, units: 'ns', tol: { rel: 0.01 },
      integrand: `${round(((2 * GM_EARTH * 0.16) / (2.8e7 * Math.sqrt(GM_EARTH / 2.8e7 ** 3) * C2)) * 1e9, 7)}*cos(x)`, limits: [0, Math.PI / 2],
      errors: [
        { value: ((Math.sqrt(GM_EARTH * 2.8e7)) / C2) * 0.16 * 1e9, feedback: t`Keep the factor 2: the potential and the speed terms vary together around the orbit, and each contributes.` },
        { value: ((2 * Math.sqrt(GM_EARTH * 2.8e4)) / C2) * 0.16 * 1e9, feedback: 'Convert a to metres before multiplying by GM.' },
      ],
      hints: [t`$\sqrt{GMa}$ with $a$ in metres: $\sqrt{${sci(GM_EARTH, 4)}\times${sci(2.8e7, 5)}}$.`, t`Multiply by $2e/c^2$ and convert seconds to ns.`],
      teach: t`On an eccentric orbit the clock runs slow near perigee and fast near apogee; the swing has amplitude $2\sqrt{GMa}\,e/c^2$.`,
      explain: t`$\sqrt{GMa} = ${sci(Math.sqrt(GM_EARTH * 2.8e7), 4)}\ \text{m}^2/\text{s}$, so the amplitude is $2\times${sci(Math.sqrt(GM_EARTH * 2.8e7), 4)}\times0.16/c^2 = ${fmt(((2 * Math.sqrt(GM_EARTH * 2.8e7)) / C2) * 0.16 * 1e9, 3)}$ ns, swinging once per ${fmt((2 * Math.PI * Math.sqrt(2.8e7 ** 3 / GM_EARTH)) / 3600, 3)}-hour orbit. GPS receivers apply this same correction (23 ns for $e = 0.01$). The stray Galileo satellites turned the mistake into an experiment: by tracking the swing over three years, two teams confirmed the gravitational redshift to a few parts in $10^5$ (Delva et al. 2018), improving on Gravity Probe A.`,
      visual: {
        type: 'graph',
        params: {
          x: [-38, 50], y: [-31, 31], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [
            { param: [`28*(cos(t) - 0.16)`, `${round(28 * Math.sqrt(1 - 0.16 ** 2), 5)}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.4 },
            { param: ['6.371*cos(t)', '6.371*sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6 },
          ],
          shade: [{ fn: 'sqrt(40.59 - x^2)', lower: '-sqrt(40.59 - x^2)', from: -6.371, to: 6.371, color: 'accent', alpha: 0.35 }],
          points: [
            { x: round(28 * (1 - 0.16), 4), y: 0, color: 'gold', r: 4, label: 'perigee: clock slowest', labelDx: 10, labelDy: -10 },
            { x: round(-28 * (1 + 0.16), 4), y: 0, color: 'gold', r: 4, label: 'apogee: fastest', labelDx: 10, labelDy: -12 },
          ],
        },
        caption: t`To scale: the eccentric Galileo orbit ($e = 0.16$) around Earth, at the focus. Closer in, the clock sits deeper in the potential and moves faster — it runs slow at perigee and catches up at apogee.`,
      },
    }),
    num({
      id: 'cp-moon', difficulty: 4, transfer: true,
      prompt: t`Space agencies are defining a time scale for the Moon. Estimate how much faster a clock on the Moon’s surface runs than one on Earth’s geoid, in μs per day. In the Earth-centred frame the Moon clock sits at potential $-GM_\oplus/d - GM_{\text{M}}/R_{\text{M}}$ and moves at the Moon’s orbital speed $v = 1.02$ km/s; take $GM_\oplus = ${sci(GM_EARTH, 4)}$, $GM_{\text{M}} = ${sci(GM_MOON, 4)}\ \text{m}^3/\text{s}^2$, $d = ${grp(D_MOON / 1e3)}$ km, $R_{\text{M}} = ${grp(1737.4)}$ km. For the geoid clock use $\Phi_0/c^2 = ${sci(PHI0, 4)}$.`,
      answer: ((-GM_EARTH / D_MOON - GM_MOON / 1.7374e6 - (1020 ** 2) / 2) / C2 - PHI0) * UDAY, units: 'μs/day', tol: { rel: 0.01 },
      errors: [
        { value: ((-GM_EARTH / D_MOON - (1020 ** 2) / 2) / C2 - PHI0) * UDAY, feedback: t`Include the Moon’s own potential at its surface, $-GM_{\text{M}}/R_{\text{M}}$: it is the largest of the Moon-side terms.` },
        { value: -PHI0 * UDAY, feedback: 'That counts only the Earth clock’s deep potential; the Moon clock has potential and speed terms of its own.' },
        { value: ((-GM_EARTH / D_MOON - GM_MOON / 1.7374e6 + (1020 ** 2) / 2) / C2 - PHI0) * UDAY, feedback: t`Motion slows the Moon clock: $-v^2/2c^2$.` },
      ].filter((e, i, arr) => Math.abs(e.value - ((-GM_EARTH / D_MOON - GM_MOON / 1.7374e6 - (1020 ** 2) / 2) / C2 - PHI0) * UDAY) > 0.015 * 56),
      hints: [t`Moon clock rate: $1 + \Phi_{\text{Moon}}/c^2 - v^2/2c^2$; Earth clock rate: $1 + \Phi_0/c^2$.`, t`Difference $\times\ ${grp(UDAY)}$ gives μs per day.`],
      teach: t`Comparing any two clocks is the same recipe: each one’s $\Phi/c^2 - v^2/2c^2$ in a common frame, then subtract.`,
      explain: t`Moon clock: $-GM_\oplus/(dc^2) = ${sci(-GM_EARTH / (D_MOON * C2), 3)}$, $-GM_{\text{M}}/(R_{\text{M}}c^2) = ${sci(-GM_MOON / (1.7374e6 * C2), 3)}$, $-v^2/2c^2 = ${sci(-(1020 ** 2) / (2 * C2), 3)}$; Earth clock: $${sci(PHI0, 4)}$. The difference, $${sci((-GM_EARTH / D_MOON - GM_MOON / 1.7374e6 - (1020 ** 2) / 2) / C2 - PHI0, 4)}$, is $+${fmt(((-GM_EARTH / D_MOON - GM_MOON / 1.7374e6 - (1020 ** 2) / 2) / C2 - PHI0) * UDAY, 3)}$ μs per day, matching the roughly 56 μs a day that NIST physicists published in 2024 for a future lunar time scale. Earth’s deep potential dominates: the Moon clock gains because Earth clocks run slow.`,
      visual: {
        type: 'graph',
        params: {
          x: [-9, 9], y: [-4, 4], equal: true, axes: false, grid: false,
          curves: [
            { param: ['-5 + 2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'accent', width: 1.6 },
            { param: ['5 + 0.6*cos(t)', '0.6*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 1.6 },
            { param: ['t', '0'], t: [-3, 4.4], color: 'ink4', width: 1, dash: true, label: 'd = 384,400 km (not to scale)', labelAt: -1.2, labelDy: -8 },
          ],
          shade: [
            { fn: 'sqrt(4 - (x + 5)^2)', lower: '-sqrt(4 - (x + 5)^2)', from: -7, to: -3, color: 'accent', alpha: 0.35 },
            { fn: 'sqrt(0.36 - (x - 5)^2)', lower: '-sqrt(0.36 - (x - 5)^2)', from: 4.4, to: 5.6, color: 'ink3', alpha: 0.5 },
          ],
          points: [
            { x: -3, y: 0, color: 'ink', r: 4, label: 'geoid clock', labelDx: 8, labelDy: 18 },
            { x: 5.6, y: 0, color: 'gold', r: 4, label: 'Moon clock', labelDx: 8, labelDy: 18 },
          ],
          arrows: [{ from: [5, 0.6], to: [5, 2.6], color: 'gold', label: 'v = 1.02 km/s' }],
        },
        caption: t`Not to scale: a clock on Earth’s geoid and one on the Moon’s surface, compared in the Earth-centred frame.`,
      },
    }),
  ],
  sources: [
    { label: 'N. Ashby, “Relativity in the Global Positioning System”, Living Reviews in Relativity 6, 1 (2003)', url: 'https://doi.org/10.12942/lrr-2003-1' },
    { label: 'Hafele & Keating, “Around-the-world atomic clocks: observed relativistic time gains”, Science 177, 168 (1972)', url: 'https://doi.org/10.1126/science.177.4044.168' },
    { label: 'Chou, Hume, Rosenband & Wineland, “Optical clocks and relativity”, Science 329, 1630 (2010)', url: 'https://doi.org/10.1126/science.1192720' },
    { label: 'Bailey et al., “Measurements of relativistic time dilatation for positive and negative muons in a circular orbit”, Nature 268, 301 (1977)', url: 'https://doi.org/10.1038/268301a0' },
    { label: 'Delva et al., “Gravitational redshift test using eccentric Galileo satellites”, Phys. Rev. Lett. 121, 231101 (2018)', url: 'https://doi.org/10.1103/PhysRevLett.121.231101' },
  ],
});
