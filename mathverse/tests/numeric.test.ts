import { describe, it, expect } from 'vitest';
import { integrate, riemann } from '../src/core/numeric/quad';
import { solveAdaptive, solveFixed } from '../src/core/numeric/ode';
import { det, inverse, matmul, rank, nullSpace, eig, eigSymmetric, svd, transpose, matvec, gramSchmidt, dot, rref, identity } from '../src/core/numeric/linalg';
import { findRoots, criticalPoints } from '../src/core/numeric/roots';

describe('quadrature against exact integrals', () => {
  it('smooth, singular-endpoint and infinite integrals', () => {
    expect(integrate(Math.sin, 0, Math.PI).value).toBeCloseTo(2, 12);
    expect(integrate((x) => x * x, 0, 3).value).toBeCloseTo(9, 12);
    expect(integrate((x) => 1 / Math.sqrt(x), 0, 1, 1e-10).value).toBeCloseTo(2, 6);
    expect(integrate((x) => Math.exp(-x * x), -Infinity, Infinity).value).toBeCloseTo(Math.sqrt(Math.PI), 9);
    expect(integrate((x) => 1 / (1 + x * x), 0, Infinity).value).toBeCloseTo(Math.PI / 2, 9);
    expect(integrate((x) => Math.exp(-x), 0, Infinity).value).toBeCloseTo(1, 10);
  });
  it('reports divergence instead of a confident wrong number', () => {
    const r = integrate((x) => 1 / x, 0, 1);
    expect(r.ok && !r.warning).toBe(false);
  });
  it('Riemann sums converge at their known orders', () => {
    const f = (x: number) => x ** 3, exact = 0.25;
    const e1 = Math.abs(riemann(f, 0, 1, 100, 'left') - exact), e2 = Math.abs(riemann(f, 0, 1, 200, 'left') - exact);
    expect(e1 / e2).toBeCloseTo(2, 1);                         // first order
    const m1 = Math.abs(riemann(f, 0, 1, 100, 'mid') - exact), m2 = Math.abs(riemann(f, 0, 1, 200, 'mid') - exact);
    expect(m1 / m2).toBeCloseTo(4, 1);                         // second order
    expect(riemann(f, 0, 1, 10, 'simpson')).toBeCloseTo(exact, 14);   // exact for cubics
  });
});

describe('ODE solvers', () => {
  it('Dormand–Prince matches exact solutions to tolerance', () => {
    const r = solveAdaptive((_t, y) => [-2 * y[0]], [1], 0, 3);
    expect(r.ok).toBe(true);
    expect(r.y[r.y.length - 1][0]).toBeCloseTo(Math.exp(-6), 9);
    // harmonic oscillator: energy conserved, x(2π) = 1
    const h = solveAdaptive((_t, y) => [y[1], -y[0]], [1, 0], 0, 2 * Math.PI);
    expect(h.y[h.y.length - 1][0]).toBeCloseTo(1, 7);
  });
  it('fixed-step methods converge at orders 1 and 4', () => {
    const f = (_t: number, y: number[]) => [y[0]];
    const err = (n: number, m: 'euler' | 'rk4') => Math.abs(solveFixed(f, [1], 0, 1, n, m).y[n][0] - Math.E);
    expect(err(100, 'euler') / err(200, 'euler')).toBeCloseTo(2, 1);
    expect(err(20, 'rk4') / err(40, 'rk4')).toBeCloseTo(16, 0);
  });
  it('warns when a solution blows up in finite time', () => {
    const r = solveAdaptive((_t, y) => [y[0] * y[0]], [1], 0, 2);   // y = 1/(1−t)
    expect(r.ok).toBe(false);
    expect(r.warning).toMatch(/near t = 1|without bound|blows up|collapsed/);
  });
});

describe('linear algebra', () => {
  const A = [[2, 1, 0], [1, 3, 1], [0, 1, 4]];
  it('determinant, inverse, rank, null space', () => {
    expect(det(A)).toBeCloseTo(18, 12);
    const I = matmul(A, inverse(A)!);
    I.forEach((r, i) => r.forEach((v, j) => expect(v).toBeCloseTo(i === j ? 1 : 0, 12)));
    const S = [[1, 2, 3], [2, 4, 6], [1, 0, 1]];
    expect(rank(S)).toBe(2);
    const ns = nullSpace(S);
    expect(ns.length).toBe(1);
    matvec(S, ns[0]).forEach((v) => expect(v).toBeCloseTo(0, 12));
    expect(inverse([[1, 2], [2, 4]])).toBeNull();
    expect(rref([[1, 2], [3, 4]]).R).toEqual(identity(2));
  });
  it('eigenvalues: symmetric, general real, and complex pairs', () => {
    const s = eigSymmetric([[2, 1], [1, 2]]);
    expect(s.values[0]).toBeCloseTo(3, 12); expect(s.values[1]).toBeCloseTo(1, 12);
    const g = eig([[4, 1, 2], [0, 3, 1], [0, 0, 2]]);
    expect(g.map((e) => e.re)).toEqual(expect.arrayContaining([expect.closeTo(4, 8), expect.closeTo(3, 8), expect.closeTo(2, 8)]));
    for (const e of g) { const Av = matvec([[4, 1, 2], [0, 3, 1], [0, 0, 2]], e.vector!); Av.forEach((v, i) => expect(v).toBeCloseTo(e.re * e.vector![i], 8)); }
    const rot = eig([[0, -1], [1, 0]]);
    expect(rot[0].im).toBeCloseTo(1, 12);
    const r3 = eig([[0, -2, 0], [2, 0, 0], [0, 0, 5]]);
    expect(r3.some((e) => Math.abs(e.im - 2) < 1e-8)).toBe(true);
    expect(r3.some((e) => Math.abs(e.re - 5) < 1e-8 && e.im === 0)).toBe(true);
  });
  it('SVD reconstructs the matrix', () => {
    const M = [[3, 1], [1, 3], [1, 1]];
    const { U, S, V } = svd(M);
    const Sig = U.map((_, i) => S.map((s, j) => (i === j ? s : 0)));
    const R = matmul(matmul(U, Sig), transpose(V));
    R.forEach((r, i) => r.forEach((v, j) => expect(v).toBeCloseTo(M[i][j], 10)));
  });
  it('Gram–Schmidt gives an orthonormal set', () => {
    const Q = gramSchmidt([[1, 1, 0], [1, 0, 1], [0, 1, 1]]);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(dot(Q[i], Q[j])).toBeCloseTo(i === j ? 1 : 0, 12);
  });
});

describe('roots and critical points', () => {
  it('finds every root and classifies extrema', () => {
    const f = (x: number) => x ** 3 - 4 * x;
    expect(findRoots(f, -3, 3).map((r) => +r.toFixed(10))).toEqual([-2, 0, 2]);
    const cp = criticalPoints(f, (x) => 3 * x * x - 4, (x) => 6 * x, -3, 3);
    expect(cp.map((c) => c.kind)).toEqual(['max', 'min']);
    expect(cp[0].x).toBeCloseTo(-2 / Math.sqrt(3), 10);
    expect(findRoots((x) => 1 / x, -1, 1)).toEqual([]);   // a pole is not a root
  });
});

describe('adaptive solver end point', () => {
  it('a round-off-sized final step is not reported as a step-size collapse', async () => {
    const { solveAdaptive } = await import('../src/core/numeric/ode');
    // y' = 0 makes every step error-free, so steps march at maxStep and the last one is a
    // remainder of 5e-14 — which the old code mistook for a collapsing step size
    const grid = solveAdaptive(() => [0], [1], 0, 1, { maxStep: 1e-3 }).t;
    const T = grid[500] + 5e-14;
    const r0 = solveAdaptive(() => [0], [1], 0, T, { maxStep: 1e-3 });
    expect(r0.ok, r0.warning).toBe(true);
    expect(r0.t[r0.t.length - 1]).toBe(T);
    for (const t1 of [1, 0.1 + 0.2, 10 / 3, 7.000000000000001, 2 * Math.PI]) {
      const r = solveAdaptive((_t, y) => [y[1], -y[0]], [0, 1], 0, t1);
      expect(r.ok, `t1 = ${t1}: ${r.warning}`).toBe(true);
      expect(r.t[r.t.length - 1]).toBeCloseTo(t1, 12);
    }
  });
});
