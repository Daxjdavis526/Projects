// The image model behind the em3-images simulation: the conductor is an
// equipotential, the induced surface charge integrates to the image charge,
// σ = ε₀E·n̂ just outside, the potential is harmonic outside the metal, the
// force and the work agree with the textbook formulas, and field lines from
// a grounded sphere's charge land on it in the share R/a; and the
// simulation's parameter validator.
//   node atlas/test/em3-images.test.mjs

import * as M from '../src/viz/model/em3-images.js';
import { validate, defaults } from '../src/viz/sims/em3-images.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-300);

// ── the plane ──
const q = 3e-9, d = 0.04;
const P = M.scene({ geometry: 'plane', q, x: 0.01, y: d });
let worst = 0;
for (const [x, z] of [[0, 0], [0.05, -0.02], [-0.3, 0.1], [1, 1]]) worst = Math.max(worst, Math.abs(M.potential(P, x, 0, z)));
check('plane: V = 0 on the plane', worst < 1e-9, `${worst}`);
// σ integrates to −q (polar rings about the foot, substitution r = d tan u)
let tot = 0;
const N = 20000;
for (let k = 0; k < N; k++) { const u = ((k + 0.5) / N) * (Math.PI / 2), r = d * Math.tan(u), dr = (d / Math.cos(u) ** 2) * (Math.PI / 2 / N); tot += M.sigma(P, 0.01 + r, 0) * 2 * Math.PI * r * dr; }
check('plane: induced charge is −q', close(tot, -q, 1e-6), `${tot}`);
check('plane: induced() is −q', M.induced(P) === -q);
// σ = ε₀ E_y just above the plane
const Ey = M.field(P, 0.03, 1e-9, 0.02)[1];
check('plane: σ = ε₀E⊥', close(M.sigma(P, 0.03, 0.02), M.EPS0 * Ey, 1e-6));
const Fp = M.force(P);
check('plane: force q²/(4πε₀(2d)²) toward the plane', close(Fp[1], -M.K * q * q / (4 * d * d), 1e-12) && Math.abs(Fp[0]) < 1e-20);
// work: integrate the force from infinity
let W = 0;
for (let k = 0; k < 200000; k++) { const u = (k + 0.5) / 200000, y = d / u, dy = d / (u * u) / 200000; W += (M.K * q * q / (4 * y * y)) * dy; }
check('plane: work to bring q in is −q²/(16πε₀d), half the image pair’s energy', close(-W, M.workIn(P), 1e-5) && close(M.workIn(P), 0.5 * (-M.K * q * q / (2 * d)), 1e-12));
// harmonic: the 3D Laplacian of V vanishes outside
function lap(S, x, y, z, h = 1e-4) {
  const v = (a, b, c) => M.potential(S, a, b, c);
  return (v(x + h, y, z) + v(x - h, y, z) + v(x, y + h, z) + v(x, y - h, z) + v(x, y, z + h) + v(x, y, z - h) - 6 * v(x, y, z)) / (h * h);
}
check('plane: V is harmonic above the plane', Math.abs(lap(P, 0.05, 0.02, 0.01)) < 1e-3 * Math.abs(M.potential(P, 0.05, 0.02, 0.01)) / 1e-4);

// ── the sphere ──
const R = 0.03, a = 0.075;
const G = M.scene({ geometry: 'sphere', q, x: a * 0.6, y: a * 0.8, R, ground: 'grounded' });
worst = 0;
for (const [nx, ny, nz] of [[1, 0, 0], [0, 1, 0], [0.6, 0.8, 0], [-0.6, -0.8, 0], [0, 0, 1], [0.48, 0.64, 0.6]]) worst = Math.max(worst, Math.abs(M.potential(G, R * nx, R * ny, R * nz)));
check('grounded sphere: V = 0 on the sphere', worst < 1e-6, `${worst}`);
check('grounded sphere: image −qR/a at R²/a', close(G.images[0].q, -q * R / a, 1e-12) && close(Math.hypot(G.images[0].x, G.images[0].y), R * R / a, 1e-12));
function sphereTotal(S) {
  let t = 0;
  const n = 4000, th0 = Math.atan2(S.y, S.x);
  for (let k = 0; k < n; k++) {
    const g = ((k + 0.5) / n) * Math.PI;
    // a point at angle g from the charge's direction, in the plane z = 0
    t += M.sigma(S, Math.cos(th0 + g), Math.sin(th0 + g)) * 2 * Math.PI * S.R * S.R * Math.sin(g) * (Math.PI / n);
  }
  return t;
}
check('grounded sphere: σ integrates to −qR/a', close(sphereTotal(G), -q * R / a, 1e-5), `${sphereTotal(G)}`);
const n = [0.6, 0.8], E = M.field(G, (R + 1e-9) * n[0], (R + 1e-9) * n[1]);
check('grounded sphere: σ = ε₀E·n̂', close(M.sigma(G, n[0], n[1]), M.EPS0 * (E[0] * n[0] + E[1] * n[1]), 1e-5));
const Fg = M.force(G);
check('grounded sphere: force kq²Ra/(a² − R²)², attractive', close(Math.hypot(...Fg), M.K * q * q * R * a / (a * a - R * R) ** 2, 1e-12) && Fg[0] * G.x + Fg[1] * G.y < 0);
check('grounded sphere: V harmonic outside', Math.abs(lap(G, 0.0, -0.06, 0.02)) < 1e-3 * Math.abs(M.potential(G, 0, -0.06, 0.02)) / 1e-4);
const Nn = M.scene({ geometry: 'sphere', q, x: 0, y: a, R, ground: 'neutral' });
check('neutral sphere: no net induced charge', Math.abs(sphereTotal(Nn)) < 1e-6 * q && M.induced(Nn) === 0);
let spread = 0;
const v0 = M.potential(Nn, R, 0, 0);
for (const [nx, ny, nz] of [[0, 1, 0], [0, -1, 0], [0.6, 0.8, 0], [0, 0, 1]]) spread = Math.max(spread, Math.abs(M.potential(Nn, R * nx, R * ny, R * nz) - v0));
check('neutral sphere: an equipotential at kq/a', spread < 1e-6 * v0 && close(v0, M.K * q / a, 1e-9) && close(M.conductorV(Nn), M.K * q / a, 1e-9));

// field lines: the share landing on a grounded sphere is about R/a
const S2 = M.scene({ geometry: 'sphere', q, x: 0, y: 0.06, R: 0.03 });
const nl = 40, box = [-2, 2, -2, 2];
let hits = 0;
for (const [ux, uy] of M.starts(S2, nl).filter((_, i) => i % 2 === 0)) {
  const L = M.line(S2, S2.x + ux * 1e-4, S2.y + uy * 1e-4, 1, box, { ds: 0.002, max: 20000 });
  if (L.end === 'conductor') hits++;
}
check('field lines: the share ending on the grounded sphere is R/a', Math.abs(hits / nl - 0.5) <= 1.5 / nl, `${hits} of ${nl}`);
let allHit = true;
for (const [ux, uy] of M.starts(P, 12)) { const L = M.line(P, P.x + ux * 1e-4, P.y + uy * 1e-4, 1, [-50, 50, -1, 50], { ds: 0.002, max: 60000 }); if (L.end !== 'conductor') allHit = false; }
check('field lines: every line from the charge ends on the plane', allHit);

// the validator
const ok = (p) => validate({ ...defaults, ...p });
check('defaults validate', ok({}).length === 0, ok({}).join('; '));
check('a sphere geometry validates', ok({ geometry: 'sphere', pos: [5, 0], R: 3 }).length === 0);
check('charge inside the sphere rejected', ok({ geometry: 'sphere', pos: [1, 0], R: 3 }).length > 0);
check('charge below the plane rejected', ok({ pos: [0, -1] }).length > 0);
check('unknown hide rejected', ok({ hide: ['nope'] }).length > 0);

console.log(`em3-images: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
