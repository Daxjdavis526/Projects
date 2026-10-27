// Rotational kinetic energy and the moment of inertia: K = ½Iω², I = Σ m r².
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { RPM } from './_rotation.js';
import { massDots, seg } from './_momentum.js';
import { shapeAt } from './_spin.js';

const t = String.raw;
const s3 = (x) => fmt(x, 3);
const comma = (x) => x.toLocaleString('en-US');
const r4 = (x) => +x.toFixed(4);

// two round bodies side by side (keys of the rolling-shapes helper: hoop, disk, sphere, shell)
function pair(a, b, caption) {
  const A = shapeAt(a[0], -1.5, 0, 1), B = shapeAt(b[0], 1.5, 0, 1);
  const labels = [{ x: -1.5, y: 1.3, r: 0.01, color: 'ink2', label: a[1], labelDx: -14 }, { x: 1.5, y: 1.3, r: 0.01, color: 'ink2', label: b[1], labelDx: -12 }];
  return {
    type: 'graph',
    params: { x: [-2.9, 2.9], y: [-1.3, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves: [...A.curves, ...B.curves], shade: [...A.shade, ...B.shade], points: [...A.points, ...B.points, ...labels] },
    caption,
  };
}

// a rod drawn along x from x0 to x1, with the axis (gold ring) at xa
const rodAt = (x0, x1, y, xa, label) => [
  { param: [`${r4(x0)} + t*${r4(x1 - x0)}`, String(y)], t: [0, 1], color: 'accent', width: 7 },
  { param: [`${r4(xa)} + 0.09*cos(t)`, `${r4(y)} + 0.09*sin(t)`], t: [0, 6.2832], color: 'gold', width: 2.2, label, labelAt: 1.6, labelDx: 4, labelDy: -10 },
];

export default lesson({
  id: 'phys2210.M10.2',
  title: 'Rotational kinetic energy and moment of inertia',
  minutes: 11, difficulty: 2,
  intro: t`A spinning flywheel goes nowhere, yet it carries energy: every bit of it, of mass $m_i$ at distance $r_i$ from the axis, moves at $r_i\omega$. Adding up their kinetic energies gives

$$K = \sum_i \tfrac12 m_i (r_i\omega)^2 = \tfrac12 I\omega^2, \qquad I = \sum_i m_i r_i^2 = \int r^2\,dm$$

The **moment of inertia** $I$ is rotation’s stand-in for mass: it measures how hard a body is to spin up. It depends on the mass **and on where that mass sits relative to the axis** — far-out mass counts with the square of its distance. All the mass of a thin hoop is at its rim, $I = MR^2$; a solid disk of the same mass and radius has $I = \tfrac12 MR^2$.`,
  symbols: [
    { tex: 'K', text: 'the rotational kinetic energy, in joules' },
    { tex: 'I', text: 'the moment of inertia about the axis, in kg·m²' },
    { tex: 'm_i,\\ r_i', text: 'the mass (kg) of the $i$-th particle and its **perpendicular distance from the axis** (m) — not from the centre of anything' },
    { tex: '\\omega', text: 'angular velocity, in rad/s' },
    { tex: '\\textstyle\\int r^2\\,dm', text: 'the sum for a continuous body: each sliver of mass $dm$ times the square of its distance from the axis' },
  ],
  why: 'Moment of inertia sets how much energy a flywheel stores, how hard a reaction wheel must work to turn a satellite, and — in lesson M11 — which shape wins a race down a ramp.',
  visual: {
    type: 'mech-rotor',
    title: 'Mass far out counts four times',
    lead: t`Two equal point masses on a light rod spin about its middle. Change the masses, their distance $s$ from the axis and the spin rate, and press **Play** to watch it turn. The readouts give $I = 2ms^2$ and $K = \tfrac12 I\omega^2$.`,
    tasks: [
      t`Double the distance $s$, from 0.3 m to 0.6 m: $I$ — and the energy at the same $\omega$ — grows four times.`,
      t`Double the masses instead: $I$ and $K$ only double. Where the mass sits matters more than how much there is.`,
      t`Double $\omega$: the energy quadruples, as $\tfrac12 mv^2$ does when $v$ doubles.`,
    ],
    params: {
      shape: 'dumbbell', m: 1, s: 0.3, omega0: 3, T: 8, readouts: ['I', 'omega', 'K'],
      sliders: [{ key: 'm', max: 3 }, { key: 's', max: 0.6 }, { key: 'omega0', label: 'Spin rate $\\omega$', min: 0.5, max: 8, explain: 'Constant: nothing speeds it up or slows it down.' }],
    },
  },
  example: {
    prompt: t`A flywheel for storing energy is a solid steel disk of mass 100 kg and radius 0.30 m, spinning at 20,000 rpm. How much kinetic energy does it store?`,
    visual: { type: 'mech-rotor', params: { shape: 'disk', M: 100, R: 0.3, omega0: 2, values: false }, caption: 'The flywheel seen along its axle (a sketch).' },
    steps: [
      { label: 'Moment of inertia', text: t`Solid disk: $I = \tfrac12 MR^2 = \tfrac12(100)(0.30)^2 = 4.50\ \text{kg·m}^2$.` },
      { label: 'Angular velocity', text: t`$\omega = 20{,}000\times\dfrac{2\pi}{60} = 2{,}094$ rad/s.` },
      { label: 'Energy', text: t`$K = \tfrac12 I\omega^2 = \tfrac12(4.50)(2{,}094)^2 = 9.87\times10^{6}$ J — about 9.9 MJ, or 2.7 kWh.` },
      { label: 'Sense check', text: t`The rim moves at $r\omega = 628$ m/s, nearly twice the speed of sound — why real high-speed flywheels have carbon-fibre rims and spin in vacuum. A hoop of the same mass and radius would store twice as much: all its mass is at the rim.` },
    ],
    answer: t`$K \approx 9.9$ MJ (2.7 kWh).`,
  },
  practice: [
    num({
      id: 'point-masses', difficulty: 1,
      gen(r) {
        const m1 = r.pick([1, 2, 3]), r1 = r.pick([0.2, 0.3, 0.4]), m2 = r.pick([0.5, 1, 1.5]), r2 = r.pick([0.5, 0.6, 0.8]);
        const I = m1 * r1 * r1 + m2 * r2 * r2;
        return {
          prompt: t`A light rod spins about an axis through one point on it. A ${m1} kg mass sits ${r1} m from the axis on one side and a ${m2} kg mass ${r2} m away on the other. What is the moment of inertia?`,
          answer: I, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [
            { value: m1 * r1 + m2 * r2, feedback: 'Square each distance: I = Σ m r².' },
            { value: (m1 + m2) * ((r1 + r2) / 2) ** 2, feedback: 'Each mass counts with its own distance squared; do not average the distances.' },
          ],
          hints: [t`$I = \sum m_i r_i^2$, with each $r$ measured from the axis.`],
          teach: 'For point masses, I = Σ m r², each distance measured from the axis and squared.',
          explain: t`$I = (${m1})(${r1})^2 + (${m2})(${r2})^2 = ${nice(m1 * r1 * r1)} + ${nice(m2 * r2 * r2)} = ${s3(I)}\ \text{kg·m}^2$. Sides do not matter: $r^2$ is positive either way.`,
          visual: massDots([{ x: -r1, m: m1, label: `${m1} kg` }, { x: r2, m: m2, label: `${m2} kg`, color: 'violet' }], { xlabel: 'distance along the rod (m)', extra: { points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'axis', labelDy: 18 }] }, caption: 'The rod and its two masses; the axis passes through the gold point, out of the screen.' }),
        };
      },
    }),
    mcq({
      id: 'hoop-disk', difficulty: 1,
      prompt: 'A thin hoop and a solid disk have the same mass and the same radius, and each turns about its own centre. Which has the larger moment of inertia?',
      choices: ['The hoop: all its mass is at the full radius', 'The disk, because it is solid', 'Neither: same mass and radius, same moment of inertia', 'It depends on how fast they spin'],
      answer: 0,
      why: {
        1: 'Being solid puts much of the disk’s mass near the axis, where it counts little. The hoop has none there.',
        2: 'I depends on how the mass is spread, not only on the total: Σ m r² weights each bit by its distance squared.',
        3: 'I is a property of the body and the axis. The spin rate changes the energy, not I.',
      },
      hints: ['I = Σ m r²: where is each body’s mass, relative to the axis?'],
      teach: 'Moment of inertia depends on how the mass is distributed: mass far from the axis counts most.',
      explain: t`Hoop: every bit at $r = R$, so $I = MR^2$. Disk: mass spread from the centre out, $I = \tfrac12 MR^2$ — half as much.`,
      visual: pair(['hoop', 'hoop'], ['disk', 'disk'], 'Same mass and radius, seen face-on; each turns about its centre.'),
    }),
    num({
      id: 'rod-integral', difficulty: 3,
      gen(r) {
        const M = r.pick([1, 2, 3]), L = r.pick([1, 1.5, 2]);
        const I = (M * L * L) / 12;
        return {
          prompt: t`Find, by integration, the moment of inertia of a uniform ${M} kg rod, ${L} m long, about an axis through its centre and perpendicular to it.`,
          answer: I, units: 'kg m^2', tol: { rel: 0.005 },
          integrand: `x^2*${M}/${L}`, limits: [-L / 2, L / 2],
          errors: [
            { value: (M * L * L) / 3, feedback: 'That is the moment of inertia about one end. Integrate from −L/2 to +L/2, about the centre.' },
            { value: (M * L * L) / 4, feedback: 'That treats all the mass as if it sat at the ends, L/2 away. Most of it is closer: integrate.' },
          ],
          hints: [t`A sliver of length $dx$ at position $x$ has mass $dm = \lambda\,dx$, with $\lambda = M/L = ${nice(M / L)}$ kg/m.`, t`$I = \displaystyle\int_{-L/2}^{L/2} x^2\,\lambda\,dx$.`, t`$= \lambda\left[\tfrac{x^3}{3}\right]_{-L/2}^{L/2} = \lambda\dfrac{L^3}{12} = \dfrac{ML^2}{12}$.`],
          teach: 'For a continuous body, I = ∫ r² dm: slice it, give each slice its mass λ dx, and integrate.',
          explain: t`$I = \dfrac{M}{L}\displaystyle\int_{-${L / 2}}^{${L / 2}} x^2\,dx = \dfrac{M}{L}\cdot\dfrac{L^3}{12} = \dfrac{ML^2}{12} = \dfrac{(${M})(${L})^2}{12} = ${s3(I)}\ \text{kg·m}^2$.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [r4(-L * 0.62), r4(L * 0.62)], y: [-0.25 * L, 0.25 * L], equal: true, xlabel: 'x (m)', ylabel: '', yticks: 0.001,
              shade: [{ fn: '0.04', lower: '-0.04', from: r4(-L / 2), to: r4(L / 2), color: 'accent', alpha: 0.5 }, { fn: '0.07', lower: '-0.07', from: r4(L * 0.28), to: r4(L * 0.28 + L * 0.04), color: 'gold', alpha: 0.9 }],
              points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'axis', labelDy: 16 }, { x: r4(L * 0.3), y: 0.07, r: 0.01, color: 'gold', label: 'dm = λ dx at x', labelDy: -12 }],
            },
            caption: 'The rod, with one sliver dm at position x. The axis is perpendicular to the screen.',
          },
        };
      },
    }),
    num({
      id: 'ke-rot', difficulty: 2,
      gen(r) {
        const M = r.pick([5, 8, 12]), R = r.pick([0.15, 0.2, 0.25]), N = r.pick([300, 600, 1200]);
        const I = 0.5 * M * R * R, w = N * RPM, K = 0.5 * I * w * w;
        return {
          prompt: t`A potter’s wheel is a solid disk of mass ${M} kg and radius ${R} m. How much kinetic energy does it have when turning at ${comma(N)} rpm?`,
          answer: K, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: 0.5 * M * R * R * w * w, feedback: 'A solid disk has I = ½MR², not MR² — that is a hoop.' },
            { value: 0.5 * I * N * N, feedback: 'Convert rpm to rad/s first: multiply by 2π/60.' },
          ],
          hints: [t`$I = \tfrac12 MR^2$ for a solid disk; $\omega$ in rad/s.`, t`$K = \tfrac12 I\omega^2$.`],
          teach: 'Rotational kinetic energy is ½Iω², with ω in rad/s.',
          explain: t`$I = \tfrac12(${M})(${R})^2 = ${s3(I)}\ \text{kg·m}^2$; $\omega = ${s3(w)}$ rad/s; $K = \tfrac12(${s3(I)})(${s3(w)})^2 = ${s3(K)}$ J.`,
          visual: { type: 'mech-rotor', params: { shape: 'disk', M, R, omega0: 2, values: false }, caption: 'The wheel seen from above (a sketch).' },
        };
      },
    }),
    mcq({
      id: 'axis-matters', difficulty: 2,
      prompt: 'A uniform rod is spun up to the same angular velocity twice: first about an axis through its centre, then about an axis through one end. Which spin needs more energy?',
      choices: ['About the end — four times as much', 'Neither: it is the same rod, with the same moment of inertia', 'About the centre, where it is balanced', 'About the end — twice as much'],
      answer: 0,
      why: {
        1: 'Moment of inertia is not a property of the body alone: it depends on the axis. About an end, half the rod is twice as far out.',
        2: 'Balance does not set the energy; I does, and I is smallest about the centre.',
        3: 'The ratio is (ML²/3) ÷ (ML²/12) = 4, not 2.',
      },
      hints: ['I = Σ m r²: about which axis is the rod’s mass, on average, farther away?', 'About its centre, I = ML²/12; about an end, ML²/3.'],
      teach: 'The same body has a different moment of inertia about each axis — least about an axis through its centre of mass.',
      explain: t`$I_\text{centre} = \tfrac1{12}ML^2$ and $I_\text{end} = \tfrac13 ML^2$: four times as large, so at the same $\omega$ the energy $\tfrac12 I\omega^2$ is four times as large. (Lesson M10.3 shows how to get one from the other.)`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.3, 1.3], y: [-0.8, 0.8], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [...rodAt(-1, 1, 0.4, 0, 'axis at the centre'), ...rodAt(-1, 1, -0.4, -1, 'axis at one end')],
        },
        caption: 'The same rod with two different axes (gold rings, perpendicular to the screen).',
      },
    }),
    mcq({
      id: 'double-s', difficulty: 2,
      prompt: 'Two equal masses on a light rod spin about its middle. If both masses are slid out to twice their distance from the axis, the moment of inertia becomes…',
      choices: ['4 times as large', '2 times as large', 'unchanged — the masses are the same', '8 times as large'],
      answer: 0,
      why: { 1: 'Distance enters squared: (2s)² = 4s².', 2: 'I depends on where the mass is, not just how much there is.', 3: 'One power of 2 for each factor of s in s²: 2² = 4, not 2³.' },
      hints: [t`$I = 2ms^2$. Replace $s$ by $2s$.`],
      teach: 'Moment of inertia grows with the square of distance from the axis.',
      explain: t`$I' = 2m(2s)^2 = 4(2ms^2) = 4I$. Figure skaters use this in reverse: arms pulled in, $I$ drops and they spin faster (lesson M11).`,
      visual: { type: 'mech-rotor', params: { shape: 'dumbbell', m: 1, s: 0.4, values: false }, caption: 'Two equal masses on a light rod; the axis (gold) is at the middle, out of the screen.' },
    }),
    num({
      id: 'composite', difficulty: 3,
      gen(r) {
        const m = r.pick([1, 2, 3]), d = r.pick([0.3, 0.4, 0.5]), mr = r.pick([0.5, 1]);
        const L = 2 * d, I = 2 * m * d * d + (mr * L * L) / 12;
        return {
          prompt: t`A barbell-like rotor: a ${mr} kg uniform rod ${nice(L)} m long, with a small ${m} kg weight at each end, spins about an axis through the middle of the rod. Treat the weights as point masses. What is its moment of inertia?`,
          answer: I, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [
            { value: 2 * m * d * d, feedback: 'The rod has mass too: add its own ML²/12.' },
            { value: 2 * m * d * d + (mr * L * L) / 3, feedback: 'The rod turns about its centre, not its end: ML²/12.' },
          ],
          hints: ['Moments of inertia about the same axis simply add.', t`Weights: $2 \times m\,(L/2)^2$. Rod: $\tfrac1{12}M_\text{rod}L^2$.`],
          teach: 'Moments of inertia about the same axis add: split a body into pieces you know.',
          explain: t`Weights: $2(${m})(${d})^2 = ${s3(2 * m * d * d)}$; rod: $\tfrac1{12}(${mr})(${nice(L)})^2 = ${s3((mr * L * L) / 12)}$; total $I = ${s3(I)}\ \text{kg·m}^2$.`,
          visual: { type: 'mech-rotor', params: { shape: 'dumbbell', m, s: d, values: false }, caption: 'The rotor seen along its axis (gold). The rod is drawn thin, but here it has mass.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rotor', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([2, 4, 5]), m = r.pick([40, 60, 80]), L = r.pick([4, 5, 6]), rpm = r.pick([250, 300, 350]);
        const I = (N * m * L * L) / 3, w = rpm * RPM, K = (0.5 * I * w * w) / 1e6;
        return {
          prompt: t`A helicopter rotor has ${N} blades, each a ${m} kg uniform beam ${L} m long, turning about one end at ${rpm} rpm. A uniform rod about its end has $I = \tfrac13 ML^2$. How much kinetic energy is stored in the spinning rotor? Give your answer in MJ.`,
          answer: K, units: 'MJ', tol: { rel: 0.01 },
          errors: [
            { value: ((0.5 * (N * m * L * L) / 12) * w * w) / 1e6, feedback: 'The blades turn about their ends, not their centres: I = ⅓ML² each.' },
            { value: ((0.5 * (m * L * L) / 3) * w * w) / 1e6, feedback: 'That is one blade. Moments of inertia about the same axis add: multiply by the number of blades.' },
          ],
          hints: [t`Total $I = ${N}\times\tfrac13 mL^2$.`, t`$\omega = ${rpm}\times2\pi/60$; then $K = \tfrac12 I\omega^2$.`],
          teach: 'Moments of inertia about one axis add, and rotational energy is ½Iω².',
          explain: t`$I = ${N}\times\tfrac13(${m})(${L})^2 = ${comma(Math.round(I))}\ \text{kg·m}^2$; $\omega = ${s3(w)}$ rad/s; $K = \tfrac12 I\omega^2 = ${s3(K)}$ MJ. That stored energy is what lets a helicopter whose engine fails flare and land: the pilot spends the rotor’s spin to cushion the touchdown.`,
          visual: {
            type: 'graph',
            params: {
              x: [-L * 1.15, L * 1.15], y: [-L * 1.15, L * 1.15], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: Array.from({ length: N }, (_, k) => ({ param: [`t*${r4(L * Math.cos((2 * Math.PI * k) / N + 0.4))}`, `t*${r4(L * Math.sin((2 * Math.PI * k) / N + 0.4))}`], t: [0, 1], color: 'accent', width: 6 })),
              points: [{ x: 0, y: 0, r: 6, color: 'gold', label: 'hub (axis)', labelDy: 18 }],
            },
            caption: `The ${N}-bladed rotor seen from above, to scale.`,
          },
        };
      },
    }),
    num({
      id: 'cp-masses', difficulty: 2,
      gen(r) {
        const m = [r.pick([1, 2]), r.pick([2, 3]), r.pick([1, 4])], x = [0.2, r.pick([0.5, 0.6]), r.pick([0.9, 1])];
        const I = m.reduce((s, mi, i) => s + mi * x[i] * x[i], 0);
        return {
          prompt: t`Three small masses sit on a light rod that turns about an axis through its end, at $x = 0$: ${m[0]} kg at $x = ${x[0]}$ m, ${m[1]} kg at $x = ${x[1]}$ m and ${m[2]} kg at $x = ${x[2]}$ m. What is the moment of inertia about that axis?`,
          answer: I, units: 'kg m^2', tol: { rel: 0.01 },
          errors: [{ value: m.reduce((s, mi, i) => s + mi * x[i], 0), feedback: 'Square each distance: I = Σ m r².' }],
          hints: [t`$I = \sum m_i x_i^2$.`],
          teach: 'For point masses, add m r² for each, with r measured from the axis.',
          explain: t`$I = ${m.map((mi, i) => `(${mi})(${x[i]})^2`).join(' + ')} = ${s3(I)}\ \text{kg·m}^2$. The farthest mass dominates.`,
          visual: massDots(m.map((mi, i) => ({ x: x[i], m: mi, label: `${mi} kg`, color: ['accent', 'violet', 'good'][i] })), { x: [-0.15, 1.15], extra: { points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'axis', labelDy: 18 }], curves: [seg([0, 0], [0.2, 0], 'ink3', 2.4)] } }),
        };
      },
    }),
    mcq({
      id: 'cp-same-energy', difficulty: 2,
      prompt: 'A thin hoop and a solid disk of the same mass and radius are each given the same rotational kinetic energy. Which spins faster?',
      choices: ['The disk, about 1.41 times as fast', 'The hoop', 'Neither: same energy, same spin', 'The disk, twice as fast'],
      answer: 0,
      why: {
        1: 'The hoop has the larger moment of inertia, so for the same energy it turns more slowly.',
        2: 'K = ½Iω²: with different I, the same K means different ω.',
        3: 'ω² is in inverse proportion to I: half the I gives twice ω², so √2 times ω.',
      },
      hints: [t`$K = \tfrac12 I\omega^2$, so $\omega = \sqrt{2K/I}$.`, t`$I_\text{hoop} = MR^2$, $I_\text{disk} = \tfrac12 MR^2$.`],
      teach: 'At a given energy, ω = √(2K/I): the body with less moment of inertia spins faster.',
      explain: t`$\omega = \sqrt{2K/I}$, and the disk’s $I$ is half the hoop’s, so it spins $\sqrt2 \approx 1.41$ times as fast.`,
      visual: pair(['hoop', 'hoop'], ['disk', 'disk'], 'Same mass, same radius, same energy.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §10.4 Moment of inertia and rotational kinetic energy', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-4-moment-of-inertia-and-rotational-kinetic-energy' },
    { label: 'OpenStax University Physics Vol. 1, §10.5 Calculating moments of inertia', url: 'https://openstax.org/books/university-physics-volume-1/pages/10-5-calculating-moments-of-inertia' },
  ],
});
