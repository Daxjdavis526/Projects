// Relativistic momentum and energy — p = γmv, E = γmc², K = (γ − 1)mc²
// (derived by integrating the work, with integration by parts),
// E² = (pc)² + (mc²)², and E = pc for photons. Mass is always the invariant
// mass m. Rest energies are CODATA 2022; the Sun's luminosity is the IAU
// 2015 nominal value. Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { gamma } from '../../src/viz/model/relativity.js';
import { C, MEC2, MPC2, seg, label, r6 } from './_modern.js';

const t = String.raw;

const g = gamma;
const L_SUN = 3.828e26;               // W, IAU 2015 nominal solar luminosity
const UC2 = 931.49410372;             // MeV per atomic mass unit (CODATA 2022)
const M_U235 = 235.0439301;           // u, atomic mass of uranium-235 (AME2020)
const betaFromK = (K, m) => { const G = 1 + K / m; return Math.sqrt(1 - 1 / (G * G)); };

// K/(mc²) against speed: relativistic and Newtonian
const kGraph = (b, caption) => ({
  type: 'graph',
  params: {
    x: [0, 1.05], y: [0, 4], xlabel: 'speed v / c', ylabel: 'K / mc²',
    curves: [{ fn: '1/sqrt(1 - x^2) - 1', color: 'accent', domain: [0, 0.997], label: 'relativity: (γ − 1)mc²', labelAt: 0.82, labelDx: -150, labelDy: -6 }, { fn: '0.5*x^2', color: 'ink3', dash: true, label: 'Newton: ½mv²', labelAt: 0.95, labelDx: -20, labelDy: 18 }],
    vlines: [{ x: 1, label: 'c', color: 'warn' }, ...(b !== undefined ? [{ x: b, color: 'gold' }] : [])],
  },
  caption: caption ?? 'Kinetic energy in units of the rest energy, against speed. Gold: this particle’s speed.',
});
// p/(mc) against speed
const pGraph = (b, caption) => ({
  type: 'graph',
  params: {
    x: [0, 1.05], y: [0, 5], xlabel: 'speed v / c', ylabel: 'p / mc',
    curves: [{ fn: 'x/sqrt(1 - x^2)', color: 'accent', domain: [0, 0.998], label: 'γmv', labelAt: 0.9, labelDx: -40, labelDy: -8 }, { fn: 'x', color: 'ink3', dash: true, label: 'Newton: mv', labelAt: 0.9, labelDx: 6, labelDy: 16 }],
    vlines: [{ x: 1, label: 'c', color: 'warn' }, ...(b !== undefined ? [{ x: b, color: 'gold' }] : [])],
  },
  caption: caption ?? 'Momentum in units of mc, against speed. Gold: this particle’s speed.',
});
// an electron gun: cathode, anode, the accelerating voltage
const gunPicture = (V, caption) => ({
  type: 'graph',
  params: {
    x: [-0.5, 8.5], y: [-1.6, 1.8], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [seg(0.6, -1.1, 0.6, 1.1, 'ink', 4), seg(5.2, -1.1, 5.2, -0.18, 'ink', 4), seg(5.2, 0.18, 5.2, 1.1, 'ink', 4), seg(0.8, 0, 7.6, 0, 'gold', 1.6, true)],
    points: [{ x: 0.9, y: 0, r: 5, color: 'accent', label: 'electron starts at rest', labelDx: 8, labelDy: -14 }, label(0.6, -1.1, 'cathode', 'ink2', -22, 14), label(5.2, -1.1, `anode, ${V} higher`, 'ink2', -40, 14)],
    arrows: [{ from: [5.6, 0.55], to: [7.6, 0.55], color: 'accent', label: 'v = ?', labelDx: 8, labelDy: 0 }],
  },
  caption: caption ?? 'An electron gun: the electron gains kinetic energy eV crossing the gap. Not to scale.',
});

export default lesson({
  id: 'phys2220.R1.4',
  title: 'Relativistic momentum and energy',
  minutes: 13, difficulty: 3,
  intro: t`Newton’s momentum $mv$ is not conserved in every inertial frame once velocities transform relativistically. The momentum that is conserved, and the energy that goes with it, are

$$p = \gamma m v, \qquad E = \gamma m c^2$$

At rest $E = mc^2$: a body’s **rest energy**, the energy locked in its mass. The kinetic energy is what is left over, $K = E - mc^2 = (\gamma - 1)mc^2$; it becomes Newton’s $\tfrac12 mv^2$ at low speed but grows without limit as $v \to c$, so **no amount of energy brings a massive body to the speed of light**. Combined, $E^2 = (pc)^2 + (mc^2)^2$ — and for a massless photon, $E = pc$.

> Continue on the Road to Einstein: [Four-velocity, four-momentum and invariants](#/lesson/gr.S04.d) packs $E$ and $\vec p$ into one four-vector whose length is the mass.`,
  symbols: [
    { tex: 'p', text: t`momentum, in kg·m/s — or in MeV/$c$, the unit of particle physics` },
    { tex: 'E', text: t`the total energy, rest energy included, in J or MeV` },
    { tex: 'm', text: t`the mass — the same in every frame. Particle masses are quoted as rest energies: the electron’s $mc^2$ is ${fmt(MEC2, 4)}$ MeV, the proton’s ${fmt(MPC2, 6)} MeV` },
    { tex: 'v', text: 'the speed, in m/s' },
    { tex: '\\gamma', text: t`the Lorentz factor $1/\sqrt{1 - v^2/c^2}$` },
    { tex: 'c', text: t`the speed of light, $2.998\times10^{8}$ m/s` },
    { tex: 'K', text: t`kinetic energy, $(\gamma - 1)mc^2$: the energy of motion alone` },
  ],
  why: 'Accelerators, nuclear power and the shining of the Sun all run on these equations, and the combination E² − (pc)², the same for every observer, is where four-momentum and general relativity’s stress–energy begin.',
  visual: {
    type: 'graph',
    title: 'Pour in energy; the speed stalls below c',
    lead: t`An electron is given kinetic energy $K$ (by accelerating it through $K/e$ volts). The dashed line is Newton’s prediction for its speed, $\tfrac12 mv^2 = K$; the solid curve is relativity’s, $(\gamma - 1)mc^2 = K$. The vertical axis is $v^2/c^2$.`,
    tasks: [
      'At K = 0.05 MeV the two nearly agree (v ≈ 0.41c against Newton’s 0.44c); at 0.5 MeV Newton predicts 1.4c, but the electron reaches only 0.86c.',
      'Double K from 2.5 to 5 MeV: v/c only creeps from 0.985 to 0.996. Energy keeps growing; speed cannot pass c.',
      'Watch the last readout: E² − (pc)² stays (0.511 MeV)² however fast the electron goes — the mass does not change.',
    ],
    params: {
      x: [0, 5], y: [0, 2.2], xlabel: 'kinetic energy K (MeV)', ylabel: 'v² / c²',
      constants: { me: MEC2 },
      sliders: [{ key: 'K', label: 'Kinetic energy $K$', min: 0.05, max: 5, step: 0.05, value: 0.5, unit: '\\mathrm{MeV}', explain: t`The work done on the electron; accelerating it through 1 million volts gives 1 MeV.` }],
      curves: [
        { fn: '2*x/me', color: 'ink3', dash: true, label: 'Newton', labelAt: 0.75, labelDx: 8, labelDy: 0 },
        { fn: '1 - 1/(1 + x/me)^2', color: 'accent', label: 'relativity', labelAt: 3.6, labelDx: -20, labelDy: 16 },
      ],
      hlines: [{ y: 1, label: 'v = c', color: 'warn' }],
      points: [{ x: 'K', y: '1 - 1/(1 + K/me)^2', color: 'gold' }, { x: 'K', y: '2*K/me', color: 'ink3', when: 'step(2.15 - 2*K/me)' }],
      readouts: [
        { label: t`$\gamma = 1 + K/mc^2$`, expr: '1 + K/me', digits: 4 },
        { label: t`$v/c$`, expr: 'sqrt(1 - 1/(1 + K/me)^2)', digits: 4 },
        { label: t`Newton’s $v/c$`, expr: 'sqrt(2*K/me)', digits: 4 },
        { label: t`$pc$ (MeV)`, expr: 'sqrt(K^2 + 2*K*me)', digits: 4 },
        { label: t`$E$ (MeV)`, expr: 'K + me', digits: 4 },
        { label: t`$E^2 - (pc)^2$ (MeV²)`, expr: '(K + me)^2 - (K^2 + 2*K*me)', digits: 4 },
      ],
    },
    caption: t`Speed (as $v^2/c^2$) of an electron against its kinetic energy. In 1964 William Bertozzi timed electrons accelerated to energies up to 15 MeV: their speeds followed the relativistic curve and never reached $c$.`,
  },
  example: {
    prompt: t`A force pushes a particle of mass $m$ from rest along a straight line. Using Newton’s second law in the form $F = dp/dt$ with $p = \gamma m v$, show that the work done on it — its kinetic energy — is $K = (\gamma - 1)mc^2$.`,
    visual: kGraph(undefined, t`Kinetic energy in units of $mc^2$ against speed: the relativistic curve rises without limit at $v = c$, while Newton’s $\tfrac12 mv^2$ reaches only $\tfrac12 mc^2$ there.`),
    steps: [
      { label: 'Work as an integral of momentum', text: t`$W = \displaystyle\int F\,dx = \int \frac{dp}{dt}\,dx = \int v\,dp$, because $dx/dt = v$. The force does not need to be constant.` },
      { label: 'Integrate by parts', text: t`With $u = v$ and $dv$-part $dp$: $\displaystyle\int_0^p v\,dp = pv - \int_0^v p\,dv' = \gamma m v^2 - \int_0^v \frac{m v'}{\sqrt{1 - v'^2/c^2}}\,dv'$.` },
      { label: 'The remaining integral', text: t`Substitute $s = 1 - v'^2/c^2$: $\displaystyle\int_0^v \frac{m v'\,dv'}{\sqrt{1 - v'^2/c^2}} = \Big[-mc^2\sqrt{1 - v'^2/c^2}\,\Big]_0^v = mc^2\left(1 - \frac1\gamma\right)$.` },
      { label: 'Simplify', text: t`$K = \gamma m v^2 - mc^2 + \dfrac{mc^2}{\gamma}$. Since $\gamma m v^2 + \dfrac{mc^2}{\gamma} = \gamma m\left(v^2 + c^2 - v^2\right) = \gamma mc^2$, this is $K = \gamma mc^2 - mc^2 = (\gamma - 1)mc^2$.` },
      { label: 'Sense check', text: t`For $v \ll c$, $\gamma \approx 1 + \dfrac{v^2}{2c^2}$, so $K \approx \tfrac12 mv^2$ ✓. As $v \to c$, $\gamma \to \infty$: reaching $c$ would take infinite work.` },
    ],
    answer: t`$K = (\gamma - 1)mc^2$ — the total energy $\gamma mc^2$ minus the rest energy $mc^2$.`,
  },
  practice: [
    num({
      id: 'electron-K', difficulty: 1,
      gen(r) {
        const b = r.pick([0.5, 0.6, 0.8, 0.9, 0.95, 0.99]);
        const K = (g(b) - 1) * MEC2;
        return {
          prompt: t`An electron ($mc^2 = ${fmt(MEC2, 4)}$ MeV) moves at $${b}c$. What is its kinetic energy, in MeV?`,
          answer: K, units: 'MeV', tol: { rel: 0.005 },
          errors: [{ value: 0.5 * b * b * MEC2, feedback: t`That is Newton’s $\tfrac12 mv^2$, far too small at this speed. Use $K = (\gamma - 1)mc^2$.` }, { value: g(b) * MEC2, feedback: t`That is the total energy $\gamma mc^2$; subtract the rest energy.` }],
          hints: [t`$\gamma = 1/\sqrt{1 - ${b}^2}$, then $K = (\gamma - 1)\times${fmt(MEC2, 4)}$ MeV.`],
          teach: 'Kinetic energy is total energy minus rest energy: K = (γ − 1)mc².',
          explain: t`$\gamma = ${fmt(g(b), 4)}$, so $K = ${fmt(g(b) - 1, 4)}\times${fmt(MEC2, 4)} = ${fmt(K, 3)}$ MeV — ${fmt(K / (0.5 * b * b * MEC2), 3)} times Newton’s $\tfrac12 mv^2$.`,
          visual: kGraph(b),
        };
      },
    }),
    num({
      id: 'proton-p', difficulty: 2,
      gen(r) {
        const b = r.pick([0.6, 0.8, 0.9, 0.95, 0.99]);
        const p = g(b) * b * MPC2;
        return {
          prompt: t`A proton ($mc^2 = ${fmt(MPC2, 6)}$ MeV) moves at $${b}c$. What is its momentum, in MeV/$c$?`,
          answer: p, units: 'MeV/c', tol: { rel: 0.005 },
          errors: [{ value: b * MPC2, feedback: t`That is Newton’s $mv$. The conserved momentum is $\gamma m v$.` }, { value: g(b) * MPC2, feedback: t`That is the energy $\gamma mc^2$ (in MeV). Momentum also carries the factor $v/c$: $pc = \gamma mc^2\,(v/c)$.` }],
          hints: [t`$pc = \gamma\,(v/c)\,mc^2$, so in MeV/$c$, $p = \gamma \times ${b} \times ${fmt(MPC2, 6)}$.`, t`$\gamma = 1/\sqrt{1 - ${b}^2} = ${fmt(g(b), 4)}$.`],
          teach: 'Relativistic momentum is p = γmv; in particle units pc = γβ·mc².',
          explain: t`$p = \gamma\beta\,mc^2/c = ${fmt(g(b), 4)}\times${b}\times${fmt(MPC2, 6)}\ \text{MeV}/c = ${fmt(p, 4)}$ MeV/$c$, against Newton’s ${fmt(b * MPC2, 4)}.`,
          visual: pGraph(b),
        };
      },
    }),
    num({
      id: 'speed-from-K', difficulty: 2,
      gen(r) {
        const [V, Vt] = r.pick([[1e5, '100 kV'], [3e5, '300 kV'], [1e6, '1.0 MV'], [2e6, '2.0 MV'], [1e7, '10 MV']]);
        const K = V / 1e6, b = betaFromK(K, MEC2), bN = Math.sqrt(2 * K / MEC2);
        return {
          prompt: t`An electron starts from rest and is accelerated through a potential difference of ${Vt}, gaining kinetic energy $K = ${nice(K)}$ MeV. What is its speed, as a fraction of $c$? ($mc^2 = ${fmt(MEC2, 4)}$ MeV.)`,
          answer: b, tol: { rel: 0.002 },
          errors: [{ value: bN, feedback: t`That is Newton’s $\sqrt{2K/m}$${bN > 1 ? ', which is faster than light — impossible' : ''}. Use $\gamma = 1 + K/mc^2$, then $v/c = \sqrt{1 - 1/\gamma^2}$.` }],
          hints: [t`$\gamma = 1 + K/mc^2 = 1 + ${nice(K)}/${fmt(MEC2, 4)}$.`, t`Then $v/c = \sqrt{1 - 1/\gamma^2}$.`],
          teach: 'Go from kinetic energy to speed through γ: γ = 1 + K/mc², v/c = √(1 − 1/γ²).',
          explain: t`$\gamma = 1 + ${nice(K)}/${fmt(MEC2, 4)} = ${fmt(1 + K / MEC2, 4)}$, so $v/c = \sqrt{1 - 1/${fmt(1 + K / MEC2, 4)}^2} = ${fmt(b, 4)}$. Newton would say ${fmt(bN, 3)}.`,
          visual: gunPicture(Vt),
        };
      },
    }),
    num({
      id: 'energy-triangle', difficulty: 2,
      gen(r) {
        const pc = r.pick([1, 2, 5, 10]);
        const m = MPC2 / 1000, E = Math.sqrt(pc * pc + m * m);
        return {
          prompt: t`A proton in a beam has momentum $p = ${pc}$ GeV/$c$. Its rest energy is $mc^2 = ${fmt(m, 4)}$ GeV. What is its total energy, in GeV?`,
          answer: E, units: 'GeV', tol: { rel: 0.002 },
          errors: [{ value: pc + m, feedback: t`Energies combine like the sides of a right triangle: $E^2 = (pc)^2 + (mc^2)^2$, not $E = pc + mc^2$.` }, { value: pc, feedback: t`$E = pc$ holds only for massless particles. Include the rest energy: $E^2 = (pc)^2 + (mc^2)^2$.` }],
          hints: [t`$E = \sqrt{(pc)^2 + (mc^2)^2} = \sqrt{${pc}^2 + ${fmt(m, 4)}^2}$ GeV.`],
          teach: 'E² = (pc)² + (mc²)²: momentum and rest energy add like the two legs of a right triangle.',
          explain: t`$E = \sqrt{${pc * pc} + ${fmt(m * m, 4)}} = ${fmt(E, 4)}$ GeV. ${pc >= 5 ? t`With $pc \gg mc^2$ the proton is *ultra-relativistic*: $E \approx pc$, like a photon.` : 'The rest energy is still a sizeable part of the total.'}`,
          visual: {
            type: 'graph',
            params: {
              x: [-0.6, 5.4], y: [-0.9, 2.9], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [seg(0, 0, 4.2, 0, 'accent', 2.6), seg(4.2, 0, 4.2, 2, 'violet', 2.6), seg(0, 0, 4.2, 2, 'gold', 2.6), seg(3.95, 0, 3.95, 0.25, 'ink3', 1.2), seg(3.95, 0.25, 4.2, 0.25, 'ink3', 1.2)],
              points: [label(2.1, 0, `pc = ${pc} GeV`, 'accent', -40, 14), label(4.2, 1, 'mc² = 0.938 GeV', 'violet', 8, 0), label(2.1, 1, 'E = ?', 'gold', -48, -10)],
            },
            caption: 'E² = (pc)² + (mc²)² as a right triangle: momentum and rest energy are the legs, total energy the hypotenuse. Not to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'what-grows', difficulty: 2,
      prompt: t`A proton in an accelerator is pushed closer and closer to the speed of light. Which of its properties grow without limit?`,
      choices: ['Its energy and its momentum', 'Its mass', 'Its speed — past c, if you push long enough', 'Nothing: its momentum levels off at mc'],
      answer: 0,
      why: {
        1: t`Its mass $m$ — the rest energy $mc^2 = 938$ MeV — is the same in every frame. Older books call $\gamma m$ the “relativistic mass”, but that is just $E/c^2$ under another name.`,
        2: 'Its speed approaches c but never reaches it: reaching c would take infinite energy.',
        3: t`Newton’s $mv$ would level off near $mc$, but the conserved momentum is $\gamma mv$, which grows without limit.`,
      },
      hints: [t`Look at $E = \gamma mc^2$ and $p = \gamma mv$ as $\gamma \to \infty$.`, 'Which quantity is the same for every observer, however fast the proton moves?'],
      teach: 'As v → c, E and p grow without limit while the speed stays below c and the mass stays fixed.',
      explain: t`$E = \gamma mc^2$ and $p = \gamma m v$ both grow without limit as $\gamma \to \infty$, while $v$ creeps toward $c$. The LHC’s protons carry 6.8 TeV each — over 7000 times their rest energy — yet move at only about 3 m/s slower than light.`,
      visual: pGraph(undefined, 'Momentum in units of mc against speed: γmv (solid) grows without limit as v → c; Newton’s mv (dashed) would not.'),
    }),
    num({
      id: 'annihilation', difficulty: 2,
      prompt: t`In a PET scanner, a positron (the electron’s antiparticle, with the same mass) meets an electron and both annihilate, essentially at rest. Two photons fly off back to back. What is the energy of each photon, in keV? ($m_ec^2 = ${fmt(MEC2, 6)}$ MeV.)`,
      answer: MEC2 * 1000, units: 'keV', tol: { rel: 0.002 },
      errors: [{ value: 2 * MEC2 * 1000, feedback: 'That is the total for both photons; momentum conservation shares it equally between two back-to-back photons.' }],
      hints: ['Total energy before: two rest energies (they are at rest). Total momentum before: zero.', t`Zero total momentum means two photons with equal and opposite momenta — and for photons $E = pc$, so equal energies.`],
      teach: 'Mass can turn entirely into light: two particles at rest annihilate into two photons sharing their rest energy.',
      explain: t`Before: $E = 2m_ec^2 = ${fmt(2 * MEC2 * 1000, 4)}$ keV, $p = 0$. After: two photons with equal and opposite momenta, so equal energies $E = pc$: each carries $m_ec^2 = ${fmt(MEC2 * 1000, 4)}$ keV. PET scanners detect exactly these 511 keV pairs, back to back, to locate where each annihilation happened.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4.2, 4.2], y: [-1.3, 1.3], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          points: [{ x: -0.25, y: 0, r: 7, color: 'accent', label: 'e⁻', labelDx: -10, labelDy: -18 }, { x: 0.25, y: 0, r: 7, color: 'bad', label: 'e⁺', labelDx: -4, labelDy: -18 }],
          arrows: [{ from: [0.8, 0], to: [3.6, 0], color: 'gold', label: 'photon: E = ?', labelDx: -80, labelDy: 18 }, { from: [-0.8, 0], to: [-3.6, 0], color: 'gold', label: 'photon: E = ?', labelDx: 8, labelDy: 18 }],
        },
        caption: 'An electron and a positron at rest annihilate into two photons flying apart back to back.',
      },
    }),
    num({
      id: 'ion-engine', difficulty: 3,
      prompt: t`An ion thruster on a deep-space probe expels xenon ions at 30 km/s. Expanding $\gamma = (1 - \beta^2)^{-1/2}$ one term further than usual, $\gamma - 1 \approx \tfrac12\beta^2 + \tfrac38\beta^4$, where $\beta = v/c$. By what fraction does Newton’s $\tfrac12 mv^2$ *underestimate* the ions’ true kinetic energy? (Give a pure number, such as 3e-9.)`,
      answer: 0.75 * (30e3 / C) ** 2, tol: { rel: 0.02 },
      errors: [{ value: 0.5 * (30e3 / C) ** 2, feedback: t`Divide the extra term by Newton’s: $\dfrac{\tfrac38\beta^4}{\tfrac12\beta^2} = \tfrac34\beta^2$.` }, { value: (30e3 / C), feedback: t`The correction is second order: $\tfrac34\beta^2$, not $\beta$.` }],
      hints: [t`$K = (\gamma - 1)mc^2 \approx \tfrac12 mv^2\left(1 + \tfrac34\beta^2\right)$.`, t`So the fractional correction is $\tfrac34\beta^2$, with $\beta = 3.0\times10^{4}/(2.998\times10^{8})$.`],
      teach: 'At everyday speeds relativity corrects ½mv² by a fraction ¾v²/c² — utterly negligible for rockets, which is why Newton suffices for spaceflight.',
      explain: t`$\beta = ${tex(30e3 / C, 3)}$, so $\tfrac34\beta^2 = ${tex(0.75 * (30e3 / C) ** 2, 3)}$: Newton is off by less than one part in a hundred million. (A calculator subtracting $\gamma - 1$ directly would lose this in rounding — the series is the reliable route.)`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 0.5], y: [0, 0.25], xlabel: 'speed v / c', ylabel: 'K / (½mv²) − 1',
          curves: [{ fn: '2*(1/sqrt(1 - x^2) - 1)/x^2 - 1', color: 'accent', domain: [0.02, 0.5], label: 'exact', labelAt: 0.42, labelDx: -50, labelDy: -12 }, { fn: '0.75*x^2', color: 'gold', dash: true, label: '¾ v²/c²', labelAt: 0.45, labelDx: 6, labelDy: 14 }],
        },
        caption: 'How much ½mv² underestimates the kinetic energy, against speed. An ion thruster’s 30 km/s is v/c = 10⁻⁴: far off the left edge.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sun', difficulty: 2, transfer: true,
      prompt: t`The Sun radiates $3.828\times10^{26}$ W. How many kilograms of its mass become radiated energy every second?`,
      answer: L_SUN / (C * C), units: 'kg', tol: { rel: 0.01 },
      errors: [{ value: L_SUN / C, feedback: t`Divide by $c^2$, not $c$: $\Delta m = E/c^2$.` }],
      hints: [t`In one second the Sun emits $E = 3.828\times10^{26}$ J; use $\Delta m = E/c^2$.`, t`$c^2 = (2.998\times10^8)^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`],
      teach: 'Energy radiated is mass lost: Δm = E/c².',
      explain: t`$\Delta m = \dfrac{3.828\times10^{26}\ \text{J}}{8.988\times10^{16}\ \text{m}^2/\text{s}^2} = ${tex(L_SUN / (C * C), 3)}$ kg — over four million tonnes a second. Even so, in 4.6 billion years the Sun has lost well under a thousandth of its mass this way.`,
      visual: {
        type: 'graph',
        params: {
          x: [-3.2, 3.2], y: [-1.6, 1.6], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          shade: [{ fn: 'sqrt(1 - x^2)', lower: '-sqrt(1 - x^2)', from: -1, to: 1, color: 'gold', alpha: 0.55 }],
          arrows: [0, 45, 135, 180, 225, 315].map((d) => ({ from: [r6(1.15 * Math.cos(d * Math.PI / 180)), r6(1.15 * Math.sin(d * Math.PI / 180))], to: [r6(2.1 * Math.cos(d * Math.PI / 180)), r6(2.1 * Math.sin(d * Math.PI / 180))], color: 'warn' })),
          points: [label(2.2, -0.1, '3.828 × 10²⁶ W', 'warn', 8, 16)],
        },
        caption: 'The Sun radiating its luminosity in every direction. Not to scale.',
      },
    }),
    num({
      id: 'cp-tem', difficulty: 2,
      prompt: t`A transmission electron microscope accelerates electrons from rest through 200 kV. How fast do they move, as a fraction of $c$? ($m_ec^2 = ${fmt(MEC2, 4)}$ MeV.)`,
      answer: betaFromK(0.2, MEC2), tol: { rel: 0.003 },
      errors: [{ value: Math.sqrt(2 * 0.2 / MEC2), feedback: t`Newton’s $\sqrt{2K/m}$ overestimates at this energy. Use $\gamma = 1 + K/mc^2$.` }],
      hints: [t`$K = 0.200$ MeV, so $\gamma = 1 + 0.200/${fmt(MEC2, 4)}$.`, t`$v/c = \sqrt{1 - 1/\gamma^2}$.`],
      teach: 'Electrons in microscopes are relativistic: find γ from K, then the speed.',
      explain: t`$\gamma = ${fmt(1 + 0.2 / MEC2, 4)}$, so $v/c = ${fmt(betaFromK(0.2, MEC2), 4)}$; Newton would say ${fmt(Math.sqrt(2 * 0.2 / MEC2), 3)}. Microscope designers must use the relativistic momentum to get the electrons’ wavelength right (lesson Q1.3).`,
      visual: gunPicture('200 kV', 'The electron gun of a microscope: electrons gain 200 keV crossing the gap. Not to scale.'),
    }),
    num({
      id: 'cp-fission', difficulty: 2, transfer: true,
      prompt: t`When a uranium-235 nucleus splits, about 200 MeV is released. The atom’s rest energy is about $235.04 \times ${fmt(UC2, 6)}$ MeV. What percentage of its rest energy does one fission release?`,
      answer: 200 / (M_U235 * UC2) * 100, units: '%', tol: { rel: 0.01 },
      errors: [{ value: 200 / (M_U235 * UC2), feedback: 'That is the fraction; multiply by 100 for a percentage.' }],
      hints: [t`Rest energy $= 235.04 \times ${fmt(UC2, 6)}\ \text{MeV} \approx ${fmt(M_U235 * UC2, 4)}$ MeV.`, 'Divide 200 MeV by it and multiply by 100.'],
      teach: 'Nuclear reactions release about a tenth of a percent of the rest energy — millions of times more per kilogram than chemistry, and still a tiny fraction of mc².',
      explain: t`$\dfrac{200}{${fmt(M_U235 * UC2, 4)}}\times100\% = ${fmt(200 / (M_U235 * UC2) * 100, 3)}\%$. Burning fuel releases about a billionth of its rest energy; fission about a thousandth. Where that 0.09% comes from — the binding energy of nuclei — is lesson A1.2.`,
      visual: {
        type: 'graph',
        params: {
          x: [-4.6, 4.6], y: [-1.7, 1.7], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          shade: [
            { fn: 'sqrt(1.1^2 - (x + 2.4)^2)', lower: '-sqrt(1.1^2 - (x + 2.4)^2)', from: -3.5, to: -1.3, color: 'violet', alpha: 0.55 },
            { fn: 'sqrt(0.85^2 - (x - 2.6)^2)', lower: '-sqrt(0.85^2 - (x - 2.6)^2)', from: 1.75, to: 3.45, color: 'accent', alpha: 0.5 },
            { fn: 'sqrt(0.7^2 - (x - 1.4)^2) - 0.15', lower: '-sqrt(0.7^2 - (x - 1.4)^2) - 0.15', from: 0.7, to: 2.1, color: 'teal', alpha: 0.5 },
          ],
          points: [label(-2.4, -1.1, 'uranium-235 (+ a neutron)', 'violet', -80, 16), label(2.2, -1.0, 'two lighter nuclei + 2 or 3 neutrons', 'accent', -100, 18)],
          arrows: [{ from: [-1.1, 0], to: [0.4, 0], color: 'gold', label: '≈ 200 MeV', labelDx: -60, labelDy: -16 }],
        },
        caption: 'Fission of uranium-235, schematic: a neutron splits the nucleus into two lighter ones plus a few neutrons. Not to scale.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §5.8 Relativistic momentum', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-8-relativistic-momentum' },
    { label: 'OpenStax University Physics Vol. 3, §5.9 Relativistic energy', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-9-relativistic-energy' },
    { label: 'Bertozzi (1964), Speed and kinetic energy of relativistic electrons, Am. J. Phys. 32, 551', url: 'https://doi.org/10.1119/1.1970770' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
