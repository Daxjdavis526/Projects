// The space-curve geometry behind the c3-curve simulation — derivatives,
// Frenet frame, curvature, torsion, the acceleration split, arc length, the
// osculating circle, and the gravity-turn ascent — checked headlessly against
// closed forms.
//   node atlas/test/c3-curve.test.mjs

import * as M from '../src/viz/model/c3-curve.js';
import { validate, defaults } from '../src/viz/sims/c3-curve.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const nearV = (a, b, tol) => a.every((v, k) => near(v, b[k], tol));

// a helix r = ⟨a cos t, a sin t, b t⟩: speed √(a²+b²), κ = a/(a²+b²), τ = b/(a²+b²)
{
  const a = 3, b = 4, c2 = a * a + b * b, r = (t) => [a * Math.cos(t), a * Math.sin(t), b * t];
  for (const t of [0.3, 1.7, 4.0]) {
    const d = M.derivatives(r, t, 1e-3), F = M.frame(d.d1, d.d2, d.d3);
    check(`helix speed at t = ${t}`, near(F.speed, 5, 1e-6), F.speed);
    check(`helix curvature a/(a²+b²) at t = ${t}`, near(F.kappa, a / c2, 1e-6), F.kappa);
    check(`helix torsion b/(a²+b²) at t = ${t}`, near(F.tau, b / c2, 1e-4), F.tau);
    check(`helix N points at the axis at t = ${t}`, nearV(F.N, [-Math.cos(t), -Math.sin(t), 0], 1e-6));
    check(`helix B = T × N at t = ${t}`, nearV(F.B, M.cross(F.T, F.N), 1e-9) && nearV(F.B, [b * Math.sin(t) / 5, -b * Math.cos(t) / 5, a / 5], 1e-6));
    check(`uniform speed: a_T = 0, a_N = κv² at t = ${t}`, near(F.aT, 0, 1e-6) && near(F.aN, F.kappa * F.speed ** 2, 1e-6));
  }
  const tab = M.arcLengthTable(r, 0, 2 * Math.PI, 400);
  check('helix: one turn is 2π√(a²+b²) long', near(M.arcLengthAt(tab, 2 * Math.PI), 10 * Math.PI, 1e-6), M.arcLengthAt(tab, 2 * Math.PI));
  check('helix: arc length grows linearly', near(M.arcLengthAt(tab, 1.234), 5 * 1.234, 1e-4));
  const d = M.derivatives(r, 1, 1e-3), F = M.frame(d.d1, d.d2, d.d3), O = M.osculatingCircle(d.p, F);
  check('osculating circle radius is 1/κ = (a²+b²)/a', near(O.radius, c2 / a, 1e-5));
  check('osculating circle passes through the point', O.pts.some((p) => M.len(M.sub(p, d.p)) < 1e-9));
  check('osculating circle centre lies on the far side of the axis', near(Math.hypot(O.centre[0], O.centre[1]), c2 / a - a, 1e-5));
}

// a circle of radius 2 traversed at speed 6: κ = 1/2, τ = 0, a_N = v²/R
{
  const r = (t) => [2 * Math.cos(3 * t), 2 * Math.sin(3 * t), 1];
  const d = M.derivatives(r, 0.4, 1e-4), F = M.frame(d.d1, d.d2, d.d3);
  check('circle: κ = 1/R', near(F.kappa, 0.5, 1e-6));
  check('circle: no torsion', near(F.tau, 0, 1e-4), F.tau);
  check('circle: a_N = v²/R', near(F.aN, 36 / 2, 1e-5) && near(F.aT, 0, 1e-6));
}

// a projectile: at the top a_T = 0 and a_N = g; on the way up a_T = −g sin γ
{
  const g = 9.81, u = 30, w = 40, r = (t) => [u * t, 0, w * t - (g * t * t) / 2];
  const top = w / g, d = M.derivatives(r, top, 1e-3), F = M.frame(d.d1, d.d2);
  check('projectile at the top: a_T = 0', near(F.aT, 0, 1e-5));
  check('projectile at the top: a_N = g', near(F.aN, g, 1e-5));
  check('projectile at the top: radius of curvature u²/g', near(1 / F.kappa, (u * u) / g, 1e-3));
  const d0 = M.derivatives(r, 0, 1e-3), F0 = M.frame(d0.d1, d0.d2);
  check('projectile at launch: a_T = −g sin γ, a_N = g cos γ', near(F0.aT, -g * 0.8, 1e-5) && near(F0.aN, g * 0.6, 1e-5));
}

// a straight line has no curvature and no normal
{
  const r = (t) => [1 + 2 * t, -t, 3 * t * t * 0];
  const d = M.derivatives(r, 0.5, 1e-3), F = M.frame(d.d1, d.d2, d.d3, d.noise);
  check('a straight line: κ = 0 and N is null', F.kappa === 0 && F.N === null);
}

// the gravity-turn ascent
{
  const S = M.gravityTurn();
  const last = S[S.length - 1];
  check('ascent runs to burnout at 160 s', near(last.t, 160, 1e-6));
  check('ascent: plausible burnout state (about 2 km/s, 80–90 km up, 30–35° above the horizon)', near(M.len(last.v), 2.06, 0.05) && near(last.r[2], 85.7, 2) && near((last.gamma * 180) / Math.PI, 32.6, 1));
  check('ascent: vertical until the kick', S.filter((s) => s.t < 12).every((s) => Math.abs(s.r[0]) < 1e-9));
  // with thrust along v, the whole normal acceleration is gravity's normal part g cos γ
  let worst = 0;
  for (const s of S.filter((q) => q.t > 13)) { const F = M.frame(s.v, s.a); worst = Math.max(worst, Math.abs(F.aN - 9.81e-3 * Math.cos(s.gamma))); }
  check('ascent: a_N = g cos γ throughout the gravity turn', worst < 1e-12, worst);
  // the samples are consistent: integrating v reproduces r
  let x = 0, z = 0;
  for (let k = 1; k < S.length; k++) { const h = S[k].t - S[k - 1].t; x += (h / 2) * (S[k].v[0] + S[k - 1].v[0]); z += (h / 2) * (S[k].v[2] + S[k - 1].v[2]); }
  check('ascent: velocity integrates to position', near(x, last.r[0], 0.05) && near(z, last.r[2], 0.05), `${x} vs ${last.r[0]}, ${z} vs ${last.r[2]}`);
  const mid = M.sampleAt(S, 100.25), A = S.find((s) => Math.abs(s.t - 100) < 1e-9), B = S.find((s) => Math.abs(s.t - 100.5) < 1e-9);
  check('ascent: interpolation lies between neighbouring samples', mid.r[0] > A.r[0] && mid.r[0] < B.r[0] && mid.r[2] > A.r[2] && mid.r[2] < B.r[2]);
}

// the validator
{
  const good = { ...defaults, curve: { param: ['a*cos(t)', 'a*sin(t)', 'b*t'], t: [0, 'tmax'] }, sliders: [{ key: 'a', label: 'a', min: 1, max: 3, value: 2 }, { key: 'b', label: 'b', min: 0, max: 1, value: 0.5 }], constants: { tmax: 12 } };
  check('a good spec passes', validate(good).length === 0, validate(good).join('; '));
  check('a curve with two coordinates is caught', validate({ ...good, curve: { param: ['t', 't'], t: [0, 1] } }).length > 0);
  check('a bad expression is caught', validate({ ...good, curve: { param: ['t', 't*/2', '0'], t: [0, 1] } }).length > 0);
  check('an unknown model is caught', validate({ ...good, curve: { model: 'warp' } }).length > 0);
  check('the gravity-turn model passes', validate({ ...defaults, curve: { model: 'gravity-turn' }, plane: 'xz' }).length === 0);
  check('an unknown readout is caught', validate({ ...good, readouts: ['warp'] }).length > 0);
  check('a start outside the range is caught', validate({ ...good, at: 20 }).length > 0);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
