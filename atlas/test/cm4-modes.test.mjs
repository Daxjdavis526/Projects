// The small-oscillation models behind cm4-modes (PHYS 3550, M8): the double
// pendulum's ω² = (2 ∓ √2)g/ℓ with mode shapes θ₂/θ₁ = ±√2; M-orthogonality;
// the exact mode sum solving M q̈ = −K q; det(K − ω²M) vanishing at each ω;
// the bead chain tending to the hanging chain's (j₀,ₙ/2)√(g/L); the cart and
// pendulum; and the sim's validate().
//   node atlas/test/cm4-modes.test.mjs

import * as M from '../src/viz/model/cm4-modes.js';
import { validate } from '../src/viz/sims/cm4-modes.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1e-12, Math.abs(b));
const mv = (A, v) => A.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);

// the equal double pendulum
for (const l of [0.5, 1, 2]) {
  const s = M.build({ N: 2, m: 1, l }), md = M.modes(s.M, s.K);
  check(`double pendulum ℓ = ${l}: ω₁² = (2 − √2)g/ℓ`, close(md.w2[0], ((2 - Math.SQRT2) * M.G) / l, 1e-10));
  check(`double pendulum ℓ = ${l}: ω₂² = (2 + √2)g/ℓ`, close(md.w2[1], ((2 + Math.SQRT2) * M.G) / l, 1e-10));
  check('mode 1 shape θ₂/θ₁ = +√2', close(md.a[0][1] / md.a[0][0], Math.SQRT2, 1e-9));
  check('mode 2 shape θ₂/θ₁ = −√2', close(md.a[1][1] / md.a[1][0], -Math.SQRT2, 1e-9));
}

// general systems: orthogonality, the eigen-equation, det = 0, the mode sum solving the ODE
const systems = [M.build({ N: 2, m: [1, 0.3], l: [0.7, 0.4] }), M.build({ N: 5, m: [1, 2, 1, 0.5, 3], l: [0.3, 0.2, 0.5, 0.4, 0.1] }), M.build({ system: 'cart', Mc: 3, k: 25, m1: 0.8, l1: 1.2 })];
systems.forEach((s, si) => {
  const md = M.modes(s.M, s.K), n = md.w.length;
  for (let i = 0; i < n; i++) {
    const Ka = mv(s.K, md.a[i]), Ma = mv(s.M, md.a[i]);
    check(`system ${si} mode ${i + 1}: K a = ω² M a`, Ka.every((v, k) => Math.abs(v - md.w2[i] * Ma[k]) < 1e-9 * Math.max(1, Math.abs(v))));
    check(`system ${si} mode ${i + 1}: M-normalized`, close(dot(md.a[i], Ma), 1, 1e-9));
    for (let j = i + 1; j < n; j++) check(`system ${si} modes ${i + 1}, ${j + 1}: M-orthogonal`, Math.abs(dot(md.a[j], Ma)) < 1e-9);
    const scale = Math.abs(M.detKM(s.M, s.K, 0));
    check(`system ${si}: det(K − ω²M) = 0 at ω${i + 1}`, Math.abs(M.detKM(s.M, s.K, md.w[i])) < 1e-8 * scale);
  }
  // q(t) from rest satisfies M q̈ + K q = 0 (second difference) and starts at q₀
  const q0 = md.a.map((_, k) => 0.1 * (k + 1) * (k % 2 ? -1 : 1)), q = M.motion(s.M, md, q0), h = 1e-4;
  check(`system ${si}: q(0) = q₀`, q(0).every((v, k) => Math.abs(v - q0[k]) < 1e-12));
  let worst = 0;
  for (const t of [0.3, 1.1, 2.7]) {
    const acc = q(t).map((_, k) => (q(t + h)[k] - 2 * q(t)[k] + q(t - h)[k]) / (h * h));
    const r = mv(s.M, acc).map((v, k) => v + mv(s.K, q(t))[k]);
    worst = Math.max(worst, ...r.map(Math.abs));
  }
  check(`system ${si}: the mode sum solves M q̈ = −K q`, worst < 1e-3, String(worst));
});

// a single pendulum, and the bead chain approaching the hanging chain
{
  const s = M.build({ N: 1, m: 2, l: 0.8 }), md = M.modes(s.M, s.K);
  check('one bead: ω² = g/ℓ', close(md.w2[0], M.G / 0.8, 1e-12));
  let prev = 0;
  for (const N of [4, 16, 64]) {
    const c = M.build({ N, m: 1 / N, l: 1 / N }), w = M.modes(c.M, c.K).w[0];
    check(`chain of ${N}: ω₁ below the continuum and rising`, w < M.hangingChain(1, 1) && w > prev);
    prev = w;
  }
  check('chain of 64 within 0.5% of (j₀,₁/2)√(g/L)', close(prev, M.hangingChain(1, 1), 5e-3), `${prev} vs ${M.hangingChain(1, 1)}`);
  const c = M.build({ N: 64, m: 1 / 64, l: 1 / 64 }), w = M.modes(c.M, c.K).w;
  check('chain of 64: ω₂ within 1% of (j₀,₂/2)√(g/L)', close(w[1], M.hangingChain(2, 1), 1e-2));
}
// J₀ really vanishes at the tabulated zeros (series, enough terms for x < 25)
const J0 = (x) => { let s = 0, term = 1; for (let k = 0; k < 80; k++) { if (k) term *= -(x * x) / (4 * k * k); s += term; } return s; };
M.J0_ZEROS.slice(0, 5).forEach((z, k) => check(`J₀ zero ${k + 1}`, Math.abs(J0(z)) < 1e-9, String(J0(z))));

// chainXY
{
  const p = M.chainXY([1, 2], [Math.PI / 2, 0]);
  check('chainXY geometry', Math.abs(p[0][0] - 1) < 1e-12 && Math.abs(p[0][1]) < 1e-12 && Math.abs(p[1][0] - 1) < 1e-12 && Math.abs(p[1][1] + 2) < 1e-12);
}

check('validate accepts the defaults', validate({}).length === 0, validate({}).join('; '));
check('validate rejects a bad system', validate({ system: 'x' }).length > 0);
check('validate rejects too many beads', validate({ N: 30 }).length > 0);

console.log(`cm4-modes: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
