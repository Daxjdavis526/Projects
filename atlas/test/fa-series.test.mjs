// The Fourier-series model behind sims/fa-series.js: closed-form coefficients
// against numerical quadrature, Parseval's identity, the exact rms error
// against direct integration, Dirichlet's midpoint value at a jump, the Gibbs
// overshoot (2/π)Si(π), Fejér sums that never overshoot, and the sup error
// stuck at half the jump while the rms error falls.
//   node atlas/test/fa-series.test.mjs

import * as M from '../src/viz/model/fa-series.js';
import * as S from '../src/viz/sims/fa-series.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const PI = Math.PI;
// midpoint rule over a period with many points (fine for jumps: error O(1/n))
const avg = (g, n = 200000) => { let s = 0; for (let i = 0; i < n; i++) s += g(-PI + (2 * PI * (i + 0.5)) / n); return s / n; };

for (const w of M.WAVES) {
  const C = M.coeffs(w, 6);
  check(`${w}: a₀/2 is the mean`, near(C.a[0], avg((x) => M.f(w, x)), 1e-5));
  for (let n = 1; n <= 6; n++) {
    check(`${w}: a${n} by quadrature`, Math.abs(C.a[n] - 2 * avg((x) => M.f(w, x) * Math.cos(n * x))) < 2e-5, `${C.a[n]}`);
    check(`${w}: b${n} by quadrature`, Math.abs(C.b[n] - 2 * avg((x) => M.f(w, x) * Math.sin(n * x))) < 2e-5, `${C.b[n]}`);
  }
  check(`${w}: ⟨f²⟩ by quadrature`, near(M.WAVE[w].msq, avg((x) => M.f(w, x) ** 2), 1e-5));
  // Parseval: the energies add up to ⟨f²⟩
  const E = M.energies(w, 20000);
  check(`${w}: Parseval`, Math.abs(E.reduce((s, e) => s + e, 0) - M.WAVE[w].msq) < 1e-4);
  // rms error against direct integration, for each summation method
  for (const m of M.METHODS) {
    const N = 7, C7 = M.coeffs(w, N);
    const direct = Math.sqrt(avg((x) => (M.f(w, x) - M.partial(C7, x, N, m)) ** 2, 40000));
    check(`${w}/${m}: rms error N = 7`, Math.abs(M.rmsError(w, N, m) - direct) < 2e-4, `${M.rmsError(w, N, m)} vs ${direct}`);
  }
  check(`${w}: Bessel’s sum below 1`, M.captured(w, 5) < 1 && M.captured(w, 5) > 0.5);
}

// Dirichlet: at a jump the series gives the midpoint
{
  const C = M.coeffs('square', 99);
  check('square: S_N(0) = 0, the midpoint', Math.abs(M.partial(C, 0, 99)) < 1e-12);
  const Cs = M.coeffs('saw', 400);
  check('sawtooth: S_N(π) = 0, the midpoint', Math.abs(M.partial(Cs, PI, 400)) < 1e-12);
  check('sawtooth: S_N(1) → 1/π slowly', Math.abs(M.partial(Cs, 1, 400) - 1 / PI) < 3e-3);
}

// Gibbs: the constant, and the peaks
check('Si(π) = 1.851937052', near(M.SI_PI, 1.851937052, 1e-9));
check('Gibbs peak 1.178979744', near(M.GIBBS_PEAK, 1.178979744, 1e-9));
check('overshoot 8.949% of the jump', near(M.GIBBS_FRAC, 0.0894898722, 1e-8));
{
  const p = M.peak('square', 199);
  check('square N = 199: peak near 1.17898', Math.abs(p.y - M.GIBBS_PEAK) < 2e-4, `${p.y}`);
  check('square N = 199: peak at π/(N+1) (or its mirror)', Math.min(Math.abs(p.x - PI / 200), Math.abs(p.x - (PI - PI / 200))) < 1e-6, `${p.x}`);
  const q = M.peak('square', 9);
  check('square N = 9: first maximum at π/10 (or its mirror π − π/10)', Math.min(Math.abs(q.x - PI / 10), Math.abs(q.x - (PI - PI / 10))) < 1e-6);
  check('square N = 9: S_9(π/10) is the peak', near(q.y, 1.1824, 1e-3), `${q.y}`);
  for (const N of [5, 25, 99]) check(`square: the Fejér sum never overshoots (N = ${N})`, M.peak('square', N, 'fejer').y < 1);
  check('square: Lanczos cuts the overshoot to about 1.2% of the jump (N = 49)', Math.abs(M.peak('square', 49, 'lanczos').y - 1.0237) < 1e-3);
  const ps = M.peak('saw', 400);
  check('sawtooth: overshoot of the jump (2) is the same 8.95%', Math.abs((ps.y - 1) / 2 - M.GIBBS_FRAC) < 1.5e-3, `${ps.y}`);
}

// sup versus rms
{
  const c = M.errorCurves('square', 'dirichlet', 1, 60);
  check('square: sup error stays at half the jump', c.sup.every((s) => Math.abs(s - 1) < 1e-6));
  check('square: rms error falls like N^(−1/2)', c.rms[59] < 0.11 && near(c.rms[59] / c.rms[14], Math.sqrt(15 / 60), 0.08));
  const t = M.errorCurves('triangle', 'dirichlet', 0, 60);
  check('triangle: sup error falls (uniform convergence)', t.sup[59] < 0.012 && t.sup[59] < t.sup[9] / 4);
  check('triangle: sup error at its kink x = 0 equals the tail sum', near(t.sup[59], (8 / PI ** 2) * [...Array(2000).keys()].map((k) => 61 + 2 * k).reduce((s, n) => s + 1 / n ** 2, 0), 2e-3));
  const s = M.errorCurves('smooth', 'dirichlet', 0.3, 20, false);
  check('smooth: rms error falls exponentially', s.rms[19] < 1e-15 * 1e3 && s.rms[9] < 1e-8);
}

// the sim's validate
check('validate accepts the defaults', S.validate({}).length === 0);
check('validate rejects an unknown wave', S.validate({ wave: 'zigzag' }).length > 0);
check('validate rejects N out of range', S.validate({ N: 0 }).length > 0);
check('validate rejects an unknown panel', S.validate({ panels: ['x', 'q'] }).length > 0);

console.log(`fa-series: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
