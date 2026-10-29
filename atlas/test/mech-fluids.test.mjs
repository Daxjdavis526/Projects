// The DOM-free model behind the mech-tank and mech-flow simulations.
//   node atlas/test/mech-fluids.test.mjs

import * as M from '../src/viz/model/mech-fluids.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 1e-9) => Math.abs(a - b) <= abs + rel * Math.abs(b);
const g = M.G;

// ─── hydrostatics: numbers the lessons quote ───────────────────────────────
check('10 m of water adds about one atmosphere', near(M.pressureAt(0, 1000, 10), 98000) && Math.abs(98000 / M.P_ATM - 0.967) < 1e-3);
check('a 760 mm mercury column is one atmosphere (to 0.1%)', Math.abs(M.pressureAt(0, 13600, 0.76) / M.P_ATM - 1) < 1e-3);
check('head of one atmosphere of water is about 10.3 m', near(M.headOf(M.P_ATM, 1000), 10.339, 1e-3));
check('manometer: Δh = Δp/(ρg)', near(M.manometerRise(13600 * g * 0.05, 13600), 0.05));
check('LOX: 1141 kg/m³', M.FLUIDS.lox.rho === 1141 && M.FLUIDS.rp1.rho === 810);
check('pressure grows linearly with depth', near(M.pressureAt(1e5, 1025, 20) - M.pressureAt(1e5, 1025, 10), 1025 * g * 10));

// ─── buoyancy ──────────────────────────────────────────────────────────────
const V = 2e-3, s = Math.cbrt(V);
for (const rhoObj of [200, 500, 917, 999]) {
  const b = M.block({ rhoObj, V, rhoFluid: 1000, hold: 'free', floorDepth: 0.5 });
  check(`free block ρ=${rhoObj} floats with B = W`, b.floats && near(b.B, b.W, 1e-12), `B ${b.B} W ${b.W}`);
  check(`free block ρ=${rhoObj}: submerged fraction ρ/ρ_f`, near(b.sub, rhoObj / 1000, 1e-12) && near(b.bottom, (rhoObj / 1000) * s, 1e-12));
}
for (const rhoObj of [1500, 2700, 7800]) {
  const b = M.block({ rhoObj, V, rhoFluid: 1000, hold: 'free', floorDepth: 0.5 });
  check(`free block ρ=${rhoObj} sinks: N = W − B`, b.onFloor && near(b.N, b.W - b.B, 1e-12) && near(b.B, 1000 * V * g, 1e-12));
}
// on a scale: the reading falls as it goes in, then stays put at any depth once fully under
{
  const reading = (depth) => M.block({ rhoObj: 2700, V, rhoFluid: 1000, hold: 'scale', depth, floorDepth: 0.6 }).T;
  check('scale: reads the weight in air', near(reading(-0.05), 2700 * V * g));
  check('scale: half in, half the buoyancy', near(reading(s / 2), (2700 - 500) * V * g));
  const deep = [s + 0.01, s + 0.1, s + 0.3, 0.6 - 1e-6].map(reading);
  check('scale: fully submerged, the reading does not change with depth', deep.every((T) => near(T, (2700 - 1000) * V * g)), deep.join(', '));
  const floor = M.block({ rhoObj: 2700, V, rhoFluid: 1000, hold: 'scale', depth: 0.9, floorDepth: 0.6 });
  check('scale: lowered onto the floor, the string goes slack', floor.T === 0 && floor.onFloor && near(floor.N, (2700 - 1000) * V * g));
  const light = M.block({ rhoObj: 600, V, rhoFluid: 1000, hold: 'scale', depth: 0.3, floorDepth: 0.6 });
  check('scale: a light block lowered too far floats, string slack', light.T === 0 && light.floats && near(light.B, light.W));
}
check('iceberg: about 89.5% under seawater', near(M.floatFraction(917, 1025), 0.8946, 1e-3));
check('helium balloon lifts', M.balloonLift(10, 1.225, 0.169, 5) > 0 && near(M.balloonLift(1, 1.2, 0.2, 0), 1.0 * g));

// ─── continuity and Bernoulli in the Venturi tube ─────────────────────────
for (const ratio of [0.15, 0.4, 0.8, 1]) for (const rise of [0, 3]) {
  const P = { v1: 2.5, ratio, p1: 2.5e5, rho: 1141, rise };
  let worst = 0, worstQ = 0;
  for (let k = 0; k <= 200; k++) {
    const st = M.venturiAt(k / 200, P);
    worstQ = Math.max(worstQ, Math.abs(st.a * st.v - P.v1));
    worst = Math.max(worst, Math.abs(st.total - (P.p1 + 0.5 * P.rho * P.v1 ** 2)));
  }
  check(`venturi ratio ${ratio} rise ${rise}: A v is the same at every section`, worstQ < 1e-12, worstQ);
  check(`venturi ratio ${ratio} rise ${rise}: p + ½ρv² + ρgy is constant`, worst < 1e-6, worst);
  const throat = M.venturiAt(0.5, P);
  check(`venturi ratio ${ratio}: the throat has the target area`, near(throat.a, ratio));
  if (ratio < 1 && rise === 0) {
    check(`venturi ratio ${ratio}: lower pressure where faster`, throat.p < P.p1);
    const back = M.venturiSpeed(P.p1 - throat.p, 1, ratio, P.rho);
    check(`venturi ratio ${ratio}: the meter formula recovers v₁`, near(back, P.v1, 1e-9));
  }
}
check('venturi shape: smooth (no jumps)', (() => { let prev = M.venturiArea(0, 0.3); for (let k = 1; k <= 1000; k++) { const a = M.venturiArea(k / 1000, 0.3); if (Math.abs(a - prev) > 0.01) return false; prev = a; } return true; })());
check('continuity: halving the diameter quadruples the speed', near(M.continuity(3, M.areaOf(0.1), M.areaOf(0.05)), 12));
check('Bernoulli: a horizontal pipe that speeds up loses pressure', near(M.bernoulli(2e5, 2, 0, 6, 0, 1000), 2e5 - 16000));
check('Bernoulli: rising 5 m at constant speed costs ρgh', near(M.bernoulli(2e5, 3, 0, 3, 5, 1000), 2e5 - 1000 * g * 5));

// ─── Pitot ─────────────────────────────────────────────────────────────────
check('pitot: 70 m/s at sea level gives about 3.0 kPa', near(M.dynamicPressure(M.RHO_SL, 70), 3001.25) && near(M.pitotSpeed(3001.25, M.RHO_SL), 70));
check('pitot: thinner air, same true speed, lower indicated speed', M.indicatedAirspeed(200, M.airAt(10)) < 200 && near(M.indicatedAirspeed(100, M.RHO_SL), 100));
check('air at 10 km is about a third of sea level', Math.abs(M.airAt(10) / M.RHO_SL - 0.3376) < 2e-3, M.airAt(10));

// ─── the probe as a Rankine half-body ─────────────────────────────────────
{
  const U = 40, a = 0.5, m = 2 * U * a;
  const [us, vs] = M.halfBodyVelocity(-a / Math.PI, 0, U, a);
  check('half-body: the nose is a stagnation point', Math.hypot(us, vs) < 1e-9 && near(M.halfBodyCp(-a / Math.PI, 0, U, a), 1));
  let psiErr = 0, flux = 0;
  for (let k = 1; k < 100; k++) {
    const th = (Math.PI * k) / 100;
    const [x, y] = M.halfBodySurface(th, a);
    psiErr = Math.max(psiErr, Math.abs(M.halfBodyPsi(x, y, U, a) - m / 2));
    // the velocity on the surface is tangent to it: normal component ≈ 0
    const [x2, y2] = M.halfBodySurface(th + 1e-6, a);
    const tx = x2 - x, ty = y2 - y, tl = Math.hypot(tx, ty);
    const [u, v] = M.halfBodyVelocity(x, y, U, a);
    flux = Math.max(flux, Math.abs((u * -ty + v * tx) / tl) / U);
  }
  check('half-body: the surface is the streamline ψ = m/2', psiErr < 1e-9, psiErr);
  check('half-body: flow is tangent to the surface', flux < 1e-4, flux);
  check('half-body: far downstream the width is 2a', near(M.halfBodySurface(1e-4, a)[1], a, 1e-3));
  check('half-body: inside and outside', M.insideHalfBody(0, 0.2, a) && !M.insideHalfBody(0, 0.8, a) && M.insideHalfBody(-0.1, 0, a) && !M.insideHalfBody(-0.2, 0, a) && M.insideHalfBody(50, -0.49, a) && !M.insideHalfBody(50, -0.51, a) && !M.insideHalfBody(5, -0.49, a));
  // behind the shoulder the surface pressure creeps back to the free stream (in 2D, like 1/x)
  const cps = [0.3, 0.1, 0.05, 0.01].map((th) => { const [x, y] = M.halfBodySurface(th, a); return M.halfBodyCp(x, y, U, a); });
  check('half-body: surface Cp rises back toward 0 downstream', cps.every((c, k) => c < 0 && (k === 0 || c > cps[k - 1])) && cps[3] > -0.01, cps.join(', '));
}

// ─── viscosity preview ─────────────────────────────────────────────────────
{
  const R = 0.01, dp = 500, eta = 1e-3, L = 2;
  // the profile integrated over the cross-section gives Poiseuille's Q
  let Q = 0; const n = 2000;
  for (let k = 0; k < n; k++) { const r = ((k + 0.5) / n) * R; Q += M.poiseuilleSpeed(r, R, dp, eta, L) * 2 * Math.PI * r * (R / n); }
  check('Poiseuille: ∫ v 2πr dr = π R⁴ Δp/(8ηL)', near(Q, M.poiseuille(R, dp, eta, L), 1e-6), `${Q} vs ${M.poiseuille(R, dp, eta, L)}`);
  check('Poiseuille: doubling R gives 16 times the flow', near(M.poiseuille(2 * R, dp, eta, L), 16 * M.poiseuille(R, dp, eta, L)));
  check('Poiseuille: mean speed is half the centre speed', near(M.poiseuille(R, dp, eta, L) / (Math.PI * R * R), M.poiseuilleSpeed(0, R, dp, eta, L) / 2));
  check('Reynolds number of water at 1 m/s in a 2 cm pipe is 20 000', near(M.reynolds(1000, 1, 0.02, 1e-3), 20000));
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
