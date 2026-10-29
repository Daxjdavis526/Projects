// Energy in SHM: E = ½kA², shared between ½mv² and ½kx² — and the speed at
// any position, straight from the energy.
import { lesson, mcq, num } from '../../src/core/content.js';
import { s3, tn, springPic } from './_osc.js';

const t = String.raw;

// the energy diagram for a spring: U = ½kx², the total-energy line at E, no readouts (a question's picture)
const well = (k, E, A, { marks = [], caption, x } = {}) => ({
  type: 'mech-energy',
  params: {
    U: `0.5*${k}*x^2`, x: x ?? [-1.45 * A, 1.45 * A], y: [0, 1.6 * E], E, m: 1, readouts: [], play: false, dragE: false, dragX: false, bars: false, force: false,
    xlabel: 'x (m)', ylabel: 'energy (J)', marks,
  },
  caption: caption ?? 'Potential energy ½kx² (the parabola) and the total energy E (the line). Where the line is above the curve, the gap is the kinetic energy.',
});

export default lesson({
  id: 'phys2210.M15.2',
  title: 'Energy in simple harmonic motion',
  minutes: 10, difficulty: 2,
  intro: t`A spring stores potential energy $\tfrac12kx^2$; the moving mass carries kinetic energy $\tfrac12mv^2$. With no friction their sum never changes, and at the turning points, where $v = 0$, it is all potential:

$$E = \tfrac12 m v^2 + \tfrac12 k x^2 = \tfrac12 k A^2$$

The energy sloshes from spring to mass and back twice every cycle: all kinetic at $x = 0$, all potential at $x = \pm A$. Solved for the speed, the same equation gives $v$ at any position without knowing the time: $v = \pm\omega\sqrt{A^2 - x^2}$.`,
  symbols: [
    { tex: 'E', text: 'the total mechanical energy, in J — constant without friction' },
    { tex: '\\tfrac12 mv^2', text: 'the kinetic energy $K$ of the mass $m$ (kg) moving at speed $v$ (m/s)' },
    { tex: '\\tfrac12 kx^2', text: 'the elastic potential energy $U$ stored in a spring of constant $k$ (N/m) stretched or squeezed by $x$ (m)' },
    { tex: 'A', text: 'the amplitude, in m: the turning points are at $x = \\pm A$' },
    { tex: '\\omega = \\sqrt{k/m}', text: 'the angular frequency, in rad/s' },
  ],
  why: 'Energy gives the speed at any point of an oscillation in one line, and it is how engineers size springs that must launch something — a satellite from its dispenser, a pilot from an ejection seat — at a set speed.',
  visual: {
    type: 'mech-energy',
    title: 'The energy well of a spring',
    lead: t`The parabola is the spring’s potential energy, $U = \tfrac12kx^2$; the gold line is the total energy $E$. The ball oscillates between the turning points where the line meets the curve; the dashed gap above the ball is its kinetic energy. Press **Play** or drag the energy line.`,
    tasks: [
      'Raise E: the turning points move out. Four times the energy doubles the amplitude.',
      'Watch the bars as it moves: kinetic energy peaks at x = 0, potential energy at the turning points, and the total never changes.',
      'Stiffen the spring at the same energy: the well narrows and the amplitude shrinks.',
    ],
    params: {
      U: '0.5*k*x^2', x: [-1.6, 1.6], y: [0, 3], m: 1, x0: -0.6,
      sliders: [
        { key: 'k', label: 'Spring constant $k$', min: 1, max: 4, step: 0.1, value: 2, unit: '\\mathrm{N/m}', explain: 'A stiffer spring makes a narrower, steeper well.' },
        { key: 'E', label: 'Total energy $E$', min: 0.1, max: 2.5, step: 0.05, value: 1, unit: '\\mathrm{J}', explain: 'Set by how far the mass is pulled (or how hard it is pushed) to start.' },
      ],
      readouts: ['E', 'U', 'K', 'x', 'v'], xlabel: 'x (m)', ylabel: 'energy (J)',
    },
    caption: 'A 1 kg mass on an ideal spring, no friction: U = ½kx², and K = E − U wherever the line lies above the curve.',
  },
  example: {
    prompt: t`A $0.40$ kg block on a spring with $k = 160$ N/m oscillates with an amplitude of $5.0$ cm. Find its total energy, its greatest speed, and its speed when it is $3.0$ cm from equilibrium.`,
    visual: { type: 'mech-energy', params: { U: '0.5*160*x^2', x: [-0.07, 0.07], y: [0, 0.3], E: 0.2, m: 0.4, x0: 0.03, readouts: ['E', 'U', 'K', 'v'], xlabel: 'x (m)', ylabel: 'energy (J)', marks: [{ x: 0.03, label: 'x = 3.0 cm' }] } },
    steps: [
      { label: 'Total energy', text: t`At a turning point it is all potential: $E = \tfrac12kA^2 = \tfrac12(160)(0.050)^2 = 0.20\ \text{J}$.` },
      { label: 'Greatest speed', text: t`At $x = 0$ it is all kinetic: $\tfrac12mv_\text{max}^2 = 0.20$, so $v_\text{max} = \sqrt{2(0.20)/0.40} = 1.0\ \text{m/s}$. (Check: $A\omega = 0.050\sqrt{160/0.40} = 0.050\times20 = 1.0$. ✓)` },
      { label: 'Energy at 3.0 cm', text: t`$U = \tfrac12(160)(0.030)^2 = 0.072\ \text{J}$, so $K = 0.20 - 0.072 = 0.128\ \text{J}$.` },
      { label: 'Speed there', text: t`$v = \sqrt{2K/m} = \sqrt{2(0.128)/0.40} = 0.80\ \text{m/s}$ — or in one step, $v = \omega\sqrt{A^2 - x^2} = 20\sqrt{0.050^2 - 0.030^2} = 0.80$. ✓` },
    ],
    answer: t`$E = 0.20$ J; $v_\text{max} = 1.0$ m/s; $v = 0.80$ m/s at 3.0 cm.`,
  },
  practice: [
    num({
      id: 'energy', difficulty: 1,
      gen(r) {
        const k = r.pick([50, 120, 400]), A = r.pick([3, 5, 8]);
        const E = 0.5 * k * (A / 100) ** 2;
        return {
          prompt: t`A spring with $k = ${k}$ N/m is pulled ${A} cm from equilibrium and released. What is the total energy of the oscillation?`,
          answer: E, units: 'J', tol: { rel: 0.005 },
          errors: [{ value: k * (A / 100) ** 2, feedback: t`The stored energy is $\tfrac12kA^2$: keep the ½.` }, { value: 0.5 * k * A * A, feedback: 'Convert centimetres to metres before squaring.' }, { value: 0.5 * k * (A / 100), feedback: t`Square the amplitude: $\tfrac12kA^2$.` }],
          hints: [t`At the turning point the energy is all in the spring: $E = \tfrac12kA^2$.`],
          teach: 'The total energy of a spring oscillator is ½kA².',
          explain: t`$E = \tfrac12(${k})(${A / 100})^2 = ${tn(E)}\ \text{J}$.`,
          visual: springPic({ m: 'm', k: `k = ${k} N/m`, arrow: `${A} cm` }),
        };
      },
    }),
    num({
      id: 'vmax', difficulty: 2,
      gen(r) {
        const m = r.pick([0.25, 0.5, 2.0]), k = r.pick([100, 200, 450]), A = r.pick([0.04, 0.06, 0.1]);
        const E = 0.5 * k * A * A, v = Math.sqrt((2 * E) / m);
        return {
          prompt: t`A ${m} kg mass oscillates on a spring with $k = ${k}$ N/m and an amplitude of ${A} m. Use energy to find its greatest speed.`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(E / m), feedback: t`$\tfrac12mv^2 = E$ gives $v = \sqrt{2E/m}$: keep the 2.` }, { value: (2 * E) / m, feedback: 'That is v²; take the square root.' }],
          hints: [t`All the energy is kinetic at $x = 0$: $\tfrac12mv_\text{max}^2 = \tfrac12kA^2$.`, t`So $v_\text{max} = A\sqrt{k/m}$.`],
          teach: 'At equilibrium all the energy is kinetic: ½mv²_max = ½kA².',
          explain: t`$E = \tfrac12(${k})(${A})^2 = ${tn(E)}$ J, and $v_\text{max} = \sqrt{2E/m} = ${tn(v)}\ \text{m/s}$ $(= A\omega)$.`,
          visual: well(k, E, A, { caption: 'The spring’s energy well and the total-energy line. At x = 0 the gap — all kinetic energy — is greatest.' }),
        };
      },
    }),
    num({
      id: 'v-at-x', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1.0]), k = r.pick([50, 200]), A = r.pick([0.1, 0.2]), f = r.pick([0.4, 0.5, 0.8]);
        const x = f * A, v = Math.sqrt(k / m) * Math.sqrt(A * A - x * x);
        return {
          prompt: t`A ${m} kg mass on a spring ($k = ${k}$ N/m) oscillates with amplitude ${A} m. How fast is it moving when it is ${tn(x)} m from equilibrium?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k / m) * A, feedback: 'That is the greatest speed, at x = 0. Here part of the energy is still in the spring.' }, { value: Math.sqrt(k / m) * (A - x), feedback: t`Subtract the squares: $v = \omega\sqrt{A^2 - x^2}$, not $\omega(A - x)$.` }],
          hints: [t`$\tfrac12mv^2 + \tfrac12kx^2 = \tfrac12kA^2$.`, t`$v = \sqrt{k/m}\,\sqrt{A^2 - x^2}$.`],
          teach: 'Energy gives the speed at any position: v = ω√(A² − x²).',
          explain: t`$v = \sqrt{${k}/${m}}\sqrt{${A}^2 - ${tn(x)}^2} = ${tn(Math.sqrt(k / m))}\times${tn(Math.sqrt(A * A - x * x))} = ${tn(v)}\ \text{m/s}$.`,
          visual: well(k, 0.5 * k * A * A, A, { marks: [{ x: +x.toFixed(4), label: 'here' }] }),
        };
      },
    }),
    mcq({
      id: 'half-half', difficulty: 2,
      prompt: t`An oscillator has amplitude $A$. At what distance from equilibrium is its energy shared equally between kinetic and potential?`,
      choices: [t`$A/\sqrt2 \approx 0.71A$`, t`$A/2$`, t`$A/4$`, t`$0$`],
      answer: 0,
      why: {
        1: t`At $A/2$ the spring holds $\tfrac12k(A/2)^2 = \tfrac14$ of the energy, not half: potential energy grows as $x^2$.`,
        2: t`At $A/4$ only $\tfrac1{16}$ of the energy is in the spring.`,
        3: 'At x = 0 all the energy is kinetic.',
      },
      hints: [t`Set $U = \tfrac12E$: $\tfrac12kx^2 = \tfrac12\cdot\tfrac12kA^2$.`, t`So $x^2 = A^2/2$.`],
      teach: 'Potential energy grows as x²: half the energy sits in the spring at x = A/√2, not at A/2.',
      explain: t`$\tfrac12kx^2 = \tfrac14kA^2 \Rightarrow x = A/\sqrt2 \approx 0.71A$. Because $U \propto x^2$, the mass is already 71% of the way out when the spring holds half the energy.`,
      visual: well(2, 1, 1, { caption: 'The energy well with the total-energy line. U = ½kx² grows as the square of the displacement.' }),
    }),
    mcq({
      id: 'double-A', difficulty: 1,
      prompt: t`The same mass on the same spring is set oscillating with twice the amplitude. Compared with before:`,
      choices: ['The energy is 4 times as large, the top speed twice as large, the period the same', 'The energy is twice as large, the top speed twice as large, the period the same', 'The energy is 4 times as large, the top speed 4 times as large, the period twice as long', 'Everything is the same: the energy is set by the spring'],
      answer: 0,
      why: {
        1: t`Energy goes as $A^2$: $\tfrac12k(2A)^2 = 4\cdot\tfrac12kA^2$.`,
        2: t`Speed goes as $\sqrt{E}$, so 4 times the energy gives twice the speed — and the period does not depend on $A$.`,
        3: 'The spring sets the period, but the energy depends on how far it is stretched.',
      },
      hints: [t`$E = \tfrac12kA^2$, $v_\text{max} = A\omega$, $T = 2\pi/\omega$.`],
      teach: 'Energy scales as A², speeds as A, and the period not at all.',
      explain: t`$E \propto A^2$ (×4), $v_\text{max} = A\omega$ (×2), $T = 2\pi\sqrt{m/k}$ (unchanged).`,
      visual: springPic({ x: 1.0, ghost: 0.5, m: 'm', k: 'k', arrow: '2A (dashed: A)' }),
    }),
    num({
      id: 'amp-from-ic', difficulty: 3,
      gen(r) {
        const m = r.pick([0.5, 2.0]), k = r.pick([50, 200]), x0 = r.pick([0.03, 0.05]), v0 = r.pick([0.4, 0.8, 1.2]);
        const A = Math.sqrt(x0 * x0 + (m * v0 * v0) / k);
        return {
          prompt: t`A ${m} kg block on a spring ($k = ${k}$ N/m) is ${x0} m from equilibrium and moving at ${v0} m/s. What is the amplitude of its oscillation?`,
          answer: A, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: x0, feedback: 'It is still moving at that point, so it will go further before turning: the amplitude is larger than x₀.' }, { value: x0 + v0 * Math.sqrt(m / k), feedback: t`Energies add, not distances: $A^2 = x_0^2 + v_0^2/\omega^2$.` }],
          hints: [t`$\tfrac12kA^2 = \tfrac12kx_0^2 + \tfrac12mv_0^2$.`, t`$A = \sqrt{x_0^2 + \dfrac{m v_0^2}{k}}$.`],
          teach: 'The amplitude comes from the total energy, potential plus kinetic, at any one moment.',
          explain: t`$A = \sqrt{${x0}^2 + \dfrac{${m}(${v0})^2}{${k}}} = \sqrt{${tn(x0 * x0)} + ${tn((m * v0 * v0) / k)}} = ${tn(A)}\ \text{m}$.`,
          visual: springPic({ x: 0.55, m: `${m} kg`, k: `k = ${k} N/m`, arrow: `${x0} m`, v: `${v0} m/s` }),
        };
      },
    }),
    mcq({
      id: 'k-u-graph', difficulty: 2,
      prompt: t`The graph shows the kinetic energy $K$ and the potential energy $U$ of a mass on a spring over one period of its motion, $T$. Which statement is true?`,
      choices: ['K and U each peak twice in every period of the motion', 'K and U each peak once in every period', 'K + U rises and falls during the motion', 'U is greatest when the mass passes through equilibrium'],
      answer: 0,
      why: {
        1: 'Look again: U peaks at both turning points, x = +A and x = −A, and K peaks at both passes through x = 0 — twice each per period.',
        2: 'The two curves always add to the same constant: the top dashed line.',
        3: 'At equilibrium the spring is unstretched, so U = 0 there; K is greatest.',
      },
      hints: ['How many times per period does the mass reach a turning point?'],
      teach: 'Energy sloshes between K and U at twice the oscillation’s frequency.',
      explain: t`$U = \tfrac12kA^2\cos^2\omega t$ and $K = \tfrac12kA^2\sin^2\omega t$: both oscillate at $2\omega$, and their sum is the constant $\tfrac12kA^2$.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 1.05], y: [0, 1.25], xlabel: 't (in units of T)', ylabel: 'energy (in units of E)', xticks: 8,
          curves: [{ fn: 'cos(2*pi*x)^2', color: 'good', label: 'U', labelAt: 0.04 }, { fn: 'sin(2*pi*x)^2', color: 'accent', label: 'K', labelAt: 0.2 }],
          hlines: [{ y: 1, label: 'K + U', color: 'gold' }],
        },
        caption: 'Kinetic and potential energy over one period of the motion, starting from a turning point. No friction.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-amplitude', difficulty: 2,
      gen(r) {
        const k = r.pick([80, 250, 600]), E = r.pick([0.4, 1.0, 2.5]);
        const A = Math.sqrt((2 * E) / k);
        return {
          prompt: t`A spring with $k = ${k}$ N/m oscillates with a total energy of ${E} J. What is the amplitude, in cm?`,
          answer: A * 100, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(E / k) * 100, feedback: t`$E = \tfrac12kA^2$ gives $A = \sqrt{2E/k}$: keep the 2.` }],
          hints: [t`$E = \tfrac12kA^2$.`],
          teach: 'The amplitude follows from the energy: A = √(2E/k).',
          explain: t`$A = \sqrt{2(${E})/${k}} = ${tn(A)}\ \text{m} = ${tn(A * 100)}\ \text{cm}$.`,
          visual: well(k, E, A),
        };
      },
    }),
    num({
      id: 'cp-kinetic-share', difficulty: 2,
      gen(r) {
        const [frac, ftex] = r.pick([[0.5, '\\tfrac12'], [1 / 3, '\\tfrac13'], [0.6, '0.6'], [0.8, '0.8']]);
        const share = 1 - frac * frac;
        return {
          prompt: t`An oscillator with amplitude $A$ is at $x = ${ftex}A$. What fraction of its energy is kinetic?`,
          answer: share, tol: { rel: 0.005 },
          errors: [{ value: 1 - frac, feedback: t`Potential energy goes as $x^2$: the spring holds $(x/A)^2$ of the energy.` }, { value: frac * frac, feedback: 'That is the potential (spring) share. The kinetic share is the rest.' }],
          hints: [t`$U/E = (x/A)^2$.`],
          teach: 'At position x the spring holds (x/A)² of the energy; the rest is kinetic.',
          explain: t`$\dfrac{K}{E} = 1 - \left(\dfrac{x}{A}\right)^2 = 1 - ${tn(frac * frac)} = ${tn(share)}$.`,
          visual: well(2, 1, 1, { marks: [{ x: +frac.toFixed(4), label: 'here' }], caption: 'The energy well (amplitude 1 m for the picture), with the position marked.' }),
        };
      },
    }),
    num({
      id: 'cp-cubesat', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([1.3, 2.6, 4.0]), k = r.pick([300, 400, 500]), d = r.pick([0.08, 0.1, 0.12]);
        const v = d * Math.sqrt(k / m);
        return {
          prompt: t`A small satellite of mass ${m} kg is pushed out of its dispenser in orbit by a spring ($k = ${k}$ N/m) that was compressed ${tn(d * 100)} cm. Treating the spring as ideal and ignoring friction in the rails, how fast does the satellite leave?`,
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: d * Math.sqrt(k / m) * Math.SQRT1_2, feedback: t`All of $\tfrac12kd^2$ becomes $\tfrac12mv^2$: the halves cancel.` }, { value: (k * d * d) / m, feedback: 'That is v². Take the square root.' }],
          hints: ['The spring’s stored energy becomes the satellite’s kinetic energy.', t`$\tfrac12kd^2 = \tfrac12mv^2$.`],
          teach: 'A spring launcher turns ½kd² into ½mv².',
          explain: t`$v = d\sqrt{k/m} = ${d}\sqrt{${k}/${m}} = ${tn(v)}\ \text{m/s}$ — a typical deployment speed for small satellites. In orbit there is no weight to work against, so all the spring’s energy goes into the satellite (and a little into the dispenser’s recoil, ignored here).`,
          visual: springPic({ x: -1.1, m: 'satellite', k: `k = ${k} N/m`, arrow: `${tn(d * 100)} cm` }),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §15.2 Energy in Simple Harmonic Motion', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-2-energy-in-simple-harmonic-motion' }],
});
