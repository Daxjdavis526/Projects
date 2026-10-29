// The uncertainty principle — Δx·Δp ≥ ħ/2 as a property of waves, reached
// only by a Gaussian packet (the box gives 0.568ħ, the exponential 0.707ħ).
// Estimates of hydrogen’s size and energy and of an oscillator’s zero-point
// energy (exact, since its ground state is the Gaussian), the confinement
// energy of a box, and the energy–time relation Γ = ħ/τ: particle widths and
// lifetimes, the Mössbauer line of iron-57 that let Pound and Rebka weigh
// light, and the gravitational quantum states of ultracold neutrons. Every
// number is computed here or in model/mp-packet.js.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { A0, C, H, HBAR, ME, MNC2, QE } from './_constants.js';
import { seg, label, frame, r6 } from './_diagrams.js';
import { FE57_KEV, FE57_TAU, G0, GAMMA_DELTA, GAMMA_JPSI, GAMMA_Z, HBAR_EVS, KE2 } from './_quanta.js';

const t = String.raw;

// ---- hydrogen from the uncertainty principle (E in eV, r in m) ----
const KE2_JM = KE2 * QE * 1e-9;                                   // e²/4πε₀ in J m
const R_EST = (HBAR * HBAR) / (ME * KE2_JM);                      // the r that minimises ħ²/2mr² − ke²/r: a₀
const KIN_A0 = (HBAR * HBAR) / (2 * ME * A0 * A0) / QE;           // 13.606 eV
const POT_A0 = KE2_JM / A0 / QE;                                  // 27.211 eV
const E_EST = KIN_A0 - POT_A0;                                    // −13.606 eV
const E_QUARTER = -4 * KIN_A0;                                    // with p = ħ/2r: r = a₀/4 and E = −54.4 eV

// ---- the neutron ----
const MN = (MNC2 * 1e6 * QE) / (C * C);                           // kg
const zBounce = () => Math.cbrt((HBAR * HBAR) / (MN * MN * G0));  // m: the minimum of ħ²/2mz² + mgz
const Z0 = Math.cbrt((HBAR * HBAR) / (2 * MN * MN * G0));         // m: the natural length of the gravitational quantum well
const AIRY1 = 2.338107410459767;                                  // the first zero of Ai(−x)
const E1_PEV = (MN * G0 * Z0 * AIRY1) / QE * 1e12;                // peV: the true ground state
const Z1_UM = AIRY1 * Z0 * 1e6;                                   // μm: its classical turning height

// ---- molecules: harmonic vibrational wavenumbers ωe, cm⁻¹ (Huber & Herzberg, NIST WebBook) ----
const MOLECULES = { 'hydrogen (H₂)': 4401.21, 'carbon monoxide (CO)': 2169.81, 'nitrogen (N₂)': 2358.57 };

// ---- resonances: name, mass (MeV), width (MeV) ----
const RESONANCES = [
  { key: 'Z', name: 'the Z boson', M: 91188, G: GAMMA_Z, unit: 'GeV', scale: 1e-3, zero: 0 },
  { key: 'J/ψ', name: 'the J/ψ meson', M: 3096.9, G: GAMMA_JPSI, unit: 'keV', scale: 1e3, zero: 3096.9 },
  { key: 'Δ', name: 'the Δ(1232) baryon', M: 1232, G: GAMMA_DELTA, unit: 'MeV', scale: 1, zero: 0 },
];

/** Hydrogen’s energy against the electron’s confinement radius, estimated with p ≈ ħ/r. */
function hydrogen({ ask = false } = {}) {
  const k = r6(KIN_A0), u = r6(POT_A0);
  return {
    type: 'graph',
    params: {
      x: [0, 4], y: [-32, 28], aspect: 'wide', xlabel: 'confinement radius r / a₀', ylabel: 'energy (eV)',
      curves: [
        { fn: `${k}/x^2`, domain: [0.7, 4], color: 'gold', width: 1.6, dash: true, label: 'kinetic ≈ ħ²/2mr²', labelAt: 1.5, labelDx: 8, labelDy: -6 },
        { fn: `-${u}/x`, domain: [0.85, 4], color: 'violet', width: 1.6, dash: true, label: 'potential −ke²/r', labelAt: 2.4, labelDx: 0, labelDy: 16 },
        { fn: `${k}/x^2 - ${u}/x`, domain: [0.37, 4], color: 'accent', width: 2.6, label: 'total', labelAt: 2.4, labelDx: 0, labelDy: -12 },
      ],
      hlines: [{ y: 0, color: 'ink4' }],
      points: [{ x: 1, y: r6(E_EST), r: 5, color: 'accent' }, ...(ask ? [] : [label(0.97, -18.5, 'lowest: r = a₀, −13.6 eV', 'accent', 0, 0, 'right')])],
    },
    caption: ask
      ? 'The estimate of the energy of an electron held within a distance r of a proton: squeezing it raises the kinetic energy (gold) faster than it lowers the potential energy (violet).'
      : 'The energy of an electron held within a distance r of a proton, estimated with p ≈ ħ/r: the kinetic energy (gold) climbs as 1/r² while the potential energy (violet) falls only as 1/r, so the total has a minimum.',
  };
}

/** An oscillator’s energy against the width of its packet, at the minimum Δp = ħ/2Δx. */
const oscillator = {
  type: 'graph',
  params: {
    x: [0, 3], y: [0, 1.65], aspect: 'wide', xlabel: 'position spread Δx', ylabel: 'energy', xticks: 0, yticks: 0,
    curves: [
      { fn: '0.25/x^2', domain: [0.39, 3], color: 'gold', width: 1.6, dash: true, label: 'kinetic (Δp)²/2m, with Δp = ħ/2Δx', labelAt: 1.55, labelDx: 0, labelDy: -10, labelAlign: 'left' },
      { fn: '0.25*x^2', domain: [0, 2.55], color: 'violet', width: 1.6, dash: true, label: 'potential ½mω²(Δx)²', labelAt: 2.3, labelDx: 10, labelDy: 6 },
      { fn: '0.25*(x^2 + 1/x^2)', domain: [0.39, 2.55], color: 'accent', width: 2.6, label: 'total', labelAt: 1.75, labelDx: -10, labelDy: -12, labelAlign: 'right' },
    ],
    points: [{ x: 1, y: 0.5, r: 5, color: 'accent', label: 'smallest possible energy', labelDx: 0, labelDy: -40, labelAlign: 'center' }],
  },
  caption: 'A particle in a harmonic well, with the smallest momentum spread the uncertainty principle allows for each position spread: neither spread can be zero, so neither can the energy.',
};

/** A resonance’s width in its natural unit, as plain text: 2.496 GeV, 92.6 keV, 117 MeV. */
const widthText = (R) => (R.G >= 1000 ? `${fmt(R.G / 1000, 4)} GeV` : R.G < 1 ? `${nice(R.G * 1000, 3)} keV` : `${nice(R.G, 3)} MeV`);

/** The cross-section of a resonance against collision energy: a Lorentzian of full width Γ. */
function resonance(R) {
  const c = (R.M - R.zero) * R.scale, w = R.G * R.scale;
  const x0 = r6(c - 4 * w), x1 = r6(c + 4 * w);
  return {
    type: 'graph',
    params: {
      x: [x0, x1], y: [0, 1.25], aspect: 'wide', yticks: 0, ylabel: 'rate', axesAt: 'edge',
      xlabel: R.zero ? `collision energy − ${R.zero} MeV (keV)` : `collision energy (${R.unit})`,
      curves: [{ fn: `1/(1 + 4*((x - ${r6(c)})/${r6(w)})^2)`, domain: [x0, x1], color: 'accent', width: 2.4 }],
      arrows: [{ from: [r6(c), 0.5], to: [r6(c + w / 2), 0.5], color: 'gold', width: 1.5 }, { from: [r6(c), 0.5], to: [r6(c - w / 2), 0.5], color: 'gold', width: 1.5 }],
      points: [label(c + w / 2, 0.5, `full width at half height: Γ = ${widthText(R)}`, 'gold', 12, 0, 'left')],
    },
    caption: `How often ${R.name} is made as the collision energy is tuned across its mass: a peak whose full width at half height is Γ. (Drawn without the smearing a real beam adds.)`,
  };
}

/** Light from one decaying excited state: a wave train that dies away over the lifetime. */
const decayTrain = {
  type: 'graph',
  params: {
    x: [-0.5, 10], y: [-1.25, 1.4], aspect: 'wide', xlabel: 'time', ylabel: 'field', xticks: 0, yticks: 0,
    curves: [
      { fn: 'step(x)*exp(-x/2.5)*cos(9*x)', domain: [-0.5, 10], color: 'bad', width: 1.8 },
      { fn: 'exp(-x/2.5)', domain: [0, 10], color: 'gold', width: 1.4, dash: true },
    ],
    arrows: [{ from: [0, 1.15], to: [1.25, 1.15], color: 'gold', width: 1.4 }],
    points: [label(1.3, 1.15, 'lifetime τ', 'gold', 8, 0, 'left')],
  },
  caption: t`The light emitted as one excited state decays: a wave train whose amplitude dies away as $e^{-t/2\tau}$ (dashed), so that its intensity falls as $e^{-t/\tau}$. Drawn with far fewer cycles than a real atom emits.`,
};

/** Where Δx·Δp ≥ ħ/2 forbids a state, for electrons on logarithmic axes. */
const forbidden = (() => {
  const b = r6(Math.log10(HBAR / 2 / 1e-9 / 1e-25));             // log₁₀ of ħ/2, with Δx in nm and Δp in 10⁻²⁵ kg m/s
  return {
    type: 'graph',
    params: {
      x: [-1.7, 0.7], y: [-1, 1.5], aspect: 'wide', xlog: true, ylog: true, axesAt: 'edge',
      xlabel: 'position spread Δx (nm)', ylabel: 'momentum spread Δp (10⁻²⁵ kg m/s)',
      shade: [{ fn: `${b} - x`, lower: '-1', from: -1.7, to: 0.7, color: 'bad', alpha: 0.16 }],
      curves: [{ fn: `${b} - x`, domain: [-1.7, 0.7], color: 'accent', width: 2.4, label: 'Δx Δp = ħ/2: Gaussian packets', labelAt: -0.65, labelDx: 6, labelDy: -12, labelAlign: 'left' }],
      points: [label(-1.25, -0.55, 'forbidden: Δx Δp < ħ/2', 'bad', 0, 0, 'left')],
    },
    caption: 'The plane of position and momentum spreads, on logarithmic axes. Every state lies on or above the line Δx·Δp = ħ/2; only Gaussian packets lie on it.',
  };
})();

/** The Pound–Rebka tower: iron-57 gamma rays climbing 22.5 m. */
const tower = {
  type: 'graph',
  params: frame([-3.8, 3.0], [-0.5, 3.9], {
    aspect: 'wide',
    curves: [seg(-1.2, 0, -1.2, 3.6, 'ink3', 1.6), seg(1.2, 0, 1.2, 3.6, 'ink3', 1.6), seg(-2.0, 0, 2.0, 0, 'ink2', 2.2), seg(1.7, 0.25, 1.7, 3.25, 'ink3', 1.1)],
    arrows: [
      { from: [0, 0.45], to: [0, 2.95], color: 'violet', width: 2 },
      { from: [1.7, 1.75], to: [1.7, 3.25], color: 'ink3', width: 1.1 }, { from: [1.7, 1.75], to: [1.7, 0.25], color: 'ink3', width: 1.1 },
    ],
    points: [
      { x: 0, y: 0.25, r: 7, color: 'gold' }, { x: 0, y: 3.25, r: 7, color: 'accent' },
      label(-1.35, 0.25, 'source: excited iron-57', 'gold', -6, 0, 'right'),
      label(-1.35, 3.25, 'absorber: iron-57', 'accent', -6, 0, 'right'),
      label(-1.35, 1.7, '14.4 keV gamma rays', 'violet', -6, 0, 'right'),
      label(1.7, 1.75, '22.5 m', 'ink2', 8, 0, 'left'),
    ],
  }),
  caption: 'Pound and Rebka’s experiment (1960): gamma rays from iron-57 at the foot of a tower at Harvard are absorbed only by iron-57 tuned to exactly the same energy at the top — unless gravity has shifted them. Not to scale.',
};

/** Ultracold neutrons bouncing between a mirror and an absorber. */
const bounce = {
  type: 'graph',
  params: frame([-5, 5], [-0.9, 3.4], {
    aspect: 'wide',
    shade: [{ fn: '2.75', lower: '2.25', from: -1.5, to: 4.6, color: 'violet', alpha: 0.28 }, { fn: '0', lower: '-0.35', from: -4.6, to: 4.6, color: 'ink3', alpha: 0.35 }],
    curves: [{ fn: '1.7*abs(sin(0.75*(x + 4.4)))', domain: [-4.4, 4.4], color: 'accent', width: 1.8, dash: true }],
    arrows: [{ from: [4.6, 1.25], to: [4.6, 2.2], color: 'ink2', width: 1.1 }, { from: [4.6, 1.25], to: [4.6, 0.05], color: 'ink2', width: 1.1 }],
    points: [
      label(-4.5, -0.62, 'mirror: neutrons bounce off it', 'ink2', 0, 0, 'left'),
      label(-1.4, 2.5, 'absorber at height h', 'violet', -8, 0, 'right'),
      label(4.6, 1.25, 'h', 'ink2', 8, 0, 'left'),
      label(-4.4, 1.9, 'neutron, a few m/s along', 'accent', 0, -6, 'left'),
    ],
  }),
  caption: 'Ultracold neutrons fly along a horizontal mirror, falling and bouncing, under an absorber that removes any that rise as high as it. Classically every gap h lets some through. Heights grossly exaggerated.',
};

/** The packet simulation as a still picture. */
const still = (params, caption) => ({ type: 'mp-packet', params: { view: 'xk', controls: false, readout: false, ...params }, ...(caption ? { caption } : {}) });

// the states offered in the “which are allowed” question: Δx in nm, Δp in units of 10⁻²⁵ kg m/s
const STATES = [[0.1, 6.0], [0.5, 0.8], [2.0, 0.3], [0.05, 10], [1.0, 0.55]];
// ---- Pound and Rebka: the iron-57 line against gravity’s shift over their 22.5 m tower ----
const PR = (() => { const h = 22.5, G = HBAR_EVS / FE57_TAU, shift = (FE57_KEV * 1e3 * G0 * h) / (C * C); return { h, G, shift, q: shift / G }; })();
const BOX_PRODUCT = Math.PI * Math.sqrt(1 / 12 - 1 / (2 * Math.PI * Math.PI));   // Δx·Δp/ħ for a box’s ground state: 0.568
const ratio = ([dx, dp]) => (dx * 1e-9 * dp * 1e-25) / HBAR;   // Δx·Δp in units of ħ

export default lesson({
  id: 'phys2710.MP6.3',
  title: 'The uncertainty principle',
  minutes: 15, difficulty: 3,
  intro: t`A wave packet of length $\Delta x$ is built from wavenumbers spread over at least $\Delta k = 1/(2\Delta x)$. For a matter wave $p = \hbar k$, so this fact about waves becomes Heisenberg’s **uncertainty principle**:

$$\Delta x\,\Delta p_x \ge \frac{\hbar}{2}$$

$\Delta x$ and $\Delta p_x$ are standard deviations — the spreads of the results when position, or momentum, is measured on many identically prepared particles. No state beats the bound, and only a Gaussian packet reaches it. Nothing here is about clumsy instruments: it is what being a wave means. Its partner in time says that a state which lasts only a time $\tau$ has a blurred energy, the natural width of the line it emits:

$$\Gamma = \frac{\hbar}{\tau}$$

The rest of this lesson uses these relations as tools: to size atoms, to find the energy no oscillator can lose, and to read lifetimes from widths.

> The first look at the uncertainty principle, with its estimates for electrons in atoms, was [Wave–particle duality and the uncertainty principle](#/lesson/phys2220.Q1.4).`,
  symbols: [
    { tex: '\\Delta x', text: 'the spread (standard deviation) of a particle’s position along x' },
    { tex: '\\Delta p_x', text: 'the spread (standard deviation) of its momentum along the same direction' },
    { tex: '\\hbar', text: t`$h/2\pi = 1.055\times10^{-34}$ J s $= 6.582\times10^{-16}$ eV s` },
    { tex: '\\Gamma', text: 'the natural width of an energy level or a particle’s mass: the full width at half height of its line' },
    { tex: '\\tau', text: 'the mean life of the state' },
  ],
  why: 'The uncertainty principle sets the size of atoms, keeps helium liquid at absolute zero, gives every molecule a vibration it cannot lose, and lets particle physicists measure lifetimes of 10⁻²⁵ s that no clock could time.',
  visual: {
    type: 'mp-packet',
    title: 'Squeeze a packet',
    lead: t`Top: where the particle may be found, $|\psi(x)|^2$. Bottom: the spread of its wavenumbers $|\phi(k)|^2$ — of its momenta, since $p = \hbar k$. The shaded bands span one standard deviation each side. Squeeze one and the other spreads.`,
    tasks: [
      'Drag Δx from 2 down to 0.3: the position curve narrows and the wavenumber curve widens, and Δx·Δk stays at 0.500.',
      'Switch to the ground state of a box: Δx·Δk becomes 0.568, at every width. The two-sided exponential gives 0.707. No shape goes below ½.',
      'Compare the tails of |φ(k)|²: the box’s hard edges and the exponential’s sharp peak need long tails of high wavenumbers, which is what raises their products.',
    ],
    params: { view: 'xk', shape: 'gauss', dx: 1 },
  },
  example: {
    prompt: t`Estimate the size and energy of a hydrogen atom from the uncertainty principle. Suppose the electron is held within a distance $r$ of the proton, so that its momentum is of order $\hbar/r$. Which $r$ makes the total energy smallest, and what is that energy?`,
    visual: hydrogen(),
    steps: [
      { label: 'The energy', text: t`Kinetic energy $p^2/2m_e \approx \hbar^2/2m_er^2$, and the Coulomb potential energy $-ke^2/r$ with $ke^2 = e^2/4\pi\varepsilon_0 = 1.440$ eV nm: $\;E(r) \approx \dfrac{\hbar^2}{2m_er^2} - \dfrac{ke^2}{r}$.` },
      { label: 'Minimise', text: t`$\dfrac{dE}{dr} = -\dfrac{\hbar^2}{m_er^3} + \dfrac{ke^2}{r^2} = 0$ gives $r = \dfrac{\hbar^2}{m_eke^2} = \dfrac{(1.055\times10^{-34})^2}{(9.109\times10^{-31})(${tex(KE2_JM, 4)})}\ \text{m} = ${fmt(R_EST * 1e9, 4)}$ nm — the Bohr radius $a_0$.` },
      { label: 'The energy there', text: t`$E(a_0) = ${fmt(KIN_A0, 3)}\ \text{eV} - ${fmt(POT_A0, 3)}\ \text{eV} = ${fmt(E_EST, 3)}$ eV: hydrogen’s ground state energy. Squeezing harder costs more kinetic energy than it gains in potential energy, which is why the electron does not fall onto the proton.` },
      { label: 'How good is it?', text: t`The perfect agreement is partly luck. Take instead the smallest momentum the principle allows, $p = \hbar/2r$, and the same steps give $r = a_0/4$ and $E = ${fmt(E_QUARTER, 3)}$ eV. An estimate like this fixes the scale — tenths of a nanometre, tens of eV — not the factor in front; the Schrödinger equation gives the exact answer.` },
      { label: 'Sense check', text: t`The true ground state has $\Delta x = a_0$ and $\Delta p_x = \hbar/(\sqrt3\,a_0)$, so $\Delta x\,\Delta p_x = \hbar/\sqrt3 = ${fmt(1 / Math.sqrt(3), 3)}\hbar$ — above $\hbar/2$, as every state must be.` },
    ],
    answer: t`$r \approx a_0 = ${fmt(R_EST * 1e9, 4)}$ nm and $E \approx ${fmt(E_EST, 3)}$ eV — right to the digit, partly by luck: the estimate is good for the scale, not the factor.`,
  },
  practice: [
    mcq({
      id: 'gaussian-min', difficulty: 1,
      prompt: 'Try each packet shape at several widths, and multiply the spreads shown. Which statement is true?',
      choices: [
        'Only the Gaussian reaches Δx·Δp = ħ/2; the box and the exponential stay above it at every width',
        'The box reaches the smallest product, since it confines the particle completely',
        'Every shape gives exactly ħ/2: the uncertainty relation is an equality',
        'The product can be made as small as you like by squeezing the packet narrower',
      ],
      answer: 0,
      why: {
        1: 'Confining the particle sharply needs the box’s hard edges, which put long tails into |φ(k)|²: its product is 0.568ħ.',
        2: 'It is an inequality. The box gives 0.568ħ and the exponential 0.707ħ; only the Gaussian gives exactly ħ/2.',
        3: 'Squeezing the packet narrows Δx but widens Δk in proportion: the product stays fixed for each shape.',
      },
      hints: ['Change only the width first: does the product change? Then change only the shape.'],
      teach: 'The bound ħ/2 is reached only by a Gaussian packet; every other shape has a larger product, whatever its width.',
      explain: t`For each shape, $\Delta x\,\Delta k$ is fixed — Gaussian $0.500$, box $0.568$, exponential $0.707$ — because narrowing a shape stretches its $\phi(k)$ by the same factor. With $p = \hbar k$, $\Delta x\,\Delta p_x = 0.500\hbar$, $0.568\hbar$ and $0.707\hbar$. The Gaussian alone sits on the bound, which is why it is called the minimum-uncertainty packet.`,
      visual: { type: 'mp-packet', params: { view: 'xk', shape: 'box', dx: 1, controls: ['shape', 'dx'], hide: ['product'] }, caption: 'Position and wavenumber spreads for three packet shapes. Choose a shape and a width; the readout gives Δx and Δk, but not their product.' },
    }),
    multi({
      id: 'allowed-states', difficulty: 2,
      prompt: 'Five electron states are claimed, each with its position spread and momentum spread along x. Which of them can exist?',
      choices: STATES.map(([dx, dp]) => t`$\Delta x = ${dx}$ nm, $\Delta p_x = ${tex(dp * 1e-25, 2)}$ kg m/s`),
      answer: STATES.map((s, i) => [i, ratio(s)]).filter(([, q]) => q >= 0.5).map(([i]) => i),
      why: Object.fromEntries(STATES.map((s, i) => [i, ratio(s) >= 0.5
        ? t`Allowed: $\Delta x\,\Delta p_x = ${fmt(ratio(s), 3)}\hbar$, at or above $\hbar/2$.`
        : t`Impossible: $\Delta x\,\Delta p_x = ${fmt(ratio(s), 3)}\hbar$, below $\hbar/2$.`])),
      hints: [t`Multiply each pair and compare with $\hbar/2 = 5.27\times10^{-35}$ J s.`],
      teach: 'A state is possible only if Δx·Δp ≥ ħ/2 — no matter how the two spreads are shared out.',
      explain: t`The products $\Delta x\,\Delta p_x$, in units of $\hbar$: ${STATES.map((s) => t`${s[0]} nm → $${fmt(ratio(s), 3)}$`).join('; ')}. The states with $\Delta x = 0.5$ nm and $0.05$ nm fall below $\tfrac12$ and cannot exist; the one with $\Delta x = 1$ nm, at ${fmt(ratio(STATES[4]), 3)}, is close to a Gaussian packet. A small $\Delta x$ is no problem in itself — it only has to be paid for with a large $\Delta p_x$.`,
      visual: forbidden,
    }),
    num({
      id: 'confinement', difficulty: 2,
      gen(r) {
        const [L, what] = r.pick([[0.2, 'about the width of an atom'], [0.5, 'about the size of a small molecule'], [1.0, 'about the length of the chain of a dye molecule']]);
        const dp = H / (2 * L * 1e-9), E = (dp * dp) / (2 * ME) / QE;
        return {
          prompt: t`An electron is confined in a box ${L} nm wide, ${what}. In its lowest state its average momentum is zero and its momentum spread is exactly $\Delta p = \pi\hbar/L = h/2L$. What is its kinetic energy $\langle p^2\rangle/2m_e$, in eV?`,
          answer: E, units: 'eV', tol: { rel: 0.01 },
          errors: [
            { value: E / (Math.PI * Math.PI), feedback: t`That uses $\Delta p = \hbar/L$. The box’s ground state has $\Delta p = \pi\hbar/L = h/2L$.` },
            { value: 4 * E, feedback: t`That uses $\Delta p = h/L$. The spread is $h/2L$.` },
          ],
          hints: [t`With $\langle p\rangle = 0$, $\langle p^2\rangle = (\Delta p)^2$, so the kinetic energy is $(\Delta p)^2/2m_e = h^2/8m_eL^2$.`],
          teach: 'Confinement costs energy: an electron in a box of width L has at least h²/8mL² of kinetic energy, more the smaller the box.',
          explain: t`$\Delta p = \dfrac{6.626\times10^{-34}}{2\times${L}\times10^{-9}} = ${tex(dp, 3)}$ kg m/s, so $E = \dfrac{(\Delta p)^2}{2m_e} = ${tex(E * QE, 3)}$ J $= ${fmt(E, 3)}$ eV. The uncertainty bound alone would give ${fmt((0.5 / BOX_PRODUCT) ** 2, 2)} of this, since the box’s $\Delta x\,\Delta p$ is $0.568\hbar$, not $0.5\hbar$. Energies of a few eV for nanometre boxes are why dye molecules and quantum dots absorb visible light.`,
          visual: still({ shape: 'box', dx: 1 }, 'The ground state of a box (dimensionless units): |ψ|² vanishes at the walls (top), and its spread of wavenumbers is broad, with long tails (bottom).'),
        };
      },
    }),
    num({
      id: 'zero-point', difficulty: 3,
      gen(r) {
        const [name, wn] = r.pick(Object.entries(MOLECULES)), f = C * wn * 100, E = (H * f) / 2 / QE;
        return {
          prompt: t`A ${name} molecule vibrates like a mass on a spring at $f = ${tex(f, 4)}$ Hz. With the potential energy $\tfrac12m\omega^2x^2$ and the kinetic energy $p^2/2m$, the uncertainty principle forbids it from sitting still at the bottom of the well. Find the smallest energy it can have, in eV.`,
          answer: E, units: 'eV', tol: { rel: 0.01 },
          errors: [
            { value: 2 * E, feedback: t`That is $hf$, the energy of one vibrational step. The lowest state has half of it.` },
            { value: E / (2 * Math.PI), feedback: t`That is $\hbar f/2$: use $\hbar\omega/2$ with $\omega = 2\pi f$, which is $hf/2$.` },
          ],
          hints: [
            t`Take $\Delta p = \hbar/2\Delta x$, the smallest allowed: $E(\Delta x) = \dfrac{\hbar^2}{8m(\Delta x)^2} + \dfrac12m\omega^2(\Delta x)^2$.`,
            t`Minimise: $(\Delta x)^2 = \hbar/2m\omega$, and then $E = \tfrac12\hbar\omega = \tfrac12hf$. You never need the mass.`,
          ],
          teach: 'An oscillator can never lose its zero-point energy ħω/2 — and for the oscillator the uncertainty estimate is exact, because its ground state is a Gaussian.',
          explain: t`$E = \tfrac12hf = \tfrac12(6.626\times10^{-34})(${tex(f, 4)})\ \text{J} = ${tex(E * QE, 3)}$ J $= ${fmt(E, 3)}$ eV. This is a strict lower bound: $\langle p^2\rangle \ge (\Delta p)^2$ and $\langle x^2\rangle \ge (\Delta x)^2$, and the minimum is reached by a Gaussian — the oscillator’s true ground state. It is measurable: the H₂ well is 4.75 eV deep, but breaking the molecule from its ground state takes only 4.48 eV; the 0.27 eV difference is its zero-point energy.`,
          visual: oscillator,
        };
      },
    }),
    num({
      id: 'resonance-life', difficulty: 2,
      gen(r) {
        const R = r.pick(RESONANCES), tau = HBAR_EVS / (R.G * 1e6);
        const [wn, wu] = widthText(R).split(' ');
        return {
          prompt: t`Tuning the collision energy across the mass of ${R.name} shows a peak of full width $\Gamma = ${wn}\ \text{${wu}}$. What is the particle’s mean life, in seconds?`,
          answer: tau, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 2 * Math.PI * tau, feedback: t`Use $\hbar = 6.582\times10^{-16}$ eV s, not $h$: $\tau = \hbar/\Gamma$.` }],
          hints: [t`$\tau = \hbar/\Gamma$ with $\hbar = 6.582\times10^{-22}$ MeV s.`],
          teach: 'A width is a lifetime in disguise: τ = ħ/Γ, which is how lifetimes far too short for any clock are measured.',
          explain: t`$\tau = \dfrac{6.582\times10^{-22}\ \text{MeV s}}{${nice(R.G, 4)}\ \text{MeV}} = ${tex(tau, 3)}$ s. Even at the speed of light it would travel only $c\tau = ${R.key === 'J/ψ' ? `${fmt(C * tau * 1e12, 2)}\\ \\text{pm}` : `${fmt(C * tau * 1e15, 2)}\\ \\text{fm}`}$ before decaying — no detector could follow it. The width of the peak is the only way to see a life that short.`,
          visual: resonance(R),
        };
      },
    }),
    mcq({
      id: 'energy-time', difficulty: 2,
      prompt: 'An excited state lives a mean time τ before emitting a photon. What does the energy–time relation Γ = ħ/τ tell you?',
      choices: [
        'The state’s energy is blurred by about ħ/τ, so the shorter it lives, the broader the spectral line its decay emits',
        'Energy conservation may be broken by ΔE for a time ħ/ΔE, so the photon may carry more energy than the state had',
        'A short-lived state has a sharper line, since it decays before its energy can drift',
        'Δt is the uncertainty in reading a clock, just as Δx is in reading a position, so the moment of the decay is blurred by ħ/ΔE',
      ],
      answer: 0,
      why: {
        1: 'Energy is conserved in every decay. The photons’ energies are spread because the state itself has no single sharp energy — not because energy is borrowed.',
        2: 'Backwards: a short wave train contains a broad spread of frequencies, so short-lived states give broad lines.',
        3: 'Time is not something a state has a spread in, the way it has a spread in position. Here Δt is the lifetime — the time over which the state changes appreciably.',
      },
      hints: ['The decaying state emits a wave train lasting about τ. What did the last lesson say about the spread of frequencies in a short wave train?'],
      teach: 'Short-lived states have broad energies: Γ = ħ/τ is the natural width of the line a state of lifetime τ emits.',
      explain: t`A state that lasts a time $\tau$ emits a wave train about $\tau$ long, and a train that short contains frequencies spread by about $1/2\pi\tau$ — energies spread by $\hbar/\tau$. Atomic states lasting nanoseconds give lines a few parts in $10^{8}$ of their energy wide; a particle that lasts $6\times10^{-24}$ s, like the Δ(1232), is more than a hundred MeV wide.`,
      visual: decayTrain,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mossbauer', difficulty: 3, transfer: true,
      prompt: t`An iron-57 nucleus in a crystal can emit a 14.4 keV gamma ray that another iron-57 nucleus absorbs only if their energies match within the natural width $\Gamma$ of the line. The excited state’s mean life is ${fmt(FE57_TAU * 1e9, 4)} ns (its half-life is 98.3 ns). Pound and Rebka sent such gamma rays up a ${PR.h} m tower to measure gravity’s fractional energy shift $gh/c^2$. How large is the shift $E\,gh/c^2$ as a fraction of $\Gamma$? ($g = 9.81\ \text{m/s}^2$.)`,
      answer: PR.q, tol: { rel: 0.01 },
      errors: [
        { value: PR.q * Math.LN2, feedback: t`Use the mean life ${fmt(FE57_TAU * 1e9, 4)} ns, not the half-life: $\Gamma = \hbar/\tau$.` },
        { value: PR.q / (2 * Math.PI), feedback: t`$\Gamma = \hbar/\tau$, with $\hbar$, not $h$.` },
      ],
      hints: [t`$\Gamma = \hbar/\tau = (6.582\times10^{-16}\ \text{eV s})/(${fmt(FE57_TAU * 1e9, 4)}\times10^{-9}\ \text{s})$.`, t`Shift $= (14.4\times10^3\ \text{eV})\times(9.81)(${PR.h})/(3.00\times10^8)^2$; divide it by $\Gamma$.`],
      teach: 'A long-lived nuclear state has an extraordinarily narrow line — narrow enough to weigh a photon climbing a building.',
      explain: t`$\Gamma = ${tex(PR.G, 3)}$ eV, only $${tex(PR.G / (FE57_KEV * 1e3), 2)}$ of the gamma ray’s energy. The shift is $${tex(PR.shift, 3)}$ eV, and the ratio of the two is ${fmt(PR.q, 3)}: they had to find the centre of the line to better than 1% of its width. They did it by Doppler-shifting the source, moving it at speeds comparable to $gh/c = ${fmt((G0 * PR.h) / C * 1e6, 2)}$ μm/s, and confirmed Einstein’s prediction to 10% (1% by 1964).`,
      visual: tower,
    }),
    num({
      id: 'cp-neutron-bounce', difficulty: 3, transfer: true,
      prompt: t`In 2002, ultracold neutrons flying along a horizontal mirror at the Institut Laue–Langevin were found to be trapped by gravity in quantum states. Estimate the height of the lowest state: if a neutron is spread over a height $z$ above the mirror, its vertical momentum is of order $\hbar/z$, so $E(z) \approx \dfrac{\hbar^2}{2m_nz^2} + m_ngz$. Which $z$ makes this smallest, in μm? ($m_n = 1.675\times10^{-27}$ kg, $g = 9.81\ \text{m/s}^2$.)`,
      answer: zBounce() * 1e6, units: 'μm', tol: { rel: 0.01 },
      errors: [{ value: Z0 * 1e6, feedback: t`Check the derivative: $\dfrac{d}{dz}\dfrac{\hbar^2}{2m_nz^2} = -\dfrac{\hbar^2}{m_nz^3}$, so $z^3 = \hbar^2/m_n^2g$.` }],
      hints: [t`Set $dE/dz = -\dfrac{\hbar^2}{m_nz^3} + m_ng = 0$.`, t`$z = \left(\dfrac{\hbar^2}{m_n^2g}\right)^{1/3} = \left(\dfrac{(1.055\times10^{-34})^2}{(1.675\times10^{-27})^2(9.81)}\right)^{1/3}$ m.`],
      teach: 'Gravity, with the uncertainty principle, makes a quantum well for neutrons a few micrometres tall.',
      explain: t`$z = \left(\dfrac{\hbar^2}{m_n^2g}\right)^{1/3} = ${fmt(zBounce() * 1e6, 3)}$ μm. The exact ground state (from the Schrödinger equation) has energy ${fmt(E1_PEV, 3)} peV and reaches up to ${fmt(Z1_UM, 3)} μm, and the experiment found that no neutrons got through a gap narrower than about 15 μm — the estimate is right in scale. Classically, neutrons skimming the mirror would pass through any gap.`,
      visual: bounce,
    }),
    mcq({
      id: 'cp-meaning', difficulty: 2,
      prompt: 'Classically an electron spiralling onto a proton could release unlimited energy. What does quantum mechanics say stops it?',
      choices: [
        'Squeezing it into a smaller region raises its kinetic energy faster than its potential energy falls, so the energy is lowest at a finite size',
        'At very short distances the proton’s attraction turns into a repulsion that holds the electron off',
        'The electron cannot be observed that close to the proton, so quantum mechanics forbids it from being there',
        'Like a planet round the Sun, the electron moves too fast sideways to fall in',
      ],
      answer: 0,
      why: {
        1: 'The Coulomb attraction only grows as r shrinks. The strong force, which acts in nuclei, does not act on electrons at all.',
        2: 'The uncertainty principle is not about what can be observed: it limits the spreads the state itself can have, whether or not anyone looks.',
        3: 'A classical orbiting charge radiates and spirals in within about 10⁻¹¹ s — that is the problem, not the answer.',
      },
      hints: ['Compare how the kinetic energy of confinement and the Coulomb energy grow as r shrinks.'],
      teach: 'Atoms have a size because squeezing an electron costs more kinetic energy (∝ 1/r²) than it gains in potential energy (∝ 1/r).',
      explain: t`With $p \sim \hbar/r$ the energy is about $\hbar^2/2m_er^2 - ke^2/r$. As $r \to 0$ the $1/r^2$ term wins, so the energy has a minimum, near $r = a_0 = 0.053$ nm and $E = -13.6$ eV. Classically nothing stops the collapse; quantum mechanically there is no lower state to fall into.`,
      visual: hydrogen({ ask: true }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §7.2 (the Heisenberg uncertainty principle)', url: 'https://openstax.org/books/university-physics-volume-3/pages/7-2-the-heisenberg-uncertainty-principle' },
    { label: 'Pound & Rebka (1960), Apparent weight of photons, Phys. Rev. Lett. 4, 337', url: 'https://doi.org/10.1103/PhysRevLett.4.337' },
    { label: 'Nesvizhevsky et al. (2002), Quantum states of neutrons in the Earth’s gravitational field, Nature 415, 297', url: 'https://doi.org/10.1038/415297a' },
    { label: 'Particle Data Group (2024), Review of Particle Physics: Z, J/ψ and Δ(1232) widths', url: 'https://pdg.lbl.gov/' },
    { label: 'NIST Chemistry WebBook: constants of diatomic molecules (Huber & Herzberg)', url: 'https://webbook.nist.gov/chemistry/' },
  ],
});
