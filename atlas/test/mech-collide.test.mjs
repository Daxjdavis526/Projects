// The DOM-free model behind the collision simulation (sims/mech-collide.js):
// momentum is conserved in every collision and separation, kinetic energy only
// in elastic ones, and the classic results come out exactly.
//   node atlas/test/mech-collide.test.mjs

import * as C from '../src/viz/model/mech-collide.js';
import { validate } from '../src/viz/sims/mech-collide.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ─── 1D: momentum always, energy only when e = 1 ───────────────────────────
for (const [m1, m2] of [[1, 1], [2, 1], [1, 3], [0.2, 9], [1200, 1800]]) for (const [u1, u2] of [[3, 0], [4, -1], [20, 10], [-1, -5]]) for (const e of [0, 0.3, 0.75, 1]) {
  const r = C.collide1d({ m1, m2, u1, u2, e });
  const tag = `1D m=${m1}/${m2} u=${u1}/${u2} e=${e}`;
  check(`${tag}: they collide`, r.hit);
  check(`${tag}: momentum conserved`, near(m1 * r.v1 + m2 * r.v2, m1 * u1 + m2 * u2, 1e-12));
  check(`${tag}: restitution reproduced`, near(C.restitution(u1, u2, r.v1, r.v2), e, 1e-9));
  check(`${tag}: energy lost = ½μ(1 − e²)(Δu)²`, near(r.lost, 0.5 * r.mu * (1 - e * e) * (u1 - u2) ** 2, 1e-9));
  check(`${tag}: no energy is created`, r.lost >= -1e-9);
}
{
  const r = C.collide1d({ m1: 2, m2: 1, u1: 3, u2: 0, e: 1 });
  check('elastic, target at rest: v1 = (m1 − m2)u/(m1 + m2) = 1 m/s', near(r.v1, 1));
  check('elastic, target at rest: v2 = 2m1 u/(m1 + m2) = 4 m/s', near(r.v2, 4));
  const s = C.collide1d({ m1: 1, m2: 1, u1: 5, u2: 0, e: 1 });
  check('equal masses, elastic: they swap velocities', near(s.v1, 0) && near(s.v2, 5));
  const k = C.collide1d({ m1: 1200, m2: 1800, u1: 20, u2: 10, e: 0 });
  check('perfectly inelastic: common velocity 14 m/s', near(k.v1, 14) && near(k.v2, 14));
  check('perfectly inelastic: 36 kJ lost', near(k.lost, 36000));
  const n = C.collide1d({ m1: 1, m2: 12, u1: 1, u2: 0, e: 1 });
  check('neutron off carbon-12: keeps (11/13)² of its energy', near(n.K1 - 0.5 * 12 * n.v2 ** 2, (11 / 13) ** 2 * 0.5, 1e-12));
  const miss = C.collide1d({ m1: 1, m2: 1, u1: 1, u2: 2, e: 1 });
  check('1 slower than 2: no collision, nothing changes', !miss.hit && miss.v1 === 1 && miss.v2 === 2);
}

// ─── separations ───────────────────────────────────────────────────────────
for (const [m1, m2, u, E] of [[80, 2, 0, 36], [3, 1, 0, 6], [5, 5, 2, 10], [1000, 250, 7, 50]]) {
  const r = C.explode1d({ m1, m2, u, E });
  const tag = `explode m=${m1}/${m2} u=${u} E=${E}`;
  check(`${tag}: momentum conserved`, near(m1 * r.v1 + m2 * r.v2, (m1 + m2) * u, 1e-12));
  check(`${tag}: kinetic energy rises by E`, near(r.K1 - r.K0, E, 1e-9));
  check(`${tag}: body 1 goes left of body 2`, r.v1 < r.v2);
}
{
  const r = C.explode1d({ m1: 80, m2: 2, E: 36 });
  check('astronaut throws a bag: speeds in inverse ratio to mass', near(-r.v1 / r.v2, 2 / 80));
}

// ─── 2D: smooth discs ──────────────────────────────────────────────────────
for (const [m1, m2] of [[1, 1], [2, 1], [1, 3]]) for (const b of [0, 0.2, 0.5, -0.7, 0.95]) for (const e of [0, 0.5, 1]) for (const u2 of [[0, 0], [0, 1.5], [-1, 0.5]]) {
  const u1 = [3, 0.4];
  const r = C.collide2d({ m1, m2, u1, u2, b, e });
  const tag = `2D m=${m1}/${m2} b=${b} e=${e} u2=${u2}`;
  check(`${tag}: hit`, r.hit);
  check(`${tag}: x-momentum conserved`, near(m1 * r.v1[0] + m2 * r.v2[0], m1 * u1[0] + m2 * u2[0], 1e-12));
  check(`${tag}: y-momentum conserved`, near(m1 * r.v1[1] + m2 * r.v2[1], m1 * u1[1] + m2 * u2[1], 1e-12));
  check(`${tag}: no energy created`, r.lost >= -1e-9);
  if (e === 1) check(`${tag}: elastic keeps the energy`, near(r.K1, r.K0, 1e-9));
  // the impulse is along the normal: each body's velocity changes only along n
  const d1 = [r.v1[0] - u1[0], r.v1[1] - u1[1]];
  check(`${tag}: impulse along the line of centres`, Math.abs(d1[0] * r.n[1] - d1[1] * r.n[0]) < 1e-9);
  check(`${tag}: discs just touch at contact`, near(C.norm(r.rel), 1));
}
for (const b of [0.1, 0.3, 0.5, 0.8]) {
  const r = C.collide2d({ m1: 1, m2: 1, u1: [2, 0], b, e: 1 });
  check(`equal masses, elastic, b = ${b}: paths at 90°`, near(C.angleBetween(r.v1, r.v2), 90, 1e-9));
  check(`b = ${b}: sin of the target's angle is b`, near(Math.abs(Math.atan2(r.v2[1], r.v2[0])), Math.asin(b), 1e-9));
}
{
  const r = C.collide2d({ m1: 1.4, m2: 2.2, u1: [18, 0], u2: [0, 14], stick: true, b: 0.3 });
  check('2D stick: both move with the centre-of-mass velocity', near(r.v1[0], 25.2 / 3.6) && near(r.v2[1], 30.8 / 3.6));
  const m = C.collide2d({ m1: 1, m2: 1, u1: [1, 0], b: 1.2 });
  check('|b| ≥ 1 is a miss', !m.hit);
}

// ─── timelines: the bodies never overlap before contact, and the centre of mass moves uniformly ──
for (const spec of [{ m1: 2, m2: 1, u1: 3, u2: 0, e: 0.6 }, { m1: 1, m2: 3, u1: 4, u2: -1, e: 1 }, { m1: 5, m2: 1, u1: 1, u2: 0.2, e: 0 }, { mode: 'explode', m1: 80, m2: 2, u: 0, E: 36 }, { mode: 'explode', m1: 3, m2: 1, u: 1.5, E: 6 }]) {
  const w = { w1: 0.8, w2: 0.6 };
  const T = C.timeline1d(spec, w);
  const tag = `timeline1d ${JSON.stringify(spec)}`;
  let ok = true, cmOk = true;
  const M = spec.m1 + spec.m2, cm = (s) => (spec.m1 * s.x[0] + spec.m2 * s.x[1]) / M, cm0 = cm(T.at(0));
  for (let k = 0; k <= 200; k++) {
    const t = (k / 200) * T.T, s = T.at(t);
    if (s.x[1] - s.x[0] < (w.w1 + w.w2) / 2 - 1e-9) ok = false;
    if (!near(cm(s), cm0 + T.vcm * t, 1e-9)) cmOk = false;
  }
  check(`${tag}: no overlap`, ok);
  check(`${tag}: centre of mass moves uniformly`, cmOk);
  check(`${tag}: contact at x = 0 at tc`, near(T.at(T.tc).x[0] + w.w1 / 2, 0, 1e-9) && near(T.at(T.tc).x[1] - w.w2 / 2, 0, 1e-9));
}
for (const spec of [{ m1: 2, m2: 1, u1: [3, 0], b: 0.5, e: 1 }, { m1: 1.4, m2: 2.2, u1: [2, 0], u2: [0, 1.6], b: 0, stick: true }, { m1: 1, m2: 1, u1: [3, 0], b: -0.4, e: 0.5 }]) {
  const T = C.timeline2d({ r1: 0.5, r2: 0.5, ...spec });
  const tag = `timeline2d ${JSON.stringify(spec)}`;
  let ok = true;
  for (let k = 0; k <= 400; k++) {
    const t = (k / 400) * T.tc, s = T.at(t);
    if (C.norm([s.p[0][0] - s.p[1][0], s.p[0][1] - s.p[1][1]]) < 1 - 1e-9) ok = false;
  }
  check(`${tag}: no overlap before contact`, ok);
  const s = T.at(T.tc);
  check(`${tag}: touching at contact`, near(C.norm([s.p[0][0] - s.p[1][0], s.p[0][1] - s.p[1][1]]), 1, 1e-9));
}

// ─── the simulation's parameter check ──────────────────────────────────────
check('validate: defaults are fine', validate({}).length === 0, validate({}).join('; '));
check('validate: the usual sliders are fine', validate({ sliders: true }).length === 0 && validate({ dim: 2, sliders: true }).length === 0);
check('validate: an after that breaks momentum is caught', validate({ m1: 2, m2: 1, u1: 3, u2: 0, after: [1, 3] }).length === 1);
check('validate: an after with extra energy is caught', validate({ m1: 1, m2: 1, u1: 2, u2: 0, after: [-1, 3] }).length === 1);
check('validate: a consistent after passes', validate({ m1: 2, m2: 1, u1: 3, u2: 0, after: [1, 4] }).length === 0);
check('validate: an unknown slider is caught', validate({ sliders: ['mass'] }).length === 1);
check('validate: a slider value outside its range is caught', validate({ m1: 50, sliders: ['m1'] }).length === 1);
check('validate: e outside [0, 1] is caught', validate({ e: 1.2 }).length === 1);
check('validate: a 2D miss is not a collision', validate({ dim: 2, b: 1 }).length === 1);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
