// The oscillator model behind the c3-roots simulation — characteristic roots,
// free motion in every regime, gain, phase lag, the resonance peak and the
// forced motion from rest — checked against the equation itself and against
// direct RK4 integration; and the simulation's parameter validator.
//   node atlas/test/c3-roots.test.mjs

import * as M from '../src/viz/model/c3-roots.js';
import { integrate } from '../src/viz/model/numeric.js';
import { validate, defaults } from '../src/viz/sims/c3-roots.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// roots satisfy r² + 2ζω₀r + ω₀² = 0 (complex arithmetic by hand)
for (const [zeta, w0] of [[0, 2], [0.2, 2], [0.7, 1.3], [1, 3], [1.8, 0.8], [-0.2, 2], [-1.5, 1]]) {
  const rs = M.roots(zeta, w0);
  const worst = Math.max(...rs.map(({ re, im }) => Math.hypot(re * re - im * im + 2 * zeta * w0 * re + w0 * w0, 2 * re * im + 2 * zeta * w0 * im)));
  check(`roots solve the characteristic equation (ζ = ${zeta})`, worst < 1e-9, `residual ${worst}`);
  check(`sum of roots is −2ζω₀ and product ω₀² (ζ = ${zeta})`, close(rs[0].re + rs[1].re, -2 * zeta * w0, 1e-9) && close(rs[0].re * rs[1].re - rs[0].im * rs[1].im, w0 * w0, 1e-9));
}
check('complex roots lie on the circle |r| = ω₀', close(Math.hypot(M.roots(0.3, 2.5)[0].re, M.roots(0.3, 2.5)[0].im), 2.5, 1e-12));
check('regimes', M.regime(0) === 'undamped' && M.regime(0.3) === 'underdamped' && M.regime(1) === 'critically damped' && M.regime(2) === 'overdamped' && M.regime(-0.1) === 'growing');

// free motion against RK4, in every regime, from two kinds of start
for (const [zeta, w0, x0, v0] of [[0, 2, 1, 0], [0.15, 2, 1, 0], [0.5, 1.5, 0.3, -1], [1, 2, 1, 0], [1, 2, 0, 1], [2.2, 1, 1, 0.5], [-0.1, 2, 1, 0]]) {
  const { x } = M.free(zeta, w0, x0, v0);
  const sol = integrate(M.rhs(zeta, w0), [x0, v0], 0, 8, 8000);
  const worst = Math.max(...sol.map(([t, y]) => Math.abs(x(t) - y) / Math.max(1, Math.abs(y))));
  check(`free motion matches RK4 (ζ = ${zeta}, x0 = ${x0}, v0 = ${v0})`, worst < 1e-7, `worst ${worst}`);
}
{
  const { x, R } = M.free(0.2, 2, 1, 0);
  let ok = true;
  for (let t = 0; t < 10; t += 0.01) if (Math.abs(x(t)) > R * Math.exp(-0.4 * t) + 1e-12) ok = false;
  check('underdamped motion stays inside its envelope', ok);
}

// gain and phase: the textbook values
check('gain is 1 for a very slow drive', close(M.gain(1e-6, 0.3), 1, 1e-9));
check('gain at resonance is 1/(2ζ)', close(M.gain(1, 0.1), 5, 1e-12));
check('gain falls off as 1/W² far above resonance', close(M.gain(100, 0.2) * 1e4, 1, 1e-3));
check('phase lag is 90° at resonance', close(M.lag(1, 0.25), Math.PI / 2, 1e-12));
check('phase lag is near 0 below and near 180° above', M.lag(0.1, 0.1) < 0.03 && M.lag(10, 0.1) > Math.PI - 0.03);
for (const zeta of [0.05, 0.2, 0.5, 0.65]) {
  const pk = M.peak(zeta);
  let best = [0, 0];
  for (let W = 0.001; W < 3; W += 0.0005) { const g = M.gain(W, zeta); if (g > best[1]) best = [W, g]; }
  check(`the resonance peak sits at √(1 − 2ζ²) (ζ = ${zeta})`, Math.abs(best[0] - pk.W) < 1e-3 && close(best[1], pk.M, 1e-6), `${best} vs ${pk.W}, ${pk.M}`);
}
check('no peak above ζ = 1/√2', M.peak(0.8).W === 0 && M.peak(0.8).M === 1);

// forced motion from rest against RK4
for (const [zeta, w0, W] of [[0.1, 2, 0.8], [0.1, 2, 1], [0.3, 1.5, 2.2], [1.5, 1, 1], [0, 2, 0.6], [0, 2, 1]]) {
  const { x } = M.forced(zeta, w0, W);
  const sol = integrate(M.rhs(zeta, w0, W, 1), [0, 0], 0, 20, 20000);
  const worst = Math.max(...sol.map(([t, y]) => Math.abs(x(t) - y) / Math.max(1, Math.abs(y))));
  check(`forced motion from rest matches RK4 (ζ = ${zeta}, ω/ω₀ = ${W})`, worst < 1e-6, `worst ${worst}`);
}
{
  const { x, steady, A } = M.forced(0.2, 2, 0.9);
  check('long after the start only the steady motion is left', Math.abs(x(60) - steady(60)) < 1e-6 && close(A, M.gain(0.9, 0.2), 1e-12));
  const res = M.forced(0, 2, 1);
  check('undamped resonance grows linearly: x = (ω₀t/2) sin ω₀t', res.steady === null && close(res.x(Math.PI / 4 + 3 * Math.PI), (2 * (Math.PI / 4 + 3 * Math.PI) / 2) * Math.sin(2 * (Math.PI / 4 + 3 * Math.PI)), 1e-12));
}

// the validator
check('defaults validate', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('forced defaults validate', validate({ ...defaults, mode: 'forced', zeta: 0.1 }).length === 0);
check('a bad mode is caught', validate({ ...defaults, mode: 'driven' }).length > 0);
check('a zeta outside its slider is caught', validate({ ...defaults, zeta: 5 }).length > 0);
check('a still picture may use any zeta', validate({ ...defaults, zeta: 5, sliders: false }).length === 0);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
