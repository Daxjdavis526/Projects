// Shared helpers for the PHYS 3550 rigid-body, normal-mode and Hamiltonian
// lessons (M7–M9): inertia tensors built from parts (each part's own tensor
// shifted by the tensor parallel-axis theorem), a Jacobi eigen-solver for
// symmetric matrices, matrices as TeX, the worked satellite of M7.1–M7.2, and
// picture builders that return ordinary visual specs (calc-vectors3d,
// cm4-rigid), so the content test validates them.
// Not a lesson: the leading underscore keeps it out of the registry.

import { sci, r6 } from './_cm.js';

/** A uniform box of mass m (kg), edges a, b, c (m) along x, y, z, centred at c0: its own tensor about its centre. */
export const boxPart = (m, [a, b, c], c0 = [0, 0, 0], name = '') => ({ m, c: c0, I: [[(m * (b * b + c * c)) / 12, 0, 0], [0, (m * (a * a + c * c)) / 12, 0], [0, 0, (m * (a * a + b * b)) / 12]], dims: [a, b, c], name });
/** A point mass at r. */
export const pointPart = (m, r, name = '') => ({ m, c: r, I: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], name });

/** The tensor parallel-axis shift for mass m whose centre sits at d from the new origin: m(|d|²1 − d dᵀ). */
export function shift(m, d) {
  const d2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => m * ((i === j ? d2 : 0) - d[i] * d[j])));
}
export const madd = (A, B) => A.map((row, i) => row.map((v, j) => v + B[i][j]));
export const mvec = (A, v) => A.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

/** The centre of mass of a list of parts. */
export function cmOf(parts) {
  const M = parts.reduce((s, p) => s + p.m, 0);
  return [0, 1, 2].map((k) => parts.reduce((s, p) => s + p.m * p.c[k], 0) / M);
}
/** The inertia tensor of the parts about the point o (default: their centre of mass). */
export function tensorOf(parts, o = cmOf(parts)) {
  let I = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of parts) I = madd(I, madd(p.I, shift(p.m, [p.c[0] - o[0], p.c[1] - o[1], p.c[2] - o[2]])));
  return I;
}

/** Eigenvalues (ascending) and unit eigenvectors (vecs[k] goes with vals[k]) of a symmetric n×n matrix, by Jacobi rotations. */
export function eigSym(A0) {
  const n = A0.length, A = A0.map((r) => r.slice()), V = A0.map((r, i) => r.map((_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] * A[p][q];
    if (off < 1e-30) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const a = A[k][p], b = A[k][q]; A[k][p] = c * a - s * b; A[k][q] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = A[p][k], b = A[q][k]; A[p][k] = c * a - s * b; A[q][k] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - s * b; V[k][q] = s * a + c * b; }
    }
  }
  const idx = [...Array(n).keys()].sort((a, b) => A[a][a] - A[b][b]);
  return { vals: idx.map((k) => A[k][k]), vecs: idx.map((k) => V.map((row) => row[k])) };
}

/** Generalized symmetric eigenproblem K a = ω² M a (M symmetric positive definite): ω² ascending and M-normalized modes. */
export function eigGen(K, M) {
  // M = LLᵀ (Cholesky); solve L⁻¹ K L⁻ᵀ y = λ y; a = L⁻ᵀ y
  const n = M.length, L = M.map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
    let s = M[i][j];
    for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
    L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j];
  }
  const solveL = (b) => { const y = Array(n).fill(0); for (let i = 0; i < n; i++) { let s = b[i]; for (let k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; } return y; };
  const solveLT = (b) => { const y = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let k = i + 1; k < n; k++) s -= L[k][i] * y[k]; y[i] = s / L[i][i]; } return y; };
  // C = L⁻¹ K L⁻ᵀ: B = L⁻¹K column by column, then C = (L⁻¹Bᵀ)ᵀ row by row (K symmetric)
  const Kc = [...Array(n).keys()].map((j) => solveL(K.map((row) => row[j])));       // columns of B
  const B = [...Array(n).keys()].map((i) => Kc.map((col) => col[i]));
  const C = B.map((row) => solveL(row));
  const Cs = C.map((row, i) => row.map((v, j) => (v + C[j][i]) / 2));
  const { vals, vecs } = eigSym(Cs);
  return { w2: vals, modes: vecs.map((y) => solveLT(y)) };
}

export const det2 = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
export const det3 = (A) => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

/** A matrix as TeX (bmatrix), each entry to n significant figures (zeros printed as 0). */
export function matTeX(A, n = 3) {
  const cell = (v) => (Math.abs(v) < 1e-9 ? '0' : sci(v, n));
  return `\\begin{bmatrix} ${A.map((row) => row.map(cell).join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
}
/** A column vector as TeX. */
export const vecTeX = (v, n = 3) => matTeX(v.map((x) => [x]), n);

// ── the worked satellite of M7.1–M7.2: a box bus with one solar wing ──
// bus 300 kg, 1.0 × 1.0 × 1.6 m; wing 30 kg, 1.0 × 3.0 × 0.03 m, its centre 2.3 m out along +y and 0.4 m above the bus's centre
export const SAT = (() => {
  const bus = boxPart(300, [1.0, 1.0, 1.6], [0, 0, 0], 'bus');
  const wing = boxPart(30, [1.0, 3.0, 0.03], [0, 2.3, 0.4], 'wing');
  const parts = [bus, wing], cm = cmOf(parts), I = tensorOf(parts, cm);
  const { vals, vecs } = eigSym(I);
  return { bus, wing, parts, cm, I, vals, vecs, M: 330 };
})();

/** The six faces of a box (edges d, centre c) as calc-vectors3d parallelograms. */
export function boxFaces(d, c, color = 'accent', alpha = 0.25) {
  const out = [], h = d.map((x) => x / 2);
  for (let k = 0; k < 3; k++) for (const sg of [-1, 1]) {
    const i = (k + 1) % 3, j = (k + 2) % 3, at = [0, 0, 0], u = [0, 0, 0], v = [0, 0, 0];
    at[k] = c[k] + sg * h[k]; at[i] = c[i] - h[i]; at[j] = c[j] - h[j];
    u[i] = d[i]; v[j] = d[j];
    out.push({ at: at.map(r6), u: u.map(r6), v: v.map(r6), color, alpha });
  }
  return out;
}

/** The satellite (bus and wing), drawn about its centre of mass, as a calc-vectors3d scene; extra merges more scene fields. */
export function satScene({ extra = {}, wing = true } = {}) {
  const cm = SAT.cm, rel = (p) => [p[0] - cm[0], p[1] - cm[1], p[2] - cm[2]];
  return {
    range: 2.6,
    parallelograms: [...boxFaces(SAT.bus.dims, rel(SAT.bus.c), 'accent', 0.22), ...(wing ? boxFaces(SAT.wing.dims, rel(SAT.wing.c), 'gold', 0.3).filter((_, k) => k >= 4) : [])],
    segments: wing ? [{ from: rel([0, 0.5, 0.4]).map(r6), to: rel([0, 0.8, 0.4]).map(r6), color: 'ink3' }] : [],
    ...extra,
  };
}

/** A still cm4-rigid picture (no controls, no Play). */
export function rigidPic(params, caption) {
  return { type: 'cm4-rigid', params: { controls: [], play: false, readout: false, ...params }, caption };
}

export { sci, r6 };
