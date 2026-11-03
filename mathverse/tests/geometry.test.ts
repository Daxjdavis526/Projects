import { describe, it, expect } from 'vitest';
import { parse, Node } from '../src/core/expr';
import { integrate } from '../src/core/numeric/quad';
import {
  symbolicSurface, compileSurface, localGeometry, metricFromExprs, metricOfSurface, christoffel, curvatureTensors,
  traceGeodesic, directionAt, parallelTransport, signedAngle, metricAt, curvatureIntegral, frenetSerret, curveFrame,
  geodesicBetween, gaussLegendre, jacobiField, flammZ, properRadialDistance, surfaceFromFunction, geodesicRhs, quadForm, Chart, V3, dot3, cross3, norm3,
} from '../src/core/numeric/geometry';
import { solveAdaptive } from '../src/core/numeric/ode';

const surf = (src: string, params: Record<string, number>) => {
  const n = parse(src) as Extract<Node, { t: 'tuple' }>;
  return compileSurface(symbolicSurface(n.items), params);
};
const SPHERE = '(a sin(u) cos(v), a sin(u) sin(v), a cos(u))';
const TORUS = '((a + b cos(v)) cos(u), (a + b cos(v)) sin(u), b sin(v))';
const metric = (rows: string[][], coords: string[], params: Record<string, number> = {}) => metricFromExprs(rows.map((r) => r.map((e) => parse(e, { names: coords }))), coords, params);

describe('surfaces: fundamental forms and curvature against exact answers', () => {
  it('sphere of radius a: K = 1/a², H = −1/a (outward normal), umbilic', () => {
    const S = surf(SPHERE, { a: 2 });
    expect(S.exact && S.exact3).toBe(true);
    for (const [u, v] of [[0.4, 0.2], [1.2, 2.5], [2.6, -1]]) {
      const g = localGeometry(S, u, v);
      expect(g.K).toBeCloseTo(0.25, 12);
      expect(g.H).toBeCloseTo(-0.5, 12);
      expect(g.k1).toBeCloseTo(-0.5, 6);
      expect(g.k2).toBeCloseTo(-0.5, 6);
      expect(g.E).toBeCloseTo(4, 12);
      expect(g.G).toBeCloseTo(4 * Math.sin(u) ** 2, 12);
      // outward normal
      expect(dot3(g.n, g.r)).toBeGreaterThan(0);
    }
  });
  it('torus: K = cos v / (b(a + b cos v)), H = −(a + 2b cos v) / (2b(a + b cos v))', () => {
    const a = 2, b = 0.7, S = surf(TORUS, { a, b });
    for (const v of [0, 0.8, Math.PI / 2, 2.2, Math.PI, 4]) {
      const g = localGeometry(S, 0.3, v);
      expect(g.K).toBeCloseTo(Math.cos(v) / (b * (a + b * Math.cos(v))), 12);
      expect(g.H).toBeCloseTo(-(a + 2 * b * Math.cos(v)) / (2 * b * (a + b * Math.cos(v))), 12);
      expect(Math.max(g.k1, g.k2)).toBeCloseTo(Math.max(-1 / b, -Math.cos(v) / (a + b * Math.cos(v))), 10);
    }
  });
  it('hyperbolic paraboloid z = c(u² − v²): K = −4c² / (1 + 4c²(u² + v²))², saddle K < 0', () => {
    const c = 0.6, S = surf('(u, v, b (u^2 - v^2))', { b: c });
    for (const [u, v] of [[0, 0], [0.5, -0.3], [1.2, 0.9]]) {
      expect(localGeometry(S, u, v).K).toBeCloseTo(-4 * c * c / (1 + 4 * c * c * (u * u + v * v)) ** 2, 12);
    }
  });
  it('cylinder and cone are flat (K = 0); the catenoid and helicoid are minimal (H = 0)', () => {
    expect(localGeometry(surf('(a cos(u), a sin(u), v)', { a: 1.3 }), 0.4, 0.2).K).toBeCloseTo(0, 13);
    expect(localGeometry(surf('(a cos(u), a sin(u), v)', { a: 1.3 }), 0.4, 0.2).H).toBeCloseTo(-1 / 2.6, 12);
    expect(localGeometry(surf('(v cos(u), v sin(u), b v)', { b: 1.5 }), 0.4, 0.8).K).toBeCloseTo(0, 12);
    for (const th of [0, 0.4, 1, Math.PI / 2]) {
      const S = surf(`(a (cos(${th}) sinh(v) sin(u) + sin(${th}) cosh(v) cos(u)), a (-cos(${th}) sinh(v) cos(u) + sin(${th}) cosh(v) sin(u)), a (cos(${th}) u + sin(${th}) v))`, { a: 1.2 });
      const g = localGeometry(S, 0.7, 0.5);
      expect(g.H).toBeCloseTo(0, 12);
      // the family is isometric: same metric and the same K at corresponding points
      expect(g.E).toBeCloseTo(1.44 * Math.cosh(0.5) ** 2, 12);
      expect(g.F).toBeCloseTo(0, 12);
      expect(g.K).toBeCloseTo(-1 / (1.44 * Math.cosh(0.5) ** 4), 12);
    }
  });
  it('principal directions are metric-orthonormal eigenvectors of the shape operator', () => {
    const g = localGeometry(surf(TORUS, { a: 2, b: 0.7 }), 0.3, 1.1);
    expect(dot3(g.e1, g.e1)).toBeCloseTo(1, 12);
    expect(dot3(g.e1, g.e2)).toBeCloseTo(0, 12);
    // II(e, e) = k for a principal unit direction
    const II = (d: number[]) => g.L * d[0] ** 2 + 2 * g.M * d[0] * d[1] + g.N * d[1] ** 2;
    expect(II(g.dir1)).toBeCloseTo(g.k1, 10);
    expect(II(g.dir2)).toBeCloseTo(g.k2, 10);
  });
  it('numerical derivatives agree with symbolic ones (and are labelled not exact)', () => {
    const S = surfaceFromFunction((u, v) => [2 * Math.sin(u) * Math.cos(v), 2 * Math.sin(u) * Math.sin(v), 2 * Math.cos(u)]);
    expect(S.exact).toBe(false);
    expect(localGeometry(S, 1, 0.5).K).toBeCloseTo(0.25, 4);
  });
});

describe('Christoffel symbols and curvature tensors from a metric', () => {
  it('polar coordinates on the flat plane: Γ^r_θθ = −r, Γ^θ_rθ = 1/r, and R = 0', () => {
    const M = metric([['1', '0'], ['0', 'r^2']], ['r', 'theta']);
    const G = christoffel(M, [2, 0.3]);
    expect(G[0][1][1]).toBeCloseTo(-2, 14);
    expect(G[1][0][1]).toBeCloseTo(0.5, 14);
    expect(G[1][1][0]).toBeCloseTo(0.5, 14);
    expect(G[0][0][0]).toBe(0);
    const T = curvatureTensors(M, [2, 0.3]);
    expect(T.exact).toBe(true);
    for (const a of T.Rdown.flat(3)) expect(Math.abs(a)).toBeLessThan(1e-13);
  });
  it('sphere metric: Γ^θ_φφ = −sin θ cos θ, Γ^φ_θφ = cot θ, R_θφθφ = a² sin²θ = K det g, Ricci = K g, R = 2K', () => {
    const a = 1.7, th = 0.9, M = metric([['a^2', '0'], ['0', 'a^2 sin(theta)^2']], ['theta', 'phi'], { a });
    const G = christoffel(M, [th, 0.2]);
    expect(G[0][1][1]).toBeCloseTo(-Math.sin(th) * Math.cos(th), 14);
    expect(G[1][0][1]).toBeCloseTo(1 / Math.tan(th), 14);
    const T = curvatureTensors(M, [th, 0.2]);
    const K = 1 / a ** 2, detg = a ** 4 * Math.sin(th) ** 2;
    expect(T.Rdown[0][1][0][1]).toBeCloseTo(K * detg, 12);
    expect(T.Rdown[0][1][1][0]).toBeCloseTo(-K * detg, 12);
    expect(T.ricci[0][0]).toBeCloseTo(K * T.g[0][0], 12);
    expect(T.ricci[1][1]).toBeCloseTo(K * T.g[1][1], 12);
    expect(T.scalar).toBeCloseTo(2 * K, 12);
  });
  it('the induced metric of an embedded torus gives R₁₂₁₂ = K det g (Theorema Egregium), exactly from third derivatives', () => {
    const S = surf(TORUS, { a: 2, b: 0.7 });
    const M = metricOfSurface(S);
    expect(M.d2g).not.toBeNull();
    for (const [u, v] of [[0.2, 0.4], [1, 2.5]]) {
      const lg = localGeometry(S, u, v), T = curvatureTensors(M, [u, v]);
      expect(T.Rdown[0][1][0][1]).toBeCloseTo(lg.K * lg.detg, 11);
      expect(T.scalar).toBeCloseTo(2 * lg.K, 11);
      // Γ from the metric equals Γ from the embedding (Gauss formula)
      const G = christoffel(M, [u, v]);
      expect(G[0][0][0]).toBeCloseTo(lg.gamma[0], 12);
      expect(G[1][0][1]).toBeCloseTo(lg.gamma[4], 12);
    }
  });
  it('the 3-sphere of radius a: Ricci = (2/a²) g, R = 6/a²', () => {
    const a = 1.3, M = metric([['a^2', '0', '0'], ['0', 'a^2 sin(chi)^2', '0'], ['0', '0', 'a^2 sin(chi)^2 sin(theta)^2']], ['chi', 'theta', 'phi'], { a });
    const T = curvatureTensors(M, [0.8, 1.1, 0.4]);
    for (let i = 0; i < 3; i++) expect(T.ricci[i][i]).toBeCloseTo((2 / a ** 2) * T.g[i][i], 11);
    expect(T.scalar).toBeCloseTo(6 / a ** 2, 11);
    // constant curvature: R_abcd = (1/a²)(g_ac g_bd − g_ad g_bc)
    expect(T.Rdown[1][2][1][2]).toBeCloseTo((T.g[1][1] * T.g[2][2]) / a ** 2, 11);
  });
  it('Schwarzschild spacetime is Ricci-flat but curved: Kretschmann = 48 M² / r⁶', () => {
    const M = 1, r = 5.5;
    const S = metric([['-(1 - 2 m/r)', '0', '0', '0'], ['0', '1/(1 - 2 m/r)', '0', '0'], ['0', '0', 'r^2', '0'], ['0', '0', '0', 'r^2 sin(theta)^2']], ['t', 'r', 'theta', 'phi'], { m: M });
    const T = curvatureTensors(S, [0, r, 1.2, 0.3]);
    for (const x of T.ricci.flat()) expect(Math.abs(x)).toBeLessThan(1e-13);
    expect(Math.abs(T.scalar)).toBeLessThan(1e-13);
    expect(T.kretschmann).toBeCloseTo(48 * M * M / r ** 6, 12);
    // tidal components: R^r_trt = −2M/r³ · (1 − 2M/r)… check R^t_rtr = 2M / (r³(1 − 2M/r)) in these coordinates
    expect(T.Rup[0][1][0][1]).toBeCloseTo(2 * M / (r ** 3 * (1 - 2 * M / r)), 12);
  });
  it('a circular orbit at r = 6M stays circular (geodesic equation from the metric)', () => {
    const m = 1, r0 = 6;
    const S = metric([['-(1 - 2 m/r)', '0', '0', '0'], ['0', '1/(1 - 2 m/r)', '0', '0'], ['0', '0', 'r^2', '0'], ['0', '0', '0', 'r^2 sin(theta)^2']], ['t', 'r', 'theta', 'phi'], { m });
    const Om = Math.sqrt(m / r0 ** 3), ut = 1 / Math.sqrt(1 - 3 * m / r0);
    const tr = solveAdaptive(geodesicRhs(S), [0, r0, Math.PI / 2, 0, ut, 0, 0, Om * ut], 0, 200, { rtol: 1e-11, atol: 1e-12 });
    const last = tr.y[tr.y.length - 1];
    expect(last[1]).toBeCloseTo(r0, 6);
    expect(quadForm(S.g(last), last.slice(4))).toBeCloseTo(-1, 8);
  });
});

describe('geodesics', () => {
  const a = 1.5;
  const S1 = surf(SPHERE, { a });
  // a second chart with its pole on the x-axis: (a cos u, a sin u cos v, a sin u sin v)
  const S2 = surf('(a cos(u), a sin(u) cos(v), a sin(u) sin(v))', { a });
  const atlas: Chart[] = [
    { surface: S1, u: [0, Math.PI], v: [0, 2 * Math.PI], periodicV: true, quality: (u) => Math.sin(u), inverse: (p) => [Math.acos(Math.max(-1, Math.min(1, p[2] / a))), Math.atan2(p[1], p[0])] },
    { surface: S2, u: [0, Math.PI], v: [0, 2 * Math.PI], periodicV: true, quality: (u) => Math.sin(u), inverse: (p) => [Math.acos(Math.max(-1, Math.min(1, p[0] / a))), Math.atan2(p[2], p[1])] },
  ];
  it('geodesics on a sphere are great circles, and close after 2πa', () => {
    const d = directionAt(S1, 1.1, 0.3, 0.7);
    const g = traceGeodesic(atlas, { chart: 0, u: 1.1, v: 0.3, ...{ du: d[0], dv: d[1] } }, 2 * Math.PI * a, { h: 0.005 });
    expect(g.stop).toBe('done');
    const p0 = g.points[0].p, p1 = g.points[1].p, nrm = cross3(p0, p1);
    for (const q of g.points) expect(Math.abs(dot3(q.p, nrm)) / (norm3(nrm) * a)).toBeLessThan(1e-8);
    const end = g.points[g.points.length - 1].p;
    expect(norm3([end[0] - p0[0], end[1] - p0[1], end[2] - p0[2]])).toBeLessThan(1e-8);
    expect(g.speedDrift).toBeLessThan(1e-9);
  });
  it('a meridian through the poles is continued across a second chart (an atlas)', () => {
    const g = traceGeodesic(atlas, { chart: 0, u: Math.PI / 2, v: 0.4, du: -1, dv: 0 }, 2 * Math.PI * a, { h: 0.005 });
    expect(g.stop).toBe('done');
    expect(g.switches).toBeGreaterThanOrEqual(1);
    const end = g.points[g.points.length - 1].p, p0 = g.points[0].p;
    expect(norm3([end[0] - p0[0], end[1] - p0[1], end[2] - p0[2]])).toBeLessThan(1e-7);
    // it passes through the north pole
    expect(Math.max(...g.points.map((q) => q.p[2]))).toBeCloseTo(a, 4);
  });
  it('Clairaut: on a torus (a surface of revolution) ρ² du/ds is conserved', () => {
    const A = 2, B = 0.7, T = surf(TORUS, { a: A, b: B });
    const g = traceGeodesic([{ surface: T, u: [0, 2 * Math.PI], v: [0, 2 * Math.PI], periodicU: true, periodicV: true }], { chart: 0, u: 0, v: 0.3, du: 0.2, dv: 1 }, 20, { h: 0.005, maxPoints: 4000 });
    const c = (u: number, v: number, du: number) => (A + B * Math.cos(v)) ** 2 * du;
    // finite-difference du/ds from the stored points
    const pts = g.points;
    const vals: number[] = [];
    for (let i = 1; i < pts.length - 1; i += 50) vals.push(c(pts[i].u, pts[i].v, (pts[i + 1].u - pts[i - 1].u) / (pts[i + 1].s - pts[i - 1].s)));
    for (const x of vals) expect(x).toBeCloseTo(vals[0], 4);
  });
  it('shooting finds the great-circle distance between two points', () => {
    const A: [number, number] = [1.0, 0.2], B: [number, number] = [1.6, 1.1];
    const r = geodesicBetween(atlas[0], A, B);
    expect(r).not.toBeNull();
    const P = S1.r(...A), Q = S1.r(...B);
    expect(r!.length).toBeCloseTo(a * Math.acos(dot3(P, Q) / (a * a)), 7);
  });
  it('Jacobi equation: neighbouring geodesics on a sphere separate as ξ₀ cos(s/a)', () => {
    const j = jacobiField(() => 1 / (a * a), 0.1, 0, 3);
    j.s.forEach((s, i) => expect(j.xi[i]).toBeCloseTo(0.1 * Math.cos(s / a), 9));
  });
});

describe('parallel transport and holonomy', () => {
  it('around the latitude θ₀ on the unit sphere the holonomy is 2π(1 − cos θ₀) = ∫∫ K dA of the cap', () => {
    const S = surf(SPHERE, { a: 1 });
    for (const th of [Math.PI / 4, 0.5, 1.0]) {
      const tr = parallelTransport(S, (t) => [th, t, 0, 1], [1, 0], 0, 2 * Math.PI);
      expect(tr.ok).toBe(true);
      const lg = metricAt(S, th, 0);
      const ang = signedAngle(lg, tr.V[0], tr.V[tr.V.length - 1]);
      const exact = 2 * Math.PI * (1 - Math.cos(th));
      const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
      expect(wrap(ang - exact)).toBeCloseTo(0, 8);
      expect(tr.normDrift).toBeLessThan(1e-8);
      // Gauss–Bonnet: the cap's total curvature equals the holonomy
      const cap = curvatureIntegral(S, { kind: 'rect', u0: 0, u1: th, v0: 0, v1: 2 * Math.PI }, 24);
      expect(cap.K).toBeCloseTo(exact, 10);
    }
  });
  it('total curvature: sphere 4π, torus 0 (Gauss–Bonnet, χ = 2 and 0)', () => {
    expect(curvatureIntegral(surf(SPHERE, { a: 1.3 }), { kind: 'rect', u0: 0, u1: Math.PI, v0: 0, v1: 2 * Math.PI }, 32).K).toBeCloseTo(4 * Math.PI, 10);
    expect(curvatureIntegral(surf(TORUS, { a: 2, b: 0.6 }), { kind: 'rect', u0: 0, u1: 2 * Math.PI, v0: 0, v1: 2 * Math.PI }, 32).K).toBeCloseTo(0, 10);
    expect(curvatureIntegral(surf(SPHERE, { a: 1.3 }), { kind: 'rect', u0: 0, u1: Math.PI, v0: 0, v1: 2 * Math.PI }, 32).area).toBeCloseTo(4 * Math.PI * 1.69, 10);
  });
  it('a small loop on the saddle: holonomy matches the enclosed ∫∫ K dA', () => {
    const S = surf('(u, v, b (u^2 - v^2))', { b: 0.8 });
    const cu = 0.2, cv = -0.1, rho = 0.5;
    const tr = parallelTransport(S, (t) => [cu + rho * Math.cos(t), cv + rho * Math.sin(t), -rho * Math.sin(t), rho * Math.cos(t)], [1, 0], 0, 2 * Math.PI);
    const ang = signedAngle(metricAt(S, cu + rho, cv), tr.V[0], tr.V[tr.V.length - 1]);
    const tot = curvatureIntegral(S, { kind: 'disc', cu, cv, rho }, 40);
    expect(tot.K).toBeLessThan(0);
    expect(ang).toBeCloseTo(tot.K, 8);
  });
});

describe('curves', () => {
  it('constant κ and τ rebuild a helix: radius κ/(κ²+τ²), rise 2πτ/(κ²+τ²) per turn', () => {
    const k = 0.8, t = 0.3, w = Math.hypot(k, t);
    const r = frenetSerret(() => k, () => t, (2 * Math.PI) / w);
    expect(r.ok).toBe(true);
    const end = r.r[r.r.length - 1];
    expect(norm3(end)).toBeCloseTo((2 * Math.PI * t) / (w * w), 8);
    expect(r.orthoDrift).toBeLessThan(1e-8);
    // every point is at distance κ/(κ²+τ²) from the axis (the axis is along the Darboux vector τT + κB)
    const axis: V3 = [t / w, 0, k / w], R = k / (w * w), centre: V3 = [0, R, 0];
    for (const p of r.r) { const d: V3 = [p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]]; const along = dot3(d, axis); expect(Math.sqrt(dot3(d, d) - along * along)).toBeCloseTo(R, 7); }
  });
  it('curvature and torsion of the helix (cos t, sin t, c t) from derivatives: κ = 1/(1+c²), τ = c/(1+c²)', () => {
    const c = 0.5, tt = 0.7;
    const f = curveFrame([-Math.sin(tt), Math.cos(tt), c], [-Math.cos(tt), -Math.sin(tt), 0], [Math.sin(tt), -Math.cos(tt), 0]);
    expect(f.kappa).toBeCloseTo(1 / (1 + c * c), 14);
    expect(f.tau).toBeCloseTo(c / (1 + c * c), 14);
  });
});

describe('quadrature and Schwarzschild helpers', () => {
  it('Gauss–Legendre is exact for polynomials of degree 2n − 1', () => {
    const { x, w } = gaussLegendre(6);
    expect(x.reduce((s, xi, i) => s + w[i] * xi ** 10, 0)).toBeCloseTo(2 / 11, 14);
    expect(w.reduce((s, v) => s + v, 0)).toBeCloseTo(2, 14);
  });
  it("Flamm's paraboloid: (dz/dr)² + 1 = 1/(1 − r_s/r), and the proper radial distance matches quadrature", () => {
    const rs = 2, r = 5, h = 1e-6;
    const dz = (flammZ(rs, r + h) - flammZ(rs, r - h)) / (2 * h);
    expect(dz * dz + 1).toBeCloseTo(1 / (1 - rs / r), 8);
    const q = integrate((x) => 1 / Math.sqrt(1 - rs / x), 3, 9, 1e-12);
    expect(properRadialDistance(rs, 3, 9)).toBeCloseTo(q.value, 10);
  });
});

describe('geodesic triangles and transport along geodesics', () => {
  it('Girard: a geodesic triangle on the unit sphere has angle excess = ∫∫ K dA = area', async () => {
    const { curvatureOverPolygon, geodesicTransport } = await import('../src/core/numeric/geometry');
    const S = surf(SPHERE, { a: 1 });
    // the octant triangle: vertices on the equator at v = 0, v = π/2 and near (not at) the pole — use a smaller one
    const A: [number, number] = [1.2, 0.1], B: [number, number] = [1.5, 0.9], C: [number, number] = [0.7, 0.6];
    const chart = { surface: S, u: [0, Math.PI] as [number, number], v: [-Math.PI, Math.PI] as [number, number], periodicV: true };
    const edges = [[A, B], [B, C], [C, A]].map(([p, q]) => geodesicBetween(chart, p, q)!);
    const poly: [number, number][] = edges.flatMap((e) => e.result.points.slice(0, -1).map((q) => [q.u, q.v] as [number, number]));
    const tot = curvatureOverPolygon(S, poly, 4);
    // exact: angles from 3D great-circle tangents
    const P = [A, B, C].map((x) => S.r(...x));
    const tang = (p: V3, q: V3) => { const d = dot3(p, q); const t: V3 = [q[0] - d * p[0], q[1] - d * p[1], q[2] - d * p[2]]; const l = norm3(t); return t.map((x) => x / l) as V3; };
    let sum = 0;
    for (let i = 0; i < 3; i++) { const p = P[i], q = P[(i + 1) % 3], r = P[(i + 2) % 3]; sum += Math.acos(dot3(tang(p, q), tang(p, r))); }
    expect(tot.K).toBeCloseTo(sum - Math.PI, 5);
    expect(tot.area).toBeCloseTo(sum - Math.PI, 5);
    // transporting the tangent along a great circle keeps it tangent (geodesic: ∇_T T = 0)
    const g = geodesicTransport(S, { u: 1.2, v: 0.1, du: 0.3, dv: 1 }, [0.3, 1], 2, 400);
    const lg = metricAt(S, g.u, g.v);
    expect(signedAngle(lg, [g.du, g.dv], g.V)).toBeCloseTo(0, 9);
  });
});
