// The calculus-of-variations models behind cm2-vary, cm2-race and
// cm2-noether (PHYS 3550, modules M3–M4): brachistochrone times against
// their closed forms (cycloid, line, quarter circle, drop), the cycloid
// beating every other wire, the tautochrone's equal times, the functional
// explorer's actions against the exact ΔS = ½α²∫(mη̇² − kη²)dt, the
// stationarity of each true path, and Noether's theorem — each broken
// symmetry spoils exactly its own conserved quantity.
//   node atlas/test/cm2-var.test.mjs

import * as V from '../src/viz/model/cm2-var.js';
import * as N from '../src/viz/model/cm2-noether.js';
import { ellipK } from '../src/viz/model/numeric.js';
import { validate as vVary, defaults as dVary } from '../src/viz/sims/cm2-vary.js';
import { validate as vRace, defaults as dRace } from '../src/viz/sims/cm2-race.js';
import { validate as vNoe, defaults as dNoe } from '../src/viz/sims/cm2-noether.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b));

// the cycloid through B, and closed-form times
for (const [x1, y1] of [[1, 1], [2, 1], [1, 2], [3, 1], [1, 0.6], [0.5, 1.5]]) {
  const { a, th1 } = V.cycloidThrough(x1, y1);
  check(`cycloid passes through B (${x1}, ${y1})`, close(a * (th1 - Math.sin(th1)), x1, 1e-9) && close(a * (1 - Math.cos(th1)), y1, 1e-9));
  check(`numerical cycloid time = θ₁√(a/g) (${x1}, ${y1})`, close(V.timeOf('cycloid', x1, y1), V.cycloidTime(x1, y1), 1e-5), `${V.timeOf('cycloid', x1, y1)} vs ${V.cycloidTime(x1, y1)}`);
  check(`numerical line time = √(2L²/gy) (${x1}, ${y1})`, close(V.timeOf('line', x1, y1), V.lineTime(x1, y1), 1e-9));
  check(`numerical drop time (${x1}, ${y1})`, close(V.timeOf('drop', x1, y1), V.dropTime(x1, y1), 3e-4));
  const tc = V.cycloidTime(x1, y1);
  for (const k of ['line', 'arc', 'drop']) check(`the cycloid beats the ${k} (${x1}, ${y1})`, V.timeOf(k, x1, y1) > tc);
  for (const p of [0.3, 0.45, 0.6, 0.8, 1, 1.3]) check(`the cycloid beats y ∝ x^${p} (${x1}, ${y1})`, V.timeOf('power', x1, y1, p) > tc * (1 + 1e-6), `${V.timeOf('power', x1, y1, p)} vs ${tc}`);
}
for (const R of [0.5, 1, 2]) check(`quarter circle: K(½)√(R/g), the 90° pendulum's quarter period (R = ${R})`, close(V.timeOf('arc', R, R), ellipK(0.5) * Math.sqrt(R / V.G), 1e-5));
// positions along a travel table: the end at T, monotone in time
{
  const tab = V.travel(V.pathOf('cycloid', 1.5, 1), V.G);
  const [xe, ye] = V.positionAt(tab, tab.T + 1);
  check('a bead sits at B once its time is up', close(xe, 1.5, 1e-9) && close(ye, 1, 1e-9));
  let ok = true, prev = -1;
  for (let t = 0; t < tab.T; t += tab.T / 50) { const x = V.positionAt(tab, t)[0]; if (x < prev - 1e-12) ok = false; prev = x; }
  check('along the cycloid to B the bead only moves forward', ok);
}
// the tautochrone: equal times from any release, and agreement with direct integration
for (const a of [0.3, 1]) {
  const Tb = V.tautoTime(a);
  for (const d of [20, 60, 120, 175]) {
    const th = V.tautoTheta(a, (d * Math.PI) / 180, Tb);
    check(`tautochrone: released at ${d}° reaches the bottom at π√(a/g) (a = ${a})`, Math.abs(th) < 1e-9);
  }
  // energy check on the exact motion: speed from s(t) equals √(2g(y0 − y))
  const th0 = 2.0, w = Math.sqrt(V.G / (4 * a)), t = 0.37 * Tb;
  const sdot = -4 * a * Math.sin(th0 / 2) * w * Math.sin(w * t);
  const th = V.tautoTheta(a, th0, t), y0 = a * (1 - Math.cos(th0)), y = a * (1 - Math.cos(th));
  check(`tautochrone motion conserves energy (a = ${a})`, close(sdot * sdot, 2 * V.G * (y0 - y), 1e-9));
}

// the functional explorer: exact action changes and stationarity
for (const n of [1, 2, 3]) for (const al of [0.4, 1.5, -2.5]) check(`ball: ΔS = mα²n²π²/4T (n = ${n}, α = ${al})`, close(V.F('ball', n, al) - V.F('ball', n, 0), V.ballDS(n, al), 2e-4));
check('ball: S on the true path = −mg²T³/24', close(V.F('ball', 1, 0), V.ballS0(), 1e-5));
for (const T of [0.3, 0.45, 0.6, 0.85]) for (const n of [1, 2, 3]) check(`spring: S = ¼α²T(m(nπ/T)² − k) (T = ${T}, n = ${n})`, close(V.F('spring', n, 0.2, 0, { T }), V.springS(n, 0.2, T), 1e-3));
check('spring over 0.7 s: mode 1 lowers the action, mode 2 raises it (a saddle)', V.F('spring', 1, 0.2, 0, { T: 0.7 }) < 0 && V.F('spring', 2, 0.2, 0, { T: 0.7 }) > 0);
check('spring over 0.3 s: every mode raises the action (a minimum)', [1, 2, 3].every((n) => V.F('spring', n, 0.2, 0, { T: 0.3 }) > 0));
check('length: the straight line is √1.25 m and every variation is longer', close(V.F('length', 1, 0), Math.hypot(1, 0.5), 1e-9) && [1, 2, 3].every((n) => V.F('length', n, 0.05) > V.F('length', n, 0)));
check('brach preset: the true path is the cycloid, time matches θ₁√(a/g)', close(V.F('brach', 1, 0), V.cycloidTime(1, 0.6), 2e-4));
for (const key of ['length', 'brach', 'ball', 'spring']) for (const n of [1, 2, 3]) {
  const h = 1e-3 * V.PRESETS[key].amax, d = (V.F(key, n, h) - V.F(key, n, -h)) / (2 * h), scale = Math.abs(V.F(key, n, V.PRESETS[key].amax) - V.F(key, n, 0)) / V.PRESETS[key].amax;
  check(`${key}: dF/dα = 0 at the true path (n = ${n})`, Math.abs(d) < 1e-3 * scale, `${d} vs scale ${scale}`);
}
// off the true path the first variation is not zero
for (const key of ['length', 'brach', 'ball']) {
  const b = V.PRESETS[key].amax / 3, h = 1e-3 * V.PRESETS[key].amax;
  const d = (V.F(key, 1, h, b) - V.F(key, 1, -h, b)) / (2 * h);
  check(`${key}: dF/dα ≠ 0 along mode 1 from a wrong base path`, Math.abs(d) > 1e-3);
}

// Noether: each broken symmetry spoils exactly its own conserved quantity
const spread = (a) => (Math.max(...a) - Math.min(...a)) / Math.abs(a[0]);
for (const kind of N.KINDS) {
  const r0 = N.run(kind, 0, { T: 15, steps: 3000 });
  for (const q of ['E', 'L', 'px']) {
    const conserved = kind === 'rotation' ? ['E', 'L'] : kind === 'translation' ? ['E', 'px'] : ['E', 'L'];
    if (conserved.includes(q)) check(`${kind}, ε = 0: ${q} conserved`, spread(r0.q[q]) < 1e-7, String(spread(r0.q[q])));
  }
  const eps = { rotation: 0.5, translation: 0.2, time: 0.2 }[kind];
  const r = N.run(kind, eps, { T: 15, steps: 3000 }), own = N.PROTECTS[kind];
  check(`${kind}, ε = ${eps}: ${own} is no longer conserved`, spread(r.q[own]) > 0.05, String(spread(r.q[own])));
  const kept = kind === 'time' ? 'L' : 'E';
  check(`${kind}, ε = ${eps}: ${kept} still is`, spread(r.q[kept]) < 1e-7, String(spread(r.q[kept])));
}
{
  const r = N.run('translation', 0.2, { T: 5, steps: 2000 });
  check('tilted valley: pₓ falls linearly, pₓ = 1 − εt', Math.abs(r.q.px[r.q.px.length - 1] - (1 - 0.2 * 5)) < 1e-9);
}

// the simulations' parameter validators
check('cm2-vary defaults validate', vVary(dVary).length === 0, vVary(dVary).join('; '));
check('cm2-vary rejects an unknown preset', vVary({ ...dVary, preset: 'nope' }).length > 0);
check('cm2-vary rejects α beyond its range', vVary({ ...dVary, alpha: 5 }).length > 0);
check('cm2-race defaults validate', vRace(dRace).length === 0, vRace(dRace).join('; '));
check('cm2-race rejects an unknown curve', vRace({ ...dRace, curves: ['spiral'] }).length > 0);
check('cm2-noether defaults validate', vNoe(dNoe).length === 0, vNoe(dNoe).join('; '));
check('cm2-noether rejects showing a quantity that starts at zero', vNoe({ ...dNoe, show: ['px'] }).length > 0);
check('cm2-noether rejects ε out of range', vNoe({ ...dNoe, kind: 'time', eps: 0.5 }).length > 0);

console.log(`cm2-var: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
