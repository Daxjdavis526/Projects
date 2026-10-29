// The Rutherford-scattering model behind the mp-rutherford simulation.
//   node atlas/test/mp-rutherford.test.mjs

import * as R from '../src/viz/model/mp-rutherford.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));
const DEG = Math.PI / 180;

check('e²/4πε₀ = 1.439 965 MeV fm', Math.abs(R.KE2 - 1.4399645) < 1e-6, String(R.KE2));
const dAu = R.collisionDiameter(7.69, 79);
check('7.69 MeV alphas on gold: head-on closest approach 29.6 fm', Math.abs(dAu - 29.59) < 0.02, String(dAu));
check('a 90° scattering has b = d/2', near(R.impactParameter(Math.PI / 2, dAu), dAu / 2, 1e-12));
for (const th of [10, 45, 90, 135, 170]) check(`θ(b(θ)) = θ at ${th}°`, near(R.angleFromB(R.impactParameter(th * DEG, dAu), dAu), th * DEG, 1e-12));
check('head-on: r_min = d', near(R.closestApproach(0, dAu), dAu, 1e-12));
check('at 90°: r_min = (d/2)(1 + √2)', near(R.closestApproach(dAu / 2, dAu), (dAu / 2) * (1 + Math.SQRT2), 1e-12));

// the analytic orbit against a numerical integration of Newton's law (fm, units where the force is d·v₀²/(2r²) per unit mass)
function integrate(b, d) {
  // m = 1, v₀ = 1: K = 1/2, so the force constant k = K d = d/2; a = (d/2) r̂ / r²
  let x = -4000, y = b, vx = 1, vy = 0, rmin = Infinity;
  const acc = (x, y) => { const r = Math.hypot(x, y), f = d / 2 / (r * r * r); return [f * x, f * y]; };
  const h = 0.02;
  for (let i = 0; i < 1e6; i++) {
    const r = Math.hypot(x, y); rmin = Math.min(rmin, r);
    if (r > 4000 && x > -4000 && i > 10 && x * vx + y * vy > 0) break;
    const dt = h * Math.max(0.05, Math.min(1, r / 50));
    const [ax1, ay1] = acc(x, y);
    const [ax2, ay2] = acc(x + 0.5 * dt * vx, y + 0.5 * dt * vy);
    const [ax3, ay3] = acc(x + 0.5 * dt * (vx + 0.5 * dt * ax1), y + 0.5 * dt * (vy + 0.5 * dt * ay1));
    const [ax4, ay4] = acc(x + dt * (vx + 0.5 * dt * ax2), y + dt * (vy + 0.5 * dt * ay2));
    const nx = x + dt * (vx + (dt / 6) * (ax1 + ax2 + ax3));
    const ny = y + dt * (vy + (dt / 6) * (ay1 + ay2 + ay3));
    vx += (dt / 6) * (ax1 + 2 * ax2 + 2 * ax3 + ax4); vy += (dt / 6) * (ay1 + 2 * ay2 + 2 * ay3 + ay4);
    x = nx; y = ny;
  }
  return { theta: Math.atan2(vy, vx), rmin };
}
for (const b of [5, 15, 40, 120]) {
  const num = integrate(b, dAu), th = R.angleFromB(b, dAu);
  // starting 4000 fm away (not infinity) bends the path by about d/4000 radians less
  check(`b = ${b} fm: integrated angle matches 2 atan(d/2b)`, Math.abs(num.theta - th) < 0.012, `${num.theta / DEG} vs ${th / DEG}`);
  check(`b = ${b} fm: integrated closest approach matches the formula`, Math.abs(num.rmin - R.closestApproach(b, dAu)) < 0.02 * R.closestApproach(b, dAu), `${num.rmin} vs ${R.closestApproach(b, dAu)}`);
  const pts = R.orbit(b, dAu, 300, 2000);
  const rmin = Math.min(...pts.map(([x, y]) => Math.hypot(x, y)));
  check(`b = ${b} fm: the drawn orbit comes as close as r_min`, Math.abs(rmin - R.closestApproach(b, dAu)) < 0.003 * R.closestApproach(b, dAu), `${rmin}`);
  const [x1, y1] = pts[pts.length - 2], [x0, y0] = pts[pts.length - 3];
  check(`b = ${b} fm: the drawn orbit is heading out at angle θ where it joins its straight end`, Math.abs(Math.atan2(y1 - y0, x1 - x0) - th) < 0.015, `${Math.atan2(y1 - y0, x1 - x0) / DEG} vs ${th / DEG}`);
  check(`b = ${b} fm: the drawn orbit arrives at height b`, Math.abs(pts[0][1] - b) < 1e-9);
}
check('negative b mirrors the orbit below the axis', near(R.orbit(-20, dAu)[50][1], -R.orbit(20, dAu)[50][1], 1e-12));
check('speed is zero at the head-on turning point', R.speedFraction(dAu, dAu) === 0 && near(R.speedFraction(4 * dAu, dAu), Math.sqrt(0.75)));

// the cross-section integrates to the target area: ∫ dσ/dΩ dΩ from θ₀ to π = π b(θ₀)²
for (const th0 of [30, 90]) {
  let s = 0; const n = 20000, a = th0 * DEG;
  for (let i = 0; i < n; i++) { const th = a + ((Math.PI - a) * (i + 0.5)) / n; s += 2 * Math.PI * Math.sin(th) * R.crossSection(th, dAu) * ((Math.PI - a) / n); }
  check(`σ(θ > ${th0}°) = π b² (cross-section integrates correctly)`, Math.abs(s / (Math.PI * R.impactParameter(a, dAu) ** 2) - 1) < 1e-4, `${s}`);
}
// a gold foil 1 μm thick, 7.69 MeV alphas: about 1 in 25 000 beyond 90°
const nAu = (19.32e3 / 196.96657e-3) * 6.02214076e23;
const f90 = R.fractionBeyond(Math.PI / 2, dAu, nAu, 1e-6);
check('1 μm of gold scatters about 4 × 10⁻⁵ of 7.69 MeV alphas beyond 90°', f90 > 3.8e-5 && f90 < 4.3e-5, String(f90));

check('nuclear radii: gold 7.0 fm, alpha 1.9 fm', Math.abs(R.nuclearRadius(197) - 6.98) < 0.01 && Math.abs(R.nuclearRadius(4) - 1.905) < 0.002);
check('a head-on alpha touches aluminium near 6.8 MeV', Math.abs(R.touchingEnergy(13, 27) - 6.81) < 0.02, String(R.touchingEnergy(13, 27)));
check('7.69 MeV alphas never touch gold', !R.touches(0, dAu, 197));
check('Thomson: the largest deflection by a gold atom is about 0.01°', Math.abs(R.thomsonMax(dAu) / DEG - 0.0085) < 0.001, String(R.thomsonMax(dAu) / DEG));
check('Thomson: the largest deflection happens at b = R/√2', near(R.thomsonDeflection(R.ATOM_R / Math.SQRT2, dAu), R.thomsonMax(dAu), 1e-9));
check('Thomson: no deflection outside the atom', R.thomsonDeflection(2 * R.ATOM_R, dAu) === 0);

// Geiger and Marsden's counts follow 1/sin⁴(θ/2) within their scatter
for (const [a, nCount] of R.GM_GOLD) {
  const ratio = (nCount * Math.sin((a * DEG) / 2) ** 4) / R.GM_N0;
  check(`Geiger–Marsden ${a}°: counts × sin⁴(θ/2) within 40% of the mean`, ratio > 0.85 && ratio < 1.4, String(ratio));
}
check('Geiger–Marsden constant is about 29.5', Math.abs(R.GM_N0 - 29.46) < 0.05, String(R.GM_N0));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
