// Calculus II numerics: exact partial fractions, quadrature-rule orders,
// solids of revolution, Taylor coefficients, zeta and the pendulum period.
import { describe, it, expect } from 'vitest';
import { fr, fnum, polyFromInts, partialFractions, termValue, termAntiderivative, pdivmod, peval, solveExact, Factor, polyTeX, fracTeX } from '../src/core/numeric/fraction';
import { gaussLegendre, compositeRule, logLogSlope } from '../src/core/numeric/quadrules';
import { washerSlices, shellSlices, volume, centroid, polylineLength, frustaArea, intervalsAt, straddles, Region } from '../src/core/numeric/revolution';
import { taylorCoeffs, taylorRadius, evalTaylor, zeta, zetaTail, ellipticK, pendulumPeriod, pendulumPeriodSeries, TAYLOR_F, TaylorFn, eta, alternatingSum, logFactorial } from '../src/core/numeric/taylor';

describe('exact rational arithmetic and partial fractions', () => {
  it('reduces fractions and prints them', () => {
    expect(fr(6, -4)).toEqual({ n: -3, d: 2 });
    expect(fracTeX(fr(-3, 2))).toBe('-\\tfrac{3}{2}');
    expect(polyTeX(polyFromInts([1, 0, -2]))).toBe('-2x^{2} +1');
  });
  it('divides polynomials exactly', () => {
    // x³ + 2x + 5 = (x² + 1)(x) + (x + 5)
    const { q, r } = pdivmod(polyFromInts([5, 2, 0, 1]), polyFromInts([1, 0, 1]));
    expect(q.map(fnum)).toEqual([0, 1]);
    expect(r.map(fnum)).toEqual([5, 1]);
  });
  it('solves a rational system exactly', () => {
    const x = solveExact([[fr(1), fr(1)], [fr(1), fr(-1)]], [fr(1), fr(0)])!;
    expect(x).toEqual([fr(1, 2), fr(1, 2)]);
  });
  const check = (N: number[], fs: Factor[]) => {
    const pf = partialFractions(polyFromInts(N), fs);
    for (const x of [-2.7, -0.31, 0.43, 1.9, 3.3]) {
      const lhs = peval(polyFromInts(N), x) / peval(pf.denominator, x);
      const rhs = peval(pf.quotient, x) + pf.terms.reduce((s, t) => s + termValue(t, fs[t.factor], x), 0);
      expect(rhs).toBeCloseTo(lhs, 11);
    }
    return pf;
  };
  it('distinct linear factors: (3x + 5)/((x − 1)(x + 2)) = (8/3)/(x − 1) + (1/3)/(x + 2)', () => {
    const pf = check([5, 3], [{ kind: 'linear', r: 1, k: 1 }, { kind: 'linear', r: -2, k: 1 }]);
    expect(pf.terms[0].A).toEqual(fr(8, 3));
    expect(pf.terms[1].A).toEqual(fr(1, 3));
  });
  it('repeated and quadratic factors, and an improper fraction', () => {
    check([1, 0, 1], [{ kind: 'linear', r: 0, k: 1 }, { kind: 'linear', r: 1, k: 2 }]);
    const pf = check([1, 1, 2], [{ kind: 'linear', r: -1, k: 1 }, { kind: 'quad', p: 0, q: 1, k: 1 }]);
    // (2x² + x + 1)/((x + 1)(x² + 1)) = 1/(x + 1) + x/(x² + 1)
    expect(pf.terms[0].A).toEqual(fr(1));
    expect(pf.terms[1].B).toEqual(fr(1));
    expect(pf.terms[1].C).toEqual(fr(0));
    const imp = check([0, 0, 0, 1], [{ kind: 'linear', r: 1, k: 1 }, { kind: 'linear', r: -1, k: 1 }]);
    expect(imp.quotient.map(fnum)).toEqual([0, 1]);
    check([3, -1, 2], [{ kind: 'linear', r: 0, k: 2 }, { kind: 'quad', p: 2, q: 5, k: 1 }]);
  });
  it('term antiderivatives differentiate back to the terms', () => {
    const fs: Factor[] = [{ kind: 'linear', r: 2, k: 2 }, { kind: 'quad', p: 2, q: 5, k: 1 }];
    const pf = partialFractions(polyFromInts([1, -3, 2]), fs);
    for (const t of pf.terms) for (const x of [-1.3, 0.2, 3.7]) {
      const h = 1e-5, f = fs[t.factor];
      const d = (termAntiderivative(t, f, x + h) - termAntiderivative(t, f, x - h)) / (2 * h);
      expect(d).toBeCloseTo(termValue(t, f, x), 7);
    }
  });
  it('rejects reducible quadratics', () => {
    expect(() => partialFractions(polyFromInts([1]), [{ kind: 'quad', p: 0, q: -1, k: 1 }])).toThrow();
  });
});

describe('quadrature rules', () => {
  it('Gauss–Legendre nodes and weights are exact to degree 2m − 1', () => {
    for (const m of [1, 2, 3, 5, 8]) {
      const g = gaussLegendre(m);
      expect(g.w.reduce((s, w) => s + w, 0)).toBeCloseTo(2, 13);
      for (let d = 0; d <= 2 * m - 1; d++) {
        const q = g.x.reduce((s, x, i) => s + g.w[i] * x ** d, 0);
        expect(q).toBeCloseTo(d % 2 ? 0 : 2 / (d + 1), 12);
      }
    }
    expect(gaussLegendre(2).x[1]).toBeCloseTo(1 / Math.sqrt(3), 15);
  });
  it('composite rules converge at their orders: trapezoid 2, Simpson 4, 3-point Gauss 6', () => {
    const exact = Math.E - 1;
    const ns = [4, 8, 16, 32];
    const err = (rule: 'trap' | 'simpson' | 'gauss3' | 'mid') => ns.map((n) => Math.abs(compositeRule(Math.exp, 0, 1, n, rule).value - exact));
    expect(-logLogSlope(ns, err('trap'))).toBeCloseTo(2, 1);
    expect(-logLogSlope(ns, err('mid'))).toBeCloseTo(2, 1);
    expect(-logLogSlope(ns, err('simpson'))).toBeCloseTo(4, 1);
    expect(-logLogSlope([2, 3, 4, 6], [2, 3, 4, 6].map((n) => Math.abs(compositeRule(Math.exp, 0, 1, n, 'gauss3').value - exact)))).toBeCloseTo(6, 0);
  });
  it('a singular derivative lowers the order: ∫√x has trapezoid order 1.5', () => {
    const ns = [16, 32, 64, 128, 256];
    const e = ns.map((n) => Math.abs(compositeRule(Math.sqrt, 0, 1, n, 'trap').value - 2 / 3));
    expect(-logLogSlope(ns, e)).toBeCloseTo(1.5, 1);
  });
  it('counts distinct evaluations', () => {
    expect(compositeRule(Math.exp, 0, 1, 10, 'trap').evals).toBe(11);
    expect(compositeRule(Math.exp, 0, 1, 10, 'simpson').evals).toBe(21);
    expect(compositeRule(Math.exp, 0, 1, 10, 'gauss3').evals).toBe(30);
  });
});

describe('solids of revolution', () => {
  const half = (r: number): Region => ({ f: (x) => Math.sqrt(Math.max(0, r * r - x * x)), g: () => 0, a: -r, b: r });
  it('a sphere by washers, shells and one integral', () => {
    const R = half(1.5), V = (4 / 3) * Math.PI * 1.5 ** 3;
    expect(volume(R, { kind: 'horizontal', k: 0 }).value).toBeCloseTo(V, 9);
    const w = washerSlices(R, { kind: 'horizontal', k: 0 }, 400).reduce((s, sl) => s + sl.dV, 0);
    expect(Math.abs(w - V) / V).toBeLessThan(1e-4);
    const sh = shellSlices(R, { kind: 'horizontal', k: 0 }, 400).reduce((s, sl) => s + sl.dV, 0);
    expect(Math.abs(sh - V) / V).toBeLessThan(1e-3);
  });
  it('washers converge at second order (midpoint rule)', () => {
    const R: Region = { f: Math.sqrt, g: () => 0, a: 0, b: 4 };     // V = 8π
    const e = [10, 20, 40].map((n) => Math.abs(washerSlices(R, { kind: 'horizontal', k: 0 }, n).reduce((s, sl) => s + sl.dV, 0) - 8 * Math.PI));
    // the integrand π x is linear: midpoint is exact
    e.forEach((v) => expect(v).toBeLessThan(1e-9));
    const R2: Region = { f: (x) => x * x, g: () => 0, a: 0, b: 1 };   // π/5
    const e2 = [10, 20, 40].map((n) => Math.abs(washerSlices(R2, { kind: 'horizontal', k: 0 }, n).reduce((s, sl) => s + sl.dV, 0) - Math.PI / 5));
    expect(e2[0] / e2[1]).toBeCloseTo(4, 1);
  });
  it('washers about the y-axis need x as a function of y: y = x, y = x² about x = 0 is π/6', () => {
    const R: Region = { f: (x) => x, g: (x) => x * x, a: 0, b: 1 };
    const ax = { kind: 'vertical' as const, h: 0 };
    expect(volume(R, ax).value).toBeCloseTo(Math.PI / 6, 10);
    const w = washerSlices(R, ax, 600).reduce((s, sl) => s + sl.dV, 0);
    expect(w).toBeCloseTo(Math.PI / 6, 4);
    // at height y the washer runs from x = y (inner) to x = √y (outer)
    const sl = washerSlices(R, ax, 4)[1];
    expect(sl.rings[0][0]).toBeCloseTo(sl.s, 8);
    expect(sl.rings[0][1]).toBeCloseTo(Math.sqrt(sl.s), 8);
  });
  it('a torus by shells about a vertical axis: 2π²Rr²', () => {
    const Rc = 3, r = 1;
    const reg: Region = { f: (x) => Math.sqrt(Math.max(0, r * r - (x - Rc) ** 2)), g: (x) => -Math.sqrt(Math.max(0, r * r - (x - Rc) ** 2)), a: Rc - r, b: Rc + r };
    const ax = { kind: 'vertical' as const, h: 0 };
    expect(volume(reg, ax).value).toBeCloseTo(2 * Math.PI ** 2 * Rc * r * r, 8);
    // the circle's vertical tangents (√ singularity) cut the midpoint rule to order 1.5
    const V = 2 * Math.PI ** 2 * Rc * r * r;
    expect(Math.abs(shellSlices(reg, ax, 800).reduce((s, sl) => s + sl.dV, 0) - V) / V).toBeLessThan(1e-4);
    expect(Math.abs(washerSlices(reg, ax, 800).reduce((s, sl) => s + sl.dV, 0) - V) / V).toBeLessThan(1e-4);
  });
  it('Pappus: V = 2π · (distance of centroid) · area', () => {
    const reg: Region = { f: (x) => 1 + x * x, g: () => 0, a: 0, b: 2 };
    const c = centroid(reg);
    expect(c.area).toBeCloseTo(2 + 8 / 3, 10);
    expect(volume(reg, { kind: 'vertical', h: -1 }).value).toBeCloseTo(2 * Math.PI * (c.cx + 1) * c.area, 8);
    expect(volume(reg, { kind: 'horizontal', k: 0 }).value).toBeCloseTo(2 * Math.PI * c.cy * c.area, 8);
  });
  it('finds the region’s cross-sections and notices a straddled axis', () => {
    const reg: Region = { f: (x) => Math.sin(x) + 1.2, g: () => 0, a: 0, b: 4 * Math.PI };
    expect(intervalsAt(reg, 2).length).toBe(2);
    expect(straddles(reg, { kind: 'vertical', h: 3 })).toBe(true);
    expect(straddles(reg, { kind: 'horizontal', k: -1 })).toBe(false);
  });
  it('arc length and surface area from polylines and frusta converge', () => {
    // quarter circle: length π/2; hemisphere of radius 1 has area 2π
    const f = (x: number) => Math.sqrt(Math.max(0, 1 - x * x));
    expect(polylineLength(f, 0, 1, 20000)).toBeCloseTo(Math.PI / 2, 5);
    expect(frustaArea(f, -1, 1, 20000)).toBeCloseTo(4 * Math.PI, 3);
    expect(polylineLength((x) => x, 0, 3, 1)).toBeCloseTo(3 * Math.SQRT2, 14);
  });
});

describe('Taylor series', () => {
  const fns: TaylorFn[] = ['exp', 'sin', 'cos', 'cosh', 'log1p', 'geom', 'atan', 'lorentz', 'sqrt1p', 'gauss'];
  it('partial sums converge to f inside the radius, at several centres', () => {
    for (const fn of fns) for (const a of [0, 0.3, -0.4]) {
      const R = taylorRadius(fn, a), c = taylorCoeffs(fn, a, 60);
      const x = a + Math.min(R * 0.4, 0.8);
      expect(evalTaylor(c, a, x)).toBeCloseTo(TAYLOR_F[fn](x), 9);
    }
  });
  it('known coefficients', () => {
    expect(taylorCoeffs('atan', 0, 5)).toEqual([0, 1, 0, -1 / 3, 0, 1 / 5].map((v, i) => expect.closeTo(v, 14) as unknown as number));
    const g = taylorCoeffs('gauss', 0, 6);
    expect(g[2]).toBeCloseTo(-1, 14); expect(g[4]).toBeCloseTo(0.5, 14); expect(g[6]).toBeCloseTo(-1 / 6, 14);
    const s = taylorCoeffs('sqrt1p', 0, 3);
    expect(s[2]).toBeCloseTo(-1 / 8, 14); expect(s[3]).toBeCloseTo(1 / 16, 14);
  });
  it('radius is the distance to the nearest complex singularity', () => {
    expect(taylorRadius('lorentz', 0)).toBe(1);
    expect(taylorRadius('atan', 1)).toBeCloseTo(Math.SQRT2, 14);
    expect(taylorRadius('log1p', 0.5)).toBe(1.5);
    expect(taylorRadius('sin', 3)).toBe(Infinity);
  });
  it('a series diverges outside its radius', () => {
    const c = taylorCoeffs('lorentz', 0, 80);
    expect(Math.abs(evalTaylor(c, 0, 1.2))).toBeGreaterThan(1e5);
  });
});

describe('zeta and the pendulum', () => {
  it('ζ(2) = π²/6, ζ(4) = π⁴/90, ζ(3) (Apéry)', () => {
    expect(zeta(2)).toBeCloseTo(Math.PI ** 2 / 6, 14);
    expect(zeta(4)).toBeCloseTo(Math.PI ** 4 / 90, 14);
    expect(zeta(3)).toBeCloseTo(1.2020569031595942, 14);
    expect(zeta(1)).toBe(Infinity);
  });
  it('eta and accelerated alternating sums', () => {
    expect(eta(1)).toBeCloseTo(Math.LN2, 14);
    expect(eta(2)).toBeCloseTo(Math.PI ** 2 / 12, 14);
    expect(eta(0.5)).toBeCloseTo(0.6048986434216303, 13);
    expect(eta(3)).toBeCloseTo(0.75 * zeta(3), 14);
    expect(alternatingSum((k) => 1 / (2 * k + 1))).toBeCloseTo(Math.PI / 4, 14);
    expect(logFactorial(10)).toBeCloseTo(Math.log(3628800), 12);
  });
  it('the tail equals ζ − S_N', () => {
    for (const p of [1.5, 2, 3.2]) for (const N of [5, 20, 300]) {
      let S = 0; for (let n = 1; n <= N; n++) S += n ** -p;
      expect(zetaTail(p, N)).toBeCloseTo(zeta(p) - S, 12);
    }
  });
  it('K(0) = π/2 and the period tends to 2π√(L/g) for small swings', () => {
    expect(ellipticK(0)).toBeCloseTo(Math.PI / 2, 15);
    expect(ellipticK(Math.SQRT1_2)).toBeCloseTo(1.8540746773013719, 14);
    expect(pendulumPeriod(1e-6, 1, 9.81)).toBeCloseTo(2 * Math.PI / Math.sqrt(9.81), 12);
    // 90° amplitude: 18% longer
    expect(pendulumPeriod(Math.PI / 2, 1, 1) / (2 * Math.PI)).toBeCloseTo(1.1803405990160962, 12);
    expect(pendulumPeriodSeries(Math.PI / 3, 40)).toBeCloseTo(pendulumPeriod(Math.PI / 3, 1, 1) / (2 * Math.PI), 12);
  });
});
