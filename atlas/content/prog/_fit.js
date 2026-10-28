// Helpers for the fitting lessons (prog.P14.1, the course boss): weighted
// least squares computed in JavaScript, so the numbers a lesson prints and
// the keys its tests use come from the same arithmetic as curve_fit's
// (absolute_sigma=True: the covariance is the inverse of JᵀWJ, not rescaled).
// Every result here was checked against scipy.optimize.curve_fit in the
// Atlas's Pyodide (SciPy 1.18) to at least six significant figures.

/** Solve A x = b for a small dense system (Gaussian elimination, partial pivoting). */
function solveN(A0, b0) {
  const n = b0.length, A = A0.map((r, i) => [...r, b0[i]]);
  for (let k = 0; k < n; k++) {
    let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(A[i][k]) > Math.abs(A[p][k])) p = i;
    [A[k], A[p]] = [A[p], A[k]];
    for (let i = k + 1; i < n; i++) { const f = A[i][k] / A[k][k]; for (let j = k; j <= n; j++) A[i][j] -= f * A[k][j]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
  return x;
}
/** The inverse of a small matrix. */
export function inv(A) {
  const n = A.length;
  const cols = A.map((_, j) => solveN(A, A.map((__, i) => (i === j ? 1 : 0))));
  return A.map((_, i) => cols.map((c) => c[i]));
}

/**
 * Weighted nonlinear least squares by Levenberg–Marquardt.
 * f(x, p) → model value; xs, ys data; sig the 1σ of each y (array or number); p0 the start.
 * Returns { p, cov, err, chi2, dof, red, resid } with cov = (JᵀWJ)⁻¹ (absolute_sigma=True).
 */
export function lsq(f, xs, ys, sig, p0, { iters = 500 } = {}) {
  const s = xs.map((_, i) => (Array.isArray(sig) ? sig[i] : sig));
  const m = p0.length;
  const chi2Of = (p) => xs.reduce((acc, x, i) => acc + ((ys[i] - f(x, p)) / s[i]) ** 2, 0);
  const jac = (p) => xs.map((x, i) => p.map((pj, j) => {
    const h = pj !== 0 ? 1e-7 * Math.abs(pj) : 1e-8;
    const q1 = [...p], q2 = [...p]; q1[j] += h; q2[j] -= h;
    return (f(x, q1) - f(x, q2)) / (2 * h) / s[i];
  }));
  let p = [...p0], c = chi2Of(p), lam = 1e-3;
  for (let it = 0; it < iters; it++) {
    const J = jac(p), r = xs.map((x, i) => (ys[i] - f(x, p)) / s[i]);
    const JTJ = Array.from({ length: m }, (_, a) => Array.from({ length: m }, (__, b) => J.reduce((acc, row) => acc + row[a] * row[b], 0)));
    const JTr = Array.from({ length: m }, (_, a) => J.reduce((acc, row, i) => acc + row[a] * r[i], 0));
    let improved = false;
    for (let tries = 0; tries < 30; tries++) {
      const A = JTJ.map((row, a) => row.map((v, b) => (a === b ? v * (1 + lam) : v)));
      const d = solveN(A, JTr), q = p.map((v, j) => v + d[j]), cq = chi2Of(q);
      if (cq <= c) { const done = Math.abs(c - cq) <= 1e-15 * Math.max(1, c); p = q; c = cq; lam = Math.max(lam / 10, 1e-12); improved = !done; break; }
      lam *= 10;
    }
    if (!improved) break;
  }
  const J = jac(p);
  const JTJ = Array.from({ length: m }, (_, a) => Array.from({ length: m }, (__, b) => J.reduce((acc, row) => acc + row[a] * row[b], 0)));
  const cov = inv(JTJ), dof = xs.length - m;
  return { p, cov, err: cov.map((row, i) => Math.sqrt(row[i])), chi2: c, dof, red: c / dof, resid: xs.map((x, i) => (ys[i] - f(x, p)) / s[i]) };
}

/** Weighted linear least squares for a model Σ p_j φ_j(x): exact, by the normal equations. */
export function linlsq(basis, xs, ys, sig) {
  const s = xs.map((_, i) => (Array.isArray(sig) ? sig[i] : sig));
  const m = basis.length;
  const A = Array.from({ length: m }, (_, a) => Array.from({ length: m }, (__, b) => xs.reduce((acc, x, i) => acc + (basis[a](x) * basis[b](x)) / s[i] ** 2, 0)));
  const rhs = Array.from({ length: m }, (_, a) => xs.reduce((acc, x, i) => acc + (basis[a](x) * ys[i]) / s[i] ** 2, 0));
  const p = solveN(A, rhs), cov = inv(A);
  const model = (x) => basis.reduce((acc, phi, j) => acc + p[j] * phi(x), 0);
  const resid = xs.map((x, i) => (ys[i] - model(x)) / s[i]);
  const chi2 = resid.reduce((acc, r) => acc + r * r, 0), dof = xs.length - m;
  return { p, cov, err: cov.map((row, i) => Math.sqrt(row[i])), chi2, dof, red: chi2 / dof, resid, model };
}
