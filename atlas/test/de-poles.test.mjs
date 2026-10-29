// The transfer-function model behind sims/de-poles.js, checked against
// closed forms from the Laplace table and against direct numerical
// integration of the differential equation the poles belong to:
// first order (an RC filter), a damped pair, a double pole (critical
// damping), a triple pole, distinct poles of order three and four; step
// responses that settle on 1; the frequency response of an RC filter and of
// a spring–mass–damper; the resonance peak and the bandwidth.
//   node atlas/test/de-poles.test.mjs

import * as M from '../src/viz/model/de-poles.js';
import * as S from '../src/viz/sims/de-poles.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const TS = [0, 0.1, 0.37, 1, 2.2, 3.9, 6.5];
const agree = (f, g, tol = 1e-10) => TS.every((t) => near(f(t), g(t), tol));
const worst = (f, g) => Math.max(...TS.map((t) => Math.abs(f(t) - g(t))));

// the poles of a pole list
{
  const P = M.polesOf([{ re: -1 }, { re: -0.5, im: 2 }]);
  check('a real pole and a pair are three poles', P.length === 3 && M.orderOf([{ re: -1 }, { re: -0.5, im: 2 }]) === 3);
  check('the pair is σ ± iω, upper first', P[1].re === -0.5 && P[1].im === 2 && P[2].im === -2);
  check('a pair with ω = 0 is a double real pole', M.clusters(M.polesOf([{ re: -2, im: 0 }])).length === 1 && M.clusters(M.polesOf([{ re: -2, im: 0 }]))[0].m === 2);
  check('the gain makes H(0) = 1', near(M.freq(P, M.gain(P), 0).mag, 1, 1e-12) && near(M.freq(P, M.gain(P), 0).im, 0, 1e-12));
  check('K = P(0) = 1 × (0.25 + 4) = 4.25', near(M.gain(P), 4.25, 1e-12));
}

// first order: H = a/(s + a), h = a e^{−at}, step 1 − e^{−at}
{
  const a = 2.5, P = M.polesOf([{ re: -a }]);
  check('first order: h(t) = a e^(−at)', agree(M.impulse(P), (t) => a * Math.exp(-a * t)));
  check('first order: step response 1 − e^(−at)', agree(M.stepResponse(P), (t) => 1 - Math.exp(-a * t)));
  check('first order: |H(iω)| = 1/√(1 + (ω/a)²)', [0.3, 1, 2.5, 7].every((w) => near(M.freq(P, M.gain(P), w).mag, 1 / Math.sqrt(1 + (w / a) ** 2), 1e-12)));
  check('first order: phase −arctan(ω/a)', [0.3, 1, 2.5, 7].every((w) => near(M.freq(P, M.gain(P), w).phase, -Math.atan(w / a), 1e-12)));
  check('first order: the bandwidth is the pole’s distance from the origin', near(M.cutoff(P, M.gain(P), 20), a, 1e-6));
  check('h(t) = 0 before the impulse', M.impulse(P)(-0.5) === 0);
}

// a damped pair σ ± iω: h = K e^{σt} sin(ωt)/ω; step 1 − e^{σt}(cos ωt − (σ/ω) sin ωt)
{
  const s = -0.4, w = 2.2, P = M.polesOf([{ re: s, im: w }]), K = s * s + w * w;
  check('pair: h(t) = K e^(σt) sin(ωt)/ω', agree(M.impulse(P), (t) => (K * Math.exp(s * t) * Math.sin(w * t)) / w));
  check('pair: step response', agree(M.stepResponse(P), (t) => 1 - Math.exp(s * t) * (Math.cos(w * t) - (s / w) * Math.sin(w * t))));
  // the spring–mass–damper with ω₀, ζ: |H| = 1/√((1 − r²)² + (2ζr)²)
  const w0 = Math.hypot(s, w), zeta = -s / w0;
  check('pair: |H(iω)| is the oscillator’s amplification', [0.5, 1.8, 2.25, 4].every((x) => { const r = x / w0; return near(M.freq(P, K, x).mag, 1 / Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2), 1e-12); }));
  const pk = M.peak(P, K, 10);
  check('pair: the resonance peak sits at ω₀√(1 − 2ζ²)', near(pk.w, w0 * Math.sqrt(1 - 2 * zeta * zeta), 1e-6), `${pk.w}`);
  check('pair: the peak gain is 1/(2ζ√(1 − ζ²))', near(pk.mag, 1 / (2 * zeta * Math.sqrt(1 - zeta * zeta)), 1e-9));
  check('pair: the phase unwraps through −90° at ω₀', near(M.phaseUnwrapped(P, K, w0), -Math.PI / 2, 1e-12));
  const terms = M.modeTerms(P, K);
  check('pair: one real term per pole group', terms.length === 1 && agree(terms[0].f, M.impulse(P)));
  const sterms = M.modeTerms(P, K, { step: true });
  check('pair, step: two groups (the pair and the pole at 0) that sum to the response', sterms.length === 2 && agree((t) => sterms[0].f(t) + sterms[1].f(t), M.stepResponse(P)));
}

// a double pole (critical damping): h = a² t e^{−at}; step 1 − (1 + at) e^{−at}
{
  const a = 1.3, P = M.polesOf([{ re: -a, im: 0 }]);
  check('double pole: h(t) = a² t e^(−at)', agree(M.impulse(P), (t) => a * a * t * Math.exp(-a * t)));
  check('double pole: step 1 − (1 + at) e^(−at)', agree(M.stepResponse(P), (t) => 1 - (1 + a * t) * Math.exp(-a * t)));
  // two separate real poles at the same place give the same answer
  check('two real poles at one place are a double pole', agree(M.impulse(M.polesOf([{ re: -a }, { re: -a }])), (t) => a * a * t * Math.exp(-a * t)));
  // nearly coincident poles (not merged) agree with the double pole to O(δ)
  const near2 = M.impulse(M.polesOf([{ re: -a }, { re: -a - 1e-5 }]));
  check('nearly coincident poles approach the double pole smoothly', worst(near2, (t) => a * a * t * Math.exp(-a * t)) < 1e-4);
}

// a triple pole: h = a³ t² e^{−at}/2
{
  const a = 0.8, P = M.polesOf([{ re: -a }, { re: -a, im: 0 }]);
  check('triple pole: h(t) = a³ t² e^(−at)/2', agree(M.impulse(P), (t) => (a ** 3 * t * t * Math.exp(-a * t)) / 2));
  check('triple pole: the step response settles on 1', near(M.stepResponse(P)(60), 1, 1e-9));
}

// distinct poles: compare with RK4 on the differential equation they belong to
function ode(poles, K, T, n = 20000, step = false) {
  // the monic characteristic polynomial's real coefficients, highest first
  let c = [{ re: 1, im: 0 }];
  for (const p of poles) {
    const next = Array.from({ length: c.length + 1 }, () => ({ re: 0, im: 0 }));
    c.forEach((x, i) => { next[i].re += x.re; next[i].im += x.im; next[i + 1].re -= x.re * p.re - x.im * p.im; next[i + 1].im -= x.re * p.im + x.im * p.re; });
    c = next;
  }
  const a = c.map((x) => x.re), N = poles.length;
  // y^(N) = K u − a1 y^(N−1) − … − aN y, with u = 1 (step) or the impulse as y^(N−1)(0) = K
  const f = (y) => { const d = y.slice(1); let top = step ? K : 0; for (let i = 0; i < N; i++) top -= a[i + 1] * y[N - 1 - i]; d.push(top); return d; };
  let y = Array(N).fill(0);
  if (!step) y[N - 1] = K;
  const h = T / n;
  for (let i = 0; i < n; i++) {
    const k1 = f(y), k2 = f(y.map((v, j) => v + (h / 2) * k1[j])), k3 = f(y.map((v, j) => v + (h / 2) * k2[j])), k4 = f(y.map((v, j) => v + h * k3[j]));
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
  }
  return y[0];
}
for (const [name, spec] of [
  ['order 3: a real pole and a pair', [{ re: -1.5 }, { re: -0.3, im: 1.7 }]],
  ['order 4: two pairs (two modes)', [{ re: -0.2, im: 1 }, { re: -0.5, im: 2.6 }]],
  ['order 3: an unstable real pole', [{ re: 0.3 }, { re: -1, im: 1 }]],
  ['order 2: two real poles (overdamped)', [{ re: -0.5 }, { re: -3 }]],
]) {
  const P = M.polesOf(spec), K = M.gain(P);
  for (const T of [0.7, 3.1]) {
    check(`${name}: impulse response at t = ${T} matches RK4`, near(M.impulse(P)(T), ode(P, K, T), 1e-8), `${M.impulse(P)(T)} vs ${ode(P, K, T)}`);
    check(`${name}: step response at t = ${T} matches RK4`, near(M.stepResponse(P)(T), ode(P, K, T, 20000, true), 1e-8));
  }
  const parts = M.modeTerms(P, K);
  check(`${name}: the mode terms add up to the impulse response`, agree((t) => parts.reduce((s, q) => s + q.f(t), 0), M.impulse(P)));
}

// the frequency response is built from distances: |H(iω)| = |K| / Π |iω − p|
{
  const P = M.polesOf([{ re: -1 }, { re: -0.3, im: 2 }]), K = M.gain(P);
  check('|H(iω)| = |K| / Π|iω − p|', [0, 0.7, 2, 3.3].every((w) => near(M.freq(P, K, w).mag, Math.abs(K) / P.reduce((s, p) => s * M.dist(p, w), 1), 1e-12)));
  check('the slowest pole is the one nearest the imaginary axis', M.slowest(P).re === -0.3 && M.slowest(P).im === 2);
}

// the simulation's checks
{
  const ok = { ...S.defaults };
  check('sim defaults validate', S.validate(ok).length === 0, S.validate(ok).join('; '));
  check('sim rejects an order above four', S.validate({ ...ok, poles: [{ re: -1, im: 1 }, { re: -1, im: 2 }, { re: -2 }] }).length > 0);
  check('sim rejects a negative imaginary part', S.validate({ ...ok, poles: [{ re: -1, im: -1 }] }).length > 0);
  check('sim rejects an unknown panel', S.validate({ ...ok, panels: ['s', 'x'] }).length > 0);
  check('sim rejects a probe outside its range', S.validate({ ...ok, w: 99 }).length > 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
