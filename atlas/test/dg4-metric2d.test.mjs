// The 2D metric model behind dg4-chart: Christoffel symbols against their
// closed forms and against finite differences, curvature, geodesics,
// parallel transport and the second variation of length and proper time.
//   node atlas/test/dg4-metric2d.test.mjs

import * as D from '../src/viz/model/dg4-metric2d.js';
import { validate } from '../src/viz/sims/dg4-chart.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (x, y, tol) => Math.abs(x - y) <= tol;
const { sin, cos, tan, sinh, cosh, exp, sqrt, PI } = Math;
const M = D.METRICS;

// ─── Christoffels: exact derivatives against finite differences of g ───────
const sample = {
  plane: [1, 0.3], polar: [1.7, 0.4], sphere: [0.8, 1.1], stereo: [0.4, -0.7], halfplane: [0.3, 0.9], cylinder: [1, 0.5],
  torus: [0.5, 0.9], arm: [0.3, 1.2], minkowski: [0.2, 0.5], ring: [1, 1], rindler: [1.4, 0.3], desitter: [0.4, 0.6],
  schwarzschild: [5, 1], ef: [3, 1],
};
for (const [key, [a, b]] of Object.entries(sample)) {
  const G = D.christoffel(M[key], a, b), H = D.christoffelFD(M[key], a, b);
  let err = 0;
  for (let l = 0; l < 2; l++) for (let m = 0; m < 2; m++) for (let n = 0; n < 2; n++) err = Math.max(err, Math.abs(G[l][m][n] - H[l][m][n]));
  check(`${key}: Γ from dg agrees with finite differences of g`, err < 1e-6, err.toExponential(2));
  check(`${key}: Γ symmetric in its lower indices`, [0, 1].every((l) => G[l][0][1] === G[l][1][0]));
}

// closed forms (index 0 = a, 1 = b)
{
  const r = 1.7, G = D.christoffel(M.polar, r, 0.4);
  check('polar Γ^r_θθ = −r', close(G[0][1][1], -r, 1e-12));
  check('polar Γ^θ_rθ = 1/r', close(G[1][0][1], 1 / r, 1e-12));
}
{
  const th = 1.1, G = D.christoffel(M.sphere, 0.8, th);
  check('sphere Γ^θ_φφ = −sin θ cos θ', close(G[1][0][0], -sin(th) * cos(th), 1e-12));
  check('sphere Γ^φ_φθ = cot θ', close(G[0][0][1], 1 / tan(th), 1e-12));
}
{
  const y = 0.9, G = D.christoffel(M.halfplane, 0.3, y);
  check('half-plane Γ^x_xy = −1/y, Γ^y_xx = 1/y, Γ^y_yy = −1/y', close(G[0][0][1], -1 / y, 1e-12) && close(G[1][0][0], 1 / y, 1e-12) && close(G[1][1][1], -1 / y, 1e-12));
}
{
  const rho = 1.4, G = D.christoffel(M.rindler, rho, 0.3);
  check('Rindler Γ^ρ_ηη = ρ, Γ^η_ηρ = 1/ρ', close(G[0][1][1], rho, 1e-12) && close(G[1][1][0], 1 / rho, 1e-12));
}
{
  const t = 0.6, G = D.christoffel(M.desitter, 0.4, t);
  check('de Sitter Γ^t_xx = H e^{2Ht}, Γ^x_xt = H', close(G[1][0][0], exp(2 * t), 1e-12) && close(G[0][0][1], 1, 1e-12));
}
{
  const r = 5, m = 1, G = D.christoffel(M.schwarzschild, r, 1);
  check('Schwarzschild Γ^t_tr = M/(r(r−2M))', close(G[1][1][0], m / (r * (r - 2 * m)), 1e-12));
  check('Schwarzschild Γ^r_tt = M(r−2M)/r³', close(G[0][1][1], (m * (r - 2 * m)) / r ** 3, 1e-12));
  check('Schwarzschild Γ^r_rr = −M/(r(r−2M))', close(G[0][0][0], -m / (r * (r - 2 * m)), 1e-12));
}
{
  const v = 0.9, G = D.christoffel(M.torus, 0.5, v);
  check('torus Γ^u_uv = −sin v/(2 + cos v)', close(G[0][0][1], -sin(v) / (2 + cos(v)), 1e-12));
  check('torus Γ^v_uu = (2 + cos v) sin v', close(G[1][0][0], (2 + cos(v)) * sin(v), 1e-12));
}

// ─── curvature ────────────────────────────────────────────────────────────
const K = (key, a, b, k) => D.curvature(M[key], a, b, k).K;
check('sphere of radius 2 has K = 1/4', close(K('sphere', 0.3, 1.0, 2), 0.25, 1e-6));
check('stereographic sphere has K = 1', close(K('stereo', 0.7, -0.4), 1, 1e-5));
check('half-plane has K = −1', close(K('halfplane', 0.2, 0.7), -1, 1e-5));
for (const key of ['plane', 'polar', 'cylinder', 'minkowski', 'ring', 'rindler']) check(`${key} is flat`, Math.abs(K(key, 1.2, 0.4)) < 1e-6);
check('torus K = cos v/(2 + cos v)', close(K('torus', 0, 0.9), cos(0.9) / (2 + cos(0.9)), 1e-6));
check('de Sitter K = H² (R = 2H²)', close(K('desitter', 0.1, 0.3, 1.5), 2.25, 1e-5));
check('Schwarzschild (r, t) plane: K = 2M/r³ (R = 4M/r³)', close(K('schwarzschild', 5, 0), 2 / 125, 1e-6));
check('Eddington–Finkelstein chart gives the same K, also inside 2M', close(K('ef', 5, 0), 2 / 125, 1e-6) && close(K('ef', 1.5, 0), 2 / 1.5 ** 3, 1e-5));

// ─── geodesics ────────────────────────────────────────────────────────────
{
  // a great circle stays in a plane through the centre
  const u = D.launch(M.sphere, 0.5, 1.0, 1, { heading: 0.7 });
  const g = D.geodesic(M.sphere, { a: 0.5, b: 1.0, u, length: 5, steps: 2000 });
  const X = ([ph, th]) => [sin(th) * cos(ph), sin(th) * sin(ph), cos(th)];
  const p0 = X(g.pts[0]), p1 = X(g.pts[50]);
  const n = [p0[1] * p1[2] - p0[2] * p1[1], p0[2] * p1[0] - p0[0] * p1[2], p0[0] * p1[1] - p0[1] * p1[0]];
  const dev = Math.max(...g.pts.map((p) => { const x = X(p); return Math.abs(x[0] * n[0] + x[1] * n[1] + x[2] * n[2]) / Math.hypot(...n); }));
  check('sphere geodesic is a great circle', dev < 1e-8, dev.toExponential(2));
  check('sphere geodesic keeps unit speed', Math.max(...g.norm.map((x) => Math.abs(x - 1))) < 1e-9);
  check('sphere: p_φ = sin²θ φ̇ conserved (Clairaut)', Math.max(...g.pa.map((x) => Math.abs(x - g.pa[0]))) < 1e-9);
}
{
  // half-plane: geodesic through (0, 1) at 30° is a semicircle centred on the x-axis
  const u = D.launch(M.halfplane, 0, 1, 1, { heading: PI / 6 });
  const g = D.geodesic(M.halfplane, { a: 0, b: 1, u, length: 3, steps: 2000 });
  // centre c on the axis with (0 − c)² + 1 = ρ² and tangent ⟂ radius: direction (cos 30°, sin 30°) ⟂ (0 − c, 1) → c = tan 30°
  const c = tan(PI / 6), R2 = c * c + 1;
  const dev = Math.max(...g.pts.map(([x, y]) => Math.abs((x - c) ** 2 + y * y - R2)));
  check('half-plane geodesic is a semicircle centred on the boundary', dev < 1e-8, dev.toExponential(2));
}
{
  // Rindler: a free particle is a straight line in the inertial coordinates T = ρ sinh η, X = ρ cosh η
  const u = D.launch(M.rindler, 1.5, 0.2, 1, { speed: 0.4 });
  const g = D.geodesic(M.rindler, { a: 1.5, b: 0.2, u, length: 1.5, steps: 1500 });
  const P = g.pts.map(([r, e]) => [r * cosh(e), r * sinh(e)]);
  const [A, B] = [P[0], P[P.length - 1]];
  const dev = Math.max(...P.map(([x, t]) => Math.abs((B[0] - A[0]) * (t - A[1]) - (B[1] - A[1]) * (x - A[0]))));
  check('Rindler geodesic is a straight line of Minkowski space', dev < 1e-8, dev.toExponential(2));
  check('Rindler geodesic keeps g(u, u) = −1', Math.max(...g.norm.map((x) => Math.abs(x + 1))) < 1e-9);
  // speed 0.4 relative to the static observer: X-velocity in the inertial frame at the start
  const ux = u[0] * cosh(0.2) + 1.5 * u[1] * sinh(0.2), ut = u[0] * sinh(0.2) + 1.5 * u[1] * cosh(0.2);
  check('launch speed is measured by the local static observer', close(ux / ut, (0.4 + Math.tanh(0.2)) / (1 + 0.4 * Math.tanh(0.2)), 1e-12));
}
{
  // Schwarzschild: E = f ṫ conserved; dropped from rest at r = 8M, reaches r = 4M at the closed-form proper time
  const r0 = 8, u = D.launch(M.schwarzschild, r0, 0, 1, { speed: 0 });
  const g = D.geodesic(M.schwarzschild, { a: r0, b: 0, u, length: 25, steps: 20000 });
  check('Schwarzschild: −p_t = (1 − 2M/r) ṫ conserved (outside r = 2.5M)', Math.max(...g.pb.filter((x, i) => g.pts[i][0] > 2.5).map((x) => Math.abs(x - g.pb[0]))) < 1e-9);
  // from rest at r0: τ(r) = sqrt(r0³/8M)[η + sin η], with r = (r0/2)(1 + cos η)
  const eta = Math.acos(2 * 4 / r0 - 1), tau = sqrt(r0 ** 3 / 8) * (eta + sin(eta));
  const i = g.pts.findIndex((p) => p[0] <= 4);
  const [p1, p0] = [g.pts[i], g.pts[i - 1]];
  const tauHit = p0[2] + ((p0[0] - 4) / (p0[0] - p1[0])) * (p1[2] - p0[2]);
  check('Schwarzschild infall from rest matches the cycloid', close(tauHit, tau, 1e-4), `${tauHit} vs ${tau}`);
}
{
  // torus: trapped below the critical heading, escaping above it (R = 2, r = 1: cos ψ = 1/3)
  const crit = Math.acos(1 / 3);
  const run = (psi) => D.geodesic(M.torus, { a: 0, b: 0, u: D.launch(M.torus, 0, 0, 1, { heading: psi }), length: 60, steps: 6000 });
  const lo = run(crit - 0.05), hi = run(crit + 0.05);
  const vmax = (g) => Math.max(...g.pts.map((p) => Math.abs(p[1])));
  check('torus: below the critical heading the geodesic is trapped on the outside', vmax(lo) < PI - 0.3, String(vmax(lo)));
  check('torus: above it the geodesic crosses the inner equator', vmax(hi) > PI, String(vmax(hi)));
  // ψ = 45°: turning latitude cos v = (3 cos 45° − 2)/1
  const g = run(PI / 4), vt = Math.acos(3 * cos(PI / 4) - 2);
  check('torus: Clairaut turning point', close(vmax(g), vt, 2e-3), `${vmax(g)} vs ${vt}`);
  check('torus: ρ² u̇ conserved', Math.max(...g.pa.map((x) => Math.abs(x - g.pa[0]))) < 1e-8);
}
{
  // de Sitter: p_x = e^{2Ht} ẋ conserved, so the peculiar speed falls as 1/a
  const u = D.launch(M.desitter, 0, 0, 1, { speed: 0.6 });
  const g = D.geodesic(M.desitter, { a: 0, b: 0, u, length: 1.5, steps: 1500 });
  const j = g.pts.length - 1, t = g.pts[j][1], [ux, ut] = g.vel[j];
  const pec = exp(t) * ux / ut;                      // a dx/dt
  const gp = (v) => v / sqrt(1 - v * v);             // γv falls as 1/a
  check('de Sitter: γv of a free particle falls as 1/a', close(gp(pec), gp(0.6) * exp(-t), 1e-8));
}

// ─── parallel transport ───────────────────────────────────────────────────
{
  const R = D.routes(1, 0.2, 2.2, 1.1);
  const V0 = [0.3, 0.4];
  const T1 = D.transport(M.polar, R.first, V0), T2 = D.transport(M.polar, R.second, V0);
  const [x, y] = [T1[T1.length - 1], T2[T2.length - 1]];
  check('flat polar plane: both routes give the same vector', Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) < 1e-9);
  // and it is the same arrow in Cartesian terms
  const cart = (r, th, V) => [V[0] * cos(th) - r * V[1] * sin(th), V[0] * sin(th) + r * V[1] * cos(th)];
  const c0 = cart(1, 0.2, V0), c1 = cart(2.2, 1.1, x);
  check('flat polar plane: transport keeps Cartesian components', Math.abs(c0[0] - c1[0]) + Math.abs(c0[1] - c1[1]) < 1e-8);
}
{
  // sphere: the two routes differ by the enclosed curvature, ∫∫ sin θ dθ dφ
  const [p0, t0, p1, t1] = [0.4, 0.7, 1.3, 1.5];
  const R = D.routes(p0, t0, p1, t1, 200), V0 = [0, 1];
  const T1 = D.transport(M.sphere, R.first, V0), T2 = D.transport(M.sphere, R.second, V0);
  const ang = D.turn(M.sphere, p1, t1, 1, T2[T2.length - 1], T1[T1.length - 1]);
  const area = (p1 - p0) * (cos(t0) - cos(t1));
  check('sphere: the routes disagree by the enclosed area (K = 1)', close(Math.abs(ang), area, 1e-6), `${ang} vs ${area}`);
  const n0 = D.dot(M.sphere, p0, t0, 1, V0, V0), n1 = D.dot(M.sphere, p1, t1, 1, T1[T1.length - 1], T1[T1.length - 1]);
  check('transport keeps the length', close(n0, n1, 1e-9));
}
{
  // half-plane: along the horocycle y = y0 the vector turns by −Δx/y0
  const y0 = 0.8, path = Array.from({ length: 401 }, (_, i) => [(1.2 * i) / 400, y0]);
  const T = D.transport(M.halfplane, path, [1, 0]);
  const ang = D.turn(M.halfplane, 1.2, y0, 1, [1, 0], T[T.length - 1]);
  check('half-plane: along y = const the arrow turns by −Δx/y', close(ang, -1.2 / y0, 1e-8), String(ang));
}
{
  // Rindler: along a static worldline a transported vector is boosted by rapidity −Δη relative to the static frame
  const path = Array.from({ length: 301 }, (_, i) => [1.3, (0.9 * i) / 300]);
  const V0 = D.launch(M.rindler, 1.3, 0, 1, { speed: 0 });
  const T = D.transport(M.rindler, path, V0);
  const rap = D.turn(M.rindler, 1.3, 0.9, 1, D.launch(M.rindler, 1.3, 0.9, 1, { speed: 0 }), T[T.length - 1]);
  check('Rindler: transport along a static worldline is a boost by −Δη', close(rap, -0.9, 1e-8), String(rap));
}

// ─── second variation ─────────────────────────────────────────────────────
{
  const run = (L) => {
    const u = D.launch(M.sphere, 0, PI / 2, 1, { heading: 0 });
    const g = D.geodesic(M.sphere, { a: 0, b: PI / 2, u, length: L, steps: 1200 });
    return [D.pathLength(M.sphere, g.pts, 1), D.pathLength(M.sphere, D.varied(M.sphere, g, 0.05, 1), 1)];
  };
  const [s0, s1] = run(2.5), [l0, l1] = run(4);
  check('sphere: an arc shorter than π is a minimum', s1 > s0);
  check('sphere: an arc longer than π is not', l1 < l0);
  // second-order formula: ΔL ≈ ½α² (L/2)((π/L)² − 1)
  check('sphere: second variation matches ½α²(L/2)((π/L)² − 1)', close(s1 - s0, 0.5 * 0.0025 * 1.25 * ((PI / 2.5) ** 2 - 1), 2e-5), `${s1 - s0}`);
}
{
  // Schwarzschild: a clock thrown up and caught ages most on the geodesic
  const u = D.launch(M.schwarzschild, 6, 0, 1, { speed: 0.3 });
  const g = D.geodesic(M.schwarzschild, { a: 6, b: 0, u, length: 6, steps: 1500 });
  const t0 = D.pathLength(M.schwarzschild, g.pts, 1);
  check('Schwarzschild: proper time of the geodesic equals its affine length', close(t0, 6, 1e-4), String(t0));
  for (const al of [-0.15, 0.15]) check(`Schwarzschild: varied path (α = ${al}) ages less`, D.pathLength(M.schwarzschild, D.varied(M.schwarzschild, g, al, 1), 1) < t0);
}

// ─── the sim's validate() ─────────────────────────────────────────────────
check('dg4-chart validates its defaults', validate({}).length === 0, validate({}).join('; '));
check('dg4-chart rejects an unknown metric', validate({ metric: 'klein' }).length > 0);
check('dg4-chart rejects a launch point outside the chart', validate({ metric: 'schwarzschild', P: [1, 0] }).length > 0);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
