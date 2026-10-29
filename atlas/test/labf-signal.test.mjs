// The signal and noise model behind the labf-signal simulation and the lab
// course's noise, lock-in and data-acquisition lessons: white noise's Allan
// deviation falls as 1/√m, flicker's levels off and a random walk's rises;
// the RC equivalent noise bandwidths 1/(4τ), 1/(8τ); a lock-in recovers a
// signal buried a thousand times in noise to within its predicted σ, and that
// σ matches the scatter over many seeds; aliasing (60 Hz sampled at 100 Hz
// appears at 40 Hz); an ideal ADC's error is LSB/√12 rms; and the validator.
//   node atlas/test/labf-signal.test.mjs

import * as M from '../src/viz/model/labf-signal.js';
import { validate, defaults } from '../src/viz/sims/labf-signal.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.abs(b);

// white noise: Allan deviation σ/√m
{
  const x = M.noise({ n: 65536, fs: 10, white: 1, seed: 3 });
  for (const m of [1, 4, 16, 64]) { const a = M.allan(x, m); check(`white Allan at m = ${m} is 1/√m`, close(a, 1 / Math.sqrt(m), 0.08), `${a}`); }
  let s = 0; for (const v of x) s += v * v;
  check('white noise has σ = 1', close(Math.sqrt(s / x.length), 1, 0.02));
}
// flicker: the Allan deviation levels off (ratio over two decades of τ well above the white 1/10)
{
  const x = M.noise({ n: 65536, fs: 10, flicker: 1, seed: 5 });
  const a1 = M.allan(x, 8), a2 = M.allan(x, 512);
  check('flicker Allan deviation is roughly flat', a2 / a1 > 0.4 && a2 / a1 < 2.5, `${a1} ${a2}`);
}
// random walk: the Allan deviation grows as √m
{
  const x = M.noise({ n: 65536, fs: 10, walk: 0.01, seed: 7 });
  const a1 = M.allan(x, 16), a2 = M.allan(x, 1024);
  check('random-walk Allan deviation rises about as √m', a2 / a1 > 4 && a2 / a1 < 14, `${a2 / a1}`);
}
// ENBW against direct integration of |H|²
for (const poles of [1, 2, 4]) {
  const tau = 0.37; let s = 0; const df = 0.0005;
  for (let f = df / 2; f < 400; f += df) s += df / (1 + (2 * Math.PI * f * tau) ** 2) ** poles;
  check(`ENBW of ${poles} RC stage(s)`, close(M.enbw(tau, poles), s, 2e-3), `${M.enbw(tau, poles)} vs ${s}`);
}
check('ENBW 1 pole = 1/(4τ)', close(M.enbw(0.1, 1), 2.5, 1e-12));
check('ENBW 2 poles = 1/(8τ)', close(M.enbw(1, 2), 0.125, 1e-12));

// the lock-in: signal of amplitude 1 under hum of 1400 and white noise of 10 (input rms ≈ 1000)
{
  const L = M.lockin({ A: 1, phi: 0.6, theta: 0, white: 10, hum: 1400, tau: 1, poles: 2, T: 12, seed: 2 });
  check('input rms is about 1000 times the signal amplitude', L.rms > 900 && L.rms < 1100, `${L.rms}`);
  check('lock-in R recovers the amplitude within 4σ', Math.abs(L.R - 1) < 4 * L.sigmaOut + 0.01, `${L.R} ± ${L.sigmaOut}`);
  check('X ≈ A cos φ', Math.abs(L.x - Math.cos(0.6)) < 4 * L.sigmaOut + 0.01, `${L.x}`);
  check('Y ≈ A sin φ', Math.abs(L.y - Math.sin(0.6)) < 4 * L.sigmaOut + 0.01, `${L.y}`);
  check('predicted output σ for white = 10, τ = 1 s, 2 poles is 0.05', close(L.sigmaOut, 10 * Math.sqrt(4 / 20000 / 8), 1e-12));
}
// the predicted σ matches the scatter of X over seeds (white noise only, no signal)
{
  const xs = [];
  for (let s = 1; s <= 60; s++) xs.push(M.lockin({ A: 0, white: 5, tau: 0.05, poles: 1, T: 1, seed: 100 + s, fs: 8000, f: 700 }).x);
  const sd = Math.sqrt(xs.reduce((a, v) => a + v * v, 0) / xs.length);
  const pred = M.lockin({ A: 0, white: 5, tau: 0.05, poles: 1, T: 1, seed: 1, fs: 8000, f: 700 }).sigmaOut;
  check('lock-in output scatter matches the ENBW prediction (±25%)', close(sd, pred, 0.25), `${sd} vs ${pred}`);
}
// aliasing
check('60 Hz sampled at 100 Hz appears at 40 Hz', Math.abs(Math.abs(M.alias(60, 100)) - 40) < 1e-12);
check('1.2 kHz sampled at 1 kHz appears at 200 Hz', Math.abs(M.alias(1200, 1000) - 200) < 1e-9);
check('a tone below Nyquist is unchanged', M.alias(30, 100) === 30);
// ADC quantization error: LSB/√12 rms
{
  const bits = 8, range = 1, lsb = M.lsbOf(bits, range); let s = 0, n = 0;
  for (let i = 0; i < 200000; i++) { const v = 0.95 * Math.sin(0.0012345 * i * 7.1); const e = M.quantize(v, bits, range) - v; s += e * e; n++; }
  check('ideal ADC error is LSB/√12 rms', close(Math.sqrt(s / n), lsb / Math.sqrt(12), 0.03), `${Math.sqrt(s / n)} vs ${lsb / Math.sqrt(12)}`);
  check('ADC clips at full scale', M.quantize(5, 8, 1) === (127 * lsb));
}
// the validator
check('labf-signal defaults are valid', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('labf-signal rejects an unknown mode', validate({ ...defaults, mode: 'radio' }).length > 0);
check('labf-signal rejects poles = 3 (offered: 1, 2, 4)', validate({ ...defaults, mode: 'lockin', poles: 3 }).length > 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
