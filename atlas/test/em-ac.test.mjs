// The inductor, RL, LC/RLC and AC-circuit model behind the em-ac simulation.
//   node atlas/test/em-ac.test.mjs

import * as M from '../src/viz/model/em-ac.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel = 1e-9, abs = 0) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b)) + abs;
const deriv = (f, t, h = 1e-7) => (f(t + h) - f(t - h)) / (2 * h);
/** ∫ f from 0 to T by composite Simpson. */
function simpson(f, T, n = 4000) {
  const h = T / n;
  let s = f(0) + f(T);
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(k * h);
  return (s * h) / 3;
}

// ── constants and the solenoid ──
check('μ₀ is the CODATA 2022 value, 4π×10⁻⁷ to nine figures', M.MU0 === 1.25663706127e-6 && near(M.MU0, 4e-7 * Math.PI, 1e-9));
{
  const L = M.solenoidL(500, Math.PI * 0.01 ** 2, 0.1);
  check('500 turns, 1 cm radius, 10 cm long: L ≈ 0.987 mH', Math.abs(L - 9.87e-4) < 0.005e-4, `L = ${L}`);
  check('L ∝ N²: twice the turns, four times the inductance', near(M.solenoidL(1000, 1e-4, 0.1), 4 * M.solenoidL(500, 1e-4, 0.1)));
  // flux linkage: NΦ = N·B·A = L·I
  const N = 800, A = 2e-4, len = 0.15, I = 1.7;
  check('L = NΦ/I for a solenoid (Φ = BA through each turn)', near((N * M.solenoidB(N, I, len) * A) / I, M.solenoidL(N, A, len)));
  // energy two ways: ½LI² = (B²/2μ₀)·Aℓ
  const B = M.solenoidB(N, I, len);
  check('solenoid: ½LI² equals the field energy (B²/2μ₀)·Aℓ', near(0.5 * M.solenoidL(N, A, len) * I * I, ((B * B) / (2 * M.MU0)) * A * len));
}

// ── the driven inductor ──
{
  const W = M.rampWave({ kind: 'trapezoid', L: 0.5, Imax: 2, tr: 1, th: 1.5 });
  check('trapezoid: period 2tr + 2th', W.T === 5);
  check('trapezoid: emf −L·Imax/tr while rising', near(W.emf(0.4), -1) && near(W.emf(0.9), -1));
  check('trapezoid: no emf while the current holds steady, however large', W.emf(1.7) === 0 && W.I(1.7) === 2);
  check('trapezoid: emf +L·Imax/tr while falling', near(W.emf(3.0), 1));
  check('trapezoid: rests at zero current with zero emf', W.I(4.6) === 0 && W.emf(4.6) === 0);
  check('trapezoid: periodic', near(W.I(0.3), W.I(5.3)) && near(W.I(0.3), W.I(-4.7)));
  check('trapezoid: dI/dt is the slope of I', [0.3, 2.9, 3.3].every((t) => near(W.dIdt(t), deriv(W.I, t, 1e-6), 1e-6)));
  const S = M.rampWave({ kind: 'sine', L: 0.3, Imax: 1.5, tr: 1, th: 1 });
  check('sine: emf = −L dI/dt everywhere', [0.1, 0.7, 1.9, 3.3].every((t) => near(S.emf(t), -0.3 * deriv(S.I, t), 1e-6)));
  check('sine: the emf is largest where the current crosses zero', near(Math.abs(S.emf(0)), 0.3 * 1.5 * (2 * Math.PI / 4)) && Math.abs(S.emf(1)) < 1e-12);
}

// ── RL transients ──
for (const [E, R, L, i0] of [[12, 4, 0.2, 0], [28, 3.5, 4e-3, 0], [9, 100, 0.05, 0.02]]) {
  const c = M.rl({ E, R, L, i0, on: true });
  const tag = `RL on (ℰ=${E}, R=${R}, L=${L}, i₀=${i0})`;
  check(`${tag}: τ = L/R`, near(c.tau, L / R));
  check(`${tag}: the current climbs to ℰ/R`, near(c.i(40 * c.tau), E / R, 1e-12));
  if (i0 === 0) check(`${tag}: 63.2% of the way at t = τ`, near(c.i(c.tau), (E / R) * (1 - Math.exp(-1))));
  check(`${tag}: v_R + v_L = ℰ at every instant (loop rule)`, [0, 0.3, 1, 2.5].every((k) => near(c.vR(k * c.tau) + c.vL(k * c.tau), E, 1e-12)));
  check(`${tag}: v_L = L di/dt`, [0.2, 1.1].every((k) => near(c.vL(k * c.tau), L * deriv(c.i, k * c.tau, c.tau * 1e-5), 1e-6)));
  check(`${tag}: 90% of the way after τ ln 10`, near(c.tFor(0.9), c.tau * Math.log(10)) && near(c.i(c.tFor(0.9)) - i0, 0.9 * (E / R - i0), 1e-9));
  check(`${tag}: battery work = heat + gain in stored energy`, [0.5, 1, 3, 7].every((k) => { const t = k * c.tau; return near(c.work(t), c.heat(t) + c.stored(t) - c.stored(0), 1e-9); }));
  check(`${tag}: the heat is ∫i²R dt`, near(c.heat(2 * c.tau), simpson((t) => c.i(t) ** 2 * R, 2 * c.tau), 1e-8));
}
{
  const c = M.rl({ E: 12, R: 6, L: 0.3, i0: 2, on: false });
  check('RL decay: i = i₀e^(−t/τ)', near(c.i(0.1), 2 * Math.exp(-0.1 / 0.05)));
  check('RL decay: v_R + v_L = 0 (no battery in the loop)', [0, 0.02, 0.07].every((t) => Math.abs(c.vR(t) + c.vL(t)) < 1e-12));
  check('RL decay: all the stored ½Li₀² ends up as heat', near(c.heat(60 * c.tau), 0.5 * 0.3 * 4, 1e-9));
  check('RL decay: half the current after τ ln 2', near(c.i(c.tau * Math.log(2)), 1));
}

// ── LC and damped RLC ──
{
  const L = 2e-3, C = 5e-6, Q0 = 50e-6;
  const o = M.rlc({ L, C, q0: Q0 });
  check('LC: ω₀ = 1/√(LC) = 10 000 rad/s', near(o.w0, 1e4, 1e-12) && o.regime === 'undamped');
  check('LC: q returns to Q₀ after one period 2π√(LC)', near(o.q(o.T0), Q0, 1e-9));
  check('LC: energy is conserved, U_E + U_B = Q₀²/2C', [0, 1e-5, 3.3e-4, 1e-3].every((t) => near(o.UE(t) + o.UB(t), (Q0 * Q0) / (2 * C), 1e-12)));
  check('LC: the current peaks at ω₀Q₀ a quarter period later, with the capacitor empty', near(Math.abs(o.i(o.T0 / 4)), 1e4 * Q0, 1e-9) && Math.abs(o.q(o.T0 / 4)) < 1e-15);
  check('LC: i = dq/dt', [1e-5, 2e-4, 5e-4].every((t) => near(o.i(t), deriv(o.q, t, 1e-9), 1e-5)));
}
for (const [R, regime] of [[5, 'underdamped'], [2 * Math.sqrt(2e-3 / 5e-6), 'critical'], [200, 'overdamped']]) {
  const L = 2e-3, C = 5e-6, o = M.rlc({ L, C, R, q0: 40e-6, i0: 0.1 });
  const tag = `RLC ${regime} (R = ${R.toPrecision(4)} Ω)`;
  check(`${tag}: regime`, o.regime === regime, o.regime);
  check(`${tag}: starts at q₀ and i₀`, near(o.q(0), 40e-6, 1e-12) && near(o.i(0), 0.1, 1e-9, 1e-12));
  check(`${tag}: i = dq/dt`, [2e-5, 1.5e-4, 6e-4].every((t) => near(o.i(t), deriv(o.q, t, 1e-9), 1e-4, 1e-9)));
  check(`${tag}: loop rule L di/dt + Ri + q/C = 0`, [3e-5, 2e-4, 7e-4].every((t) => Math.abs(L * deriv(o.i, t, 1e-9) + R * o.i(t) + o.q(t) / C) < 1e-6 * (Math.abs(o.q(0)) / C + 1e-9)));
  check(`${tag}: the energy lost is the heat ∫Ri² dt`, near(o.heat(5e-4), simpson((t) => R * o.i(t) ** 2, 5e-4), 1e-6));
}

// ── AC: reactance, impedance, phase ──
{
  const s = M.series({ V0: 170, f: 60, L: 0.05 });
  check('inductor alone: X_L = ωL', near(s.XL, 2 * Math.PI * 60 * 0.05) && near(s.Z, s.XL));
  check('inductor alone: the current lags the voltage by 90°', near(s.phi, Math.PI / 2));
  check('inductor alone: no average power', Math.abs(s.Pavg) < 1e-9);
  const c = M.series({ V0: 10, f: 1000, C: 2e-6 });
  check('capacitor alone: X_C = 1/ωC', near(c.XC, 1 / (2 * Math.PI * 1000 * 2e-6)) && near(c.Z, c.XC));
  check('capacitor alone: the current leads the voltage by 90°', near(c.phi, -Math.PI / 2));
  const r = M.series({ V0: 5, f: 50, R: 10 });
  check('resistor alone: in phase, I₀ = V₀/R', r.phi === 0 && near(r.I0, 0.5));
}
for (const p of [{ V0: 10, f: 120, R: 40, L: 0.1, C: 20e-6 }, { V0: 162.6, f: 400, R: 30, L: 0.02, C: 10e-6 }, { V0: 3, f: 2e5, R: 5, L: 1e-4, C: 1e-8 }]) {
  const s = M.series(p), tag = `series RLC at ${p.f} Hz`;
  check(`${tag}: Z = √(R² + (X_L − X_C)²)`, near(s.Z, Math.sqrt(p.R ** 2 + (s.XL - s.XC) ** 2)));
  check(`${tag}: tan φ = (X_L − X_C)/R`, near(Math.tan(s.phi), (s.XL - s.XC) / p.R, 1e-9));
  check(`${tag}: the element voltages add to the source voltage at every instant`, [0, 1e-4, 3.7e-3].every((t) => Math.abs(s.vR(t) + s.vL(t) + s.vC(t) - s.v(t)) < 1e-9 * p.V0));
  check(`${tag}: …but their amplitudes add as phasors, √(V_R² + (V_L − V_C)²) = V₀`, near(Math.hypot(s.VR, s.VL - s.VC), p.V0, 1e-12));
  check(`${tag}: average power ½V₀I₀ cos φ = ½I₀²R`, near(s.Pavg, 0.5 * s.I0 ** 2 * p.R, 1e-12));
  const T = 1 / p.f;
  check(`${tag}: the average of v·i over a cycle is P_avg`, near(simpson((t) => s.v(t) * s.i(t), T) / T, s.Pavg, 1e-8));
  check(`${tag}: no average power into L or C`, Math.abs(simpson((t) => s.vL(t) * s.i(t), T) / T) < 1e-9 * s.VL * s.I0 && Math.abs(simpson((t) => s.vC(t) * s.i(t), T) / T) < 1e-9 * s.VC * s.I0);
  const a = s.angle(T / 7);
  check(`${tag}: each phasor's y-projection is the instantaneous value`, near(s.I0 * Math.sin(a.i), s.i(T / 7), 1e-12) && near(s.VL * Math.sin(a.L), s.vL(T / 7), 1e-9) && near(s.VC * Math.sin(a.C), s.vC(T / 7), 1e-9, 1e-12));
}

// ── resonance ──
{
  const p = { R: 10, L: 0.1, C: 10e-6 }, res = M.resonance(p);
  check('resonance: f₀ = 1/(2π√(LC)) = 159.15 Hz', near(res.f0, 1000 / (2 * Math.PI)));
  check('resonance: Q = ω₀L/R = 10', near(res.Q, 10));
  check('resonance: the bandwidth f₂ − f₁ = R/(2πL) = f₀/Q', near(res.f2 - res.f1, res.df, 1e-12) && near(res.df, res.f0 / res.Q, 1e-12));
  check('resonance: f₁f₂ = f₀²', near(res.f1 * res.f2, res.f0 ** 2, 1e-12));
  const at = (f) => M.series({ V0: 10, f, ...p });
  check('resonance: at f₀ the reactances cancel, Z = R and φ = 0', near(at(res.f0).Z, 10, 1e-12) && Math.abs(at(res.f0).phi) < 1e-9);
  check('resonance: the current there is V₀/R — finite', near(at(res.f0).I0, 1, 1e-12));
  check('resonance: half the peak power at f₁ and f₂', near(at(res.f1).Pavg, at(res.f0).Pavg / 2, 1e-9) && near(at(res.f2).Pavg, at(res.f0).Pavg / 2, 1e-9));
  check('resonance: below f₀ capacitive (φ < 0), above inductive (φ > 0)', at(0.8 * res.f0).phi < 0 && at(1.25 * res.f0).phi > 0);
  check('resonance: the power is largest at f₀', [0.9, 0.99, 1.01, 1.2].every((k) => M.powerAt({ V0: 10, f: k * res.f0, ...p }) < at(res.f0).Pavg));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
