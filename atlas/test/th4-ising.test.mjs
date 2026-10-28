// The 2D Ising model behind the th4-ising simulation: Onsager's T_c, Yang's
// magnetization, the mean-field equation, ΔE bookkeeping against a full
// recount, and Metropolis averages on a 4 × 4 lattice against brute-force
// enumeration of all 65 536 states; plus the sim's validator.
//   node atlas/test/th4-ising.test.mjs

import * as M from '../src/viz/model/th4-ising.js';
import { validate, defaults } from '../src/viz/sims/th4-ising.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

check('T_c = 2/ln(1 + √2) = 2.269185', close(M.TC, 2.269185314213022, 1e-12));
check('sinh(2J/kT_c) = 1 (Kramers–Wannier)', close(Math.sinh(2 / M.TC), 1, 1e-12));
check('Yang: |m| at kT/J = 2 is 0.911319', close(M.onsagerM(2), 0.9113194, 1e-6), String(M.onsagerM(2)));
check('Yang: |m| = 0 at and above T_c', M.onsagerM(M.TC) === 0 && M.onsagerM(3) === 0);
check('Yang: |m| → 1 as T → 0', M.onsagerM(0.6) > 0.9999);
check('Yang: critical exponent 1/8 near T_c', close(Math.log(M.onsagerM(M.TC * (1 - 1e-6)) / M.onsagerM(M.TC * (1 - 1e-5))) / Math.log(0.1), 0.125, 0.01));
const mf = M.meanFieldM(2);
check('mean field: m = tanh(4m/T) at T = 2', close(mf, Math.tanh(2 * mf), 1e-12) && mf > 0.95, String(mf));
check('mean field: m = 0 above T = 4 (zero field)', M.meanFieldM(4.5) < 1e-6);
check('mean field: a field magnetizes above T = 4', M.meanFieldM(5, 0.5) > 0.1);

// ΔE predicted for a flip equals the change in the recounted total energy
{
  const S = M.lattice(8, 'hot', 3), r = M.rng(9);
  let worst = 0;
  for (let k = 0; k < 400; k++) {
    const i = Math.floor(r() * 64), h = [0, 0.3, -0.7][k % 3];
    const e0 = M.energy(S, h) * 64, dE = M.deltaE(S, i, h);
    S.s[i] = -S.s[i];
    worst = Math.max(worst, Math.abs(M.energy(S, h) * 64 - e0 - dE));
  }
  check('ΔE = 2sᵢ(Σ neighbours + h) matches a full recount', worst < 1e-9, `worst ${worst}`);
}
check('an aligned lattice has E/N = −2J', M.energy(M.lattice(16, 'cold')) === -2 && M.magnetization(M.lattice(16, 'cold')) === 1);
check('two domains have m = 0', M.magnetization(M.lattice(16, 'half')) === 0);

// Metropolis against exact enumeration on 4 × 4
for (const T of [1.8, 2.5, 3.5]) {
  const ex = M.exactSmall(4, T);
  const S = M.lattice(4, 'hot', 11);
  for (let k = 0; k < 2000; k++) M.sweep(S, T);
  let e = 0, a = 0;
  const n = 120000;
  for (let k = 0; k < n; k++) { M.sweep(S, T); e += M.energy(S); a += Math.abs(M.magnetization(S)); }
  check(`4×4 at kT/J = ${T}: Metropolis ⟨E⟩/N matches enumeration`, Math.abs(e / n - ex.E) < 0.02, `${e / n} vs ${ex.E}`);
  check(`4×4 at kT/J = ${T}: Metropolis ⟨|m|⟩ matches enumeration`, Math.abs(a / n - ex.absM) < 0.02, `${a / n} vs ${ex.absM}`);
}
// a big lattice well below T_c stays near Yang's value; well above, near zero
{
  const S = M.lattice(48, 'cold', 2);
  for (let k = 0; k < 300; k++) M.sweep(S, 2.0);
  check('48×48 at kT/J = 2.0 holds |m| near 0.911', Math.abs(Math.abs(M.magnetization(S)) - 0.9113) < 0.03, String(M.magnetization(S)));
  const H = M.lattice(48, 'cold', 2);
  for (let k = 0; k < 300; k++) M.sweep(H, 3.5);
  check('48×48 at kT/J = 3.5 loses its magnetization', Math.abs(M.magnetization(H)) < 0.1, String(M.magnetization(H)));
}
check('seeded: the same seed gives the same lattice', (() => { const a = M.lattice(16, 'hot', 5), b = M.lattice(16, 'hot', 5); for (let k = 0; k < 20; k++) { M.sweep(a, 2.3); M.sweep(b, 2.3); } return a.s.every((v, i) => v === b.s[i]); })());

check('th4-ising defaults are valid', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('th4-ising rejects T outside 0.5–5', validate({ ...defaults, T: 7 }).length > 0);
check('th4-ising rejects an unknown panel', validate({ ...defaults, panels: ['lattice', 'chart'] }).length > 0);
check('th4-ising rejects L = 20', validate({ ...defaults, L: 20 }).length > 0);

console.log(`th4-ising: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
