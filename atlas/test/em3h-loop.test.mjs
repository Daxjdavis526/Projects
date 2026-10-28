// The hysteresis-loop model behind the em3h-loop simulation: each material's
// remanence and coercivities against the typical values it is fitted to, the
// two branches as mirror images, B = 0 at H_cB, the loop area against ∮H dB
// integrated round the loop in B, the operating point on both the load line
// and the falling branch, (BH)max in the published range, the demagnetizing
// factors of spheroids against Osborn's integral done numerically (and the
// sum rule for the three axes), and the simulation's parameter validator.
//   node atlas/test/em3h-loop.test.mjs

import * as L from '../src/viz/model/em3h-loop.js';
import { validate, defaults } from '../src/viz/sims/em3h-loop.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1e-300);
const { iron, alnico, ndfeb } = L.MATERIALS;

// typical values the materials are fitted to (approximate; see the model's header)
check('iron: B_r ≈ 1.2 T', Math.abs(L.remanence(iron) - 1.2) < 0.05, `${L.remanence(iron)}`);
check('iron: H_c ≈ 80 A/m', Math.abs(L.coerciveB(iron) - 80) < 1);
check('iron: saturation polarization 2.15 T', close(L.J(iron, 1e6, 'down'), 2.15, 1e-3));
check('Alnico 5: B_r ≈ 1.28 T', Math.abs(L.remanence(alnico) - 1.28) < 0.01);
check('Alnico 5: H_cB ≈ 51 kA/m', Math.abs(L.coerciveB(alnico) - 51e3) < 1.5e3, `${L.coerciveB(alnico)}`);
check('NdFeB N42: B_r ≈ 1.31 T', Math.abs(L.remanence(ndfeb) - 1.31) < 0.01);
check('NdFeB N42: H_cJ = 1000 kA/m (grade minimum 955)', close(L.coerciveJ(ndfeb), 1000e3, 1e-6));
check('NdFeB N42: H_cB in the grade’s range (≥ 836 kA/m) and below H_cJ', L.coerciveB(ndfeb) > 836e3 && L.coerciveB(ndfeb) < L.coerciveJ(ndfeb));
const bhN = L.bhMax(ndfeb).BH, bhA = L.bhMax(alnico).BH;
check('NdFeB N42: (BH)max in 318–342 kJ/m³', bhN > 318e3 && bhN < 342e3, `${bhN}`);
check('Alnico 5: (BH)max within 10% of 44 kJ/m³', Math.abs(bhA - 44e3) < 4.4e3, `${bhA}`);

for (const [k, m] of Object.entries(L.MATERIALS)) {
  // mirror symmetry and B = 0 at H_cB
  let w = 0;
  for (const f of [-0.9, -0.3, 0, 0.2, 0.7]) w = Math.max(w, Math.abs(L.B(m, f * m.Hmax, 'up') + L.B(m, -f * m.Hmax, 'down')));
  check(`${k}: the rising branch mirrors the falling one`, w < 1e-12);
  check(`${k}: B = 0 at −H_cB on the falling branch`, Math.abs(L.B(m, -L.coerciveB(m), 'down')) < 1e-9 * m.Js);
  // loop area: ∮H dB round the loop, integrated in B (trapezoids along each branch)
  const n = 40000;
  let A = 0;
  for (const br of ['down', 'up']) {
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const H = br === 'up' ? -m.Hmax + (2 * m.Hmax * i) / n : m.Hmax - (2 * m.Hmax * i) / n, b = L.B(m, H, br);
      if (prev) A += 0.5 * (H + prev[0]) * (b - prev[1]);
      prev = [H, b];
    }
  }
  // close the path with the short vertical steps at ±H_max, where the model's branches have not quite met
  A += m.Hmax * (L.B(m, m.Hmax, 'down') - L.B(m, m.Hmax, 'up')) - m.Hmax * (L.B(m, -m.Hmax, 'up') - L.B(m, -m.Hmax, 'down'));
  check(`${k}: loss() equals ∮H dB`, close(L.loss(m), A, 2e-3), `${L.loss(m)} vs ${A}`);
  // the operating point lies on both the falling branch and the load line
  for (const N of [0.05, 1 / 3, 0.8]) {
    const o = L.operating(m, N);
    check(`${k}: operating point at N = ${N.toFixed(2)} is on the falling branch and the load line`, Math.abs(o.B - L.B(m, o.H, 'down')) < 1e-9 && Math.abs(o.B + L.MU0 * ((1 - N) / N) * o.H) < 1e-6 * m.Js && o.H < 0);
  }
}

// demagnetizing factors of spheroids: N_c = (abc/2)∫₀^∞ ds / ((c² + s)√((a² + s)(b² + s)(c² + s))), with s = t²/(1 − t)² to tame the tail
function osborn(a, b, c) {
  const f = (t) => { const s = (t / (1 - t)) ** 2, ds = (2 * t) / (1 - t) ** 3; return ds / ((c * c + s) * Math.sqrt((a * a + s) * (b * b + s) * (c * c + s))); };
  let sum = 0; const n = 200000;
  for (let i = 0; i < n; i++) sum += f((i + 0.5) / n) / n;
  return ((a * b * c) / 2) * sum;
}
for (const k of [0.2, 0.6, 1, 2, 5, 20]) {
  const c = k, a = 1, b = 1;               // the symmetry axis has length 2c, the diameter 2
  check(`spheroidN(${k}) matches the demagnetizing integral`, close(L.spheroidN(k), osborn(a, b, c), 2e-4), `${L.spheroidN(k)} vs ${osborn(a, b, c)}`);
  const Nt = osborn(c, b, a);
  check(`spheroid ${k}: N_axis + 2 N_transverse = 1`, Math.abs(L.spheroidN(k) + 2 * Nt - 1) < 5e-4, `${L.spheroidN(k) + 2 * Nt}`);
}

// validate
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('a bad material is caught', validate({ ...defaults, material: 'gold' }).length >= 1);
check('an out-of-range H is caught', validate({ ...defaults, material: 'iron', H: 5000 }).length === 1);
check('a bad N is caught', validate({ ...defaults, N: 1 }).length === 1);

console.log(`em3h-loop: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
