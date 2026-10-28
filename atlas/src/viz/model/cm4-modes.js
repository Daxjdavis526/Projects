// Small oscillations by the Lagrangian method (PHYS 3550, M8.1–M8.3).
// DOM-free; tested in test/cm4-modes.test.mjs.
//
// Expand T and U to second order about a stable equilibrium:
//   T ≈ ½ q̇ᵀ M q̇,   U ≈ ½ qᵀ K q   ⇒   M q̈ = −K q,
// try q = a cos(ωt − δ) and get (K − ω²M) a = 0, so det(K − ω²M) = 0. The
// modes are M-orthogonal (a_mᵀ M a_n = 0), and the motion from rest at q₀ is
//   q(t) = Σ_n a_n (a_nᵀ M q₀) cos ω_n t   (modes normalized so a_nᵀ M a_n = 1).
//
// Systems:
//   chain — N point masses m_k hanging on light rods of lengths l_k from a fixed
//           pivot (N = 2 is the double pendulum). Coordinates: the rods' angles θ_j.
//           M_ij = l_i l_j Σ_{k ≥ max(i,j)} m_k,  K = diag(g l_j Σ_{k ≥ j} m_k).
//           With N equal masses on a fixed total length L, as N → ∞ the frequencies
//           tend to the hanging chain's ω_n = (j₀,ₙ/2)√(g/L) (j₀,ₙ: zeros of J₀).
//   cart  — a cart (mass Mc) on a spring k to a wall, with a pendulum (m, l) hanging
//           from it. Coordinates: x and θ.  M = [[Mc + m, m l], [m l, m l²]],
//           K = [[k, 0], [0, m g l]].

export const G = 9.8;

/** The zeros of the Bessel function J₀ (enough for the continuum comparison). */
export const J0_ZEROS = [2.404825557695773, 5.520078110286311, 8.653727912911013, 11.791534439014281, 14.930917708487787, 18.071063967910924, 21.21163662987926, 24.352471530749302];

const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : Array(n).fill(v));

/** M and K for a hanging chain of point masses (angles as coordinates). */
export function chainMK(m, l, g = G) {
  const N = m.length, M = [], K = [];
  for (let i = 0; i < N; i++) {
    M.push([]); K.push([]);
    for (let j = 0; j < N; j++) {
      let s = 0;
      for (let k = Math.max(i, j); k < N; k++) s += m[k];
      M[i].push(l[i] * l[j] * s);
      K[i].push(0);
    }
    let below = 0;
    for (let k = i; k < N; k++) below += m[k];
    K[i][i] = g * l[i] * below;
  }
  return { M, K };
}

/** M and K for a cart on a spring with a pendulum hanging from it (coordinates x, θ). */
export function cartMK(Mc, k, m, l, g = G) {
  return { M: [[Mc + m, m * l], [m * l, m * l * l]], K: [[k, 0], [0, m * g * l]] };
}

/** Build a system from parameters: { system, N, m, l, g, Mc, k }. */
export function build(p) {
  if (p.system === 'cart') return { ...cartMK(p.Mc ?? 2, p.k ?? 20, p.m1 ?? 1, p.l1 ?? 1, p.g ?? G), names: ['x', 'θ'] };
  const N = p.N ?? 2;
  const m = arr(p.m ?? 1, N), l = arr(p.l ?? 1 / N, N);
  return { ...chainMK(m, l, p.g ?? G), m, l, names: m.map((_, k) => `θ${'₁₂₃₄₅₆₇₈₉'[k] ?? k + 1}`) };
}

/** Eigenvalues (ascending) and eigenvectors of a symmetric matrix, by Jacobi rotations. */
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

/** Normal modes of M q̈ = −K q: { w (rad/s, ascending), a (M-normalized mode vectors) }. */
export function modes(M, K) {
  const n = M.length, L = M.map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
    let s = M[i][j];
    for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
    L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j];
  }
  const solveL = (b) => { const y = Array(n).fill(0); for (let i = 0; i < n; i++) { let s = b[i]; for (let k = 0; k < i; k++) s -= L[i][k] * y[k]; y[i] = s / L[i][i]; } return y; };
  const solveLT = (b) => { const y = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let k = i + 1; k < n; k++) s -= L[k][i] * y[k]; y[i] = s / L[i][i]; } return y; };
  const cols = [...Array(n).keys()].map((j) => solveL(K.map((row) => row[j])));
  const B = [...Array(n).keys()].map((i) => cols.map((c) => c[i]));
  const C = B.map((row) => solveL(row));
  const Cs = C.map((row, i) => row.map((v, j) => (v + C[j][i]) / 2));
  const { vals, vecs } = eigSym(Cs);
  const a = vecs.map((y) => {
    const v = solveLT(y), big = v.reduce((p, x) => (Math.abs(x) > Math.abs(p) ? x : p), 0);
    return big < 0 ? v.map((x) => -x) : v;                 // a fixed sign: the largest entry positive
  });
  return { w2: vals, w: vals.map((x) => Math.sqrt(Math.max(0, x))), a };
}

const mv = (A, v) => A.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);

/** The modal amplitudes of a start from rest at q₀: c_n = a_nᵀ M q₀. */
export const modalAmps = (M, md, q0) => md.a.map((a) => dot(a, mv(M, q0)));

/** q(t) from rest at q₀: Σ c_n a_n cos ω_n t (exact). */
export function motion(M, md, q0) {
  const c = modalAmps(M, md, q0);
  return (t) => md.a[0].map((_, i) => md.a.reduce((s, a, n) => s + c[n] * a[i] * Math.cos(md.w[n] * t), 0));
}

/** det(K − ω²M), by Gaussian elimination with partial pivoting. */
export function detKM(M, K, w) {
  const n = M.length, A = K.map((row, i) => row.map((v, j) => v - w * w * M[i][j]));
  let d = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (A[p][c] === 0) return 0;
    if (p !== c) { [A[p], A[c]] = [A[c], A[p]]; d = -d; }
    d *= A[c][c];
    for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; }
  }
  return d;
}

/** Horizontal positions (and heights) of the chain's masses for angles θ (exact geometry, pivot at the origin). */
export function chainXY(l, th) {
  let x = 0, y = 0;
  return th.map((a, k) => { x += l[k] * Math.sin(a); y -= l[k] * Math.cos(a); return [x, y]; });
}

/** The continuum (hanging-chain) frequencies for total length L: (j₀,ₙ/2)√(g/L). */
export const hangingChain = (n, L, g = G) => (J0_ZEROS[n - 1] / 2) * Math.sqrt(g / L);
