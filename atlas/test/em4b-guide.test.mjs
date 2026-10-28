// The rectangular-waveguide model behind the em4b-guide simulation.
//   node atlas/test/em4b-guide.test.mjs

import * as M from '../src/viz/model/em4b-guide.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
const C = M.C, MU0 = 1.25663706127e-6, EPS0 = 8.8541878188e-12;

// WR-90: 22.86 mm × 10.16 mm, TE10 cutoff 6.557 GHz, TE20 13.11 GHz, TE01 14.75 GHz
const { a, b } = M.WR90;
check('WR-90 width is 22.86 mm', near(a, 0.02286, 1e-12));
check('WR-90 height is 10.16 mm', near(b, 0.01016, 1e-12));
check('WR-90 TE10 cutoff ≈ 6.557 GHz', near(M.cutoff(a, b, 1, 0), 6.557e9, 2e-4), `${M.cutoff(a, b, 1, 0)}`);
check('WR-90 TE20 cutoff = 2 × TE10', near(M.cutoff(a, b, 2, 0), 2 * M.cutoff(a, b, 1, 0), 1e-12));
check('WR-90 TE01 cutoff ≈ 14.75 GHz', near(M.cutoff(a, b, 0, 1), 14.754e9, 2e-4), `${M.cutoff(a, b, 0, 1)}`);
const order = M.modesBelow(a, b, 20e9).map((q) => `${q.m}${q.n}`);
check('WR-90 modes below 20 GHz in order: 10, 20, 01, 11', order.slice(0, 4).join(' ') === '10 20 01 11', order.join(' '));
check('the band 8.2–12.4 GHz carries TE10 alone', M.cutoff(a, b, 1, 0) < M.WR90.band[0] && M.cutoff(a, b, 2, 0) > M.WR90.band[1]);

// propagation: vp vg = c², ω² = c²(k² + K²), lamg > lam0
for (const f of [7e9, 10e9, 12.4e9]) {
  const g = M.guide(a, b, 1, 0, f);
  check(`TE10 at ${f / 1e9} GHz: vp·vg = c²`, near(g.vp * g.vg, C * C, 1e-12));
  check(`TE10 at ${f / 1e9} GHz: ω² = c²(k² + (π/a)²)`, near((2 * Math.PI * f) ** 2, C * C * (g.k ** 2 + (Math.PI / a) ** 2), 1e-12));
  check(`TE10 at ${f / 1e9} GHz: guide wavelength exceeds free-space`, g.lamg > g.lam0);
  // vg = dω/dk by finite difference
  const h = 1e3, g1 = M.guide(a, b, 1, 0, f + h), g0 = M.guide(a, b, 1, 0, f - h);
  check(`TE10 at ${f / 1e9} GHz: vg = dω/dk`, near(g.vg, (2 * Math.PI * 2 * h) / (g1.k - g0.k), 1e-6), `${g.vg} vs ${(2 * Math.PI * 2 * h) / (g1.k - g0.k)}`);
}
const below = M.guide(a, b, 1, 0, 5e9);
check('below cutoff: no propagation, κ² = K² − (ω/c)²', !below.above && near(below.kappa ** 2, (Math.PI / a) ** 2 - (2 * Math.PI * 5e9 / C) ** 2, 1e-12));

// the fields obey the boundary conditions at the walls and Maxwell's equations inside
const d = 1e-7;
function partial(F, comp, axis, p) {
  const q = [...p], r = [...p];
  q[axis] += d; r[axis] -= d;
  return (F(...q)[comp] - F(...r)[comp]) / (2 * d);
}
for (const [m, n, f] of [[1, 0, 10e9], [2, 1, 22e9], [1, 1, 18e9], [0, 1, 16e9], [1, 0, 5e9], [1, 2, 25e9]]) {
  const F = (x, y, z, t) => M.te(a, b, m, n, f, x, y, z, t);
  const tag = `TE${m}${n} at ${f / 1e9} GHz`;
  // walls: tangential E and normal B vanish
  let worst = 0;
  for (const s of [0.13, 0.41, 0.77]) for (const z of [0, 0.004]) for (const t of [0, 1.3e-11]) {
    const xw = F(0, s * b, z, t), xw2 = F(a, s * b, z, t), yw = F(s * a, 0, z, t), yw2 = F(s * a, b, z, t);
    worst = Math.max(worst, Math.abs(xw.Ey), Math.abs(xw2.Ey), Math.abs(xw.Bx), Math.abs(xw2.Bx), Math.abs(yw.Ex), Math.abs(yw2.Ex), Math.abs(yw.By), Math.abs(yw2.By));
  }
  check(`${tag}: E∥ = 0 and B⊥ = 0 on the walls`, worst < 1e-6, `${worst}`);
  // Maxwell inside: ∇·E = 0, ∇·B = 0, ∇×E = −∂B/∂t, ∇×B = (1/c²)∂E/∂t — each
  // residual measured against the size of its own terms
  const dt = 1e-16;
  const errs = [];
  const rel = (...terms) => { const s = terms.reduce((u, v) => u + v, 0), m = terms.reduce((u, v) => u + Math.abs(v), 0); return m > 0 ? Math.abs(s) / m : 0; };
  for (const p of [[0.3 * a, 0.6 * b, 0.002], [0.71 * a, 0.22 * b, 0.009]]) {
    const P = [...p, 2e-12];
    const v = (x, y, z, t) => { const e = F(x, y, z, t); return [e.Ex, e.Ey, e.Ez, e.Bx, e.By, e.Bz]; };
    const dd = (comp, axis) => partial(v, comp, axis, P);
    const dT = (comp) => (v(...p, P[3] + dt)[comp] - v(...p, P[3] - dt)[comp]) / (2 * dt);
    errs.push(rel(dd(0, 0), dd(1, 1), dd(2, 2)));
    errs.push(rel(dd(3, 0), dd(4, 1), dd(5, 2)));
    errs.push(rel(dd(2, 1), -dd(1, 2), dT(3)));
    errs.push(rel(dd(0, 2), -dd(2, 0), dT(4)));
    errs.push(rel(dd(1, 0), -dd(0, 1), dT(5)));
    errs.push(rel(dd(5, 1), -dd(4, 2), -dT(0) / (C * C)));
    errs.push(rel(dd(3, 2), -dd(5, 0), -dT(1) / (C * C)));
    errs.push(rel(dd(4, 0), -dd(3, 1), -dT(2) / (C * C)));
  }
  const e = Math.max(...errs);
  check(`${tag}: Maxwell's equations hold inside`, e < 1e-5, `${e}`);
}

// TE10 has E along y only, largest in the middle, and its B loops in the x–z plane
const mid = M.te(a, b, 1, 0, 10e9, a / 2, b / 2, 0, 1e-11);
check('TE10: E has no x component', Math.abs(mid.Ex) < 1e-9 && Math.abs(mid.Ey) > 0);
check('TE10: B has no y component', Math.abs(mid.By) < 1e-12);
check('μ₀ε₀ = 1/c² (constants agree)', near(MU0 * EPS0 * C * C, 1, 1e-9));

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
