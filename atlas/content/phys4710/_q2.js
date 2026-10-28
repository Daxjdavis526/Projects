// Shared helpers for the PHYS 4710 lessons (Quantum Mechanics II): constants
// beyond those in phys4700/_qm.js, the integrals of the helium and H₂⁺
// variational calculations, a small symmetric eigensolver for matrix
// numerics, and picture builders. Every picture is an ordinary sim spec, so
// the content test validates it like any other visual. Not a lesson: the
// leading underscore keeps it out of the registry.
//
// Exact constants are the 2019 SI's; measured ones are CODATA 2022 (Rev. Mod.
// Phys. 97, 025002, 2025). Atomic levels are NIST ASD (helium); ionization
// energies NIST; the caesium and rubidium data are Steck's "Cesium 133 D Line
// Data" (rev. 2.3.3) and "Rubidium 87 D Line Data" (rev. 2.3.3).

import { C, H, HBAR, QE, ME, MP, MU_B, r6, seg, label } from '../phys4700/_qm.js';
import { RINF, A0, MP_ME, HC_EVNM } from '../phys2710/_constants.js';

const t = String.raw;

export { C, H, HBAR, QE, ME, MP, MU_B, r6, seg, label, RINF, A0, MP_ME };

export const ALPHA = 7.2973525643e-3;              // fine-structure constant (CODATA 2022)
export const EPS0 = 8.8541878188e-12;              // F/m, vacuum permittivity (CODATA 2022)
export const RYD = (H * C * RINF) / QE;            // eV, hcR∞ = 13.605 693 122 99…
export const EH = 2 * RYD;                         // eV, the hartree: 27.211 386 245 98…
export const A0_NM = A0 * 1e9;                     // nm
export const A0_ANG = A0 * 1e10;                   // Å
export const MN = 1.67492750056e-27;               // kg, neutron (CODATA 2022)
export const MU_N_NEUTRON = 9.6623653e-27;         // J/T, |magnetic moment| of the neutron (CODATA 2022)
export const GAMMA_N = (2 * MU_N_NEUTRON) / HBAR;  // s⁻¹ T⁻¹, neutron gyromagnetic ratio: 1.832 47…e8
export const MU_N = 5.0507837393e-27;              // J/T, nuclear magneton (CODATA 2022)
export const NA = 6.02214076e23;                   // mol⁻¹ (exact)
export const KB = 1.380649e-23;                    // J/K (exact)
export const HC_EVCM = HC_EVNM * 1e-7;             // eV per cm⁻¹: 1.239 841 98…e-4
export const G0 = 9.80665;                         // m/s², standard gravity (exact)

// ── helium (NIST ASD), level energies in cm⁻¹ above the ground state ──
export const HE = {
  ie1: 198310.669 * HC_EVCM,          // eV, He → He⁺: 24.587 39
  ie2: 438908.8789 * HC_EVCM,         // eV, He⁺ → He²⁺: 54.417 76
  s3: 159855.9743 * HC_EVCM,          // 1s2s ³S₁ (orthohelium's lowest level)
  s1: 166277.4403 * HC_EVCM,          // 1s2s ¹S₀
  p3: 169086.8 * HC_EVCM,             // 1s2p ³P (the three J levels lie within 0.000 13 eV)
  p1: 171134.8970 * HC_EVCM,          // 1s2p ¹P₁
};
HE.total = HE.ie1 + HE.ie2;           // eV, energy to strip both electrons: 79.005
// Li⁺, the next two-electron ion (NIST): Li II 75.6400 eV, Li III 122.454 eV
export const LIP_TOTAL = 75.6400 + 122.45436;

/** Helium-like ion, one-parameter variational energy E(ζ) = ζ² − 2Zζ + (5/8)ζ in hartree. */
export const heE = (Z, z) => z * z - 2 * Z * z + (5 / 8) * z;
export const heZeff = (Z) => Z - 5 / 16;

/** H₂⁺ LCAO integrals (R in a₀): overlap S, direct D, exchange X (Griffiths & Schroeter §8.3). */
export const h2S = (R) => Math.exp(-R) * (1 + R + (R * R) / 3);
export const h2D = (R) => 1 / R - (1 + 1 / R) * Math.exp(-2 * R);
export const h2X = (R) => (1 + R) * Math.exp(-R);
/** Energy of H₂⁺ relative to H(1s) + p, in hartree: bonding (s = +1) or antibonding (s = −1). */
export const h2U = (R, s = 1) => 1 / R - (h2D(R) + s * h2X(R)) / (1 + s * h2S(R));
/** The same as a graph expression of x = R/a₀, in eV. */
export const h2Expr = (s = 1) => `${r6(EH)}*(1/x - ((1/x - (1 + 1/x)*exp(-2*x)) ${s > 0 ? '+' : '-'} (1 + x)*exp(-x))/(1 ${s > 0 ? '+' : '-'} exp(-x)*(1 + x + x^2/3)))`;
// the exact (Born–Oppenheimer) minimum: R = 2.00 a₀, E = −1.102 634 hartree electronic (Bates, Ledsham & Stewart 1953)
export const H2P_EXACT = { R: 1.997, De: 0.1026342 * EH };   // D_e = 0.102 634 hartree = 2.79 eV; D₀ (from the lowest vibrational level) = 2.65 eV

/** Golden-section minimum of f on [a, b]. Returns [x, f(x)]. */
export function goldenMin(f, a, b, tol = 1e-12) {
  const g = (Math.sqrt(5) - 1) / 2;
  let c = b - g * (b - a), d = a + g * (b - a), fc = f(c), fd = f(d);
  for (let i = 0; i < 300 && b - a > tol; i++) {
    if (fc < fd) { b = d; d = c; fd = fc; c = b - g * (b - a); fc = f(c); } else { a = c; c = d; fc = fd; d = a + g * (b - a); fd = f(d); }
  }
  const x = 0.5 * (a + b);
  return [x, f(x)];
}

/** Eigenvalues (ascending) of a real symmetric matrix, by cyclic Jacobi rotations. */
export function eigSym(A0m) {
  const n = A0m.length, A = A0m.map((r) => r.slice());
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
    if (off < 1e-26) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const tt = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
      for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
    }
  }
  return A.map((r, i) => r[i]).sort((a, b) => a - b);
}

/**
 * The anharmonic oscillator H = p²/2 + x²/2 + λx⁴ (ħ = m = ω = 1) in the
 * oscillator basis (N states): its lowest eigenvalue, converged for λ ≤ 2.
 */
export function anharmonicE0(lam, N = 60) {
  // x = (a + a†)/√2; build x as a matrix in the basis |0…N+3⟩ and square twice
  const M = N + 4, X = Array.from({ length: M }, () => new Array(M).fill(0));
  for (let k = 0; k + 1 < M; k++) { X[k][k + 1] = X[k + 1][k] = Math.sqrt((k + 1) / 2); }
  const mul = (A, B) => A.map((r, i) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
  const X2 = mul(X, X), X4 = mul(X2, X2);
  const Hm = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? i + 0.5 : 0) + lam * X4[i][j]));
  return eigSym(Hm)[0];
}

/** |⟨n10|z|100⟩|² in a₀² (hydrogen; the closed form of Bethe & Salpeter §63). */
export const z2n = (n) => Math.exp(8 * Math.LN2 + 7 * Math.log(n) + (2 * n - 5) * Math.log(n - 1) - Math.log(3) - (2 * n + 5) * Math.log(n + 1));

// ── pictures ──

/**
 * Two particles in a box of width 1: |ψ(x₁, x₂)|² as a shaded contour map on
 * the (x₁, x₂) square. s = +1 symmetric (bosons, or spin singlet), −1
 * antisymmetric (fermions in a spin triplet), 0 distinguishable (particle 1 in
 * state a, particle 2 in state b). With controls, sliders for a, b and a
 * choice for s, and the rms separation as a readout.
 */
export function pairPic({ a = 1, b = 2, s = -1, controls = false, readout = false, caption, diagonal = true, extra = {} } = {}) {
  const A = controls ? 'na' : a, B = controls ? 'nb' : b, S = controls ? 'sym' : s;
  const f = `4/(1 + (${S})^2)/(1 + max(${S}, 0)*step(0.5 - abs(${A} - ${B})))*(sin(${A}*pi*x)*sin(${B}*pi*y) + (${S})*sin(${B}*pi*x)*sin(${A}*pi*y))^2`;
  const xab = `(-8*${A}*${B}/(pi^2*max((${A}^2 - ${B}^2)^2, 1))*(1 - cos(pi*(${A} + ${B})))/2)`;
  const d2 = `(2/3 - 1/(2*pi^2*${A}^2) - 1/(2*pi^2*${B}^2) - 1/2 - 2*(${S})*${xab}^2)`;
  return {
    type: 'c3-contour',
    params: {
      f, x: [0, 1], y: [0, 1], levels: 7, labels: false, fill: true, aspect: 'square', xlabel: 'x₁ / L', ylabel: 'x₂ / L', n: 120,
      ...(controls ? {
        sliders: [
          { key: 'na', label: t`State $a$`, min: 1, max: 4, step: 1, value: a, explain: 'The first single-particle state of the infinite well, n = 1, 2, 3 or 4.' },
          { key: 'nb', label: t`State $b$`, min: 1, max: 4, step: 1, value: b, explain: 'The second single-particle state.' },
        ],
        choices: [{ key: 'sym', label: 'Particles', options: [[1, 'identical bosons (symmetric)'], [-1, 'identical fermions (antisymmetric)'], [0, 'distinguishable']], value: s, explain: 'How the two-particle wave function treats an exchange of the labels 1 and 2. For spin-½ fermions, antisymmetric in space means the spins are in a triplet state, such as both up.' }],
      } : {}),
      curves: diagonal ? [{ param: ['t', 't'], t: [0, 1], color: 'ink2', width: 1.4, dash: [5, 4] }] : [],
      ...(readout ? { readouts: [{ label: t`rms separation $\sqrt{\langle(x_1 - x_2)^2\rangle}/L$`, expr: `sqrt(${d2})`, digits: 3 }] } : {}),
      ...extra,
    },
    caption: caption || 'The joint probability density |ψ(x₁, x₂)|² of two non-interacting particles in an infinite well of width L: bright where finding particle 1 at x₁ and particle 2 at x₂ is likely. Dashed: the diagonal x₁ = x₂, where the two coincide.',
  };
}
/**
 * Energy levels as horizontal bars: levels [{ E, x0, x1, color, label, dx, dy, align }]
 * and optional arrows; y in the levels' units.
 */
export function levelPic(levels, { y, x = [0, 4], ylabel = 'energy (eV)', xlabel = '', caption, arrows = [], points = [], yticks = 4, extra = {} } = {}) {
  return {
    type: 'graph',
    params: {
      x, y: y.map(r6), aspect: 'wide', xlabel, ylabel, xticks: 0, yticks, axesAt: 'edge', grid: false,
      curves: levels.map((L) => ({ ...seg(L.x0 ?? 0.5, L.E, L.x1 ?? 1.5, L.E, L.color || 'accent', L.width || 2.6), ...(L.dash ? { dash: L.dash } : {}) })),
      points: [...levels.filter((L) => L.label).map((L) => label(L.lx ?? (L.x1 ?? 1.5), L.E, L.label, L.color || 'accent', L.dx ?? 6, L.dy ?? 0, L.align)), ...points],
      arrows, ...extra,
    },
    caption,
  };
}
