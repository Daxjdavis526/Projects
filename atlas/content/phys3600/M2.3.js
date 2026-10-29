// Work and energy in electrostatics (Griffiths §2.4): assembling point
// charges (W = ½Σ qᵢVᵢ and the double-counting ½), the continuous form
// ½∫ρV, its rewriting as (ε₀/2)∫E² over all space, the uniformly charged
// ball done both ways, energy that does not superpose, and the infinite
// self-energy of a point charge. Transfer: the Coulomb energy of a nucleus
// (the liquid-drop term) and what it says about fission. Builds on
// phys2220.E5.3.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { EPS0, KC, sf, field } from './_bvp.js';

const t = String.raw;
const E2MeVfm = 1.43996448;          // e²/4πε₀ in MeV·fm (CODATA 2018)

/** The energy per unit radius dW/dr of a ball or shell (units kQ²/R²), shaded (graph). */
const energyPic = (which, caption, extra = {}) => ({
  type: 'graph',
  params: {
    x: [0, 5], y: [0, 0.62], aspect: 'wide', xlabel: 'r / R', ylabel: 'dW/dr', yticks: 0,
    curves: [
      ...(which === 'ball' ? [{ fn: 'x^4/2', domain: [0, 1], color: 'accent', width: 2.4 }] : []),
      { fn: '1/(2x^2)', domain: [1, 5], color: 'accent', width: 2.4 },
    ],
    shade: [
      ...(which === 'ball' ? [{ fn: 'x^4/2', from: 0, to: 1, color: 'accent', alpha: 0.25 }] : []),
      { fn: '1/(2x^2)', from: 1, to: 5, color: 'accent', alpha: 0.25 },
    ],
    vlines: [{ x: 1, color: 'ink3', label: 'surface' }],
    ...extra,
  },
  caption,
});

export default lesson({
  id: 'phys3600.M2.3',
  title: 'Work and energy in electrostatics',
  minutes: 15, difficulty: 3,
  equation: t`W = \frac12\int\rho V\,d\tau = \frac{\varepsilon_0}{2}\int_{\text{all space}} E^2\,d\tau`,
  intro: t`Bring charges in from infinity one at a time and add up the work: each new charge $q_i$ costs $q_i$ times the potential the earlier ones make where it lands. Summed over pairs, $W = \frac12\sum_i q_iV(\vec r_i)$ — the $\frac12$ because $\sum_i q_iV(\vec r_i)$ counts every pair twice. For a continuous distribution the sum becomes $\frac12\int\rho V\,d\tau$, and an integration by parts (with Gauss’s law) turns it into the second form: **the energy lives in the field**, at a density $u = \frac{\varepsilon_0}{2}E^2$, filling all of space. Energy is quadratic in the field, so it does **not** superpose: double every charge and the energy quadruples. You met $u = \frac12\varepsilon_0E^2$ inside a capacitor in [Physics II](#/lesson/phys2220.E5.3); here it is general.`,
  symbols: [
    { tex: 'W', text: 'the work needed to assemble the charge distribution from charges spread out at infinity, in J' },
    { tex: '\\rho', text: 'the charge density, in C/m³' },
    { tex: 'V', text: 'the potential of the whole distribution, in V, with $V(\\infty) = 0$' },
    { tex: 'd\\tau', text: 'a volume element, in m³' },
    { tex: '\\varepsilon_0', text: t`the vacuum permittivity, $8.854\times10^{-12}\ \text{F/m}$` },
    { tex: 'E', text: 'the magnitude of the total electric field, in V/m' },
  ],
  why: t`The field’s energy density $\tfrac12\varepsilon_0E^2$ becomes the electromagnetic part of the stress–energy tensor — the source of gravity on the right side of Einstein’s equations — and it is the energy a light wave carries.`,
  visual: {
    type: 'graph',
    title: 'Where the energy is',
    lead: t`The energy stored between radius $r$ and $r + dr$, for a charge $Q$ on a ball of radius $R$: spread uniformly through the volume, or all on the surface as a thin shell. The shaded area is the total energy. Slide $b$ to see how much of it lies beyond radius $b$.`,
    tasks: [
      t`Uniform ball: a sixth of the energy is inside the ball ($\tfrac{1}{10}$ of the $\tfrac35$ total, in units of $kQ^2/R$).`,
      t`Switch to the shell: no field inside, so no energy there — and the total drops from $\tfrac35$ to $\tfrac12$. Squeezing the same charge into the interior costs more.`,
      t`Set $b = 2$: half of the energy outside the surface lies within one radius of it. Energy beyond $b$ falls only as $1/b$.`,
    ],
    params: {
      x: [0, 6], y: [0, 0.62], aspect: 'wide', xlabel: 'r / R', ylabel: 'dW/dr', yticks: 0,
      choices: [{ key: 'm', label: 'Where the charge sits', options: [[0, 'through the volume'], [1, 'on the surface']], value: 0, explain: 'The same total charge and radius either way.' }],
      sliders: [{ key: 'b', label: t`Radius $b$ (in units of $R$)`, min: 1, max: 6, step: 0.25, value: 3, explain: 'The readout gives the energy stored beyond this radius.' }],
      curves: [
        { fn: 'x^4/2', domain: [0, 1], color: 'accent', width: 2.4, when: 'step(0.5 - m)' },
        { fn: '1/(2x^2)', domain: [1, 6], color: 'accent', width: 2.4 },
      ],
      shade: [
        { fn: 'x^4/2', from: 0, to: 1, color: 'accent', alpha: 0.25, when: 'step(0.5 - m)' },
        { fn: '1/(2x^2)', from: 1, to: 'b', color: 'accent', alpha: 0.25 },
        { fn: '1/(2x^2)', from: 'b', to: 6, color: 'gold', alpha: 0.35 },
      ],
      vlines: [{ x: 1, color: 'ink3', label: 'surface' }, { x: 'b', color: 'gold' }],
      readouts: [
        { label: t`total $W$ (units $kQ^2/R$)`, expr: '0.5 + 0.1*step(0.5 - m)', digits: 3 },
        { label: t`energy beyond $b$`, expr: '1/(2*b)', digits: 3 },
        { label: t`share beyond $b$`, expr: '(1/(2*b))/(0.5 + 0.1*step(0.5 - m))', digits: 3 },
      ],
    },
    caption: t`$dW/dr = \tfrac{\varepsilon_0}{2}E^2\cdot4\pi r^2$ in units of $kQ^2/R^2$ (with $k = 1/4\pi\varepsilon_0$), exact for both. The gold area runs out to $r = 6R$ on the picture, but the tail goes on to infinity: the readouts include all of it.`,
  },
  example: {
    prompt: t`Find the energy of a uniformly charged ball (charge $Q$, radius $R$) both ways, then put in $Q = 50$ nC and $R = 10$ cm.`,
    visual: energyPic('ball', t`$dW/dr$ for the uniform ball: the shaded area is the answer. The tail outside, $\int_R^\infty dr/2r^2 = \tfrac12$, outweighs the inside part, $\int_0^1 x^4/2\,dx = \tfrac1{10}$.`),
    steps: [
      { label: 'Charge times potential', text: t`From [M2.1](#/lesson/phys3600.M2.1), inside $V = \dfrac{kQ}{2R}\left(3 - \dfrac{r^2}{R^2}\right)$, and $\rho = \dfrac{3Q}{4\pi R^3}$. Only the inside counts, where $\rho \ne 0$.` },
      { label: 'Integrate', text: t`$W = \dfrac12\displaystyle\int_0^R\rho V\,4\pi r^2dr = \dfrac12\cdot\dfrac{3Q}{4\pi R^3}\cdot\dfrac{kQ}{2R}\cdot4\pi\displaystyle\int_0^R\left(3r^2 - \dfrac{r^4}{R^2}\right)dr = \dfrac{3kQ^2}{4R^4}\cdot\dfrac{4R^3}{5} = \dfrac35\dfrac{kQ^2}{R}$.` },
      { label: 'Field energy', text: t`$\dfrac{\varepsilon_0}{2}\displaystyle\int E^2d\tau$: inside $E = kQr/R^3$ gives $\dfrac{kQ^2}{10R}$; outside $E = kQ/r^2$ gives $\dfrac{kQ^2}{2R}$. Sum: $\dfrac{6}{10}\dfrac{kQ^2}{R}$ ✓. Note the field integral runs over **all space**, while $\rho V$ only over the charge.` },
      { label: 'Numbers', text: t`$W = 0.6\times\dfrac{(8.988\times10^9)(5\times10^{-8})^2}{0.1} \approx ${tex((0.6 * KC * 2.5e-15) / 0.1, 3)}$ J — about $${nice(sf((0.6 * KC * 2.5e-15) / 0.1 * 1e6, 3))}\ \mu\text{J}$.` },
      { label: 'Sense check', text: t`Units: $kQ^2/R$ is (N·m²/C²)(C²)/m = J ✓. More than a shell’s $\tfrac12kQ^2/R$: charge pushed inside sits closer to the rest of the charge.` },
    ],
    answer: t`$W = \dfrac35\dfrac{kQ^2}{R} = \dfrac{3Q^2}{20\pi\varepsilon_0R} \approx ${tex((0.6 * KC * 2.5e-15) / 0.1, 3)}$ J.`,
  },
  practice: [
    num({
      id: 'square', difficulty: 2,
      gen(r) {
        const q = r.pick([1, 2, 3]), a = r.pick([2, 4, 5]), alt = r.bool(0.5);
        const k = KC * (q * 1e-9) ** 2 / (a / 100);
        const ans = alt ? k * (-4 + Math.SQRT2) : k * (4 + Math.SQRT2);
        const qs = alt ? [q, -q, q, -q] : [q, q, q, q];
        const pos = [[-a / 2, -a / 2], [a / 2, -a / 2], [a / 2, a / 2], [-a / 2, a / 2]];
        return {
          prompt: t`Four charges sit at the corners of a square of side ${a} cm: ${alt ? t`$+${q}$, $-${q}$, $+${q}$, $-${q}$ nC going round (alternating)` : t`each $+${q}$ nC`}. How much work does it take to assemble them from far apart?`,
          visual: field({ x: [-a * 1.6, a * 1.6], y: [-a, a], charges: qs.map((qq, i) => ({ x: pos[i][0], y: pos[i][1], q: qq })), fieldLines: true, density: 8, grid: false }, `The four charges and their field lines. Side ${a} cm.`),
          answer: ans * 1e6, units: 'uJ', tol: { rel: 0.01 },
          errors: [
            { value: 2 * ans * 1e6, feedback: t`You counted each pair twice. Either sum over the six distinct pairs, or use $\tfrac12\sum_i q_iV_i$.` },
            { value: (alt ? -4 : 4) * k * 1e6, feedback: t`There are six pairs: four sides of length $a$ and **two diagonals** of length $a\sqrt2$.` },
          ],
          hints: [t`$W = k\sum_{\text{pairs}}\dfrac{q_iq_j}{r_{ij}}$ over the 6 distinct pairs, with $k = 8.988\times10^9$ N·m²/C².`, t`Four sides ($r = a$) and two diagonals ($r = a\sqrt2$): $W = \dfrac{kq^2}{a}\left(${alt ? '-4' : '4'} + \dfrac{2}{\sqrt2}\right)$.`],
          teach: 'The assembly energy of point charges is a sum over distinct pairs, each counted once.',
          explain: t`$W = \dfrac{kq^2}{a}\left(${alt ? '-4' : '4'} + \sqrt2\right) = \dfrac{(8.988\times10^9)(${q}\times10^{-9})^2}{${a / 100}}\times${alt ? '(' : ''}${nice(sf(alt ? -4 + Math.SQRT2 : 4 + Math.SQRT2, 4))}${alt ? ')' : ''} \approx ${nice(sf(ans * 1e6, 3))}\ \mu\text{J}$.${alt ? ' Negative: the alternating arrangement is bound — you would have to supply energy to pull it apart.' : ''}`,
        };
      },
    }),
    mcq({
      id: 'err-half', difficulty: 2, kind: 'error',
      prompt: t`For two charges $q_1$ and $q_2$ a distance $r$ apart, a student writes $W = q_1V_2(\vec r_1) + q_2V_1(\vec r_2) = 2kq_1q_2/r$, where $V_2$ is the potential of $q_2$ alone. What went wrong?`,
      visual: field({ x: [-8, 8], y: [-4, 4], charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: 3 }], fieldLines: true, density: 10, grid: false }, 'Two charges and their field lines.'),
      choices: [
        t`Each pair is counted twice: the work is $\tfrac12\sum q_iV_i = kq_1q_2/r$`,
        t`Each charge should also include its own potential, $q_1V_1(\vec r_1)$`,
        t`The potential energy of two charges is $kq_1q_2/r^2$`,
        t`Nothing: the work is $2kq_1q_2/r$`,
      ],
      answer: 0,
      why: {
        1: t`The potential of a point charge at its own position is infinite — the self-energy, which $\tfrac12\sum q_iV_i$ deliberately leaves out.`,
        2: t`$kq_1q_2/r^2$ is the size of the force. Energy goes as $1/r$.`,
        3: 'Bring q₁ in first (no work), then q₂ (work q₂V₁): one term, kq₁q₂/r.',
      },
      hints: ['Bring the charges in one at a time. How much work does the first one cost?'],
      teach: 'Σ qᵢVᵢ counts each pair twice; the ½ removes the double counting.',
      explain: t`The first charge costs nothing; the second costs $q_2V_1(\vec r_2) = kq_1q_2/r$. The symmetric sum $q_1V_2 + q_2V_1$ counts that one interaction twice, hence the $\tfrac12$ in $W = \tfrac12\sum_iq_iV(\vec r_i)$.`,
    }),
    num({
      id: 'dome', difficulty: 2,
      gen(r) {
        const V0 = r.pick([200, 300, 400]), R = r.pick([0.2, 0.25, 0.3]);
        const Q = (V0 * 1e3 * R) / KC, ans = 0.5 * Q * V0 * 1e3;
        return {
          prompt: t`A Van de Graaff generator’s dome is a metal sphere of radius ${nice(R * 100)} cm charged to ${V0} kV. How much energy is stored in its field?`,
          visual: field({ unit: 'm', x: [-1.2, 1.2], y: [-0.7, 0.7], conductor: { x: 0, y: 0, R, Q: Q * 1e9 }, fieldLines: true, equip: true, density: 12, grid: false }, t`The charged dome (grey) with its field lines and equipotentials. All of the energy is in the field outside it.`),
          answer: ans, units: 'J', tol: { rel: 0.01 },
          errors: [{ value: Q * V0 * 1e3, feedback: t`$W = \tfrac12QV$, not $QV$: the first charge went on for free, the last at the full ${V0} kV.` }, { value: 0.6 * Q * V0 * 1e3, feedback: t`$\tfrac35kQ^2/R$ is for charge spread through a ball. On a conductor all the charge sits on the surface: $\tfrac12kQ^2/R$.` }],
          hints: [t`The dome is a shell of charge $Q$ with $V_0 = kQ/R$. Its energy is $\tfrac12QV_0$.`, t`$Q = V_0R/k$, so $W = \dfrac{V_0^2R}{2k} = 2\pi\varepsilon_0RV_0^2$.`],
          teach: 'For a conductor at one potential, W = ½QV: the charges were added while the potential rose from 0 to V.',
          explain: t`$Q = V_0R/k \approx ${nice(sf(Q * 1e6, 3))}\ \mu\text{C}$, and $W = \tfrac12QV_0 = 2\pi\varepsilon_0RV_0^2 \approx ${nice(sf(ans, 3))}$ J — enough for a nasty spark, all of it stored in the air around the dome.`,
        };
      },
    }),
    mcq({
      id: 'quadratic', difficulty: 2,
      prompt: t`Two identical charge distributions, A and B, each have energy $W_0$ when alone. You place B exactly on top of A (the same place, so the charge density doubles everywhere). What is the energy now?`,
      visual: energyPic('ball', t`The energy per radius of a uniform ball (units of $kQ^2/R^2$). Doubling $\rho$ doubles $E$ everywhere; what does it do to $E^2$?`),
      choices: [t`$4W_0$`, t`$2W_0$`, t`$W_0$`, t`$\sqrt2\,W_0$`],
      answer: 0,
      why: {
        1: t`Energy is not additive: $W = \tfrac{\varepsilon_0}{2}\int(\vec E_A + \vec E_B)^2d\tau = W_A + W_B + \varepsilon_0\int\vec E_A\cdot\vec E_B\,d\tau$. The cross term is another $2W_0$ here.`,
        2: 'The field doubled, so the energy density, which goes as E², went up by four.',
        3: t`$\sqrt2$ would need $E$ to grow by $2^{1/4}$; superposing doubles it.`,
      },
      hints: [t`Fields superpose: the new field is $2\vec E$.`, t`$u = \tfrac{\varepsilon_0}{2}E^2$.`],
      teach: 'Fields add; energies do not — the energy carries a cross term ε₀∫E₁·E₂.',
      explain: t`The field doubles, so $E^2$ and the energy quadruple: $W = W_A + W_B + \varepsilon_0\int\vec E_A\cdot\vec E_B\,d\tau = W_0 + W_0 + 2W_0$. The cross term is the work of pushing B onto A against A’s repulsion.`,
    }),
    num({
      id: 'u-breakdown', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 2, 3]);
        const ans = 0.5 * EPS0 * (E * 1e6) ** 2;
        return {
          prompt: t`Dry air breaks down at about 3 MV/m. What is the energy density of the field at ${E} MV/m?`,
          visual: { type: 'em-capacitor', params: { A: 0.01, d: 2e-3, V: E * 2000, material: 'vacuum', f: 0, connected: true, gap: 'vacuum', controls: false, show: { charges: true, field: true, energy: true, values: false }, readouts: [] }, caption: t`A parallel-plate gap at this field, shaded by its energy density. Edge effects ignored.` },
          answer: ans, units: 'J/m^3', tol: { rel: 0.01 },
          errors: [{ value: EPS0 * (E * 1e6) ** 2, feedback: t`$u = \tfrac12\varepsilon_0E^2$: you lost the $\tfrac12$.` }, { value: 0.5 * EPS0 * E * 1e6, feedback: t`The field is squared: $u = \tfrac12\varepsilon_0E^2$.` }],
          hints: [t`$u = \tfrac12\varepsilon_0E^2$ with $E$ in V/m.`],
          teach: 'The energy density of an electric field is ½ε₀E², wherever the field is.',
          explain: t`$u = \tfrac12(8.854\times10^{-12})(${E}\times10^6)^2 \approx ${nice(sf(ans, 3))}\ \text{J/m}^3$. Tiny next to a battery or a fuel — the reason capacitors store so much less energy per volume.`,
        };
      },
    }),
    order({
      id: 'rank', difficulty: 3,
      prompt: t`The same charge $Q$ is arranged four ways. Rank them by the work needed to assemble them, **least first**.`,
      visual: { type: 'graph', params: { x: [-6, 6], y: [-2.2, 2.4], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['-1.5 + 1.2*cos(t)', '1.2*sin(t)'], t: [0, 2 * Math.PI], color: 'warn', width: 2.5 }, { param: ['4.5 + 0.6*cos(t)', '0.6*sin(t)'], t: [0, 2 * Math.PI], color: 'warn', width: 2.5 }, { param: ['1.5 + 0.3*cos(t)', '0.3*sin(t)'], t: [0, 2 * Math.PI], color: 'warn', width: 2.5 }], shade: [{ fn: 'sqrt(max(0.36 - (x + 4.5)^2, 0))', lower: '-sqrt(max(0.36 - (x + 4.5)^2, 0))', from: -5.1, to: -3.9, color: 'warn', alpha: 0.45 }], points: [{ x: -1.5, y: -1.75, r: 0, label: 'shell, radius 2R', labelDx: -46 }, { x: 4.5, y: -1.75, r: 0, label: 'shell, radius R', labelDx: -42 }, { x: -4.5, y: -1.75, r: 0, label: 'uniform ball, R', labelDx: -42 }, { x: 1.5, y: -1.75, r: 0, label: 'shell, radius R/2', labelDx: -46 }] }, caption: 'The four arrangements, to scale. Each holds the same total charge Q.' },
      items: ['a thin shell of radius 2R', 'a thin shell of radius R', 'a uniform ball of radius R', 'a thin shell of radius R/2'],
      hints: [t`A shell of radius $a$ stores $\tfrac12kQ^2/a$; a uniform ball of radius $R$ stores $\tfrac35kQ^2/R$.`, t`In units of $kQ^2/R$: $\tfrac14$, $\tfrac12$, $\tfrac35$, $1$.`],
      teach: 'The tighter the same charge is packed, the more work it takes to assemble.',
      explain: t`In units of $kQ^2/R$: shell at $2R$, $0.25$; shell at $R$, $0.5$; uniform ball, $0.6$; shell at $R/2$, $1$. Squeezing like charges together costs work, so smaller arrangements store more energy — and a point charge, squeezed to nothing, would store an infinite amount.`,
    }),
    mcq({
      id: 'self', difficulty: 3,
      prompt: t`For two point charges, $\tfrac12\sum q_iV_i$ gives a finite $W = kq_1q_2/r$, but $\tfrac{\varepsilon_0}{2}\int E^2d\tau$ over all space is infinite. Why do the two disagree?`,
      visual: { type: 'graph', params: { x: [0, 3], y: [0, 6], aspect: 'wide', xlabel: 'r (from a point charge)', ylabel: 'u ∝ 1/r⁴', yticks: 0, curves: [{ fn: '0.15/x^4', domain: [0.12, 3], color: 'accent', width: 2.4 }], shade: [{ fn: '0.15/x^4', from: 0.12, to: 3, color: 'accent', alpha: 0.2 }] }, caption: t`The energy density near a point charge grows as $1/r^4$; even with the volume factor $4\pi r^2$, the integral diverges at $r \to 0$.` },
      choices: [
        t`The field integral includes each charge’s infinite self-energy, which the sum over pairs leaves out`,
        t`The field integral is wrong for point charges; only $\tfrac12\sum q_iV_i$ is valid`,
        t`The sum should run over $i = j$ as well, which makes it infinite too, so they agree`,
        t`They differ by the factor $\tfrac12$`,
      ],
      answer: 0,
      why: {
        1: 'The field integral is right — it is the energy needed to build each point charge too, which happens to be infinite.',
        2: t`Including $i = j$ would add $q_iV_i(\vec r_i)$, the self-energy, which is the same infinity. That is the content of the right answer, not a fix for the sum.`,
        3: 'The ½ is in both forms; the difference is which interactions are counted.',
      },
      hints: [t`The field of each charge alone contributes $\tfrac{\varepsilon_0}{2}\int E_i^2d\tau$. What is that for a point charge?`, t`$\int_0\dfrac{1}{r^4}r^2dr$ diverges at $r = 0$.`],
      teach: 'The field-energy formula counts the work to build each charge itself; for a point charge that self-energy is infinite.',
      explain: t`$\tfrac{\varepsilon_0}{2}\int(\vec E_1 + \vec E_2)^2d\tau$ contains $\tfrac{\varepsilon_0}{2}\int E_1^2$ and $\tfrac{\varepsilon_0}{2}\int E_2^2$ — the energy to assemble each point charge — plus the cross term, which **is** $kq_1q_2/r$. For a continuous $\rho$ the two forms agree exactly. The infinite self-energy of a point electron is a real puzzle; quantum electrodynamics handles it by renormalization.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-nucleus', difficulty: 3, transfer: true,
      gen(r) {
        const [name, Z, A] = r.pick([['iron-56', 26, 56], ['lead-208', 82, 208], ['uranium-238', 92, 238]]);
        const R = 1.2 * Math.cbrt(A), ans = (0.6 * Z * Z * E2MeVfm) / R;
        return {
          prompt: t`Model the nucleus of ${name} ($Z = ${Z}$ protons, mass number $A = ${A}$) as a uniformly charged ball of charge $Ze$ and radius $R = r_0A^{1/3}$ with $r_0 = 1.2$ fm. What is its electrostatic energy, in MeV? Use $e^2/4\pi\varepsilon_0 = 1.440$ MeV·fm.`,
          visual: energyPic('ball', t`The energy per radius of a uniform ball, as for the nucleus. Real nuclei have a soft edge about 2 fm thick; the uniform ball is a model.`),
          answer: ans, units: 'MeV', tol: { rel: 0.01 },
          errors: [{ value: (0.5 * Z * Z * E2MeVfm) / R, feedback: t`$\tfrac12kQ^2/R$ is a shell. Protons fill the nucleus: $\tfrac35kQ^2/R$.` }],
          hints: [t`$W = \tfrac35\dfrac{(Ze)^2}{4\pi\varepsilon_0R} = \tfrac35Z^2\dfrac{1.440\ \text{MeV·fm}}{R}$.`, t`$R = 1.2\times${A}^{1/3} \approx ${nice(sf(R, 4))}$ fm.`],
          teach: 'The Coulomb energy of a uniformly charged ball, (3/5)kQ²/R, is the Coulomb term of the nuclear liquid-drop model.',
          explain: t`$W = 0.6\times${Z}^2\times1.440/${nice(sf(R, 4))} \approx ${nice(sf(ans, 3))}$ MeV. ${Z === 92 ? t`Split uranium into two halves ($Z = 46$, $A = 119$) and the Coulomb energy drops by a factor $2\cdot\tfrac14\cdot2^{1/3} \approx 0.63$ — about $${nice(sf(ans * (1 - 0.5 * Math.cbrt(2)), 3))}$ MeV freed. Fission releases about 200 MeV; the rest goes into the extra surface of two drops.` : t`This electrostatic cost grows as $Z^2/A^{1/3}$, faster than the strong-force binding, which is why heavy nuclei need extra neutrons and the heaviest ones fission.`} The semi-empirical mass formula uses $Z(Z-1)$ in place of $Z^2$: a proton does not repel itself.`,
        };
      },
    }),
    num({
      id: 'cp-ball', difficulty: 2,
      gen(r) {
        const Q = r.pick([20, 40, 80]), R = r.pick([5, 10, 20]);
        const ans = (0.6 * KC * (Q * 1e-9) ** 2) / (R / 100);
        return {
          prompt: t`How much energy is stored by $${Q}$ nC spread uniformly through a ball of radius ${R} cm?`,
          visual: energyPic('ball', t`The energy per radius of a uniform ball, in units of $kQ^2/R^2$; the shaded area is the energy.`),
          answer: ans * 1e6, units: 'uJ', tol: { rel: 0.01 },
          errors: [{ value: (0.5 * KC * (Q * 1e-9) ** 2) / (R / 100) * 1e6, feedback: t`That is the shell’s $\tfrac12kQ^2/R$. A ball also has field — and energy — inside.` }, { value: (0.1 * KC * (Q * 1e-9) ** 2) / (R / 100) * 1e6, feedback: t`That is only the energy inside the ball. The field outside holds five times as much.` }],
          hints: [t`$W = \tfrac35kQ^2/R$.`],
          teach: 'A uniformly charged ball stores (3/5)kQ²/R: a tenth inside, a half outside.',
          explain: t`$W = 0.6\times\dfrac{(8.988\times10^9)(${Q}\times10^{-9})^2}{${R / 100}} \approx ${nice(sf(ans * 1e6, 3))}\ \mu\text{J}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-where', difficulty: 2,
      prompt: t`An isolated conducting sphere of radius $R$ holds charge $Q$. Where is its energy stored?`,
      visual: energyPic('shell', t`$dW/dr$ for a charged shell — and a charged conducting sphere, whose charge sits on its surface.`),
      choices: [t`In the field outside, half of it within $2R$ of the centre`, t`In the metal, where the charges are`, t`Evenly spread through all space`, t`On the surface, in the charges themselves`],
      answer: 0,
      why: {
        1: t`The field inside the metal is zero, so $u = \tfrac12\varepsilon_0E^2 = 0$ there.`,
        2: t`$u \propto E^2 \propto 1/r^4$: the energy crowds close to the sphere.`,
        3: t`The formula $\tfrac12\int\rho V$ is about the surface charges, but $\tfrac{\varepsilon_0}{2}\int E^2$ places the same energy in the field. Only the field picture says **where**, and it survives once fields move and carry energy away as light.`,
      },
      hints: [t`$u = \tfrac{\varepsilon_0}{2}E^2$. Where is $E \ne 0$?`, t`Energy beyond radius $b$: $\int_b^\infty\dfrac{kQ^2}{2r^2}dr = \dfrac{kQ^2}{2b}$.`],
      teach: 'The field picture places electrostatic energy where E is nonzero, crowded near the charges as 1/r⁴.',
      explain: t`All of it is outside, and the energy beyond radius $b$ is $kQ^2/2b$: half of the total, $kQ^2/2R$, lies beyond $2R$ and half within. Inside the conductor $E = 0$ and there is none.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §2.4', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Krane, Introductory Nuclear Physics (Wiley, 1988), §3.3: the semi-empirical mass formula', url: 'https://www.wiley.com/en-us/Introductory+Nuclear+Physics%2C+3rd+Edition-p-9780471805533' },
    { label: 'CODATA 2018: fine-structure constant, ħc', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
