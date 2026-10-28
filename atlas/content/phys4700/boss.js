// The PHYS 4700 boss, "The Quantum State Challenge": a lab bench with three
// quantum systems — an electron trapped in a gallium arsenide nanowire (an
// infinite well, m* = 0.067 mₑ), a single electron spin, and a cell of
// hydrogen atoms — taken through the whole course. Prepare: normalize a
// superposition and read ⟨H⟩ (M4.4); Stern–Gerlach odds along x for a state
// on the Bloch sphere (M1.3). Measure: outcomes of a 2 × 2 observable (M0.2);
// Robertson's bound for Sx and Sy, in code (M4.5). Evolve: the wire's sloshing
// (M3.1), Larmor precession (M6.2), a two-level Rabi oscillation by Û = e^{−iĤt},
// in code (M4.7). Three dimensions and fields: hydrogen's ⟨r⟩ (M5.2), a
// Clebsch–Gordan probability (M6.3), an Aharonov–Bohm fringe count (M7.1).
// Perturb: the n = 2 Stark splitting of Lyman-α (M8.2), the fine-structure
// line in a weak field (M8.3/M8.4), and the anharmonic oscillator against
// exact diagonalization, in code (M8.1). Every number a learner reads comes
// from its generator; the case functions are exported so a script can
// recompute every key another way. Constants CODATA 2022.
import { boss, mcq, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { H, HBAR, QE, MU_B, GAMMA_E, blochPic, seg, label, r6 } from './_qm.js';
import { En, boxFn, energyBars } from './_wells.js';
import { fsShift, anharmonicE0 } from './_pert.js';
import { A0 } from '../phys2710/_constants.js';

const t = String.raw;
const D = Math.PI / 180;
const MSTAR = 0.067;                                // GaAs effective mass, in mₑ
const PHI0 = H / QE;                                // Wb, h/e
const MUB = MU_B / QE;                              // eV/T
const LYA = 121.567;                                // nm, hydrogen Lyman-α (vacuum)
const HC = (H * 299792458) / QE * 1e9;              // eV nm
const FS2_GHZ = ((fsShift(2, 1.5) - fsShift(2, 0.5)) * QE) / H / 1e9;   // 2P3/2 − 2P½ at first order, GHz

/** Keep only the slips whose values are finite and clearly apart from the key (and from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v), 1e-12);
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  return kept;
}

// ── round 1: prepare ─────────────────────────────────────────────────────────
/** A nanowire electron in a superposition a ψ₁ + i b ψ₂ + c ψ₃ (unnormalized): ⟨H⟩ in meV. */
export function normCase(r) {
  const L = r.pick([10, 12, 15, 20]);
  const [a, b, c] = r.pick([[1, 2, 1], [2, 1, 1], [1, 1, 2], [3, 1, 1], [1, 2, 2], [2, 2, 1], [1, 3, 1]]);
  const E1 = En(1, L, MSTAR) * 1e3;                  // meV
  const N = a * a + b * b + c * c, E1p = +E1.toFixed(4);           // the printed E₁, so the key matches the prompt
  return { L, a, b, c, E1: E1p, N, key: ((a * a + 4 * b * b + 9 * c * c) / N) * E1p };
}
/** A spin on the Bloch sphere at polar θ and azimuth φ: P(+x) = (1 + sin θ cos φ)/2. */
export function sgCase(r) {
  const th = r.pick([30, 60, 120, 150]), ph = r.pick([0, 45, 90, 135, 180, 300]);
  return { th, ph, key: (1 + Math.sin(th * D) * Math.cos(ph * D)) / 2 };
}

// ── round 2: measure ─────────────────────────────────────────────────────────
/** An observable Q = [[a, b], [b, d]] measured on |+z⟩: the probability of its larger eigenvalue. */
export function obsCase(r) {
  const [a, b, d] = r.pick([[1, 2, -2], [2, 2, -1], [3, 1, 1], [0, 2, 3], [1, 3, -7], [4, 2, 1]]);
  const s = Math.sqrt((a - d) ** 2 + 4 * b * b), qp = (a + d + s) / 2, qm = (a + d - s) / 2;
  return { a, b, d, qp, qm, key: 0.5 * (1 + (a - d) / s) };
}
/** Robertson's bound for Sx and Sy (ħ = 1) in the state at (θ, φ). */
export function uncertCase(r) {
  const th = r.pick([40, 70, 110, 130]), ph = r.pick([20, 50, 100, 160]);
  const s = Math.sin(th * D), c = Math.cos(th * D), cp = Math.cos(ph * D), sp = Math.sin(ph * D);
  const sx = 0.5 * Math.sqrt(1 - (s * cp) ** 2), sy = 0.5 * Math.sqrt(1 - (s * sp) ** 2);
  return { th, ph, sx, sy, prod: sx * sy, bound: 0.25 * Math.abs(c) };
}

// ── round 3: evolve ──────────────────────────────────────────────────────────
/** The wire's (ψ₁ + ψ₂)/√2 sloshing: P(left half) at time t. */
export function sloshCase(r) {
  const L = r.pick([10, 15, 20]), f = r.pick([0.125, 0.2, 0.3, 0.4, 0.65, 0.8]);
  const E1 = En(1, L, MSTAR);                        // eV
  const T = (H / QE) / (3 * E1) * 1e12;              // ps, the period h/(E₂ − E₁)
  const tps = +(f * T).toPrecision(3);
  const w = (3 * E1 * QE) / HBAR * 1e-12;           // rad per ps
  return { L, E1, T, tps, w, key: 0.5 + (4 / (3 * Math.PI)) * Math.cos(w * tps) };
}
/** An electron spin starting along +x in B along z: P(+x) after t. */
export function larmorCase(r) {
  const B = r.pick([10, 20, 25, 40]), tns = r.pick([0.3, 0.5, 0.8, 1.2]);
  const w = GAMMA_E * B * 1e-3, ph = w * tns * 1e-9;
  return { B, tns, w, ph, key: Math.cos(ph / 2) ** 2 };
}
/** A two-level H = [[0, Δ], [Δ, ε]] (rad/ns, ħ = 1) from |1⟩: Rabi's formula. */
export function rabiCase(r) {
  const Dl = r.pick([1, 1.5, 2]), ep = r.pick([1, 2, 3]);
  const Om = Math.sqrt(ep * ep + 4 * Dl * Dl);
  const P2 = (tt) => ((4 * Dl * Dl) / (Om * Om)) * Math.sin((Om * tt) / 2) ** 2;
  return { Dl, ep, Om, P2, pmax: (4 * Dl * Dl) / (Om * Om), tmax: Math.PI / Om };
}

// ── round 4: three dimensions and fields ─────────────────────────────────────
/** Hydrogen's ⟨r⟩ in state n, l: (a/2)(3n² − l(l + 1)), in pm. */
export function radiusCase(r) {
  const [n, l] = r.pick([[2, 0], [2, 1], [3, 0], [3, 1], [3, 2], [4, 1], [4, 3]]);
  return { n, l, key: (A0 * 1e12 / 2) * (3 * n * n - l * (l + 1)) };
}
/** |j = l − ½, m⟩: the probability that Lz gives m_l = m − ½ (spin up). */
export function cgCase(r) {
  const l = r.pick([1, 2, 3]), m2 = r.pick([-1, 1, 3, -3].filter((k) => Math.abs(k) <= 2 * l - 1));
  const m = m2 / 2;
  return { l, m2, m, key: (l - m + 0.5) / (2 * l + 1) };
}
/** An electron biprism round a solenoid of radius R (nm) and field B (mT): the fringe shift. */
export function abCase(r) {
  const R = r.pick([100, 150, 200, 250]), B = r.pick([20, 40, 60, 100]);
  const Phi = Math.PI * (R * 1e-9) ** 2 * B * 1e-3;
  return { R, B, Phi, key: Phi / PHI0 };
}

// ── round 5: perturb ─────────────────────────────────────────────────────────
/** Lyman-α in a field: the outer Stark components 6eaℰ apart, in pm. */
export function starkCase(r) {
  const F = r.pick([10, 20, 30, 50, 80]);           // kV/cm
  const dE = 6 * A0 * F * 1e5;                       // eV
  return { F, dE, key: (LYA ** 2 * dE) / HC * 1e3 };
}
/** The 2P3/2 (m_j = 3/2) ← 2P½ (m_j = ½) line in a weak field: ν_fs + (2 − ⅓)μ_B B/h, GHz. */
export function zeemanCase(r) {
  const B = r.pick([4, 6, 8, 10, 12, 15]);           // mT
  const toGHz = (eV) => (eV * QE) / H / 1e9;
  const shift = toGHz((2 - 1 / 3) * MUB * B * 1e-3);
  // the exact 2 × 2 mixing of the m_j = ½ pair pushes 2P½(m_j = ½) down by about (2/9)(μ_B B)²/ΔE_fs
  const fs = fsShift(2, 1.5) - fsShift(2, 0.5), bb = MUB * B * 1e-3, mix = toGHz(((2 / 9) * bb * bb) / fs);
  return { B, nu0: +FS2_GHZ.toFixed(4), shift, mix, key: +FS2_GHZ.toFixed(4) + shift };
}
/** H = p²/2 + x²/2 + λx⁴: exact E₀ by diagonalization, first and second order. */
export function anharmCase(r) {
  const lam = r.pick([0.02, 0.04, 0.05, 0.08, 0.1]);
  return { lam, exact: anharmonicE0(lam, 60), first: 0.5 + 0.75 * lam, second: 0.5 + 0.75 * lam - (21 / 8) * lam * lam };
}

// ── pictures ─────────────────────────────────────────────────────────────────
const bloch = (th, ph, caption, extra) => blochPic({ states: [{ v: [Math.sin(th * D) * Math.cos(ph * D), Math.sin(th * D) * Math.sin(ph * D), Math.cos(th * D)], label: '\\psi', color: 'gold' }], caption, ...(extra ? { extra } : {}) });
function planePic(C) {
  const beta = 0.5 * Math.atan2(2 * C.b, C.a - C.d);
  const v1 = [Math.cos(beta), Math.sin(beta)], v2 = [-Math.sin(beta), Math.cos(beta)];
  return {
    type: 'graph',
    params: {
      x: [-1.4, 1.4], y: [-1.2, 1.2], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink4', width: 1, dash: [2, 4] }],
      arrows: [
        { from: [0, 0], to: [1, 0], color: 'gold', width: 3, label: '|ψ⟩ = |+z⟩', labelDx: 6, labelDy: 14 },
        { from: [0, 0], to: v1.map(r6), color: 'accent', width: 2.2, label: 'eigenvector 1', labelDx: 6, labelDy: -6 },
        { from: [0, 0], to: v2.map(r6), color: 'accent', width: 2.2, label: 'eigenvector 2', labelDx: 6, labelDy: -6 },
      ],
    },
    caption: 'The qubit’s state (gold) and the two orthogonal eigenvectors of Q (blue), in a real two-dimensional picture of the state space; which eigenvector belongs to which eigenvalue is not marked.',
  };
}
const boxDensity = (L, caption) => ({
  type: 'graph',
  params: {
    x: [0, L], y: [0, r6(4.2 / L)], aspect: 'wide', xlabel: 'x (nm)', ylabel: '|Ψ|² (nm⁻¹)', axesAt: 'edge', xticks: 5, yticks: 4,
    curves: [{ fn: `0.5*(${boxFn(1, L)} + ${boxFn(2, L)})^2`, color: 'gold', width: 2.4 }, seg(L / 2, 0, L / 2, 4 / L, 'ink3', 1.4, [5, 4])],
    shade: [{ fn: `0.5*(${boxFn(1, L)} + ${boxFn(2, L)})^2`, from: 0, to: r6(L / 2), color: 'gold', alpha: 0.25 }],
    points: [label(L / 4, 3.9 / L, 'left half', 'ink2', 0, 0, 'center')],
  },
  caption,
});
function dotsPic(l, caption) {
  const pts = [];
  for (let ml = -l; ml <= l; ml++) for (const ms of [0.5, -0.5]) pts.push({ x: ml + ms, y: ms > 0 ? 1.4 : 0.6, r: 6, color: ms > 0 ? 'gold' : 'accent' });
  return {
    type: 'graph',
    params: { x: [r6(-l - 1.2), r6(l + 1.2)], y: [0, 2.8], aspect: 'wide', xlabel: 'total m = mₗ + mₛ', ylabel: '', axesAt: 'edge', xticks: 2 * l + 2, yticks: 0, points: pts, legend: [{ label: 'spin up', color: 'gold', point: true }, { label: 'spin down', color: 'accent', point: true }], legendAt: 'tr' },
    caption,
  };
}
const abPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-3, 3], y: [-1.4, 1.4], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: 'sqrt(max(0.09 - x^2, 0))', lower: '-sqrt(max(0.09 - x^2, 0))', from: -0.3, to: 0.3, color: 'teal', alpha: 0.5 }],
    curves: [{ param: ['-2.6 + 5.2*t', '0.95*sin(pi*t)'], t: [0, 1], color: 'accent', width: 2.2 }, { param: ['-2.6 + 5.2*t', '-0.95*sin(pi*t)'], t: [0, 1], color: 'accent', width: 2.2 }, seg(2.6, -1.3, 2.6, 1.3, 'ink2', 3)],
    points: [{ x: -2.6, y: 0, r: 5, color: 'accent', label: 'source', labelDx: -8, labelDy: 18 }, label(0, -0.3, 'B inside only', 'teal', 0, 12, 'center'), label(2.6, 1.3, 'screen', 'ink2', -4, -8, 'right')],
  },
  caption,
});
const starkPic = (F, caption) => {
  const k = r6(3 * A0 * 1e5 * 1e6);
  return { type: 'graph', params: { x: [0, 100], y: [-2000, 2000], aspect: 'wide', xlabel: 'electric field (kV/cm)', ylabel: 'n = 2 shift', axesAt: 'edge', xticks: 5, yticks: 0, curves: [{ fn: `${k}*x`, color: 'warn', width: 2.2 }, { fn: '0', color: 'accent', width: 2.6 }, { fn: `-${k}*x`, color: 'good', width: 2.2 }], vlines: [{ x: F, color: 'ink3' }] }, caption };
};
function zeemanPic(B, caption) {
  const b = 10 * (MUB * 1e6 * 1e-3);                // μeV per mT, the fans drawn ten times steeper than life
  const E12 = fsShift(2, 0.5) * 1e6, E32 = fsShift(2, 1.5) * 1e6;
  const lines = [[E32, 2, 'gold'], [E32, 2 / 3, 'gold'], [E32, -2 / 3, 'gold'], [E32, -2, 'gold'], [E12, 1 / 3, 'accent'], [E12, -1 / 3, 'accent']];
  return {
    type: 'graph',
    params: {
      x: [0, 20], y: [-80, 20], aspect: 'wide', xlabel: 'B (mT)', ylabel: 'energy (μeV)', axesAt: 'edge', xticks: 6, yticks: 0,
      curves: lines.map(([e, g, c]) => ({ fn: `${r6(e)} + ${r6(g * b)}*x`, color: c, width: 2 })),
      vlines: [{ x: B, color: 'ink3' }],
      points: [label(1, E32, '2P3/2', 'gold', 2, -12), label(1, E12, '2P1/2', 'accent', 2, 14)],
    },
    caption,
  };
}

export default boss({
  title: 'The Quantum State Challenge',
  intro: t`A new quantum lab is being commissioned, and you sign off its numbers. On the bench: an electron trapped in a gallium arsenide **nanowire**, a single electron **spin** read out by a Stern–Gerlach-style detector, and a cell of **hydrogen** atoms. Each must be prepared in a state, measured, left to evolve, and finally perturbed by the fields the lab applies — the whole course in one afternoon. Five rounds, thirteen problems, three of them in code; no hints, one try each.`,
  pass: 0.7,
  rounds: [
    // ── round 1 ──
    {
      title: 'Prepare',
      story: t`The nanowire’s electron (effective mass $m^* = ${MSTAR}\,m_e$, an infinite well to a good approximation) is put into a superposition of its three lowest states, and the spin is tipped to a point on the Bloch sphere. Before anything is measured, the lab wants predictions.`,
      items: [
        num({
          id: 'r1-norm', skill: 'phys4700.M4.4', difficulty: 3,
          gen(r) {
            const C = normCase(r);
            const { L, a, b, c, E1, N, key } = C;
            const amp = (k) => (k === 1 ? '' : k);
            return {
              prompt: t`The wire is $${L}$ nm long, so its levels are $E_n = n^2E_1$ with $E_1 = ${E1}$ meV. A gate pulse prepares $$\Psi = A\big(${amp(a)}\psi_1 + ${amp(b)}i\,\psi_2 + ${amp(c)}\psi_3\big),$$ with the $\psi_n$ orthonormal and $A$ a positive constant you choose to normalize $\Psi$. What is the expectation value of the energy, in meV?`,
              visual: energyBars([1, 4, 9].map((k, i) => ({ E: k * E1, p: [a, b, c][i], label: ['ψ₁', 'ψ₂', 'ψ₃'][i] })), { xmax: 10.5 * E1, xlabel: 'energy (meV)', ylabel: 'size of coefficient, before normalizing', ymax: 3.6, caption: 'The three components drawn at their energies, with heights equal to the unnormalized coefficients’ sizes |a|, |b|, |c|. Probabilities come later.' }),
              answer: key, units: 'meV', tol: { rel: 0.005 },
              errors: apart([
                { value: (a * a + 4 * b * b + 9 * c * c) * E1, feedback: t`Normalize first: $|A|^2 = 1/(${a * a} + ${b * b} + ${c * c})$.` },
                { value: ((a + 4 * b + 9 * c) / (a + b + c)) * E1, feedback: t`Probabilities are the squared sizes of the coefficients, $|c_n|^2$, not $|c_n|$.` },
                { value: ((a * a - 4 * b * b + 9 * c * c) / (a * a - b * b + c * c)) * E1, feedback: t`$|ib|^2 = b^2$, not $-b^2$: the probability uses the complex modulus, so the $i$ does not change it.` },
              ], key),
              hints: [t`$|A|^2(${a * a} + ${b * b} + ${c * c}) = 1$: the phase $i$ does not affect $|ib|^2 = ${b * b}$.`, t`$\langle H\rangle = \sum_n |c_n|^2E_n$ with $|c_n|^2 = (${a * a}, ${b * b}, ${c * c})/${N}$.`],
              teach: 'An energy expectation value weights each level by its probability |cₙ|², after normalizing.',
              explain: t`$|A|^2 = 1/${N}$, so the probabilities are $${a * a}/${N}$, $${b * b}/${N}$ and $${c * c}/${N}$, and $$\langle H\rangle = \frac{${a * a}(1) + ${b * b}(4) + ${c * c}(9)}{${N}}\,E_1 = ${fmt(key, 4)}\ \text{meV}.$$ No single measurement gives this: each gives $E_1$, $4E_1$ or $9E_1$. The $i$ on $\psi_2$ changes nothing now, but it decides how the state evolves.`,
            };
          },
        }),
        num({
          id: 'r1-sg', skill: 'phys4700.M1.3', difficulty: 3,
          gen(r) {
            const C = sgCase(r);
            const { th, ph, key } = C;
            return {
              prompt: t`The spin is prepared in $|\psi\rangle = \cos\tfrac{\theta}{2}|{+z}\rangle + e^{i\phi}\sin\tfrac{\theta}{2}|{-z}\rangle$ with $\theta = ${th}^\circ$, $\phi = ${ph}^\circ$, then sent into an analyser along $x$. What is the probability it leaves by the $+x$ port? ($|{+x}\rangle = (|{+z}\rangle + |{-z}\rangle)/\sqrt2$.)`,
              visual: bloch(th, ph, t`The prepared state on the Bloch sphere: polar angle $${th}^\circ$ from $+z$, azimuth $${ph}^\circ$ from $+x$. Drag to rotate.`),
              answer: key, tol: { rel: 0, abs: 0.004 },
              errors: apart([
                { value: Math.cos((th * D) / 2) ** 2, feedback: t`That is $P(+z)$. Project on $|{+x}\rangle$: $\langle{+x}|\psi\rangle = \big(\cos\tfrac\theta2 + e^{i\phi}\sin\tfrac\theta2\big)/\sqrt2$.` },
                { value: (1 + Math.sin(th * D)) / 2, feedback: t`The relative phase $e^{i\phi}$ matters: the cross term is $\sin\theta\cos\phi$, not $\sin\theta$.` },
                { value: 1 - key, feedback: 'That is the probability of the −x port.' },
              ], key, 0.02),
              hints: [t`$P(+x) = |\langle{+x}|\psi\rangle|^2 = \tfrac12\big|\cos\tfrac\theta2 + e^{i\phi}\sin\tfrac\theta2\big|^2$.`, t`Expanding: $P(+x) = \tfrac12(1 + \sin\theta\cos\phi)$.`],
              teach: 'The probability of a result is |⟨result|ψ⟩|², and relative phases enter through the cross term.',
              explain: t`$P(+x) = \tfrac12(1 + \sin${th}^\circ\cos${ph}^\circ) = ${fmt(key, 3)}$ — the projection of the Bloch vector on the $x$-axis, $\langle\sigma_x\rangle = \sin\theta\cos\phi$, turned into odds.`,
            };
          },
        }),
      ],
    },
    // ── round 2 ──
    {
      title: 'Measure',
      story: t`The spin detector is reconfigured to measure other observables, and the lab asks how sharply two of them can be known at once.`,
      items: [
        num({
          id: 'r2-observable', skill: 'phys4700.M0.2', difficulty: 3,
          gen(r) {
            const C = obsCase(r);
            const { a, b, d, qp, qm, key } = C;
            return {
              prompt: t`In the $\{|{+z}\rangle, |{-z}\rangle\}$ basis, an observable of the spin has the matrix $Q = \begin{pmatrix} ${a} & ${b}\\ ${b} & ${d}\end{pmatrix}$ (in units of $\hbar/2$). The spin is in $|{+z}\rangle$. With what probability does a measurement of $Q$ give its **larger** eigenvalue?`,
              visual: planePic(C),
              answer: key, tol: { rel: 0, abs: 0.004 },
              errors: apart([
                { value: 0.5, feedback: t`Not every two-outcome measurement is a coin toss: the probability is $|\langle q_+|{+z}\rangle|^2$, set by the eigenvector’s direction.` },
                { value: 1 - key, feedback: 'That is the probability of the smaller eigenvalue.' },
              ], key, 0.02),
              hints: [t`The eigenvalues are $\tfrac{${a} + ${d}}{2} \pm \sqrt{\big(\tfrac{${a} - ${d}}{2}\big)^2 + ${b * b}} = ${fmt(qp, 4)}, ${fmt(qm, 4)}$.`, t`An eigenvector for $q_+$ is $(${b},\ ${fmt(qp - a, 4)})$; normalize it and square its first component.`],
              teach: 'Measuring an observable gives one of its eigenvalues, with probability |⟨eigenvector|ψ⟩|².',
              explain: t`$q_\pm = ${fmt(qp, 4)}, ${fmt(qm, 4)}$. With $\vec v_+ \propto (${b}, ${fmt(qp - a, 4)})$, $P(q_+) = \dfrac{${b * b}}{${b * b} + ${fmt((qp - a) ** 2, 4)}} = ${fmt(key, 3)}$, which is also $\tfrac12\big(1 + (Q_{11} - Q_{22})/(q_+ - q_-)\big)$. Check: $\langle Q\rangle = q_+P_+ + q_-P_- = ${fmt(qp * key + qm * (1 - key), 4)} = Q_{11}$.`,
            };
          },
        }),
        code({
          id: 'r2-uncertainty', skill: 'phys4700.M4.5', difficulty: 3,
          gen(r) {
            const C = uncertCase(r);
            const { th, ph, sx, sy, prod, bound } = C;
            const prog = (body) => t`import numpy as np

Sx = np.array([[0, 1], [1, 0]]) / 2       # units of hbar
Sy = np.array([[0, -1j], [1j, 0]]) / 2
Sz = np.array([[1, 0], [0, -1]]) / 2
th, ph = np.radians(${th}), np.radians(${ph})
psi = np.array([np.cos(th / 2), np.exp(1j * ph) * np.sin(th / 2)])

${body}
print(sigma(Sx, psi), sigma(Sy, psi), robertson(psi))
`;
            return {
              prompt: t`The lab checks Robertson’s bound for the spin, $\sigma_{S_x}\sigma_{S_y} \ge \tfrac12|\langle[\hat S_x, \hat S_y]\rangle| = \tfrac{\hbar}{2}|\langle\hat S_z\rangle|$, in the state at $\theta = ${th}^\circ$, $\phi = ${ph}^\circ$ (units $\hbar = 1$). Write \`expect(Q, psi)\` ($\langle\psi|Q|\psi\rangle$, real), \`sigma(Q, psi)\` ($\sqrt{\langle Q^2\rangle - \langle Q\rangle^2}$) and \`robertson(psi)\`, returning the pair $(\sigma_{S_x}\sigma_{S_y},\ \tfrac12|\langle S_z\rangle|)$.`,
              starter: prog(`def expect(Q, psi):
    pass

def sigma(Q, psi):
    pass

def robertson(psi):
    pass`),
              answer: prog(`def expect(Q, psi):
    return np.vdot(psi, Q @ psi).real

def sigma(Q, psi):
    return np.sqrt(expect(Q @ Q, psi) - expect(Q, psi) ** 2)

def robertson(psi):
    return sigma(Sx, psi) * sigma(Sy, psi), abs(expect(Sz, psi)) / 2`),
              tests: [
                { name: t`$\sigma_{S_x} = ${fmt(sx, 5)}$ and $\sigma_{S_y} = ${fmt(sy, 5)}$`, code: `abs(sigma(Sx, psi) - ${sx}) < 1e-9 and abs(sigma(Sy, psi) - ${sy}) < 1e-9` },
                { name: t`the product is $${fmt(prod, 5)}$, the bound $${fmt(bound, 5)}$`, code: `abs(robertson(psi)[0] - ${prod}) < 1e-9 and abs(robertson(psi)[1] - ${bound}) < 1e-9` },
                { name: 'the bound holds for 200 random states', code: 'all((lambda p: robertson(p)[0] >= robertson(p)[1] - 1e-12)(np.array([np.cos(a / 2), np.exp(1j * b) * np.sin(a / 2)])) for a, b in np.random.default_rng(1).uniform(0, 6.3, (200, 2)))' },
                { name: t`a state in the $xz$-plane ($\phi = 0$) meets the bound exactly`, code: '(lambda p: abs(robertson(p)[0] - robertson(p)[1]) < 1e-12)(np.array([np.cos(0.4), np.sin(0.4)]))' },
              ],
              hints: ['np.vdot(psi, Q @ psi) conjugates its first argument: that is ⟨ψ|Q|ψ⟩. Keep its real part.', 'σ² = ⟨Q²⟩ − ⟨Q⟩², with Q² = Q @ Q.', 'The bound is |⟨Sz⟩|/2 in units of ħ², since [Sx, Sy] = iSz.'],
              teach: t`Robertson’s inequality bounds $\sigma_A\sigma_B$ by half the size of the commutator’s expectation value — a bound that depends on the state.`,
              explain: t`Here $\sigma_{S_x}\sigma_{S_y} = ${fmt(prod, 4)} \ge \tfrac12|\langle S_z\rangle| = ${fmt(bound, 4)}$. The bound follows the state: on the equator ($\theta = 90^\circ$) it is zero and says nothing, and for $\phi = 0$ it is met exactly — the covariance term that Schrödinger’s stronger form adds is zero there.`,
              visual: bloch(th, ph, t`The state at $\theta = ${th}^\circ$, $\phi = ${ph}^\circ$.`),
            };
          },
        }),
      ],
    },
    // ── round 3 ──
    {
      title: 'Evolve',
      story: t`Now the lab lets things run. The wire’s electron is put into an equal mixture of its two lowest states and left alone; the spin precesses in the magnet’s field; and a two-level system is driven by a coupling it cannot switch off.`,
      items: [
        num({
          id: 'r3-slosh', skill: 'phys4700.M3.1', difficulty: 3,
          gen(r) {
            const C = sloshCase(r);
            const { L, E1, T, tps, w, key } = C;
            return {
              prompt: t`At $t = 0$ the wire’s electron is in $\Psi = (\psi_1 + \psi_2)/\sqrt2$, with $\psi_n = \sqrt{2/L}\sin(n\pi x/L)$, $L = ${L}$ nm and $E_1 = ${fmt(E1 * 1e3, 4)}$ meV ($E_2 = 4E_1$). The probability of finding it in the left half is $$P_L(t) = \tfrac12 + \tfrac{4}{3\pi}\cos\Big(\frac{(E_2 - E_1)t}{\hbar}\Big).$$ What is $P_L$ at $t = ${tps}$ ps? ($\hbar = ${fmt((HBAR / QE) * 1e15, 6)}$ meV ps.)`,
              visual: boxDensity(L, t`$|\Psi(x, 0)|^2$ in the ${L} nm wire: piled in the left half at $t = 0$ (shaded). It sloshes to the right and back with period $h/(E_2 - E_1)$.`),
              answer: key, tol: { rel: 0, abs: 0.004 },
              errors: apart([
                { value: 0.5 + (4 / (3 * Math.PI)), feedback: t`That is the value at $t = 0$. The cross term oscillates at $(E_2 - E_1)/\hbar$.` },
                { value: 0.5 + (4 / (3 * Math.PI)) * Math.cos((4 * w / 3) * tps), feedback: t`The beat is at the *difference* $E_2 - E_1 = 3E_1$, not at $E_2$.` },
                { value: 0.5, feedback: t`The cross term does not vanish: $|\Psi|^2$ contains $\psi_1\psi_2\cos(\Delta E\,t/\hbar)$.` },
              ], key, 0.02),
              hints: [t`$(E_2 - E_1)/\hbar = 3E_1/\hbar = ${fmt(w, 4)}$ rad/ps.`, t`Multiply by $t = ${tps}$ ps, take the cosine (in radians), and use the formula.`],
              teach: 'A superposition of two stationary states sloshes at the Bohr frequency (E₂ − E₁)/ħ; each alone would sit still.',
              explain: t`$\omega_{21}t = ${fmt(w, 4)}\times${tps} = ${fmt(w * tps, 4)}$ rad, so $P_L = 0.5 + 0.4244\cos(${fmt(w * tps, 4)}) = ${fmt(key, 3)}$. The full period is $h/3E_1 = ${fmt(T, 3)}$ ps: terahertz sloshing, the basis of quantum-cascade and intersubband devices.`,
            };
          },
        }),
        num({
          id: 'r3-larmor', skill: 'phys4700.M6.2', difficulty: 3,
          gen(r) {
            const C = larmorCase(r);
            const { B, tns, w, ph, key } = C;
            return {
              prompt: t`The spin is prepared along $+x$ and the magnet applies $B = ${B}$ mT along $z$. It precesses at the Larmor frequency $\omega = \gamma_eB$, with $\gamma_e = ${tex(GAMMA_E, 7)}\ \text{s}^{-1}\text{T}^{-1}$. What is the probability of finding it along $+x$ again after $${tns}$ ns?`,
              visual: bloch(90, 0, 'The spin starts on the equator at +x and precesses round the z-axis (violet), the field direction. Drag to rotate.', { curves: [{ param: ['cos(t)', 'sin(t)', '0'], t: [0, 6.2832], color: 'violet' }] }),
              answer: key, tol: { rel: 0, abs: 0.004 },
              errors: apart([
                { value: Math.cos(ph) ** 2, feedback: t`The Bloch vector turns by $\omega t$, but $P(+x) = \cos^2(\omega t/2)$: the half angle, as with every spin-½ amplitude.` },
                { value: Math.cos(ph / 4) ** 2, feedback: t`$\gamma_e$ already includes the electron’s $g \approx 2$; do not halve it again.` },
                { value: Math.sin(ph / 2) ** 2, feedback: 'That is the probability of −x.' },
              ], key, 0.02),
              hints: [t`$\omega t = \gamma_eBt = ${tex(GAMMA_E, 4)}\times${B / 1000}\times${tns}\times10^{-9} = ${fmt(ph, 4)}$ rad.`, t`$P(+x) = \cos^2(\omega t/2)$.`],
              teach: 'Precession turns the Bloch vector by ωt about the field; the probability along the starting axis is cos²(ωt/2).',
              explain: t`$\omega t = ${fmt(ph, 4)}$ rad (the vector has turned $${fmt(ph / D, 4)}^\circ$), so $P(+x) = \cos^2(${fmt(ph / 2, 4)}) = ${fmt(key, 3)}$. At ${B} mT the electron spin turns once every $${fmt((2 * Math.PI / w) * 1e9, 3)}$ ns.`,
            };
          },
        }),
        code({
          id: 'r3-rabi', skill: 'phys4700.M4.7', difficulty: 3,
          gen(r) {
            const C = rabiCase(r);
            const { Dl, ep, Om, P2, pmax, tmax } = C;
            const prog = (body) => t`import numpy as np

Delta, eps = ${Dl}, ${ep}          # rad/ns, hbar = 1
H = np.array([[0, Delta], [Delta, eps]], dtype=float)
psi0 = np.array([1, 0], dtype=complex)

${body}
print(P2(0.5), P2(1.0))
`;
            return {
              prompt: t`Two states of a quantum dot are coupled: $\hat H = \begin{pmatrix} 0 & \Delta\\ \Delta & \varepsilon\end{pmatrix}$ with $\Delta = ${Dl}$ and $\varepsilon = ${ep}$ rad/ns ($\hbar = 1$). Starting in state 1, evolve with $\hat U(t) = e^{-i\hat Ht}$, built from the eigenvectors of $\hat H$ (\`np.linalg.eigh\`). Write \`U(t)\` and \`P2(t)\`, the probability of state 2 at time $t$ (ns).`,
              starter: prog(`def U(t):
    pass

def P2(t):
    pass`),
              answer: prog(`def U(t):
    E, V = np.linalg.eigh(H)
    return V @ np.diag(np.exp(-1j * E * t)) @ V.conj().T

def P2(t):
    return abs((U(t) @ psi0)[1]) ** 2`),
              tests: [
                { name: t`$\hat U(t)$ is unitary`, code: 'np.allclose(U(0.7).conj().T @ U(0.7), np.eye(2))' },
                { name: t`$P_2(0.5) = ${fmt(P2(0.5), 5)}$ and $P_2(1) = ${fmt(P2(1), 5)}$ (Rabi’s formula)`, code: `abs(P2(0.5) - ${P2(0.5)}) < 1e-9 and abs(P2(1.0) - ${P2(1)}) < 1e-9` },
                { name: t`the largest transfer is $4\Delta^2/\Omega^2 = ${fmt(pmax, 4)}$, at $t = \pi/\Omega = ${fmt(tmax, 4)}$ ns`, code: `abs(P2(${tmax}) - ${pmax}) < 1e-9 and max(P2(t) for t in np.linspace(0, 5, 2001)) < ${pmax} + 1e-9` },
              ],
              hints: ['E, V = np.linalg.eigh(H) gives eigenvalues and eigenvectors (columns).', 'U(t) = V diag(e^(−iEt)) V†: in the eigenbasis, evolution is just a phase on each component.', 'P2(t) is |second component of U(t) @ psi0|².'],
              teach: 'For a time-independent Ĥ, evolution is a phase e^(−iEt/ħ) on each energy eigenstate: diagonalize, phase, transform back.',
              explain: t`With $\Omega = \sqrt{\varepsilon^2 + 4\Delta^2} = ${fmt(Om, 4)}$ rad/ns, $P_2(t) = \dfrac{4\Delta^2}{\Omega^2}\sin^2\dfrac{\Omega t}{2}$: never full transfer while $\varepsilon \ne 0$, peaking at $${fmt(pmax, 3)}$. The same three lines evolve any finite system — a qubit, a molecule, the $n = 2$ level of hydrogen in a field.`,
            };
          },
        }),
      ],
    },
    // ── round 4 ──
    {
      title: 'Three dimensions and fields',
      story: t`The hydrogen cell comes on line. Its electrons live in three dimensions, carry spin and orbital angular momentum together, and — in the lab’s electron microscope next door — feel potentials where there is no field.`,
      items: [
        num({
          id: 'r4-radius', skill: 'phys4700.M5.2', difficulty: 3,
          gen(r) {
            const C = radiusCase(r);
            const { n, l, key } = C;
            const sp = 'spdf'[l];
            return {
              prompt: t`A hydrogen atom in the cell is excited to the $${n}${sp}$ state ($n = ${n}$, $l = ${l}$). Its mean distance from the proton is $\langle r\rangle = \tfrac{a}{2}\big[3n^2 - l(l+1)\big]$, with $a = ${fmt(A0 * 1e12, 7)}$ pm. What is $\langle r\rangle$, in pm?`,
              visual: { type: 'mp-orbitals', params: { n, l, m: 0, panels: ['cloud', 'radial'], marks: ['peak'], controls: false, readout: false }, caption: t`The $${n}${sp}$ cloud (slice through the nucleus) and its radial probability $P(r)$, with the most probable radius marked — which is not the mean.` },
              answer: key, units: 'pm', tol: { rel: 0.005 },
              errors: apart([
                { value: n * n * A0 * 1e12, feedback: t`$n^2a$ is Bohr’s orbit radius (and the most probable radius only when $l = n - 1$). The mean is $\tfrac a2[3n^2 - l(l+1)]$.` },
                { value: 1.5 * n * n * A0 * 1e12, feedback: t`That ignores $l$: states with more angular momentum have rounder, less spread-out orbits, and a smaller mean.` },
              ], key),
              hints: [t`$3n^2 - l(l+1) = ${3 * n * n} - ${l * (l + 1)} = ${3 * n * n - l * (l + 1)}$.`, t`Multiply by $a/2 = ${fmt(A0 * 1e12 / 2, 6)}$ pm.`],
              teach: 'Hydrogen’s size grows as n², with ⟨r⟩ = (a/2)[3n² − l(l + 1)].',
              explain: t`$\langle r\rangle = \tfrac{${fmt(A0 * 1e12, 6)}}{2}(${3 * n * n - l * (l + 1)}) = ${fmt(key, 4)}$ pm, against $n^2a = ${fmt(n * n * A0 * 1e12, 4)}$ pm. Low-$l$ states have long tails (and inner bumps) that pull the mean out.`,
            };
          },
        }),
        num({
          id: 'r4-cg', skill: 'phys4700.M6.3', difficulty: 3,
          gen(r) {
            const C = cgCase(r);
            const { l, m2, m, key } = C;
            const jt = `${2 * l - 1}/2`;
            return {
              prompt: t`An electron with $l = ${l}$ and spin ½ is in the total-angular-momentum state $|j = ${jt},\ m_j = ${m2}/2\rangle$, the lower of the two $j$ values. Its Clebsch–Gordan expansion is $$\begin{gathered} |l - \tfrac12,\ m\rangle = -\sqrt{\frac{l - m + \frac12}{2l + 1}}\,|m - \tfrac12\rangle|{\uparrow}\rangle \\ + \sqrt{\frac{l + m + \frac12}{2l + 1}}\,|m + \tfrac12\rangle|{\downarrow}\rangle \end{gathered}$$ What is the probability that a measurement of $\hat L_z$ gives $m_l\hbar$ with $m_l = ${fmt(m - 0.5, 2)}$?`,
              visual: dotsPic(l, t`The $2(2l + 1) = ${2 * (2 * l + 1)}$ product states $|m_l\rangle|m_s\rangle$ for $l = ${l}$, placed by total $m$; each $j$ state of given $m$ mixes the two dots in its column.`),
              answer: key, tol: { rel: 0, abs: 0.003 },
              errors: apart([
                { value: (l + m + 0.5) / (2 * l + 1), feedback: t`That is the weight of the other product state, $|m + \tfrac12\rangle|{\downarrow}\rangle$, which has $m_l = ${fmt(m + 0.5, 2)}$.` },
                { value: 0.5, feedback: 'The two components are not equally weighted: square the coefficients.' },
                { value: Math.sqrt(key), feedback: 'Square the coefficient (and its sign does not matter).' },
              ], key, 0.02),
              hints: [t`$m_l = m - \tfrac12$ goes with the spin-up product state.`, t`Its probability is $\dfrac{l - m + \frac12}{2l + 1}$ with $l = ${l}$, $m = ${fmt(m, 2)}$.`],
              teach: 'Squared Clebsch–Gordan coefficients are the probabilities of the product states inside a total-j state.',
              explain: t`$P = \dfrac{${l} - (${fmt(m, 2)}) + \frac12}{${2 * l + 1}} = ${fmt(key, 4)}$. In $|j\,m_j\rangle$ the total is sharp, but $m_l$ and $m_s$ are not — which is why weak-field Zeeman levels are labelled by $m_j$.`,
            };
          },
        }),
        num({
          id: 'r4-ab', skill: 'phys4700.M7.1', difficulty: 3,
          gen(r) {
            const C = abCase(r);
            const { R, B, Phi, key } = C;
            return {
              prompt: t`Next door, an electron biprism splits a beam to pass either side of a tiny shielded solenoid of radius $${R}$ nm holding $B = ${B}$ mT, which no electron enters. By how many fringes does the interference pattern shift when the solenoid is switched on? ($h/e = ${tex(PHI0, 5)}$ Wb.)`,
              visual: abPic('Two electron paths round a solenoid seen end-on (teal); outside it B = 0. Not to scale.'),
              answer: key, tol: { rel: 0.01 },
              errors: apart([
                { value: key * 2, feedback: t`One fringe is $h/e$ for electrons; $h/2e$ is the superconducting flux quantum.` },
                { value: key * 2 * Math.PI, feedback: t`That is the phase $e\Phi/\hbar$ in radians; one fringe is $2\pi$.` },
                { value: key * 4, feedback: t`$${R}$ nm is the radius: $\Phi = \pi R^2B$.` },
              ], key),
              hints: [t`$\Phi = \pi R^2B$.`, t`Fringe shift $= \Phi/(h/e)$.`],
              teach: 'The Aharonov–Bohm shift counts the enclosed flux in units of h/e, though the electrons never touch the field.',
              explain: t`$\Phi = \pi(${R}\times10^{-9})^2(${B / 1000}) = ${tex(Phi, 3)}$ Wb, and $\Phi/(h/e) = ${fmt(key, 3)}$ fringes. The envelope does not move — no force acts — only the relative phase $e\Phi/\hbar$ of the two paths.`,
            };
          },
        }),
      ],
    },
    // ── round 5 ──
    {
      title: 'Perturb',
      story: t`Last, the lab applies its fields and checks the shifted spectrum against perturbation theory — and checks perturbation theory itself against a brute-force answer.`,
      items: [
        num({
          id: 'r5-stark', skill: 'phys4700.M8.2', difficulty: 3,
          gen(r) {
            const C = starkCase(r);
            const { F, dE, key } = C;
            return {
              prompt: t`Electrodes put $${F}$ kV/cm across the hydrogen cell. The $n = 2$ level splits by the linear Stark effect into $\pm3ea\mathcal E$ and a doubly degenerate 0, while $1s$ hardly moves, so Lyman-α ($2 \to 1$, $${LYA}$ nm) breaks into components. How far apart in wavelength, in pm, are the two outermost? ($a = ${fmt(A0 * 1e9, 6)}$ nm, $hc = ${fmt(HC, 7)}$ eV nm.)`,
              visual: starkPic(F, t`The $n = 2$ Stark components against field, unlabelled; grey line at ${F} kV/cm. First order.`),
              answer: key, units: 'pm', tol: { rel: 0.01 },
              errors: apart([
                { value: key / 2, feedback: t`One component is shifted by $3ea\mathcal E$; the outer two are $6ea\mathcal E$ apart.` },
                { value: key / 3, feedback: t`The matrix element $\langle200|e\mathcal Ez|210\rangle$ is $-3ea\mathcal E$, not $-ea\mathcal E$.` },
              ], key),
              hints: [t`$\Delta E = 6ea\mathcal E$, which in eV is $6a\mathcal E$ with $a$ in metres and $\mathcal E$ in V/m.`, t`$\Delta\lambda = \lambda^2\Delta E/hc$.`],
              teach: 'Degenerate perturbation theory gives n = 2 hydrogen a linear Stark splitting of ±3eaℰ.',
              explain: t`$\Delta E = 6(${tex(A0, 5)})(${F}\times10^{5}) = ${tex(dE, 4)}$ eV and $\Delta\lambda = (${LYA})^2(${tex(dE, 4)})/${fmt(HC, 6)} = ${fmt(key, 3)}$ pm. Linear in the field because $2s$ and $2p$ are degenerate and mix into states with permanent dipole moments $\mp3ea$.`,
            };
          },
        }),
        num({
          id: 'r5-zeeman', skill: 'phys4700.M8.4', difficulty: 4,
          gen(r) {
            const C = zeemanCase(r);
            const { B, nu0, shift, mix, key } = C;
            return {
              prompt: t`At zero field, first-order fine structure puts hydrogen’s $2P_{3/2}$ level $${nu0}$ GHz above $2P_{1/2}$. In a weak field of $${B}$ mT, what is the frequency (GHz) of the magnetic-dipole transition from $2P_{1/2},\ m_j = +\tfrac12$ up to $2P_{3/2},\ m_j = +\tfrac32$? Use Landé’s $g_J$ for each level and $\mu_B/h = ${fmt(MUB * QE / H / 1e9, 6)}$ GHz/T.`,
              visual: zeemanPic(B, t`Weak-field Zeeman fans of $2P_{3/2}$ (gold, four sublevels) and $2P_{1/2}$ (blue, two) against $B$; grey line at ${B} mT. Energies unlabelled; the fans are drawn ten times steeper than they are, so they can be seen against the 45 μeV gap.`),
              answer: key, units: 'GHz', tol: { rel: 0, abs: 0.003 },
              errors: apart([
                { value: nu0 + ((1.5 - 0.5) * MUB * B * 1e-3 * QE) / H / 1e9, feedback: t`Each level shifts by $g_J\mu_BBm_j$: $g = \tfrac43$ for $2P_{3/2}$ and $\tfrac23$ for $2P_{1/2}$, not 1.` },
                { value: nu0 + ((2 * 1.5 - 2 * 0.5) * MUB * B * 1e-3 * QE) / H / 1e9, feedback: t`$g = 2$ is the free spin. With orbital motion, $g_J = \tfrac43$ and $\tfrac23$ for these levels.` },
                { value: nu0 + ((2 + 1 / 3) * MUB * B * 1e-3 * QE) / H / 1e9, feedback: t`Subtract the lower level’s shift: $\Delta E = (\tfrac43\cdot\tfrac32 - \tfrac23\cdot\tfrac12)\mu_BB$.` },
              ], key, 0.0001, 0.00005),
              hints: [t`$g_J = 1 + \dfrac{j(j+1) - l(l+1) + \frac34}{2j(j+1)}$: $\tfrac43$ for $j = \tfrac32$ and $\tfrac23$ for $j = \tfrac12$ (with $l = 1$).`, t`The transition gains $(\tfrac43\cdot\tfrac32 - \tfrac23\cdot\tfrac12)\mu_BB = \tfrac53\mu_BB$.`],
              teach: t`A transition’s Zeeman shift is the difference of the two levels’ $g_J\mu_BBm_j$.`,
              explain: t`The upper sublevel rises by $2\mu_BB$ and the lower by $\tfrac13\mu_BB$, so the line moves up by $\tfrac53\mu_BB/h = ${fmt(shift, 4)}$ GHz, to $${fmt(key, 6)}$ GHz. At ${B} mT, $\mu_BB = ${fmt(MUB * B * 1e3, 3)}\ \mu$eV against a 45 μeV gap, so the weak-field formula is good: the exact mixing of the two $m_j = \tfrac12$ states (second order in $B$) moves the line by only about $${fmt(mix * 1e3, 2)}$ MHz.`,
            };
          },
        }),
        code({
          id: 'r5-anharmonic', skill: 'phys4700.M8.1', difficulty: 4,
          gen(r) {
            const C = anharmCase(r);
            const { lam, exact, first, second } = C;
            const prog = (body) => t`import numpy as np

lam = ${lam}
N = 60
n = np.arange(N)
a = np.diag(np.sqrt(n[1:]), k=1)       # lowering operator in the number basis
x = (a + a.T) / np.sqrt(2)             # units: hbar = m = omega = 1

${body}
print(E0_exact(), E0_pert())
`;
            return {
              prompt: t`The wire’s transverse confinement is not quite harmonic: $\hat H = \tfrac12\hat p^2 + \tfrac12\hat x^2 + \lambda\hat x^4$ in units of $\hbar\omega$ and the oscillator length, with $\lambda = ${lam}$. Write \`E0_exact()\`, the lowest eigenvalue of $\hat H$ in the first $N = 60$ oscillator states (use the given $\hat x$; $\hat H_0$ is diagonal, $n + \tfrac12$), and \`E0_pert()\`, the perturbation series through second order: $\tfrac12 + \tfrac34\lambda - \tfrac{21}{8}\lambda^2$.`,
              starter: prog(`def E0_exact():
    pass

def E0_pert():
    pass`),
              answer: prog(`def E0_exact():
    x4 = np.linalg.matrix_power(x, 4)
    H = np.diag(n + 0.5) + lam * x4
    return np.linalg.eigvalsh(H)[0]

def E0_pert():
    return 0.5 + 0.75 * lam - 21 / 8 * lam**2`),
              tests: [
                { name: t`the exact ground state is $${fmt(exact, 7)}$`, code: `abs(E0_exact() - ${exact}) < 1e-8` },
                { name: t`second order gives $${fmt(second, 7)}$`, code: `abs(E0_pert() - ${second}) < 1e-12` },
                { name: 'second order beats first order, ½ + 3λ/4', code: `abs(E0_pert() - E0_exact()) < abs(${first} - E0_exact())` },
              ],
              hints: ['x⁴ is np.linalg.matrix_power(x, 4); the truncation only spoils the top few states, not the ground state.', 'H = np.diag(n + 0.5) + lam * x4, and np.linalg.eigvalsh returns ascending eigenvalues.', 'The first-order term is λ⟨0|x⁴|0⟩ = 3λ/4.'],
              teach: 'Exact diagonalization in a truncated basis checks the perturbation series: E₀ = ½ + ¾λ − 21λ²/8 + …',
              explain: t`Exact: $${fmt(exact, 7)}$; first order $${fmt(first, 6)}$; second order $${fmt(second, 7)}$. The leftover, $${tex(exact - second, 2)}$, is the third-order term ($+\tfrac{333}{16}\lambda^3$ and beyond). This series famously never converges — its coefficients grow factorially, because $\lambda < 0$ would make the well bottomless — yet its first few terms are excellent for small $\lambda$.`,
              visual: { type: 'graph', params: { x: [-3, 3], y: [0, 4], aspect: 'wide', xlabel: 'x (oscillator lengths)', ylabel: 'V (units of ħω)', axesAt: 'edge', xticks: 6, yticks: 4, curves: [{ fn: '0.5*x^2', color: 'ink3', width: 1.6, dash: [5, 4] }, { fn: `0.5*x^2 + ${lam}*x^4`, color: 'accent', width: 2.4 }], hlines: [{ y: 0.5, color: 'ink4' }] }, caption: `The harmonic well (dashed) and the anharmonic one for λ = ${lam} (blue); the grey line is the unperturbed ground level ½ħω.` },
            };
          },
        }),
      ],
    },
  ],
});
