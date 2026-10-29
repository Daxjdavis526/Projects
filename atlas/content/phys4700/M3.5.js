// The delta-function potential (Griffiths & Schroeter §2.5). Derived: the
// jump condition Δψ′ = −(2mα/ħ²)ψ(0) by integrating across x = 0; the single
// bound state ψ = √κ e^{−κ|x|} with κ = mα/ħ², E = −mα²/2ħ²; scattering
// with β = mα/ħ²k: T = 1/(1 + β²) = 1/(1 + |E_b|/E), the same for a well
// and a barrier of the same strength. In eV-nm units κ = α/(2·ħ²/2mₑ).
// The deuteron (zero-range model): B = mₚ + mₙ − m_d from CODATA 2022 masses.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { T0, r6 } from './_wells.js';
import { HBARC_EVNM } from './_qm.js';
import { MPC2, MNC2, MDC2 } from '../phys2710/_constants.js';

const t = String.raw;
const kap = (a, m = 1) => (m * a) / (2 * T0);           // nm⁻¹ for α in eV nm
const Eb = (a, m = 1) => -(m * a * a) / (4 * T0);       // eV
const Tdelta = (a, E) => 1 / (1 + -Eb(a) / E);

/** The bound state ψ = √κ e^{−κ|x|} with the delta well drawn as a downward arrow. */
function boundPic(a, caption, { xr = 3, read = false } = {}) {
  const k = kap(a);
  return {
    type: 'graph',
    params: {
      x: [-xr, xr], y: [-0.6, r6(Math.max(1.3, Math.sqrt(k) * 1.25))], aspect: 'wide', xlabel: 'x (nm)', ylabel: 'ψ (nm⁻½)', axesAt: 'edge', xticks: 6, yticks: 4,
      curves: [{ fn: `sqrt(${r6(k)})*exp(-${r6(k)}*abs(x))`, color: 'accent', width: 2.6, samples: 2000 }],
      shade: [{ fn: `sqrt(${r6(k)})*exp(-${r6(k)}*abs(x))`, from: -xr, to: xr, color: 'accent', alpha: 0.12 }],
      arrows: [{ from: [0, -0.05], to: [0, -0.55], color: 'warn', width: 3, label: 'V = −αδ(x)', labelDx: 8, labelDy: -16 }],
      ...(read ? { readouts: [{ label: '$1/\\kappa$ (nm)', expr: r6(1 / k), digits: 3 }] } : {}),
    },
    caption,
  };
}

/** Re ψ of a plane wave scattering off a delta well at x = 0, for strength β = mα/ħ²k (schematic, λ = 1). */
function scatterPic(beta, caption) {
  const d = 1 + beta * beta, rr = -beta * beta / d, ri = beta / d, tr = 1 / d, ti = beta / d;
  const K = 2 * Math.PI;
  return {
    type: 'graph',
    params: {
      x: [-2.5, 2.5], y: [-2, 2.2], aspect: 'wide', xlabel: 'x (wavelengths)', ylabel: 'Re ψ', axesAt: 'edge', xticks: 5, yticks: 0,
      curves: [
        { fn: `cos(${r6(K)}*x) + ${r6(rr)}*cos(${r6(K)}*x) + ${r6(ri)}*sin(${r6(K)}*x)`, color: 'accent', width: 2.2, domain: [-2.5, 0] },
        { fn: `${r6(tr)}*cos(${r6(K)}*x) - ${r6(ti)}*sin(${r6(K)}*x)`, color: 'teal', width: 2.2, domain: [0, 2.5] },
      ],
      arrows: [{ from: [0, -1.2], to: [0, -1.9], color: 'warn', width: 3 }, { from: [-2.3, 1.9], to: [-1.4, 1.9], color: 'ink2', width: 2, label: 'incident', labelDx: 6, labelDy: 4 }, { from: [1.4, 1.9], to: [2.3, 1.9], color: 'ink2', width: 2, label: 'transmitted', labelDx: -120, labelDy: 14 }],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M3.5',
  title: 'The delta-function potential',
  minutes: 15, difficulty: 3,
  intro: t`The narrowest possible well is an infinitely deep, infinitely thin spike, $V(x) = -\alpha\,\delta(x)$: a model for a short-range attraction, such as an impurity in a crystal or the force between a proton and a neutron. Away from $x = 0$ the particle is free; at $x = 0$, integrating the Schrödinger equation across the spike shows that $\psi$ stays continuous but its **slope jumps**. That one condition gives exactly **one bound state**,

$$\psi(x) = \sqrt\kappa\,e^{-\kappa|x|}, \qquad \kappa = \frac{m\alpha}{\hbar^2}, \qquad E = -\frac{m\alpha^2}{2\hbar^2}$$

and, for a particle with $E > 0$, a transmission probability $T = 1/(1 + |E_b|/E)$ that is the same whether the spike is a well or a barrier.`,
  symbols: [
    { tex: '\\alpha', text: t`the strength of the spike: its area $\int V\,dx = -\alpha$, in J m (eV nm in the examples)` },
    { tex: '\\delta(x)', text: t`the Dirac delta: zero except at $x = 0$, with unit area, in m⁻¹` },
    { tex: '\\kappa', text: t`the decay constant of the bound state, in m⁻¹; $1/\kappa$ is how far it reaches` },
    { tex: 'E', text: t`the bound state’s energy, negative because it lies below $V = 0$ far away` },
    { tex: 'm', text: 'the particle’s mass, in kg' },
    { tex: '\\hbar', text: 'the reduced Planck constant, in J s' },
  ],
  why: 'Zero-range potentials are the simplest models of weakly bound systems — the deuteron, shallow donors in semiconductors, cold atoms near a Feshbach resonance — and the jump condition is the first boundary condition that is not “ψ′ continuous”.',
  visual: {
    type: 'graph',
    title: 'One spike, one bound state',
    lead: t`An electron bound to a delta well of strength $\alpha$. The wave function has a cusp at the spike and decays exponentially on both sides, never oscillating: there is no region where it is classically allowed except the spike itself.`,
    tasks: [
      'Double α: κ doubles, so the state shrinks to half the width, and the binding energy grows fourfold (E ∝ α²).',
      'Make α small: the state spreads far out but never disappears. In one dimension any attractive well, however weak, binds.',
      'Look at the cusp: the slope jumps from +κ√κ to −κ√κ, a jump of −2κψ(0), exactly what the spike demands.',
    ],
    params: {
      x: [-3, 3], y: [-0.6, 3.2], aspect: 'wide', xlabel: 'x (nm)', ylabel: 'ψ (nm⁻½)', axesAt: 'edge', xticks: 6, yticks: 4,
      sliders: [{ key: 'a', label: 'Strength $\\alpha$', min: 0.02, max: 0.6, step: 0.01, value: 0.1, unit: '\\text{eV nm}', explain: 'The area of the spike: how strongly it attracts.' }],
      constants: { T: r6(T0) },
      curves: [{ fn: 'sqrt(a/(2*T))*exp(-a/(2*T)*abs(x))', color: 'accent', width: 2.6, samples: 2000 }],
      shade: [{ fn: 'sqrt(a/(2*T))*exp(-a/(2*T)*abs(x))', from: -3, to: 3, color: 'accent', alpha: 0.12 }],
      arrows: [{ from: [0, -0.05], to: [0, -0.55], color: 'warn', width: 3, label: 'V = −αδ(x)', labelDx: 8, labelDy: -16 }],
      readouts: [
        { label: '$\\kappa$ (nm⁻¹)', expr: 'a/(2*T)', digits: 3 },
        { label: '$1/\\kappa$ (nm)', expr: '2*T/a', digits: 3 },
        { label: '$E$ (eV)', expr: '-a^2/(4*T)', digits: 3, zero: 0 },
      ],
    },
    caption: t`Exact, for an electron, with $\hbar^2/2m_e = ${fmt(T0, 5)}$ eV nm². The spike is drawn as an arrow: a delta function has no height to plot.`,
  },
  example: {
    prompt: t`For $V = -\alpha\delta(x)$, find the bound state and its energy, then the transmission probability for a particle of energy $E > 0$. Evaluate both for an electron with $\alpha = 0.1$ eV nm and $E = 0.05$ eV.`,
    visual: boundPic(0.1, t`The bound state for $\alpha = 0.1$ eV nm: a cusp at the spike, exponential tails of length $1/\kappa = ${fmt(1 / kap(0.1), 3)}$ nm.`),
    steps: [
      { label: 'The jump condition', text: t`Integrate $-\tfrac{\hbar^2}{2m}\psi'' - \alpha\delta(x)\psi = E\psi$ from $-\epsilon$ to $+\epsilon$ and let $\epsilon \to 0$. The right side vanishes (a finite integrand over a vanishing interval), leaving $\Delta\psi' = -\dfrac{2m\alpha}{\hbar^2}\psi(0)$. The spike puts a kink in $\psi$.` },
      { label: 'Away from the spike', text: t`For $E < 0$, $\psi'' = \kappa^2\psi$ with $\kappa = \sqrt{-2mE}/\hbar$. Normalizable solutions: $Be^{\kappa x}$ for $x < 0$ and $Be^{-\kappa x}$ for $x > 0$ — the same $B$, so that $\psi$ is continuous.` },
      { label: 'Apply the jump', text: t`$\psi'$ goes from $+\kappa B$ to $-\kappa B$, a jump of $-2\kappa B$. Setting it equal to $-\tfrac{2m\alpha}{\hbar^2}B$ gives $\kappa = m\alpha/\hbar^2$ — one value, so **one** bound state. Normalizing, $B = \sqrt\kappa$; and $E = -\hbar^2\kappa^2/2m = -m\alpha^2/2\hbar^2$.` },
      { label: 'Scattering', text: t`For $E > 0$: $Ae^{ikx} + Be^{-ikx}$ on the left, $Fe^{ikx}$ on the right. Continuity gives $A + B = F$; the jump gives $ik(F - A + B) = -\tfrac{2m\alpha}{\hbar^2}F$. With $\beta = m\alpha/\hbar^2k$: $F = A/(1 - i\beta)$, so $T = |F/A|^2 = \dfrac{1}{1 + \beta^2} = \dfrac{1}{1 + m\alpha^2/2\hbar^2E}$.` },
      { label: 'Numbers', text: t`$\kappa = \alpha/(2\cdot\hbar^2/2m_e) = 0.1/(2\times${fmt(T0, 4)}) = ${fmt(kap(0.1), 4)}\ \text{nm}^{-1}$ and $E_b = -\alpha^2/(4\cdot\hbar^2/2m_e) = ${fmt(Eb(0.1), 3)}$ eV. At $E = 0.05$ eV, $T = 1/(1 + ${fmt(-Eb(0.1), 3)}/0.05) = ${fmt(Tdelta(0.1, 0.05), 3)}$.` },
      { label: 'Sense check', text: t`$T \to 1$ at high energy (a fast particle barely notices the spike) and $T \to 0$ as $E \to 0$. The well and the barrier enter only through $\alpha^2$: an attractive spike reflects exactly as much as a repulsive one.` },
    ],
    answer: t`$\psi = \sqrt\kappa\,e^{-\kappa|x|}$, $\kappa = m\alpha/\hbar^2 = ${fmt(kap(0.1), 3)}\ \text{nm}^{-1}$, $E = -m\alpha^2/2\hbar^2 = ${fmt(Eb(0.1), 3)}$ eV; $T = 1/(1 + |E_b|/E) = ${fmt(Tdelta(0.1, 0.05), 3)}$.`,
  },
  practice: [
    mcq({
      id: 'how-many', difficulty: 1,
      prompt: t`How many bound states does the delta well $V = -\alpha\delta(x)$ have, for $\alpha > 0$?`,
      visual: boundPic(0.08, 'The bound state of a weak delta well. Is there room for another?', { xr: 4 }),
      choices: ['Exactly one, for every α > 0', 'None unless α exceeds a threshold', 'One for each half-wavelength that fits, so it grows with α', 'Infinitely many, crowding toward E = 0'],
      answer: 0,
      why: {
        1: 'In one dimension any attractive well binds at least one state. (In three dimensions a threshold does exist.)',
        2: t`The well has zero width: no half-wavelength fits inside it. The jump condition fixes a single $\kappa$.`,
        3: t`Infinitely many levels need a long-range tail, like hydrogen’s $1/r$. A delta function has no range at all.`,
      },
      hints: ['The jump condition gives one equation for κ. How many positive solutions does κ = mα/ħ² have?'],
      teach: 'The delta well has exactly one bound state, whatever its strength.',
      explain: t`Outside the spike only decaying exponentials are allowed, and the slope jump fixes $\kappa = m\alpha/\hbar^2$ uniquely. An odd state would vanish at the spike and feel nothing there, so it cannot be bound.`,
    }),
    num({
      id: 'bound-E', difficulty: 2,
      gen(r) {
        const a = r.pick([0.05, 0.08, 0.1, 0.15, 0.2, 0.3]);
        const ans = Eb(a);
        return {
          prompt: t`An electron is bound to a delta well of strength $\alpha = ${a}$ eV nm. What is its energy, in eV? ($\hbar^2/2m_e = ${fmt(T0, 5)}$ eV nm², so $m\alpha^2/2\hbar^2 = \alpha^2/(4\cdot\hbar^2/2m_e)$.)`,
          visual: boundPic(a, 'The bound state. The tails’ length 1/κ is set by the energy.'),
          answer: ans, units: 'eV', tol: { rel: 0.005 },
          errors: [
            { value: 2 * ans, feedback: t`$m/\hbar^2 = 1/(2\cdot\hbar^2/2m)$: $E = -\alpha^2/(4\cdot\hbar^2/2m)$, not $\alpha^2/(2\cdot\hbar^2/2m)$.` },
            { value: ans / 4, feedback: t`$E = -m\alpha^2/2\hbar^2$; you may have used $\hbar^2/m$ where $\hbar^2/2m$ belongs.` },
          ],
          hints: [t`$\kappa = m\alpha/\hbar^2 = \alpha/(2\times${fmt(T0, 4)})\ \text{nm}^{-1}$.`, t`$E = -\tfrac{\hbar^2\kappa^2}{2m} = -${fmt(T0, 4)}\,\kappa^2$ eV.`],
          teach: t`The delta well’s single level lies at $E = -m\alpha^2/2\hbar^2$: four times deeper when $\alpha$ doubles.`,
          explain: t`$\kappa = ${fmt(kap(a), 4)}\ \text{nm}^{-1}$ and $E = -${fmt(T0, 4)}\times${fmt(kap(a), 4)}^2 = ${fmt(ans, 4)}$ eV.`,
        };
      },
    }),
    expr({
      id: 'E-formula', difficulty: 2,
      prompt: t`Using $\kappa = m\alpha/\hbar^2$ and $E = -\hbar^2\kappa^2/2m$, write the bound-state energy in terms of $m$, $\alpha$ and $\hbar$.`,
      visual: boundPic(0.12, 'The bound state: the cusp’s sharpness and the tails’ length both come from κ.'),
      answer: '-m*alpha^2/(2*hbar^2)', answerTeX: t`-\frac{m\alpha^2}{2\hbar^2}`,
      lhs: 'E',
      vars: { m: [0.5, 3], alpha: [0.5, 3], hbar: [0.5, 2] },
      keys: [['α', 'alpha'], ['ħ', 'hbar']],
      errors: [
        { answer: 'm*alpha^2/(2*hbar^2)', feedback: 'A bound state lies below the zero of energy far from the well: E is negative.' },
        { answer: '-m*alpha^2/hbar^2', feedback: t`$\hbar^2\kappa^2/2m$ keeps the factor $\tfrac12$: $\tfrac{\hbar^2}{2m}\cdot\tfrac{m^2\alpha^2}{\hbar^4}$.` },
        { answer: '-m^2*alpha^2/(2*hbar^2)', feedback: t`One $m$ cancels: $\tfrac{1}{2m}\cdot m^2 = \tfrac m2$.` },
      ],
      hints: [t`Substitute $\kappa^2 = m^2\alpha^2/\hbar^4$.`, t`$-\tfrac{\hbar^2}{2m}\cdot\tfrac{m^2\alpha^2}{\hbar^4}$; cancel.`],
      teach: t`$E = -m\alpha^2/2\hbar^2$: heavier particles and stronger spikes bind more deeply.`,
      explain: t`$E = -\dfrac{\hbar^2}{2m}\cdot\dfrac{m^2\alpha^2}{\hbar^4} = -\dfrac{m\alpha^2}{2\hbar^2}$. A check by units: $\alpha$ is energy × length, so $m\alpha^2/\hbar^2$ is an energy.`,
    }),
    num({
      id: 'inside', difficulty: 2,
      gen(r) {
        const b = r.pick([0.5, 1, 1.5, 2]);
        const ans = 1 - Math.exp(-2 * b);
        return {
          prompt: t`A particle is in the bound state of a delta well, $\psi = \sqrt\kappa\,e^{-\kappa|x|}$. What is the probability of finding it within $|x| < ${b}/\kappa$?`,
          visual: { type: 'graph', params: { x: [-3.5, 3.5], y: [0, 1.15], aspect: 'wide', xlabel: 'κx', ylabel: '|ψ|² / κ', axesAt: 'edge', xticks: 7, yticks: 2, curves: [{ fn: 'exp(-2*abs(x))', color: 'accent', width: 2.4, samples: 2000 }], shade: [{ fn: 'exp(-2*abs(x))', from: -b, to: b, color: 'gold', alpha: 0.45 }] }, caption: t`The density $\kappa e^{-2\kappa|x|}$ in units where $\kappa = 1$; the window $|x| < ${b}/\kappa$ is shaded.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 - Math.exp(-b), feedback: t`The density is $|\psi|^2 = \kappa e^{-2\kappa|x|}$: square the exponential too.` }, { value: (1 - Math.exp(-2 * b)) / 2, feedback: 'Count both sides of the spike: the window is symmetric.' }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$P = 2\int_0^{b/\kappa}\kappa e^{-2\kappa x}dx$.`, t`$= 1 - e^{-2b}$ with $b = ${b}$.`],
          teach: t`Exponential tails make probabilities simple: $P(|x| < b/\kappa) = 1 - e^{-2b}$.`,
          explain: t`$P = 1 - e^{-${2 * b}} = ${fmt(ans, 4)}$. The rest, $${fmt(1 - ans, 3)}$, lies further out: the particle is often found well away from the only place where it feels any force.`,
        };
      },
    }),
    num({
      id: 'T-delta', difficulty: 2,
      gen(r) {
        const a = r.pick([0.05, 0.1, 0.2]), E = r.pick([0.02, 0.05, 0.1, 0.5]);
        const ans = Tdelta(a, E);
        const beta = Math.sqrt(-Eb(a) / E);
        return {
          prompt: t`An electron of energy $E = ${E}$ eV meets a delta well of strength $\alpha = ${a}$ eV nm. What is the probability that it is transmitted? (The well’s bound state lies at $E_b = ${fmt(Eb(a), 4)}$ eV.)`,
          visual: scatterPic(Math.min(beta, 2.5), t`The real part of a wave meeting a delta well (orange arrow), drawn at the strength of this problem: incident and reflected waves on the left, the transmitted wave on the right. Schematic in wavelength units.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: 1 - ans, feedback: t`That is the reflection probability $R = \beta^2/(1 + \beta^2)$; $T = 1 - R$.` },
            { value: 1 / (1 + Math.sqrt(-Eb(a) / E)), feedback: t`$\beta^2 = |E_b|/E$, so $T = 1/(1 + |E_b|/E)$ — no square root.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$T = \dfrac{1}{1 + \beta^2}$ with $\beta^2 = \dfrac{m\alpha^2}{2\hbar^2E} = \dfrac{|E_b|}{E}$.`, t`$|E_b|/E = ${fmt(-Eb(a), 4)}/${E} = ${fmt(-Eb(a) / E, 4)}$.`],
          teach: t`For a delta potential, $T = 1/(1 + |E_b|/E)$: the bound-state energy sets the scale on which scattering turns on.`,
          explain: t`$T = 1/(1 + ${fmt(-Eb(a) / E, 4)}) = ${fmt(ans, 4)}$, and $R = ${fmt(1 - ans, 4)}$. Classically the electron, passing over a well, would always be transmitted.`,
        };
      },
    }),
    mcq({
      id: 'well-barrier', difficulty: 3,
      prompt: t`Electrons of the same energy meet either a delta **well**, $-\alpha\delta(x)$, or a delta **barrier**, $+\alpha\delta(x)$, of the same strength. Which reflects more?`,
      visual: scatterPic(1, 'A wave meeting a delta spike (orange): its kink is what reflects part of it. The picture is the well; ask what changes for a barrier. Schematic.'),
      choices: [
        t`Neither: $T = 1/(1 + m\alpha^2/2\hbar^2E)$ depends only on $\alpha^2$`,
        'The barrier, because it pushes the electrons back',
        'The well, because it traps some of the electrons',
        'The barrier, unless the energy exceeds its height',
      ],
      answer: 0,
      why: {
        1: 'Classically a well reflects nothing and a barrier of infinite height reflects everything. Quantum mechanically they reflect equally, a purely wave effect.',
        2: 'A scattering electron cannot fall into the bound state without losing energy to something else; the Hamiltonian here has no such channel.',
        3: t`A delta barrier has no finite height to compare with; its strength $\alpha$ is an area. Every energy is partly transmitted.`,
      },
      hints: [t`In the scattering solution, where does $\alpha$ appear?`, t`$\beta = m\alpha/\hbar^2k$ enters $T$ only as $\beta^2$.`],
      teach: 'Reflection is caused by the abrupt change in the wave’s slope, which a spike up or down produces equally: T depends on α².',
      explain: t`Changing $\alpha \to -\alpha$ changes $\beta \to -\beta$, which changes the phases of the reflected and transmitted waves but not $|F/A|^2 = 1/(1 + \beta^2)$. What distinguishes the well is that it also has a bound state.`,
    }),
    num({
      id: 'half-T', difficulty: 3,
      gen(r) {
        const a = r.pick([0.05, 0.1, 0.15, 0.25]);
        const ans = -Eb(a);
        return {
          prompt: t`For an electron meeting a delta well of strength $\alpha = ${a}$ eV nm, at what energy is the transmission probability exactly $\tfrac12$, in eV?`,
          visual: { type: 'graph', params: { x: [0, 0.6], y: [0, 1.05], aspect: 'wide', xlabel: 'electron energy E (eV)', ylabel: 'T', xticks: 6, yticks: 4, axesAt: 'edge', curves: [{ fn: `1/(1 + ${r6(-Eb(a))}/x)`, color: 'accent', width: 2.4, domain: [0.0005, 0.6] }], hlines: [{ y: 0.5, color: 'ink3', label: 'T = ½' }] }, caption: 'Transmission against energy for this well, exact. Read it, then find the energy exactly.' },
          answer: ans, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: t`$T = \tfrac12$ when $\beta^2 = 1$, that is when $E = |E_b| = \alpha^2/(4\cdot\hbar^2/2m)$.` }],
          hints: [t`$T = \tfrac12$ means $\beta^2 = 1$.`, t`$\beta^2 = |E_b|/E$, so $E = |E_b| = m\alpha^2/2\hbar^2$.`],
          teach: 'Transmission through a delta well is one half exactly when the particle’s energy equals the bound state’s binding energy.',
          explain: t`$E = m\alpha^2/2\hbar^2 = ${a}^2/(4\times${fmt(T0, 4)}) = ${fmt(ans, 4)}$ eV — the same number as the binding energy. One parameter, $\alpha$, sets both the bound state and the scattering.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-reach', difficulty: 2,
      gen(r) {
        const E = r.pick([0.01, 0.025, 0.05, 0.1, 0.3]);
        const ans = Math.sqrt(T0 / E);
        return {
          prompt: t`An electron is bound to a short-range impurity, modelled as a delta well, with binding energy $${E}$ eV. How far does its wave function reach — what is $1/\kappa$, in nm? ($\hbar^2/2m_e = ${fmt(T0, 5)}$ eV nm².)`,
          visual: boundPic(Math.sqrt(4 * T0 * E), 'The bound state; its decay length is the question.', { xr: Math.max(3, 4 * ans) }),
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: T0 / E, feedback: t`$\kappa^2 = 2m|E|/\hbar^2$: take the square root.` }, { value: ans / Math.SQRT2, feedback: t`$1/\kappa = \hbar/\sqrt{2m|E|} = \sqrt{(\hbar^2/2m)/|E|}$.` }],
          hints: [t`$|E| = \hbar^2\kappa^2/2m$.`, t`$1/\kappa = \sqrt{(\hbar^2/2m)/|E|}$.`],
          teach: t`A weakly bound state reaches far: $1/\kappa = \hbar/\sqrt{2m|E|}$ grows as the binding energy shrinks.`,
          explain: t`$1/\kappa = \sqrt{${fmt(T0, 4)}/${E}} = ${fmt(ans, 3)}$ nm — many atomic spacings for a shallow level, which is why shallow donor electrons in silicon spread over thousands of atoms.`,
        };
      },
    }),
    mcq({
      id: 'cp-kink', difficulty: 2,
      prompt: t`At $x = 0$, what conditions must $\psi$ satisfy for $V = -\alpha\delta(x)$?`,
      visual: boundPic(0.15, 'The cusp at the spike.'),
      choices: [
        t`$\psi$ continuous; $\psi'$ jumps by $-\tfrac{2m\alpha}{\hbar^2}\psi(0)$`,
        t`$\psi$ and $\psi'$ both continuous, as for any potential`,
        t`$\psi(0) = 0$, as at an infinite wall`,
        t`$\psi$ jumps by $\alpha$; $\psi'$ continuous`,
      ],
      answer: 0,
      why: {
        1: t`$\psi'$ is continuous only where $V$ is finite. Integrating across the spike leaves $-\tfrac{2m\alpha}{\hbar^2}\psi(0)$ behind.`,
        2: t`A delta spike is not a wall; the bound state is largest at $x = 0$.`,
        3: t`A jump in $\psi$ would make $\psi''$ contain $\delta'$, which nothing in the equation can match.`,
      },
      hints: [t`Integrate the Schrödinger equation from $-\epsilon$ to $\epsilon$.`, t`$\int_{-\epsilon}^{\epsilon}\psi''dx = \psi'(\epsilon) - \psi'(-\epsilon)$.`],
      teach: 'At a delta spike the wave function is continuous but its slope jumps in proportion to the spike’s strength.',
      explain: t`$-\tfrac{\hbar^2}{2m}\Delta\psi' - \alpha\psi(0) = 0$, so $\Delta\psi' = -\tfrac{2m\alpha}{\hbar^2}\psi(0)$. The cusp in the picture is that jump.`,
    }),
    num({
      id: 'cp-deuteron', difficulty: 3, transfer: true,
      gen(r) {
        const B = MPC2 + MNC2 - MDC2;                 // MeV
        const mu = (MPC2 * MNC2) / (MPC2 + MNC2);     // MeV
        const hbarc = HBARC_EVNM;                     // eV nm = MeV fm
        const which = r.pick(['reach', 'outside']);
        const reach = hbarc / Math.sqrt(2 * mu * B);  // fm
        const R0 = r.pick([2, 2.5]);
        const ans = which === 'reach' ? reach : Math.exp(-2 * R0 / reach);
        return {
          prompt: which === 'reach'
            ? t`The deuteron — a proton and a neutron, the first product of the Sun’s fusion chain and a fuel of fusion reactors — is bound by only $B = ${fmt(B, 6)}$ MeV. Its force has a range of under 2 fm, so a zero-range (delta) well is a fair first model, and the $s$-wave radial function is $u(r) \propto e^{-\kappa r}$ with $\kappa = \sqrt{2\mu B}/\hbar$. With reduced mass $\mu c^2 = ${fmt(mu, 6)}$ MeV and $\hbar c = ${fmt(hbarc, 7)}$ MeV fm, find $1/\kappa$ in fm.`
            : t`In the zero-range model of the deuteron, the radial probability density is $|u|^2 \propto e^{-2\kappa r}$ with $1/\kappa = ${fmt(reach, 4)}$ fm (from its binding energy, $${fmt(B, 6)}$ MeV). What fraction of the time are the proton and neutron farther apart than ${R0} fm, roughly the range of the nuclear force?`,
          visual: { type: 'graph', params: { x: [0, 12], y: [0, 1.1], aspect: 'wide', xlabel: 'separation r (fm)', ylabel: '|u(r)|² (scaled)', xticks: 6, yticks: 2, axesAt: 'edge', curves: [{ fn: `exp(-2*x/${r6(reach)})`, color: 'accent', width: 2.4 }], vlines: [{ x: 1.75, color: 'warn', label: 'force range ≈ 1.5–2 fm' }] }, caption: 'The zero-range model’s radial density. It cannot be right inside the range of the force, where the real wave function turns over.' },
          answer: ans, ...(which === 'reach' ? { units: 'fm' } : {}), tol: { rel: 0.01 },
          errors: which === 'reach'
            ? [{ value: reach * Math.SQRT2, feedback: t`$\kappa = \sqrt{2\mu B}/\hbar$: keep the 2 inside the root.` }, { value: hbarc / Math.sqrt(2 * MPC2 * B), feedback: t`Use the reduced mass $\mu \approx m_p/2$, not the proton mass.` }]
            : [{ value: Math.exp(-R0 / reach), feedback: t`The density is $|u|^2 \propto e^{-2\kappa r}$: the exponent has $2\kappa$.` }, { value: 1 - Math.exp(-2 * R0 / reach), feedback: 'That is the fraction inside. The question asks for outside.' }],
          hints: which === 'reach'
            ? [t`$1/\kappa = \hbar c/\sqrt{2\mu c^2B}$.`, t`$\sqrt{2\times${fmt(mu, 5)}\times${fmt(B, 5)}} = ${fmt(Math.sqrt(2 * mu * B), 4)}$ MeV.`]
            : [t`$P(r > R) = \int_R^\infty e^{-2\kappa r}dr \big/ \int_0^\infty e^{-2\kappa r}dr$.`, t`$= e^{-2\kappa R}$.`],
          teach: 'A weakly bound state lives mostly outside its own potential, which is why zero-range models describe it well.',
          explain: which === 'reach'
            ? t`$1/\kappa = ${fmt(hbarc, 5)}/${fmt(Math.sqrt(2 * mu * B), 4)} = ${fmt(reach, 3)}$ fm, more than twice the force’s range: the proton and neutron spend much of their time outside each other’s reach. That is why so simple a model gets the deuteron’s size roughly right.`
            : t`$P = e^{-2\times${R0}/${fmt(reach, 4)}} = ${fmt(ans, 3)}$. For a large part of the time the two nucleons are beyond the range of the force that binds them — classically forbidden territory, reached by the wave’s tail.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §2.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'CODATA 2022 recommended values (proton, neutron and deuteron masses)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
