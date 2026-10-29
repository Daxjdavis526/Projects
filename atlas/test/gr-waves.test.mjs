// The DOM-free model behind the gr-chirp simulation: leading-order inspiral
// waveforms, binary-pulsar decay and ringdown, checked against the numbers
// quoted in the gravitational-wave and numerical-relativity lessons
// (research notes, step 27 and Q4: GW150914, Hulse–Taylor, Earth–Sun).
//   node atlas/test/gr-waves.test.mjs

import * as W from '../src/viz/model/gr-waves.js';
import { validate } from '../src/viz/sims/gr-chirp.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(1e-300, Math.abs(b));

// GW150914: 36 + 29 M☉ at z = 0.09 (LVK 2016)
const Mc = W.chirpMass(36, 29), McDet = Mc * 1.09;
check('GW150914 chirp mass 28.1 M☉ (source frame)', near(Mc, 28.1, 0.003), Mc.toFixed(3));
check('…30.6 M☉ as the detector sees it (×1.09)', near(McDet, 30.6, 0.003), McDet.toFixed(3));
check('leading-order time from 35 Hz to merger ≈ 0.16 s', near(W.tauOfF(35, McDet), 0.165, 0.03), W.tauOfF(35, McDet).toFixed(4));
check('about 9 cycles from 35 to 250 Hz', near(W.cyclesBetween(35, 250, McDet), 8.9, 0.04), W.cyclesBetween(35, 250, McDet).toFixed(3));
check('df/dt at 100 Hz ≈ 3.7×10³ Hz/s', near(W.fdot(100, McDet), 3.7e3, 0.03), W.fdot(100, McDet).toFixed(0));
check('chirp mass recovered from f and df/dt', near(W.chirpMassFromFdot(100, W.fdot(100, McDet)), McDet, 1e-9));
const D = 410 * W.MPC;
check('strain at 35 Hz, 410 Mpc ≈ 0.9×10⁻²¹', near(W.strain(35, McDet, D), 0.9e-21, 0.06), W.strain(35, McDet, D).toExponential(3));
check('strain at 150 Hz, 410 Mpc ≈ 2.5×10⁻²¹', near(W.strain(150, McDet, D), 2.45e-21, 0.03), W.strain(150, McDet, D).toExponential(3));
check('arm change hL for h = 10⁻²¹, L = 4 km is 4×10⁻¹⁸ m', near(1e-21 * 4000, 4e-18, 1e-12));
check('3 M☉c² radiated is 5.4×10⁴⁷ J', near(3 * W.M_SUN * W.C ** 2, 5.36e47, 0.01), (3 * W.M_SUN * W.C ** 2).toExponential(3));

// internal consistency of the sweep
for (const f of [20, 35, 100, 300]) {
  check(`f(τ(f)) = f at ${f} Hz`, near(W.fOfTau(W.tauOfF(f, 20), 20), f, 1e-12));
  const tau = W.tauOfF(f, 20);
  check(`τ(Φ(τ)) = τ at ${f} Hz`, near(W.tauOfPhase(W.phaseOfTau(tau, 20), 20), tau, 1e-12));
  // dΦ/dt = 2πf: the phase is the integral of the frequency
  const h = tau * 1e-6, dphi = (W.phaseOfTau(tau + h, 20) - W.phaseOfTau(tau - h, 20)) / (2 * h);
  check(`dΦ/dτ = 2πf at ${f} Hz`, near(dphi, 2 * Math.PI * f, 1e-6), `${dphi} vs ${2 * Math.PI * f}`);
  // df/dt from the sweep agrees with the formula
  const dfdt = (W.fOfTau(tau - h, 20) - W.fOfTau(tau + h, 20)) / (2 * h);
  check(`df/dt from f(τ) at ${f} Hz`, near(dfdt, W.fdot(f, 20), 1e-6));
}
check('contact frequency is twice Kepler’s at r = 2GM/c²', near(W.fContact(65), Math.sqrt((W.G * 65 * W.M_SUN) / (2 * 65 * W.L_SUN) ** 3) / Math.PI, 1e-12));
check('ISCO frequency ≈ 4400 Hz × (M☉/M)', near(W.fISCO(1), 4397, 0.003), W.fISCO(1).toFixed(1));

// binary pulsars and the Solar System
check('Peters–Mathews f(0.617) = 11.84', near(W.petersF(0.617), 11.84, 0.001), W.petersF(0.617).toFixed(4));
{
  const pd = W.pbDot(7.7519 * 3600, 1.438, 1.390, 0.617);
  check('Hulse–Taylor dP_b/dt = −2.40×10⁻¹²', near(pd, -2.40e-12, 0.005), pd.toExponential(4));
  check('…about −76 μs per year', near(pd * W.YEAR * 1e6, -75.6, 0.01), (pd * W.YEAR * 1e6).toFixed(2));
}
{
  const P = W.powerCircular(W.M_SUN, 5.972e24, 1.496e11);
  check('Earth–Sun gravitational-wave power ≈ 196 W', near(P, 196, 0.01), P.toFixed(1));
}
{
  const r = W.ringdown(62);
  check('62 M☉ Schwarzschild ringdown at 195 Hz', near(r.f, 195, 0.005), r.f.toFixed(2));
  check('…dying away in 3.4 ms', near(r.tau, 3.43e-3, 0.01), (r.tau * 1e3).toFixed(3));
}

// the simulation's parameter check
check('gr-chirp accepts its defaults', validate({ m1: 36, m2: 29, D: 410, p: 0.9 }).length === 0);
check('gr-chirp rejects a playhead outside [0, 1]', validate({ m1: 36, m2: 29, D: 410, p: 1.5 }).length > 0);
check('gr-chirp rejects a negative mass', validate({ m1: -3, m2: 29, D: 410, p: 0.5 }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
