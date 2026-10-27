// The DOM-free model behind the linked motion graphs (sims/mech-graphlink.js):
// one-dimensional motion from x(t), v(t), a(t) or constant-acceleration
// segments, checked against closed-form kinematics.
//   node atlas/test/mech-motion1d.test.mjs

import { motion1d, fromSegments } from '../src/viz/model/mech-motion1d.js';
import { validate } from '../src/viz/sims/mech-graphlink.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ─── constant acceleration: x = 12t − 2t² ─────────────────────────────────
{
  const m = motion1d({ a: () => -4, v0: 12, x0: 0, T: 7 });
  const s3 = m.at(3), s7 = m.at(7), s1 = m.at(1.234);
  check('constant a: at the top x = 18 m, v = 0', near(s3.x, 18) && near(s3.v, 0, 1e-9), `${s3.x}, ${s3.v}`);
  check('constant a: x(7) = −14 m', near(s7.x, -14), String(s7.x));
  check('constant a: between grid nodes too', near(s1.x, 12 * 1.234 - 2 * 1.234 ** 2) && near(s1.v, 12 - 4 * 1.234));
  check('constant a: every node exact', m.t.every((tt, i) => near(m.x[i], 12 * tt - 2 * tt * tt) && near(m.v[i], 12 - 4 * tt)));
  check('constant a: distance to 7 s is 18 + 32 = 50 m', near(m.dist(7), 50, 1e-9), String(m.dist(7)));
  check('constant a: distance to 5 s is 18 + 8 = 26 m', near(m.dist(5), 26, 1e-9), String(m.dist(5)));
  check('constant a: distance to 2 s equals the displacement', near(m.dist(2), 16, 1e-9));
}

// ─── a = 6t from rest: v = 3t², x = t³ ────────────────────────────────────
{
  const m = motion1d({ a: (t) => 6 * t, T: 3 });
  check('a = 6t: x(2) = 8 m, v(2) = 12 m/s', near(m.at(2).x, 8) && near(m.at(2).v, 12));
  check('a = 6t: x(3) = 27 m at the last node', near(m.x[m.x.length - 1], 27));
}

// ─── segments: accelerate, cruise, brake and reverse ──────────────────────
{
  const seg = [{ a: 2, dt: 3 }, { a: 0, dt: 3 }, { a: -3, dt: 4 }];
  const m = motion1d({ segments: seg, T: 10 });
  check('segments: x(3) = 9 m, v(3) = 6 m/s', near(m.at(3).x, 9) && near(m.at(3).v, 6));
  check('segments: x(6) = 27 m', near(m.at(6).x, 27));
  check('segments: turnaround at 8 s, x = 33 m', near(m.at(8).x, 33) && near(m.at(8).v, 0, 1e-9));
  check('segments: x(10) = 27 m, v(10) = −6 m/s', near(m.at(10).x, 27) && near(m.at(10).v, -6));
  check('segments: distance to 10 s is 33 + 6 = 39 m', near(m.dist(10), 39, 1e-9), String(m.dist(10)));
  check('segments: a just after a break is the new value', m.at(6).a === -3 && m.at(3).a === 0);
  const i6 = m.t.findIndex((tt) => Math.abs(tt - 6) < 1e-12);
  check('segments: the grid has a node on each break, with both limits of a', i6 > 0 && m.aLeft[i6] === 0 && m.a[i6] === -3);
  check('segments: the last node keeps the last segment’s a (no drop at t = T)', m.a[m.a.length - 1] === -3);
  const f = fromSegments(seg);
  check('fromSegments: a = 0 after the last segment', f.a(10.5) === 0 && f.end === 10);
}

// ─── a jump at burnout, given as an expression with a break ───────────────
{
  const a = (t) => (t < 4 ? 20 : -9.8);
  const m = motion1d({ a, breaks: [4], T: 10 });
  check('burnout jump: v(4) = 80 m/s, x(4) = 160 m', near(m.at(4).v, 80) && near(m.at(4).x, 160));
  check('burnout jump: v(10) = 21.2 m/s, x(10) = 463.6 m', near(m.at(10).v, 21.2) && near(m.at(10).x, 463.6));
}

// ─── a thrust profile: a = F/(m0 − ṁt) − g during the burn ────────────────
{
  const F = 2500, m0 = 100, md = 4, tb = 10, g = 9.8;
  const a = (t) => (t < tb ? F / (m0 - md * t) : 0) - g;
  const m = motion1d({ a, breaks: [tb], T: 30 });
  const k = md / m0, ub = 1 - k * tb;
  const vb = -(F / md) * Math.log(ub) - g * tb;
  const xb = (F / md) * (ub * Math.log(ub) - ub + 1) / k - 0.5 * g * tb * tb;
  check('thrust profile: burnout speed matches −(F/ṁ) ln(1 − ṁt/m0) − gt', near(m.at(tb).v, vb, 1e-10), `${m.at(tb).v} vs ${vb}`);
  check('thrust profile: burnout altitude matches the closed form', near(m.at(tb).x, xb, 1e-10), `${m.at(tb).x} vs ${xb}`);
  check('thrust profile: coasting afterwards is free fall', near(m.at(20).v, vb - g * 10, 1e-10) && near(m.at(20).x, xb + vb * 10 - 0.5 * g * 100, 1e-10));
}

// ─── given position, and given velocity ───────────────────────────────────
{
  const m = motion1d({ x: (t) => t ** 3 - 9 * t * t + 24 * t, T: 6 });
  check('x given: v(1) = 9 m/s, a(1) = −12 m/s²', near(m.at(1).v, 9, 1e-7) && near(m.at(1).a, -12, 1e-6), `${m.at(1).v}, ${m.at(1).a}`);
  check('x given: distance to 6 s is 20 + 4 + 20 = 44 m', near(m.dist(6), 44, 1e-7), String(m.dist(6)));
  const w = motion1d({ v: (t) => 12 - 4 * t, x0: 2, T: 7 });
  check('v given: x(3) = 2 + 18 = 20 m, a = −4 m/s²', near(w.at(3).x, 20) && near(w.at(3).a, -4, 1e-7));
}

check('motion1d rejects a missing description', (() => { try { motion1d({ T: 1 }); return false; } catch { return true; } })());

// ─── the simulation's parameter check ─────────────────────────────────────
check('sim validate: a good spec passes', validate({ a: '-g', v0: 'v0', x0: 'h', T: 3, constants: { g: 9.8 }, sliders: [{ key: 'v0', label: 'v', min: 0, max: 20, value: 10 }, { key: 'h', label: 'h', min: 0, max: 20, value: 5 }] }).length === 0,
  validate({ a: '-g', v0: 'v0', x0: 'h', T: 3, constants: { g: 9.8 }, sliders: [{ key: 'v0', label: 'v', min: 0, max: 20, value: 10 }, { key: 'h', label: 'h', min: 0, max: 20, value: 5 }] }).join('; '));
check('sim validate: segments pass', validate({ segments: [{ a: 2, dt: 3 }, { a: 'b', dt: 2 }], sliders: [{ key: 'b', label: 'b', min: -3, max: 3, value: -1 }] }).length === 0);
check('sim validate: two descriptions fail', validate({ a: '1', x: 't' }).length > 0);
check('sim validate: a typo fails', validate({ a: '2*q', T: 4 }).length > 0);
check('sim validate: a reserved slider key fails', validate({ a: '1', T: 4, sliders: [{ key: 't', label: 't', min: 0, max: 1, value: 0 }] }).length > 0);
check('sim validate: a singular motion fails', validate({ a: 'sqrt(1 - t)', T: 2 }).length > 0);
check('sim validate: an unknown panel fails', validate({ a: '1', T: 2, panels: ['x', 'j'] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
