import { describe, it, expect } from 'vitest';
import {
  CS, charRoots, dampingKind, homog2, particular2, solveLinear2, forcingFn, response, resonantFrequency,
  expm2, classify2, eig2, matrixFromTraceDet, matrixShape, linear1, ellipticK, pendulumPeriod, equilibria, fitOrder, M2, Forcing, Linear1,
} from '../src/core/numeric/dynamics';
import { solveAdaptive, solveFixed } from '../src/core/numeric/ode';

const last = (tr: { y: number[][] }) => tr.y[tr.y.length - 1];

describe('C(t), S(t) through q = 0', () => {
  it('matches cosh/sinh, cos/sin and the limit 1, t', () => {
    expect(CS(4, 0.7)[0]).toBeCloseTo(Math.cosh(1.4), 13);
    expect(CS(4, 0.7)[1]).toBeCloseTo(Math.sinh(1.4) / 2, 13);
    expect(CS(-9, 0.7)[0]).toBeCloseTo(Math.cos(2.1), 13);
    expect(CS(-9, 0.7)[1]).toBeCloseTo(Math.sin(2.1) / 3, 13);
    expect(CS(0, 2)).toEqual([1, 2]);
    // continuity across the series switch
    const [c1, s1] = CS(1e-7, 2), [c2, s2] = CS(4e-6, 1);
    expect(c1).toBeCloseTo(Math.cosh(Math.sqrt(1e-7) * 2), 14);
    expect(s2).toBeCloseTo(Math.sinh(Math.sqrt(4e-6)) / Math.sqrt(4e-6), 12);
    expect(s1).toBeGreaterThan(2);
    expect(c2).toBeGreaterThan(1);
  });
});

describe('second-order constant-coefficient equations', () => {
  it('classifies the damping regimes', () => {
    expect(dampingKind(3, 1)).toBe('overdamped');
    expect(dampingKind(2, 1)).toBe('critically damped');
    expect(dampingKind(0.5, 4)).toBe('underdamped');
    expect(dampingKind(0, 4)).toBe('undamped');
    expect(dampingKind(-0.3, 4)).toBe('negatively damped (growing)');
    expect(dampingKind(1, -2)).toBe('unstable (a positive real root)');
    expect(charRoots(0, 4)).toEqual([{ re: -0, im: 2 }, { re: -0, im: -2 }]);
    const r = charRoots(3, 2);
    expect(r[0].re).toBeCloseTo(-1, 14); expect(r[1].re).toBeCloseTo(-2, 14);
  });
  it('homog2 agrees with Dormand–Prince in all three regimes and at critical damping', () => {
    for (const [b, c] of [[3, 1], [2, 1], [0.4, 9], [0, 4], [-0.2, 1], [2 + 1e-7, 1]]) {
      const ex = homog2(b, c, 1.3, -0.7);
      const tr = solveAdaptive((_t, y) => [y[1], -b * y[1] - c * y[0]], [1.3, -0.7], 0, 5, { rtol: 1e-11, atol: 1e-13 });
      expect(last(tr)[0]).toBeCloseTo(ex.y(5), 8);
      expect(last(tr)[1]).toBeCloseTo(ex.dy(5), 8);
    }
  });
  it('particular solutions satisfy the equation, including the resonant cases', () => {
    const cases: [number, number, Forcing, number][] = [
      [1, 4, { kind: 'cos', A: 2, w: 1.5 }, 0],
      [0, 4, { kind: 'cos', A: 2, w: 2 }, 1],          // pure resonance
      [3, 2, { kind: 'exp', A: 1, a: 0.5 }, 0],
      [3, 2, { kind: 'exp', A: 1, a: -1 }, 1],          // a is a simple root
      [2, 1, { kind: 'exp', A: 1, a: -1 }, 2],          // a is a double root
      [1, 2, { kind: 'const', A: 3 }, 0],
      [1, 0, { kind: 'const', A: 3 }, 1],
      [0, 0, { kind: 'const', A: 3 }, 2],
      [1, 2, { kind: 'lin', A: 1 }, 0],
      [2, 0, { kind: 'lin', A: 1 }, 1],
      [0, 0, { kind: 'lin', A: 1 }, 2],
    ];
    for (const [b, c, g, res] of cases) {
      const p = particular2(b, c, g);
      expect(p.resonance).toBe(res);
      const G = forcingFn(g);
      for (const t of [0.3, 1.1, 2.7]) {
        const h = 1e-4;
        const ypp = (p.dyp(t + h) - p.dyp(t - h)) / (2 * h);
        expect(ypp + b * p.dyp(t) + c * p.yp(t)).toBeCloseTo(G(t), 5);
        expect((p.yp(t + h) - p.yp(t - h)) / (2 * h)).toBeCloseTo(p.dyp(t), 6);
      }
    }
  });
  it('the full IVP solution matches the numerical one', () => {
    const g: Forcing = { kind: 'cos', A: 1, w: 1.2 };
    const s = solveLinear2(0.3, 2, g, 0.5, 0);
    const tr = solveAdaptive((t, y) => [y[1], forcingFn(g)(t) - 0.3 * y[1] - 2 * y[0]], [0.5, 0], 0, 10, { rtol: 1e-11, atol: 1e-13 });
    expect(last(tr)[0]).toBeCloseTo(s.y(10), 8);
  });
  it('steady-state response: amplitude, phase and the resonance peak', () => {
    const w0 = 2, z = 0.1, F = 1;
    expect(response(w0, z, F, w0).amp).toBeCloseTo(F / (2 * z * w0 * w0), 14);
    expect(response(w0, z, F, w0).phase).toBeCloseTo(Math.PI / 2, 14);
    const wr = resonantFrequency(w0, z);
    const a = response(w0, z, F, wr).amp;
    expect(a).toBeGreaterThan(response(w0, z, F, wr * 1.001).amp);
    expect(a).toBeGreaterThan(response(w0, z, F, wr * 0.999).amp);
    expect(resonantFrequency(1, 0.8)).toBe(0);
  });
});

describe('2×2 linear systems', () => {
  it('expm2 matches numerical integration for every type', () => {
    const mats: M2[] = [[1, 2, 3, -1], [-1, 0, 0, -3], [0, 1, -4, -0.4], [0, 1, -1, 0], [-1, 1, 0, -1], [2, 0, 0, 2], [1, 1, -1, 1]];
    for (const A of mats) {
      const E = expm2(A, 1.3);
      const tr = solveAdaptive((_t, y) => [A[0] * y[0] + A[1] * y[1], A[2] * y[0] + A[3] * y[1]], [0.7, -0.4], 0, 1.3, { rtol: 1e-12, atol: 1e-14 });
      const [x, y] = last(tr);
      expect(E[0] * 0.7 + E[1] * -0.4).toBeCloseTo(x, 8);
      expect(E[2] * 0.7 + E[3] * -0.4).toBeCloseTo(y, 8);
    }
  });
  it('classifies by trace and determinant', () => {
    expect(classify2(0, -1)).toBe('saddle');
    expect(classify2(-3, 2)).toBe('stable node');
    expect(classify2(3, 2)).toBe('unstable node');
    expect(classify2(-1, 4)).toBe('stable spiral');
    expect(classify2(1, 4)).toBe('unstable spiral');
    expect(classify2(0, 4)).toBe('center');
    expect(classify2(-2, 1)).toBe('stable star / degenerate node');
    expect(classify2(-2, 0)).toBe('line of equilibria (stable)');
  });
  it('eigenvalues and eigenvectors', () => {
    const { values, vectors } = eig2([1, 2, 2, 1]);
    expect(values[0].re).toBeCloseTo(3, 14); expect(values[1].re).toBeCloseTo(-1, 14);
    const v = vectors[0]!;
    expect(Math.abs(v[0] - v[1])).toBeLessThan(1e-12);
    const c = eig2([0, 1, -4, 0]).values;
    expect(c[0].im).toBeCloseTo(2, 14);
  });
  it('re-shaping keeps the requested trace and determinant', () => {
    const shape = matrixShape([1, 2, 0.5, -1]);
    for (const [tau, D] of [[-1, 3], [2, -4], [0, 1], [-2, 1], [1, 0]]) {
      const A = matrixFromTraceDet(tau, D, shape);
      expect(A[0] + A[3]).toBeCloseTo(tau, 12);
      expect(A[0] * A[3] - A[1] * A[2]).toBeCloseTo(D, 12);
    }
  });
});

describe('linear first-order equations (integrating factor)', () => {
  it('every exact solution matches Dormand–Prince', () => {
    const kinds: Linear1[] = ['const', 'exp', 'sin', 'ramp', 'gauss'];
    for (const kind of kinds) for (const [k, w] of [[1.5, 2], [0.7, 0.7]]) {
      const L = linear1(kind, k, 1.2, w, -0.5);
      const tr = solveAdaptive((t, y) => [L.q(t) - L.p(t) * y[0]], [-0.5], 0, 4, { rtol: 1e-11, atol: 1e-13 });
      expect(last(tr)[0]).toBeCloseTo(L.y(4), 8);
      expect(L.y(0)).toBeCloseTo(-0.5, 13);
    }
  });
});

describe('pendulum', () => {
  it('K(0) = π/2 and K(1/2) to 15 digits', () => {
    expect(ellipticK(0)).toBeCloseTo(Math.PI / 2, 15);
    expect(ellipticK(0.5)).toBeCloseTo(1.854074677301372, 14);
  });
  it('the period matches a numerical quarter swing', () => {
    const th0 = 2.5, T = pendulumPeriod(1, th0);
    const tr = solveAdaptive((_t, y) => [y[1], -Math.sin(y[0])], [th0, 0], 0, T, { rtol: 1e-12, atol: 1e-14 });
    expect(last(tr)[0]).toBeCloseTo(th0, 7);
    expect(pendulumPeriod(1, 1e-4)).toBeCloseTo(2 * Math.PI, 7);
  });
});

describe('equilibria and orders', () => {
  it('finds the equilibria of the damped pendulum and Lotka–Volterra', () => {
    const eq = equilibria((x, y) => [y, -Math.sin(x) - 0.3 * y], (x) => [0, 1, -Math.cos(x), -0.3], { x: [-4, 4], y: [-3, 3] });
    const xs = eq.map((p) => p.x).sort((a, b) => a - b);
    expect(xs.length).toBe(3);
    expect(xs[0]).toBeCloseTo(-Math.PI, 10); expect(xs[1]).toBeCloseTo(0, 12); expect(xs[2]).toBeCloseTo(Math.PI, 10);
    const lv = equilibria((x, y) => [x * (1 - y), y * (x - 1)], (x, y) => [1 - y, -x, y, x - 1], { x: [-0.5, 3], y: [-0.5, 3] });
    expect(lv.length).toBe(2);
  });
  it('Euler, Heun and RK4 show orders 1, 2 and 4', () => {
    const f = (t: number, y: number[]) => [Math.cos(t) * y[0]];
    const exact = Math.exp(Math.sin(2));
    for (const [m, p] of [['euler', 1], ['heun', 2], ['rk4', 4]] as const) {
      const ns = [20, 40, 80, 160];
      const errs = ns.map((n) => Math.abs(solveFixed(f, [1], 0, 2, n, m).y[n][0] - exact));
      expect(fitOrder(ns.map((n) => 2 / n), errs)).toBeCloseTo(p, 0);
    }
  });
});
