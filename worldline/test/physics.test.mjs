// Headless checks that the physics animating the film is right, and that
// every number the film states is what the physics gives.
//   node worldline/test/physics.test.mjs

import * as P from '../src/physics.js';
import { FACTS as F } from '../src/data.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.abs(b);
const fmt = (x) => (Math.abs(x) < 1e-3 || Math.abs(x) > 1e5 ? x.toExponential(4) : x.toFixed(4));

// ─── special relativity ──────────────────────────────────────────────────
check('γ(0.6) = 1.25', near(P.gamma(0.6), F.gamma06.value, 1e-12));
check('γ(0.99) ≈ 7.1', near(P.gamma(0.99), F.gamma099.value, 0.005), fmt(P.gamma(0.99)));
for (const beta of [0.3, 0.6, 0.9]) {
  const [x, t] = P.lorentz(2.5, 4, beta);
  check(`interval is invariant at β = ${beta}`, near(P.interval(t, x), P.interval(4, 2.5), 1e-12));
}
{
  const rest = P.lightClock(3.7, 1, 0), moving = P.lightClock(3.7, 1, 0.6);
  check('moving light clock ticks every γP', near(moving.period, 1.25, 1e-12));
  check('light clock pulse height stays inside the mirrors', [0, 0.3, 0.5, 0.99].every((f) => { const h = P.lightClock(f, 1).h; return h >= 0 && h <= 1; }));
  check('5 rest ticks for 4 moving ticks at 0.6c', P.clockTicks(5, 1, 0).length === 5 && P.clockTicks(5, 1, 0.6).length === 4);
  check('rest clock ahead of moving clock', rest.ticks >= moving.ticks);
}
check('muon survival without dilation ≈ 5%', near(P.survival(F.muonTrip.value, F.muonLife.value), F.muonSurviveNaive.value, 0.15), fmt(P.survival(6.4, 2.2)));
check('1.9 km at 0.995c takes ≈ 6.4 μs', near(1917 / (0.995 * P.C) * 1e6, F.muonTrip.value, 0.01));
{
  const { distance: D, beta, home, traveller } = F.twin;
  check('twin at home ages 10 years', near((2 * D) / beta, home, 1e-12));
  check('travelling twin ages 6 years', near(P.travellerProperTime(D, beta), traveller, 1e-12));
  const turn = P.travellerAt(3, D, beta), end = P.travellerAt(6, D, beta);
  check('traveller turns around at 4 ly, 5 yr', near(turn[0], 4, 1e-12) && near(turn[1], 5, 1e-12));
  check('traveller is home at 10 yr', Math.abs(end[0]) < 1e-12 && near(end[1], 10, 1e-12));
}
{
  const L = P.lightning(1, 0.5);
  check('platform sees both flashes together', L.platform[0] === L.platform[1]);
  check('passenger sees the front flash first', L.passengerSees[1] < L.passengerSees[0]);
  check('in her frame the front strike happened first', L.passengerStrikeTimes[1] < 0 && L.passengerStrikeTimes[0] > 0);
}

// ─── gravity near Earth ──────────────────────────────────────────────────
check('clocks 1 m apart differ by ≈ 1.1×10⁻¹⁶', near(P.towerShift(1), F.towerPerMetre.value, 0.02), fmt(P.towerShift(1)));
{
  const g = P.gpsRates();
  check('GPS gravitational gain ≈ +45.8 μs/day', Math.abs(g.gravity * 1e6 - F.gpsGravity.value) < 0.05, fmt(g.gravity * 1e6));
  check('GPS velocity loss ≈ −7.2 μs/day', Math.abs(g.velocity * 1e6 - F.gpsVelocity.value) < 0.05, fmt(g.velocity * 1e6));
  check('GPS net ≈ +38.6 μs/day', Math.abs(g.net * 1e6 - F.gpsNet.value) < 0.05, fmt(g.net * 1e6));
  check('GPS clocks set to 10.22999999543 MHz', Math.abs(10.23 * (1 - g.fraction) - F.gpsClock.value) < 5e-12, (10.23 * (1 - g.fraction)).toFixed(13));
  check('light covers ≈ 11.6 km in a day of drift', near(g.net * P.C / 1000, 11.6, 0.01), fmt(g.net * P.C / 1000));
}

// ─── curvature ───────────────────────────────────────────────────────────
check('8πG/c⁴ ≈ 2.1×10⁻⁴³ N⁻¹', near((8 * Math.PI * 6.6743e-11) / P.C ** 4, F.coupling.value, 0.02));
check('curvature radius inside water ≈ 1.5 AU', near(P.C / Math.sqrt(8 * Math.PI * 6.6743e-11 * 1000) / P.AU, F.waterCurvatureAU.value, 0.05));

// ─── black holes ─────────────────────────────────────────────────────────
check('r_s(Sun) ≈ 2.95 km', near(P.schwarzschildRadius(P.GM_SUN) / 1000, F.rsSunKm.value, 0.005));
check('r_s(Earth) ≈ 8.9 mm', near(P.schwarzschildRadius(P.GM_EARTH) * 1000, F.rsEarthMm.value, 0.01));
check('hover clock at 3 r_s ticks at 82%', near(P.hoverRate(3) * 100, F.hover3.value, 0.01));
check('hover clock at 1.1 r_s ticks at 30%', near(P.hoverRate(1.1) * 100, F.hover11.value, 0.02));
check('1.9 km at 0.995c, the muon descent', near(F.muonDrop.value * 1000 / (0.995 * P.C) * 1e6, F.muonTrip.value, 0.01));
check('efficiency at the Schwarzschild ISCO ≈ 5.7%', near(P.efficiencySchwarzschild * 100, F.effSchwarzschild.value, 0.01));
check('efficiency at the extreme-Kerr ISCO ≈ 42%', near(P.efficiencyMaxKerr * 100, F.effKerr.value, 0.01));
check('Hawking temperature of one solar mass ≈ 60 nK', near(P.hawkingTemperature(P.GM_SUN / 6.6743e-11), F.hawkingSolar.value, 0.05));
{
  const inside = P.photonPath(P.CAPTURE_B - 0.02), outside = P.photonPath(P.CAPTURE_B + 0.02);
  check('rays just inside b = 3√3/2 are captured', inside.captured);
  check('rays just outside b = 3√3/2 escape', !outside.captured);
  check('near-critical rays wind around the photon sphere', outside.swept > 2 * Math.PI, fmt(outside.swept));
  const far = P.photonPath(400, { start: 4000, maxR: 6000, step: 0.0005 });
  check('weak-field deflection → 2 r_s / b', near(far.deflection, 2 / 400, 0.03), `${fmt(far.deflection)} vs ${fmt(2 / 400)}`);
  check('Sun bends starlight 1.75″ at its edge', near(P.lightDeflection(P.GM_SUN, P.R_SUN) / P.ARCSEC, F.deflection.value, 0.005));
}
{
  const o = P.orbit(800, 1200, { orbits: 2, step: 0.001 });
  const adv = o.periapses[1] - 2 * Math.PI;
  const p = 2 / (1 / 800 + 1 / 1200);           // semi-latus rectum
  check('weak-field orbit precesses by 3π r_s / p', near(adv, (3 * Math.PI) / p, 0.03), `${fmt(adv)} vs ${fmt((3 * Math.PI) / p)}`);
  const close = P.orbit(7, 16, { orbits: 1 });
  check('a close orbit swings far past 360° between periapses', close.periapses[1] - 2 * Math.PI > 1, fmt(close.periapses[1] - 2 * Math.PI));
  check('orbit radius stays between periapsis and apoapsis', close.samples.every((s) => s.r > 6.99 && s.r < 16.01));
  check('coordinate time increases along the orbit', close.samples.every((s, i, a) => !i || s.t > a[i - 1].t));
  const mercuryOrbitsPerCentury = 36525 / 87.969;
  const perCentury = (P.perihelionAdvance(P.GM_SUN, 5.7909e10, 0.2056) / P.ARCSEC) * mercuryOrbitsPerCentury;
  check('Mercury: 42.98″ per century', near(perCentury, F.mercury.value, 0.002), fmt(perCentury));
}

// ─── the thrown ball ─────────────────────────────────────────────────────
{
  const best = P.thrownBallGain(1);
  check('thrown ball at 10 m/s gains ≈ 4×10⁻¹⁶ s', near(best, 10 ** 3 / (3 * 9.81 * P.C ** 2), 1e-12) && best > 3.5e-16 && best < 4.5e-16, fmt(best));
  check('the free-fall path has the most proper time', [0, 0.5, 0.9, 1.1, 1.5, 2].every((k) => P.thrownBallGain(k) < best));
  // the closed form against a direct integral of (g h − v²/2)/c²
  const v0 = 10, g = 9.81, T = (2 * v0) / g, k = 0.7;
  let sum = 0; const n = 20000;
  for (let i = 0; i < n; i++) { const t = (i + 0.5) * T / n; const h = k * (v0 * t - 0.5 * g * t * t), v = k * (v0 - g * t); sum += (g * h - 0.5 * v * v) * T / n; }
  check('thrownBallGain matches the integral', near(P.thrownBallGain(k), sum / P.C ** 2, 1e-6));
}

// ─── gravitational waves ─────────────────────────────────────────────────
{
  const { m1, m2, f0, duration } = F.gw150914;
  const McSource = P.chirpMass(m1, m2);
  check('GW150914 chirp mass ≈ 28 M☉ (source frame)', near(McSource, 28.1, 0.01), fmt(McSource));
  const Mc = 30 * P.MSUN_SECONDS;                // detector frame, as measured
  const t35 = P.timeToMerge(f0, Mc);
  check('35 Hz to merger takes ≈ 0.2 s at leading order', t35 > 0.12 && t35 < duration + 0.05, fmt(t35));
  check('frequency rises toward merger', P.chirpFrequency(0.1, Mc) < P.chirpFrequency(0.01, Mc));
  check('timeToMerge inverts chirpFrequency', near(P.chirpFrequency(P.timeToMerge(80, Mc), Mc), 80, 1e-9));
  let maxH = 0;
  for (let t = -0.25; t < 0.05; t += 1e-5) maxH = Math.max(maxH, Math.abs(P.chirpWave(t).h));
  check('waveform stays bounded through merger', maxH < 1.3, fmt(maxH));
  check('waveform rings down after merger', Math.abs(P.chirpWave(0.05).h) < 0.01);
  check('LIGO arm change ≈ 4×10⁻¹⁸ m for h ≈ 10⁻²¹', near(1e-21 * 4000, F.armChange.value, 1e-9));
  const [x, y] = P.waveDisplace(1, 0, 0.2, 0, 'plus'), [x2, y2] = P.waveDisplace(0, 1, 0.2, 0, 'plus');
  check('plus polarization stretches x while squeezing y', x > 1 && y2 < 1);
  const [cx, cy] = P.waveDisplace(1, 1, 0.2, 0, 'cross');
  check('cross polarization acts along the diagonals', cx > 1 && cy > 1 && Math.abs(P.waveDisplace(1, 0, 0.2, 0, 'cross')[0] - 1) < 1e-12);
}

// ─── cosmology ───────────────────────────────────────────────────────────
{
  const age = P.ageAt(1) / P.YEAR / 1e9;
  check('ΛCDM age ≈ 13.79 Gyr', Math.abs(age - F.age.value) < 0.05, fmt(age));
  const tHalf = P.ageAt(0.5);
  check('scaleFactorAt inverts ageAt', near(P.scaleFactorAt(tHalf), 0.5, 1e-4));
  check('expansion decelerated early', P.deceleration(0.3) > 0);
  check('expansion accelerates today', P.deceleration(1) < 0);
  let aT = 0.3; while (P.deceleration(aT) > 0) aT += 0.001;
  check('deceleration turned to acceleration at z ≈ 0.6–0.7', 1 / aT - 1 > 0.55 && 1 / aT - 1 < 0.75, fmt(1 / aT - 1));
  const { ordinary, dark, energy } = F.composition;
  const ob = 0.02242 / (P.COSMO.H0 / 100) ** 2;
  check('composition: ordinary ≈ 5%', Math.round(ob * 100) === ordinary);
  check('composition: dark matter ≈ 26%', Math.round((P.COSMO.Om - ob) * 100) === dark);
  check('composition: dark energy ≈ 69%', Math.round(P.COSMO.OL * 100) === energy);
}
{
  const [a, b] = P.lensImages(0);
  check('a lens aligned with its source makes an Einstein ring', near(a, 1, 1e-12) && near(b, -1, 1e-12));
  const [p, q] = P.lensImages(0.5);
  check('an offset source makes two images on opposite sides', p > 1 && q < 0 && q > -1);
}

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
