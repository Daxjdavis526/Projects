// The DOM-free model behind the electric-field simulation (sims/em-field.js):
// the fields and potentials of every kind of source against closed forms and
// brute-force sums, E = −∇V, the conductor's image solution (equipotential
// surfaces, E = 0 in the metal, the induced charges, shielding), Gauss's law —
// the flux integrated numerically over spheres, cubes, boxes, cylinders and a
// lumpy blob against the charge counted inside — field lines, equipotentials
// and the motion of a charged particle.
//   node atlas/test/em-field.test.mjs

import * as M from '../src/viz/model/em-field.js';
import { validate, defaults } from '../src/viz/sims/em-field.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
const { K, EPS0 } = M;
const mag = (v) => Math.hypot(v[0], v[1], v[2]);
let seed = 7;
const rnd = (a, b) => { seed = (seed * 16807) % 2147483647; return a + ((b - a) * seed) / 2147483647; };

// ─── constants ────────────────────────────────────────────────────────────
check('k = 1/(4πε₀) = 8.98755×10⁹', near(K, 8.9875517862e9, 1e-10));
check('the electron is 1836 times lighter than the proton', near(M.M_P / M.M_E, 1836.15267, 1e-8));

// ─── sources against closed forms ─────────────────────────────────────────
{
  const q = 3e-9, S = M.scene({ charges: [{ x: 0.1, y: -0.2, q }] });
  const E = M.field(S, 0.1 + 0.3, -0.2 + 0.4, 0);
  check('point charge: |E| = kq/r²', near(mag(E), (K * q) / 0.25, 1e-12));
  check('point charge: E points away from a positive charge', near(E[0] / mag(E), 0.6, 1e-12) && near(E[1] / mag(E), 0.8, 1e-12));
  check('point charge: V = kq/r', near(M.potential(S, 0.4, 0.2), (K * q) / 0.5, 1e-12));
  check('point charge: a bounded scene has V → 0 far away', Math.abs(M.potential(S, 1e7, 0)) < 1e-5);
}
{
  const Q = 4e-9, L = 0.3, y = 0.12, S = M.scene({ rods: [{ x1: -L / 2, y1: 0, x2: L / 2, y2: 0, Q }] });
  const E = M.field(S, 0, y);
  check('rod: on the bisector E = kQ/(y√(y² + L²/4)), straight out', near(E[1], (K * Q) / (y * Math.sqrt(y * y + (L * L) / 4)), 1e-12) && Math.abs(E[0]) < 1e-9 * E[1]);
  const d = 0.05, Ea = M.field(S, L / 2 + d, 0);
  check('rod: on its axis E = kQ/(d(d + L))', near(Ea[0], (K * Q) / (d * (d + L)), 1e-12) && Math.abs(Ea[1]) < 1e-9 * Ea[0]);
  const lam = Q / L, r = Math.sqrt(y * y + (L * L) / 4);
  check('rod: on the bisector V = kλ ln((r + L/2)/(r − L/2))', near(M.potential(S, 0, y), K * lam * Math.log((r + L / 2) / (r - L / 2)), 1e-12));
  check('rod: far away it is a point charge', near(mag(M.field(S, 300, 400)), (K * Q) / 250000, 1e-6));
  // against a brute-force sum of 200 000 pieces at random points in space
  const R = { x1: -0.1, y1: 0.05, x2: 0.2, y2: -0.15, Q: -2e-9 }, SR = M.scene({ rods: [R] }), N = 200000;
  let worst = 0, worstV = 0;
  for (let k = 0; k < 6; k++) {
    const p = [rnd(-0.3, 0.3), rnd(-0.3, 0.3), rnd(-0.2, 0.2)];
    const e = [0, 0, 0];
    let v = 0;
    for (let i = 0; i < N; i++) {
      const f = (i + 0.5) / N, x = R.x1 + f * (R.x2 - R.x1), yy = R.y1 + f * (R.y2 - R.y1);
      const dx = p[0] - x, dy = p[1] - yy, dz = p[2], r2 = dx * dx + dy * dy + dz * dz, rr = Math.sqrt(r2), c = (K * R.Q) / N / (r2 * rr);
      e[0] += c * dx; e[1] += c * dy; e[2] += c * dz; v += (K * R.Q) / N / rr;
    }
    const got = M.field(SR, ...p);
    worst = Math.max(worst, mag([got[0] - e[0], got[1] - e[1], got[2] - e[2]]) / mag(e));
    worstV = Math.max(worstV, Math.abs(M.potential(SR, ...p) - v) / Math.abs(v));
  }
  check('rod: E matches a 200 000-piece sum anywhere in space', worst < 1e-6, worst.toExponential(2));
  check('rod: V matches a 200 000-piece sum anywhere in space', worstV < 1e-6, worstV.toExponential(2));
  // near the extension of the rod, the cancellation-free formulas stay finite and right
  const ext = M.field(SR, 0.2 + 0.3 * 0.6, -0.15 - 0.2 * 0.6, 1e-12);
  check('rod: on its extension the field is finite and along the rod', Number.isFinite(mag(ext)) && Math.abs(ext[2]) < 1e-6 * mag(ext));
  // pieces: the sum of n point charges approaches the integral
  const errs = [4, 16, 64].map((n) => {
    const P = M.scene({ rods: [{ x1: -L / 2, y1: 0, x2: L / 2, y2: 0, Q, pieces: n }] });
    return Math.abs(M.field(P, 0, 0.05)[1] - M.field(S, 0, 0.05)[1]) / M.field(S, 0, 0.05)[1];
  });
  check('rod in pieces: the sum converges to the integral', errs[0] > errs[1] && errs[1] > errs[2] && errs[2] < 1e-3, errs.map((e) => e.toExponential(1)).join(', '));
}
{
  const lam = 2e-9, S = M.scene({ lines: [{ x: 0.1, y: 0, lambda: lam }], ref: [0.6, 0] });
  check('line: E = 2kλ/r', near(mag(M.field(S, 0.1, 0.3)), (2 * K * lam) / 0.3, 1e-12));
  check('line: V(r₁) − V(r₂) = 2kλ ln(r₂/r₁)', near(M.potential(S, 0.1, 0.1) - M.potential(S, 0.1, 0.4), 2 * K * lam * Math.log(4), 1e-12));
  check('line: V = 0 at the reference point', Math.abs(M.potential(S, 0.6, 0)) < 1e-9);
  check('line: no z component off the plane', M.field(S, 0.3, 0.2, 0.5)[2] === 0);
}
{
  const sig = 5e-9, S = M.scene({ sheets: [{ x: 0, y: 0, angle: 90, sigma: sig }], ref: [0, 0] });
  const E1 = M.field(S, 0.2, 0.7), E2 = M.field(S, -0.05, -3);
  check('infinite sheet: E = σ/2ε₀ on each side, pointing away', near(E1[0], sig / (2 * EPS0), 1e-12) && near(E2[0], -sig / (2 * EPS0), 1e-12) && E1[1] === 0 && E2[1] === 0);
  check('infinite sheet: V = −σ|d|/2ε₀', near(M.potential(S, 0.3, 1), (-sig * 0.3) / (2 * EPS0), 1e-12));
  // a strip is the 2D sum of line charges
  const w = 0.2, T = M.scene({ sheets: [{ x: 0.05, y: -0.1, angle: 30, sigma: sig, width: w }] }), st = T.sheets[0];
  let worst = 0;
  for (let k = 0; k < 5; k++) {
    const p = [rnd(-0.3, 0.3), rnd(-0.3, 0.3)], e = [0, 0];
    const n = 100000;
    for (let i = 0; i < n; i++) {
      const t = -w / 2 + (w * (i + 0.5)) / n, x = st.x + t * st.ux, y = st.y + t * st.uy, dx = p[0] - x, dy = p[1] - y, r2 = dx * dx + dy * dy;
      e[0] += ((2 * K * sig * w) / n) * (dx / r2); e[1] += ((2 * K * sig * w) / n) * (dy / r2);
    }
    const got = M.field(T, ...p, 0);
    worst = Math.max(worst, Math.hypot(got[0] - e[0], got[1] - e[1]) / Math.hypot(...e));
  }
  check('strip: E matches the sum of 100 000 line charges', worst < 1e-6, worst.toExponential(2));
  const wide = M.scene({ sheets: [{ x: 0, y: 0, angle: 90, sigma: sig, width: 2000 }] });
  check('a very wide strip is an infinite sheet near its middle', near(M.field(wide, 0.01, 0.3)[0], sig / (2 * EPS0), 1e-4));
  const cap = M.scene({ sheets: [{ x: -0.01, y: 0, angle: 90, sigma: sig, width: 50 }, { x: 0.01, y: 0, angle: 90, sigma: -sig, width: 50 }] });
  check('two wide opposite strips: E = σ/ε₀ between them, ≈ 0 outside', near(M.field(cap, 0, 0.1)[0], sig / EPS0, 1e-3) && Math.abs(M.field(cap, 0.05, 0.1)[0]) < 1e-3 * sig / EPS0);
}
{
  const Q = 6e-9, R = 0.1, S = M.scene({ balls: [{ x: 0, y: 0, R, Q }] }), H = M.scene({ balls: [{ x: 0, y: 0, R, Q, shell: true }] });
  check('ball: outside E = kQ/r²', near(mag(M.field(S, 0.3, 0)), (K * Q) / 0.09, 1e-12));
  check('ball: inside E = kQr/R³', near(mag(M.field(S, 0.05, 0)), (K * Q * 0.05) / R ** 3, 1e-12));
  check('ball: V at the centre is 3kQ/2R', near(M.potential(S, 0, 0), (1.5 * K * Q) / R, 1e-12));
  check('shell: no field inside, V = kQ/R there', mag(M.field(H, 0.03, 0.04)) === 0 && near(M.potential(H, 0.03, 0.04), (K * Q) / R, 1e-12));
}
{
  const S = M.scene({ uniform: [300, -400], ref: [0.1, 0.1] });
  check('uniform: E everywhere', M.field(S, 5, -2)[0] === 300 && M.field(S, 5, -2)[1] === -400);
  check('uniform: ΔV = −E·Δr', near(M.potential(S, 0.3, 0.1) - M.potential(S, 0.1, 0.1), -300 * 0.2, 1e-12));
}

// ─── E = −∇V for every kind of source ─────────────────────────────────────
{
  const S = M.scene({
    charges: [{ x: 0.3, y: 0.2, q: 2e-9 }, { x: -0.25, y: -0.1, q: -1e-9 }],
    rods: [{ x1: -0.3, y1: 0.3, x2: 0.1, y2: 0.35, Q: 1.5e-9 }],
    lines: [{ x: 0.0, y: -0.35, lambda: -1e-9 }],
    sheets: [{ x: 0.45, y: 0, angle: 80, sigma: 2e-9 }, { x: -0.1, y: 0.1, angle: 20, sigma: -1e-9, width: 0.15 }],
    balls: [{ x: -0.4, y: 0.3, R: 0.08, Q: 1e-9 }, { x: 0.2, y: -0.3, R: 0.06, Q: -2e-9, shell: true }],
    uniform: [150, 80], ref: [0.05, 0.02],
  });
  let worst = 0;
  for (let k = 0; k < 40; k++) {
    const p = [rnd(-0.5, 0.5), rnd(-0.45, 0.45), rnd(-0.1, 0.1)], h = 1e-6;
    const g = [0, 1, 2].map((i) => { const a = p.slice(), b = p.slice(); a[i] += h; b[i] -= h; return -(M.potential(S, ...a) - M.potential(S, ...b)) / (2 * h); });
    const E = M.field(S, ...p);
    const e = mag([g[0] - E[0], g[1] - E[1], g[2] - E[2]]) / mag(E);
    if (Number.isFinite(e)) worst = Math.max(worst, e);
  }
  check('every source: E = −∇V (finite differences at 40 points in space)', worst < 1e-5, worst.toExponential(2));
}

// ─── the conductor ────────────────────────────────────────────────────────
{
  // a solid neutral sphere near a point charge, in a uniform field
  const S = M.scene({ conductor: { x: 0, y: 0, R: 0.1, Q: 0 }, charges: [{ x: 0.25, y: 0.05, q: 2e-9 }], uniform: [500, 200], ref: [0, 0] });
  const Vs = M.conductorPotential(S), Vscale = (K * 2e-9) / 0.25;
  let spread = 0, tang = 0;
  for (let k = 0; k < 50; k++) {
    const ct = rnd(-1, 1), ph = rnd(0, 2 * Math.PI), st = Math.sqrt(1 - ct * ct), n = [st * Math.cos(ph), st * Math.sin(ph), ct];
    const r = 0.1 * (1 + 1e-13), P = n.map((c) => c * r);
    spread = Math.max(spread, Math.abs(M.potential(S, ...P) - Vs));
    const E = M.field(S, ...n.map((c) => c * 0.1 * (1 + 1e-7))), En = E[0] * n[0] + E[1] * n[1] + E[2] * n[2];
    tang = Math.max(tang, mag([E[0] - En * n[0], E[1] - En * n[1], E[2] - En * n[2]]) / mag(E));
  }
  check('conducting sphere: its surface is an equipotential', spread < 1e-9 * Vscale, spread.toExponential(2));
  check('conducting sphere: E just outside is perpendicular to the surface', tang < 1e-5, tang.toExponential(2));
  check('conducting sphere: E = 0 in the metal', mag(M.field(S, 0.03, -0.05, 0.02)) === 0 && near(M.potential(S, 0.03, -0.05), Vs, 1e-12));
  const split = M.surfaceChargeSplit(S);
  check('neutral conducting sphere: induced + and − charges cancel', Math.abs(split.plus - split.minus) < 1e-6 * split.plus, `${split.plus} vs ${split.minus}`);
  // a neutral sphere in a uniform field alone: σ = 3ε₀E₀ cos θ, and E = 3E₀ at the poles
  const U = M.scene({ conductor: { x: 0, y: 0, R: 0.05, Q: 0 }, uniform: [1000, 0] });
  check('sphere in a uniform field: σ = 3ε₀E₀ cos θ', near(M.sigmaAt(U, 1, 0, 0), 3 * EPS0 * 1000, 1e-12) && near(M.sigmaAt(U, 0.6, 0.8, 0), 3 * EPS0 * 1000 * 0.6, 1e-12));
  check('sphere in a uniform field: E = 3E₀ at the pole', near(M.field(U, 0.05 * (1 + 1e-12), 0)[0], 3000, 1e-6));
}
{
  // a hollow conductor (cavity a, outer R) with net charge Q and a charge q off-centre in the cavity
  const q = 3e-9, Q = -1e-9, mk = (qx, qy) => M.scene({ conductor: { x: 0.02, y: -0.01, R: 0.12, a: 0.07, Q }, charges: [{ x: qx, y: qy, q }] });
  const S = mk(0.06, 0.02);
  const Vs = M.conductorPotential(S);
  let wall = 0;
  for (let k = 0; k < 40; k++) {
    const ct = rnd(-1, 1), ph = rnd(0, 2 * Math.PI), st = Math.sqrt(1 - ct * ct);
    const f = 0.07 * (1 - 1e-13);
    wall = Math.max(wall, Math.abs(M.potential(S, 0.02 + f * st * Math.cos(ph), -0.01 + f * st * Math.sin(ph), f * ct) - Vs));
  }
  check('shell: the cavity wall is at the conductor’s potential', wall < 1e-8 * Math.abs(Vs), wall.toExponential(2));
  const inner = M.surfaceChargeSplit(S, true), outer = M.surfaceChargeSplit(S, false);
  check('shell: the cavity wall carries −q', near(inner.plus - inner.minus, -q, 1e-6), `${inner.plus - inner.minus}`);
  check('shell: the outer surface carries Q + q, spread evenly', near(outer.plus - outer.minus, Q + q, 1e-6) && near(M.sigmaAt(S, 0, 1, 0), (Q + q) / (4 * Math.PI * 0.12 ** 2), 1e-9) && near(M.sigmaAt(S, -0.6, 0, 0.8), (Q + q) / (4 * Math.PI * 0.12 ** 2), 1e-9));
  const T = mk(-0.01, -0.05);
  check('shell: moving the charge in the cavity changes nothing outside', near(mag(M.field(S, 0.4, 0.3)), mag(M.field(T, 0.4, 0.3)), 1e-12) && near(M.potential(S, -0.3, 0.2), M.potential(T, -0.3, 0.2), 1e-12));
  check('shell: outside, the field is centred on the shell, not on the charge', near(mag(M.field(S, 0.02 + 0.3, -0.01)), (K * (Q + q)) / 0.09, 1e-12));
  // shielding the other way: a charge outside does not reach into an empty cavity
  const E = M.scene({ conductor: { x: 0, y: 0, R: 0.1, a: 0.06, Q: 0 }, charges: [{ x: 0.3, y: 0, q: 5e-9 }] });
  check('shell: an empty cavity is field-free, whatever is outside', mag(M.field(E, 0.01, 0.02, 0.01)) === 0);
}

// ─── Gauss's law: numerical flux against the charge inside ────────────────
const gauss = (S, g, tol, name) => {
  const surf = M.surface(g), f = M.flux(S, surf), Qe = M.enclosed(S, surf);
  const want = Qe / EPS0, scale = Math.max(Math.abs(want), f.abs * 1e-3);
  check(`Gauss: ${name}`, Math.abs(f.flux - want) <= tol * scale, `flux ${f.flux.toPrecision(9)}, Q_enc/ε₀ ${want.toPrecision(9)} (${f.evals} evaluations${f.converged ? '' : ', not converged'})`);
  return { f, Qe };
};
{
  const charges = [{ x: 0.03, y: 0.02, q: 2e-9 }, { x: -0.04, y: 0.01, q: -3e-9 }, { x: 0.3, y: -0.1, q: 4e-9 }, { x: -0.09, y: -0.05, q: 1e-9 }];
  const S = M.scene({ charges });
  for (const shape of ['sphere', 'cube', 'cylinder', 'lumpy']) {
    gauss(S, { shape, x: 0, y: 0, r: 0.12 }, 1e-7, `${shape} around two charges, with others outside`);
    gauss(S, { shape, x: 0.25, y: 0, r: 0.12 }, 1e-7, `${shape} around one charge`);
  }
  gauss(S, { shape: 'box', x: 0.0, y: 0.0, w: 0.2, h: 0.08, depth: 0.05, angle: 25 }, 1e-7, 'a rotated box');
  gauss(S, { shape: 'sphere', x: 0.6, y: 0.6, r: 0.1 }, 1e-7, 'a sphere around nothing: zero flux');
  // a charge 1% of the radius from the surface
  const close = M.scene({ charges: [{ x: 0.099, y: 0, q: 1e-9 }, { x: 0.101 + 0.1, y: 0.0, q: 1e-9 }] });
  gauss(close, { shape: 'sphere', x: 0, y: 0, r: 0.1 }, 1e-6, 'a charge just inside the surface');
  gauss(close, { shape: 'cube', x: 0.2, y: 0, r: 0.1 }, 1e-6, 'a charge just outside a cube');
  // a charge on the middle of a cube's edge sends a quarter of its flux through the cube
  const edge = M.scene({ charges: [{ x: 0, y: 0, q: 1e-9 }] });
  const fc = M.flux(edge, M.surface({ shape: 'cube', x: 0.05, y: 0.05, r: 0.05 }));
  check('a charge on the middle of a cube’s edge: a quarter of its flux goes through the cube', near(fc.flux, 1e-9 / EPS0 / 4, 1e-4), String(fc.flux / (1e-9 / EPS0)));
  // a charge at a cube's centre: one sixth through each face
  const centre = M.scene({ charges: [{ x: 0, y: 0, q: 1e-9 }] });
  const face = M.flux(centre, M.surface({ shape: 'square', x: 0.05, y: 0, angle: 0, size: 0.1 }));
  check('a charge at a cube’s centre: q/6ε₀ through one face', near(face.flux, 1e-9 / EPS0 / 6, 1e-7));
  // through a disc on the axis: (q/2ε₀)(1 − d/√(d² + a²))
  const disc = M.flux(centre, M.surface({ shape: 'disk', x: 0.04, y: 0, angle: 0, size: 0.06 }));
  check('a point charge through a disc on its axis: (q/2ε₀)(1 − d/√(d² + a²))', near(disc.flux, (1e-9 / (2 * EPS0)) * (1 - 0.04 / Math.hypot(0.04, 0.03)), 1e-7));
}
{
  const rodS = M.scene({ rods: [{ x1: -0.2, y1: 0.03, x2: 0.15, y2: -0.02, Q: 3e-9 }] });
  for (const shape of ['sphere', 'cube', 'cylinder', 'lumpy']) gauss(rodS, { shape, x: 0.02, y: 0, r: 0.1 }, 2e-4, `a rod poking through a ${shape}`);
  const lineS = M.scene({ lines: [{ x: 0.02, y: 0.01, lambda: 2e-9 }, { x: 0.3, y: 0.1, lambda: -1e-9 }] });
  gauss(lineS, { shape: 'cylinder', x: 0, y: 0, r: 0.05, depth: 0.2 }, 1e-7, 'a line charge through a cylinder: λL/ε₀');
  gauss(lineS, { shape: 'box', x: 0.1, y: 0.02, w: 0.5, h: 0.3, depth: 0.1 }, 1e-7, 'two line charges through a box');
  const sheetS = M.scene({ sheets: [{ x: 0, y: 0, angle: 90, sigma: 2e-9 }, { x: 0.2, y: 0.05, angle: 60, sigma: -1e-9, width: 0.1 }] });
  gauss(sheetS, { shape: 'box', x: 0, y: 0, w: 0.04, h: 0.1, depth: 0.1 }, 1e-7, 'a pillbox through a sheet: σA/ε₀');
  gauss(sheetS, { shape: 'cylinder', x: 0.02, y: 0.03, r: 0.06, depth: 0.08 }, 1e-7, 'a cylinder cut by a sheet');
  gauss(sheetS, { shape: 'box', x: 0.17, y: 0.0, w: 0.25, h: 0.25, depth: 0.05, angle: 15 }, 1e-7, 'a tilted box cut by a sheet and a strip');
  const ballS = M.scene({ balls: [{ x: 0, y: 0, R: 0.1, Q: 5e-9 }, { x: 0.3, y: 0, R: 0.05, Q: -2e-9, shell: true }] });
  gauss(ballS, { shape: 'sphere', x: 0, y: 0, r: 0.05 }, 1e-7, 'inside a charged ball: Q(r/R)³');
  gauss(ballS, { shape: 'sphere', x: 0.07, y: 0.02, r: 0.08 }, 1e-7, 'a sphere cutting a ball off-centre (lens volume)');
  gauss(ballS, { shape: 'sphere', x: 0.3, y: 0.02, r: 0.04 }, 1e-7, 'a sphere cutting a charged shell');
  gauss(ballS, { shape: 'cube', x: 0.05, y: 0.0, r: 0.07 }, 3e-3, 'a cube cutting a ball (charge counted numerically)');
  gauss(M.scene({ uniform: [800, -300] }), { shape: 'lumpy', x: 0, y: 0, r: 0.1, angle: 20 }, 1e-7, 'a uniform field through a closed surface: zero');
  // the conductor
  const cond = M.scene({ conductor: { x: 0, y: 0, R: 0.12, a: 0.07, Q: 2e-9 }, charges: [{ x: 0.03, y: 0.02, q: -3e-9 }, { x: 0.3, y: 0.1, q: 1e-9 }] });
  const inMetal = gauss(cond, { shape: 'sphere', x: 0, y: 0, r: 0.095 }, 1e-7, 'a sphere inside the metal of a hollow conductor');
  check('inside the metal: no flux and no net charge enclosed (the cavity wall holds −q)', Math.abs(inMetal.f.flux) < 1e-9 && Math.abs(inMetal.Qe) < 1e-18);
  gauss(cond, { shape: 'sphere', x: 0, y: 0, r: 0.2 }, 1e-7, 'a sphere around the whole conductor: Q + q');
  gauss(cond, { shape: 'cube', x: 0.01, y: 0.0, r: 0.035 }, 1e-7, 'a cube in the cavity');
  gauss(cond, { shape: 'sphere', x: 0.05, y: 0.0, r: 0.06 }, 2e-2, 'a sphere cutting the cavity wall (an approximate count)');
}
check('lens volume: disjoint, nested and partial', M.lensVolume(1, 1, 3) === 0 && near(M.lensVolume(2, 1, 0.5), (4 / 3) * Math.PI, 1e-12) && near(M.lensVolume(1, 1, 1), (5 / 12) * Math.PI, 1e-12));

// open patches in a uniform field: Φ = EA cos θ
{
  const S = M.scene({ uniform: [1200, 0] });
  for (const deg of [0, 30, 60, 90, 150]) {
    const f = M.flux(S, M.surface({ shape: 'square', x: 0.1, y: 0.1, angle: deg, size: 0.2 })).flux;
    check(`open square at ${deg}°: Φ = EA cos θ`, near(f, 1200 * 0.04 * Math.cos((deg * Math.PI) / 180), 1e-9, 1e-9));
  }
}

// ─── field lines ──────────────────────────────────────────────────────────
const box = { x0: -0.5, x1: 0.5, y0: -0.32, y1: 0.32 };
const tangent = (S, lines) => {
  let worst = 0;
  for (const l of lines) for (let k = 2; k + 2 < l.pts.length; k += 7) {
    const [x0, y0] = l.pts[k - 1], [x1, y1] = l.pts[k + 1], E = M.field(S, l.pts[k][0], l.pts[k][1]);
    const c = ((x1 - x0) * E[0] + (y1 - y0) * E[1]) / (Math.hypot(x1 - x0, y1 - y0) * Math.hypot(E[0], E[1]));
    if (Number.isFinite(c)) worst = Math.max(worst, 1 - c);
  }
  return worst;
};
{
  const S = M.scene({ charges: [{ x: 0, y: 0, q: 1e-9 }] }), L = M.fieldLines(S, box, { n: 12 });
  check('one charge: 12 lines, all leaving the picture', L.length === 12 && L.every((l) => l.to === 'out'), `${L.length} lines, ends ${[...new Set(L.map((l) => l.to))]}`);
  check('one charge: the lines run along E, away from it', tangent(S, L) < 1e-4);
  const D = M.scene({ charges: [{ x: -0.1, y: 0, q: 1e-9 }, { x: 0.1, y: 0, q: -1e-9 }] }), LD = M.fieldLines(D, box, { n: 12 });
  const fromPlus = LD.filter((l) => l.from === 'charge:0').length, toMinus = LD.filter((l) => l.to === 'charge:1').length;
  check('dipole: 12 lines leave + and 12 end on −', fromPlus === 12 && toMinus === 12, `${fromPlus} from +, ${toMinus} to −`);
  check('dipole: every line runs along E', tangent(D, LD) < 1e-4);
  const U = M.scene({ charges: [{ x: -0.1, y: 0, q: 2e-9 }, { x: 0.1, y: 0, q: -1e-9 }] }), LU = M.fieldLines(U, box, { n: 12 });
  const plusU = LU.filter((l) => l.from === 'charge:0').length, minusU = LU.filter((l) => l.to === 'charge:1').length;
  check('+2q and −q: 12 lines leave +2q, 6 end on −q, the rest leave the picture', plusU === 12 && minusU === 6, `${plusU}, ${minusU}`);
  const cap = M.scene({ sheets: [{ x: -0.05, y: 0, angle: 90, sigma: 1e-9, width: 0.3 }, { x: 0.05, y: 0, angle: 90, sigma: -1e-9, width: 0.3 }] });
  const LC = M.fieldLines(cap, box, { n: 12 });
  const across = LC.filter((l) => l.from === 'sheet:0' && l.to === 'sheet:1').length;
  check('plates: most lines run from the + plate to the − plate', across >= 8 && across >= 0.6 * LC.length, `${across} of ${LC.length}`);
  const uni = M.scene({ uniform: [0, -100] }), LUn = M.fieldLines(uni, box, { n: 12 });
  const straight = LUn.every((l) => l.pts.every(([x]) => Math.abs(x - l.pts[0][0]) < 1e-9));
  check('uniform field: 12 straight, parallel lines', LUn.length === 12 && straight);
  const sh = M.scene({ conductor: { x: 0, y: 0, R: 0.15, a: 0.09, Q: 0 }, charges: [{ x: 0.03, y: 0.02, q: 2e-9 }] });
  const LS = M.fieldLines(sh, box, { n: 12 });
  const toWall = LS.filter((l) => l.from === 'charge:0' && l.to === 'cond-in').length, fromOuter = LS.filter((l) => l.from === 'cond-out').length;
  check('hollow conductor: the charge’s lines end on the cavity wall; as many leave the outer surface', toWall === 12 && fromOuter === 12, `${toWall}, ${fromOuter}`);
  check('hollow conductor: no line crosses the metal', LS.every((l) => l.pts.every(([x, y]) => M.region(sh, x * (1 - 1e-9), y * (1 - 1e-9)) !== 'metal' || true)) && LS.every((l) => l.pts.slice(1, -1).every(([x, y]) => M.region(sh, x, y) !== 'metal')));
  const sp = M.scene({ conductor: { x: 0, y: 0, R: 0.08, Q: 0 }, uniform: [600, 0] });
  const LP = M.fieldLines(sp, box, { n: 12 });
  check('sphere in a field: lines end on its − side and start on its + side', LP.some((l) => l.to === 'cond-out') && LP.some((l) => l.from === 'cond-out'));
  const ends = LP.filter((l) => l.to === 'cond-out').map((l) => l.pts[l.pts.length - 1]), starts = LP.filter((l) => l.from === 'cond-out').map((l) => l.pts[0]);
  check('sphere in a field: they meet the surface on the correct sides', ends.every(([x]) => x < 0) && starts.every(([x]) => x > 0));
  const rodL = M.fieldLines(M.scene({ rods: [{ x1: -0.15, y1: 0, x2: 0.15, y2: 0, Q: 2e-9 }] }), box, { n: 12 });
  check('a charged rod sends out 12 lines', rodL.length === 12, String(rodL.length));
}

// ─── equipotentials ───────────────────────────────────────────────────────
{
  const q = 1e-9, S = M.scene({ charges: [{ x: 0, y: 0, q }] }), grid = M.potentialGrid(S, box, 200, 128);
  const V0 = 60, segs = M.contour(grid, V0), r0 = (K * q) / V0;
  const radii = segs.flatMap(([x0, y0, x1, y1]) => [Math.hypot(x0, y0), Math.hypot(x1, y1)]);
  check('point charge: the 60 V equipotential is a circle of radius kq/V', segs.length > 30 && radii.every((r) => Math.abs(r - r0) < 0.01 * r0), `r0 = ${r0}, range ${Math.min(...radii)}–${Math.max(...radii)}`);
  const step = M.niceStep(grid);
  check('a tidy equipotential step', [1, 2, 2.5, 5].some((m) => near(step / 10 ** Math.floor(Math.log10(step)), m, 1e-9)), String(step));
  // two plates: V is constant beyond each, and a level equal to that constant must not trace rounding noise
  const sig = 1e-7, P = M.scene({ sheets: [{ x: -0.04, y: 0, angle: 90, sigma: sig }, { x: 0.04, y: 0, angle: 90, sigma: -sig }], ref: [0.04, 0] });
  const pg = M.potentialGrid(P, box, 160, 100), Vp = (sig / M.EPS0) * 0.08;
  const zero = M.contour(pg, 0), top = M.contour(pg, Vp), mid = M.contour(pg, Vp / 2);
  check('plates: no contour of noise where V is constant at the level', zero.length === 0 && top.every(([x0, , x1]) => Math.abs(x0 + 0.04) < 0.007 && Math.abs(x1 + 0.04) < 0.007), `${zero.length} segments at 0 V; ${top.length} at the + plate`);
  check('plates: the halfway equipotential is the midplane', mid.length > 10 && mid.every(([x0, , x1]) => Math.abs(x0) < 1e-6 && Math.abs(x1) < 1e-6));
}

// ─── a charged particle ───────────────────────────────────────────────────
{
  const E0 = 2e4, S = M.scene({ uniform: [0, -E0] });
  const e = M.PARTICLES.electron, T = 1e-9;
  const tr = M.trajectory(S, { x: 0, y: 0, vx: 2e7, vy: 0, q: e.q, m: e.m }, { tmax: T, box: { x0: -1, x1: 1, y0: -1, y1: 1 } });
  const [x, y] = tr.pts[tr.pts.length - 1], a = (-e.q * E0) / e.m;
  check('electron in a uniform field: a parabola, x = v₀t, y = ½at²', tr.end === 'time' && near(x, 2e7 * T, 1e-9) && near(y, 0.5 * a * T * T, 1e-9), `${x}, ${y} vs ${0.5 * a * T * T}`);
  const D = M.scene({ charges: [{ x: -0.05, y: 0, q: 2e-9 }, { x: 0.05, y: 0, q: -2e-9 }] }), p = M.PARTICLES.proton;
  const t2 = M.trajectory(D, { x: -0.03, y: 0.03, vx: 0, vy: 0, q: p.q, m: p.m }, { box });
  const W = (k) => 0.5 * p.m * (t2.v[k][0] ** 2 + t2.v[k][1] ** 2) + p.q * M.potential(D, ...t2.pts[k]);
  let drift = 0;
  for (let k = 0; k < t2.pts.length; k += 10) drift = Math.max(drift, Math.abs(W(k) - W(0)));
  check('proton released near a dipole: K + qV stays constant', drift < 1e-6 * Math.abs(p.q * M.potential(D, -0.03, 0.03)), drift.toExponential(2));
  // it starts along the field line through its starting point, then leaves it
  const fl = M.lineThrough(D, -0.03, 0.03, box);
  const segDist = (P, A, B) => { const dx = B[0] - A[0], dy = B[1] - A[1], u = Math.max(0, Math.min(1, ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(P[0] - A[0] - u * dx, P[1] - A[1] - u * dy); };
  const off = (P) => Math.min(...fl.slice(1).map((B, k) => segDist(P, fl[k], B)));
  const early = off(t2.pts[Math.min(5, t2.pts.length - 1)]), later = Math.max(...t2.pts.map(off));
  check('proton released from rest: it starts along the field line, then leaves it', early < 1e-4 && later > 0.01, `${early}, ${later}`);
  const xe = M.PARTICLES.xenon, grids = M.scene({ sheets: [{ x: 0, y: 0, angle: 90, sigma: 1e-6, width: 100 }, { x: 0.001, y: 0, angle: 90, sigma: -1e-6, width: 100 }] });
  const t3 = M.trajectory(grids, { x: 1e-6, y: 0, vx: 0, vy: 0, q: xe.q, m: xe.m }, { box: { x0: -0.002, x1: 0.0012, y0: -0.001, y1: 0.001 } });
  const dV = M.potential(grids, 1e-6, 0) - M.potential(grids, ...t3.pts[t3.pts.length - 1]);
  const vEnd = Math.hypot(...t3.v[t3.v.length - 1]);
  check('a xenon ion falling through ΔV: ½mv² = qΔV', t3.end === 'hit' && near(0.5 * xe.m * vEnd * vEnd, xe.q * dV, 1e-6), `${0.5 * xe.m * vEnd * vEnd} vs ${xe.q * dV}`);
}

// ─── the simulation's parameter checks ────────────────────────────────────
{
  check('sim defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
  const ok = { ...defaults, charges: [{ x: 0, y: 0, q: 'Q' }], sliders: [{ key: 'Q', label: 'Charge', min: -5, max: 5, step: 1, value: 2 }] };
  check('a charge set by a slider validates', validate(ok).length === 0, validate(ok).join('; '));
  check('an unknown slider key is caught', validate({ ...defaults, charges: [{ x: 0, y: 0, q: 'Qx' }] }).length > 0);
  check('a conductor with a rod is caught', validate({ ...defaults, conductor: { x: 0, y: 0, R: 1 }, rods: [{ x1: 2, y1: 0, x2: 3, y2: 0, Q: 1 }] }).length > 0);
  check('a sphere around a line charge is caught', validate({ ...defaults, charges: [], lines: [{ x: 0, y: 0, lambda: 1 }], gauss: { shape: 'sphere', x: 0, y: 0, r: 1 } }).length > 0);
  check('an unknown readout is caught', validate({ ...defaults, readouts: ['E', 'nonsense'] }).length > 0);
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
