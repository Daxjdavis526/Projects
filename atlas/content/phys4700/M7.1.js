// Charged particles in fields and the Aharonov–Bohm effect (Griffiths &
// Schroeter §4.5). Minimal coupling Ĥ = (p̂ − qA)²/2m + qφ: the canonical
// momentum p̂ = −iħ∇ is no longer mv. Gauge freedom A → A + ∇λ,
// φ → φ − ∂λ/∂t is matched by Ψ → e^{iqλ/ħ}Ψ, so in a field-free region the
// wave function carries the phase (q/ħ)∫A·dl, and two paths round a flux
// differ by qΦ/ħ — one fringe per h/e = 4.136 fWb (CODATA 2022, exact).
// Landau levels, briefly: ħω_c(n + ½) with eB/h states per area per level.
// Experiments: Chambers' iron whisker (1960), Tonomura's niobium-shielded
// toroid (1986: phases of exactly 0 or π, because the superconductor traps
// flux in units of h/2e), Webb's metal rings (1985). Transfers: X-ray
// pulsars' cyclotron lines and the quantum Hall plateau at ν = 2.
// phys3600.M6.4 (the vector potential) set up the solenoid's A outside and
// asked for the field that shifts the fringes; that example is not repeated.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, HBAR, QE, ME, r6, seg, label } from './_qm.js';

const t = String.raw;
const PHI0 = H / QE;                       // Wb, h/e (exact in the 2019 SI)
const KEV_B = (ME * 1e3 * QE) / (HBAR * QE);   // T per keV of electron cyclotron energy: B = mₑE/(ħe)
const HWC = (HBAR * QE) / ME / QE;         // eV per tesla: ħe/mₑ, the free electron's cyclotron energy per tesla
const BS_FE = 2.15;                        // T, iron's saturation field μ₀Mₛ at room temperature (typical handbook value)

/**
 * The two-path interferometer round a solenoid, seen end-on, with the screen's
 * fringes drawn sideways at the right. f: flux in units of h/e (a number, or
 * the slider key 'f'); ghost: the zero-flux pattern dashed.
 */
function abPic({ f = 0, slider = false, ghost = true, arrowsA = true, caption, readouts = false } = {}) {
  const F = slider ? 'f' : r6(f);
  const pat = (ph) => [`2.75 + 1.45*exp(-t^2/0.9)*cos(5*t - pi*(${ph}))^2`, 't'];
  const curves = [
    { param: ['-2.8 + 5.4*t', '1.05*sin(pi*t)'], t: [0, 1], color: 'accent', width: 2 },
    { param: ['-2.8 + 5.4*t', '-1.05*sin(pi*t)'], t: [0, 1], color: 'accent', width: 2 },
    { param: ['0.3*cos(t)', '0.3*sin(t)'], t: [0, 6.2832], color: 'teal', width: 1.6 },
    seg(2.6, -1.55, 2.6, 1.55, 'ink2', 3),
    { param: ['2.75 + 1.45*exp(-t^2/0.9)', 't'], t: [-1.55, 1.55], color: 'ink4', width: 1, dash: [3, 4] },
    ...(ghost ? [{ param: pat(0), t: [-1.55, 1.55], color: 'ink3', width: 1.2, dash: [5, 4] }] : []),
    { param: pat(F), t: [-1.55, 1.55], color: 'gold', width: 2.4, samples: 1500 },
  ];
  const arrows = [];
  if (arrowsA) {
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + Math.PI / 8, R = 0.78, x = R * Math.cos(a), y = R * Math.sin(a);
      arrows.push({ from: [r6(x), r6(y)], to: [`${r6(x)} - 0.45*(${F})*${r6(Math.sin(a))}`, `${r6(y)} + 0.45*(${F})*${r6(Math.cos(a))}`], color: 'violet', width: 1.8 });
    }
  }
  return {
    type: 'graph',
    params: {
      x: [-3.3, 4.5], y: [-1.7, 1.7], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      ...(slider ? { sliders: [{ key: 'f', label: t`Enclosed flux $\Phi$`, min: 0, max: 2, step: 0.05, value: 0.25, unit: '\\,h/e', explain: t`The magnetic flux inside the solenoid, counted in units of $h/e = ${tex(PHI0, 4)}$ Wb. The field never reaches the electrons’ paths.` }] } : {}),
      shade: [{ fn: 'sqrt(max(0.09 - x^2, 0))', lower: '-sqrt(max(0.09 - x^2, 0))', from: -0.3, to: 0.3, color: 'teal', alpha: 0.45 }],
      curves, arrows,
      points: [
        { x: -2.8, y: 0, r: 5, color: 'accent', label: 'source', labelDx: -6, labelDy: 18 },
        label(0, -0.3, 'B inside only', 'teal', 0, 11, 'center'),
        ...(arrowsA ? [label(0.55, 0.55, 'A', 'violet', 8, -8)] : []),
        label(2.6, 1.55, 'screen', 'ink2', -4, -8, 'right'),
        label(3.2, -1.55, 'brightness →', 'ink3', 0, 10, 'center'),
      ],
      ...(readouts ? { readouts: [{ label: 'phase difference eΦ/ħ (rad)', expr: '2*pi*f', digits: 3 }, { label: 'fringe shift (fringes)', expr: 'f', digits: 3 }] } : {}),
    },
    caption: caption || t`Two electron paths (blue) pass either side of a long solenoid seen end-on (teal); its field is confined inside, but its vector potential (violet) circles it outside. Right: brightness across the screen (gold), the zero-flux pattern dashed, the single-slit envelope dotted. Not to scale; idealized point source and paths.`,
  };
}

/** Landau levels (n + ½)ħω_c against B for an effective mass m* (in mₑ): a fan of straight lines. */
function fanPic({ mstar = 1, Bmax = 10, Bmark = null, top = 4, caption, unit = 'meV', numbers = true }) {
  const k = (HWC / mstar) * (unit === 'meV' ? 1e3 : 1);
  const curves = [];
  for (let n = 0; n <= top; n++) curves.push({ fn: `${r6(k * (n + 0.5))}*x`, color: n === 0 ? 'gold' : 'accent', width: 2, label: `n = ${n}`, labelAt: r6(Bmax * Math.min(0.88, (0.74 * (top + 0.5)) / (n + 0.5))), labelDx: 10, labelDy: 10 });
  const ymax = k * (top + 0.5) * Bmax * 0.8;
  return {
    type: 'graph',
    params: {
      x: [0, Bmax], y: [0, r6(ymax)], aspect: 'wide', xlabel: 'B (T)', ylabel: `energy (${unit})`, axesAt: 'edge', xticks: 5, yticks: numbers ? 4 : 0,
      curves, ...(Bmark !== null ? { vlines: [{ x: Bmark, color: 'ink3' }] } : {}),
    },
    caption,
  };
}

/** Tonomura's toroid from above: a magnetized ring sealed in niobium, one part of the electron wave through the hole and one outside. */
function toroidPic(caption) {
  const arrows = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3 + 0.3, R = 0.75;
    arrows.push({ from: [r6(R * Math.cos(a)), r6(R * Math.sin(a))], to: [r6(R * Math.cos(a + 0.45)), r6(R * Math.sin(a + 0.45))], color: 'gold', width: 2 });
  }
  return {
    type: 'graph',
    params: {
      x: [-2.6, 2.6], y: [-1.25, 1.25], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [
        { fn: 'sqrt(max(1 - x^2, 0))', lower: 'sqrt(max(0.3025 - x^2, 0))', from: -1, to: 1, color: 'teal', alpha: 0.35 },
        { fn: '-sqrt(max(0.3025 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'teal', alpha: 0.35 },
        { fn: 'sqrt(max(0.16 - x^2, 0))', lower: '-sqrt(max(0.16 - x^2, 0))', from: -0.4, to: 0.4, color: 'accent', alpha: 0.4 },
      ],
      curves: [
        { param: ['1.08*cos(t)', '1.08*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2, dash: [5, 3] },
        { param: ['0.47*cos(t)', '0.47*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2, dash: [5, 3] },
      ],
      arrows,
      points: [
        label(0, 0, 'wave 1', 'accent', 0, 0, 'center'),
        { x: 1.75, y: 0.2, r: 5, label: 'wave 2', color: 'accent', labelDx: 0, labelDy: -14, labelAlign: 'center' },
        label(-1.6, 0.95, 'niobium shell', 'ink2', 0, 0, 'center'),
        label(1.55, -0.95, 'B in the ring', 'gold', 0, 0, 'center'),
      ],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M7.1',
  title: 'Charged particles in fields and the Aharonov–Bohm effect',
  minutes: 18, difficulty: 3,
  intro: t`A charge $q$ in electromagnetic fields enters the Schrödinger equation through the **potentials**, not the fields. The rule, called minimal coupling, replaces the momentum $\hat{\vec p}$ by $\hat{\vec p} - q\vec A$:

$$\hat H = \frac{1}{2m}\big(\hat{\vec p} - q\vec A\big)^2 + q\varphi$$

Classically $\vec A$ is bookkeeping: only $\vec B = \nabla\times\vec A$ and $\vec E$ push on a charge. Quantum mechanically, $\vec A$ shifts the **phase** of the wave function. Two electron waves passing either side of a solenoid — through regions where $\vec B = 0$ — arrive with phases that differ by $q\Phi/\hbar$, where $\Phi$ is the flux they enclose. Their interference fringes move. That is the Aharonov–Bohm effect, predicted in 1959 and seen with the field sealed inside a superconductor in 1986 — the quantum sequel to [the vector potential](#/lesson/phys3600.M6.4) of a solenoid, which circles it even where $\vec B = 0$.`,
  symbols: [
    { tex: '\\hat H', text: 'the Hamiltonian: the energy operator that generates time evolution' },
    { tex: '\\hat{\\vec p}', text: t`the canonical momentum operator, $-i\hbar\nabla$; in a magnetic field it is **not** $m\vec v$` },
    { tex: 'q,\\ m', text: t`the particle’s charge (C) and mass (kg); for an electron $q = -e$` },
    { tex: '\\vec A', text: t`the magnetic vector potential, in T m (= Wb/m), with $\vec B = \nabla\times\vec A$` },
    { tex: '\\varphi', text: t`the electric scalar potential, in V, with $\vec E = -\nabla\varphi - \partial\vec A/\partial t$` },
    { tex: '\\hat{\\vec p} - q\\vec A', text: t`the kinetic momentum, $m\hat{\vec v}$ — what a velocity measurement reads` },
    { tex: '\\Phi', text: t`the magnetic flux enclosed between two paths, $\oint\vec A\cdot d\vec l$, in webers (Wb = T m²)` },
  ],
  why: 'Gauge invariance — the freedom to change the potentials without changing the physics, matched by a change of phase — is the organizing principle of every force in the Standard Model, and of general relativity’s coordinate freedom.',
  visual: {
    ...abPic({ slider: true, readouts: true }),
    title: 'Fringes moved by a field the electrons never touch',
    lead: t`Electron waves from one source pass either side of a solenoid and meet at a screen. Turn up the flux: the field stays inside the teal disc, yet the fringes (gold) slide across the screen. Each $h/e = ${tex(PHI0, 4)}$ Wb of enclosed flux moves them by one whole fringe.`,
    tasks: [
      'Set Φ = 0.5 h/e: bright and dark fringes swap places — a phase difference of π.',
      'Set Φ = 1 h/e: the pattern is back where it started. Only the flux modulo h/e can be seen.',
      'Watch the dotted envelope: it never moves. No force acts on the electrons; only the relative phase of the two paths changes.',
    ],
  },
  example: {
    prompt: t`Show from gauge invariance that a wave going round a flux $\Phi$ through field-free space picks up a relative phase $q\Phi/\hbar$. Then explain why Tonomura’s 1986 experiment, with a toroidal magnet sealed inside superconducting niobium, could only ever show a phase shift of 0 or $\pi$.`,
    visual: toroidPic(t`Tonomura’s geometry from above: a tiny magnetized ring (gold field lines) sealed in niobium, which below 9.2 K is a superconductor and lets no field out. Part of each electron wave passes through the hole, part outside; electron holography compares their phases. Not to scale: the ring was a few micrometres across.`),
    steps: [
      { label: 'Gauge freedom', text: t`The potentials $\vec A' = \vec A + \nabla\lambda$, $\varphi' = \varphi - \partial\lambda/\partial t$ give the same $\vec E$ and $\vec B$ for any function $\lambda(\vec r, t)$. Substituting shows that $\Psi' = e^{iq\lambda/\hbar}\Psi$ then solves the new Schrödinger equation: the gradient of the phase factor cancels the $q\nabla\lambda$ in $\hat{\vec p} - q\vec A'$. A change of potentials is a change of phase.` },
      { label: 'Field-free region', text: t`Along a path where $\vec B = 0$, $\vec A$ is a gradient, $\vec A = \nabla\lambda$ with $\lambda(\vec r) = \int_O^{\vec r}\vec A\cdot d\vec l$. So $\Psi = e^{ig}\Psi_0$ with $g = \dfrac{q}{\hbar}\displaystyle\int_O^{\vec r}\vec A\cdot d\vec l$, where $\Psi_0$ is the wave function with no potential at all.` },
      { label: 'Two paths', text: t`Each half of the beam carries its own $g$, integrated along its own path. Where they meet, the phases differ by $$\begin{gathered} \frac{q}{\hbar}\Big(\int_{\text{1}}\vec A\cdot d\vec l - \int_{\text{2}}\vec A\cdot d\vec l\Big) \\ = \frac{q}{\hbar}\oint\vec A\cdot d\vec l = \frac{q\Phi}{\hbar} \end{gathered}$$ by Stokes’s theorem. No single path can be gauged to zero when the loop encloses flux. For an electron the size is $e\Phi/\hbar = 2\pi\,\Phi/(h/e)$: one whole fringe for every $h/e = ${tex(PHI0, 4)}$ Wb.` },
      { label: 'Why it is not a force', text: t`The phase difference depends only on $\Phi$, not on the gauge: it is a physical, measurable quantity. But neither path feels any field, so the single-path envelope does not move; only the fringes inside it do.` },
      { label: 'The niobium shell', text: t`Below 9.2 K, niobium’s current-carrying electrons pair up. The pair wave function has charge $2e$ and must be single-valued round the ring, so $2e\Phi/\hbar = 2\pi n$: the shell traps flux only in units of $h/2e = ${tex(PHI0 / 2, 4)}$ Wb.` },
      { label: 'Zero or pi', text: t`The free electrons have charge $e$, so their phase difference is $e\Phi/\hbar = n\pi$: $0$ for an even number of flux quanta, $\pi$ for an odd one. Tonomura’s team saw exactly these two values (Phys. Rev. Lett. 56, 792, 1986) — a phase shift with the field completely shielded from the electrons, and flux quantization seen in the same picture.` },
    ],
    answer: t`The relative phase is $q\Phi/\hbar$, fixed by the enclosed flux alone; with flux trapped in units of $h/2e$, electrons (charge $e$) can only show $e\Phi/\hbar = n\pi$: a shift of 0 or $\pi$.`,
  },
  practice: [
    mcq({
      id: 'kinetic', difficulty: 2,
      prompt: t`In a magnetic field, the canonical momentum operator is still $\hat{\vec p} = -i\hbar\nabla$. Which operator is $m\hat{\vec v}$, the momentum that a measurement of velocity reads?`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.4, 3.4], y: [-1.25, 1.25], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ param: ['1 + 0.9*cos(t)', '0.9*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: [4, 4] }],
          arrows: [
            { from: [1.9, 0], to: [1.9, -0.85], color: 'gold', width: 2.6, label: 'mv', labelDx: 8, labelDy: 4 },
            { from: [1.9, 0], to: [1.9, 0.95], color: 'violet', width: 2.4, label: 'qA (symmetric gauge)', labelDx: 8, labelDy: 0 },
          ],
          points: [{ x: 1.9, y: 0, r: 5, color: 'accent' }, { x: 0, y: 0, r: 4, color: 'ink3', label: 'gauge origin', labelDx: -8, labelDy: 14, labelAlign: 'right' }, label(1, 0, 'B ⊙', 'teal', 0, 0, 'center')],
        },
        caption: t`A positive charge circling clockwise in a uniform field out of the page, with its velocity and the symmetric-gauge $q\vec A = \tfrac{q}{2}\vec B\times\vec r$ at its position, measured from an origin off the orbit’s centre. Here they point opposite ways; how $\hat{\vec p}$ combines them is the question. Lengths illustrative.`,
      },
      choices: [t`$\hat{\vec p} - q\vec A$`, t`$\hat{\vec p}$`, t`$\hat{\vec p} + q\vec A$`, t`$\hat{\vec p} - q\varphi$`],
      answer: 0,
      why: {
        1: t`That was true without a field. With $\vec A \ne 0$, $\hat{\vec p}$ depends on the gauge, and a gauge cannot change a velocity.`,
        2: t`The sign: the Hamiltonian is $(\hat{\vec p} - q\vec A)^2/2m$, and $m\hat{\vec v} = m\,d\hat{\vec r}/dt$ comes out as $\hat{\vec p} - q\vec A$.`,
        3: t`$\varphi$ is a scalar (volts); it cannot be subtracted from a momentum vector. It enters the energy as $q\varphi$.`,
      },
      hints: [t`The Heisenberg equation gives $d\hat{\vec r}/dt = \dfrac{i}{\hbar}[\hat H, \hat{\vec r}]$.`, t`With $\hat H = (\hat{\vec p} - q\vec A)^2/2m + q\varphi$, that commutator gives $(\hat{\vec p} - q\vec A)/m$.`],
      teach: 'In a field the canonical momentum p and the kinetic momentum mv = p − qA are different operators; only the kinetic one is gauge invariant.',
      explain: t`$\dfrac{d\hat{\vec r}}{dt} = \dfrac{i}{\hbar}[\hat H, \hat{\vec r}] = \dfrac{\hat{\vec p} - q\vec A}{m}$. Its expectation value is the same in every gauge; $\langle\hat{\vec p}\rangle$ is not. Classically, too, the canonical momentum of a charge is $m\vec v + q\vec A$.`,
    }),
    num({
      id: 'whisker', difficulty: 2,
      gen(r) {
        const d = r.pick([0.6, 0.8, 1.0, 1.2, 1.5]);          // μm
        const Phi = BS_FE * Math.PI * (d * 1e-6) ** 2 / 4, ans = Phi / PHI0;
        return {
          prompt: t`In 1960 R. G. Chambers threaded a tapering iron whisker between the two beams of an electron biprism. Iron magnetized to saturation carries $B = ${BS_FE}$ T inside, and almost none leaks out of a long thin whisker. Where the whisker is $${d}\ \mu\text{m}$ across, by how many whole fringes does it shift the pattern?`,
          visual: abPic({ f: 0.35, arrowsA: false, caption: 'The whisker, end-on, between the two paths (schematic): fringes shifted against the no-flux pattern, dashed. The real shift is hundreds of fringes; the picture shows a fraction of one.' }),
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: (2 * Phi) / PHI0, feedback: t`One fringe is $h/e$ for electrons. $h/2e$ is the flux quantum of a superconductor, whose carriers are pairs.` },
            { value: (BS_FE * Math.PI * (d * 1e-6) ** 2) / PHI0, feedback: t`$${d}\ \mu\text{m}$ is the diameter: the area is $\pi d^2/4$.` },
          ],
          hints: [t`The flux is $\Phi = B\,\pi d^2/4$.`, t`Divide by $h/e = ${tex(PHI0, 4)}$ Wb: each $h/e$ is one fringe.`],
          teach: 'The fringe shift counts the enclosed flux in units of h/e.',
          explain: t`$\Phi = ${BS_FE}\times\pi(${d}\times10^{-6})^2/4 = ${tex(Phi, 3)}$ Wb, and $\Phi/(h/e) = ${fmt(ans, 3)}$ fringes. Chambers saw the fringes tilt as the whisker tapered — the shift growing with the enclosed flux — while the envelope stayed put. A whisker leaks a little field, which is why Tonomura later sealed the magnet inside a superconductor.`,
        };
      },
    }),
    multi({
      id: 'gauge-inv', difficulty: 3,
      prompt: t`Under a gauge transformation $\vec A \to \vec A + \nabla\lambda$, $\varphi \to \varphi - \partial\lambda/\partial t$, $\Psi \to e^{iq\lambda/\hbar}\Psi$, which of these are unchanged (gauge invariant)?`,
      visual: { type: 'field2d', params: { P: '-y', Q: '0', x: [-2.5, 2.5], y: [-2.5, 2.5], probe: false, readout: false, density: 13 }, caption: t`The Landau-gauge potential $\vec A = B\langle -y, 0, 0\rangle$: arrows all along $x$, nothing like the circling symmetric gauge — yet both give the same uniform $\vec B = B\hat z$. Lengths compressed.` },
      choices: [t`$|\Psi(\vec r, t)|^2$`, t`the phase of $\Psi$ at one point`, t`$\langle\hat{\vec p} - q\vec A\rangle$`, t`$\langle\hat{\vec p}\rangle$`, t`the relative phase $q\oint\vec A\cdot d\vec l/\hbar$ round a closed loop`],
      answer: [0, 2, 4],
      why: {
        1: t`The phase at a point changes by $q\lambda(\vec r, t)/\hbar$, which can be anything you like.`,
        3: t`$\hat{\vec p}e^{iq\lambda/\hbar}\Psi$ gains $q\nabla\lambda$: $\langle\hat{\vec p}\rangle$ shifts by $q\langle\nabla\lambda\rangle$. Only $\hat{\vec p} - q\vec A$ compensates.`,
      },
      hints: [t`A phase factor $e^{iq\lambda/\hbar}$ has modulus 1.`, t`$\oint\nabla\lambda\cdot d\vec l = 0$ round any closed loop (for single-valued $\lambda$).`],
      teach: 'Probabilities, kinetic momentum and loop phases are gauge invariant; the canonical momentum and the local phase are not.',
      explain: t`$|e^{iq\lambda/\hbar}\Psi|^2 = |\Psi|^2$; $(\hat{\vec p} - q\vec A')\Psi' = e^{iq\lambda/\hbar}(\hat{\vec p} - q\vec A)\Psi$; and $\oint(\vec A + \nabla\lambda)\cdot d\vec l = \oint\vec A\cdot d\vec l = \Phi$. Anything you can measure must be in this list — which is why the Aharonov–Bohm phase, a loop integral, is measurable while $\vec A$ at a point is not.`,
    }),
    num({
      id: 'landau-gap', difficulty: 2,
      gen(r) {
        const [mat, ms] = r.pick([['gallium arsenide', 0.067], ['indium antimonide', 0.014], ['silicon (in-plane, along a valley)', 0.19]]);
        const B = r.pick([2, 4, 5, 8, 10]);
        const ans = (HWC * B) / ms * 1e3;
        return {
          prompt: t`In a uniform field $B\hat z$, an electron’s motion in the plane is quantized into **Landau levels**, $E_n = \hbar\omega_c\big(n + \tfrac12\big)$ with $\omega_c = eB/m$. In a semiconductor the electron moves with an effective mass $m^*$. For ${mat}, $m^* = ${ms}\,m_e$. What is the spacing $\hbar\omega_c$ at $B = ${B}$ T, in meV?`,
          visual: fanPic({ mstar: ms, Bmax: 10, Bmark: B, numbers: false, caption: t`The Landau-level fan for $m^* = ${ms}\,m_e$: each level rises in proportion to $B$. The grey line marks ${B} T. Spin splitting not shown.` }),
          answer: ans, units: 'meV', tol: { rel: 0.01 },
          errors: [{ value: HWC * B * 1e3, feedback: t`That uses the free electron’s mass. In the crystal the electron responds as if its mass were $m^* = ${ms}\,m_e$.` }, { value: (HWC * B) / ms * 1e3 / 2, feedback: t`That is the zero-point energy $\tfrac12\hbar\omega_c$, not the spacing.` }],
          hints: [t`$\hbar\omega_c = \hbar eB/m^*$.`, t`For a free electron $\hbar e/m_e = ${fmt(HWC * 1e3, 4)}$ meV per tesla; divide by ${ms}.`],
          teach: t`Landau levels are a quantized cyclotron orbit, spaced by $\hbar\omega_c = \hbar eB/m^*$.`,
          explain: t`$\hbar\omega_c = ${fmt(HWC * 1e3, 4)}\ \text{meV/T}\times${B}\ \text{T}/${ms} = ${fmt(ans, 3)}$ meV. At liquid-helium temperatures $k_BT \approx 0.4$ meV, so the levels are sharply resolved — the setting of the quantum Hall effect.`,
        };
      },
    }),
    num({
      id: 'landau-degen', difficulty: 3,
      gen(r) {
        const B = r.pick([1, 2, 3, 5, 8, 12]);
        const ans = (B / PHI0) * 1e-12;
        return {
          prompt: t`Each Landau level is hugely degenerate: in the symmetric gauge the states are rings, each enclosing one more flux quantum than the last, so a level holds one state (per spin direction) for every $h/e$ of flux through the sample. How many states does one Landau level hold, per spin direction, in a $1\ \mu\text{m}^2$ patch of a sample in $B = ${B}$ T?`,
          visual: fanPic({ mstar: 1, Bmax: 15, Bmark: B, unit: 'meV', caption: t`Free-electron Landau levels against $B$; grey line at ${B} T. Every line is one massively degenerate level.` }),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: ans * 2, feedback: t`That counts one state per $h/2e$, the superconducting flux quantum. For single electrons the flux quantum is $h/e$.` }, { value: ans * 2 * Math.PI, feedback: t`Use $h$, not $\hbar$: the count is $eB/h$ per unit area.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The flux through the patch is $\Phi = B\times(10^{-6}\ \text{m})^2$.`, t`Count flux quanta: $\Phi/(h/e)$, with $h/e = ${tex(PHI0, 4)}$ Wb.`],
          teach: 'A Landau level holds eB/h states per unit area per spin: one per flux quantum h/e.',
          explain: t`$\Phi = ${B}\times10^{-12}$ Wb, and $\Phi/(h/e) = ${fmt(ans, 3)}$ states. The number grows with $B$, so as the field rises each level holds more electrons and fewer levels are needed — the electrons empty out of the top level one by one, which is what makes the quantum Hall plateaus.`,
        };
      },
    }),
    mcq({
      id: 'envelope', difficulty: 2,
      prompt: t`In an Aharonov–Bohm experiment the field is confined inside the solenoid. As the enclosed flux is slowly increased from zero, what happens on the screen?`,
      visual: abPic({ f: 0.5, caption: 'The pattern with some flux enclosed (gold) against the zero-flux pattern (dashed). Schematic.' }),
      choices: [
        'The fringes slide across under an envelope that stays fixed, repeating every h/e',
        'The whole pattern, envelope and all, is deflected sideways by the Lorentz force',
        'Nothing: the electrons never enter the field',
        'The fringes get closer together as the flux rises',
      ],
      answer: 0,
      why: {
        1: t`A Lorentz force needs $\vec B$ where the electron is. Here $\vec B = 0$ on both paths. (If field leaks onto the paths, the envelope *does* shift — which is why the experiments shield it.)`,
        2: t`Classically, yes — that was the expectation before 1959. Quantum mechanically the two paths’ phases differ by $e\Phi/\hbar$.`,
        3: t`The spacing is set by the wavelength and geometry, $\lambda L/d$. The flux adds a constant phase difference, which slides the fringes without changing their spacing.`,
      },
      hints: [t`Which quantity depends on the flux: the force on each path, or the relative phase of the two paths?`],
      teach: 'The Aharonov–Bohm effect is a relative phase, not a force: fringes move, the envelope does not.',
      explain: t`The relative phase $e\Phi/\hbar$ adds the same amount everywhere on the screen, sliding the fringes by $\Phi/(h/e)$ fringe spacings. The single-path envelope, which a force would deflect, stays put.`,
    }),
    num({
      id: 'ring', difficulty: 3, transfer: true,
      gen(r) {
        const d = r.pick([0.4, 0.5, 0.6, 0.8, 1.0]);       // μm, mean diameter
        const ans = PHI0 / (Math.PI * (d * 1e-6) ** 2 / 4) * 1e3;
        return {
          prompt: t`Electrons crossing a small metal ring split, pass round both arms and recombine, so the ring’s electrical resistance depends on their relative phase. In a field $B$ through the ring, by how much must $B$ change to take the resistance through one full oscillation, if the ring’s mean diameter is $${d}\ \mu\text{m}$? Give $\Delta B$ in mT.`,
          visual: {
            type: 'graph',
            params: {
              x: [-2.6, 2.6], y: [-1.3, 1.3], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
              curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'gold', width: 6 }, seg(-2.4, 0, -1, 0, 'gold', 6), seg(1, 0, 2.4, 0, 'gold', 6)],
              points: [label(-2.3, 0, 'in', 'ink2', 0, 14), label(2.3, 0, 'out', 'ink2', -10, 14), label(0, 0, 'B ⊙', 'teal', 0, 0, 'center'), label(0, 1, 'arm 1', 'ink3', 0, -14, 'center'), label(0, -1, 'arm 2', 'ink3', 0, 16, 'center')],
            },
            caption: 'A metal ring between two leads, field out of the page through it (schematic). Real rings are a few hundred nanometres across with wires tens of nanometres wide, cooled below 1 K so the electrons keep their phase all the way round.',
          },
          answer: ans, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`For single electrons the period is $h/e$ of flux. ($h/2e$ oscillations do appear too, from pairs of time-reversed paths — but the basic Aharonov–Bohm period is $h/e$.)` }, { value: ans / 4, feedback: t`The area uses the radius, $\pi(d/2)^2$, not $\pi d^2$.` }],
          hints: [t`One oscillation is one more flux quantum $h/e$ through the ring.`, t`$\Delta B = (h/e)/A$ with $A = \pi d^2/4$.`],
          teach: 'Aharonov–Bohm oscillations repeat every h/e of flux, so their period in B measures the area the electrons encircle.',
          explain: t`$A = \pi(${d}\times10^{-6})^2/4 = ${tex(Math.PI * (d * 1e-6) ** 2 / 4, 3)}\ \text{m}^2$, so $\Delta B = ${tex(PHI0, 4)}/A = ${fmt(ans, 3)}$ mT. Webb and colleagues saw exactly such oscillations in a gold ring under a micrometre across in 1985: the Aharonov–Bohm effect inside an ordinary metal.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pulsar', difficulty: 3, transfer: true,
      gen(r) {
        const [src, E] = r.pick([['Hercules X-1', 37], ['Vela X-1', 25], ['A 0535+26', 45], ['Centaurus X-3', 28]]);
        const B = E * KEV_B, ans = B / 1e8;
        return {
          prompt: t`Accreting neutron stars in X-ray binaries show an absorption feature — a **cyclotron line** — where photons are absorbed by electrons jumping from one Landau level to the next, $\Delta E = \hbar eB/m_e$. ${src} shows its line near $${E}$ keV. Ignoring relativistic and gravitational corrections, what field does that imply at the neutron star? Give $B$ in units of $10^{8}$ T.`,
          visual: { type: 'graph', params: { x: [5, 80], y: [0, 1.15], aspect: 'wide', xlabel: 'photon energy (keV)', ylabel: 'flux (scaled)', axesAt: 'edge', xticks: 6, yticks: 0, curves: [{ fn: `exp(-x/40)*1.3*(1 - 0.55*exp(-(x - ${E})^2/(2*4^2)))*min(1, x/12)`, color: 'accent', width: 2.4 }] }, caption: 'A schematic X-ray spectrum with the cyclotron absorption dip. Shape illustrative; the dip’s energy is the measurement.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: ans / (2 * Math.PI), feedback: t`$\Delta E = \hbar\omega_c$, with $\hbar$, not $h$: $B = m_e\,\Delta E/(\hbar e)$.` },
            { value: ans * 1e-3, feedback: t`Convert keV to joules: $1\ \text{keV} = 1.602\times10^{-16}$ J.` },
          ],
          hints: [t`$B = \dfrac{m_e\,\Delta E}{\hbar e}$.`, t`A free electron’s $\hbar\omega_c$ is $${fmt(HWC * 1e3, 4)}$ meV per tesla, so 1 keV corresponds to $${tex(KEV_B, 4)}$ T.`],
          teach: 'Landau levels are spaced by ħeB/m, so a cyclotron line’s energy is a direct magnetometer — even on a neutron star.',
          explain: t`$B = ${E}\ \text{keV}\times${tex(KEV_B, 4)}\ \text{T/keV} = ${tex(B, 3)}$ T $= ${fmt(ans, 3)}\times10^{8}$ T, some ten billion times Earth’s field. The line forms near the surface, so its photons climb out of the star’s gravity redshifted by roughly 30%: the true field is correspondingly larger. At such fields $\hbar\omega_c$ is a few percent of $m_ec^2$, and relativistic Landau levels are used in detailed work.`,
        };
      },
    }),
    mcq({
      id: 'cp-tonomura', difficulty: 3,
      prompt: t`In Tonomura’s 1986 experiment the magnetized toroid was sealed inside niobium, cooled until it was superconducting, so that the flux through the ring was trapped in whole multiples of $h/2e$. Which phase shifts between the electron wave through the hole and the wave outside could the experiment show?`,
      visual: toroidPic('The sealed toroid from above, schematic: one part of the electron wave through the hole, one outside.'),
      choices: [t`Only $0$ or $\pi$`, t`Any value between $0$ and $2\pi$, set by the magnet`, t`Only multiples of $2\pi$, so no visible shift`, t`Only multiples of $\pi/2$`],
      answer: 0,
      why: {
        1: t`The magnet alone could give any flux, but the superconducting shell forces $\Phi = n\,h/2e$.`,
        2: t`That would be true for a flux quantum $h/e$. The superconductor’s quantum is $h/2e$, half as big, because its carriers are pairs of charge $2e$.`,
        3: t`$e\Phi/\hbar$ with $\Phi = nh/2e$ gives $n\pi$, not $n\pi/2$.`,
      },
      hints: [t`The phase for an electron is $e\Phi/\hbar = 2\pi\,\Phi/(h/e)$.`, t`Put $\Phi = n\,h/2e$.`],
      teach: 'Flux trapped by a superconductor comes in units of h/2e, so an electron round it shifts by nπ.',
      explain: t`$e\Phi/\hbar = 2\pi\times n(h/2e)/(h/e) = n\pi$: $0$ for even $n$, $\pi$ for odd. Seeing $\pi$ with the field fully shielded showed the Aharonov–Bohm effect beyond doubt, and the two-valued result showed flux quantization at the same time.`,
    }),
    num({
      id: 'cp-hall', difficulty: 3, transfer: true,
      gen(r) {
        const ns = r.pick([2, 2.5, 3, 4, 5]);           // ×10¹⁵ m⁻²
        const ans = (ns * 1e15 * PHI0) / 2;
        return {
          prompt: t`A two-dimensional electron gas in a gallium arsenide chip has $n_s = ${ns}\times10^{15}$ electrons per square metre. Each Landau level holds $eB/h$ electrons per square metre for each spin direction. At what field $B$ are exactly the two spin states of the lowest Landau level full (filling factor $\nu = n_sh/eB = 2$)? Quantum Hall resistance standards are run on such a plateau, where the Hall resistance is $h/2e^2$.`,
          visual: fanPic({ mstar: 0.067, Bmax: 15, caption: 'Landau levels for GaAs (m* = 0.067 mₑ) against B. As B rises each level holds more electrons, so fewer levels are filled. Spin splitting not drawn.' }),
          answer: ans, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: ans * 2, feedback: t`At $\nu = 2$ two spin-resolved levels are full: $n_s = 2eB/h$, so $B = n_sh/2e$.` }, { value: ans * 2 * Math.PI, feedback: t`Use $h$, not $\hbar$: a level holds $eB/h$ per unit area per spin.` }],
          hints: [t`Set $n_s = \nu\,eB/h$ with $\nu = 2$.`, t`$B = \dfrac{n_s}{2}\times\dfrac{h}{e}$, with $h/e = ${tex(PHI0, 4)}$ Wb.`],
          teach: t`The filling factor $\nu = n_sh/eB$ counts filled spin-resolved Landau levels.`,
          explain: t`$B = n_sh/(2e) = ${ns}\times10^{15}\times${tex(PHI0, 4)}/2 = ${fmt(ans, 3)}$ T, within reach of a laboratory superconducting magnet. On the plateau the Hall resistance is $h/2e^2 \approx 12\,906\ \Omega$ to parts in $10^{9}$, independent of the chip’s details, which is why national labs realize the ohm with it.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §4.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Aharonov & Bohm, “Significance of electromagnetic potentials in the quantum theory”, Phys. Rev. 115, 485 (1959)', url: 'https://doi.org/10.1103/PhysRev.115.485' },
    { label: 'Tonomura et al., “Evidence for Aharonov–Bohm effect with magnetic field completely shielded from electron wave”, Phys. Rev. Lett. 56, 792 (1986)', url: 'https://doi.org/10.1103/PhysRevLett.56.792' },
    { label: 'Chambers, “Shift of an electron interference pattern by enclosed magnetic flux”, Phys. Rev. Lett. 5, 3 (1960)', url: 'https://doi.org/10.1103/PhysRevLett.5.3' },
    { label: 'Webb, Washburn, Umbach & Laibowitz, “Observation of h/e Aharonov–Bohm oscillations in normal-metal rings”, Phys. Rev. Lett. 54, 2696 (1985)', url: 'https://doi.org/10.1103/PhysRevLett.54.2696' },
  ],
});
