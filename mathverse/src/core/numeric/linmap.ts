// Linear maps as motions: the geometry behind the Linear Algebra module.
// Reading typed matrices, rotations as axis–angle and their fractional powers,
// a proper (rotation–stretch–rotation) SVD, smooth paths from I to A for
// animation, row reduction with every intermediate matrix, diagonalization
// with defect detection, Gram–Schmidt as a list of subtractions, least
// squares, the inertia tensor and normal modes. DOM-free; small matrices.

import { parse } from '../expr/parse';
import { compile } from '../expr/compile';
import type { Node } from '../expr/ast';
import {
  Mat, Vec, identity, transpose, matmul, matvec, dot, norm, scale, subv, det, inverse, rref, svd, eig, eigSymmetric, solve,
} from './linalg';

const fmt6 = (v: number) => String(+v.toPrecision(6));

// ── reading a typed matrix ─────────────────────────────────────────────────
export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Read "A = [[2, 1], [1, 2]]" (the name is optional; entries may be any constant
 * expression such as cos(pi/3) or sqrt(2)/2). Several matrices may be separated
 * by ';' — use parseMatrices for that.
 */
export function parseMatrix(src: string): Parsed<{ name?: string; M: Mat }> {
  const m = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*=\s*(.*)$/s.exec(src);
  const name = m ? m[1] : undefined;
  const body = (m ? m[2] : src).trim();
  if (!body) return { ok: false, error: 'Type a matrix such as [[2, 1], [1, 2]].' };
  let node: Node;
  try { node = parse(body); } catch (e) { return { ok: false, error: (e as Error).message }; }
  if (node.t !== 'matrix') return { ok: false, error: 'Expected a matrix written row by row, like [[a, b], [c, d]].' };
  const M: Mat = [];
  for (const row of node.rows) {
    const r: number[] = [];
    for (const e of row) {
      let v: number;
      try { v = compile(e, [])([]); } catch (err) { return { ok: false, error: `An entry is not a number: ${(err as Error).message}` }; }
      if (!Number.isFinite(v)) return { ok: false, error: 'Every entry must be a finite number.' };
      r.push(v);
    }
    M.push(r);
  }
  return { ok: true, value: { name, M } };
}

/** "A = [[…]]; B = [[…]]" → named matrices in order. */
export function parseMatrices(src: string): Parsed<{ name?: string; M: Mat }[]> {
  const out: { name?: string; M: Mat }[] = [];
  for (const part of src.split(';').map((s) => s.trim()).filter(Boolean)) {
    const p = parseMatrix(part);
    if (!p.ok) return p;
    out.push(p.value);
  }
  if (!out.length) return { ok: false, error: 'Type a matrix such as [[2, 1], [1, 2]].' };
  return { ok: true, value: out };
}

// ── rotations ──────────────────────────────────────────────────────────────
export function rot2(theta: number): Mat { const c = Math.cos(theta), s = Math.sin(theta); return [[c, -s], [s, c]]; }

/** Rodrigues: rotation by `angle` about the (normalized) axis. */
export function rotAxis(axis: Vec, angle: number): Mat {
  const l = norm(axis);
  if (l < 1e-15) return identity(3);
  const [x, y, z] = axis.map((v) => v / l), c = Math.cos(angle), s = Math.sin(angle), C = 1 - c;
  return [
    [c + x * x * C, x * y * C - z * s, x * z * C + y * s],
    [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
    [z * x * C - y * s, z * y * C + x * s, c + z * z * C],
  ];
}

/** Axis and angle (0 ≤ angle ≤ π) of a 3×3 proper rotation. */
export function axisAngle(R: Mat): { axis: Vec; angle: number } {
  const tr = R[0][0] + R[1][1] + R[2][2];
  const angle = Math.acos(Math.max(-1, Math.min(1, (tr - 1) / 2)));
  const w = [R[2][1] - R[1][2], R[0][2] - R[2][0], R[1][0] - R[0][1]];
  const wl = norm(w);
  if (angle < 1e-12) return { axis: [0, 0, 1], angle: 0 };
  if (wl > 1e-6) return { axis: w.map((v) => v / wl), angle };
  // angle ≈ π: R = 2 n nᵀ − I, so n nᵀ = (R + I)/2; take its largest column
  const B = R.map((r, i) => r.map((v, j) => (v + (i === j ? 1 : 0)) / 2));
  let k = 0;
  for (let i = 1; i < 3; i++) if (B[i][i] > B[k][k]) k = i;
  const col = B.map((r) => r[k]);
  const cl = norm(col);
  return { axis: col.map((v) => v / cl), angle };
}

/** Rᔆ for a proper rotation (2×2 or 3×3): the same axis, the angle times s. */
export function rotationPower(R: Mat, s: number): Mat {
  if (R.length === 2) return rot2(s * Math.atan2(R[1][0], R[0][0]));
  const { axis, angle } = axisAngle(R);
  return rotAxis(axis, s * angle);
}

// ── SVD with rotations ───────────────────────────────────────────────────────
/**
 * A = U diag(S) Vᵀ with U and V proper rotations (det +1). The price: when
 * det A < 0 the last "singular value" is negative — the reflection lives in the
 * stretch, which is where the animation shows it (the shape flattens and flips).
 */
export function properSvd(A: Mat): { U: Mat; S: Vec; V: Mat } {
  const { U, S, V } = svd(A);
  const n = A.length;
  const Uc = transpose(U), Vc = transpose(V);           // columns as rows
  const Sx = S.slice();
  if (det(V) < 0) { Vc[n - 1] = scale(Vc[n - 1], -1); Uc[n - 1] = scale(Uc[n - 1], -1); }
  if (det(transpose(Uc)) < 0) { Uc[n - 1] = scale(Uc[n - 1], -1); Sx[n - 1] = -Sx[n - 1]; }
  return { U: transpose(Uc), S: Sx, V: transpose(Vc) };
}

const diag = (d: Vec): Mat => d.map((v, i) => d.map((_, j) => (i === j ? v : 0)));
export const lerpMat = (A: Mat, B: Mat, s: number): Mat => A.map((r, i) => r.map((v, j) => v + s * (B[i][j] - v)));

/** The straight path in matrix space: (1 − s) I + s A. */
export const linearPath = (A: Mat, s: number): Mat => lerpMat(identity(A.length), A, s);

/**
 * A rotate-and-stretch path from I (s = 0) to A (s = 1) through the polar
 * decomposition A = Q P: M(s) = Qˢ ((1 − s) I + s P). Rotations turn instead of
 * shrinking through the middle. Only for det A > 0 (otherwise null: any
 * continuous path to a reflection must pass through a singular matrix).
 */
export function polarPath(A: Mat, s: number): Mat | null {
  if (det(A) <= 1e-12) return null;
  const { U, S, V } = properSvd(A);
  const Q = matmul(U, transpose(V)), P = matmul(matmul(V, diag(S)), transpose(V));
  return matmul(rotationPower(Q, s), lerpMat(identity(A.length), P, s));
}

/** Pick a path; polar falls back to linear when det A ≤ 0. */
export function pathMatrix(A: Mat, s: number, mode: 'linear' | 'polar' = 'linear'): Mat {
  if (s >= 1) return A.map((r) => r.slice());
  if (s <= 0) return identity(A.length);
  return (mode === 'polar' ? polarPath(A, s) : null) ?? linearPath(A, s);
}

/**
 * The SVD as a motion, s ∈ [0, 3]: rotate by Vᵀ (0→1), stretch by Σ (1→2),
 * rotate by U (2→3). Returns the matrix applied so far.
 */
export function svdPath(A: Mat, s: number, f = properSvd(A)): Mat {
  const { U, S, V } = f;
  const Vt = transpose(V);
  if (s <= 1) return rotationPower(Vt, Math.max(0, s));
  if (s <= 2) { const u = s - 1; return matmul(diag(S.map((x) => 1 + u * (x - 1))), Vt); }
  return matmul(rotationPower(U, Math.min(1, s - 2)), matmul(diag(S), Vt));
}

/** 2-norm condition number σ_max / σ_min (Infinity when singular). */
export function cond(A: Mat): number {
  const S = svd(A).S.map(Math.abs);
  const lo = Math.min(...S), hi = Math.max(...S);
  return lo < 1e-14 * Math.max(1, hi) ? Infinity : hi / lo;
}

// ── row reduction, step by step ────────────────────────────────────────────
export interface RowStep { op: string; M: Mat; kind: 'swap' | 'scale' | 'eliminate'; row: number; other?: number; factor?: number }

/**
 * Gauss–Jordan elimination recording the matrix after every row operation.
 * Same algorithm, pivoting and operation strings as linalg.rref (the test
 * checks that), so the steps shown are the steps rref takes.
 */
export function rrefSteps(A: Mat, tol = 1e-10): { steps: RowStep[]; R: Mat; pivots: number[] } {
  const R = A.map((r) => r.slice()), m = R.length, n = R[0].length, pivots: number[] = [], steps: RowStep[] = [];
  const snap = () => R.map((r) => r.slice());
  let row = 0;
  for (let col = 0; col < n && row < m; col++) {
    let piv = row;
    for (let i = row + 1; i < m; i++) if (Math.abs(R[i][col]) > Math.abs(R[piv][col])) piv = i;
    if (Math.abs(R[piv][col]) < tol) continue;
    if (piv !== row) { [R[row], R[piv]] = [R[piv], R[row]]; steps.push({ op: `R${row + 1} ↔ R${piv + 1}`, M: snap(), kind: 'swap', row, other: piv }); }
    const p = R[row][col];
    if (Math.abs(p - 1) > tol) { R[row] = R[row].map((v) => v / p); steps.push({ op: `R${row + 1} ← R${row + 1} / ${fmt6(p)}`, M: snap(), kind: 'scale', row, factor: p }); }
    for (let i = 0; i < m; i++) {
      if (i === row || Math.abs(R[i][col]) < tol) continue;
      const f = R[i][col];
      R[i] = R[i].map((v, j) => v - f * R[row][j]);
      steps.push({ op: `R${i + 1} ← R${i + 1} − ${fmt6(f)}·R${row + 1}`, M: snap(), kind: 'eliminate', row: i, other: row, factor: f });
    }
    pivots.push(col);
    row++;
  }
  for (const r of R) for (let j = 0; j < n; j++) if (Math.abs(r[j]) < tol) r[j] = 0;
  return { steps, R, pivots };
}

/** The solution set of [A | b]: a point, a line/plane (particular + null-space directions), or none. */
export function solveSystem(Ab: Mat, tol = 1e-9): { kind: 'unique' | 'infinite' | 'none'; x?: Vec; dirs: Vec[]; rank: number } {
  const n = Ab[0].length - 1;
  const { R, pivots } = rref(Ab, tol);
  if (pivots.includes(n)) return { kind: 'none', dirs: [], rank: pivots.length - 1 };
  const x = new Array(n).fill(0);
  pivots.forEach((pc, i) => { x[pc] = R[i][n]; });
  const free = [...Array(n).keys()].filter((j) => !pivots.includes(j));
  const dirs = free.map((f) => { const v = new Array(n).fill(0); v[f] = 1; pivots.forEach((pc, i) => { v[pc] = -R[i][f]; }); return v; });
  return { kind: free.length ? 'infinite' : 'unique', x, dirs, rank: pivots.length };
}

/** A null-space basis with a tolerance relative to the matrix size (rank-deficient sliders rarely hit exact zeros). */
export function nullBasis(A: Mat, relTol = 1e-9): Vec[] {
  const scaleA = Math.max(1e-300, ...A.flat().map(Math.abs));
  const { R, pivots } = rref(A, relTol * scaleA);
  const n = A[0].length;
  return [...Array(n).keys()].filter((j) => !pivots.includes(j)).map((f) => {
    const v = new Array(n).fill(0); v[f] = 1; pivots.forEach((pc, i) => { v[pc] = -R[i][f]; });
    return v;
  });
}

// ── diagonalization ────────────────────────────────────────────────────────
export type Diag = { ok: true; P: Mat; D: Vec; Pinv: Mat } | { ok: false; reason: 'complex' | 'defective'; values: { re: number; im: number }[] };

/** A = P diag(D) P⁻¹ over the reals, or why not (complex eigenvalues, or too few eigenvectors). */
export function diagonalize(A: Mat, tol = 1e-7): Diag {
  const n = A.length;
  const ev = eig(A);
  const values = ev.map((e) => ({ re: e.re, im: e.im }));
  if (ev.some((e) => Math.abs(e.im) > tol)) return { ok: false, reason: 'complex', values };
  // group equal eigenvalues, take the whole eigenspace of each
  const distinct: number[] = [];
  for (const e of ev) if (!distinct.some((d) => Math.abs(d - e.re) < tol * Math.max(1, Math.abs(d)))) distinct.push(e.re);
  const cols: Vec[] = [], D: Vec = [];
  const sA = Math.max(1, ...A.flat().map(Math.abs));
  for (const l of distinct) {
    const M = A.map((r, i) => r.map((v, j) => (i === j ? v - l : v)));
    const { R, pivots } = rref(M, 1e-7 * sA);
    const free = [...Array(n).keys()].filter((j) => !pivots.includes(j));
    for (const f of free) {
      const v = new Array(n).fill(0); v[f] = 1; pivots.forEach((pc, i) => { v[pc] = -R[i][f]; });
      cols.push(scale(v, 1 / norm(v))); D.push(l);
    }
  }
  if (cols.length < n) return { ok: false, reason: 'defective', values };
  const P = transpose(cols.slice(0, n));
  const Pinv = inverse(P);
  if (!Pinv) return { ok: false, reason: 'defective', values };
  return { ok: true, P, D: D.slice(0, n), Pinv };
}

// ── Gram–Schmidt as a sequence of moves ─────────────────────────────────────
export interface GSStep { kind: 'project' | 'normalize'; k: number; j?: number; coeff: number; before: Vec; after: Vec }

/** Classical Gram–Schmidt with every subtraction and normalization recorded; R holds rᵢⱼ = qᵢ·vⱼ. */
export function gramSchmidtSteps(vs: Vec[], tol = 1e-10): { Q: Vec[]; R: Mat; steps: GSStep[]; dependent: number[] } {
  const Q: Vec[] = [], steps: GSStep[] = [], dependent: number[] = [];
  const n = vs.length, R = Array.from({ length: n }, () => new Array(n).fill(0));
  vs.forEach((v, k) => {
    let w = v.slice();
    Q.forEach((q, j) => {
      const c = dot(v, q);                          // classical: project the original vector
      R[j][k] = c;
      const after = subv(w, scale(q, c));
      steps.push({ kind: 'project', k, j, coeff: c, before: w, after });
      w = after;
    });
    const l = norm(w);
    R[Q.length][k] = l;
    if (l <= tol * Math.max(1, norm(v))) { dependent.push(k); steps.push({ kind: 'normalize', k, coeff: 0, before: w, after: w }); Q.push(new Array(v.length).fill(NaN)); return; }
    const q = scale(w, 1 / l);
    steps.push({ kind: 'normalize', k, coeff: l, before: w, after: q });
    Q.push(q);
  });
  return { Q, R, steps, dependent };
}

// ── least squares ──────────────────────────────────────────────────────────
/** Minimize |Ax − b| through the normal equations AᵀA x = Aᵀb; returns p = Ax̂ and e = b − p. */
export function leastSquares(A: Mat, b: Vec): { x: Vec; p: Vec; e: Vec } | null {
  const At = transpose(A);
  const x = solve(matmul(At, A), matvec(At, b));
  if (!x) return null;
  const p = matvec(A, x);
  return { x, p, e: subv(b, p) };
}

/** Projection matrix onto the column space of A (independent columns): A (AᵀA)⁻¹ Aᵀ. */
export function projectionMatrix(A: Mat): Mat | null {
  const At = transpose(A), G = inverse(matmul(At, A));
  return G ? matmul(matmul(A, G), At) : null;
}

// ── physics ────────────────────────────────────────────────────────────────
/** Inertia tensor about the origin of point masses: I = Σ m (|r|² 𝟙 − r rᵀ). */
export function inertiaPoints(parts: { m: number; r: Vec }[]): Mat {
  const I = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const { m, r } of parts) { const r2 = dot(r, r); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) I[i][j] += m * ((i === j ? r2 : 0) - r[i] * r[j]); }
  return I;
}

/** Inertia tensor of a solid box (sides a, b, c along its own axes) about its centre: diag(M/12 (b²+c²), …). */
export function inertiaBox(M: number, a: number, b: number, c: number): Mat {
  return diag([(M / 12) * (b * b + c * c), (M / 12) * (a * a + c * c), (M / 12) * (a * a + b * b)]);
}

/** Rotate a tensor into another frame: R I Rᵀ. */
export const rotateTensor = (I: Mat, R: Mat): Mat => matmul(matmul(R, I), transpose(R));

/**
 * Normal modes of M ẍ = −K x (M diagonal, positive): ω² are the eigenvalues of
 * M^{-1/2} K M^{-1/2}; the mode shapes are M^{-1/2} y. Sorted slow to fast.
 */
export function normalModes(K: Mat, masses: Vec): { omega: Vec; modes: Vec[] } {
  const r = masses.map((m) => 1 / Math.sqrt(m));
  const Kt = K.map((row, i) => row.map((v, j) => v * r[i] * r[j]));
  const { values, vectors } = eigSymmetric(Kt);
  const order = values.map((_, i) => i).sort((i, j) => values[i] - values[j]);
  return {
    omega: order.map((i) => Math.sqrt(Math.max(0, values[i]))),
    modes: order.map((i) => { const x = vectors[i].map((v, k) => v * r[k]); const l = norm(x); const sgn = x.find((v) => Math.abs(v) > 1e-9)! < 0 ? -1 : 1; return scale(x, sgn / l); }),
  };
}

/**
 * Exact motion from rest at x₀: x(t) = Σ cᵢ cos(ωᵢ t) φᵢ, with cᵢ from φᵢᵀ M x₀ / φᵢᵀ M φᵢ
 * (the modes are M-orthogonal).
 */
export function modalCoefficients(modes: Vec[], masses: Vec, x0: Vec): Vec {
  return modes.map((phi) => {
    let num = 0, den = 0;
    for (let k = 0; k < phi.length; k++) { num += phi[k] * masses[k] * x0[k]; den += phi[k] * masses[k] * phi[k]; }
    return num / den;
  });
}

// small helpers the demos share
export const outer = (a: Vec, b: Vec): Mat => a.map((x) => b.map((y) => x * y));
export const matAdd = (A: Mat, B: Mat): Mat => A.map((r, i) => r.map((v, j) => v + B[i][j]));
export const columns = (A: Mat): Vec[] => transpose(A);
export const fromColumns = (cols: Vec[]): Mat => transpose(cols);
