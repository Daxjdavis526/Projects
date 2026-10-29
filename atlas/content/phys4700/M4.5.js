// The generalized uncertainty principle (Griffiths & Schroeter §3.5).
// phys4700.M2.4 derived Robertson's σ_A σ_B ≥ |⟨[A, B]⟩|/2 and checked
// x and p; this lesson takes it further: the term the proof throws away
// (Schrödinger's covariance term, which rescues states Robertson says
// nothing about), compatible observables, why the minimum-uncertainty
// condition needs a real constant, and the energy–time relation read
// honestly — Mandelstam–Tamm: Δt = σ_Q/|d⟨Q⟩/dt|, the time for ⟨Q⟩ to move by
// one σ_Q. Explore: a two-state superposition in a 1 nm well, where the
// bound is met to within 1 % by a slightly disturbed ground state. Lifetimes and linewidths
// (H 2p, Na and Rb D2), Ramsey fringes in caesium fountains, the Z and W
// widths. Every number is computed here.
import { lesson, mcq, multi, num, order } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, H, QE, blochPic, argand, r6 } from './_qm.js';
import { T0, HBAR_EVFS } from './_wells.js';

const t = String.raw;
const D = Math.PI / 180;
const X12 = -16 / (9 * Math.PI * Math.PI);          // ⟨ψ₁|x|ψ₂⟩ / L in the infinite well
const X11 = 1 / 3 - 1 / (2 * Math.PI ** 2);         // ⟨ψ₁|x²|ψ₁⟩ / L²
const X22 = 1 / 3 - 1 / (8 * Math.PI ** 2);         // ⟨ψ₂|x²|ψ₂⟩ / L²   (⟨ψ₁|x²|ψ₂⟩/L² equals X12 too)
const dE1 = 3 * Math.PI * Math.PI * T0;             // E₂ − E₁ for an electron in a 1 nm well, eV
const W1 = dE1 / HBAR_EVFS;                         // its angular frequency, fs⁻¹

/** ⟨x⟩ ± σₓ against time for cos α ψ₁ + sin α ψ₂ in a well L nm wide (static α in degrees, or the slider key 'a'). */
function slosh(L, a, tmax) {
  const s2 = `sin(2*${a}*pi/180)`, c2 = `cos(${a}*pi/180)^2`, ss = `sin(${a}*pi/180)^2`, w = r6(W1 / (L * L));
  const mean = `${L}*(0.5 + ${s2}*(${r6(X12)})*cos(${w}*x))`;
  const sd = `${L}*sqrt(${c2}*${r6(X11)} + ${ss}*${r6(X22)} + ${s2}*(${r6(X12)})*cos(${w}*x) - (0.5 + ${s2}*(${r6(X12)})*cos(${w}*x))^2)`;
  return {
    mean, sd,
    curves: [{ fn: mean, color: 'accent', width: 2.6 }, { fn: `${mean} + ${sd}`, color: 'accent', width: 1.2, dash: [5, 4] }, { fn: `${mean} - ${sd}`, color: 'accent', width: 1.2, dash: [5, 4] }],
    shade: [{ fn: `${mean} + ${sd}`, lower: `${mean} - ${sd}`, from: 0, to: tmax, color: 'accent', alpha: 0.13 }],
  };
}
const sloshPic = (L, a, caption) => {
  const tmax = r6(2.2 * 2 * Math.PI / (W1 / (L * L)));
  const S = slosh(L, a, tmax);
  return { type: 'graph', params: { x: [0, tmax], y: [0, L], aspect: 'wide', xlabel: 't (fs)', ylabel: 'x (nm)', xticks: 6, yticks: 4, axesAt: 'edge', curves: S.curves, shade: S.shade, legend: [{ label: '⟨x⟩', color: 'accent' }, { label: '⟨x⟩ ± σₓ', color: 'accent', dash: [5, 4] }], legendAt: 'tr' }, caption };
};

/** A Lorentzian line of FWHM 1 (in units of the width), centred on zero. */
const lorentz = (caption, shadeHalf = false) => ({
  type: 'graph',
  params: {
    x: [-4, 4], y: [0, 1.15], aspect: 'wide', xlabel: 'detuning (units of the linewidth Γ/h)', ylabel: 'relative strength', xticks: 8, yticks: 2, axesAt: 'edge',
    curves: [{ fn: '1/(1 + 4*x^2)', color: 'accent', width: 2.4 }],
    shade: [{ fn: '1/(1 + 4*x^2)', from: -4, to: 4, color: 'accent', alpha: 0.12 }],
    arrows: shadeHalf ? [] : [{ from: [-0.5, 0.5], to: [0.5, 0.5], color: 'gold', width: 2 }, { from: [0.5, 0.5], to: [-0.5, 0.5], color: 'gold', width: 2 }],
  },
  caption,
});

const ATOMS = [
  ['hydrogen’s 2p level (the Lyman-α line, 121.6 nm)', 1.5962e-9, 121.567e-9],
  ['sodium’s 3p₃/₂ level (the yellow D₂ line, 589.0 nm)', 16.2492e-9, 588.995e-9],
  ['rubidium-87’s 5p₃/₂ level (the D₂ line used in laser cooling, 780.2 nm)', 26.2348e-9, 780.241e-9],
];

export default lesson({
  id: 'phys4700.M4.5',
  title: 'The generalized uncertainty principle',
  minutes: 17, difficulty: 3,
  intro: t`For any two observables, Robertson’s inequality bounds the product of their spreads by their commutator. Its proof throws a term away; keeping it gives Schrödinger’s stronger form, which still bites when the commutator’s average vanishes. Observables that commute are **compatible**: they share a complete set of eigenfunctions and can both be sharp at once. Time is not an observable — there is no time operator — yet a true energy–time relation follows when $B$ is the Hamiltonian:

$$\begin{gathered} \sigma_A^2\sigma_B^2 \ge \Big(\frac{1}{2i}\langle[\hat A, \hat B]\rangle\Big)^2 \\ \sigma_H\,\Delta t \ge \frac{\hbar}{2}\ \ \text{with}\ \ \Delta t \equiv \frac{\sigma_Q}{|d\langle Q\rangle/dt|} \end{gathered}$$

$\Delta t$ is the time it takes the average of **some** observable $Q$ to move by one standard deviation: a state with a sharp energy changes slowly, and a state that changes fast must have a spread of energies.`,
  symbols: [
    { tex: '\\sigma_A,\\ \\sigma_B', text: t`the standard deviations of results of measuring $A$ and $B$ on identically prepared systems` },
    { tex: '[\\hat A, \\hat B]', text: t`the commutator $\hat A\hat B - \hat B\hat A$; for Hermitian operators $\tfrac{1}{2i}\langle[\hat A, \hat B]\rangle$ is real` },
    { tex: '\\sigma_H', text: 'the spread of energy in the state, in J (or eV)' },
    { tex: '\\Delta t', text: t`the time for $\langle Q\rangle$ to change by one $\sigma_Q$, in s — a property of the state’s evolution, not a measured “uncertainty in time”` },
    { tex: 'Q', text: 'any observable with no explicit time dependence: position, a dipole moment, a spin component' },
    { tex: '\\hbar', text: t`the reduced Planck constant, $${tex(HBAR, 5)}$ J s $= ${fmt(HBAR_EVFS, 6)}$ eV fs` },
  ],
  why: 'The energy–time relation sets the natural width of every spectral line, the shortest possible laser pulse for a given bandwidth, and the resolution of atomic clocks.',
  visual: {
    type: 'graph',
    title: 'How fast can a state change?',
    lead: t`An electron in a 1 nm infinite well, in $\cos\alpha\,\psi_1 + \sin\alpha\,\psi_2$. Its average position sloshes at $\omega = (E_2 - E_1)/\hbar$; the band is $\langle x\rangle \pm \sigma_x$. Move the time marker and the mixing angle, and watch the readouts: the product $\sigma_H\,\Delta t$ never drops below $\hbar/2$.`,
    tasks: [
      t`At $\alpha = 45^\circ$ the energy spread is largest, $\sigma_H = 0.564$ eV. Put the marker where $\langle x\rangle$ moves fastest ($t \approx 0.9$ fs): $\sigma_H\,\Delta t$ is $1.26$ times $\hbar/2$.`,
      t`Shrink $\alpha$ to $5^\circ$: $\sigma_H$ falls and $\langle x\rangle$ barely moves, but $\Delta t$ grows to match — at the fastest moment the product is within 1% of $\hbar/2$. At $\alpha = 0$ the state is stationary and nothing changes at all.`,
      'Near t = 0 and every half period, ⟨x⟩ is momentarily still: Δt is long there, and the inequality is far from tight.',
    ],
    params: {
      x: [0, 8], y: [0, 1], aspect: 'wide', xlabel: 't (fs)', ylabel: 'x (nm)', xticks: 8, yticks: 4, axesAt: 'edge',
      sliders: [
        { key: 'a', label: t`Mixing angle $\alpha$`, min: 0, max: 90, step: 5, value: 45, unit: '^\\circ', explain: t`The state is $\cos\alpha\,\psi_1 + \sin\alpha\,\psi_2$: $\alpha = 0$ is the ground state, $45^\circ$ an equal mixture.` },
        { key: 'tt', label: t`Time $t$`, min: 0.05, max: 7.95, step: 0.05, value: 0.9, unit: '\\text{fs}', explain: t`When to read off $\langle x\rangle$, $\sigma_x$ and how fast $\langle x\rangle$ is changing.` },
      ],
      curves: slosh(1, 'a', 8).curves,
      shade: slosh(1, 'a', 8).shade,
      vlines: [{ x: 'tt', color: 'gold' }],
      readouts: [
        { label: t`$\sigma_H$ (eV)`, expr: `${r6(dE1 / 2)}*abs(sin(2*a*pi/180))`, digits: 3 },
        { label: t`$\Delta t = \sigma_x/|d\langle x\rangle/dt|$ (fs)`, expr: `(${slosh(1, 'a', 8).sd.replace(/x\)/g, 'tt)')})/(abs(sin(2*a*pi/180)*(${r6(X12)})*${r6(W1)}*sin(${r6(W1)}*tt)) + 1e-9)`, digits: 3 },
        { label: t`$\sigma_H\,\Delta t\ /\ (\hbar/2)$`, expr: `(${slosh(1, 'a', 8).sd.replace(/x\)/g, 'tt)')})/(abs((${r6(X12)})*sin(${r6(W1)}*tt)) + 1e-9)*step(sin(2*a*pi/180) - 0.001)`, digits: 4 },
      ],
    },
    caption: t`Exact for an infinite well 1 nm wide, $E_2 - E_1 = ${fmt(dE1, 4)}$ eV, period $${fmt(2 * Math.PI / W1, 4)}$ fs. The last readout is $\sigma_x/(|x_{12}|\,|\sin\omega t|)$ with $x_{12} = -16L/9\pi^2$; it reads 0 for a stationary state, where both sides of the inequality vanish.`,
  },
  example: {
    prompt: t`Derive the energy–time relation $\sigma_H\,\Delta t \ge \hbar/2$ from Robertson’s inequality, then apply it to the equal mixture $(\psi_1 + \psi_2)/\sqrt2$ of an electron in a 1 nm infinite well.`,
    visual: sloshPic(1, 45, t`$\langle x\rangle$ and $\langle x\rangle \pm \sigma_x$ for $(\psi_1 + \psi_2)/\sqrt2$ in a 1 nm well. The average swings by $2|x_{12}| = ${fmt(2 * Math.abs(X12), 3)}$ nm each half period.`),
    steps: [
      { label: 'Rate of change', text: t`For $\hat Q$ with no explicit time dependence, the Schrödinger equation $i\hbar\,\partial_t\Psi = \hat H\Psi$ and Hermiticity of $\hat H$ give $\dfrac{d\langle Q\rangle}{dt} = \dfrac{i}{\hbar}\langle[\hat H, \hat Q]\rangle$. (The next lessons make this the backbone of the Heisenberg picture.)` },
      { label: 'Use Robertson', text: t`With $\hat A = \hat H$ and $\hat B = \hat Q$: $\sigma_H\sigma_Q \ge \Big|\dfrac{1}{2i}\langle[\hat H, \hat Q]\rangle\Big| = \dfrac{\hbar}{2}\Big|\dfrac{d\langle Q\rangle}{dt}\Big|$.` },
      { label: 'Define the time', text: t`Divide by $|d\langle Q\rangle/dt|$ and call $\Delta t \equiv \sigma_Q/|d\langle Q\rangle/dt|$: then $\sigma_H\,\Delta t \ge \hbar/2$. No time operator was needed, and $\Delta t$ depends on which $Q$ you watch; the bound holds for all of them.` },
      { label: 'Energy spread', text: t`Energies $E_1$ and $E_2$ with probability $\tfrac12$ each: $\sigma_H = \tfrac12(E_2 - E_1) = \tfrac12\times${fmt(dE1, 4)} = ${fmt(dE1 / 2, 4)}$ eV.` },
      { label: 'The bound', text: t`$\Delta t \ge \hbar/2\sigma_H = ${fmt(HBAR_EVFS, 5)}/(2\times${fmt(dE1 / 2, 4)}) = ${fmt(HBAR_EVFS / dE1, 4)}$ fs. The slosh period is $2\pi\hbar/(E_2 - E_1) = ${fmt(2 * Math.PI / W1, 4)}$ fs, so $\langle x\rangle$ cannot move a whole $\sigma_x$ in less than about a sixth of a period. At its fastest it takes $1.26$ times that bound: the inequality is a real constraint, not a loose one.` },
      { label: 'Honest reading', text: t`The relation does **not** say energy can be borrowed for a time $\Delta t$, nor that energy measurements must take a time $\Delta t$. It says how slowly a state with a given energy spread can change. A stationary state ($\sigma_H = 0$) never changes; an excited atom with lifetime $\tau$ has a spread of energies $\Gamma = \hbar/\tau$ — its natural linewidth.` },
    ],
    answer: t`$\sigma_H\,\Delta t \ge \hbar/2$ with $\Delta t = \sigma_Q/|d\langle Q\rangle/dt|$; for the 1 nm well, $\sigma_H = ${fmt(dE1 / 2, 3)}$ eV and $\Delta t \ge ${fmt(HBAR_EVFS / dE1, 3)}$ fs.`,
  },
  practice: [
    multi({
      id: 'compatible', difficulty: 2,
      prompt: t`Which pairs of observables are **compatible** — commuting, so that a complete set of states exists in which both are sharp? Select all.`,
      choices: [t`$x$ and $p_y$`, t`$\hat L^2$ and $\hat L_z$`, t`$p$ and the free-particle $\hat H = p^2/2m$`, t`$x$ and $p_x$`, t`$\hat S_x$ and $\hat S_z$`, t`$x$ and the free-particle $\hat H$`],
      answer: [0, 1, 2],
      why: {
        3: t`$[\hat x, \hat p_x] = i\hbar$: no state has both sharp, and $\sigma_x\sigma_{p_x} \ge \hbar/2$.`,
        4: t`$[\hat S_x, \hat S_z] = -i\hbar\hat S_y$: incompatible, as the Stern–Gerlach chains showed.`,
        5: t`$[\hat x, \hat p^2] = 2i\hbar\hat p \ne 0$: a free particle with sharp energy is a plane wave, spread over all $x$.`,
      },
      hints: [t`Compute each commutator, using $[\hat x, \hat p_x] = i\hbar$ and $[\hat x, \hat p_y] = 0$.`, t`$[\hat x, \hat p^2] = \hat p[\hat x, \hat p] + [\hat x, \hat p]\hat p$.`],
      teach: 'Commuting Hermitian operators have a common eigenbasis; non-commuting ones obey a nonzero uncertainty bound.',
      explain: t`$[\hat x, \hat p_y] = 0$ (different directions), $[\hat L^2, \hat L_z] = 0$ (angular momentum algebra), and $\hat p$ commutes with any function of itself. Each compatible pair has simultaneous eigenstates: $e^{ik_yy}\delta(x - x_0)$, the $Y_l^m$, and the plane waves.`,
    }),
    num({
      id: 'slosh-bound', difficulty: 3,
      gen(r) {
        const L = r.pick([0.5, 1, 2]), a = r.pick([20, 30, 45, 60]);
        const dE = dE1 / (L * L), sH = (dE / 2) * Math.sin(2 * a * D), ans = HBAR_EVFS / (2 * sH);
        return {
          prompt: t`An electron in an infinite well $${L}$ nm wide is in $\cos ${a}^\circ\,\psi_1 + \sin ${a}^\circ\,\psi_2$, with $E_2 - E_1 = ${fmt(dE, 4)}$ eV. What is the shortest time, in fs, in which the energy–time relation allows $\langle x\rangle$ to change by one standard deviation $\sigma_x$? ($\hbar = ${fmt(HBAR_EVFS, 6)}$ eV fs.)`,
          visual: sloshPic(L, a, t`$\langle x\rangle$ and $\langle x\rangle \pm \sigma_x$ for the state in the question.`),
          answer: ans, units: 'fs', tol: { rel: 0.01 },
          errors: [{ value: HBAR_EVFS / (2 * dE / 2), feedback: t`That uses $\sigma_H = (E_2 - E_1)/2$, true only for an equal mixture. Here $\sigma_H = (E_2 - E_1)\,|\cos\alpha\sin\alpha|$.` }, { value: HBAR_EVFS / sH, feedback: t`The bound is $\hbar/2\sigma_H$ — keep the 2.` }, { value: HBAR_EVFS / (2 * dE), feedback: t`$\sigma_H$ is the spread of energy, not the gap $E_2 - E_1$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_H^2 = \langle H^2\rangle - \langle H\rangle^2$ with probabilities $\cos^2\alpha$ and $\sin^2\alpha$; it comes to $(E_2 - E_1)|\cos\alpha\sin\alpha|$.`, t`$\Delta t \ge \hbar/2\sigma_H$.`],
          teach: t`A two-level superposition has $\sigma_H = (E_2 - E_1)|\cos\alpha\sin\alpha|$, and nothing about it can change faster than $\hbar/2\sigma_H$.`,
          explain: t`$\sigma_H = ${fmt(dE, 4)}\times|\cos${a}^\circ\sin${a}^\circ| = ${fmt(sH, 4)}$ eV, so $\Delta t \ge ${fmt(HBAR_EVFS, 5)}/(2\times${fmt(sH, 4)}) = ${fmt(ans, 4)}$ fs. A wider well has closer levels and changes more slowly ($\propto L^2$); a less even mixture has a smaller energy spread and also changes more slowly.`,
        };
      },
    }),
    num({
      id: 'linewidth', difficulty: 2,
      gen(r) {
        const [name, tau, lam] = r.pick(ATOMS);
        const ans = 1 / (2 * Math.PI * tau) / 1e6;
        return {
          prompt: t`The excited state ${name} decays with a mean lifetime $\tau = ${fmt(tau * 1e9, 5)}$ ns. Its energy is spread over a Lorentzian of full width $\Gamma = \hbar/\tau$, so the emitted line has a natural width $\Delta\nu = \Gamma/h$. What is $\Delta\nu$, in MHz?`,
          visual: lorentz('A natural line shape: a Lorentzian. The gold arrow spans its full width at half maximum. Doppler and collision broadening, ignored here, are usually larger in a gas.'),
          answer: ans, units: 'MHz', tol: { rel: 0.01 },
          errors: [{ value: ans * 2 * Math.PI, feedback: t`$\Delta\nu = \Gamma/h = 1/(2\pi\tau)$: you used $\hbar$ where $h$ belongs.` }, { value: ans / 2, feedback: t`$\Gamma = \hbar/\tau$ is the full width, not the half width.` }],
          hints: [t`$\Delta\nu = \dfrac{\Gamma}{h} = \dfrac{\hbar/\tau}{2\pi\hbar} = \dfrac{1}{2\pi\tau}$.`, t`$\tau = ${fmt(tau * 1e9, 5)}\times10^{-9}$ s.`],
          teach: 'A state that lives a time τ has an energy spread Γ = ħ/τ: its spectral line has a natural width 1/(2πτ) in frequency.',
          explain: t`$\Delta\nu = 1/(2\pi\times${fmt(tau * 1e9, 5)}\ \text{ns}) = ${fmt(ans, 4)}$ MHz — a fraction $${tex(ans * 1e6 * lam / 299792458, 2)}$ of the optical frequency. Laser cooling relies on such narrow lines; the energy–time relation, with $\Delta t$ the decay time of the atom’s oscillating dipole, guarantees that a short-lived state cannot have a sharp energy.`,
        };
      },
    }),
    num({
      id: 'schrodinger-term', difficulty: 3,
      gen(r) {
        const th = r.pick([30, 45, 60, 120, 150, 20, 70]);
        const ans = 0.25 * Math.abs(Math.sin(th * D) * Math.cos(th * D));
        return {
          prompt: t`A spin ½ points along a direction in the $xz$-plane at $\theta = ${th}^\circ$ from $+z$: $|\psi\rangle = \cos\tfrac{\theta}{2}|+\rangle + \sin\tfrac{\theta}{2}|-\rangle$. Then $\langle S_x\rangle = \tfrac{\hbar}{2}\sin\theta$, $\langle S_z\rangle = \tfrac{\hbar}{2}\cos\theta$ and $\langle S_y\rangle = 0$, so Robertson’s bound $\sigma_{S_x}\sigma_{S_z} \ge \tfrac{\hbar}{2}|\langle S_y\rangle|$ is zero. What is the actual product $\sigma_{S_x}\sigma_{S_z}$, in units of $\hbar^2$?`,
          visual: blochPic({ states: [{ v: [Math.sin(th * D), 0, Math.cos(th * D)], label: '|\\psi\\rangle' }], caption: t`The state on the Bloch sphere: in the $xz$-plane, $${th}^\circ$ from $+z$. Drag to rotate.` }),
          answer: ans, units: '', tol: { rel: 0.005 },
          errors: [{ value: 0, feedback: t`Robertson’s bound is zero, but the spreads are not: $S_x^2 = S_z^2 = \hbar^2/4$ always.` }, { value: 2 * ans, feedback: t`$\sigma_{S_x} = \tfrac{\hbar}{2}|\cos\theta|$ and $\sigma_{S_z} = \tfrac{\hbar}{2}|\sin\theta|$: the product carries $\tfrac14$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`$\sigma_{S_x}^2 = \langle S_x^2\rangle - \langle S_x\rangle^2 = \tfrac{\hbar^2}{4}(1 - \sin^2\theta)$.`, t`Likewise $\sigma_{S_z} = \tfrac{\hbar}{2}|\sin\theta|$; multiply.`],
          teach: 'Robertson’s bound uses only the commutator; when its average vanishes, the spreads can still be large, and Schrödinger’s covariance term accounts for them.',
          explain: t`$\sigma_{S_x}\sigma_{S_z} = \tfrac{\hbar^2}{4}|\cos\theta\sin\theta| = ${fmt(ans, 4)}\,\hbar^2$. The term the proof dropped, $\big(\tfrac12\langle\{\hat S_x, \hat S_z\}\rangle - \langle S_x\rangle\langle S_z\rangle\big)^2$, equals $\big(\tfrac{\hbar^2}{4}\sin\theta\cos\theta\big)^2$ here (the anticommutator of two different Pauli matrices is zero), so Schrödinger’s stronger inequality is met exactly.`,
        };
      },
    }),
    mcq({
      id: 'borrow', difficulty: 2, kind: 'error',
      prompt: t`A popular article says: “The energy–time uncertainty principle lets a particle borrow an energy $\Delta E$ from nowhere, as long as it pays it back within $\hbar/2\Delta E$.” What is wrong with this?`,
      visual: sloshPic(1, 45, 'A state with a spread of energies changing in time. Its energy distribution — and so ⟨H⟩ — never changes; what changes is ⟨x⟩.'),
      choices: [
        t`$\Delta E$ is the spread of a state’s energy distribution, which is constant in time; energy is conserved exactly, and $\Delta t$ is how long the state takes to change`,
        t`Nothing; the borrowing must simply be repaid faster than $\hbar/2\Delta E$`,
        t`It should read $\hbar/\Delta E$, not $\hbar/2\Delta E$`,
        t`The principle applies only to particles moving close to the speed of light`,
      ],
      answer: 0,
      why: {
        1: t`$d\langle H\rangle/dt = \tfrac{i}{\hbar}\langle[\hat H, \hat H]\rangle = 0$, and every moment of the energy distribution is constant: nothing is borrowed at any time.`,
        2: t`The factor is not the problem: the reading of $\Delta E$ and $\Delta t$ is.`,
        3: t`It is a theorem of non-relativistic quantum mechanics, as the derivation shows.`,
      },
      hints: [t`What is $\Delta E$ in the derivation — a change of energy, or a standard deviation?`, t`Is $\langle H\rangle$, or $\sigma_H$, ever time-dependent for an isolated system?`],
      teach: t`In $\sigma_H\,\Delta t \ge \hbar/2$, $\sigma_H$ is a fixed spread of energies and $\Delta t$ is a time for something else to change; energy conservation is never suspended.`,
      explain: t`For an isolated system the probabilities $|c_n|^2$ of each energy are constant, so $\sigma_H$ is constant and no energy is ever “borrowed”. The “virtual particle” story is a loose paraphrase of perturbation theory, not of this inequality.`,
    }),
    mcq({
      id: 'why-real', difficulty: 3,
      prompt: t`In the proof, $\sigma_A^2\sigma_B^2 \ge |z|^2$ with $z = \langle f|g\rangle$, $f = (\hat A - \langle A\rangle)\Psi$ and $g = (\hat B - \langle B\rangle)\Psi$. Robertson keeps only $(\operatorname{Im}z)^2 = \big(\tfrac{1}{2i}\langle[\hat A, \hat B]\rangle\big)^2$. For $x$ and $p$, equality needs $g = c f$ (Schwarz) **and** what else?`,
      visual: argand([{ title: 'z = ⟨f|g⟩', arrows: [{ z: [0.45, 0.65], color: 'gold', label: 'z' }, { z: [0.45, 0], color: 'violet', label: 'Re z', ldy: 14 }, { z: [0, 0.65], from: [0.45, 0], color: 'accent', label: 'Im z' }], circle: 0.86 }], { caption: t`$|z|^2 = (\operatorname{Re}z)^2 + (\operatorname{Im}z)^2$. Robertson’s bound keeps only the imaginary part.` }),
      choices: [
        t`$\operatorname{Re}z = 0$, which forces $c = ia$ with $a$ real — and then $\Psi$ is a Gaussian`,
        t`$\operatorname{Im}z = 0$, so that the commutator term vanishes`,
        t`Nothing else: $g = cf$ for any complex $c$ saturates it`,
        t`$\langle x\rangle = \langle p\rangle = 0$`,
      ],
      answer: 0,
      why: {
        1: t`For $x$ and $p$, $\operatorname{Im}z = \hbar/2$ always: it is the one part that cannot vanish.`,
        2: t`Schwarz equality gives $|z|^2 = \sigma_A^2\sigma_B^2$, but dropping $(\operatorname{Re}z)^2$ is a second inequality: it is tight only if $\operatorname{Re}z = 0$.`,
        3: t`Shifting $\Psi$ in position or momentum changes neither spread; the minimal Gaussian can sit anywhere and move.`,
      },
      hints: ['There are two inequalities in the chain. Each needs its own equality condition.', t`With $g = cf$, $z = c\,\sigma_A^2$: what must $c$ be for $\operatorname{Re}z = 0$?`],
      teach: 'Equality in the uncertainty principle needs both Schwarz equality (g = cf) and a vanishing covariance term (c imaginary).',
      explain: t`$-i\hbar\Psi' - \langle p\rangle\Psi = ia(x - \langle x\rangle)\Psi$ with real $a$ integrates to $\Psi = Ae^{-a(x - \langle x\rangle)^2/2\hbar}e^{i\langle p\rangle x/\hbar}$, a Gaussian ($a > 0$ for normalizability). A complex $c$ would add a chirp, and the dropped term would no longer be zero.`,
    }),
    order({
      id: 'mt-steps', difficulty: 3,
      prompt: t`Put the steps of the energy–time derivation in order.`,
      visual: sloshPic(1, 30, 'The sloshing state again: ⟨x⟩ moves, so Δt for Q = x is finite.'),
      items: [
        t`$\dfrac{d\langle Q\rangle}{dt} = \dfrac{i}{\hbar}\langle[\hat H, \hat Q]\rangle$`,
        t`Robertson with $\hat A = \hat H$, $\hat B = \hat Q$`,
        t`$\sigma_H\sigma_Q \ge \dfrac{\hbar}{2}\Big|\dfrac{d\langle Q\rangle}{dt}\Big|$`,
        t`Define $\Delta t = \sigma_Q/|d\langle Q\rangle/dt|$`,
        t`$\sigma_H\,\Delta t \ge \hbar/2$`,
      ],
      hints: [t`Start from how expectation values change in time.`, t`Robertson turns $\langle[\hat H, \hat Q]\rangle$ into a product of spreads; only then is $\Delta t$ defined.`],
      teach: 'The energy–time relation is Robertson’s inequality with B = H, plus the rate at which ⟨Q⟩ changes.',
      explain: t`The rate formula supplies $\langle[\hat H, \hat Q]\rangle = -i\hbar\,d\langle Q\rangle/dt$; Robertson bounds it by $2\sigma_H\sigma_Q/\hbar$; dividing by the rate defines $\Delta t$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fountain', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([0.4, 0.5, 0.6, 0.8]);
        const ans = 1 / (2 * T);
        return {
          prompt: t`A caesium fountain clock — the kind that realizes the SI second and helps steer Coordinated Universal Time — tosses laser-cooled atoms up through a microwave cavity and lets them fall back through it. The two passes are $T = ${T}$ s apart, and the atoms evolve freely in between. The central Ramsey fringe they produce has a full width at half maximum of $1/(2T)$. What is that width, in Hz? (Compare the line width of an atomic beam crossing a cavity in about a millisecond.)`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [0, 1.1], aspect: 'wide', xlabel: 'detuning × 2T', ylabel: 'transition probability', xticks: 6, yticks: 2, axesAt: 'edge', curves: [{ fn: '0.5*(1 + cos(pi*x))*exp(-x^2/18)', color: 'accent', width: 2.4, samples: 2000 }] }, caption: 'Ramsey fringes against the microwave detuning, scaled by 2T. The envelope, set by the short time in the cavity, is drawn much narrower than in a real fountain.' },
          answer: ans, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: 1 / T, feedback: t`The fringe spacing is $1/T$; its full width at half maximum is half that, $1/(2T)$.` }, { value: 1 / (2 * Math.PI * T), feedback: t`The width in Hz is $1/(2T)$, with no $2\pi$.` }],
          hints: [t`$\Delta\nu = 1/(2T)$ with $T$ in seconds.`, t`The longer the atoms evolve unobserved, the narrower the fringe.`],
          teach: 'An interrogation lasting a time T resolves frequency only to about 1/T: the energy–time relation as a statement about how long a state is allowed to evolve.',
          explain: t`$\Delta\nu = 1/(2\times${T}) = ${fmt(ans, 3)}$ Hz, about $${tex(ans / 9192631770, 2)}$ of the 9 192 631 770 Hz clock frequency. Fountains toss the atoms precisely to make $T$ long: an atomic beam crossing a cavity in a millisecond has a line hundreds of times wider. Locating the centre of the fringe to a small fraction of its width is then what gives a fountain its $10^{-16}$ accuracy.`,
        };
      },
    }),
    num({
      id: 'cp-boson', difficulty: 2,
      gen(r) {
        const [name, G] = r.pick([['Z boson', 2.4955], ['W boson', 2.085]]);
        const ans = (HBAR / (G * 1e9 * QE));
        return {
          prompt: t`The ${name} is never seen directly; its mass peak in collider data has a full width $\Gamma = ${G}$ GeV (Particle Data Group, 2024). What is its mean lifetime $\tau = \hbar/\Gamma$, in seconds?`,
          visual: lorentz(t`A resonance peak: the cross-section against collision energy near the ${name} mass. Its width is $\Gamma$; schematic.`),
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: H / (G * 1e9 * QE), feedback: t`$\tau = \hbar/\Gamma$, with $\hbar$, not $h$.` }],
          hints: [t`$\hbar = ${tex(HBAR / QE, 5)}$ eV s $= ${tex(HBAR / QE / 1e9, 5)}$ GeV s.`, t`$\tau = \hbar/\Gamma$.`],
          teach: 'For a particle that decays, the width of its resonance and its lifetime are tied by Γτ = ħ.',
          explain: t`$\tau = ${tex(HBAR / QE / 1e9, 5)}\ \text{GeV s}/${G}\ \text{GeV} = ${tex(ans, 3)}$ s. Far too short to leave a track: even at the speed of light the ${name} would cover only $${tex(ans * 299792458, 2)}$ m, a small fraction of a proton’s diameter. So the width is measured instead — and it counts the ways the boson can decay${name === 'Z boson' ? ': the Z width measured at LEP fixed the number of light neutrino species at three' : ''}.`,
        };
      },
    }),
    mcq({
      id: 'cp-stationary', difficulty: 2,
      prompt: t`An atom is prepared in an exact energy eigenstate of an isolated Hamiltonian. What does the energy–time relation say about it?`,
      visual: sloshPic(1, 0, t`$\alpha = 0$: the ground state alone. $\langle x\rangle$ and $\sigma_x$ never change.`),
      choices: [
        t`$\sigma_H = 0$, so $\Delta t$ must be infinite for every observable: no expectation value ever changes`,
        t`Its energy can only be measured with infinite time, so the eigenstate cannot be prepared`,
        t`$\Delta t$ must be zero: the state changes instantly`,
        t`Nothing: the relation applies only to unstable states`,
      ],
      answer: 0,
      why: {
        1: t`The relation says nothing about how long a measurement takes; it constrains how the state evolves.`,
        2: t`$\sigma_H\,\Delta t \ge \hbar/2$ with $\sigma_H = 0$ cannot be met by any finite $\Delta t$.`,
        3: t`It applies to every state; for an eigenstate it gives the strongest conclusion of all.`,
      },
      hints: [t`What is $\sigma_H$ in an eigenstate of $\hat H$?`],
      teach: 'Stationary states have no energy spread, so nothing about them changes in time.',
      explain: t`With $\sigma_H = 0$, the inequality needs $\Delta t = \infty$: every $\langle Q\rangle$ is constant. That is just what a stationary state is — its only time dependence is an overall phase $e^{-iEt/\hbar}$. Real excited atoms decay because their coupling to the electromagnetic field makes them not quite eigenstates of the full Hamiltonian, which is where the linewidth comes from.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.5', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Mandelstam & Tamm, “The uncertainty relation between energy and time in non-relativistic quantum mechanics”, J. Phys. USSR 9, 249 (1945)', url: 'https://doi.org/10.1007/978-3-642-74626-0_8' },
    { label: 'Steck, Sodium D Line Data and Rubidium 87 D Line Data', url: 'https://steck.us/alkalidata/' },
    { label: 'Particle Data Group, Review of Particle Physics (2024): gauge bosons', url: 'https://pdg.lbl.gov/' },
  ],
});
