// The driven damped oscillator model behind cm-resonance and cm-fourier
// (PHYS 3550, module M2): steady amplitude and phase against direct RK4
// integration, the Lorentzian limit and its width 2β, the power balance,
// ring-down energy and Q, Fourier coefficients against numerical integrals,
// Parseval, the response to a pulse train against RK4, and the two
// simulations' parameter validators.
//   node atlas/test/cm-osc.test.mjs

import * as O from '../src/viz/model/cm-osc.js';
import { integrate, simpson } from '../src/viz/model/numeric.js';
import { validate as vRes, defaults as dRes } from '../src/viz/sims/cm-resonance.js';
import { validate as vFou, defaults as dFou } from '../src/viz/sims/cm-fourier.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// steady state against RK4: drive from rest, wait for the transient to die, read the amplitude and lag
for (const [w0, beta, w] of [[10, 1, 9], [10, 1, 10], [10, 2, 14], [4, 0.5, 2], [6, 0.8, 6.5]]) {
  const f = (t, y) => [y[1], Math.cos(w * t) - 2 * beta * y[1] - w0 * w0 * y[0]];
  const T = 25 / beta, sol = integrate(f, [0, 0], 0, T, 60000);
  const tail = sol.filter(([t]) => t > T - 2 * (2 * Math.PI) / w);
  const A = Math.max(...tail.map((r) => Math.abs(r[1])));
  check(`steady amplitude matches RK4 (ω₀ = ${w0}, β = ${beta}, ω = ${w})`, close(A, O.amp(w, w0, beta), 2e-3), `${A} vs ${O.amp(w, w0, beta)}`);
  // x(t) = A cos(ωt − δ): compare at the last sample
  const [tl, xl] = sol[sol.length - 1];
  const xs = O.amp(w, w0, beta) * Math.cos(w * tl - O.phase(w, w0, beta));
  check(`steady phase matches RK4 (ω₀ = ${w0}, β = ${beta}, ω = ${w})`, Math.abs(xl - xs) < 2e-3 * O.amp(w, w0, beta), `${xl} vs ${xs}`);
}
check('the lag is 90° at resonance', close(O.phase(7, 7, 0.3), Math.PI / 2, 1e-12));
check('the lag is near 0 far below resonance and near 180° far above', O.phase(0.1, 7, 0.3) < 0.01 && O.phase(70, 7, 0.3) > Math.PI - 0.01);
check('the peak of A sits at √(ω₀² − 2β²)', (() => { const wp = O.wPeak(10, 2); return O.amp(wp, 10, 2) > O.amp(wp - 1e-3, 10, 2) && O.amp(wp, 10, 2) > O.amp(wp + 1e-3, 10, 2); })());

// the Lorentzian: close to A² near resonance when β ≪ ω₀; width of A² close to 2β, of ⟨P⟩ exactly 2β
for (const [w0, beta] of [[10, 0.1], [10, 0.5], [50, 1]]) {
  const r = O.lorentzA2(w0 + beta, w0, beta) / O.amp(w0 + beta, w0, beta) ** 2;
  check(`Lorentzian ≈ A² at ω₀ + β (β/ω₀ = ${beta / w0})`, Math.abs(r - 1) < 3 * beta / w0, `ratio ${r}`);
  check(`FWHM of A² ≈ 2β (β/ω₀ = ${beta / w0})`, Math.abs(O.fwhmA2(w0, beta) / (2 * beta) - 1) < 2 * beta / w0, `${O.fwhmA2(w0, beta)}`);
}
for (const [w0, beta] of [[10, 0.1], [10, 3], [2, 1.9]]) check(`FWHM of ⟨P⟩ is exactly 2β (ω₀ = ${w0}, β = ${beta})`, close(O.fwhmPower(w0, beta), 2 * beta, 1e-8));

// power balance: the drive's average power equals the damping's, ⟨P⟩/m = βω²A²
{
  const w0 = 5, beta = 0.4, w = 4.2, A = O.amp(w, w0, beta), dl = O.phase(w, w0, beta);
  const v = (t) => -w * A * Math.sin(w * t - dl);
  const T = (2 * Math.PI) / w;
  const drive = simpson((t) => Math.cos(w * t) * v(t), 0, T, 2000) / T;
  const damp = simpson((t) => 2 * beta * v(t) ** 2, 0, T, 2000) / T;
  check('average drive power equals damping power', close(drive, damp, 1e-9));
  check('and equals βω²A²', close(drive, O.power(w, w0, beta), 1e-9));
}

// ring-down: energy decays like e^{−2βt} on average; Q ≈ 2π E / (energy lost per cycle)
{
  const w0 = 20, beta = 0.25, x = O.ringdown(w0, beta, 1, 0);
  const h = 1e-6, E = (t) => O.energy(x(t), (x(t + h) - x(t - h)) / (2 * h), w0);
  check('ring-down starts at x0 with zero velocity', close(x(0), 1, 1e-12) && Math.abs((x(h) - x(-h)) / (2 * h)) < 1e-6);
  const T1 = (2 * Math.PI) / O.w1(w0, beta);
  const r = E(10 * T1) / E(0);
  check('energy after whole cycles falls as e^{−2βt}', close(r, Math.exp(-2 * beta * 10 * T1), 0.02), `${r}`);
  // the energy definition of Q agrees with ω₀/2β up to a correction of relative size about π/Q
  for (const b of [0.25, 0.025]) {
    const xb = O.ringdown(w0, b, 1, 0), Eb = (t) => O.energy(xb(t), (xb(t + h) - xb(t - h)) / (2 * h), w0);
    const T = (2 * Math.PI) / O.w1(w0, b), q = (2 * Math.PI * Eb(0)) / (Eb(0) - Eb(T));
    check(`Q ≈ 2π × energy / energy lost per cycle (Q = ${O.Q(w0, b)})`, Math.abs(q / O.Q(w0, b) - 1) < 1.1 * Math.PI / O.Q(w0, b), `${q} vs ${O.Q(w0, b)}`);
  }
}

// Fourier coefficients against direct integrals over one period
for (const [wave, d] of [['pulse', 0.5], ['pulse', 0.2], ['square', 0.5], ['sawtooth', 0.5], ['triangle', 0.5]]) {
  const tau = 2, h = 1.7, w = Math.PI, C = O.coeffs(wave, 8, h, d);
  const g = (t) => O.wave(wave, t, tau, h, d);
  let worst = Math.abs(simpson(g, -tau / 2, tau / 2, 20000) / tau - C.c0);
  for (let n = 1; n <= 8; n++) {
    const an = (2 / tau) * simpson((t) => g(t) * Math.cos(n * w * t), -tau / 2, tau / 2, 20000);
    const bn = (2 / tau) * simpson((t) => g(t) * Math.sin(n * w * t), -tau / 2, tau / 2, 20000);
    worst = Math.max(worst, Math.abs(an - C.a[n - 1]), Math.abs(bn - C.b[n - 1]));
  }
  check(`Fourier coefficients of ${wave} (d = ${d}) match direct integrals`, worst < 2e-3, `worst ${worst}`);
  const ms = simpson((t) => g(t) ** 2, -tau / 2, tau / 2, 20000) / tau;
  const C400 = O.coeffs(wave, 4000, h, d);
  check(`Parseval holds for ${wave}`, close(O.meanSquare(C400), ms, 2e-3), `${O.meanSquare(C400)} vs ${ms}`);
}
check('a half-duty pulse train has no even harmonics', O.coeffs('pulse', 6, 1, 0.5).a.every((an, i) => (i % 2 ? an === 0 : an !== 0)));
check('the third harmonic of a half-duty pulse of height h is 2h/3π', close(O.coeffs('pulse', 3, 2, 0.5).a[2], -(2 * 2) / (3 * Math.PI), 1e-12));
check('partial sums converge to the wave away from jumps', Math.abs(O.partial(O.coeffs('pulse', 400, 1, 0.3), 0.1, 2) - 1) < 0.02);

// the series response against RK4 for a pulse train
{
  const tau = 2, w0 = 3 * Math.PI, beta = 0.3, h = 1, d = 0.3;
  const C = O.coeffs('pulse', 60, h, d), R = O.response(C, tau, w0, beta, 60);
  const smooth = (t) => O.partial(O.coeffs('pulse', 60, h, d), t, tau, 60);   // the same band-limited force the series sees
  const f = (t, y) => [y[1], smooth(t) - 2 * beta * y[1] - w0 * w0 * y[0]];
  const T = 40 / beta, sol = integrate(f, [R.x(0), (R.x(1e-6) - R.x(-1e-6)) / 2e-6], 0, T, 120000);
  const worst = Math.max(...sol.filter((_, i) => i % 400 === 0).map(([t, x]) => Math.abs(x - R.x(t))));
  check('steady response of a pulse train matches RK4 from the steady start', worst < 1e-4, `worst ${worst}`);
  const best = R.harm.reduce((b, x) => (x.A > b.A ? x : b));
  check('the third harmonic dominates when ω₀ = 3ω', best.n === 3);
}

// validators
check('cm-resonance defaults validate', vRes(dRes).length === 0, vRes(dRes).join('; '));
check('cm-resonance rejects w0 beyond the axis', vRes({ ...dRes, w0: 30 }).length > 0);
check('cm-resonance rejects an out-of-range slider value', vRes({ ...dRes, beta: 9 }).length > 0);
check('cm-fourier defaults validate', vFou(dFou).length === 0, vFou(dFou).join('; '));
check('cm-fourier rejects an unknown wave', vFou({ ...dFou, wave: 'zigzag' }).length > 0);
check('cm-fourier rejects a fractional N', vFou({ ...dFou, N: 2.5 }).length > 0);

console.log(`cm-osc: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
