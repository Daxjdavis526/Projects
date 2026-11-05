import { describe, it, expect } from 'vitest';
import {
  thomas, cyclicThomas, cyclicWork, Heat1D, Scheme1D, heatSineSeries, sineCoeffsPL, fourierCoeffs, fourierSum, GIBBS,
  Heat2D, Wave1D, dalembert, Grid2, solveRelax, sorOmegaOpt, residual, LaplaceSquare, circleAverage, greenSquare,
  greenSquareGrid, besselJ, besselJZeros, erf, erfc, heatKernel, survival, amplification, classify2, shoot, slEigenvalues,
  Schrodinger1D, freePacket,
} from '../src/core/numeric/pde';

const PI = Math.PI;
const slope = (e1: number, e2: number, ratio = 2) => Math.log(e1 / e2) / Math.log(ratio);

describe('tridiagonal solvers', () => {
  it('Thomas and cyclic Thomas solve their systems', () => {
    const n = 7;
    const a = Float64Array.from({ length: n }, (_, i) => -1 - 0.1 * i), b = Float64Array.from({ length: n }, (_, i) => 4 + i), c = Float64Array.from({ length: n }, (_, i) => -0.5 + 0.05 * i);
    const xTrue = Float64Array.from({ length: n }, (_, i) => Math.sin(i + 1));
    const d = new Float64Array(n);
    for (let i = 0; i < n; i++) d[i] = b[i] * xTrue[i] + (i > 0 ? a[i] * xTrue[i - 1] : 0) + (i < n - 1 ? c[i] * xTrue[i + 1] : 0);
    const x = new Float64Array(n);
    thomas(a, b, c, d, x, n, new Float64Array(n), new Float64Array(n));
    for (let i = 0; i < n; i++) expect(x[i]).toBeCloseTo(xTrue[i], 12);
    // cyclic: add the corner couplings
    for (let i = 0; i < n; i++) d[i] = b[i] * xTrue[i] + a[i] * xTrue[(i - 1 + n) % n] + c[i] * xTrue[(i + 1) % n];
    cyclicThomas(a, b, c, d, x, n, cyclicWork(n));
    for (let i = 0; i < n; i++) expect(x[i]).toBeCloseTo(xTrue[i], 12);
  });
});

describe('1D heat equation against the decaying sine mode', () => {
  const run = (scheme: Scheme1D, N: number, dt: number, T: number, alpha = 1) => {
    const h = new Heat1D({ L: 1, N, alpha });
    h.setInitial((x) => Math.sin(PI * x));
    const steps = Math.round(T / dt);
    for (let k = 0; k < steps; k++) h.step(dt, scheme);
    let e = 0;
    for (let i = 0; i < h.n; i++) e = Math.max(e, Math.abs(h.u[i] - Math.exp(-alpha * PI * PI * T) * Math.sin(PI * h.x[i])));
    return e;
  };
  it('each scheme approximates exp(−απ²t) sin πx', () => {
    for (const s of ['ftcs', 'btcs', 'cn'] as Scheme1D[]) expect(run(s, 40, 0.4 / 1600, 0.1)).toBeLessThan(2e-3);
  });
  it('FTCS (r fixed) and Crank–Nicolson (Δt ∝ Δx) converge at second order; BTCS (Δt ∝ Δx) at first', () => {
    const f1 = run('ftcs', 20, 0.4 / 400, 0.1), f2 = run('ftcs', 40, 0.4 / 1600, 0.1);
    expect(slope(f1, f2)).toBeGreaterThan(1.9); expect(slope(f1, f2)).toBeLessThan(2.1);
    const c1 = run('cn', 20, 0.1 / 20, 0.1), c2 = run('cn', 40, 0.1 / 40, 0.1), c3 = run('cn', 80, 0.1 / 80, 0.1);
    expect(slope(c2, c3)).toBeGreaterThan(1.9); expect(slope(c1, c2)).toBeGreaterThan(1.8);
    const b1 = run('btcs', 40, 0.1 / 40, 0.1), b2 = run('btcs', 80, 0.1 / 80, 0.1), b3 = run('btcs', 160, 0.1 / 160, 0.1);
    expect(slope(b2, b3)).toBeGreaterThan(0.85); expect(slope(b2, b3)).toBeLessThan(1.15); expect(slope(b1, b2)).toBeLessThan(1.2);
  });
  it('FTCS blows up beyond r = ½ and is fine below', () => {
    const go = (r: number) => {
      const h = new Heat1D({ L: 1, N: 40, alpha: 1 });
      h.setInitial((x) => Math.sin(PI * x) + 1e-6 * Math.sin(39 * PI * x));
      for (let k = 0; k < 400; k++) h.step((r * h.dx * h.dx) / 1, 'ftcs');
      return Math.max(...h.u.map(Math.abs));
    };
    expect(go(0.48)).toBeLessThan(1);
    expect(go(0.55)).toBeGreaterThan(1e3);
    expect(new Heat1D({ L: 1, N: 40, alpha: 1 }).rMax).toBeCloseTo(0.5, 12);
  });
  it('insulated ends conserve heat exactly; Robin ends approach the exact steady state', () => {
    const h = new Heat1D({ L: 2, N: 50, alpha: 0.7, left: { kind: 'neumann' }, right: { kind: 'neumann' } });
    h.setInitial((x) => (x < 0.6 ? 1 : 0) + x * x);
    const Q0 = h.heat();
    for (let k = 0; k < 300; k++) h.step(0.01, 'cn');
    expect(Math.abs(h.heat() - Q0)).toBeLessThan(1e-12);
    for (let k = 0; k < 300; k++) h.step(0.001, 'ftcs');
    expect(Math.abs(h.heat() - Q0)).toBeLessThan(1e-12);
    // left held at 1, right loses heat to ambient 0 with Bi: steady u = 1 − Bi x/(1 + Bi L)
    const Bi = 2, L = 1;
    const r = new Heat1D({ L, N: 40, alpha: 1, left: { kind: 'dirichlet', value: 1 }, right: { kind: 'robin', bi: Bi, value: 0 } });
    r.setInitial(() => 0);
    for (let k = 0; k < 1000; k++) r.step(0.02, 'btcs');
    for (let i = 0; i < r.n; i++) expect(r.u[i]).toBeCloseTo(1 - (Bi * r.x[i]) / (1 + Bi * L), 9);
  });
  it('periodic rods keep the mean and decay modes', () => {
    const h = new Heat1D({ L: 2 * PI, N: 64, alpha: 1, periodic: true });
    h.setInitial((x) => 2 + Math.cos(x));
    const Q0 = h.heat();
    for (let k = 0; k < 100; k++) h.step(0.01, 'cn');
    expect(h.heat()).toBeCloseTo(Q0, 11);
    expect(h.u[0]).toBeCloseTo(2 + Math.exp(-1), 3);
  });
  it('the sine series solves the box initial condition', () => {
    const b = sineCoeffsPL([0, 0.3, 0.3, 0.7, 0.7, 1], [0, 0, 1, 1, 0, 0], 400);
    // the box's exact coefficients: (2/kπ)(cos .3kπ − cos .7kπ)
    for (const k of [1, 2, 5, 17]) expect(b[k - 1]).toBeCloseTo((2 / (k * PI)) * (Math.cos(0.3 * k * PI) - Math.cos(0.7 * k * PI)), 12);
    const h = new Heat1D({ L: 1, N: 200, alpha: 1 });
    h.setInitial((x) => (x > 0.3 && x < 0.7 ? 1 : 0), true);
    for (let k = 0; k < 1000; k++) h.step(0.00001, 'ftcs');
    expect(Math.abs(h.at(0.5) - heatSineSeries(b, 1, 1, 0.5, 0.01))).toBeLessThan(2e-4);
  });
});

describe('2D heat equation', () => {
  const run = (scheme: 'ftcs' | 'adi', n: number, dt: number, T: number) => {
    const z = { kind: 'dirichlet' as const, value: 0 };
    const h = new Heat2D({ L: 1, n, alpha: 1, left: z, right: z, bottom: z, top: z });
    h.setInitial((x, y) => Math.sin(PI * x) * Math.sin(2 * PI * y));
    for (let k = 0, s = Math.round(T / dt); k < s; k++) h.step(dt, scheme);
    let e = 0;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) e = Math.max(e, Math.abs(h.u[j * (n + 1) + i] - Math.exp(-5 * PI * PI * T) * Math.sin(PI * i / n) * Math.sin(2 * PI * j / n)));
    return e;
  };
  it('the (1, 2) mode decays as exp(−5π²t); FTCS and ADI converge at second order', () => {
    const f1 = run('ftcs', 16, 0.2 / 256, 0.02), f2 = run('ftcs', 32, 0.2 / 1024, 0.02);
    expect(slope(f1, f2)).toBeGreaterThan(1.9);
    const a1 = run('adi', 16, 0.02 / 16, 0.02), a2 = run('adi', 32, 0.02 / 32, 0.02);
    expect(slope(a1, a2)).toBeGreaterThan(1.8);
    expect(a2).toBeLessThan(5e-3);
  });
  it('ADI stays stable far beyond the FTCS limit; insulated plates conserve heat', () => {
    const nb = { kind: 'neumann' as const };
    const h = new Heat2D({ L: 1, n: 30, alpha: 1, left: nb, right: nb, bottom: nb, top: nb });
    h.setInitial((x, y) => Math.exp(-40 * ((x - 0.3) ** 2 + (y - 0.6) ** 2)));
    const Q0 = h.heat();
    for (let k = 0; k < 50; k++) h.step(0.01, 'adi');      // r = 9
    expect(Math.abs(h.heat() - Q0)).toBeLessThan(1e-12);
    expect(Math.max(...h.u)).toBeLessThan(1);
  });
});

describe('wave equation', () => {
  it('leapfrog reproduces the standing wave at second order and conserves its energy', () => {
    const err = (N: number) => {
      const w = new Wave1D(1, N, 1, true, true);
      const dt = 0.5 / N;
      w.init((x) => Math.sin(PI * x), () => 0, dt);
      const E0 = w.energy();
      while (w.t < 0.75 - 1e-12) w.step();
      expect(Math.abs(w.energy() - E0)).toBeLessThan(1e-12);
      let e = 0;
      for (let i = 0; i < w.n; i++) e = Math.max(e, Math.abs(w.u[i] - Math.cos(PI * w.t) * Math.sin(PI * w.x[i])));
      return e;
    };
    expect(slope(err(40), err(80))).toBeGreaterThan(1.9);
  });
  it("d'Alembert with reflections satisfies the end conditions and matches leapfrog", () => {
    const f = (x: number) => Math.exp(-200 * (x - 0.4) ** 2);
    for (const [lf, rf] of [[true, true], [true, false], [false, false]] as [boolean, boolean][]) {
      const d = dalembert(f, () => 0, 1, 1, lf, rf);
      for (const t of [0.3, 0.77, 1.9, 3.3]) {
        if (lf) expect(Math.abs(d.u(0, t))).toBeLessThan(1e-12);
        else expect(Math.abs(d.u(1e-6, t) - d.u(0, t))).toBeLessThan(1e-4);
        if (rf) expect(Math.abs(d.u(1, t))).toBeLessThan(1e-12);
      }
      const w = new Wave1D(1, 400, 1, lf, rf);
      w.init(f, () => 0, 0.5 / 400);
      while (w.t < 1.3 - 1e-12) w.step();
      let e = 0;
      for (let i = 0; i < w.n; i++) e = Math.max(e, Math.abs(w.u[i] - d.u(w.x[i], w.t)));
      expect(e).toBeLessThan(2e-2);
    }
  });
  it('a right-moving pulse reflects inverted from a fixed end, upright from a free end; C = 1 is exact on the grid', () => {
    const f = (x: number) => Math.max(0, 1 - Math.abs(x - 0.3) / 0.1);
    const fixed = dalembert(f, (x) => -f(x), 1, 1, true, true), free = dalembert(f, (x) => -f(x), 1, 1, true, false);
    expect(fixed.u(0.5, 0.2)).toBeCloseTo(1, 12);          // moved right by ct
    expect(fixed.u(0.7, 1.0)).toBeCloseTo(-1, 12);         // bounced off x = 1 inverted
    expect(free.u(0.7, 1.0)).toBeCloseTo(1, 12);           // bounced upright
    const w = new Wave1D(1, 100, 1, true, true);
    // two-level start that is exactly the travelling pulse
    w.dt = 0.01; w.uOld.set(Array.from(w.x, (x) => fixed.u(x, 0))); w.u.set(Array.from(w.x, (x) => fixed.u(x, 0.01))); w.t = 0.01;
    for (let k = 0; k < 150; k++) w.step();
    for (let i = 0; i < w.n; i++) expect(Math.abs(w.u[i] - fixed.u(w.x[i], w.t))).toBeLessThan(1e-12);
  });
  it('a free–free string with net momentum drifts', () => {
    const d = dalembert(() => 0, (x) => x, 1, 1, false, false);   // u_t(x,0) = 1
    expect(d.u(0.5, 2.5)).toBeCloseTo(2.5, 12);
  });
});

describe('Laplace and Poisson', () => {
  const grid = (n: number, bc: (x: number, y: number) => number, f?: (x: number, y: number) => number): Grid2 => {
    const m = n + 1, u = new Float64Array(m * m), fixed = new Uint8Array(m * m), F = f ? new Float64Array(m * m) : null;
    for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) {
      const id = j * m + i, x = i / n, y = j / n;
      if (i === 0 || j === 0 || i === n || j === n) { fixed[id] = 1; u[id] = bc(x, y); }
      if (F) F[id] = f!(x, y);
    }
    return { n, h: 1 / n, u, fixed, f: F };
  };
  it('a harmonic function is recovered at second order; SOR beats Gauss–Seidel beats Jacobi', () => {
    const exact = (x: number, y: number) => Math.exp(PI * x) * Math.sin(PI * y) / 10;
    const err = (n: number) => {
      const g = grid(n, exact);
      solveRelax(g, 'sor', sorOmegaOpt(n), 1e-13);
      let e = 0;
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) e = Math.max(e, Math.abs(g.u[j * (n + 1) + i] - exact(i / n, j / n)));
      return e;
    };
    expect(slope(err(16), err(32))).toBeGreaterThan(1.9);
    const its = (['jacobi', 'gs', 'sor'] as const).map((m) => solveRelax(grid(24, exact), m, sorOmegaOpt(24), 1e-8, 50000).iterations);
    expect(its[1]).toBeLessThan(its[0] * 0.6);
    expect(its[2]).toBeLessThan(its[1] / 5);
  });
  it('Poisson with a manufactured solution converges at second order', () => {
    const exact = (x: number, y: number) => Math.sin(PI * x) * Math.sin(PI * y);
    const err = (n: number) => {
      const g = grid(n, () => 0, (x, y) => -2 * PI * PI * exact(x, y));
      solveRelax(g, 'sor', sorOmegaOpt(n), 1e-13);
      expect(residual(g)).toBeLessThan(1e-6);
      let e = 0;
      for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) e = Math.max(e, Math.abs(g.u[j * (n + 1) + i] - exact(i / n, j / n)));
      return e;
    };
    expect(slope(err(16), err(32))).toBeCloseTo(2, 1);
  });
  it('the series solution matches its boundary data, the finite-difference solution, and the mean-value property', () => {
    const xs = [0, 0.25, 0.5, 0.75, 1];
    const sides = { bottom: { xs, ys: [0, 0.4, -0.2, 0.3, 1] }, right: { xs, ys: [1, 0.6, 0.6, 0, 0.5] }, top: { xs, ys: [-0.5, 0, 0.8, 0.2, 0.5] }, left: { xs, ys: [0, 0.3, 0.1, -0.4, -0.5] } };
    const S = new LaplaceSquare(sides, 400);
    expect(S.at(0.5, 1e-9)).toBeCloseTo(-0.2, 2);
    expect(S.at(1, 0.25)).toBeCloseTo(0.6, 2);
    const n = 40, m = n + 1;
    const pl = (p: { xs: number[]; ys: number[] }, s: number) => { for (let j = 0; j + 1 < p.xs.length; j++) if (s <= p.xs[j + 1]) return p.ys[j] + ((p.ys[j + 1] - p.ys[j]) * (s - p.xs[j])) / (p.xs[j + 1] - p.xs[j]); return p.ys[p.ys.length - 1]; };
    const g = grid(n, (x, y) => (y === 0 ? pl(sides.bottom, x) : y === 1 ? pl(sides.top, x) : x === 0 ? pl(sides.left, y) : pl(sides.right, y)));
    solveRelax(g, 'sor', sorOmegaOpt(n), 1e-13);
    const ex = S.grid(n, new Float64Array(m * m));
    let e = 0;
    for (let j = 4; j <= n - 4; j++) for (let i = 4; i <= n - 4; i++) e = Math.max(e, Math.abs(g.u[j * m + i] - ex[j * m + i]));
    expect(e).toBeLessThan(2e-3);
    expect(ex[20 * m + 20]).toBeCloseTo(S.at(0.5, 0.5), 12);
    expect(circleAverage((x, y) => S.at(x, y), 0.45, 0.55, 0.3)).toBeCloseTo(S.at(0.45, 0.55), 10);
  });
  it("the square's Green's function is symmetric and matches a fine finite-difference point source", () => {
    expect(greenSquare(0.3, 0.7, 0.6, 0.2)).toBeCloseTo(greenSquare(0.6, 0.2, 0.3, 0.7), 12);
    const G = greenSquareGrid(20, 0.33, 0.61, 2, new Float64Array(21 * 21));
    expect(G[5 * 21 + 14]).toBeCloseTo(2 * greenSquare(0.7, 0.25, 0.33, 0.61), 12);
    const n = 64, m = n + 1;
    const g = grid(n, () => 0, () => 0);
    g.f![(n / 2) * m + n / 4] = -1 / (g.h * g.h);          // −∇²u = δ at (¼, ½)
    solveRelax(g, 'sor', sorOmegaOpt(n), 1e-12);
    expect(g.u[(n / 4) * m + (3 * n) / 4]).toBeCloseTo(greenSquare(0.75, 0.25, 0.25, 0.5), 3);
  });
});

describe('special functions', () => {
  it('Bessel J and its zeros', () => {
    expect(besselJ(0, 1)).toBeCloseTo(0.7651976865579666, 14);
    expect(besselJ(1, 2.5)).toBeCloseTo(0.4970941024642741, 14);
    expect(besselJ(3, 10)).toBeCloseTo(0.0583793793051868, 13);
    expect(besselJ(0, 0)).toBeCloseTo(1, 14);
    const z0 = besselJZeros(0, 3), z1 = besselJZeros(1, 2), z2 = besselJZeros(2, 1);
    expect(z0[0]).toBeCloseTo(2.404825557695773, 12); expect(z0[1]).toBeCloseTo(5.520078110286311, 12); expect(z0[2]).toBeCloseTo(8.653727912911013, 12);
    expect(z1[0]).toBeCloseTo(3.831705970207512, 12); expect(z1[1]).toBeCloseTo(7.015586669815619, 12);
    expect(z2[0]).toBeCloseTo(5.135622301840683, 12);
    expect(besselJZeros(5, 5)[4]).toBeCloseTo(22.2177998965613, 10);
  });
  it('erf and erfc', () => {
    expect(erf(0.5)).toBeCloseTo(0.5204998778130465, 15);
    expect(erf(2)).toBeCloseTo(0.9953222650189527, 15);
    expect(erf(-1)).toBeCloseTo(-0.8427007929497149, 15);
    expect(erfc(5) / 1.5374597944280349e-12).toBeCloseTo(1, 12);
    expect(erfc(3.5) / 7.430983723414128e-7).toBeCloseTo(1, 12);
  });
  it('heat kernels with images: mass, and survival at an absorbing wall', () => {
    const mass = (w: 'none' | 'absorbing' | 'reflecting') => { let s = 0; const h = 1e-3; for (let k = 0; k < 13000; k++) s += heatKernel(-12 + (k + 0.5) * h, 0.8, 0.5, 0, w, 1) * h; return s; };
    expect(mass('none')).toBeCloseTo(1 - erfc(1 / Math.sqrt(1.6)) / 2, 6);
    expect(mass('reflecting')).toBeCloseTo(1, 6);
    expect(mass('absorbing')).toBeCloseTo(survival(0.8, 0.5, 0, 1), 6);
  });
});

describe('Fourier series', () => {
  it('square-wave coefficients and the Gibbs overshoot', () => {
    const sq = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0);
    const { a, b, ok } = fourierCoeffs(sq, 'full', 9);
    expect(ok).toBe(true);
    for (let n = 1; n <= 9; n++) { expect(a[n]).toBeCloseTo(0, 9); expect(b[n]).toBeCloseTo(n % 2 ? 4 / (n * PI) : 0, 9); }
    // S_N with exact coefficients; the peak near the jump tends to 1 + 2·GIBBS (jump of height 2)
    const N = 401, B = new Float64Array(N + 1), A = new Float64Array(N + 1);
    for (let n = 1; n <= N; n += 2) B[n] = 4 / (n * PI);
    let peak = 0;
    for (let x = 0.0005; x < 0.05; x += 0.00005) peak = Math.max(peak, fourierSum(A, B, N, x));
    expect(peak).toBeCloseTo(1 + 2 * GIBBS, 3);
    let fej = 0;
    for (let x = 0.0005; x < 0.3; x += 0.0005) fej = Math.max(fej, fourierSum(A, B, N, x, true));
    expect(fej).toBeLessThanOrEqual(1);
  });
});

describe('stability and classification', () => {
  it('von Neumann factors', () => {
    expect(Math.abs(amplification('ftcs', 0.5, PI))).toBeCloseTo(1, 14);
    expect(Math.abs(amplification('ftcs', 0.51, PI))).toBeGreaterThan(1);
    for (const r of [0.1, 1, 10, 100]) for (const th of [0.3, 1.5, PI]) {
      expect(Math.abs(amplification('cn', r, th))).toBeLessThanOrEqual(1);
      expect(Math.abs(amplification('btcs', r, th))).toBeLessThanOrEqual(1);
    }
    expect(amplification('leapfrog', 1, PI)).toBeCloseTo(1, 14);
    expect(amplification('leapfrog', 1.05, PI)).toBeGreaterThan(1.3);
    // FTCS is consistent: G = exact + O(θ⁴) for small θ
    expect(Math.abs(amplification('ftcs', 0.2, 0.01) - amplification('exact', 0.2, 0.01))).toBeLessThan(1e-8);
  });
  it('classification by the discriminant', () => {
    expect(classify2(1, 0, 1).type).toBe('elliptic');           // Laplace
    expect(classify2(1, 0, 0).type).toBe('parabolic');          // heat (x, t)
    const w = classify2(1, 0, -4);                              // u_xx − u_tt/c², c = ½
    expect(w.type).toBe('hyperbolic');
    expect(w.slopes.map(Math.abs)).toEqual([2, 2]);
  });
});

describe('Sturm–Liouville by shooting', () => {
  it('finds (nπ/L)², ((n−½)π/L)², 0 for Neumann, and the Robin roots of tan √λ = −√λ/κ', () => {
    const one = () => 1;
    const dd = slEigenvalues(one, 1, { kind: 'dirichlet' }, { kind: 'dirichlet' }, -5, 100);
    expect(dd.length).toBe(3);
    dd.forEach((l, k) => expect(l).toBeCloseTo(((k + 1) * PI) ** 2, 6));
    const dn = slEigenvalues(one, 2, { kind: 'dirichlet' }, { kind: 'neumann' }, -5, 30);
    dn.forEach((l, k) => expect(l).toBeCloseTo(((k + 0.5) * PI / 2) ** 2, 6));
    const nn = slEigenvalues(one, 1, { kind: 'neumann' }, { kind: 'neumann' }, -3, 50);
    expect(nn[0]).toBeCloseTo(0, 8); expect(nn[1]).toBeCloseTo(PI * PI, 6);
    const kap = 2, rb = slEigenvalues(one, 1, { kind: 'dirichlet' }, { kind: 'robin', kappa: kap }, 0.01, 60);
    for (const l of rb) { const s = Math.sqrt(l); expect(Math.tan(s) + s / kap).toBeCloseTo(0, 5); }
    expect(Math.abs(shoot(PI * PI, one, 1, { kind: 'dirichlet' }, { kind: 'dirichlet' }))).toBeLessThan(1e-8);
  });
});

describe('Schrödinger by Crank–Nicolson', () => {
  it('conserves the norm and follows the exact free packet', () => {
    const s = new Schrodinger1D(-20, 20, 2000);
    s.set((x) => freePacket(x, 0, -3, 2, 1));
    expect(s.norm()).toBeCloseTo(1, 8);
    for (let k = 0; k < 200; k++) s.step(0.01);
    expect(s.norm()).toBeCloseTo(1, 8);
    let e = 0;
    for (let i = 0; i < s.n; i += 7) { const [a, b] = freePacket(s.x[i], 2, -3, 2, 1); e = Math.max(e, Math.hypot(s.re[i] - a, s.im[i] - b)); }
    expect(e).toBeLessThan(5e-3);
  });
});
