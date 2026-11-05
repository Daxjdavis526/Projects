import { describe, it, expect } from 'vitest';
import {
  approach, snapTo, vecStats, eig2, taylorCoeffs, taylorEval, radiusEstimate, TaylorError,
  surfaceCurvature, normalCurvature, pointType, tangentToParams, roverStep, turn, Membrane, rk4Field,
  sculptZ, sculptGrad, sculptVolume, V3, RoverSurface, Sculpt,
} from '../src/core/numeric/fidget';
import { parse, nthDerivative, compile } from '../src/core/expr';

describe('smoothing and snapping', () => {
  it('exponential approach is frame-rate independent', () => {
    let a = 0; for (let i = 0; i < 60; i++) a = approach(a, 1, 5, 1 / 60);
    let b = 0; for (let i = 0; i < 30; i++) b = approach(b, 1, 5, 1 / 30);
    expect(a).toBeCloseTo(1 - Math.exp(-5), 12);
    expect(b).toBeCloseTo(a, 12);
  });
  it('snaps to a grid without float dust', () => {
    expect(snapTo(1.26, 0.5)).toBe(1.5);
    expect(snapTo(0.1 + 0.2, 0.1)).toBe(0.3);
    expect(Object.is(snapTo(-0.1, 0.5), -0)).toBe(false);
  });
});

describe('vector algebra', () => {
  it('dot, cross, angle, projection, area, triple product', () => {
    const s = vecStats([1, 0, 0], [1, 1, 0], [0, 0, 2]);
    expect(s.dot).toBe(1);
    expect(s.cross).toEqual([0, 0, 1]);
    expect(s.angle).toBeCloseTo(Math.PI / 4, 15);
    expect(s.proj[0]).toBeCloseTo(0.5, 15); expect(s.proj[1]).toBeCloseTo(0.5, 15);
    expect(s.rej[0]).toBeCloseTo(0.5, 15); expect(s.rej[1]).toBeCloseTo(-0.5, 15);
    expect(s.area).toBeCloseTo(1, 15);
    expect(s.triple).toBeCloseTo(2, 15);
    expect(s.comp).toBeCloseTo(1 / Math.SQRT2, 15);
  });
  it('the angle is accurate for nearly parallel vectors (where acos loses digits)', () => {
    const e = 1e-9;
    expect(vecStats([1, 0, 0], [1, e, 0]).angle).toBeCloseTo(e, 20);
    expect(vecStats([1, 0, 0], [-1, e, 0]).angle).toBeCloseTo(Math.PI - e, 15);
    expect(Number.isNaN(vecStats([0, 0, 0], [1, 0, 0]).angle)).toBe(true);
  });
});

describe('2×2 eigen-analysis', () => {
  it('distinct real eigenvalues with eigenvectors that satisfy Av = λv', () => {
    const [a, b, c, d] = [2, 1, 1, 3];
    const e = eig2(a, b, c, d);
    expect(e.kind).toBe('distinct');
    expect(e.values[0]).toBeCloseTo((5 + Math.sqrt(5)) / 2, 14);
    expect(e.values[1]).toBeCloseTo((5 - Math.sqrt(5)) / 2, 14);
    e.vectors.forEach((v, i) => {
      expect(a * v[0] + b * v[1]).toBeCloseTo(e.values[i] * v[0], 13);
      expect(c * v[0] + d * v[1]).toBeCloseTo(e.values[i] * v[1], 13);
    });
    expect(e.det).toBe(5); expect(e.trace).toBe(5);
  });
  it('rotation: complex pair; shear: defective; scalar: every direction', () => {
    const r = eig2(0, -1, 1, 0);
    expect(r.kind).toBe('complex'); expect(r.im).toBeCloseTo(1, 15); expect(r.values[0]).toBe(0);
    const s = eig2(1, 1, 0, 1);
    expect(s.kind).toBe('defective'); expect(s.vectors).toHaveLength(1);
    expect(Math.abs(s.vectors[0][1])).toBeLessThan(1e-15);
    expect(eig2(2, 0, 0, 2).kind).toBe('scalar');
  });
  it('a nearly singular matrix keeps its tiny eigenvalue accurate', () => {
    const e = eig2(1e8, 1, 1, 1e-8);
    // λ_small = det/λ_big, det = 1 − 1 = 0 → exactly 0 here; and a near case
    expect(Math.abs(e.values[1])).toBeLessThan(1e-12);
    const f = eig2(1, 0, 0, 1e-12);
    expect(f.values[1]).toBeCloseTo(1e-12, 25);
  });
});

describe('Taylor coefficients (Taylor-mode AD)', () => {
  const fact = (k: number) => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };
  it('sin, exp, ln(1+x), 1/(1−x), atan about 0 match the textbook series', () => {
    const N = 12;
    const sin = taylorCoeffs(parse('sin(x)'), 'x', 0, N);
    sin.forEach((c, k) => expect(c).toBeCloseTo(k % 2 ? (((k - 1) / 2) % 2 ? -1 : 1) / fact(k) : 0, 15));
    const ex = taylorCoeffs(parse('exp(x)'), 'x', 0, N);
    ex.forEach((c, k) => expect(c).toBeCloseTo(1 / fact(k), 15));
    const ln = taylorCoeffs(parse('ln(1+x)'), 'x', 0, N);
    ln.forEach((c, k) => expect(c).toBeCloseTo(k === 0 ? 0 : (k % 2 ? 1 : -1) / k, 14));
    const g = taylorCoeffs(parse('1/(1-x)'), 'x', 0, N);
    g.forEach((c) => expect(c).toBeCloseTo(1, 14));
    const at = taylorCoeffs(parse('atan(x)'), 'x', 0, N);
    at.forEach((c, k) => expect(c).toBeCloseTo(k % 2 ? (((k - 1) / 2) % 2 ? -1 : 1) / k : 0, 14));
  });
  it('agrees with exact symbolic nth derivatives away from 0', () => {
    for (const src of ['tan(x)', 'sqrt(1+x^2)', 'exp(-x^2)*cos(3x)', 'x^x', 'asin(x/2)', 'cosh(x)/(2+sin(x))', 'erf(x)', 'cbrt(x)']) {
      const node = parse(src), a = -0.7 + (src.length % 3) * 0.6;
      const c = taylorCoeffs(node, 'x', a > 0 ? a : src === 'x^x' ? 0.8 : a, 5);
      const at = a > 0 ? a : src === 'x^x' ? 0.8 : a;
      for (let k = 0; k <= 5; k++) {
        const dk = compile(nthDerivative(node, 'x', k), ['x'])([at]);
        expect(c[k] * fact(k)).toBeCloseTo(dk, 7);
      }
    }
  });
  it('parameters and constants; refusals where f is not analytic', () => {
    const c = taylorCoeffs(parse('A*sin(k*x)'), 'x', 0, 3, { A: 2, k: 3 });
    expect(c[1]).toBeCloseTo(6, 14); expect(c[3]).toBeCloseTo(-2 * 27 / 6, 13);
    expect(() => taylorCoeffs(parse('abs(x)'), 'x', 0, 4)).toThrow(TaylorError);
    expect(() => taylorCoeffs(parse('ln(x)'), 'x', 0, 4)).toThrow(TaylorError);
    expect(() => taylorCoeffs(parse('1/x'), 'x', 0, 4)).toThrow(TaylorError);
    expect(() => taylorCoeffs(parse('floor(x)'), 'x', 0.5, 4)).toThrow(TaylorError);
    expect(taylorCoeffs(parse('x^3'), 'x', 0, 5)).toEqual([0, 0, 0, 1, 0, 0]);
  });
  it('Taylor polynomials converge to f inside the radius; the partial term blends in', () => {
    const c = taylorCoeffs(parse('exp(x)'), 'x', 0, 20);
    expect(taylorEval(c, 0, 1, 20)).toBeCloseTo(Math.E, 14);
    expect(taylorEval(c, 0, 1, 1, 0.5)).toBeCloseTo(1 + 1 + 0.25, 15);
    // the error of P_n(sin) at x = 1 is below the Lagrange bound 1/(n+1)!
    const s = taylorCoeffs(parse('sin(x)'), 'x', 0, 15);
    for (const n of [3, 5, 7, 9]) expect(Math.abs(taylorEval(s, 0, 1, n) - Math.sin(1))).toBeLessThan(1 / fact(n + 1));
  });
  it('estimates the radius of convergence: 1 for 1/(1+x²) at 0, √2 at x = 1', () => {
    expect(radiusEstimate(taylorCoeffs(parse('1/(1+x^2)'), 'x', 0, 40))).toBeCloseTo(1, 1);
    expect(radiusEstimate(taylorCoeffs(parse('1/(1+x^2)'), 'x', 1, 60))).toBeCloseTo(Math.SQRT2, 1);
    expect(radiusEstimate(taylorCoeffs(parse('x^2+1'), 'x', 0, 10))).toBe(Infinity);
    expect(radiusEstimate(taylorCoeffs(parse('sin(x)'), 'x', 0, 24))).toBe(Infinity);
    expect(radiusEstimate(taylorCoeffs(parse('exp(x)'), 'x', 0.5, 24))).toBe(Infinity);
    const ln = radiusEstimate(taylorCoeffs(parse('ln(1+x)'), 'x', 0, 24));
    expect(ln).toBeGreaterThan(1); expect(ln).toBeLessThan(1.25);
  });
});

describe('surface curvature', () => {
  it('sphere of radius R: K = 1/R², every point umbilic', () => {
    const R = 2, u = 0.7, v = 1.1;
    const ru: V3 = [-R * Math.sin(v) * Math.sin(u), R * Math.sin(v) * Math.cos(u), 0];
    const rv: V3 = [R * Math.cos(v) * Math.cos(u), R * Math.cos(v) * Math.sin(u), -R * Math.sin(v)];
    const ruu: V3 = [-R * Math.sin(v) * Math.cos(u), -R * Math.sin(v) * Math.sin(u), 0];
    const ruv: V3 = [-R * Math.cos(v) * Math.sin(u), R * Math.cos(v) * Math.cos(u), 0];
    const rvv: V3 = [-R * Math.sin(v) * Math.cos(u), -R * Math.sin(v) * Math.sin(u), -R * Math.cos(v)];
    const c = surfaceCurvature(ru, rv, ruu, ruv, rvv);
    expect(c.K).toBeCloseTo(1 / (R * R), 14);
    expect(Math.abs(c.H)).toBeCloseTo(1 / R, 14);
    expect(pointType(c)).toBe('umbilic');
    expect(c.d1).toBeNull();
  });
  it('graph z = f(x, y): matches (f_xx f_yy − f_xy²)/(1 + |∇f|²)² and the mean-curvature formula', () => {
    // f = x² − 0.5 y² + 0.3 x y at (0.4, −0.2)
    const x = 0.4, y = -0.2;
    const fx = 2 * x + 0.3 * y, fy = -y + 0.3 * x, fxx = 2, fyy = -1, fxy = 0.3;
    const c = surfaceCurvature([1, 0, fx], [0, 1, fy], [0, 0, fxx], [0, 0, fxy], [0, 0, fyy]);
    const w = 1 + fx * fx + fy * fy;
    expect(c.K).toBeCloseTo((fxx * fyy - fxy * fxy) / (w * w), 14);
    expect(c.H).toBeCloseTo(((1 + fy * fy) * fxx - 2 * fx * fy * fxy + (1 + fx * fx) * fyy) / (2 * Math.pow(w, 1.5)), 14);
    expect(c.k1 * c.k2).toBeCloseTo(c.K, 14);
    expect(pointType(c)).toBe('hyperbolic');
    // Euler: normal curvature along the principal directions equals k1, k2
    const [a1, b1] = tangentToParams([1, 0, fx], [0, 1, fy], c.d1!);
    const [a2, b2] = tangentToParams([1, 0, fx], [0, 1, fy], c.d2!);
    expect(normalCurvature(c, a1, b1)).toBeCloseTo(c.k1, 12);
    expect(normalCurvature(c, a2, b2)).toBeCloseTo(c.k2, 12);
  });
  it('cylinder: K = 0 (parabolic), H = ±1/(2R)', () => {
    const R = 1.5, u = 0.3;
    const c = surfaceCurvature([-R * Math.sin(u), R * Math.cos(u), 0], [0, 0, 1], [-R * Math.cos(u), -R * Math.sin(u), 0], [0, 0, 0], [0, 0, 0]);
    expect(c.K).toBeCloseTo(0, 15);
    expect(Math.abs(c.H)).toBeCloseTo(1 / (2 * R), 14);
    expect(pointType(c)).toBe('parabolic');
  });
});

describe('the rover drives along geodesics', () => {
  const R = 2;
  const sphere: RoverSurface = {
    r: (u, v) => [R * Math.sin(v) * Math.cos(u), R * Math.sin(v) * Math.sin(u), R * Math.cos(v)],
    normal: (u, v) => [Math.sin(v) * Math.cos(u), Math.sin(v) * Math.sin(u), Math.cos(v)],
    project: (p) => [Math.atan2(p[1], p[0]), Math.acos(Math.max(-1, Math.min(1, p[2] / Math.hypot(...p))))],
  };
  it('driving straight on a sphere traces a great circle and returns after 2πR', () => {
    const v0 = 1.2, u0 = 0.3;
    // a tilted heading: not along a parallel (parallels are not geodesics)
    const st0 = { u: u0, v: v0, p: sphere.r(u0, v0), heading: turn([-Math.sin(u0), Math.cos(u0), 0], sphere.normal(u0, v0), 0.6) };
    const plane = (() => { const n = st0.p, h = st0.heading; return [n[1] * h[2] - n[2] * h[1], n[2] * h[0] - n[0] * h[2], n[0] * h[1] - n[1] * h[0]]; })();
    let st = st0, maxOff = 0;
    const steps = 2000, ds = (2 * Math.PI * R) / steps;
    for (let i = 0; i < steps; i++) {
      st = roverStep(sphere, st, ds, 2);
      maxOff = Math.max(maxOff, Math.abs(plane[0] * st.p[0] + plane[1] * st.p[1] + plane[2] * st.p[2]) / R);
    }
    expect(maxOff).toBeLessThan(2e-3);            // stays in the great circle's plane
    expect(Math.hypot(st.p[0] - st0.p[0], st.p[1] - st0.p[1], st.p[2] - st0.p[2])).toBeLessThan(5e-3);
  });
  it('error falls as the step shrinks (consistent integrator)', () => {
    const run = (steps: number) => {
      const st0 = { u: 0, v: 1.0, p: sphere.r(0, 1.0), heading: turn([0, 1, 0], sphere.normal(0, 1.0), 0.5) };
      let st = st0;
      for (let i = 0; i < steps; i++) st = roverStep(sphere, st, (2 * Math.PI * R) / steps, 1);
      return Math.hypot(st.p[0] - st0.p[0], st.p[1] - st0.p[1], st.p[2] - st0.p[2]);
    };
    expect(run(800)).toBeLessThan(run(200));
  });
  it('on a plane the rover drives in a straight line', () => {
    const flat: RoverSurface = { r: (u, v) => [u, v, 0], normal: () => [0, 0, 1], project: (p) => [p[0], p[1]] };
    let st = { u: 0, v: 0, p: [0, 0, 0] as V3, heading: [0.6, 0.8, 0] as V3 };
    for (let i = 0; i < 100; i++) st = roverStep(flat, st, 0.05);
    expect(st.p[0]).toBeCloseTo(3, 12); expect(st.p[1]).toBeCloseTo(4, 12);
  });
});

describe('the membrane (2D wave equation)', () => {
  it('runs at a stable Courant number and conserves the discrete energy without damping', () => {
    const m = new Membrane(61, 4);
    expect(m.c * m.dt() / m.h).toBeLessThanOrEqual(1 / Math.SQRT2);
    expect(m.dt()).toBeLessThan(Membrane.maxStableDt(1, m.h));
    m.poke(0.3, -0.2, 0.5, 0.25);
    m.step();
    const E0 = m.energy();
    for (let i = 0; i < 3000; i++) m.step();
    expect(Math.abs(m.energy() - E0) / E0).toBeLessThan(1e-9);
    expect(m.maxAbs()).toBeLessThan(1);
  });
  it('a normal mode oscillates at the discrete frequency, which converges to cπ√(m²+k²)/L at second order', () => {
    const errs: number[] = [];
    for (const n of [21, 41, 81]) {
      const m = new Membrane(n, 2);
      m.setMode(1, 2, 1);
      const w = m.discreteOmega(1, 2), T = (2 * Math.PI) / w;
      // after one discrete period the mode is back where it started
      const i = Math.round((n - 1) / 2), j = Math.round((n - 1) / 4), k = j * n + i;
      const start = m.u[k];
      const steps = Math.round(T / m.dt());
      for (let s = 0; s < steps; s++) m.step();
      expect(Math.abs(m.u[k] - start)).toBeLessThan(0.05);
      errs.push(Math.abs(w - m.exactOmega(1, 2)));
    }
    expect(errs[0] / errs[1]).toBeCloseTo(4, 0);
    expect(errs[1] / errs[2]).toBeCloseTo(4, 0);
  });
  it('damping γ removes energy at rate ≈ e^{−γt}', () => {
    const m = new Membrane(41, 2);
    m.gamma = 0.4;
    m.setMode(1, 1, 1);
    m.step();
    const E0 = m.energy(), t0 = m.t;
    while (m.t - t0 < 3) m.step();
    // energy oscillates between kinetic and potential, so compare the period-average loosely
    const ratio = m.energy() / E0;
    expect(ratio).toBeGreaterThan(Math.exp(-0.4 * (m.t - t0)) * 0.8);
    expect(ratio).toBeLessThan(Math.exp(-0.4 * (m.t - t0)) * 1.25);
  });
  it('free and absorbing edges stay bounded; absorbing edges soak up the wave', () => {
    const free = new Membrane(61, 4), sponge = new Membrane(61, 4);
    free.setBoundary('free'); sponge.setBoundary('absorbing');
    for (const m of [free, sponge]) { m.poke(0, 0, 0.5, 0.2); m.step(); }
    const Ef = free.energy(), Es = sponge.energy();
    for (let i = 0; i < 1500; i++) { free.step(); sponge.step(); }
    expect(free.maxAbs()).toBeLessThan(1);
    expect(free.energy() / Ef).toBeGreaterThan(0.9);
    expect(sponge.energy() / Es).toBeLessThan(0.05);
  });
});

describe('planar flow integration', () => {
  it('RK4 carries a point once round the rotation field (−y, x) with fourth-order accuracy', () => {
    const F = (x: number, y: number, out: Float64Array) => { out[0] = -y; out[1] = x; };
    const out = new Float64Array(2), k = new Float64Array(8);
    const err = (n: number) => {
      let x = 1, y = 0;
      const h = (2 * Math.PI) / n;
      for (let i = 0; i < n; i++) { rk4Field(F, x, y, h, out, k); x = out[0]; y = out[1]; }
      return Math.hypot(x - 1, y);
    };
    expect(err(200)).toBeLessThan(1e-6);
    expect(err(100) / err(200)).toBeCloseTo(16, 0);
  });
});

describe('the sculptor family', () => {
  it('its gradient is exact (agrees with central differences)', () => {
    const S: Sculpt = { a: 0.8, b: 1.3, c: 0.7, d: 0.1, e: 0.05, bumps: [{ x: 1, y: -0.5, h: 1.2, s: 0.6 }, { x: -1, y: 1, h: -0.7, s: 0.4 }] };
    for (const [x, y] of [[0.3, 0.2], [-1.1, 0.9], [1.4, -0.6]]) {
      const [gx, gy] = sculptGrad(S, x, y), e = 1e-6;
      expect(gx).toBeCloseTo((sculptZ(S, x + e, y) - sculptZ(S, x - e, y)) / (2 * e), 7);
      expect(gy).toBeCloseTo((sculptZ(S, x, y + e) - sculptZ(S, x, y - e)) / (2 * e), 7);
    }
  });
  it('its exact volume agrees with a fine midpoint sum', () => {
    const S: Sculpt = { a: 0.8, b: 1.3, c: 0.7, d: 0.1, e: 0.05, bumps: [{ x: 1, y: -0.5, h: 1.2, s: 0.6 }, { x: -2.7, y: 1, h: -0.7, s: 0.4 }] };
    const R = 3, n = 600, h = (2 * R) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) sum += sculptZ(S, -R + (i + 0.5) * h, -R + (j + 0.5) * h);
    expect(sculptVolume(S, R)).toBeCloseTo(sum * h * h, 3);
  });
});
