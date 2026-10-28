// The vector-calculus model behind the c3-lineint, c3-cells and c3-flux
// simulations — line integrals, flux across curves, surface integrals,
// numerical divergence and curl, volume integrals and regions cut into
// cells — checked against results known in closed form, and the three
// simulations' validators.
//   node atlas/test/c3-vector.test.mjs

import * as M from '../src/viz/model/c3-vector.js';
import { validate as vLine, defaults as dLine } from '../src/viz/sims/c3-lineint.js';
import { validate as vCells, defaults as dCells } from '../src/viz/sims/c3-cells.js';
import { validate as vFlux, defaults as dFlux } from '../src/viz/sims/c3-flux.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const PI = Math.PI;

// quadrature
check('Gauss–Legendre: ∫₀¹ x⁴ dx = 1/5', close(M.gauss((x) => x ** 4, 0, 1, 1), 0.2, 1e-14));
check('Gauss–Legendre: ∫₀^π sin = 2', close(M.gauss(Math.sin, 0, PI, 8), 2, 1e-12));
check('Gauss–Legendre: reversed limits change the sign', close(M.gauss((x) => x, 1, 0, 2), -0.5, 1e-14));
check('Gauss–Legendre copes with an integrable endpoint singularity: ∫₀¹ x^(−1/2) dx = 2', close(M.gauss((x) => 1 / Math.sqrt(x), 0, 1, 400), 2, 2e-3));

// curves in the plane
const circle = (R) => ({ X: (t) => R * Math.cos(t), Y: (t) => R * Math.sin(t) });
const rot = (x, y) => [-y, x], radial = (x, y) => [x, y], vortex = (x, y) => [-y / (x * x + y * y), x / (x * x + y * y)];
check('circulation of ⟨−y, x⟩ round a circle of radius 2 is 2π·2² = 8π', close(M.work(rot, circle(2), 0, 2 * PI), 8 * PI));
check('the vortex field circulates 2π round the unit circle', close(M.work(vortex, circle(1), 0, 2 * PI), 2 * PI));
check('… and round a circle of radius 3 too', close(M.work(vortex, circle(3), 0, 2 * PI), 2 * PI));
check('outward flux of ⟨x, y⟩ across a circle of radius R is 2πR²', close(M.fluxAcross(radial, circle(1.5), 0, 2 * PI), 2 * PI * 1.5 ** 2));
check('the rotation field has no flux across a circle', Math.abs(M.fluxAcross(rot, circle(2), 0, 2 * PI)) < 1e-9);
{
  // a gradient field: F = ∇(x²y) = ⟨2xy, x²⟩ from (0,0) to (1,2) along two paths
  const F = (x, y) => [2 * x * y, x * x];
  const line = { X: (t) => t, Y: (t) => 2 * t }, para = { X: (t) => t, Y: (t) => 2 * t * t };
  check('a gradient field: work along a line = f(end) − f(start) = 2', close(M.work(F, line, 0, 1), 2));
  check('… and along a parabola, the same', close(M.work(F, para, 0, 1), 2));
  check('reversing the path changes the sign', close(M.work(F, para, 1, 0), -2));
  // a non-conservative field ⟨y, 0⟩ on the same two paths: ∫y dx = 1 (line), 2/3 (parabola)
  const G = (x, y) => [y, 0];
  check('a non-conservative field gives different work on the two paths', close(M.work(G, line, 0, 1), 1) && close(M.work(G, para, 0, 1), 2 / 3));
}
{
  // ∫ ds = length; a semicircular wire of radius 2 with density 1 + y has mass ∫(1 + 2 sin t)·2 dt = 2π + 8
  check('arc length of a semicircle of radius 2 is 2π', close(M.arcLength(circle(2), 0, PI), 2 * PI));
  check('mass of a semicircular wire with density 1 + y is 2π + 8', close(M.scalarLine((x, y) => 1 + y, circle(2), 0, PI), 2 * PI + 8));
  check('∫ f ds does not depend on direction', close(M.scalarLine((x, y) => 1 + y, circle(2), PI, 0), 2 * PI + 8));
}
{
  // a running integral reaches the total; reparametrizing does not change it
  const F = (x, y) => [y, x * x], c = { X: (t) => Math.cos(t), Y: (t) => Math.sin(t) };
  const total = M.work(F, c, 0, PI);
  const run = M.running((t) => M.workIntegrand(F, c, t, PI), 0, PI, 120);
  check('a running integral ends at the total', close(run.cum[run.cum.length - 1], total, 1e-9));
  for (const [name, R] of Object.entries(M.REPARAM)) {
    const g = (s) => M.workIntegrand(F, c, PI * R.phi(s), PI) * PI * R.dphi(s);
    check(`reparametrized (${name}): the same total`, close(M.gauss(g, 0, 1, 64), total, 1e-8));
    check(`reparametrization ${name} maps 0 → 0 and 1 → 1`, R.phi(0) === 0 && close(R.phi(1), 1, 1e-15));
  }
}

// derivatives of fields
check('curl of ⟨−y, x⟩ is 2', close(M.curl2(rot, 0.7, -0.3), 2, 1e-8));
check('div of ⟨x, y⟩ is 2', close(M.div2(radial, 0.7, -0.3), 2, 1e-8));
check('the vortex field has zero curl away from the origin', Math.abs(M.curl2(vortex, 0.8, 0.5)) < 1e-6);
check('div ⟨x², yz, xz⟩ at (1, 2, 3) = 2x + z + x = 6', close(M.div3((x, y, z) => [x * x, y * z, x * z], 1, 2, 3), 6, 1e-8));
{
  const c = M.curl3((x, y, z) => [y * z, x * z * 2, x * y * 3], 1, 2, 3);   // curl = ⟨3x − 2x, y − 3y, 2z − z⟩ = ⟨x, −2y, z⟩
  check('curl ⟨yz, 2xz, 3xy⟩ at (1, 2, 3) = ⟨1, −4, 3⟩', close(c[0], 1, 1e-7) && close(c[1], -4, 1e-7) && close(c[2], 3, 1e-7), String(c));
  const g = M.curl3((x, y, z) => [2 * x * y, x * x + z, y], 0.4, 1.1, -0.7);
  check('the curl of a gradient vanishes', Math.hypot(...g) < 1e-7);
  const inv = (x, y, z) => { const r3 = Math.hypot(x, y, z) ** 3; return [x / r3, y / r3, z / r3]; };
  check('r̂/r² has zero divergence away from the origin', Math.abs(M.div3(inv, 0.6, -0.8, 1.2)) < 1e-6);
}

// surfaces
const sphere = (R) => (u, v) => [R * Math.sin(u) * Math.cos(v), R * Math.sin(u) * Math.sin(v), R * Math.cos(u)];
check('area of a sphere of radius 3 is 36π', close(M.area(sphere(3), [0, PI], [0, 2 * PI]), 36 * PI));
check('the sphere’s r_φ × r_θ points outward', M.dot(M.normal(sphere(1), 1, 0.5), sphere(1)(1, 0.5)) > 0);
check('flux of ⟨x, y, z⟩ out of a sphere of radius 2 is 4π·2³ = 32π', close(M.flux((x, y, z) => [x, y, z], sphere(2), [0, PI], [0, 2 * PI]), 32 * PI));
check('flipping the orientation flips the flux', close(M.flux((x, y, z) => [x, y, z], sphere(2), [0, PI], [0, 2 * PI], { sign: -1 }), -32 * PI));
{
  const inv = (x, y, z) => { const r3 = Math.hypot(x, y, z) ** 3; return [x / r3, y / r3, z / r3]; };
  check('flux of r̂/r² out of any sphere about the origin is 4π', close(M.flux(inv, sphere(0.3), [0, PI], [0, 2 * PI]), 4 * PI));
  // the same field out of an off-centre sphere that does not contain the origin: 0
  const off = (u, v) => { const p = sphere(1)(u, v); return [p[0] + 3, p[1], p[2]]; };
  check('… and 0 out of a sphere that does not contain the origin', Math.abs(M.flux(inv, off, [0, PI], [0, 2 * PI], { pu: 24, pv: 24 })) < 1e-8);
}
{
  // Stokes: F = ⟨−y, x, z⟩ has curl ⟨0, 0, 2⟩; a disk and a hemisphere on the unit circle both carry flux 2π
  const F = (x, y, z) => [-y, x, z];
  const disk = (u, v) => [u * Math.cos(v), u * Math.sin(v), 0];
  const hemi = (u, v) => [Math.sin(u) * Math.cos(v), Math.sin(u) * Math.sin(v), Math.cos(u)];
  check('Stokes: curl flux through the unit disk is 2π', close(M.curlFlux(F, disk, [0, 1], [0, 2 * PI]), 2 * PI, 1e-6));
  check('… through the upper hemisphere, the same', close(M.curlFlux(F, hemi, [0, PI / 2], [0, 2 * PI]), 2 * PI, 1e-6));
  const edge = { X: Math.cos, Y: Math.sin, Z: () => 0 };
  check('… and the circulation round the edge is 2π', close(M.work(F, edge, 0, 2 * PI), 2 * PI));
}
check('scalar surface integral: ∬ z² dS over the unit sphere is 4π/3', close(M.scalarSurface((x, y, z) => z * z, sphere(1), [0, PI], [0, 2 * PI]), (4 * PI) / 3));

// volumes and the divergence theorem
check('volume of a ball of radius 2 is 32π/3', close(M.ballIntegral(() => 1, [0, 0, 0], 2), (32 * PI) / 3));
check('∭ (x² + y² + z²) over the unit ball is 4π/5', close(M.ballIntegral((x, y, z) => x * x + y * y + z * z, [1, 2, 3].map(() => 0), 1), (4 * PI) / 5));
check('box integral of xyz over [0,1]³ is 1/8', close(M.boxIntegral((x, y, z) => x * y * z, [0, 1], [0, 1], [0, 1]), 0.125));
check('cylinder of radius 1, height 2 has volume 2π', close(M.cylinderIntegral(() => 1, [0, 0], 1, [0, 2]), 2 * PI));
{
  // divergence theorem for F = ⟨x², y², z²⟩ on the unit cube: ∭ 2(x + y + z) = 3
  const F = (x, y, z) => [x * x, y * y, z * z];
  const faces = [
    [(u, v) => [1, u, v], 1], [(u, v) => [0, u, v], -1], [(u, v) => [v, 1, u], 1], [(u, v) => [v, 0, u], -1], [(u, v) => [u, v, 1], 1], [(u, v) => [u, v, 0], -1],
  ];
  const out = faces.reduce((s, [S, sign]) => s + M.flux(F, S, [0, 1], [0, 1], { sign, pu: 4, pv: 4 }), 0);
  const vol = M.boxIntegral((x, y, z) => M.div3(F, x, y, z), [0, 1], [0, 1], [0, 1], 4);
  check('divergence theorem on the unit cube: both sides are 3', close(out, 3, 1e-9) && close(vol, 3, 1e-6), `${out}, ${vol}`);
}

// regions cut into cells
{
  for (const R of [{ kind: 'rect', x: [-1, 2], y: [0, 1.5], m: 5, n: 3 }, { kind: 'disk', c: [0.3, -0.2], r: 1.2, m: 3, n: 8 }, { kind: 'annulus', c: [0, 0], r: [0.5, 1.5], m: 2, n: 6 }]) {
    const F = (x, y) => [x * y - y * y, x * x + Math.sin(y)];
    const { cells, boundary } = M.cellsOf(R);
    for (const mode of ['circ', 'flux']) {
      const sum = cells.reduce((s, c) => s + M.loopValue(F, c.edges, mode), 0);
      const edge = M.loopValue(F, [...boundary.outer, ...boundary.inner], mode, 64);
      const g = mode === 'circ' ? (x, y) => M.curl2(F, x, y) : (x, y) => M.div2(F, x, y);
      const dbl = M.regionIntegral(g, R);
      check(`${R.kind} (${mode}): interior edges cancel — the cells add up to the boundary`, close(sum, edge, 1e-9), `${sum} vs ${edge}`);
      check(`${R.kind} (${mode}): Green — the boundary equals the double integral`, close(edge, dbl, 1e-6), `${edge} vs ${dbl}`);
    }
    const A = cells.reduce((s, c) => s + c.area, 0);
    const exact = R.kind === 'rect' ? 4.5 : R.kind === 'disk' ? PI * 1.44 : PI * 2;
    check(`${R.kind}: the cells’ areas add up to the region’s`, close(A, exact, 1e-12));
  }
  // the vortex field on a disk round its singularity: the cells still telescope to 2π, but ∬ curl = 0
  const { cells, boundary } = M.cellsOf({ kind: 'disk', c: [0, 0], r: 1, m: 3, n: 8 });
  const sum = cells.reduce((s, c) => s + M.loopValue(vortex, c.edges, 'circ'), 0);
  check('vortex on a disk: the cells add up to the boundary circulation 2π', close(sum, 2 * PI, 1e-6) && close(M.loopValue(vortex, boundary.outer, 'circ', 64), 2 * PI));
  check('… all of it from the wedges that touch the centre', close(cells.filter((c) => c.i === 0).reduce((s, c) => s + M.loopValue(vortex, c.edges, 'circ'), 0), 2 * PI, 1e-6));
  // on an annulus the outer and inner boundaries cancel
  const ann = M.cellsOf({ kind: 'annulus', c: [0, 0], r: [0.5, 2], m: 2, n: 8 });
  check('vortex on an annulus: outer minus inner circulation is 0', Math.abs(M.loopValue(vortex, [...ann.boundary.outer, ...ann.boundary.inner], 'circ', 64)) < 1e-9);
  // a small cell's circulation per area approaches the curl at its centre
  const F = (x, y) => [-y * y, x * x * y];
  const small = M.cellsOf({ kind: 'rect', x: [1, 1.01], y: [0.5, 0.51], m: 1, n: 1 }).cells[0];
  check('a tiny cell: circulation / area → curl', close(M.loopValue(F, small.edges, 'circ') / small.area, M.curl2(F, ...small.centre), 1e-4));
}

// the simulations' validators accept their defaults and reject nonsense
check('c3-lineint validates its defaults', vLine({ ...dLine }).length === 0, vLine({ ...dLine }).join('; '));
check('c3-lineint rejects a bad field', vLine({ ...dLine, P: 'x +* y' }).length > 0);
check('c3-lineint rejects a path without a range', vLine({ ...dLine, paths: [{ x: 't', y: 't' }] }).length > 0);
check('c3-cells validates its defaults', vCells({ ...dCells }).length === 0, vCells({ ...dCells }).join('; '));
check('c3-cells rejects an unknown region', vCells({ ...dCells, region: { kind: 'blob' } }).length > 0);
check('c3-flux validates its defaults', vFlux({ ...dFlux }).length === 0, vFlux({ ...dFlux }).join('; '));
check('c3-flux rejects a bad surface', vFlux({ ...dFlux, surfaces: [{ x: 'u +', y: 'v', z: '0', u: [0, 1], v: [0, 1] }] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
