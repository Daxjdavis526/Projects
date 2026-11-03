import { describe, it, expect } from 'vitest';
import {
  integrate2e, integrate3e, lineIntegral, scalarLineIntegral, fluxIntegral, surfaceArea, riemann2, riemann3,
  criticalPoints2, lagrange2, classifyHessian, contourSegments, chainSegments, polygonArea, streamline, findBlowup, solve3, Vec3,
} from '../src/core/numeric/vcalc';

const { PI, sin, cos, sqrt, exp, hypot } = Math;

describe('nested quadrature against exact double and triple integrals', () => {
  it('double integrals over rectangles and curved regions', () => {
    const r1 = integrate2e((x, y) => x * y, 0, 1, () => 0, () => 1);
    expect(r1.value).toBeCloseTo(0.25, 12);
    expect(r1.ok).toBe(true);
    // area of the unit disk
    const disk = integrate2e(() => 1, -1, 1, (x) => -sqrt(1 - x * x), (x) => sqrt(1 - x * x));
    expect(disk.value).toBeCloseTo(PI, 6);
    // ∫∫_{x²+y²≤1} e^{−(x²+y²)} dA = π(1 − 1/e), done in polar coordinates with |J| = r
    const g = integrate2e((r) => exp(-r * r) * r, 0, 1, () => 0, () => 2 * PI);
    expect(g.value).toBeCloseTo(PI * (1 - 1 / Math.E), 12);
    // type I region: ∫_0^1 ∫_{x²}^{x} xy dy dx = 1/24
    expect(integrate2e((x, y) => x * y, 0, 1, (x) => x * x, (x) => x).value).toBeCloseTo(1 / 24, 12);
  });
  it('the error estimate bounds the true error', () => {
    const r = integrate2e((x, y) => sin(x) * cos(y), 0, PI, () => 0, () => PI / 2, 1e-6);
    expect(Math.abs(r.value - 2)).toBeLessThanOrEqual(r.error + 1e-12);
  });
  it('triple integrals: volume and moments of a ball in three coordinate systems', () => {
    const R = 1.3, V = (4 / 3) * PI * R ** 3;
    const cart = integrate3e(() => 1, -R, R, (x) => -sqrt(R * R - x * x), (x) => sqrt(R * R - x * x), (x, y) => -sqrt(Math.max(0, R * R - x * x - y * y)), (x, y) => sqrt(Math.max(0, R * R - x * x - y * y)), 1e-7);
    expect(cart.value).toBeCloseTo(V, 4);
    const cyl = integrate3e((r) => r, 0, R, () => 0, () => 2 * PI, (r) => -sqrt(R * R - r * r), (r) => sqrt(R * R - r * r));
    expect(cyl.value).toBeCloseTo(V, 6);
    const sph = integrate3e((rho, _t, phi) => rho * rho * sin(phi), 0, R, () => 0, () => 2 * PI, () => 0, () => PI);
    expect(sph.value).toBeCloseTo(V, 10);
    // ∭_ball z² dV = 4πR⁵/15
    const mz = integrate3e((rho, _t, phi) => (rho * cos(phi)) ** 2 * rho * rho * sin(phi), 0, R, () => 0, () => 2 * PI, () => 0, () => PI);
    expect(mz.value).toBeCloseTo((4 * PI * R ** 5) / 15, 9);
  });
  it('a rough integrand hits the budget and says so instead of hanging', () => {
    const r = integrate2e((x, y) => (x * x + y * y < 1 ? 1 : 0), -1.2, 1.2, () => -1.2, () => 1.2, 1e-12, 2e5);
    expect(r.ok).toBe(false);
    expect(r.value).toBeCloseTo(PI, 1);
  });
});

describe('line and surface integrals', () => {
  it('circulation of (−y, x) around the unit circle is 2π; a gradient field gives 0 on a loop', () => {
    const r = (t: number) => [cos(t), sin(t)], rp = (t: number) => [-sin(t), cos(t)];
    expect(lineIntegral((p) => [-p[1], p[0]], r, rp, 0, 2 * PI).value).toBeCloseTo(2 * PI, 12);
    expect(lineIntegral((p) => [2 * p[0] * p[1], p[0] * p[0]], r, rp, 0, 2 * PI).value).toBeCloseTo(0, 12);
  });
  it('work of a gradient field equals the potential difference (path independence)', () => {
    // F = ∇(x² y) along a wiggly path from (0,0) to (1,2)
    const r = (t: number) => [t, 2 * t + sin(PI * t)], rp = (t: number) => [1, 2 + PI * cos(PI * t)];
    expect(lineIntegral((p) => [2 * p[0] * p[1], p[0] * p[0]], r, rp, 0, 1).value).toBeCloseTo(2, 11);
  });
  it('arc length of a helix', () => {
    const L = scalarLineIntegral(() => 1, (t) => [cos(t), sin(t), t], (t) => [-sin(t), cos(t), 1], 0, 2 * PI);
    expect(L.value).toBeCloseTo(2 * PI * sqrt(2), 12);
  });
  it("flux of r through a sphere is 4πR³; Gauss's law gives 4π for a point charge", () => {
    const R = 2;
    const S = (u: number, v: number): Vec3 => [R * sin(u) * cos(v), R * sin(u) * sin(v), R * cos(u)];
    const N = (u: number, v: number): Vec3 => [R * R * sin(u) * sin(u) * cos(v), R * R * sin(u) * sin(u) * sin(v), R * R * sin(u) * cos(u)];
    expect(fluxIntegral((p) => p, S, N, 0, PI, 0, 2 * PI).value).toBeCloseTo(4 * PI * R ** 3, 9);
    const E = (p: Vec3): Vec3 => { const r3 = hypot(...p) ** 3; return [p[0] / r3, p[1] / r3, p[2] / r3]; };
    expect(fluxIntegral(E, S, N, 0, PI, 0, 2 * PI).value).toBeCloseTo(4 * PI, 9);
    expect(surfaceArea(N, 0, PI, 0, 2 * PI).value).toBeCloseTo(4 * PI * R * R, 9);
  });
  it("Green's theorem holds numerically for a polynomial field on the unit disk", () => {
    // F = (x²y, x y² + x): curl = y² + 1 − x²; ∬ over the unit disk = π
    const lhs = lineIntegral((p) => [p[0] * p[0] * p[1], p[0] * p[1] * p[1] + p[0]], (t) => [cos(t), sin(t)], (t) => [-sin(t), cos(t)], 0, 2 * PI).value;
    const rhs = integrate2e((r, t) => (r * r * sin(t) ** 2 + 1 - r * r * cos(t) ** 2) * r, 0, 1, () => 0, () => 2 * PI).value;
    expect(lhs).toBeCloseTo(PI, 10);
    expect(rhs).toBeCloseTo(PI, 10);
  });
});

describe('Riemann sums converge at their orders', () => {
  it('midpoint rule in 2D is second order; corner rule first order', () => {
    const f = (x: number, y: number) => exp(x + y), exact = (Math.E - 1) ** 2;
    const m1 = Math.abs(riemann2(f, 0, 1, 0, 1, 20, 20, 'mid') - exact), m2 = Math.abs(riemann2(f, 0, 1, 0, 1, 40, 40, 'mid') - exact);
    expect(m1 / m2).toBeCloseTo(4, 1);
    const l1 = Math.abs(riemann2(f, 0, 1, 0, 1, 20, 20, 'll') - exact), l2 = Math.abs(riemann2(f, 0, 1, 0, 1, 40, 40, 'll') - exact);
    expect(l1 / l2).toBeCloseTo(2, 1);
    expect(riemann2(f, 0, 1, 0, 1, 20, 20, 'll')).toBeLessThan(exact);
    expect(riemann2(f, 0, 1, 0, 1, 20, 20, 'ur')).toBeGreaterThan(exact);
  });
  it('midpoint rule in 3D (spherical cells) converges to the ball volume', () => {
    const e = (n: number) => Math.abs(riemann3((r, _t, p) => r * r * sin(p), 0, 1, 0, 2 * PI, 0, PI, n) - (4 * PI) / 3);
    expect(e(8) / e(16)).toBeCloseTo(4, 0);
  });
});

describe('critical points and Lagrange multipliers', () => {
  it('finds and classifies the critical points of x³ − 3x + y³ − 3y', () => {
    const f = (x: number, y: number) => x ** 3 - 3 * x + y ** 3 - 3 * y;
    const cps = criticalPoints2(f, (x, y) => [3 * x * x - 3, 3 * y * y - 3], (x, y) => [6 * x, 0, 6 * y], -2, 2, -2, 2);
    expect(cps.length).toBe(4);
    const at = (x: number, y: number) => cps.find((c) => hypot(c.x - x, c.y - y) < 1e-8)!;
    expect(at(1, 1).kind).toBe('min');
    expect(at(-1, -1).kind).toBe('max');
    expect(at(1, -1).kind).toBe('saddle');
    expect(at(-1, 1).kind).toBe('saddle');
    expect(at(1, 1).D).toBeCloseTo(36, 10);
  });
  it('the second-derivative test is inconclusive for a monkey saddle', () => {
    expect(classifyHessian(0, 0, 0).kind).toBe('degenerate');
    expect(classifyHessian(2, 0, -2).kind).toBe('saddle');
  });
  it('maximizes xy on the circle x² + y² = 2: (±1, ±1), λ = ½, classified by the bordered Hessian', () => {
    const seeds: [number, number][] = [];
    for (let k = 0; k < 16; k++) seeds.push([sqrt(2) * cos((k * PI) / 8 + 0.1), sqrt(2) * sin((k * PI) / 8 + 0.1)]);
    const pts = lagrange2((x, y) => x * y, (x, y) => [y, x], () => [0, 1, 0], (x, y) => x * x + y * y - 2, (x, y) => [2 * x, 2 * y], () => [2, 0, 2], seeds);
    expect(pts.length).toBe(4);
    const max = pts.filter((p) => p.kind === 'max');
    expect(max.length).toBe(2);
    for (const p of max) { expect(p.f).toBeCloseTo(1, 12); expect(p.lambda).toBeCloseTo(0.5, 12); }
    expect(pts.filter((p) => p.kind === 'min').every((p) => Math.abs(p.f + 1) < 1e-12)).toBe(true);
  });
  it('solve3 solves a 3×3 system', () => {
    const x = solve3([[2, 1, 0], [1, 3, 1], [0, 1, 4]], [3, 5, 5])!;
    expect(x[0]).toBeCloseTo(1, 12); expect(x[1]).toBeCloseTo(1, 12); expect(x[2]).toBeCloseTo(1, 12);
    expect(solve3([[1, 2, 3], [2, 4, 6], [0, 0, 1]], [1, 2, 3])).toBeNull();
  });
});

describe('contours, areas, streamlines, singularities', () => {
  it('the unit circle contour has length ≈ 2π', () => {
    const s = contourSegments((x, y) => x * x + y * y - 1, -2, 2, -2, 2, 200, 200);
    let L = 0;
    for (let i = 0; i < s.length; i += 4) L += hypot(s[i + 2] - s[i], s[i + 3] - s[i + 1]);
    expect(L).toBeCloseTo(2 * PI, 2);
  });
  it('chains contour segments into one closed polyline per component', () => {
    const s = contourSegments((x, y) => (x * x + y * y - 1) * ((x - 3) ** 2 + y * y - 0.25), -2, 4, -2, 2, 150, 100);
    const lines = chainSegments(s);
    expect(lines.length).toBe(2);
    const areas = lines.map((l) => { const pts: number[][] = []; for (let i = 0; i < l.length; i += 2) pts.push([l[i], l[i + 1]]); return Math.abs(polygonArea(pts)); }).sort((a, b) => a - b);
    expect(areas[0]).toBeCloseTo(PI * 0.25, 2);
    expect(areas[1]).toBeCloseTo(PI, 2);
  });
  it('does not draw a level curve across a pole', () => {
    const s = contourSegments((x) => 1 / x, -1, 1.01, -1, 1, 50, 50);
    expect(s.length).toBe(0);
  });
  it('shoelace area of a polygon approximating a circle', () => {
    const pts = Array.from({ length: 2000 }, (_, k) => [cos((2 * PI * k) / 2000), sin((2 * PI * k) / 2000)]);
    expect(polygonArea(pts)).toBeCloseTo((2000 / 2) * sin((2 * PI) / 2000), 12);  // the inscribed polygon, exactly
    expect(polygonArea(pts)).toBeCloseTo(PI, 4);
    expect(polygonArea([[0, 0], [0, 1], [1, 0]])).toBeCloseTo(-0.5, 14);
  });
  it('a streamline of a rotation closes into a circle', () => {
    const pts = streamline((p) => [-p[1], p[0], 0], [1, 0, 0], 0.01, 2000, { lo: [-2, -2, -2], hi: [2, 2, 2] });
    for (const p of pts) expect(hypot(p[0], p[1])).toBeCloseTo(1, 8);
    expect(pts.length).toBeLessThan(700);
  });
  it('finds a 1/r singularity off the grid and ignores smooth peaks', () => {
    const at = findBlowup((p) => 1 / hypot(p[0] - 0.123, p[1] + 0.271), [-2, -2], [2, 2]);
    expect(at).not.toBeNull();
    expect(hypot(at![0] - 0.123, at![1] + 0.271)).toBeLessThan(1e-3);
    expect(findBlowup((p) => exp(-(p[0] ** 2) - p[1] ** 2) * 50 + p[0], [-2, -2], [2, 2])).toBeNull();
    expect(findBlowup((p) => exp(2 * p[0]), [-2, -2], [2, 2])).toBeNull();
    // 3D point charge, |E| = 1/r²
    const q = findBlowup((p) => 1 / (p[0] ** 2 + p[1] ** 2 + p[2] ** 2), [-1.1, -1.3, -0.9], [1.2, 1, 1.4]);
    expect(q && hypot(q[0], q[1], q[2])).toBeLessThan(1e-3);
    // the singularity outside the region is not reported
    expect(findBlowup((p) => 1 / hypot(p[0] - 3, p[1]), [-1, -1], [1, 1])).toBeNull();
  });
});
