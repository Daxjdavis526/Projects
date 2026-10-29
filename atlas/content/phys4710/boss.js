// The PHYS 4710 boss, "The Approximation Arena": five bouts in which an
// approximation method meets a problem whose exact answer is known, and the
// learner must choose the method, justify it, and estimate its error.
// Perturbation theory: an electron in a GaAs quantum well under a field (the
// quantum-confined Stark effect of a laser modulator) — the first-order shift
// vanishes by parity (M2.3), the n = 2 term alone carries 99.87% of the
// second-order shift (M3.2), and a diagonalization in the well's own basis
// finds where second order fails (M0.1, in code). The variational principle:
// neutrons bouncing above a mirror (qBounce) with a half-Gaussian trial, 0.29%
// above the Airy value (M4.1), and what the bound does and does not justify.
// WKB: the 1 → n bouncing transition frequency against the Airy zeros (M5.3),
// and a quantum point contact as an inverted-parabola barrier, where WKB's
// relative error is e^{−2γ} — about T itself (Kemble; M5.2). Born: slow
// neutrons on a square-well nucleus, whose low-energy cross section Born
// underestimates by (3(tan g/g − 1)/g²)² (M6.3), and when Born can be trusted
// (M6.2/M6.3). Sudden against adiabatic: beta decay of tritium or ⁶He⁺, the
// electron left in 1s or 2s of the daughter ion (M7.5), and the slowest
// Landau–Zener sweep that still makes a 99% (or 99.9%) adiabatic passage
// (M7.5). Every number a learner reads comes from its generator; the case
// functions are exported so a script can recompute every key another way.
// Constants CODATA 2022 (through phys4700/_qm.js and phys4710/_q2.js).
import { boss, mcq, multi, num, code } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { HBAR, QE, MN, H, eigSym, r6, seg, label } from './_q2.js';
import { HB2M_EVNM2, HBARC_EVNM, potPic, wkbPic, geomPic } from './_q2b.js';

const t = String.raw;
const PI = Math.PI;
const tn = (x, n = 3) => tex(x, n);
const MSTAR = 0.067;                                  // GaAs conduction-band effective mass, in mₑ
const MHH = 0.35;                                     // a GaAs heavy hole along the growth axis (typical), in mₑ
const MNC2 = 939.56542194;                            // MeV, neutron (CODATA 2022)
const H_PEVS = (H / QE) * 1e12;                       // h in peV s: 4.1357e-3
// zeros of Ai(−x): the exact bouncer energies in units of mgℓ (Abramowitz & Stegun Table 10.13)
export const AIRY = [2.338107410459767, 4.087949444130970, 5.520559828095551, 6.786708090071759, 7.944133587120853, 9.022650853340980];
const PLACES = [
  { name: 'Earth', where: 'at the Institut Laue–Langevin in Grenoble', g: 9.81 },
  { name: 'the Moon', where: 'in an imagined lunar laboratory', g: 1.62 },
  { name: 'Mars', where: 'in an imagined laboratory on Mars', g: 3.71 },
];

/** Keep only the slips whose values are finite and clearly apart from the key (and from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v), 1e-12);
  for (const e of errors) if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  return kept;
}

// ── bout 1: perturbation theory — the tilted well ───────────────────────────
/** ⟨m|x|n⟩ for the box on [0, π] with states √(2/π) sin(nx). */
export const xel = (m, n) => (m === n ? PI / 2 : (m + n) % 2 === 0 ? 0 : (-8 * m * n) / (PI * (m * m - n * n) ** 2));
/** Lowest eigenvalue of H = n²/2 + F x on [0, π] (ħ = m = 1), in the box basis of N states. */
export function tiltGround(F, N = 40) {
  return eigSym(Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? (i + 1) ** 2 / 2 : 0) + F * xel(i + 1, j + 1))))[0];
}
/** The shift beyond the trivial first-order Fπ/2: exact (diagonalized) and second order, in units ħ = m = 1, L = π. */
export const shiftExact = (F) => tiltGround(F) - 0.5 - (F * PI) / 2;
export const shiftPert = (F) => (-(15 - PI * PI) * F * F) / 24;
export const relError = (F) => Math.abs(shiftPert(F) - shiftExact(F)) / Math.abs(shiftExact(F));
/** The field (units ħ = m = 1, L = π) at which second order is wrong by err. */
export function fieldAt(err) {
  let lo = 0.01, hi = 3;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (relError(m) < err) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/** A GaAs well of width L (nm) in a field F (kV/cm): the downward shift from the n = 2 term, the full second order and the exact one, meV. */
export function qcseCase(r) {
  const L = r.pick([8, 10, 12]), F = r.pick([20, 30, 40, 50]);
  const hb2m = HB2M_EVNM2 / MSTAR;                    // ħ²/2m* in eV nm²
  const E1 = hb2m * (PI / L) ** 2;                    // eV
  const eF = F * 1e-4;                                // eV/nm: 1 kV/cm = 10⁻⁴ V/nm
  const x21 = (16 * L) / (9 * PI * PI);               // nm, |⟨2|x|1⟩|
  const one = ((eF * x21) ** 2 / (3 * E1)) * 1e3;     // meV
  const full = (((15 - PI * PI) / (24 * PI ** 4)) * (eF * eF * L ** 4) / (2 * hb2m)) * 1e3;
  const ell = L / PI, eps = (2 * hb2m) / (ell * ell), Fm = (eF * ell) / eps;   // model units: energy ħ²/m*ℓ², ℓ = L/π
  const exact = -shiftExact(Fm) * eps * 1e3;
  return { L, F, hb2m, E1, eF, x21, one, full, exact, Fm, eps, ell, key: one };
}

/** Ground-state coefficients in the box basis, by inverse iteration on H − σ (N states). */
function tiltCoeffs(F, N = 16) {
  const E = tiltGround(F, N) - 1e-6;
  const A = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? (i + 1) ** 2 / 2 - E : 0) + F * xel(i + 1, j + 1)));
  let y = Array(N).fill(1);
  for (let it = 0; it < 6; it++) {
    const M = A.map((row, i) => [...row, y[i]]);
    for (let k = 0; k < N; k++) {
      let p = k; for (let i = k + 1; i < N; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
      [M[k], M[p]] = [M[p], M[k]];
      for (let i = k + 1; i < N; i++) { const f = M[i][k] / M[k][k]; for (let j = k; j <= N; j++) M[i][j] -= f * M[k][j]; }
    }
    const x = Array(N).fill(0);
    for (let i = N - 1; i >= 0; i--) { let sum = M[i][N]; for (let j = i + 1; j < N; j++) sum -= M[i][j] * x[j]; x[i] = sum / M[i][i]; }
    const nrm = Math.hypot(...x); y = x.map((v) => v / nrm);
  }
  return y[0] < 0 ? y.map((v) => -v) : y;
}
/** The box with a sloping floor, its exact ground level and density (drawn on the level, scaled). */
function tiltPic(F, caption) {
  const c = tiltCoeffs(F), E = tiltGround(F);
  const psi = c.map((v, i) => `${r6(v * Math.sqrt(2 / PI))}*sin(${i + 1}*x)`).join(' + ');
  const top = r6(F * PI + 1);
  return {
    type: 'graph',
    params: {
      x: [-0.2, 3.4], y: [-0.3, top], aspect: 'wide', xlabel: 'x (units ħ = m = 1)', ylabel: 'energy', xticks: 4, yticks: 4, axesAt: 'edge',
      curves: [
        seg(0, 0, PI, F * PI, 'ink2', 2.2), seg(0, -0.3, 0, top, 'ink2', 3), seg(PI, -0.3, PI, top, 'ink2', 3),
        { ...seg(0, E, PI, E, 'gold', 1.6), dash: [6, 4] },
        { fn: `${r6(E)} + 1.6*(${psi})^2`, domain: [0, r6(PI)], color: 'accent', width: 2.4 },
      ],
      points: [label(PI, F * PI, 'V = F·x', 'ink2', -8, 14, 'right'), label(0.1, E, 'ground level', 'gold', 2, 14), label(0.1, E + 1.6 * 0.9, '|ψ|²', 'accent', 4, -8)],
    },
    caption,
  };
}

// ── bout 2: the variational principle — neutrons above a mirror ─────────────
/** A neutron above a mirror under gravity g: trial z e^{−βz²}, against the Airy ground state. Energies in peV. */
export function bounceVarCase(r) {
  const P = r.pick(PLACES);
  const ell = Math.cbrt((HBAR * HBAR) / (2 * MN * MN * P.g));            // m: (ħ²/2m²g)^(1/3)
  const E0 = ((MN * P.g * ell) / QE) * 1e12;                              // peV, mgℓ
  // in units ℓ and mgℓ, H = −d²/dξ² + ξ; the trial ξ e^{−bξ²} gives ε(b) = 3b + 2/√(2πb)
  const b = Math.cbrt(1 / (18 * PI)), eps = 3 * b + 2 / Math.sqrt(2 * PI * b);
  const bE = Math.cbrt(0.75), epsE = bE * bE + 1.5 / bE;                 // the exponential trial ξ e^{−bξ}
  return { ...P, ell, E0, b, eps, epsE, key: eps * E0, exact: AIRY[0] * E0, expo: epsE * E0 };
}

const EARTH = bounceVarCase({ pick: () => PLACES[0] });

// ── bout 3: WKB ──────────────────────────────────────────────────────────────
/** WKB bouncer energy (one wall, one soft turning point), units mgℓ. */
export const wkbBounce = (n, maslov = 0.25) => (1.5 * PI * (n - maslov)) ** (2 / 3);
/** The 1 → n transition frequency on Earth: WKB minus exact, Hz. */
export function transitionCase(r) {
  const n = r.pick([2, 3, 4, 5]);
  const ell = Math.cbrt((HBAR * HBAR) / (2 * MN * MN * 9.81)), E0 = ((MN * 9.81 * ell) / QE) * 1e12;
  const E0p = +E0.toFixed(4);                                             // the printed mgℓ, so the key matches the prompt
  const f = (e1, en) => ((en - e1) * E0p) / H_PEVS;
  const fW = f(wkbBounce(1), wkbBounce(n)), fX = f(AIRY[0], AIRY[n - 1]);
  return { n, E0p, fW, fX, key: fW - fX, f };
}
/** A saddle-point constriction as an inverted parabola: WKB's relative overestimate of T, in %. */
export function qpcCase(r) {
  const hw = r.pick([0.5, 1, 2]), ratio = r.pick([0.15, 0.25, 0.4, 0.6]);
  const D = +(ratio * hw).toPrecision(3);                                 // meV below the top
  const g2 = (2 * PI * D) / hw;                                           // 2γ
  const Tw = Math.exp(-g2), Tx = 1 / (1 + Math.exp(g2));
  return { hw, D, g2, Tw, Tx, key: 100 * (Tw / Tx - 1) };
}

// ── bout 4: Born ─────────────────────────────────────────────────────────────
/** Slow neutrons on a square well of depth V0 (MeV) and radius a (fm): σ_exact/σ_Born at k → 0. */
export function bornCase(r) {
  const V0 = r.pick([4, 6, 8]), a = r.pick([1.2, 1.5, 1.8]);
  const g = (Math.sqrt(2 * MNC2 * V0) * a) / (HBARC_EVNM);                // HBARC_EVNM = 197.33 eV nm = 197.33 MeV fm
  const aExact = Math.tan(g) / g - 1, aBorn = (g * g) / 3;                // scattering lengths in units of a (sizes)
  return { V0, a, g, aExact, aBorn, key: (aExact / aBorn) ** 2 };
}

// ── bout 5: sudden against adiabatic ────────────────────────────────────────
/** ⟨n s, Z′ | 1s, Z⟩ for hydrogen-like states (n = 1 or 2), Z′ = Z + 1. */
export function overlap(Z, Zp, n) {
  if (n === 1) return ((2 * Math.sqrt(Z * Zp)) / (Z + Zp)) ** 3;
  const s = Z + Zp / 2;                                                   // ∫ r² R₁₀(Z) R₂₀(Z′) dr in closed form
  return 4 * Z ** 1.5 * (Zp / 2) ** 1.5 * (2 / s ** 3 - ((Zp / 2) * 6) / s ** 4);
}
export function suddenCase(r) {
  const [Z, parent, daughter, ion] = r.pick([[1, 'tritium', 'helium-3', t`${'^3'}\text{He}^+`], [2, 'the ion ⁶He⁺', 'lithium-6', t`${'^6'}\text{Li}^{2+}`]]);
  const n = r.pick([1, 2]);
  const amp = overlap(Z, Z + 1, n);
  return { Z, parent, daughter, ion, n, amp, key: amp * amp };
}
/** Landau–Zener: the fastest sweep v (μeV/ns) of the bias that keeps the jump probability below Pmax, for a gap Δ (μeV). */
const HB_UEVNS = (HBAR / QE) * 1e15;                                      // ħ in μeV ns
export function lzCase(r) {
  const D = r.pick([0.5, 1, 2, 4]), fid = r.pick([0.99, 0.999]);
  const Pmax = +(1 - fid).toPrecision(3);
  return { D, fid, Pmax, key: (PI * D * D) / (2 * HB_UEVNS * Math.log(1 / Pmax)) };
}

// ── pictures ─────────────────────────────────────────────────────────────────
/** The ground state's density in a well of width L (nm), centred, with the field's potential eFx (schematic). */
const parityPic = (L) => ({
  type: 'graph',
  params: {
    x: [r6(-0.62 * L), r6(0.62 * L)], y: [r6(-1.3 / L), r6(2.6 / L)], aspect: 'wide', xlabel: 'x from the well’s centre (nm)', ylabel: '', yticks: 0, xticks: 6, axesAt: 'edge',
    curves: [
      { fn: `(2/${L})*cos(pi*x/${L})^2`, domain: [-L / 2, L / 2], color: 'gold', width: 2.6 },
      { ...seg(-L / 2, -1.1 / L, L / 2, 1.1 / L, 'accent', 2), dash: [6, 4] },
      seg(-L / 2, -1.3 / L, -L / 2, 2.6 / L, 'ink2', 3), seg(L / 2, -1.3 / L, L / 2, 2.6 / L, 'ink2', 3),
    ],
    shade: [{ fn: `(2/${L})*cos(pi*x/${L})^2`, lower: '0', from: -L / 2, to: L / 2, color: 'gold', alpha: 0.18 }],
    points: [label(0, 2 / L, '|ψ₁|²', 'gold', 8, -10), label(0.42 * L, 0.92 / L, 'eℰx', 'accent', -6, -12, 'right')],
  },
  caption: 'The ground state’s probability density in the well (gold) and the potential energy the field adds, eℰx, measured from the centre (blue, dashed, not to scale). Infinite walls: a teaching model of the real, finite well.',
});
/** The integrand x ψ₁ψ₂ of ⟨2|x|1⟩ on [0, L], shaded. */
const matPic = (L) => {
  const f = `x*(2/${L})*sin(pi*x/${L})*sin(2*pi*x/${L})`;
  const vals = Array.from({ length: 401 }, (_, i) => { const x = (L * i) / 400; return x * (2 / L) * Math.sin((PI * x) / L) * Math.sin((2 * PI * x) / L); });
  const lo = Math.min(...vals), hi = Math.max(...vals), amp = r6(0.8 * hi * Math.sqrt(L / 2));
  return {
    type: 'graph',
    params: {
      x: [0, L], y: [r6(1.15 * lo), r6(1.3 * hi)], aspect: 'wide', xlabel: 'x (nm)', ylabel: '', yticks: 0, xticks: 5, axesAt: 'edge',
      curves: [
        { fn: `sqrt(2/${L})*sin(pi*x/${L})*${amp}`, color: 'ink3', width: 1.6, dash: [5, 4] },
        { fn: `sqrt(2/${L})*sin(2*pi*x/${L})*${amp}`, color: 'ink3', width: 1.6, dash: [2, 3] },
        { fn: f, color: 'accent', width: 2.4 },
      ],
      shade: [{ fn: f, lower: '0', from: 0, to: L, color: 'accent', alpha: 0.25 }],
      points: [label(0.5 * L, 0.8 * hi, 'ψ₁', 'ink3', 0, -10, 'center'), label(0.75 * L, -0.8 * hi, 'ψ₂', 'ink3', 0, 16, 'center'), label(0.62 * L, 0.7 * lo, 'x ψ₁ψ₂', 'accent', -10, 0, 'right')],
    },
    caption: 'The integrand x ψ₁ψ₂ of the matrix element ⟨2|x|1⟩ (blue, shaded): its net area is the matrix element. Dashed: ψ₁ and ψ₂ themselves, drawn at an arbitrary scale.',
  };
};
/** Trial densities ξ²e^{−2bξ²} (normalized) above the mirror with the potential ξ. */
function trialPic(caption) {
  const dens = (b) => `${r6(4 * Math.sqrt(2 * b / PI) * 2 * b)}*x^2*exp(-${r6(2 * b)}*x^2)`;
  return {
    type: 'graph',
    params: {
      x: [0, 6], y: [0, 1.6], aspect: 'wide', xlabel: 'height z / ℓ', ylabel: '', yticks: 0, xticks: 6, axesAt: 'edge',
      curves: [
        { fn: dens(0.12), color: 'violet', width: 2, label: 'β = 0.12/ℓ²', labelAt: 3.6, labelDy: -2 },
        { fn: dens(0.6), color: 'accent', width: 2.4, label: 'β = 0.6/ℓ²', labelAt: 1.25, labelDx: 8 },
        { fn: 'x/4', color: 'ink2', width: 2, dash: [6, 4], label: 'mgz (scaled)', labelAt: 5.2, labelDy: -4 },
        seg(0, 0, 0, 1.6, 'ink', 4),
      ],
      points: [label(0.05, 1.5, 'mirror', 'ink2', 8, 0)],
    },
    caption,
  };
}
/** ε(b) for the two trial families against the exact floor a₁. */
function boundPic(caption) {
  return {
    type: 'graph',
    params: {
      x: [0.05, 1.6], y: [2.2, 3.4], aspect: 'wide', xlabel: 'trial parameter (units of 1/ℓ or 1/ℓ²)', ylabel: '⟨H⟩ / mgℓ', xticks: 6, yticks: 4, axesAt: 'edge',
      curves: [
        { fn: 'x^2 + 1.5/x', domain: [0.4, 1.6], color: 'violet', width: 2.4, label: 'z·exp(−βz)', labelAt: 1.45, labelDy: 14 },
        { fn: '3*x + 2/sqrt(2*pi*x)', domain: [0.08, 0.6], color: 'accent', width: 2.4, label: 'z·exp(−βz²)', labelAt: 0.1, labelDx: 4, labelDy: 18 },
      ],
      hlines: [{ y: r6(AIRY[0]), color: 'gold', label: 'exact ground state' }],
    },
    caption,
  };
}
/** Hydrogen-like radial densities r²R² in units of a₀. */
function radialPic(Z, caption) {
  const Zp = Z + 1;
  const d1 = (z) => `${r6(4 * z ** 3)}*x^2*exp(-${2 * z}*x)`;
  const d2 = (z) => `${r6(4 * (z / 2) ** 3)}*x^2*(1 - ${z / 2}*x)^2*exp(-${z}*x)`;
  return {
    type: 'graph',
    params: {
      x: [0, 6], y: [0, r6(1.25 * Zp * 0.541)], aspect: 'wide', xlabel: 'r (units of a₀)', ylabel: 'r²|R|² (a₀⁻¹)', xticks: 6, yticks: 3, axesAt: 'edge',
      curves: [
        { fn: d1(Z), color: 'gold', width: 2.8, label: 'before: 1s', labelAt: r6(1.6 / Z), labelDx: 6, labelDy: -2 },
        { fn: d1(Zp), color: 'accent', width: 2, dash: [6, 4], label: 'after: 1s', labelAt: r6(0.75 / Zp), labelDx: 8, labelDy: -4 },
        { fn: d2(Zp), color: 'violet', width: 2, dash: [3, 3], label: 'after: 2s', labelAt: r6(5.6 / Zp), labelDx: 6, labelDy: -4 },
      ],
    },
    caption,
  };
}
/** Two levels whose energies ±ε/2 would cross, opened into an avoided crossing of gap Δ (schematic). */
const lzPic = (caption) => ({
  type: 'graph',
  params: {
    x: [-4, 4], y: [-2.6, 2.6], aspect: 'wide', xlabel: 'time (the bias ε sweeps linearly)', ylabel: 'energy', xticks: 0, yticks: 0, axesAt: 'edge',
    curves: [
      { fn: '0.5*x', color: 'ink3', width: 1.6, dash: [5, 4] }, { fn: '-0.5*x', color: 'ink3', width: 1.6, dash: [5, 4] },
      { fn: 'sqrt(0.25*x^2 + 0.36)', color: 'accent', width: 2.6 }, { fn: '-sqrt(0.25*x^2 + 0.36)', color: 'gold', width: 2.6 },
    ],
    arrows: [{ from: [0, -0.6], to: [0, 0.6], color: 'bad', width: 2, label: 'gap Δ', labelDx: 8, labelDy: 6 }],
    points: [label(-3.8, -1.9, 'start', 'gold', 4, 16), label(3.8, -1.9, 'adiabatic: transferred', 'gold', -4, 16, 'right'), label(3.8, 1.9, 'jump: not transferred', 'ink3', -4, -12, 'right')],
  },
  caption,
});

export default boss({
  title: 'The Approximation Arena',
  intro: t`Almost nothing in quantum mechanics can be solved exactly, so physicists approximate — and the craft is knowing **which** approximation, **why** it applies, and **how wrong** it is. In this arena each method fights a problem whose exact answer is known: perturbation theory, the variational principle, WKB, the Born approximation, and the sudden and adiabatic limits. The problems come from real hardware — a laser modulator, neutrons bouncing in Earth’s gravity, a nanoscale constriction, a neutron beam, a beta-decay trap, an atom interferometer. Five bouts, eleven problems, one of them in code; no hints, one try each.`,
  pass: 0.7,
  rounds: [
    // ── bout 1 ──
    {
      title: 'Perturbation theory: a well under a field',
      story: t`A spacecraft’s laser link switches its beam with an **electro-absorption modulator**: a stack of gallium arsenide quantum wells whose absorption edge moves when a field is applied — the quantum-confined Stark effect. Treat one well as an infinite square well of width $L$ holding an electron of effective mass $m^* = ${MSTAR}\,m_e$, and the applied field $\mathcal E$ as the perturbation $H' = e\mathcal E x$.`,
      items: [
        mcq({
          id: 'r1-parity', skill: 'phys4710.M2.3', difficulty: 3,
          prompt: t`Measure $x$ from the centre of the well. To first order, how much does the field shift the electron’s ground level, and why?`,
          choices: [
            t`Not at all: $|\psi_1|^2$ is even about the centre and $x$ is odd, so $\langle\psi_1|e\mathcal E x|\psi_1\rangle = 0$`,
            t`Not at all, because the field is weak, so its first-order effect can be neglected`,
            t`By $e\mathcal E L/2$, the potential energy at the edge of the well, where the electron is pushed`,
            t`It cannot be computed: the level is degenerate, so degenerate perturbation theory is needed first`,
          ],
          answer: 0,
          why: {
            1: t`Weakness makes a first-order shift *small*, not zero. This one is exactly zero for any field strength, because of a symmetry.`,
            2: t`First order averages $H'$ over the unperturbed state, $\langle\psi_1|H'|\psi_1\rangle$; it does not evaluate $H'$ at one place. Here the average of $x$ over a centred, even density vanishes.`,
            3: t`The levels of a one-dimensional well are never degenerate: $E_n = n^2E_1$ are all different. Ordinary (non-degenerate) theory applies.`,
          },
          hints: [
            t`The first-order shift is the expectation value $E^{(1)} = \langle\psi_1|H'|\psi_1\rangle = e\mathcal E\int x\,|\psi_1|^2\,dx$.`,
            t`Under parity $x \to -x$ the density $|\psi_1|^2 = \tfrac2L\cos^2(\pi x/L)$ is unchanged while $x$ changes sign. What is the integral of an odd function over a symmetric interval?`,
          ],
          teach: t`A perturbation that is odd under parity has zero expectation value in every state of definite parity, so the first-order shift vanishes and the effect starts at second order — quadratic in the field.`,
          explain: t`$E^{(1)} = e\mathcal E\int_{-L/2}^{L/2}x\,\tfrac2L\cos^2\tfrac{\pi x}{L}\,dx = 0$: an odd integrand on a symmetric interval. Every level of the well has definite parity, so every first-order shift vanishes, and the effect is **quadratic** in $\mathcal E$ — as for hydrogen’s ground state in the Stark effect, and unlike its degenerate $n = 2$ level, where states of opposite parity mix and the shift is linear. (Had you measured $x$ from a wall, every level would move by the same $e\mathcal E L/2$: a constant that cancels from every transition energy.)`,
          visual: parityPic(10),
        }),
        num({
          id: 'r1-oneterm', skill: 'phys4710.M3.2', difficulty: 4,
          gen(r) {
            const C = qcseCase(r);
            const { L, F, E1, x21, one, full, exact } = C;
            return {
              prompt: t`The modulator’s wells are $L = ${L}\ \text{nm}$ wide and the field is $\mathcal E = ${F}\ \text{kV/cm}$. The second-order shift of the ground level is $$E_1^{(2)} = -\sum_{n \ne 1}\frac{|\langle n|e\mathcal E x|1\rangle|^2}{E_n - E_1}.$$ Keep **only the $n = 2$ term**. By how much does the ground level move down, in meV? Give 3 significant figures. (Use $\hbar^2/2m_e = ${fmt(HB2M_EVNM2, 4)}\ \text{eV nm}^2$, and $1\ \text{kV/cm} = 10^{-4}\ \text{V/nm}$.)`,
              answer: one, units: 'meV', tol: { rel: 0.005 },
              errors: apart([
                { value: one * 3, feedback: t`The denominator is $E_2 - E_1 = 4E_1 - E_1 = 3E_1$, not $E_1$.` },
                { value: Math.sqrt((one / 1e3) * 3 * E1) * 1e3, feedback: t`That is $e\mathcal E|\langle 2|x|1\rangle|$, the size of the matrix element. Second order squares it and divides by the energy gap.` },
                { value: (one * (L / 2) ** 2) / x21 ** 2, feedback: t`Check the matrix element: $\langle 2|x|1\rangle = \dfrac2L\displaystyle\int_0^L x\sin\frac{\pi x}{L}\sin\frac{2\pi x}{L}\,dx = -\frac{16L}{9\pi^2}$, not $L/2$.` },
                { value: one * MSTAR, feedback: t`Use the effective mass: $E_1 = \dfrac{\hbar^2\pi^2}{2m^*L^2}$ with $m^* = ${MSTAR}\,m_e$, so divide $\hbar^2/2m_e$ by ${MSTAR}.` },
              ], one),
              hints: [
                t`$E_1 = \dfrac{\hbar^2\pi^2}{2m^*L^2}$ and $E_2 - E_1 = 3E_1$. Only $\langle 2|x|1\rangle$ is needed.`,
                t`With $\psi_n = \sqrt{2/L}\,\sin(n\pi x/L)$ (from a wall), $\langle 2|x|1\rangle = -\dfrac{16L}{9\pi^2}$. The constant offset of $x$ does not matter, since $\langle 2|1\rangle = 0$.`,
                t`The shift is $\dfrac{(e\mathcal E)^2(16L/9\pi^2)^2}{3E_1}$, with $e\mathcal E = ${tn(C.eF, 3)}$ eV/nm.`,
              ],
              teach: t`Second-order perturbation theory sums the squared couplings divided by the energy gaps; when one nearby level dominates, a single term carries almost all of it.`,
              explain: t`$E_1 = ${tn(E1 * 1e3, 4)}$ meV, $|\langle 2|x|1\rangle| = 16L/9\pi^2 = ${tn(x21, 4)}$ nm and $e\mathcal E = ${tn(C.eF, 3)}$ eV/nm, so $$\Delta E \approx \frac{(${tn(C.eF * x21, 4)}\ \text{eV})^2}{3\times${tn(E1, 4)}\ \text{eV}} = ${tn(one, 3)}\ \text{meV}.$$ **Estimate the error.** The full sum is known in closed form, $\dfrac{15 - \pi^2}{24\pi^4}\dfrac{m^*e^2\mathcal E^2L^4}{\hbar^2} = ${tn(full, 4)}$ meV: the $n = 2$ term alone carries $${tn((100 * one) / full, 4)}\%$ of it, because the other couplings to odd-parity states are small and their gaps large. And diagonalizing the Hamiltonian exactly in the well’s own basis gives $${tn(exact, 4)}$ meV: second order is itself good to $${tn((100 * Math.abs(full - exact)) / exact, 2)}\%$ here, since $e\mathcal E L = ${tn(C.eF * L * 1e3, 3)}$ meV is small beside the gap $3E_1$. Real modulators see a larger shift, mostly from the hole, which is heavier and so more polarizable (the electron–hole attraction modifies it further), but the method is the same.`,
              visual: matPic(L),
            };
          },
        }),
        code({
          id: 'r1-break', skill: 'phys4710.M0.1', difficulty: 4,
          prompt: t`Where does second order stop working? In units $\hbar = m^* = 1$ with the well on $[0, \pi]$, the levels are $n^2/2$ and the field adds $V = Fx$. In the well’s own basis $\sqrt{2/\pi}\sin nx$ the Hamiltonian is $H_{mn} = \tfrac{n^2}{2}\delta_{mn} + F\,x_{mn}$; \`xmat(N)\` builds $x_{mn}$ for you. Write

- \`exact_shift(F, N=40)\`: the lowest eigenvalue of $H$ minus $\tfrac12$ and minus the trivial first-order $F\pi/2$ (use \`np.linalg.eigvalsh\`);
- \`pert_shift(F)\`: second order, $-\tfrac{15 - \pi^2}{24}F^2$;
- \`rel_error(F)\`: $|\text{pert} - \text{exact}|/|\text{exact}|$;
- \`field_at(err)\`: the $F$ in $[0.01, 3]$ where \`rel_error\` reaches \`err\`, by bisection (it grows with $F$).`,
          starter: t`import numpy as np

def xmat(N):
    """<m|x|n> for the well on [0, pi], states sqrt(2/pi) sin(n x), n = 1..N."""
    X = np.zeros((N, N))
    for m in range(1, N + 1):
        for n in range(1, N + 1):
            if m == n:
                X[m - 1, n - 1] = np.pi / 2
            elif (m + n) % 2 == 1:
                X[m - 1, n - 1] = -8 * m * n / (np.pi * (m * m - n * n) ** 2)
    return X

def exact_shift(F, N=40):
    pass

def pert_shift(F):
    pass

def rel_error(F):
    pass

def field_at(err):
    pass

print(exact_shift(1.0), pert_shift(1.0), rel_error(1.0), field_at(0.01), field_at(0.1))
`,
          answer: t`import numpy as np

def xmat(N):
    """<m|x|n> for the well on [0, pi], states sqrt(2/pi) sin(n x), n = 1..N."""
    X = np.zeros((N, N))
    for m in range(1, N + 1):
        for n in range(1, N + 1):
            if m == n:
                X[m - 1, n - 1] = np.pi / 2
            elif (m + n) % 2 == 1:
                X[m - 1, n - 1] = -8 * m * n / (np.pi * (m * m - n * n) ** 2)
    return X

def exact_shift(F, N=40):
    n = np.arange(1, N + 1)
    H = np.diag(n ** 2 / 2) + F * xmat(N)
    return np.linalg.eigvalsh(H)[0] - 0.5 - F * np.pi / 2

def pert_shift(F):
    return -(15 - np.pi ** 2) * F ** 2 / 24

def rel_error(F):
    return abs(pert_shift(F) - exact_shift(F)) / abs(exact_shift(F))

def field_at(err):
    lo, hi = 0.01, 3.0
    for _ in range(50):
        mid = (lo + hi) / 2
        if rel_error(mid) < err:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2

print(exact_shift(1.0), pert_shift(1.0), rel_error(1.0), field_at(0.01), field_at(0.1))
`,
          tests: [
            { name: t`the exact shift at $F = 1$ is $${fmt(shiftExact(1), 6)}$`, code: `abs(exact_shift(1.0) - (${shiftExact(1)})) < 1e-8` },
            { name: t`second order at $F = 0.5$ is $${fmt(shiftPert(0.5), 6)}$`, code: `abs(pert_shift(0.5) - (${shiftPert(0.5)})) < 1e-10` },
            { name: t`second order errs by $${fmt(100 * relError(1), 3)}\%$ at $F = 1$ and $${fmt(100 * relError(0.3), 3)}\%$ at $F = 0.3$`, code: `abs(rel_error(1.0) - ${relError(1)}) < 1e-6 and abs(rel_error(0.3) - ${relError(0.3)}) < 1e-6` },
            { name: t`the error reaches 1% at $F = ${fmt(fieldAt(0.01), 4)}$ and 10% at $F = ${fmt(fieldAt(0.1), 4)}$`, code: `abs(field_at(0.01) - ${fieldAt(0.01)}) < 1e-4 and abs(field_at(0.1) - ${fieldAt(0.1)}) < 1e-4` },
          ],
          hints: [
            t`\`np.diag(n ** 2 / 2)\` with \`n = np.arange(1, N + 1)\` is the unperturbed part; add \`F * xmat(N)\`.`,
            t`\`np.linalg.eigvalsh\` returns the eigenvalues of a symmetric matrix in ascending order: take \`[0]\`.`,
            t`Bisection: keep \`lo\` where the error is below \`err\` and \`hi\` where it is above, and halve the bracket about 50 times.`,
          ],
          teach: t`Diagonalizing the Hamiltonian in a truncated basis of the unperturbed states is exact to the truncation, so it measures directly how far a perturbative formula can be trusted.`,
          explain: t`Second order errs by $${fmt(100 * relError(0.3), 2)}\%$ at $F = 0.3$ and $${fmt(100 * relError(1), 3)}\%$ at $F = 1$; the error, the missing fourth-order term, grows like $F^2$, reaching 1% at $F = ${fmt(fieldAt(0.01), 3)}$ and 10% at $F = ${fmt(fieldAt(0.1), 3)}$. In real units the field unit is $\hbar^2/(m^*e\ell^3)$ with $\ell = L/\pi$: for an electron in a 10 nm GaAs well, 1% comes at $${fmt((fieldAt(0.01) * (2 * HB2M_EVNM2 / MSTAR) / (10 / PI) ** 3) * 1e4, 3)}$ kV/cm, so perturbation theory serves the whole working range. For a heavy hole ($m \approx ${MHH}\,m_e$) in the same well the unit is ${fmt(MHH / MSTAR, 2)} times smaller, and 1% comes at about $${fmt((fieldAt(0.01) * (2 * HB2M_EVNM2 / MHH) / (10 / PI) ** 3) * 1e4, 2)}$ kV/cm — beyond that, diagonalize. Forty states converge the ground level to better than $10^{-9}$.`,
          visual: tiltPic(2, 'The box with a sloping floor V = F·x (here F = 2, units ħ = m = 1): the exact ground level (gold, dashed) and its density (blue, drawn on the level at an arbitrary scale), which leans toward the low side. Infinite walls: a teaching model of a quantum well under a field.'),
        }),
      ],
    },
    // ── bout 2 ──
    {
      title: 'The variational principle: neutrons above a mirror',
      story: t`Ultracold neutrons skimming over a horizontal mirror have quantized bouncing states in gravity, a few micrometres high — measured since 2002 at the Institut Laue–Langevin (Nesvizhevsky et al.; the qBounce experiments). The potential is $mgz$ above a hard floor at $z = 0$; the exact energies are $E_n = a_n\,mg\ell$ with $\ell = (\hbar^2/2m^2g)^{1/3}$ and $a_n$ the zeros of the Airy function, $a_1 = ${fmt(AIRY[0], 6)}$.`,
      items: [
        num({
          id: 'r2-gauss', skill: 'phys4710.M4.1', difficulty: 4, transfer: true,
          gen(r) {
            const C = bounceVarCase(r);
            const { name, where, g, ell, E0, b, eps, key, exact, expo } = C;
            const bh = Math.cbrt(1 / (72 * PI)), noHalf = 6 * bh + 2 / Math.sqrt(2 * PI * bh);   // the slip ⟨T⟩ = 3βħ²/m
            return {
              prompt: t`Neutrons bounce ${where}, where $g = ${g}\ \text{m/s}^2$. Use the trial function $\psi = z\,e^{-\beta z^2}$ (it vanishes at the mirror, as it must) and minimize $\langle H\rangle$ over $\beta$. What upper bound does it give for the ground-state energy, in peV? Give 3 significant figures. ($m_n = ${tex(MN, 5)}$ kg, $\hbar = ${tex(HBAR, 5)}$ J s, $1\ \text{peV} = ${tex(QE * 1e-12, 5)}$ J. You may use $\int_0^\infty z^ke^{-az^2}dz = \tfrac12\Gamma\bigl(\tfrac{k+1}{2}\bigr)a^{-(k+1)/2}$.)`,
              answer: key, units: 'peV', tol: { rel: 0.005 },
              errors: apart([
                { value: exact, feedback: t`That is the exact Airy value $a_1mg\ell$. The question asks for the variational bound from this trial family, which lies a little above it.` },
                { value: expo, feedback: t`That is the bound from the exponential trial $z\,e^{-\beta z}$. With $z\,e^{-\beta z^2}$, $\langle T\rangle = 3\beta\hbar^2/2m$ and $\langle z\rangle = \sqrt{2/(\pi\beta)}$.` },
                { value: noHalf * E0, feedback: t`Keep the $\tfrac12$ in the kinetic energy: $\int\psi'^2 / \int\psi^2 = 3\beta$, so $\langle T\rangle = \dfrac{\hbar^2}{2m}\,3\beta$, not $\dfrac{\hbar^2}{m}\,3\beta$.` },
              ], key),
              hints: [
                t`With $a = 2\beta$: $\int\psi^2 = \tfrac{\sqrt\pi}{4}a^{-3/2}$, $\int z\psi^2 = \tfrac12a^{-2}$, so $\langle z\rangle = \dfrac{2}{\sqrt{\pi a}} = \sqrt{\dfrac{2}{\pi\beta}}$.`,
                t`$\psi' = (1 - 2\beta z^2)e^{-\beta z^2}$ gives $\int\psi'^2 / \int\psi^2 = 3\beta$, so $\langle H\rangle = \dfrac{3\hbar^2\beta}{2m} + mg\sqrt{\dfrac{2}{\pi\beta}}$.`,
                t`In units of $\ell$ and $mg\ell$ this is $\varepsilon(b) = 3b + 2/\sqrt{2\pi b}$ with $b = \beta\ell^2$; its minimum is at $b^{3/2} = 1/(3\sqrt{2\pi})$. Here $\ell = ${tn(ell * 1e6, 4)}\ \mu$m.`,
              ],
              teach: t`The variational principle turns a guess into a guaranteed upper bound: minimize $\langle H\rangle$ over the family’s parameters, and a family shaped like the true state gives a bound close to the truth.`,
              explain: t`$\langle H\rangle = \frac{3\hbar^2\beta}{2m} + mg\sqrt{2/\pi\beta}$. In units of $\ell = ${tn(ell * 1e6, 4)}\ \mu$m and $mg\ell = ${tn(E0, 4)}$ peV it is $\varepsilon(b) = 3b + 2/\sqrt{2\pi b}$, smallest at $b = ${tn(b, 4)}$, where $\varepsilon = ${tn(eps, 5)}$. So $E_1 \le ${tn(key, 4)}$ peV on ${name}. **The error:** the exact value is $a_1 mg\ell = ${tn(exact, 4)}$ peV, so this bound is $${tn((100 * (eps - AIRY[0])) / AIRY[0], 2)}\%$ high — against $${tn((100 * (C.epsE - AIRY[0])) / AIRY[0], 2)}\%$ for the exponential trial $z\,e^{-\beta z}$, whose cusp-free start is right but whose tail, $e^{-\beta z}$, falls too slowly: the true tail is $\exp(-\tfrac23(z/\ell)^{3/2})$, between the two.`,
              visual: trialPic(t`Two members of the trial family $|\psi|^2 \propto z^2e^{-2\beta z^2}$ above the mirror (normalized), with the gravitational potential (dashed, scaled). Heights in units of $\ell$; neither curve is the best one.`),
            };
          },
        }),
        multi({
          id: 'r2-justify', skill: 'phys4710.M4.1', difficulty: 3,
          prompt: t`On Earth the exponential trial $z\,e^{-\beta z}$ gives $\langle H\rangle_{\min} = ${fmt(EARTH.expo, 4)}$ peV and the half-Gaussian $z\,e^{-\beta z^2}$ gives $${fmt(EARTH.key, 4)}$ peV. Suppose you did **not** know the Airy solution. Which conclusions follow from the variational principle alone? Select all.`,
          choices: [
            t`The true ground-state energy is at most $${fmt(EARTH.key, 4)}$ peV.`,
            t`The true ground-state energy lies between $${fmt(EARTH.key, 4)}$ and $${fmt(EARTH.expo, 4)}$ peV.`,
            t`The half-Gaussian is the closer of the two to the true wave function at every height.`,
            t`Minimizing over the two-parameter family $z\,e^{-\beta z - \gamma z^2}$ (with $\beta, \gamma \ge 0$) gives at most $${fmt(EARTH.key, 4)}$ peV.`,
          ],
          answer: [0, 3],
          why: {
            1: t`The principle gives only an **upper** bound. Nothing in it says how far below the lower of the two bounds the truth may be.`,
            2: t`A lower energy says the trial is better *on average, weighted by the Hamiltonian*. The energy error is second order in the wave-function error, so a good energy can come from a wave function that is wrong in places — the tail, for instance.`,
          },
          hints: [
            t`For any normalized $\psi$, $\langle H\rangle \ge E_{\text{gs}}$. What does that give from above, and what from below?`,
            t`A larger family that contains an old one as a special case can only lower (or keep) the minimum: setting $\beta = 0$ recovers the half-Gaussian.`,
          ],
          teach: t`The variational principle bounds the ground-state energy from above only; the best bound is the lowest, a family containing another can only improve on it, and a good energy does not certify a good wave function.`,
          explain: t`Every trial energy is an upper bound, so the lowest, $${fmt(EARTH.key, 4)}$ peV, is the one to keep; the principle says nothing about a lower bound (that needs other tools, such as Temple’s inequality). The two-parameter family includes the half-Gaussian ($\beta = 0$), so its minimum can be no higher. And the energy error is **second order** in the error of $\psi$: a trial can win on energy while being worse than another somewhere. Here the true answer, $${fmt(EARTH.exact, 4)}$ peV, is in fact below both.`,
          visual: boundPic(t`$\langle H\rangle$ in units of $mg\ell$ against each family’s parameter, with the exact ground state (gold) as the floor. Both minima lie above it, as they must.`),
        }),
      ],
    },
    // ── bout 3 ──
    {
      title: 'WKB: levels and leaks',
      story: t`WKB treats the wave function as a plane wave whose wavelength follows the local momentum, $\lambda = h/p(x)$. It should work when the potential changes little over a wavelength — which is never true near a turning point, and yet it often works remarkably well anyway.`,
      items: [
        num({
          id: 'r3-transition', skill: 'phys4710.M5.3', difficulty: 3,
          gen(r) {
            const C = transitionCase(r);
            const { n, E0p, fW, fX, key, f } = C;
            const tbl = AIRY.slice(0, 5).map((a, i) => `a_${i + 1} = ${a.toFixed(5)}`).join(',\\ ');
            return {
              prompt: t`qBounce drives transitions between the neutron’s bouncing states by vibrating the mirror: *gravity resonance spectroscopy*. On Earth $mg\ell = ${E0p}$ peV, and the exact levels are $E_n = a_n\,mg\ell$ with $$${tbl}.$$ WKB, with a hard wall at the mirror and a soft turning point at the top, quantizes $\int_0^{z_n}p\,dz = \bigl(n - \tfrac14\bigr)\pi\hbar$, which gives $E_n = \bigl[\tfrac{3\pi}{2}\bigl(n - \tfrac14\bigr)\bigr]^{2/3}mg\ell$. By how much does WKB’s prediction for the $|1\rangle \to |${n}\rangle$ transition frequency differ from the exact one (WKB minus exact), in Hz? Give 2 significant figures, with the sign. ($h = ${tex(H_PEVS, 5)}$ peV s.)`,
              answer: key, units: 'Hz', tol: { rel: 0.03 },
              errors: apart([
                { value: fW, feedback: t`That is WKB’s frequency itself. The question asks how far it is from the exact one, $${fmt(fX, 4)}$ Hz: subtract.` },
                { value: -key, feedback: t`The sign: WKB minus exact. WKB puts the ground state too low by more than it puts state ${n} too low, so it overestimates the gap.` },
                { value: f(wkbBounce(1, 0.5), wkbBounce(n, 0.5)) - fX, feedback: t`That is $n - \tfrac12$, the rule for two soft turning points. The mirror is a hard wall, where the wave function vanishes: $n - \tfrac14$.` },
                { value: ((wkbBounce(n) - AIRY[n - 1]) * E0p) / H_PEVS, feedback: t`That is the error in level ${n} alone. The transition frequency is set by $E_${n} - E_1$, so the ground state’s WKB error counts too.` },
              ], key),
              hints: [
                t`Compute $\varepsilon_n^{\text{WKB}} = \bigl[\tfrac{3\pi}{2}(n - \tfrac14)\bigr]^{2/3}$ for $n = 1$ and $n = ${n}$ to five decimals, then the WKB gap $\varepsilon_${n} - \varepsilon_1$.`,
                t`The frequency is $f = (E_${n} - E_1)/h$, with $E = \varepsilon\,mg\ell$. Do it for WKB and for the Airy zeros, and subtract.`,
              ],
              teach: t`WKB is a semiclassical approximation: its error is largest for the lowest states and falls quickly with $n$, so differences of levels inherit mostly the ground state’s error.`,
              explain: t`WKB: $\varepsilon_1 = ${fmt(wkbBounce(1), 5)}$ and $\varepsilon_${n} = ${fmt(wkbBounce(n), 5)}$, a gap of $${fmt(wkbBounce(n) - wkbBounce(1), 5)}$; exact: $${fmt(AIRY[n - 1] - AIRY[0], 5)}$. So $f_{\text{WKB}} = ${fmt(fW, 5)}$ Hz against $f = ${fmt(fX, 5)}$ Hz, a difference of $${tn(key, 2)}$ Hz — $${tn((100 * key) / fX, 2)}\%$. The ground level’s WKB error, $${tn((100 * (wkbBounce(1) - AIRY[0])) / AIRY[0], 2)}\%$, is the biggest; level ${n}’s is $${tn((100 * (wkbBounce(n) - AIRY[n - 1])) / AIRY[n - 1], 2)}\%$. Gravity resonance spectroscopy resolves these frequencies to a few parts in a thousand or better — finer than WKB’s error, and enough to test Newton’s inverse-square law at micrometres and to search for new short-range forces — so the analysis uses the exact Airy energies, not WKB.`,
              visual: wkbPic({ pot: 'bouncer', n, panels: ['energy'], hide: ['energy', 'wkb', 'error', 'action'] }, t`The bouncer’s potential (height drawn across, the mirror at the left) with its exact levels (solid) and WKB levels (dashed); level ${n} in gold. Units $\hbar = m = g = 1$, in which the energies are those in the prompt divided by $2^{1/3}$.`),
            };
          },
        }),
        num({
          id: 'r3-qpc', skill: 'phys4710.M5.2', difficulty: 3,
          gen(r) {
            const C = qpcCase(r);
            const { hw, D, g2, Tw, Tx, key } = C;
            const w = Math.sqrt(2), E = -D / hw;
            return {
              prompt: t`A **quantum point contact** — a constriction a few hundred nanometres wide in a two-dimensional electron gas — is a common charge sensor beside semiconductor qubits. Along the channel its potential is a saddle, $V(x) = V_0 - \tfrac12m^*\omega^2x^2$ near the top, with $\hbar\omega = ${hw}\ \text{meV}$. An electron arrives $V_0 - E = ${D}\ \text{meV}$ below the top. WKB gives $T \approx e^{-2\gamma}$ with $\gamma = \frac1\hbar\int\sqrt{2m^*(V - E)}\,dx$, $= \pi(V_0 - E)/\hbar\omega$, while the exact transmission through an inverted parabola is $T = 1/\bigl(1 + e^{2\gamma}\bigr)$ (Kemble, 1935). By what percentage does WKB **overestimate** the transmission? Give 3 significant figures.`,
              answer: key, units: '%', tol: { rel: 0.005 },
              errors: apart([
                { value: 100 * Tx, feedback: t`That is the exact transmission as a percentage. The question asks how much bigger WKB’s value is: $(T_{\text{WKB}} - T)/T$.` },
                { value: 100 * Tw, feedback: t`That is WKB’s transmission as a percentage, not its error.` },
                { value: 100 * Math.exp(-g2 / PI), feedback: t`$\gamma = \pi(V_0 - E)/\hbar\omega$: the area under the inverted parabola’s $|p|$ brings a factor $\pi$.` },
                { value: 100 * Math.exp(-g2 / 2), feedback: t`The overestimate is $e^{-2\gamma}$, with $2\gamma = 2\pi(V_0 - E)/\hbar\omega$, not $e^{-\gamma}$.` },
                { value: 100 * (1 - Tx / Tw), feedback: t`That is the error relative to WKB’s value. Relative to the exact $T$ it is $T_{\text{WKB}}/T - 1 = e^{-2\gamma}$.` },
              ], key),
              hints: [
                t`$2\gamma = 2\pi(V_0 - E)/\hbar\omega = 2\pi\times${D}/${hw}$.`,
                t`$\dfrac{T_{\text{WKB}}}{T} = e^{-2\gamma}\bigl(1 + e^{2\gamma}\bigr) = 1 + e^{-2\gamma}$, so the overestimate is $e^{-2\gamma}$ — as a percentage, times 100.`,
              ],
              teach: t`WKB’s tunnelling formula $T \approx e^{-2\gamma}$ is good only for thick barriers: its relative error is about $T$ itself, so it fails as the energy approaches the top.`,
              explain: t`$2\gamma = ${tn(g2, 4)}$, so $T_{\text{WKB}} = ${tn(Tw, 4)}$ and the exact $T = ${tn(Tx, 4)}$. Their ratio is $1 + e^{-2\gamma}$: WKB is high by $${tn(key, 3)}\%$. The rule to carry away: **WKB’s relative error is about the transmission itself.** Deep below the top, where $T \ll 1$, it is excellent; near the top it fails, and at the top it predicts $T = 1$ where the truth is $\tfrac12$. The exact form is why a point contact’s conductance $G = (2e^2/h)\,T$ rises in smooth steps whose width is set by $\hbar\omega$ (Büttiker, 1990) — the slope that makes it a sensitive charge sensor. A one-dimensional teaching model of a two-dimensional saddle.`,
              visual: potPic({
                x: [-2.2, 2.2], y: [r6(-2.2 * hw), r6(0.5 * hw)], curves: [{ fn: `${r6(-hw / 2)}*x^2`, domain: [-2.2, 2.2] }],
                E: { from: -2.2, to: 2.2, y: r6(E * hw) }, Elabel: 'E',
                shade: [{ fn: `${r6(-hw / 2)}*x^2`, lower: `${r6(E * hw)}`, from: r6(-w * Math.sqrt(-E)), to: r6(w * Math.sqrt(-E)), color: 'warn', alpha: 0.3 }],
                xlabel: 'x along the channel (units √(ħ/m*ω))', ylabel: 'V − V₀ (meV)', caption: t`The saddle’s profile along the channel, an inverted parabola, with the electron’s energy (gold) and the forbidden stretch shaded. A one-dimensional model.`,
              }),
            };
          },
        }),
      ],
    },
    // ── bout 4 ──
    {
      title: 'Born: a beam on a nucleus',
      story: t`The first Born approximation replaces the wave inside the potential by the incoming plane wave, so the amplitude is the potential’s Fourier transform, $f_B = -\frac{m}{2\pi\hbar^2}\int e^{-i\vec q\cdot\vec r}\,V\,d^3r$. It assumes the potential barely disturbs the wave. Here it meets problems where the exact partial-wave answer is known.`,
      items: [
        num({
          id: 'r4-born', skill: 'phys4710.M6.3', difficulty: 4,
          gen(r) {
            const C = bornCase(r);
            const { V0, a, g, aExact, aBorn, key } = C;
            return {
              prompt: t`Slow neutrons scatter from a nucleus modelled as an attractive square well of depth $V_0 = ${V0}\ \text{MeV}$ and radius $a = ${a}\ \text{fm}$ (heavy nucleus: take the reduced mass as $m_nc^2 = ${MNC2.toFixed(2)}$ MeV; $\hbar c = ${HBARC_EVNM.toFixed(3)}$ MeV fm). At low energy only the $s$ wave scatters, and $\sigma \to 4\pi a_s^2$. The exact scattering length has size $|a_s| = a\left|\dfrac{\tan g}{g} - 1\right|$ with $g = \sqrt{2mV_0}\,a/\hbar$; the first Born approximation gives $|a_s| = g^2a/3$. By what factor is the exact low-energy cross section larger than Born’s, $\sigma/\sigma_B$? Give 3 significant figures.`,
              answer: key, tol: { rel: 0.005 },
              errors: apart([
                { value: aExact / aBorn, feedback: t`That is the ratio of scattering lengths. A cross section goes as $a_s^2$: square it.` },
                { value: 1 / key, feedback: t`That is $\sigma_B/\sigma$, upside down. The exact attraction pulls the wave in more strongly than first order allows, so the exact cross section is the larger.` },
                { value: ((Math.tan(g) - 1) / (g * g / 3)) ** 2, feedback: t`The exact length is $a\bigl(\tan g/g - 1\bigr)$: divide $\tan g$ by $g$ before subtracting 1.` },
                { value: ((Math.tan(g * PI / 180) / (g * PI / 180) - 1) / (g * g / 3)) ** 2, feedback: t`Your calculator is in degrees: $g$ is in radians.` },
              ], key),
              hints: [
                t`$g = \sqrt{2\,(${MNC2.toFixed(2)})(${V0})}\times${a}/${HBARC_EVNM.toFixed(3)}$ — dimensionless, and in radians.`,
                t`$\sigma/\sigma_B = \left(\dfrac{\tan g/g - 1}{g^2/3}\right)^2$. Expand $\tan g/g - 1 = g^2/3 + 2g^4/15 + \dots$ to see why the ratio exceeds 1.`,
              ],
              teach: t`The Born approximation is the first term of an expansion in the potential’s strength; at low energy its parameter is $g^2 = 2mV_0a^2/\hbar^2$, and an attractive well near binding a state makes the exact cross section far larger.`,
              explain: t`$g = ${tn(g, 4)}$, so the exact length is $${tn(aExact, 4)}\,a$ and Born’s $${tn(aBorn, 4)}\,a$; the cross sections differ by $(${tn(aExact / aBorn, 4)})^2 = ${tn(key, 3)}$. **Estimate the error from the series:** $\tan g/g - 1 = \tfrac{g^2}{3}\bigl(1 + \tfrac25g^2 + \dots\bigr)$, so Born’s relative error in $a_s$ is about $\tfrac25 g^2 = ${tn(0.4 * g * g, 2)}$ — small only when $g^2 \ll 1$, that is $V_0 \ll \hbar^2/ma^2$. As $g \to \pi/2$ the well is about to bind a state, $a_s$ diverges, and Born, blind to bound states, misses it completely. Real nuclear potentials are this strong, which is why low-energy neutron–nucleus scattering is described by measured scattering lengths, not by Born. A square well is a teaching model of a nucleus.`,
              visual: potPic({
                x: [0, r6(3 * a)], y: [r6(-1.25 * V0), r6(0.35 * V0)], curves: [seg(0, -V0, a, -V0, 'ink2', 2.4), seg(a, -V0, a, 0, 'ink2', 2.4), seg(a, 0, 3 * a, 0, 'ink2', 2.4)],
                E: { from: 0, to: r6(3 * a), y: r6(0.08 * V0) }, Elabel: 'E (slow)', xlabel: 'r (fm)', ylabel: 'V (MeV)',
                points: [label(a, -V0, `a = ${a} fm`, 'ink2', 6, 14)],
                caption: t`The square well (depth $${V0}$ MeV) and a slow neutron’s energy just above zero, drawn high so it can be seen. A teaching model: a real nucleus has a rounded edge.`,
              }),
            };
          },
        }),
        mcq({
          id: 'r4-valid', skill: 'phys4710.M6.2', difficulty: 3,
          prompt: t`In which experiment can you trust the first Born approximation for the scattering amplitude?`,
          choices: [
            t`100 keV electrons from an electron microscope scattering off a thin film of carbon atoms`,
            t`1 eV electrons scattering off argon atoms, where the cross section dips almost to zero (the Ramsauer–Townsend effect)`,
            t`10 keV neutrons scattering off protons, which have a bound state with them (the deuteron)`,
            t`Thermal neutrons scattering off a uranium nucleus whose strong-force well is tens of MeV deep`,
          ],
          answer: 0,
          why: {
            1: t`A deep dip in the cross section comes from a phase shift passing through $180^\circ$ — a strong potential bending the slow wave a lot. First order cannot produce that.`,
            2: t`A bound state just below threshold makes the scattering length huge (about 5.4 fm for the triplet $np$ state, far beyond the force’s range). Born has no bound states and misses this altogether.`,
            3: t`At low energy Born needs $|V_0| \ll \hbar^2/ma^2$; a nuclear well tens of MeV deep and a few fm wide fails this badly ($g$ of order a few radians).`,
          },
          hints: [
            t`Two conditions: at low energy, $|V_0| \ll \hbar^2/ma^2$ (the potential cannot hold anything near a bound state); at high energy, $|V_0|a \ll \hbar v$ (the particle crosses the potential before it can be turned much).`,
            t`For an electron on an atom the potential is of order $Ze^2/4\pi\epsilon_0r$, so the high-energy parameter is about $Z\alpha\,c/v$. Which case has a fast particle and a weak potential?`,
          ],
          teach: t`The Born approximation is good when the potential is weak compared with the particle’s kinetic energy over the potential’s range — fast particles on atoms, not slow ones near resonances or bound states.`,
          explain: t`A 100 keV electron moves at about $0.55c$, so for carbon $Z\alpha\,c/v \approx 6/137/0.55 \approx 0.08$: the atom barely bends the wave, and Born’s amplitude — the Fourier transform of the screened atomic potential — is what electron diffraction and microscope image theory start from (heavy atoms need corrections). The other three are slow particles meeting strong potentials, near a resonance or a bound state, where the exact phase shifts are large and first order fails.`,
          visual: geomPic(70, 'A scattering experiment seen from above (schematic): an incident plane wave, the target, an outgoing spherical wave and a detector at 70°.'),
        }),
      ],
    },
    // ── bout 5 ──
    {
      title: 'Sudden against adiabatic',
      story: t`When a Hamiltonian changes in time there are two easy limits. Change it much faster than the system’s own periods, and the state has no time to move: the **sudden** approximation. Change it much more slowly, and the system follows its instantaneous eigenstate: the **adiabatic** theorem. The art is knowing which limit you are in — and, between them, the Landau–Zener formula is exact for a linear sweep.`,
      items: [
        num({
          id: 'r5-sudden', skill: 'phys4710.M7.5', difficulty: 3,
          gen(r) {
            const C = suddenCase(r);
            const { Z, parent, ion, n, amp, key } = C;
            const st = n === 1 ? '1s' : '2s';
            const other = overlap(Z, Z + 1, 3 - n) ** 2;
            return {
              prompt: t`The nucleus of ${parent} beta-decays, and its charge jumps from $Z = ${Z}$ to $${Z + 1}$. The beta electron leaves at a sizable fraction of the speed of light, so in much less than one orbital period the atomic electron, which was in the $1s$ state of charge $${Z}$, finds itself around a charge $${Z + 1}$ — in the ion $${ion}$. In the sudden approximation, what is the probability that the ion is left in its **${st}** state? Give 3 significant figures. (Hydrogen-like states, lengths in $a_0$: $R_{10} = 2Z^{3/2}e^{-Zr}$ and $R_{20} = 2\bigl(\tfrac Z2\bigr)^{3/2}\bigl(1 - \tfrac{Zr}{2}\bigr)e^{-Zr/2}$.)`,
              answer: key, tol: { rel: 0.005 },
              errors: apart([
                { value: Math.abs(amp), feedback: t`That is the size of the overlap $\langle ${st}, Z' | 1s, Z\rangle$. A probability is its square.` },
                { value: other, feedback: t`That is the probability for the ${n === 1 ? '2s' : '1s'} state. Use $R_{${n}0}$ with the new charge.` },
                { value: 1, feedback: t`Staying in the ground state with certainty is the **adiabatic** answer, for a charge that changes slowly. Here it changes suddenly, and the old state is a superposition of the new ion’s states.` },
                { value: (Z / (Z + 1)) ** 3, feedback: t`Compute the overlap integral $\int_0^\infty R_{${n}0}(Z')\,R_{10}(Z)\,r^2\,dr$ and square it; a ratio of charges is not enough.` },
              ], key),
              hints: [
                t`Sudden: the state is unchanged, so $P = \bigl|\langle ${st}, Z' = ${Z + 1}\,|\,1s, Z = ${Z}\rangle\bigr|^2 = \Bigl(\int_0^\infty R_{${n}0}(Z')R_{10}(Z)\,r^2\,dr\Bigr)^2$.`,
                n === 1 ? t`$\int_0^\infty r^2e^{-sr}dr = 2/s^3$. The overlap of two $1s$ states is $\Bigl(\dfrac{2\sqrt{ZZ'}}{Z + Z'}\Bigr)^3$.` : t`With $s = Z + Z'/2$: $\int_0^\infty r^2e^{-sr}dr = 2/s^3$ and $\int_0^\infty r^3e^{-sr}dr = 6/s^4$.`,
              ],
              teach: t`In the sudden approximation the wave function has no time to change, so the probability of each final state is the squared overlap of the old state with it.`,
              explain: t`The overlap is $${tn(amp, 4)}$, so $P(${st}) = ${tn(key, 3)}$ (and $P(${n === 1 ? '2s' : '1s'}) = ${tn(other, 3)}$; the rest goes to higher states and to ionization, called *shake-off*). **Is sudden justified?** The beta electron, with a few keV or more, crosses the atom in about $10^{-18}$ s or less, while the daughter’s $1s$ orbital period, $2\pi a_0/(Z'^2\alpha c)$, is $${tn((2 * PI * 5.29177e-11) / ((Z + 1) ** 2 * 7.2973525643e-3 * 2.99792458e8), 2)}$ s — over ten times longer — so corrections are small, of the order of the ratio of the two times or less. ${Z === 1 ? t`For tritium this matters: the KATRIN experiment, which weighs the neutrino from the end of the tritium beta spectrum, must know the probability of every final electronic state of the daughter (in its molecular tritium source, of the molecule), because each one moves the end point.` : t`The shake-off of ⁶He⁺ was measured in an ion trap at GANIL (LPCTrap; Couratin et al., 2012), in agreement with the sudden approximation at the per-cent level.`}`,
              visual: radialPic(Z, t`Radial probability densities: the electron’s state before the decay (gold) and the daughter ion’s 1s and 2s states (dashed). Overlaps are not visible in a density plot: they need the signed wave functions.`),
            };
          },
        }),
        num({
          id: 'r5-lz', skill: 'phys4710.M7.5', difficulty: 3, transfer: true,
          gen(r) {
            const C = lzCase(r);
            const { D, fid, Pmax, key } = C;
            return {
              prompt: t`Atom interferometers built to measure gravity — the kind proposed as mid-band gravitational-wave detectors — can transfer atoms between two states by **rapid adiabatic passage**: the bias $\varepsilon$ between two levels is swept linearly through the point where they would cross, and a coupling opens a minimum gap $\Delta = ${D}\ \mu\text{eV}$. By Landau–Zener, the probability of jumping across the gap instead of following it adiabatically is $P = \exp\bigl(-\pi\Delta^2/2\hbar v\bigr)$, where $v = d\varepsilon/dt$. What is the **fastest** sweep, in μeV/ns, that still transfers at least $${fid * 100}\%$ of the atoms? Give 3 significant figures. ($\hbar = ${fmt(HB_UEVNS, 5)}\ \mu\text{eV ns}$.)`,
              answer: key, units: 'μeV/ns', tol: { rel: 0.005 },
              errors: apart([
                { value: (PI * D * D) / (2 * HB_UEVNS * Math.log(1 / fid)), feedback: t`That makes the jump probability ${fid * 100}%. The jump is the failure: set $P = ${Pmax}$, so the transfer is $1 - P = ${fid}$.` },
                { value: (PI * D * D) / (2 * HB_UEVNS * Math.log10(1 / Pmax)), feedback: t`Invert the exponential with the natural log: $v = \pi\Delta^2/\bigl(2\hbar\ln(1/P)\bigr)$.` },
                { value: (PI * D * D) / (2 * HB_UEVNS * Pmax), feedback: t`That uses the small-$P$ expansion the wrong way round. Solve $e^{-x} = P$ exactly: $x = \ln(1/P)$.` },
                { value: (D * D) / (2 * HB_UEVNS * Math.log(1 / Pmax)), feedback: t`Keep the $\pi$ in the exponent: $P = \exp(-\pi\Delta^2/2\hbar v)$.` },
              ], key),
              hints: [
                t`Failure means a jump, so require $P = \exp\bigl(-\pi\Delta^2/2\hbar v\bigr) \le ${Pmax}$.`,
                t`Take logs: $\pi\Delta^2/2\hbar v \ge \ln(1/${Pmax})$, so $v \le \dfrac{\pi\Delta^2}{2\hbar\ln(1/${Pmax})}$.`,
              ],
              teach: t`Landau–Zener makes the adiabatic condition quantitative: following the instantaneous eigenstate fails with probability $e^{-\pi\Delta^2/2\hbar v}$, so the sweep must be slow compared with $\Delta^2/\hbar$.`,
              explain: t`$v_{\max} = \dfrac{\pi(${D})^2}{2\,(${fmt(HB_UEVNS, 4)})\ln(1/${Pmax})} = ${tn(key, 3)}\ \mu\text{eV/ns}$. **Between the limits:** for a very slow sweep ($v \ll \Delta^2/\hbar$) the jump probability vanishes — the adiabatic theorem; for a very fast one it tends to 1 — the sudden limit, where the state stays put while the levels sweep past. Each extra factor of 10 in fidelity costs only a factor $\ln 10 \approx 2.3$ in the exponent, so going from 99% to 99.9% slows the sweep by a factor of only 1.5. Landau–Zener is exact for a linear sweep from far before to far after the crossing; real pulses are finite, and their ends add small oscillating corrections.`,
              visual: lzPic(t`An avoided crossing (schematic): the diabatic levels $\pm\varepsilon/2$ (dashed) would cross; the coupling opens the gap $\Delta$. Adiabatic passage stays on the lower solid curve (gold), which turns the starting state into the other one; a jump stays on its dashed line and ends upper right, not transferred.`),
            };
          },
        }),
      ],
    },
  ],
});
