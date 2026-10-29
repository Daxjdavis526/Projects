// The DOM-free model behind the gr-surface simulation: Christoffel symbols,
// curvature, geodesics and parallel transport on surfaces of revolution,
// computed from the metric alone and checked against SymPy-verified results.
//   node atlas/test/gr-surface.test.mjs

import * as M from '../src/viz/model/gr-surface.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const { sphere, torus, cylinder, cone, catenoid } = M.SURFACES;
const PI = Math.PI;

// Christoffel symbols against closed forms (verified with SymPy in Carroll's convention)
for (const th of [0.4, 1.0, 1.3, 2.2]) {
  const G = M.christoffel(sphere, th);
  check(`sphere θ = ${th}: Γ^θ_φφ = −sin θ cos θ`, near(G.vuu, -Math.sin(th) * Math.cos(th), 1e-14));
  check(`sphere θ = ${th}: Γ^φ_θφ = cot θ`, near(G.uuv, 1 / Math.tan(th), 1e-12));
  check(`sphere θ = ${th}: Γ^θ_θθ = 0`, near(G.vvv, 0, 1e-15));
  check(`sphere θ = ${th}: K = 1`, near(M.curvature(sphere, th), 1, 1e-12));
}
for (const v of [-2.5, -1, 0, 0.7, 3]) {
  const G = M.christoffel(torus, v), R = torus.R, r = torus.r;
  check(`torus v = ${v}: Γ^u_uv = −r sin v/(R + r cos v)`, near(G.uuv, (-r * Math.sin(v)) / (R + r * Math.cos(v)), 1e-14));
  check(`torus v = ${v}: Γ^v_uu = (R + r cos v) sin v / r`, near(G.vuu, ((R + r * Math.cos(v)) * Math.sin(v)) / r, 1e-13));
  check(`torus v = ${v}: K = cos v / (r(R + r cos v))`, near(M.curvature(torus, v), Math.cos(v) / (r * (R + r * Math.cos(v))), 1e-13));
}
check('torus: K = 1/3 on the outer equator and −1 on the inner one (R = 2, r = 1)', near(M.curvature(torus, 0), 1 / 3, 1e-14) && near(M.curvature(torus, PI), -1, 1e-12));
for (const z of [-1, 0, 0.8]) {
  check(`catenoid z = ${z}: K = −1/cosh⁴ z`, near(M.curvature(catenoid, z), -1 / Math.cosh(z) ** 4, 1e-13));
  check(`cylinder z = ${z}: every Γ = 0 and K = 0`, Object.values(M.christoffel(cylinder, z)).every((x) => x === 0) && M.curvature(cylinder, z) === 0);
}
for (const s of [0.5, 2]) {
  const G = M.christoffel(cone, s);
  check(`cone s = ${s}: Γ^s_φφ = −s sin²α, Γ^φ_sφ = 1/s, K = 0`, near(G.vuu, -s * Math.sin(cone.alpha) ** 2, 1e-14) && near(G.uuv, 1 / s, 1e-14) && near(M.curvature(cone, s), 0, 1e-15));
}

// the embedding agrees with the metric: |e_u|² = g_uu, |e_v|² = g_vv, e_u·e_v = 0, normals point outward
for (const [name, S, v] of [['sphere', sphere, 1.1], ['torus', torus, 2.5], ['cone', cone, 1.4], ['catenoid', catenoid, -0.6]]) {
  const { eu, ev, n } = M.basis(S, 0.8, v), g = M.metric(S, v);
  const d = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  check(`${name}: the embedding's basis vectors reproduce the metric`, near(d(eu, eu), g.guu, 1e-12) && near(d(ev, ev), g.gvv, 1e-12) && near(d(eu, ev), 0, 1e-12));
  const X = M.embed(S, 0.8, v), q = S.f(v);
  const away = name === 'torus' ? [X[0] - 2 * Math.cos(0.8), X[1] - 2 * Math.sin(0.8), X[2]] : name === 'sphere' ? X : name === 'cone' ? [Math.cos(0.8) * Math.cos(cone.alpha), Math.sin(0.8) * Math.cos(cone.alpha), Math.sin(cone.alpha)] : [Math.cos(0.8), Math.sin(0.8), 0];
  check(`${name}: the normal points outward`, d(n, away) > 0, String(d(n, away)));
  void q;
}

// geodesics: speed and Clairaut's ρ² u̇ are conserved; the equator is a geodesic; a great circle closes
{
  const g = M.geodesic(sphere, { u: 0, v: 1.0, heading: 0.6, length: 2 * PI, steps: 2000 });
  const c0 = g.clairaut[0];
  check('sphere geodesic: Clairaut’s ρ² u̇ stays constant', g.clairaut.every((c) => near(c, c0, 1e-9)));
  check('sphere geodesic: unit speed is kept', g.speed2.every((s) => near(s, 1, 1e-9)));
  const [u, v] = g.pts[g.pts.length - 1];
  check('sphere: a great circle of length 2π comes back to its start', near(Math.cos(u) * Math.sin(v), Math.sin(1.0), 1e-6) && near(Math.cos(v), Math.cos(1.0), 1e-6), `${u} ${v}`);
  // highest point of a great circle tilted at inclination i: sin θ_min = cos i  (Clairaut)
  const minTh = Math.min(...g.pts.map((p) => p[1]));
  check('sphere: the great circle’s highest point obeys sin θ_min = ρ² u̇', near(Math.sin(minTh), c0, 2e-5), `${Math.sin(minTh)} vs ${c0}`);
  const eq = M.geodesic(sphere, { u: 0, v: PI / 2, heading: 0, length: 3, steps: 300 });
  check('sphere: the equator is a geodesic (θ stays π/2)', eq.pts.every((p) => near(p[1], PI / 2, 1e-12)));
  const lat = M.geodesic(sphere, { u: 0, v: 0.8, heading: 0, length: 1, steps: 300 });
  check('sphere: a geodesic launched along a circle of latitude leaves it (toward the equator)', lat.pts[lat.pts.length - 1][1] > 0.85);
  const cyl = M.geodesic(cylinder, { u: 0, v: 0, heading: 0.5, length: 3, steps: 300 });
  const [uc, vc] = cyl.pts[cyl.pts.length - 1];
  check('cylinder: geodesics are helices, straight in (φ, z)', near(uc, 3 * Math.cos(0.5), 1e-9) && near(vc, 3 * Math.sin(0.5), 1e-9));
  const tor = M.geodesic(torus, { u: 0, v: 0.3, heading: 0.9, length: 25, steps: 5000 });
  check('torus geodesic: Clairaut’s ρ² u̇ is conserved', tor.clairaut.every((c) => near(c, tor.clairaut[0], 1e-8)));
}

// parallel transport: along the latitude θ₀ the sphere's explicit solution V^θ = cos(φ cos θ₀)
{
  const th0 = 1.0;
  const path = M.parallel(th0, 400);
  const Vs = M.transport(sphere, path, [0, 1]);
  const k = 100, phi = path[k][0];
  check('sphere: transport along a latitude gives V^θ = cos(φ cos θ₀)', near(Vs[k][1], Math.cos(phi * Math.cos(th0)), 1e-8), `${Vs[k][1]}`);
  check('sphere: and V^φ = −sin(φ cos θ₀)/sin θ₀', near(Vs[k][0], -Math.sin(phi * Math.cos(th0)) / Math.sin(th0), 1e-8));
  const turn = M.angleBetween(sphere, 0, th0, [0, 1], Vs[Vs.length - 1]);
  const want = 2 * PI * (1 - Math.cos(th0));
  check('sphere: once around the latitude the vector comes back turned by the cap area, 2π(1 − cos θ₀)', near(((turn - want) % (2 * PI) + 3 * PI) % (2 * PI) - PI, 0, 1e-6), `${turn} vs ${want}`);
  const coneTurn = M.angleBetween(cone, 0, 1.5, [0, 1], M.transport(cone, M.parallel(1.5, 400), [0, 1]).pop());
  const deficit = 2 * PI * (1 - Math.sin(cone.alpha));
  check('cone: around the tip the vector turns by the deficit angle 2π(1 − sin α) = 180°', near(((coneTurn - deficit) % (2 * PI) + 3 * PI) % (2 * PI) - PI, 0, 1e-6), `${coneTurn}`);
  const T = M.transport(sphere, path, [0, 1]);
  check('transport keeps the length of the vector', T.every((V) => near(M.norm(sphere, th0, V), 1, 1e-8)));
}

// small loops: rotation = ∫K dA (Gauss–Bonnet for a coordinate rectangle), and → K × area
for (const [name, S, v0] of [['sphere', sphere, 1.0], ['torus outer', torus, 0.2], ['torus inner', torus, 2.9], ['catenoid', catenoid, 0.5], ['cylinder', cylinder, 0.3]]) {
  for (const d of [0.3, 0.1]) {
    const L = M.loopHolonomy(S, 0.5, v0, d, d);
    check(`${name}: loop of half-width ${d} turns the vector by ∫K dA`, near(L.angle, L.totalK, 1e-7 + 1e-6 * Math.abs(L.totalK)), `${L.angle} vs ${L.totalK}`);
  }
  const L = M.loopHolonomy(S, 0.5, v0, 0.02, 0.02);
  check(`${name}: for a tiny loop, rotation ÷ area → K`, near(L.angle / L.area, M.curvature(S, v0), 2e-3 * Math.max(1, Math.abs(M.curvature(S, v0)))), `${L.angle / L.area}`);
}
check('torus: a loop on the outer side turns the vector anticlockwise, on the inner side clockwise', M.loopHolonomy(torus, 0, 0, 0.2, 0.2).angle > 0 && M.loopHolonomy(torus, 0, PI, 0.2, 0.2).angle < 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
