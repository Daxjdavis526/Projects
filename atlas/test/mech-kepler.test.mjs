// The Kepler-orbit model behind the mech-kepler simulation: real periods from
// Kepler's third law, vis-viva, conservation of angular momentum and energy,
// equal areas in equal times, Newton's cannon, and the sim's validate().
//   node atlas/test/mech-kepler.test.mjs

import * as K from '../src/viz/model/mech-kepler.js';
import { validate, defaults } from '../src/viz/sims/mech-kepler.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(1e-300, Math.abs(b));

// ─── real periods (Kepler's third law with the measured GM) ────────────────
const P = (k) => K.presetOrbit(k).T;
check('ISS at 420 km: 92.8 min', near(P('iss') / 60, 92.8, 0.002), (P('iss') / 60).toFixed(2));
check('GPS: half a sidereal day, 11 h 58 min', near(P('gps'), 43082, 0.001), P('gps').toFixed(0));
check('geostationary: one sidereal day, 86 164 s', near(P('geo'), 86164.1, 2e-5), P('geo').toFixed(1));
check('the Moon: 27.3 days (with G(M + m))', near(P('moon') / K.DAY, 27.32, 0.003), (P('moon') / K.DAY).toFixed(3));
check('Earth: 365.25 days', near(P('earth') / K.DAY, 365.25, 2e-4), (P('earth') / K.DAY).toFixed(3));
check('Mercury: 87.97 days', near(P('mercury') / K.DAY, 87.969, 3e-4), (P('mercury') / K.DAY).toFixed(3));
check('Halley: 75.3 years', near(P('halley') / K.YEAR, 75.3, 0.002), (P('halley') / K.YEAR).toFixed(2));
check('S2: 16.05 years (by construction)', near(P('s2') / K.YEAR, 16.05, 1e-9));
{
  const s2 = K.presetOrbit('s2');
  check('S2: semi-major axis about 1030 AU', near(s2.a / K.AU, 1035, 0.01), (s2.a / K.AU).toFixed(1));
  check('S2: closest approach about 120 AU', near(s2.rp / K.AU, 119, 0.01), (s2.rp / K.AU).toFixed(1));
  const vp = K.stateAt(s2, 0).v;
  check('S2: speed at pericentre about 7700 km/s (2.6% of c)', near(vp / 1e3, 7760, 0.01), (vp / 1e3).toFixed(0));
}
{
  const gto = K.presetOrbit('gto');
  check('transfer orbit: e ≈ 0.73', near(gto.e, 0.7286, 0.001), gto.e.toFixed(4));
  check('transfer orbit: period about 10.5 h', near(gto.T / 3600, 10.5, 0.01), (gto.T / 3600).toFixed(2));
}

// ─── vis-viva, angular momentum and energy along every preset ─────────────
for (const key of Object.keys(K.PRESETS)) {
  const o = K.presetOrbit(key);
  let ok = true, detail = '';
  for (let i = 0; i < 40; i++) {
    const t = (o.T * i) / 40 + 0.37 * o.T / 40;
    const s = K.stateAt(o, t);
    const vv = K.visViva(o.GM, s.r, o.a), h = s.x * s.vy - s.y * s.vx, E = s.v ** 2 / 2 - o.GM / s.r;
    if (!near(s.v, vv, 1e-9)) { ok = false; detail = `vis-viva at t = ${t}`; break; }
    if (!near(h, o.h, 1e-9)) { ok = false; detail = `h = ${h} vs ${o.h}`; break; }
    if (!near(E, o.energy, 1e-9)) { ok = false; detail = `E = ${E} vs ${o.energy}`; break; }
    if (!near(s.r, K.radiusAt(o, s.nu), 1e-9)) { ok = false; detail = 'r(ν) disagrees with the state'; break; }
    if (Math.abs(K.timeAt(o, (s.nu + 2 * Math.PI) % (2 * Math.PI)) - (t % o.T)) > 1e-6 * o.T) { ok = false; detail = 'timeAt does not invert stateAt'; break; }
  }
  check(`${key}: vis-viva, h and E conserved, t(ν) inverts ν(t)`, ok, detail);
}

// ─── Kepler's second law: equal areas in equal times ───────────────────────
for (const key of ['mercury', 'halley', 's2', 'gto']) {
  const o = K.presetOrbit(key), n = 12;
  const areas = Array.from({ length: n }, (_, k) => K.sweptArea(o, (k * o.T) / n, ((k + 1) * o.T) / n));
  const want = (o.h * o.T) / (2 * n);
  check(`${key}: twelve equal-time sectors have equal areas, h·Δt/2`, areas.every((A) => near(A, want, 1e-4)), areas.map((A) => (A / want).toFixed(5)).join(' '));
  const total = areas.reduce((s, A) => s + A, 0), ellipse = Math.PI * o.a * o.a * Math.sqrt(1 - o.e ** 2);
  check(`${key}: the sectors fill the ellipse, πab`, near(total, ellipse, 1e-4));
}

// ─── Kepler's equation at high eccentricity ────────────────────────────────
for (const e of [0, 0.3, 0.9, 0.967, 0.99]) {
  let worst = 0;
  for (let i = 0; i <= 200; i++) { const M = (i / 200) * 4 * Math.PI - Math.PI; const E = K.solveKepler(M, e); worst = Math.max(worst, Math.abs(E - e * Math.sin(E) - M)); }
  check(`Kepler’s equation solved to 1e-12 at e = ${e}`, worst < 1e-12, worst.toExponential(2));
}

// ─── Newton's cannon: a horizontal launch ──────────────────────────────────
{
  const GM = K.GM_EARTH, r0 = K.R_EARTH + 400e3, vc = K.vCircular(GM, r0), ve = K.vEscape(GM, r0);
  check('circular speed at 400 km is 7.67 km/s', near(vc, 7669, 0.001), vc.toFixed(1));
  check('escape speed at 400 km is 10.85 km/s', near(ve, 10846, 0.001), ve.toFixed(1));
  const circ = K.launchOrbit(GM, r0, vc);
  check('launch at the circular speed: e = 0', circ.e < 1e-12 && circ.kind === 'ellipse');
  const par = K.launchOrbit(GM, r0, ve);
  check('launch at the escape speed: a parabola, E = 0', par.kind === 'parabola' && Math.abs(par.energy) < 1e-6);
  const hyp = K.launchOrbit(GM, r0, 1.5 * vc);
  check('launch at 1.5 v_c: hyperbola with e = 1.25', hyp.kind === 'hyperbola' && near(hyp.e, 1.25, 1e-12));
  const slow = K.launchOrbit(GM, r0, 0.9 * vc);
  check('launch below v_c: the launch point is the apoapsis', near(slow.ra, r0, 1e-12) && slow.launchNu === Math.PI);
  // speeds along open orbits obey energy conservation too
  for (const o of [par, hyp]) {
    let ok = true;
    for (const t of [-5000, -10, 0, 30, 2000, 20000]) {
      const s = K.stateAt(o, t), E = s.v ** 2 / 2 - GM / s.r, h = s.x * s.vy - s.y * s.vx;
      if (!near(h, o.h, 1e-8) || Math.abs(E - o.energy) > 1e-8 * GM / o.rp) ok = false;
    }
    check(`${o.kind}: energy and angular momentum conserved along the path`, ok);
  }
  // a slow launch from a low height hits the ground; the impact point is on the surface
  const low = K.launchOrbit(GM, K.R_EARTH + 100e3, 6000);
  const nu = K.impactNu(low, K.R_EARTH);
  check('a 6 km/s launch from 100 km comes down', nu !== null && near(K.radiusAt(low, nu), K.R_EARTH, 1e-9));
  check('…after the launch and before the periapsis', nu > Math.PI && nu < 2 * Math.PI && K.timeAt(low, nu) > low.launchT);
  check('a circular launch never hits the ground', K.impactNu(circ, K.R_EARTH) === null);
}

// ─── the simulation's parameter check ──────────────────────────────────────
const v = (p) => validate({ ...defaults, ...p });
check('default parameters are valid', v({}).length === 0, v({}).join('; '));
check('a launch spec is valid', v({ launch: { body: 'earth', h: 400e3, v: 7.7, vRange: [5, 12] } }).length === 0, v({ launch: { body: 'earth', h: 400e3, v: 7.7, vRange: [5, 12] } }).join('; '));
check('an unknown preset is rejected', v({ presets: ['iss', 'pluto'] }).length > 0);
check('a preset outside the list is rejected', v({ presets: ['iss', 'gps'], preset: 'moon' }).length > 0);
check('a launch speed outside its range is rejected', v({ launch: { body: 'earth', h: 400e3, v: 14, vRange: [5, 12] } }).length > 0);
check('an unknown readout is rejected', v({ readout: ['T', 'mass'] }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
