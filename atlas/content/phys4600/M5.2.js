// Magnetic dipole radiation (Griffiths §11.1.3). A small loop of radius b
// carrying I₀ cos ωt is a magnetic dipole m₀ cos ωt, m₀ = πb²I₀; its far
// fields are the electric dipole's with E and cB swapped (E circles the axis),
// ⟨S⟩ = (μ₀m₀²ω⁴/32π²c³) sin²θ/r² and ⟨P⟩ = μ₀m₀²ω⁴/12πc³ — weaker than an
// electric dipole of the same size by (ωb/c)². Explore: em4c-dipole with
// the electric/magnetic choice. Worked example: the Crab pulsar's spin-down
// power read as a rotating magnetic dipole (two oscillating dipoles in
// quadrature, μ₀m⊥²ω⁴/6πc³), giving its surface field ~4 × 10⁸ T —
// explicitly the vacuum-dipole model (real magnetospheres are full of plasma;
// the measured braking index is 2.5, not 3). Transfers: Vela's field, a
// pulsar's characteristic age P/2Ṗ against the Crab's recorded birth in
// 1054, and a loop antenna's horizontal polarization.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, C, PI, DEG, sf, magP, dipolePic, patternPic } from './_em4c.js';

const t = String.raw;
const YR = 365.25 * 86400;

/** Vacuum-dipole spin-down of a pulsar (period P in s, Ṗ dimensionless; I = 10³⁸ kg m², R = 10 km, α = 90°). */
function spin(P, Pd, I = 1e38, R = 1e4) {
  const w = (2 * PI) / P, Edot = (4 * PI * PI * I * Pd) / P ** 3;
  const m = Math.sqrt((Edot * 6 * PI * C ** 3) / (MU0 * w ** 4));
  return { w, Edot, m, B: (MU0 * m) / (4 * PI * R ** 3), age: P / (2 * Pd) / YR, rlc: C / w };
}

// the worked example: the Crab pulsar (ATNF catalogue: P = 33.4 ms, Ṗ = 4.21 × 10⁻¹³)
const EX = { P: 0.0334, Pd: 4.21e-13, I: 1e38, R: 1e4 };
Object.assign(EX, spin(EX.P, EX.Pd, EX.I, EX.R));
if (Math.abs(2 * magP(EX.m, EX.w) / EX.Edot - 1) > 1e-9) throw new Error('M5.2: rotating-dipole power');

const PULSARS = {
  vela: { name: 'the Vela pulsar', P: 0.0893, Pd: 1.25e-13 },
  b1509: { name: 'PSR B1509−58', P: 0.1512, Pd: 1.53e-12 },
  crab: { name: 'the Crab pulsar', P: 0.0334, Pd: 4.21e-13 },
};

/** A neutron star with its spin axis (vertical) and its magnetic axis tilted by alpha degrees (graph, not to scale). */
function pulsarPic(caption, alpha = 60, { cyl = true } = {}) {
  const a = alpha * DEG, L = 1.6;
  return {
    type: 'graph',
    params: {
      x: [-2.6, 2.6], y: [-1.9, 1.9], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', xticks: 0, yticks: 0,
      shade: [{ fn: 'sqrt(max(0, 0.36 - x^2))', lower: '-sqrt(max(0, 0.36 - x^2))', from: -0.6, to: 0.6, color: 'accent', alpha: 0.4 }],
      curves: [
        { param: ['0', 't'], t: [-1.8, 1.8], color: 'ink3', width: 1.4, dash: [4, 4] },
        ...(cyl ? [{ param: ['2.3', 't'], t: [-1.8, 1.8], color: 'gold', width: 1.2, dash: [6, 5] }, { param: ['-2.3', 't'], t: [-1.8, 1.8], color: 'gold', width: 1.2, dash: [6, 5] }] : []),
      ],
      arrows: [{ from: [0, 0], to: [+(L * Math.sin(a)).toFixed(4), +(L * Math.cos(a)).toFixed(4)], color: 'teal', width: 2.4, label: 'm' }],
      points: [
        { x: 0, y: 1.75, r: 0, label: 'spin axis', color: 'ink3', labelDx: 6, labelDy: 0 },
        ...(cyl ? [{ x: 2.3, y: -1.6, r: 0, label: 'light cylinder, c/ω', color: 'gold', labelDx: -6, labelDy: 0, labelAlign: 'right' }] : []),
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4600.M5.2',
  title: 'Magnetic dipole radiation',
  minutes: 16, difficulty: 3,
  equation: t`\begin{gathered}\langle\vec S\rangle = \frac{\mu_0m_0^2\omega^4}{32\pi^2c^3}\,\frac{\sin^2\theta}{r^2}\,\hat r, \\ \langle P\rangle = \frac{\mu_0m_0^2\omega^4}{12\pi c^3}\end{gathered}`,
  intro: t`Now drive a small loop of wire, radius $b$, with an oscillating current $I_0\cos\omega t$. No charge piles up anywhere, so there is no electric dipole; the loop is a **magnetic dipole** $m(t) = m_0\cos\omega t$, with $m_0 = \pi b^2I_0$. The same three approximations as in [M5.1](#/lesson/phys4600.M5.1) give radiation with **the same $\sin^2\theta$ pattern**, but with the roles of the fields swapped: now $\vec B$ lies in the planes through the axis and $\vec E$ circles the axis. The power has an extra $1/c^2$. Compared with an electric dipole of the same size, it is smaller by a factor of about $(\omega b/c)^2$ — tiny whenever the source is much smaller than a wavelength. That is why magnetic dipole radiation matters mostly when there is no electric dipole to outshine it: a spinning magnetized neutron star.`,
  symbols: [
    { tex: 'm_0', text: t`the amplitude of the magnetic dipole moment, $\pi b^2I_0$ for a loop, in $\text{A·m}^2$` },
    { tex: '\\omega', text: 'the angular frequency, in rad/s' },
    { tex: '\\theta', text: 'the angle from the dipole’s axis' },
    { tex: 'r', text: t`the distance, far away ($r \gg \lambda$), in m` },
    { tex: '\\langle\\vec S\\rangle,\\ \\langle P\\rangle', text: t`the cycle-averaged intensity ($\text{W/m}^2$) and total power (W)` },
    { tex: '\\mu_0,\\ c', text: 'the permeability of free space and the speed of light' },
  ],
  why: t`Pulsars slow down by radiating — magnetic dipole radiation is the standard first estimate of their fields — and loop antennas, MRI coils and atomic transitions with no electric dipole all radiate this way, weakly.`,
  visual: {
    type: 'em4c-dipole',
    title: 'Electric or magnetic: the same doughnut',
    lead: t`Switch between an oscillating pair of charges and an oscillating current loop. The field lines in a plane through the axis have **exactly the same shape**: for the charges they are electric field lines, for the loop magnetic ones. The other field circles the axis, through the page.`,
    tasks: [
      t`Choose the loop and zoom in: inside $r = \lambda/2\pi$ the lines are a bar magnet’s, swelling and shrinking with the current.`,
      t`Press Play: closed loops of $\vec B$ break away just as loops of $\vec E$ did — each one with a ring of $\vec E$ threaded through it.`,
      t`The pattern below is $\sin^2\theta$ for both. What differs is how strong the radiation is for a source of a given size.`,
    ],
    params: { kind: 'magnetic', kinds: ['electric', 'magnetic'], phase: 60, view: 1.2, panels: ['lines', 'pattern'], controls: ['phase', 'view', 'kind'] },
    caption: t`Exact fields of point dipoles (size $\ll\lambda$) in a plane through the axis; the electric and magnetic cases are duals ($\vec E \to c\vec B$, $c\vec B \to -\vec E$), so one set of curves serves both. Line spacing is only a rough guide to strength. Lengths in wavelengths.`,
  },
  example: {
    prompt: t`The Crab pulsar spins with period $P = ${EX.P * 1e3}$ ms, and the period grows at $\dot P = ${tex(EX.Pd)}$ seconds per second. Treat it as a neutron star of moment of inertia $10^{38}\ \text{kg·m}^2$ and radius 10 km whose magnetic dipole is at right angles to its spin axis, losing its rotational energy as magnetic dipole radiation in a vacuum. Estimate its magnetic dipole moment and the field at its equator.`,
    visual: pulsarPic('A neutron star (blue) spinning about the vertical axis, its magnetic moment m tilted from it. The dashed gold lines mark the light cylinder, where corotation would reach c; the star is drawn far too large.', 70),
    steps: [
      { label: 'Spin-down power', text: t`The rotational energy is $\tfrac12I\omega^2$ with $\omega = 2\pi/P$. It falls at $\dot E = I\omega|\dot\omega| = \dfrac{4\pi^2I\dot P}{P^3} \approx ${tex(EX.Edot, 2)}$ W — some $10^5$ times the Sun’s luminosity.` },
      { label: 'A rotating dipole', text: t`A dipole $\vec m$ turning in the equatorial plane is two perpendicular dipoles oscillating a quarter cycle apart: $m\cos\omega t\,\hat x + m\sin\omega t\,\hat y$. Their powers add, so $\langle P\rangle = 2\times\dfrac{\mu_0m^2\omega^4}{12\pi c^3} = \dfrac{\mu_0m^2\omega^4}{6\pi c^3}$.` },
      { label: 'Solve for m', text: t`$m = \sqrt{\dfrac{6\pi c^3\dot E}{\mu_0\omega^4}} \approx ${tex(EX.m, 2)}\ \text{A·m}^2$, with $\omega = ${nice(sf(EX.w, 3))}$ rad/s.` },
      { label: 'Surface field', text: t`At the equator of a dipole, $B = \dfrac{\mu_0m}{4\pi R^3} \approx ${tex(EX.B, 2)}$ T — about $10^{12}$ gauss, millions of times the strongest steady field made on Earth (45 T).` },
      { label: 'Is it a point dipole?', text: t`The wavelength is $2\pi c/\omega \approx ${nice(sf((2 * PI * EX.rlc) / 1e3, 2))}$ km, a thousand times the star’s radius, so $d \ll \lambda$ holds.` },
      { label: 'Honesty check', text: t`This is the **vacuum-dipole model**. A real pulsar is wrapped in plasma whose currents also carry energy away; plasma models give a few times more power for the same field, and the measured braking index of the Crab, about 2.5 instead of the model’s 3, shows it is not the whole story. It still gives the right order of magnitude, and catalogues quote fields worked out this way.` },
    ],
    answer: t`$\dot E \approx ${tex(EX.Edot, 2)}$ W, $m \approx ${tex(EX.m, 2)}\ \text{A·m}^2$ and $B_{\text{eq}} \approx ${tex(EX.B, 2)}$ T (vacuum-dipole model).`,
  },
  practice: [
    mcq({
      id: 'same-pattern', difficulty: 1,
      prompt: t`A small loop antenna (a magnetic dipole) and a short straight antenna (an electric dipole) both lie along the same vertical axis. How do their radiation patterns compare?`,
      visual: patternPic(t`A radiation pattern about a vertical axis — for which source?`, {}),
      choices: [t`Both are $\sin^2\theta$ about the axis: no radiation along it, most at the equator`, t`The loop radiates most along its axis, the straight antenna at its equator`, t`The loop radiates equally in all directions`, t`The loop’s pattern is $\cos^2\theta$, the antenna’s $\sin^2\theta$`],
      answer: 0,
      why: {
        1: t`A loop’s **static** field is strongest along its axis, but its radiation is not: it is the same doughnut as the electric dipole’s.`,
        2: 'No small source radiates isotropically; both have a null along the axis.',
        3: t`Both are dipoles about the same axis, and the dual fields give the same $\sin^2\theta$.`,
      },
      hints: [t`Swap $\vec E$ and $c\vec B$ in the electric dipole’s far fields: what happens to $\vec S$?`, t`The magnetic dipole’s far field is $\propto m_0\omega^2\sin\theta/r$, just as the electric one is $\propto p_0\omega^2\sin\theta/r$.`],
      teach: 'Electric and magnetic dipoles share the sin²θ pattern; only the fields’ directions and the overall strength differ.',
      explain: t`$\vec S \propto \vec E\times\vec B$ is unchanged when $\vec E \to c\vec B$ and $c\vec B \to -\vec E$, so the pattern is the same: $\sin^2\theta$, zero along the axis.`,
    }),
    num({
      id: 'loop-power', difficulty: 2,
      gen(r) {
        const b = r.pick([5, 10, 15]), I = r.pick([0.5, 1, 2]), f = r.pick([30, 50, 100]);
        const m0 = PI * (b * 1e-2) ** 2 * I, w = 2 * PI * f * 1e6, P = magP(m0, w);
        return {
          prompt: t`A circular loop of radius ${b} cm carries a current of amplitude ${I} A at ${f} MHz. How much power does it radiate, in mW?`,
          visual: dipolePic({ kind: 'magnetic', phase: 30, view: 1, panels: ['lines'] }, t`A small current loop’s magnetic field lines at one instant (the loop, much smaller than λ, is at the centre). Lengths in wavelengths.`),
          answer: P * 1e3, units: 'mW', tol: { rel: 0.01 },
          errors: [
            { value: magP(b * 1e-2 * b * 1e-2 * I, w) * 1e3, feedback: t`The moment is current times **area**: $m_0 = \pi b^2I_0$.` },
            { value: magP(m0, 2 * PI * f * 1e6 / (2 * PI)) * 1e3, feedback: t`Use the angular frequency, $\omega = 2\pi f$.` },
          ],
          hints: [t`$m_0 = \pi b^2I_0$ and $\omega = 2\pi f$.`, t`$\langle P\rangle = \dfrac{\mu_0m_0^2\omega^4}{12\pi c^3}$.`],
          teach: 'A loop radiates as a magnetic dipole m₀ = πb²I₀, with power μ₀m₀²ω⁴/12πc³.',
          explain: t`$m_0 = ${tex(m0, 3)}\ \text{A·m}^2$, $\omega = ${tex(w, 3)}$ rad/s, so $\langle P\rangle \approx ${tex(P * 1e3, 3)}$ mW. ${P * 1e3 < 1 ? 'Tiny, for an ampere of current: small loops are very poor radiators.' : 'Modest for this much current: small loops radiate poorly.'}`,
        };
      },
    }),
    num({
      id: 'ratio', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 2, 5, 10]), f = r.pick([10, 100, 300]);
        const x = (2 * PI * f * 1e6 * b * 1e-2) / C;
        return {
          prompt: t`A loop of radius $b = ${b}$ cm and an electric dipole of length $d = \pi b$, both carrying the same current amplitude at ${f} MHz. Using $\langle P_{\text{mag}}\rangle/\langle P_{\text{elec}}\rangle = (\omega b/c)^2$, how much weaker is the loop? Give the ratio.`,
          visual: ((k) => ({ ...patternPic(t`Both sources share the $\sin^2\theta$ pattern; only the overall strength differs. The magnetic one is drawn far larger than its true size.`, { second: { fn: `${k}*sin(t)^2`, color: 'teal', dash: [6, 4] }, labels: [{ x: 0.75, y: 0.5, r: 0, label: 'electric', color: 'gold' }, { x: 0.5, y: -0.55, r: 0, label: 'magnetic', color: 'teal', labelDx: 6, labelDy: 0 }], more: [{ from: [0.5, -0.55], to: [+(0.62 * k).toFixed(3), +(-0.3 * k).toFixed(3)], color: 'teal', width: 1.4 }] }) }))(+Math.max(0.15, Math.min(0.6, x * 3)).toFixed(3)),
          answer: x * x, tol: { rel: 0.01 },
          errors: [{ value: x, feedback: t`The ratio is $(\omega b/c)^2$: square it.` }, { value: ((f * 1e6 * b * 1e-2) / C) ** 2, feedback: t`Use $\omega = 2\pi f$, not $f$.` }],
          hints: [t`$\omega b/c = 2\pi f b/c$.`, t`Square it.`],
          teach: 'A magnetic dipole of size b radiates (ωb/c)² as much as an electric dipole of comparable size.',
          explain: t`$\omega b/c = ${nice(sf(x, 3))}$, so the ratio is $${x * x < 1e-3 ? tex(x * x, 3) : nice(sf(x * x, 3))}$. Since $\omega b/c = 2\pi b/\lambda$, the loop is suppressed as long as it is small compared with the wavelength.`,
        };
      },
    }),
    num({
      id: 'loop-R', difficulty: 3,
      gen(r) {
        const b = r.pick([3, 5, 8]), f = r.pick([50, 100, 150]);
        const w = 2 * PI * f * 1e6, R = (MU0 * PI * (b * 1e-2) ** 4 * w ** 4) / (6 * C ** 3);
        return {
          prompt: t`What is the radiation resistance of a loop of radius ${b} cm at ${f} MHz? Define it by $\langle P\rangle = \tfrac12I_0^2R$. Give it in milliohms.`,
          visual: dipolePic({ kind: 'magnetic', phase: 120, view: 0.6, panels: ['lines'] }, t`The near zone of a small loop: field lines like a bar magnet’s, most of their energy returning each cycle. Lengths in wavelengths.`),
          answer: R * 1e3, units: 'mohm', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * PI * (b * 1e-2) ** 4 * w ** 4) / (12 * C ** 3)) * 1e3, feedback: t`$\langle P\rangle = \tfrac12I_0^2R$, so $R = 2\langle P\rangle/I_0^2$: do not forget the 2.` }],
          hints: [t`$\langle P\rangle = \dfrac{\mu_0(\pi b^2I_0)^2\omega^4}{12\pi c^3}$; set it equal to $\tfrac12I_0^2R$.`, t`$R = \dfrac{\mu_0\pi b^4\omega^4}{6c^3}$.`],
          teach: 'A loop’s radiation resistance grows as (b/λ)⁴ — even faster than a short antenna’s (d/λ)².',
          explain: t`$R = \dfrac{\mu_0\pi b^4\omega^4}{6c^3} \approx ${nice(sf(R * 1e3, 3))}\ \text{m}\Omega$. A copper loop’s ordinary resistance is far larger, so most of the power goes into heat — small receiving loops are fine, small transmitting loops need care.`,
        };
      },
    }),
    mcq({
      id: 'why-weak', difficulty: 2,
      prompt: t`Why is magnetic dipole radiation from a small source usually swamped by electric dipole radiation?`,
      visual: dipolePic({ kind: 'magnetic', phase: 60, view: 1.5, panels: ['lines'] }, t`Magnetic field lines of an oscillating loop, far smaller than the wavelength. Lengths in wavelengths.`),
      choices: [
        t`For charges moving at speed $v$ in a source of size $b$, $m \sim p\,v$, so the magnetic power is smaller by $(v/c)^2 \sim (\omega b/c)^2 \ll 1$`,
        'Magnetic fields carry no energy in a wave',
        t`Magnetic dipole radiation falls as $1/r^3$ instead of $1/r$`,
        'Magnetic dipoles do not radiate in a vacuum',
      ],
      answer: 0,
      why: {
        1: t`In any light wave, half the energy is in the magnetic field.`,
        2: t`Its far field falls as $1/r$, like any radiation; only the near field falls as $1/r^3$.`,
        3: 'They do — pulsars are the classic example.',
      },
      hints: [t`Compare $m/c$ with $p$ for charges $q$ moving at speed $v$ in a region of size $b$.`, t`$m \sim qvb$, $p \sim qb$: $m/(pc) \sim v/c$.`],
      teach: 'Magnetic dipole radiation is down by (v/c)² ~ (ωb/c)² from electric dipole radiation of the same charges.',
      explain: t`$\langle P_{\text{mag}}\rangle/\langle P_{\text{elec}}\rangle = (m_0/p_0c)^2$, and moving charges give $m_0/p_0 \sim v \sim \omega b$. In atoms that is $(\alpha)^2 \sim 10^{-5}$, which is why magnetic dipole transitions are slow and “forbidden” lines appear only in thin gas.`,
    }),
    mcq({
      id: 'polarization', difficulty: 3,
      prompt: t`A vertical straight antenna and a horizontal loop antenna (its axis vertical) both transmit. A distant receiver on the horizon measures which way each signal’s electric field points. What does it find?`,
      visual: dipolePic({ kind: 'magnetic', phase: 0, view: 1, panels: ['lines'] }, t`The loop’s magnetic field lines in a vertical plane through its axis; its electric field circles the axis, through the page. Lengths in wavelengths.`),
      choices: [
        'The straight antenna’s E is vertical; the loop’s E is horizontal',
        'Both E fields are vertical',
        'Both E fields are horizontal',
        'The straight antenna’s E is horizontal; the loop’s E is vertical',
      ],
      answer: 0,
      why: {
        1: t`For the loop, the vertical field at the horizon is $\vec B$; $\vec E$ is the dual, along $\hat\phi$ — horizontal.`,
        2: t`The straight antenna’s $\vec E$ is along $\hat\theta$, which at the horizon points vertically.`,
        3: 'That is exactly backwards: the electric dipole’s E lies in the planes through its axis.',
      },
      hints: [t`Electric dipole: $\vec E \propto \hat\theta$. Magnetic dipole: $\vec E \propto \hat\phi$.`, t`At the equator, $\hat\theta$ points straight down and $\hat\phi$ horizontally.`],
      teach: 'A vertical electric dipole sends vertically polarized waves; a horizontal loop (vertical m) sends horizontally polarized ones.',
      explain: t`The fields are duals: what $\vec E$ does for one, $c\vec B$ does for the other. So the loop’s $\vec E$ circles the axis — horizontal on the horizon — and its $\vec B$ is vertical. Broadcasters use exactly this to choose a signal’s polarization.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-field', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick(['vela', 'b1509']), p = PULSARS[k], s = spin(p.P, p.Pd);
        return {
          prompt: t`${p.name[0].toUpperCase() + p.name.slice(1)} has period $P = ${p.P * 1e3}$ ms and $\dot P = ${tex(p.Pd)}$. In the vacuum-dipole model (moment of inertia $10^{38}\ \text{kg·m}^2$, radius 10 km, dipole at right angles to the spin, $\langle P\rangle = \mu_0m^2\omega^4/6\pi c^3$), what is the field at its magnetic equator? Give it in units of $10^8$ T.`,
          visual: pulsarPic('A pulsar seen side-on: spin axis vertical, magnetic moment tilted (here drawn at 70°; the model takes 90°). Not to scale.', 70),
          answer: s.B / 1e8, units: '', tol: { rel: 0.02 },
          errors: [{ value: (2 * s.B) / 1e8, feedback: t`At the magnetic **equator** a dipole’s field is $\mu_0m/4\pi R^3$; $\mu_0m/2\pi R^3$ is the value at the pole.` }, { value: (s.B * Math.SQRT2) / 1e8, feedback: t`A rotating dipole radiates twice an oscillating one’s power: $\mu_0m^2\omega^4/6\pi c^3$.` }],
          hints: [t`$\dot E = 4\pi^2I\dot P/P^3$, then $m = \sqrt{6\pi c^3\dot E/\mu_0\omega^4}$.`, t`$B_{\text{eq}} = \mu_0m/4\pi R^3$.`],
          teach: 'Spin-down power read as rotating magnetic dipole radiation gives a pulsar’s field: B ∝ √(PṖ).',
          explain: t`$\dot E \approx ${tex(s.Edot, 2)}$ W, $m \approx ${tex(s.m, 2)}\ \text{A·m}^2$, $B_{\text{eq}} \approx ${tex(s.B, 2)}$ T. Catalogues quote the same estimate, $B \propto \sqrt{P\dot P}$ — a model value, not a measurement of the field.`,
        };
      },
    }),
    num({
      id: 'cp-age', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick(['crab', 'vela', 'b1509']), p = PULSARS[k], s = spin(p.P, p.Pd);
        return {
          prompt: t`For pure magnetic dipole braking, $\dot E \propto \omega^4$ makes $\dot\omega \propto -\omega^3$. If a pulsar was born spinning much faster than now, its age is then $\tau = P/2\dot P$. Estimate it for ${p.name} ($P = ${p.P * 1e3}$ ms, $\dot P = ${tex(p.Pd)}$), in years.`,
          visual: { type: 'graph', params: { x: [0, 2.2], y: [0, 1.6], aspect: 'wide', axesAt: 'edge', xlabel: 'time ÷ τ', ylabel: 'period ÷ period now', yticks: 3, curves: [{ fn: 'sqrt(x)', domain: [0, 2.2], color: 'accent', width: 2.4 }], points: [{ x: 1, y: 1, r: 5, color: 'gold', label: 'now', labelDx: 8, labelDy: 12 }] }, caption: t`The period of a pulsar braked as $\dot\omega \propto -\omega^3$ and born spinning very fast: it grows as $\sqrt t$. The tangent at “now” reaches back to half the age — hence the 2 in $P/2\dot P$.` },
          answer: s.age, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: 2 * s.age, feedback: t`For braking index 3, $\tau = P/2\dot P$ — half of $P/\dot P$.` }],
          hints: [t`Convert: $\tau = P/2\dot P$ in seconds, then divide by $3.156\times10^{7}$ s per year.`, t`$\tau = ${p.P}/(2 \times ${tex(p.Pd)})$ s.`],
          teach: 'With dipole braking the characteristic age is P/2Ṗ — an estimate that assumes the model and a fast birth.',
          explain: t`$\tau \approx ${nice(sf(s.age, 3))}$ yr. ${k === 'crab' ? t`Chinese astronomers recorded the Crab’s supernova in 1054, about 970 years ago: the estimate is close but too large, because the braking index is about 2.5, not 3, and the pulsar was born spinning at about 19 ms rather than infinitely fast.` : 'Characteristic ages are usually right to within a factor of a few; where a supernova date or a remnant’s expansion gives a true age, the two often differ, which is how astronomers learn the model is not exact.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-index', difficulty: 3,
      prompt: t`Pure magnetic dipole radiation predicts a braking index $n = \omega\ddot\omega/\dot\omega^2 = 3$. The Crab pulsar’s measured index is about 2.5. What is the most reasonable conclusion?`,
      visual: pulsarPic('The vacuum-dipole picture: a magnetized sphere spinning in empty space. Real pulsars are surrounded by plasma out to the light cylinder (dashed). Not to scale.', 60),
      choices: [
        'The vacuum-dipole model captures the size of the spin-down but not all of its physics: plasma currents, winds and a changing field also matter',
        'Magnetic dipole radiation theory is wrong',
        'The Crab pulsar is not a neutron star',
        'The measurement must be in error, because the theory gives exactly 3',
      ],
      answer: 0,
      why: {
        1: 'Maxwell’s equations are not in question; the model applies them to an idealized star in empty space.',
        2: 'Its mass, size, period and spin-down all fit a neutron star.',
        3: 'The index has been measured repeatedly over decades of timing; a model’s prediction does not overrule data.',
      },
      hints: ['What does the vacuum-dipole model leave out?', 'A real pulsar sits inside a magnetosphere full of charged particles.'],
      teach: 'A model that gives the right order of magnitude can still miss details; the braking index measures what it leaves out.',
      explain: t`The vacuum dipole gets the power within a factor of a few, which is why it is used for field estimates. An index below 3 says something else also brakes the star — a wind of particles, currents in the magnetosphere, or a slowly changing field. Saying which is an open research question.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §11.1.3', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'ATNF Pulsar Catalogue (Manchester et al. 2005): periods, period derivatives and dipole field estimates', url: 'https://www.atnf.csiro.au/research/pulsar/psrcat/' },
    { label: 'Lyne et al. 2015, 45 years of rotation of the Crab pulsar (braking index ≈ 2.5)', url: 'https://doi.org/10.1093/mnras/stv236' },
  ],
});
