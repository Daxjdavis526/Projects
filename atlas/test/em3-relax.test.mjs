// The relaxation model behind the em3-relax simulation: every method reaches
// the same fixed point from any starting guess (discrete uniqueness), the
// fixed point satisfies the discrete mean-value property, has no interior
// extremum, matches the exact Fourier series to O(h²), SOR beats
// Gauss–Seidel beats Jacobi; and the simulation's parameter validator.
//   node atlas/test/em3-relax.test.mjs

import * as M from '../src/viz/model/em3-relax.js';
import { validate, defaults } from '../src/viz/sims/em3-relax.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

// the series meets its own boundary values
const W = { left: 20, right: 0, bottom: -10, top: 100 };
check('series: top wall', Math.abs(M.series(1, W, 0.5, 1 - 1e-9) - 100) < 0.5);
check('series: left wall', Math.abs(M.series(1, W, 1e-9, 0.5) - 20) < 0.5);
check('series: bottom wall', Math.abs(M.series(1, W, 0.5, 1e-9) + 10) < 0.5);
check('series: superposition at the centre is the average of the walls (square)', Math.abs(M.series(1, W, 0.5, 0.5) - (20 + 0 - 10 + 100) / 4) < 1e-6);
check('series: sine wall', Math.abs(M.series(1, { top: 50 }, 0.3, 0.6, { top: 'sine' }) - 50 * Math.sin(0.3 * Math.PI) * Math.sinh(0.6 * Math.PI) / Math.sinh(Math.PI)) < 1e-12);

// every method and every start reach the same answer
const runs = [];
for (const method of ['jacobi', 'gs', 'sor']) for (const start of ['zero', 'high', 'random']) {
  const B = M.init(M.makeBox({ n: 20, walls: W }), start, 3);
  const k = M.relax(B, method, { tol: 1e-11, max: 20000 });
  runs.push({ method, start, B, k });
}
const base = runs[0].B;
for (const r of runs) check(`same fixed point (${r.method} from ${r.start})`, M.gap(base, r.B) < 1e-7, `gap ${M.gap(base, r.B)}`);
check('fixed point satisfies the mean-value property', M.residual(base) < 1e-9, `residual ${M.residual(base)}`);
const sweepsOf = (m) => runs.find((r) => r.method === m && r.start === 'zero').k;
check('Gauss–Seidel needs about half the sweeps of Jacobi', sweepsOf('gs') < 0.6 * sweepsOf('jacobi'), `${sweepsOf('gs')} vs ${sweepsOf('jacobi')}`);
check('SOR is far faster than Gauss–Seidel', sweepsOf('sor') < 0.25 * sweepsOf('gs'), `${sweepsOf('sor')} vs ${sweepsOf('gs')}`);

// no interior extremum: free values stay within the boundary's range
const [flo, fhi] = M.freeRange(base);
check('no interior extremum', flo >= base.lo - 1e-9 && fhi <= base.hi + 1e-9, `${flo}..${fhi}`);

// converges to the series, error falling like h²
function err(n) {
  const B = M.init(M.makeBox({ n, walls: { top: 100 } }), 'zero');
  M.relax(B, 'sor', { tol: 1e-12, max: 50000 });
  let e = 0;
  for (const [x, y] of [[0.5, 0.5], [0.25, 0.75], [0.5, 0.25], [0.75, 0.5]]) { const p = M.at(B, x, y); e = Math.max(e, Math.abs(p.V - M.series(B.b, { top: 100 }, p.x, p.y))); }
  return e;
}
const e16 = err(16), e32 = err(32);
check('relaxation matches the series (n = 32) to 0.1 V of 100 V', e32 < 0.1, `error ${e32}`);
check('error falls like h² (ratio near 4 on halving h)', e16 / e32 > 3 && e16 / e32 < 5.5, `ratio ${e16 / e32}`);

// a rectangle and an electrode
const R = M.init(M.makeBox({ n: 24, aspect: 0.5, walls: { left: 100 } }), 'zero');
check('rectangle: ny = n × aspect', R.ny === 12 && Math.abs(R.b - 0.5) < 1e-12);
M.relax(R, 'sor', { tol: 1e-12 });
const pr = M.at(R, 0.25, 0.25);
check('rectangle matches the series', Math.abs(pr.V - M.series(R.b, { left: 100 }, pr.x, pr.y)) < 0.6, `${pr.V} vs ${M.series(R.b, { left: 100 }, pr.x, pr.y)}`);
const E = M.init(M.makeBox({ n: 20, electrode: { x: 0.4, y: 0.4, w: 0.2, h: 0.2, V: 50 } }), 'zero');
M.relax(E, 'gs', { tol: 1e-11 });
check('electrode holds its potential', Math.abs(M.at(E, 0.5, 0.5).V - 50) < 1e-12);
check('around a lone electrode, every free value lies between 0 and 50', M.freeRange(E)[0] > 0 && M.freeRange(E)[1] < 50);
check('omegaOpt is between 1 and 2', M.omegaOpt(E) > 1 && M.omegaOpt(E) < 2);

// the validator
const ok = (p) => validate({ ...defaults, ...p });
check('defaults validate', ok({}).length === 0, ok({}).join('; '));
check('unknown method rejected', ok({ method: 'newton' }).length > 0);
check('unknown start rejected', ok({ init: 'big' }).length > 0);
check('electrode outside the box rejected', ok({ electrode: { x: 0.9, y: 0.4, w: 0.3, h: 0.1, V: 1 } }).length > 0);
check('a grid too coarse rejected', ok({ n: 2 }).length > 0);
check('unknown hide rejected', ok({ hide: ['nope'] }).length > 0);

console.log(`em3-relax: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
