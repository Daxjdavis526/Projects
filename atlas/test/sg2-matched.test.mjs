// The matched-filter toy behind the sg2-matched simulation (Foundations course,
// module G4): the FFT against a direct transform; the noise is standard normal;
// the FFT correlation equals the direct sum at sampled lags; with noise alone
// the phase-maximized SNR has mean √(π/2) (ρ² is χ² with 2 degrees of freedom);
// with the exact template the SNR averages ρ_opt = amp‖ĥ‖ (within the noise's
// spread of about 1); the filter finds the arrival time; the template bank
// peaks at the true chirp mass; the posterior has unit area and its credible
// interval holds the truth and narrows as the signal grows; validate() accepts
// the defaults and rejects nonsense.
//   node atlas/test/sg2-matched.test.mjs

import * as M from '../src/viz/model/sg2-matched.js';
import { validate, defaults } from '../src/viz/sims/sg2-matched.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// FFT against the direct DFT
{
  const n = 64, re = Array.from({ length: n }, (_, i) => Math.sin(i * 0.37) + 0.2 * i), im = Array.from({ length: n }, (_, i) => Math.cos(i * 1.3));
  const R = Float64Array.from(re), I = Float64Array.from(im);
  M.fft(R, I);
  let worst = 0;
  for (let k = 0; k < n; k++) {
    let a = 0, b = 0;
    for (let j = 0; j < n; j++) { const th = (-2 * Math.PI * j * k) / n; a += re[j] * Math.cos(th) - im[j] * Math.sin(th); b += re[j] * Math.sin(th) + im[j] * Math.cos(th); }
    worst = Math.max(worst, Math.abs(a - R[k]), Math.abs(b - I[k]));
  }
  check('FFT matches the direct DFT', worst < 1e-9, `worst ${worst}`);
  M.fft(R, I, true);
  check('inverse FFT undoes it', re.every((v, i) => Math.abs(v - R[i]) < 1e-9) && im.every((v, i) => Math.abs(v - I[i]) < 1e-9));
}

// noise statistics
{
  const g = M.gaussian(200000, 5);
  const mean = g.reduce((a, b) => a + b, 0) / g.length, v = g.reduce((a, b) => a + (b - mean) ** 2, 0) / g.length;
  check('noise mean ≈ 0', Math.abs(mean) < 0.01, mean);
  check('noise variance ≈ 1', Math.abs(v - 1) < 0.01, v);
  check('same seed, same noise', M.gaussian(10, 3).every((x, i) => x === M.gaussian(10, 3)[i]));
}

// FFT correlation equals the direct sum
{
  const R = M.record({ Mc: 30, amp: 1, seed: 2 }), T = M.template(27);
  const rho = M.snrSeries(R.d, T);
  let worst = 0;
  for (const j of [T.L - 1, 1500, 2600, 3481, M.N - 1]) worst = Math.max(worst, Math.abs(rho[j] - M.snrAt(R.d, T, j)));
  check('FFT SNR equals the direct correlation', worst < 1e-9, worst);
  check('no SNR where the template sticks out', Number.isNaN(rho[T.L - 2]) && Number.isFinite(rho[T.L - 1]));
  // linearity: noise part + amp × unit part
  const amp = 1.7, R2 = M.record({ Mc: 30, amp, seed: 2 });
  const a = M.snrSeries(R2.d, T), b = M.snrFrom(M.correlate(R2.noise, T), M.correlate(R2.unit, T), amp);
  let w2 = 0;
  for (let j = T.L - 1; j < M.N; j++) w2 = Math.max(w2, Math.abs(a[j] - b[j]));
  check('record correlation = noise part + amp × signal part', w2 < 1e-9, w2);
}

// the two quadratures are nearly orthogonal and equal in length
{
  const T = M.template(30);
  let cs = 0, ss = 0;
  for (let k = 0; k < T.L; k++) { cs += T.c[k] * T.s[k]; ss += T.s[k] ** 2; }
  check('quadratures nearly orthogonal', Math.abs(cs) / T.norm ** 2 < 0.02, cs / T.norm ** 2);
  check('quadratures nearly equal in norm', Math.abs(Math.sqrt(ss) / T.norm - 1) < 0.02);
  check('template ends near 250 Hz and starts near 30 Hz', Math.abs(T.f[T.L - 1] - 250) < 1 && Math.abs(T.f[0] - 30) < 0.5, `${T.f[0]} ${T.f[T.L - 1]}`);
  check('template lasts τ(30 Hz) − τ(250 Hz) = 0.256 s for 30 M☉', Math.abs(T.duration - 0.256) < 0.002, T.duration);
}

// noise alone: mean ρ = √(π/2); with the exact template, ρ ≈ ρ_opt
{
  const T = M.template(30);
  let s = 0, n = 0, sOpt = 0, s2 = 0, found = 0;
  const K = 30;
  for (let seed = 1; seed <= K; seed++) {
    const N0 = M.record({ Mc: 30, amp: 0, seed });
    for (const v of M.snrSeries(N0.d, T)) if (Number.isFinite(v)) { s += v; n++; }
    const R = M.record({ Mc: 30, amp: 1, seed });
    const r = M.snrSeries(R.d, T)[R.end];
    sOpt += r; s2 += r * r;
    if (Math.abs(M.peak(M.snrSeries(R.d, T)).j - R.end) <= 10) found++;
  }
  const mean = s / n;
  check('noise-only SNR mean ≈ √(π/2) = 1.2533', Math.abs(mean - Math.sqrt(Math.PI / 2)) < 0.03, mean);
  const R = M.record({ Mc: 30, amp: 1, seed: 1 });
  const mu = sOpt / K, sd = Math.sqrt(s2 / K - mu * mu);
  check('SNR at the true time averages ρ_opt (within 0.5)', Math.abs(mu - R.optimal) < 0.5, `${mu} vs ${R.optimal}`);
  check('its scatter is about 1', sd > 0.6 && sd < 1.4, sd);
  check('ρ_opt = amp × ‖ĥ‖ = 7.68 for 30 M☉ at amp 1', Math.abs(R.optimal - 7.68) < 0.01, R.optimal);
  check('the filter finds the arrival time (to 2.5 ms) in most draws', found >= 0.9 * K, `${found}/${K}`);
}

// bank and posterior
{
  const ms = M.bank(15, 60, 181);
  const R = M.record({ Mc: 30, amp: 1, seed: 2 });
  const parts = M.scanParts(R, ms);
  const direct = M.scan(R.d, ms.slice(0, 5));
  check('scanAt equals the direct scan', direct.every((v, i) => Math.abs(v - M.scanAt(parts.slice(0, 5), 1)[i]) < 1e-9));
  let lastW = Infinity, ok = true;
  for (const amp of [1, 2, 3]) {
    const sc = M.scanAt(parts, amp), post = M.posterior(ms, sc), ci = M.credible(ms, post, 0.9);
    let area = 0;
    for (let i = 1; i < ms.length; i++) area += ((post[i] + post[i - 1]) / 2) * (ms[i] - ms[i - 1]);
    check(`posterior has unit area (amp ${amp})`, Math.abs(area - 1) < 1e-9, area);
    check(`90% interval holds 30 M☉ (amp ${amp})`, ci.lo < 30 && ci.hi > 30, `${ci.lo}–${ci.hi}`);
    check(`bank peaks within 1 M☉ of the truth (amp ${amp})`, Math.abs(ms[sc.indexOf(Math.max(...sc))] - 30) <= 1);
    if (!(ci.hi - ci.lo < lastW)) ok = false;
    lastW = ci.hi - ci.lo;
  }
  check('the interval narrows as the signal grows', ok);
}

// noise-free: the exact template is the loudest (projection onto the quadrature plane)
for (const Mc of [20, 25, 40, 55]) {
  const R = M.record({ Mc, amp: 1, seed: 2 });
  const ms = M.bankFor(Mc).filter((m) => Math.abs(m - Mc) < 2);
  const sc = ms.map((m) => M.peak(M.snrSeries(R.unit, M.cachedTemplate(m))).rho);
  const best = ms[sc.indexOf(Math.max(...sc))];
  check(`noise-free bank peaks at the true ${Mc} M☉`, Math.abs(best - Mc) < 1e-6, best);
  check(`noise-free peak SNR equals ‖signal‖ (${Mc} M☉)`, Math.abs(Math.max(...sc) - R.optimal) < 1e-6 * R.optimal);
}
{
  const b = M.bankFor(30);
  check('bankFor is sorted and spans 15–60', b.every((v, i) => i === 0 || v > b[i - 1]) && b[0] === 15 && b[b.length - 1] === 60);
}

// the time-marginalized posterior the simulation draws
{
  const ms = M.bankFor(30), R = M.record({ Mc: 30, amp: 1, seed: 2 }), parts = M.scanParts(R, ms);
  let last = Infinity, ok = true;
  for (const amp of [1, 2, 3]) {
    const { rho, logL } = M.scanBoth(parts, amp);
    check(`scanBoth ρ equals scanAt (amp ${amp})`, rho.every((v, i) => v === M.scanAt([parts[i]], amp)[0]));
    check(`logL ≥ ρ²/2 (the sum includes the peak) (amp ${amp})`, logL.every((v, i) => v >= rho[i] ** 2 / 2 - 1e-9));
    const post = M.posteriorLog(ms, logL), ci = M.credible(ms, post, 0.9);
    let area = 0;
    for (let i = 1; i < ms.length; i++) area += ((post[i] + post[i - 1]) / 2) * (ms[i] - ms[i - 1]);
    check(`time-marginalized posterior has unit area (amp ${amp})`, Math.abs(area - 1) < 1e-9);
    check(`its 90% interval holds 30 M☉ (amp ${amp})`, ci.lo < 30 && ci.hi > 30, `${ci.lo}–${ci.hi}`);
    if (!(ci.hi - ci.lo < last)) ok = false;
    last = ci.hi - ci.lo;
  }
  check('and narrows as the signal grows', ok);
  let cover = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const Rs = M.record({ Mc: 30, amp: 1.5, seed }), { logL } = M.scanBoth(M.scanParts(Rs, ms), 1.5), ci = M.credible(ms, M.posteriorLog(ms, logL), 0.9);
    if (ci.lo < 30 && ci.hi > 30) cover++;
  }
  check('90% intervals cover the truth in 15–20 of 20 noise draws', cover >= 15, `${cover}/20`);
}

// validate
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('a posterior view validates', validate({ ...defaults, panels: ['scan', 'post'], amp: 2.5, controls: ['amp', 'noise'] }).length === 0);
check('bad panel rejected', validate({ ...defaults, panels: ['nope'] }).length > 0);
check('Mc out of range rejected', validate({ ...defaults, Mc: 80 }).length > 0);
check('tpl off the slider grid rejected', validate({ ...defaults, tpl: 24.3 }).length > 0);
check('unknown hide rejected', validate({ ...defaults, hide: ['x'] }).length > 0);

console.log(`sg2-matched: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
