// The Stark effect of hydrogen's ground state (Griffiths & Schroeter §7
// problems; Bethe & Salpeter §51–52). phys4700.M8.2 treats the linear effect
// of n = 2 by degenerate perturbation theory; this lesson takes the ground
// state, where parity kills first order (phys4710.M2.3), so
// ΔE = −Σ|⟨n10|eℰz|100⟩|²/(Eₙ − E₁) = −½αℰ². The closed form of
// |⟨n10|z|100⟩|² (Bethe & Salpeter 63.?) gives the n = 2 term 2.96 a₀³ and all
// bound states 3.66 a₀³; the continuum supplies the rest of the exact
// α = (9/2)(4πε₀)a₀³ (Dalgarno–Lewis), and Unsöld's closure bound gives
// α ≤ 2⟨z²⟩/(E₂ − E₁) = 16/3. α/4πε₀ = 0.667 Å³; shifts of h × 5.6 MHz at
// 10⁷ V/m. Transfers: selective field ionization of Rydberg atoms
// (ℰ = 1/16n⁴ atomic units, over the saddle); the blackbody Stark shift of the
// caesium clock (⟨ℰ²⟩ = aT⁴/ε₀, (831.9 V/m)² at 300 K; static coefficient
// −2.3 × 10⁻¹⁰ Hz/(V/m)², Robyr et al. 2014). CODATA 2022.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { CS_HFS } from '../phys4700/_qm.js';
import { H, QE, A0, EPS0, EH, r6, seg, label, z2n, hLevelsPic } from './_q2.js';
import { SIGMA, C } from '../phys2710/_constants.js';

const t = String.raw;
const ALPHA_AU = 4.5;                                    // exact, non-relativistic, infinite nuclear mass
const ALPHA_SI = 4 * Math.PI * EPS0 * ALPHA_AU * A0 ** 3;   // C m² / V
const EAT = EH / A0;                                     // V/m: the atomic unit of field, e/(4πε₀a₀²)
const term = (n) => (2 * z2n(n)) / (0.5 - 0.5 / (n * n));   // a₀³
let BOUND = 0;
for (let n = 2; n < 4000; n++) BOUND += term(n);
const T2 = term(2);
const shiftHz = (E) => (0.5 * ALPHA_SI * E * E) / H;     // Hz (magnitude)
const KBBR = 2.3e-10;                                    // Hz/(V/m)², Cs clock static Stark coefficient (magnitude, Robyr et al. 2014)
const E2_300 = (4 * SIGMA / C) * 300 ** 4 / EPS0;        // (V/m)², mean square blackbody field at 300 K

/** The contributions 2|z_n1|²/(Eₙ − E₁) as stems at n = 2…12, with optional partial-sum line and reference lines. */
function sumPic({ slider = false, caption, refs = true } = {}) {
  const curves = [];
  for (let n = 2; n <= 12; n++) curves.push(seg(n, 0, n, term(n), 'accent', 6));
  const p = {
    x: [1, 13], y: [0, 6], aspect: 'wide', xlabel: 'intermediate state n (np, m = 0)', ylabel: 'contribution to α (a₀³)', xticks: 12, yticks: 6, axesAt: 'edge', curves,
    hlines: refs ? [{ y: r6(BOUND), color: 'ink3', label: 'all bound states' }, { y: 4.5, color: 'gold', label: 'exact: 4.5' }, { y: r6(16 / 3), color: 'warn', label: 'Unsöld bound: 16/3' }] : [],
  };
  if (slider) {
    p.sliders = [{ key: 'N', label: t`Sum up to $n = N$`, min: 2, max: 30, step: 1, value: 2, explain: 'How many bound intermediate states to include in the second-order sum.' }];
    p.curves.push({ sum: `2^10*k^7*(k - 1)^(2*k - 5)/(3*(k + 1)^(2*k + 5)*(1 - 1/k^2))`, k: [2, 'N'], color: 'good', width: 2.6 });
  }
  return { type: 'graph', params: p, caption };
}

/** Energy shift −½αℰ² (in MHz × h) against field (in 10⁷ V/m). */
const parabolaPic = (caption, mark) => ({
  type: 'graph',
  params: {
    x: [0, 5], y: [-150, 10], aspect: 'wide', xlabel: 'field (10⁷ V/m)', ylabel: 'ΔE/h (MHz)', xticks: 5, yticks: 4, axesAt: 'edge',
    curves: [{ fn: `-${r6(shiftHz(1e7) / 1e6)}*x^2`, color: 'accent', width: 2.4 }],
    ...(mark ? { vlines: [{ x: mark, color: 'ink3' }] } : {}),
  },
  caption,
});

export default lesson({
  id: 'phys4710.M3.2',
  title: 'The Stark effect',
  minutes: 18, difficulty: 3,
  intro: t`Put hydrogen in a uniform electric field $\mathcal E$ along $z$: $\hat H' = e\mathcal Ez$. Its $n = 2$ level shifts **linearly**, because degenerate states of opposite parity mix ([degenerate perturbation theory](#/lesson/phys4700.M8.2)). The ground state cannot: it is non-degenerate and even, so $\langle100|z|100\rangle = 0$ ([parity](#/lesson/phys4710.M2.3)). Its shift starts at second order, quadratic in the field:

$$\begin{gathered} \Delta E = -\sum_{n \ge 2}\frac{|\langle n10|e\mathcal Ez|100\rangle|^2}{E_n - E_1} \equiv -\tfrac12\alpha\mathcal E^2 \\ \alpha = \tfrac92\,(4\pi\epsilon_0)\,a_0^3 \end{gathered}$$

The field pulls the electron cloud slightly against itself, inducing a dipole $p = \alpha\mathcal E$, and that dipole’s energy is the shift. The **polarizability** $\alpha$ is one of the few second-order quantities known exactly — and computing it shows how much of a second-order sum hides in the continuum.`,
  symbols: [
    { tex: '\\mathcal E', text: 'the applied electric field, in V/m' },
    { tex: '\\Delta E', text: 'the shift of the ground-state energy: negative for every ground state at second order' },
    { tex: '\\alpha', text: t`the static polarizability, in C m²/V; $\alpha/4\pi\epsilon_0$ is a volume, $${fmt((ALPHA_AU * A0 ** 3) * 1e30, 4)}\ \text{Å}^3$ for hydrogen` },
    { tex: '|n10\\rangle', text: t`the intermediate states $np$ with $m = 0$ — the only ones $z$ connects to $1s$ (plus the continuum)` },
    { tex: 'E_n - E_1', text: t`the energy denominators, $13.6\ \text{eV}\,(1 - 1/n^2)$` },
    { tex: 'a_0,\\ \\epsilon_0', text: 'the Bohr radius and the vacuum permittivity' },
  ],
  why: 'Polarizabilities set van der Waals forces, refractive indices, optical-trap depths and the largest systematic shift of caesium and strontium clocks — the blackbody Stark shift.',
  visual: {
    ...sumPic({ slider: true }),
    title: 'Where the polarizability comes from',
    lead: t`Each blue stem is one term $2|\langle n10|z|100\rangle|^2/(E_n - E_1)$ of the second-order sum, in atomic units ($a_0^3$). The green line is the sum up to $n = N$. Grey: all bound states; gold: the exact answer; red: Unsöld’s upper bound.`,
    tasks: [
      'N = 2: the 2p state alone gives 2.96 — two thirds of the exact value. Perturbation sums are often dominated by the nearest state.',
      'Raise N to 30: the sum creeps up to 3.66 and stops. Every bound state together leaves almost a fifth missing.',
      'The missing 0.84 comes from the continuum — ionized states with E > 0. Second-order sums run over every state of Ĥ₀, scattering states included.',
    ],
    caption: 'Exact matrix elements |⟨n10|z|100⟩|² = 2⁸n⁷(n − 1)²ⁿ⁻⁵/3(n + 1)²ⁿ⁺⁵ a₀² (Bethe & Salpeter); infinite nuclear mass, no fine structure.',
  },
  example: {
    prompt: t`Estimate hydrogen’s polarizability from the $2p$ term alone, bound it from above with Unsöld’s closure trick, compare with the exact $4.5\,a_0^3$, and find the shift in a field of $10^7$ V/m.`,
    visual: sumPic({ caption: 'The terms of the second-order sum (stems) with the bound-state total, the exact value and Unsöld’s bound.' }),
    steps: [
      { label: 'First term', text: t`$\langle210|z|100\rangle = \dfrac{2^7\sqrt2}{3^5}a_0 = ${fmt(Math.sqrt(z2n(2)), 4)}\,a_0$, and $E_2 - E_1 = \tfrac38$ hartree. Writing $\Delta E = -\tfrac12\alpha\mathcal E^2$, the term gives $\alpha \approx 2\times${fmt(z2n(2), 4)}/(3/8) = ${fmt(T2, 4)}$ in atomic units ($4\pi\epsilon_0a_0^3$).` },
      { label: 'Upper bound', text: t`Every denominator is at least $E_2 - E_1$. Replace them all by it, and the sum becomes $\sum_n|\langle n|z|1s\rangle|^2 = \langle z^2\rangle = a_0^2$ by completeness: $\alpha \le 2a_0^2/(\tfrac38) = \tfrac{16}{3} = ${fmt(16 / 3, 4)}$.` },
      { label: 'Exact', text: t`Dalgarno and Lewis solved the first-order equation for the perturbed wave function in closed form, $\psi^{(1)} \propto -(r + r^2/2a_0)\cos\theta\,\psi_{100}$, giving exactly $\alpha = \tfrac92(4\pi\epsilon_0)a_0^3$. The bound states give $${fmt(BOUND, 4)}$; the continuum, the remaining $${fmt(4.5 - BOUND, 3)}$.` },
      { label: 'In SI', text: t`$\alpha = 4\pi\epsilon_0\times4.5\,a_0^3 = ${tex(ALPHA_SI, 4)}$ C m²/V; $\alpha/4\pi\epsilon_0 = ${fmt((ALPHA_AU * A0 ** 3) * 1e30, 4)}\ \text{Å}^3$` },
      { label: 'Shift', text: t`At $\mathcal E = 10^7$ V/m (100 kV/cm, near the limit of a laboratory capacitor): $\Delta E = -\tfrac12\alpha\mathcal E^2 = ${tex(-0.5 * ALPHA_SI * 1e14, 3)}$ J, or $h\times${fmt(-shiftHz(1e7) / 1e6, 3)}$ MHz — $${tex((0.5 * ALPHA_SI * 1e14) / QE, 3)}$ eV. Tiny against 13.6 eV, as the small parameter $\mathcal E/\mathcal E_{\text{at}}$ with $\mathcal E_{\text{at}} = ${tex(EAT, 4)}$ V/m promised.` },
    ],
    answer: t`$2p$ alone: $${fmt(T2, 3)}\,a_0^3$; all bound states $${fmt(BOUND, 3)}$; Unsöld bound $5.33$; exact $4.5$. At $10^7$ V/m the ground state drops by $h\times${fmt(shiftHz(1e7) / 1e6, 3)}$ MHz.`,
  },
  practice: [
    mcq({
      id: 'why-quadratic', difficulty: 2,
      prompt: t`Why does hydrogen’s ground state show no **linear** Stark shift, while its $n = 2$ level does?`,
      visual: hLevelsPic({ nmax: 2, lmax: 1, caption: 'Hydrogen’s n = 1 and n = 2 levels by l: 2s and 2p coincide.' }),
      choices: [
        t`$1s$ is non-degenerate with definite parity, so $\langle1s|z|1s\rangle = 0$; at $n = 2$, $2s$ and $2p$ are degenerate with opposite parity, and the field mixes them into states with permanent dipoles`,
        t`The field is too weak to affect the ground state`,
        t`The ground state has $l = 0$, so it has no angular momentum for the field to act on`,
        t`First-order shifts are always zero in perturbation theory`,
      ],
      answer: 0,
      why: {
        1: 'The same field shifts the ground state at second order; the issue is symmetry, not size.',
        2: 'Electric fields act on charge distributions, not angular momentum; the 1s cloud is polarized readily.',
        3: t`First-order shifts are $\langle n|\hat H'|n\rangle$, often nonzero — here they vanish by parity.`,
      },
      hints: [t`The first-order shift is $e\mathcal E\langle z\rangle$. What is $\langle z\rangle$ in a state of definite parity?`, t`Degenerate perturbation theory diagonalizes $\hat H'$ within $\{2s, 2p\}$, where $\langle2s|z|2p_0\rangle \neq 0$.`],
      teach: 'A linear Stark effect needs a permanent dipole, which needs degenerate states of opposite parity.',
      explain: t`$\langle1s|z|1s\rangle = 0$ by parity, so the ground state shifts as $\mathcal E^2$. At $n = 2$ the states $(2s \pm 2p_0)/\sqrt2$ have permanent dipoles $\mp3ea_0$ and shift by $\pm3ea_0\mathcal E$ — see [degenerate perturbation theory](#/lesson/phys4700.M8.2).`,
    }),
    num({
      id: 'stark-mhz', difficulty: 2,
      gen(r) {
        const E = r.pick([1, 2, 3, 5]) * 1e7;
        const ans = -shiftHz(E) / 1e6;
        return {
          prompt: t`Hydrogen’s polarizability is $\alpha = 4\pi\epsilon_0\times4.5\,a_0^3 = ${tex(ALPHA_SI, 5)}$ C m²/V. By how much does the ground state shift in a field of $${tex(E, 1)}$ V/m? Give $\Delta E/h$ in MHz, with its sign.`,
          visual: parabolaPic('The quadratic Stark shift of hydrogen’s ground state against field strength (curve only; this field marked).', r6(E / 1e7)),
          answer: ans, units: 'MHz', tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: 'The ground state always moves down at second order: the field lowers its energy.' }, { value: 2 * ans, feedback: t`$\Delta E = -\tfrac12\alpha\mathcal E^2$: keep the ½ (the induced dipole grows as the field is switched on).` }],
          hints: [t`$\Delta E = -\tfrac12\alpha\mathcal E^2$ in joules; divide by $h = ${tex(H, 9)}$ J s.`],
          teach: 'The quadratic Stark shift is −½αℰ²; for hydrogen in laboratory fields it is a few MHz.',
          explain: t`$\Delta E = -\tfrac12(${tex(ALPHA_SI, 4)})(${tex(E, 1)})^2 = ${tex(-0.5 * ALPHA_SI * E * E, 3)}$ J, so $\Delta E/h = ${fmt(ans, 4)}$ MHz. Doubling the field quadruples the shift. The ½ arises because the dipole $p = \alpha\mathcal E$ is induced by the field itself: $\Delta E = -\int_0^{\mathcal E}p\,d\mathcal E'$.`,
        };
      },
    }),
    num({
      id: 'unsold', difficulty: 3,
      gen(r) {
        const [name, z2, gap, exact] = r.pick([['hydrogen’s 1s', 1, 0.375, 4.5], ['the hydrogen-like ion He$^+$ (1s, with $\\langle z^2\\rangle = \\tfrac14a_0^2$ and $E_2 - E_1 = \\tfrac32$ hartree)', 0.25, 1.5, 4.5 / 16]]);
        const ans = (2 * z2) / gap;
        return {
          prompt: t`Unsöld’s trick bounds a ground-state polarizability by replacing every energy denominator with the smallest one, $E_2 - E_1$: then completeness gives $\alpha \le 2\langle z^2\rangle/(E_2 - E_1)$ in atomic units. For ${name} ${z2 === 1 ? '($\\langle z^2\\rangle = a_0^2$, $E_2 - E_1 = \\tfrac38$ hartree)' : ''}, what upper bound does this give, in units of $4\pi\epsilon_0a_0^3$?`,
          visual: sumPic({ caption: 'Hydrogen’s second-order sum, term by term; every denominator is at least E₂ − E₁.', refs: false }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: ans / 2, feedback: t`The bound is $2\langle z^2\rangle/(E_2 - E_1)$: with $\Delta E = -\tfrac12\alpha\mathcal E^2$, the sum is $\alpha/2$.` }],
          hints: [t`Each $1/(E_n - E_1) \le 1/(E_2 - E_1)$, so $\alpha = 2\sum_n\frac{|z_{n1}|^2}{E_n - E_1} \le \frac{2}{E_2 - E_1}\sum_n|z_{n1}|^2$.`, t`$\sum_n|z_{n1}|^2 = \langle1|z^2|1\rangle$ by completeness (the $n = 1$ term is zero).`],
          teach: 'Replacing every energy denominator by the smallest one turns a second-order sum into an expectation value — an upper bound.',
          explain: t`$\alpha \le 2\times${z2}/${gap} = ${fmt(ans, 4)}$, against the exact $${fmt(exact, 4)}$. The bound overshoots by 19% because the continuum, with large denominators, carries much of $\langle z^2\rangle$.${z2 === 1 ? '' : ' Everything scales as Z⁻⁴: tightly bound ions barely polarize.'}`,
        };
      },
    }),
    num({
      id: 'induced-dipole', difficulty: 2,
      gen(r) {
        const E = r.pick([1e6, 1e7, 1e8]);
        const ans = ALPHA_AU * (E / EAT);       // in e a₀
        return {
          prompt: t`In atomic units the induced dipole is $p = \alpha\mathcal E = 4.5\,(\mathcal E/\mathcal E_{\text{at}})\,ea_0$, where $\mathcal E_{\text{at}} = e/4\pi\epsilon_0a_0^2 = ${tex(EAT, 5)}$ V/m is the field the proton makes at one Bohr radius. What dipole moment, in units of $ea_0$, does a field of $${tex(E, 1)}$ V/m induce in a hydrogen atom?`,
          visual: { type: 'mp-orbitals', params: { n: 1, l: 0, m: 0, panels: ['cloud'], controls: false, readout: false }, caption: 'The 1s cloud. A laboratory field displaces its centre by far less than a pixel.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ans / ALPHA_AU, feedback: 'Multiply by the polarizability, 4.5 in atomic units.' }],
          hints: [t`$p/(ea_0) = 4.5\times\mathcal E/\mathcal E_{\text{at}}$.`],
          teach: 'Atomic fields are about 5 × 10¹¹ V/m, so laboratory fields deform atoms only slightly.',
          explain: t`$p = 4.5\times${tex(E / EAT, 3)}\,ea_0 = ${tex(ans, 3)}\,ea_0$: the electron cloud’s centre moves by $${tex(ans * A0 * 1e15, 2)}$ fm. Small — yet summed over $10^{25}$ atoms per cubic metre it is the dielectric response of hydrogen gas.`,
        };
      },
    }),
    mcq({
      id: 'second-order-sign', difficulty: 2,
      prompt: t`A student computes a second-order perturbation shift of some system’s **ground state** and gets a positive number. What can you conclude?`,
      visual: sumPic({ caption: 'Every term in the ground state’s second-order sum is a squared matrix element over a positive denominator.', refs: false }),
      choices: [
        t`There is an error: $E^{(2)}_0 = -\sum_n|H'_{n0}|^2/(E_n - E_0)$ has every denominator positive, so the ground-state shift is never positive`,
        'Nothing: second-order shifts can have either sign for any state',
        'The perturbation must be large',
        'The ground state must be degenerate',
      ],
      answer: 0,
      why: {
        1: 'For excited states terms of both signs appear; for the ground state all Eₙ − E₀ > 0.',
        2: 'Size does not change the sign of each term; it decides whether second order is accurate.',
        3: 'A degenerate ground state needs degenerate perturbation theory first, but the second-order correction is still negative.',
      },
      hints: [t`Write $E^{(2)}_0 = \sum_{n\neq0}\frac{|\langle n|\hat H'|0\rangle|^2}{E_0 - E_n}$. What is the sign of each denominator?`],
      teach: 'The second-order correction to a ground state is always negative: the system lowers its energy by distorting.',
      explain: t`Every numerator is a square and every denominator $E_0 - E_n$ is negative, so $E^{(2)}_0 < 0$. This is also the variational principle at work (module M4): letting the state adjust to the perturbation can only lower the energy.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rydberg', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([20, 30, 40, 50, 60]);
        const ans = EAT / (16 * n ** 4) / 100;       // V/cm
        return {
          prompt: t`Rydberg atoms — atoms with one electron in a very high level $n$ — are detected, and the qubits of Rydberg-atom quantum computers read out, by **field ionization**. Along the field axis the electron sees $V(z) = -e^2/4\pi\epsilon_0|z| - e\mathcal Ez$, whose saddle lies at $-2\sqrt{e^3\mathcal E/4\pi\epsilon_0}$. The electron escapes classically once the saddle drops below its energy $-13.6\ \text{eV}/n^2$, which gives $\mathcal E = \mathcal E_{\text{at}}/16n^4$ with $\mathcal E_{\text{at}} = ${tex(EAT, 5)}$ V/m. What field ionizes a hydrogen-like Rydberg atom with $n = ${n}$, in V/cm?`,
          visual: { type: 'graph', params: { x: [-6, 6], y: [-1.6, 0.4], aspect: 'wide', xlabel: 'z (scaled)', ylabel: 'V (scaled)', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: '-1/abs(x) - 0.06*x', color: 'accent', width: 2.4 }], hlines: [{ y: -0.49, color: 'gold', label: 'Rydberg level' }] }, caption: 'Coulomb potential tilted by a field: the saddle on the downhill side (schematic). Ionization happens when the level reaches the saddle.' },
          answer: ans, units: 'V/cm', tol: { rel: 0.005 },
          errors: [{ value: ans * 100, feedback: 'Convert V/m to V/cm: divide by 100.' }, { value: EAT / (4 * n ** 4) / 100, feedback: t`Setting $-2\sqrt{\mathcal E} = -1/2n^2$ (atomic units) gives $\mathcal E = 1/16n^4$, not $1/4n^4$.` }],
          hints: [t`In atomic units, $-2\sqrt{\mathcal E} = -\tfrac{1}{2n^2}$, so $\mathcal E = 1/(16n^4)$.`, t`Multiply by $\mathcal E_{\text{at}}$ and convert to V/cm.`],
          teach: 'Rydberg states ionize in fields of order 1/16n⁴ atomic units — volts per centimetre for n ≈ 30–50.',
          explain: t`$\mathcal E = ${tex(EAT, 4)}/(16\times${n}^4) = ${fmt(ans, 3)}$ V/cm. Because the threshold depends so steeply on $n$, ramping the field up ionizes each level at its own moment — “selective field ionization”, which tells which Rydberg state an atom was in.`,
        };
      },
    }),
    num({
      id: 'cp-bbr', difficulty: 3, transfer: true,
      gen(r) {
        const T = r.pick([290, 300, 310, 320]);
        const E2 = (4 * SIGMA / C) * T ** 4 / EPS0;
        const ans = (-KBBR * E2) / CS_HFS * 1e14;      // fractional, in units of 10⁻¹⁴
        return {
          prompt: t`Thermal radiation fills a caesium clock’s vacuum chamber with a fluctuating electric field. Its energy density $aT^4$ ($a = 4\sigma/c$) is shared equally by $\vec E$ and $\vec B$, so $\langle\mathcal E^2\rangle = aT^4/\epsilon_0$. The two clock levels have slightly different polarizabilities, giving a quadratic Stark shift of the clock frequency $\Delta\nu = k\langle\mathcal E^2\rangle$ with $k = -${tex(KBBR, 2)}$ Hz/(V/m)² (measured). At $T = ${T}$ K, what is the fractional shift $\Delta\nu/\nu$, in units of $10^{-14}$? ($\sigma = ${tex(SIGMA, 6)}$ W m⁻² K⁻⁴, $\nu = 9\,192\,631\,770$ Hz.)`,
          visual: { type: 'mp-blackbody', params: { T, controls: false }, caption: 'The thermal spectrum of the chamber walls at this temperature.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: -ans, feedback: 'The coefficient k is negative: the clock runs slow in thermal radiation.' }, { value: ans / 2, feedback: t`$\langle\mathcal E^2\rangle = aT^4/\epsilon_0$: the electric part is half the energy density, $\tfrac12\epsilon_0\langle\mathcal E^2\rangle = \tfrac12aT^4$.` }],
          hints: [t`$\langle\mathcal E^2\rangle = 4\sigma T^4/(c\,\epsilon_0)$; at 300 K that is about $(832\ \text{V/m})^2$.`, t`$\Delta\nu = k\langle\mathcal E^2\rangle$; divide by $\nu$ and by $10^{-14}$.`],
          teach: 'Room-temperature blackbody radiation is a ~830 V/m rms field, and its Stark shift is one of the largest corrections to atomic clocks.',
          explain: t`$\langle\mathcal E^2\rangle = ${tex(E2, 4)}$ (V/m)$^2$, an rms field of $${fmt(Math.sqrt(E2), 4)}$ V/m, so $\Delta\nu = ${tex(-KBBR * E2, 3)}$ Hz and $\Delta\nu/\nu = ${fmt(ans, 3)}\times10^{-14}$. It scales as $T^4$, so clocks measure their chamber temperature carefully; a small extra correction for the radiation’s frequency spread is omitted here, and published values for the coefficient differ by several percent.`,
        };
      },
    }),
    mcq({
      id: 'cp-continuum', difficulty: 3,
      prompt: t`Summing the second-order Stark terms over **every bound state** of hydrogen gives $${fmt(BOUND, 3)}\,a_0^3$, but the exact polarizability is $4.5\,a_0^3$. What accounts for the difference?`,
      visual: sumPic({ caption: 'Bound-state terms of the second-order sum and their total (grey line), against the exact value (gold).' }),
      choices: [
        t`The continuum: second-order perturbation theory sums over every eigenstate of $\hat H_0$, including the unbound ($E > 0$) states, which contribute the remaining $${fmt(4.5 - BOUND, 2)}\,a_0^3$`,
        'Third-order perturbation theory',
        'Rounding errors in the matrix elements',
        'Relativistic corrections',
      ],
      answer: 0,
      why: {
        1: t`Third order is odd in $\mathcal E$ and vanishes by parity; the fourth-order (hyperpolarizability) term is far smaller and does not enter $\alpha$.`,
        2: 'The matrix elements are exact closed forms; the bound-state sum converges to 3.663.',
        3: t`Relativistic corrections to $\alpha$ are of relative order $\alpha_{\text{fs}}^2 \approx 5\times10^{-5}$.`,
      },
      hints: ['A complete set of states for hydrogen includes more than the bound states.', 'The 1s electron can be lifted into an unbound state, too: those states have energies E > 0.'],
      teach: 'Completeness includes the continuum: sums over intermediate states must include scattering states.',
      explain: t`Hydrogen’s bound states alone are not complete. The continuum carries ${fmt(((4.5 - BOUND) / 4.5) * 100, 2)}% of the polarizability here. Methods like Dalgarno–Lewis, or the variational principle applied to $\alpha$, sidestep the sum entirely.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §7.1–7.2 and problems on the Stark effect', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'H. A. Bethe & E. E. Salpeter, Quantum Mechanics of One- and Two-Electron Atoms, §51–52 and §63', url: 'https://doi.org/10.1007/978-3-662-12869-5' },
    { label: 'A. Dalgarno & J. T. Lewis, “The exact calculation of long-range forces between atoms by perturbation theory”, Proc. R. Soc. A 233, 70 (1955)', url: 'https://doi.org/10.1098/rspa.1955.0246' },
    { label: 'S. Robyr, P. Knowles & A. Weis, “Differential polarizability of the cesium ground state”, Phys. Rev. A 90, 012505 (2014)', url: 'https://doi.org/10.1103/PhysRevA.90.012505' },
  ],
});
