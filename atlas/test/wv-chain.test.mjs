// The uniform linear chain behind sims/wv-chain.js (PHYS 3750, W3–W5):
// analytic mode shapes and frequencies against a numerical eigensolution of
// the stiffness matrix, orthonormality, the dispersion relation and its
// long-wave limit, the exact motion against RK4, and the sim's validator.
//   node atlas/test/wv-chain.test.mjs

import * as C from '../src/viz/model/wv-chain.js';
import { symEig } from '../src/viz/model/de-modes.js';
import { validate, defaults } from '../src/viz/sims/wv-chain.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

for (const bc of C.BCS) {
  for (const N of [1, 2, 3, 4, 5, 8, 13, 24]) {
    if (bc === 'periodic' && N < 3) continue;
    const ms = C.chainModes(N, bc), K = C.stiffness(N, bc);
    check(`${bc} N=${N}: N modes`, ms.length === N, `${ms.length}`);
    // each shape is an eigenvector of K with eigenvalue w²
    for (const m of ms) {
      const Ks = K.map((row) => row.reduce((s, v, j) => s + v * m.shape[j], 0));
      const err = Math.max(...Ks.map((v, i) => Math.abs(v - m.w * m.w * m.shape[i])));
      check(`${bc} N=${N} n=${m.n}${m.part}: K s = ω² s`, err < 1e-10, `${err}`);
    }
    // orthonormal
    let worst = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const d = ms[i].shape.reduce((s, v, k) => s + v * ms[j].shape[k], 0);
      worst = Math.max(worst, Math.abs(d - (i === j ? 1 : 0)));
    }
    check(`${bc} N=${N}: shapes orthonormal`, worst < 1e-10, `${worst}`);
    // the frequencies are exactly the numerical eigenvalues
    const ev = symEig(K).values.map((v) => Math.sqrt(Math.max(0, v)));
    const ws = ms.map((m) => m.w).sort((a, b) => a - b);
    check(`${bc} N=${N}: frequencies match the eigensolver`, ev.every((v, i) => close(v, ws[i], 1e-8)), `${ev} vs ${ws}`);
    // the mode range
    const [lo, hi] = C.modeRange(N, bc);
    check(`${bc} N=${N}: mode range`, ms[0].n === lo && ms[ms.length - 1].n === hi, `${lo}..${hi}`);
  }
}

// the textbook formula for fixed ends: ω_n = 2√(k/m) sin(nπ/(2(N+1)))
for (const N of [3, 10]) for (let n = 1; n <= N; n++) {
  const m = C.chainModes(N, 'fixed')[n - 1];
  check(`fixed N=${N}: ω_${n} formula`, close(m.w, 2 * Math.sin((n * Math.PI) / (2 * (N + 1)))));
}
// N = 3 by hand: √(2−√2), √2, √(2+√2)
check('N = 3 fixed by hand', [Math.sqrt(2 - Math.SQRT2), Math.SQRT2, Math.sqrt(2 + Math.SQRT2)].every((w, i) => close(C.chainModes(3, 'fixed')[i].w, w)));
// long waves: ω → q (speed one spacing per unit τ)
check('long-wave limit ω ≈ v q', Math.abs(C.omegaOf(1e-3) / 1e-3 - 1) < 1e-6);
check('cutoff 2 at q a = π', close(C.omegaOf(Math.PI), 2));
// shapes sample the continuum shape
for (const bc of C.BCS) {
  const N = 9, { pos } = C.layout(N, bc);
  for (const m of C.chainModes(N, bc)) {
    const f = C.continuumShape(N, bc, m.n, m.part), r = pos.map(f);
    const nr = Math.hypot(...r);
    if (nr < 1e-12) continue;
    const err = Math.max(...r.map((v, i) => Math.abs(v / nr - m.shape[i])));
    check(`${bc} n=${m.n}${m.part}: shape samples the continuum`, err < 1e-10, `${err}`);
  }
}

// the motion against RK4 on m ẍ = −K x (τ units)
function rk4(K, x0, v0, T, steps) {
  const N = x0.length, h = T / steps;
  const f = (y) => { const x = y.slice(0, N), v = y.slice(N); return [...v, ...K.map((row) => -row.reduce((s, kk, j) => s + kk * x[j], 0))]; };
  let y = [...x0, ...v0];
  for (let s = 0; s < steps; s++) {
    const k1 = f(y), k2 = f(y.map((v, i) => v + (h / 2) * k1[i])), k3 = f(y.map((v, i) => v + (h / 2) * k2[i])), k4 = f(y.map((v, i) => v + h * k3[i]));
    y = y.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  }
  return y.slice(0, N);
}
for (const bc of C.BCS) {
  const N = 7, ms = C.chainModes(N, bc), K = C.stiffness(N, bc);
  const x0 = [0, 0.3, 1, -0.2, 0, 0.5, 0], v0 = [0.1, 0, 0, 0.4, -0.3, 0, 0.2];
  const T = 9.3, ex = C.motion(ms, x0, v0)(T).x, num = rk4(K, x0, v0, T, 6000);
  const err = Math.max(...ex.map((v, i) => Math.abs(v - num[i])));
  check(`${bc}: exact motion matches RK4`, err < 1e-7, `${err}`);
  const at0 = C.motion(ms, x0, v0)(0);
  check(`${bc}: motion starts at x0, v0`, at0.x.every((v, i) => close(v, x0[i])) && at0.v.every((v, i) => close(v, v0[i])));
}
// a wide pulse on a long fixed chain travels at one spacing per unit τ, nearly undistorted
{
  const N = 120, bc = 'fixed', { x0, v0 } = C.pulse(N, bc, 30, 6);
  const x = C.motion(C.chainModes(N, bc), x0, v0)(40).x;
  const peak = x.indexOf(Math.max(...x)) + 1;
  check('a wide pulse moves 40 spacings in τ = 40', Math.abs(peak - 70) <= 1, `${peak}`);
  check('a wide pulse keeps its height', Math.max(...x) > 0.97, `${Math.max(...x)}`);
}

// the simulation's validator
check('defaults validate', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
const bad = [
  { N: 0 }, { N: 2.5 }, { bc: 'open' }, { bc: 'fixed', n: 0 }, { N: 4, n: 5 }, { bc: 'free', N: 4, n: 4 },
  { start: 'kick' }, { pluck: 0 }, { k: -1 }, { controls: ['zzz'] }, { view: 'top' }, { panels: ['chain', 'nope'] },
  { hide: ['omega', 'zz'] }, { x0: [1, 2] }, { width: 0 }, { bc: 'periodic', N: 2 },
];
for (const p of bad) check(`validator rejects ${JSON.stringify(p)}`, validate({ ...defaults, ...p }).length > 0);
check('validator accepts a custom start', validate({ ...defaults, N: 3, start: 'custom', x0: [0, 1, 0] }).length === 0);

console.log(`\nwv-chain: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
