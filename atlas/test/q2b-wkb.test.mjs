// The WKB model behind the q2b-wkb simulation (ħ = m = 1).
//   node atlas/test/q2b-wkb.test.mjs

import * as W from '../src/viz/model/q2b-wkb.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, rel) => Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b));

// Airy function against tabulated values (DLMF / Abramowitz & Stegun)
const AI = [[0, 0.3550280538878172], [1, 0.1352924163128814], [2, 0.03492413042327437], [5, 1.083444281360744e-4], [-1, 0.5355608832923521], [-2, 0.2274074282016856], [-5, 0.3507610090241142], [-8, -0.05270505126318176]];
for (const [z, v] of AI) check(`Ai(${z})`, Math.abs(W.airy(z) - v) <= 2e-6 * Math.max(1e-3, Math.abs(v)) || near(W.airy(z), v, 1e-5), `${W.airy(z)} vs ${v}`);
const AZ = [-2.338107410459767, -4.087949444130970, -5.520559828095551];
for (const a of AZ) check(`Ai vanishes at ${a}`, Math.abs(W.airy(a)) < 1e-9, String(W.airy(a)));
check('the WKB forms approach Ai far from the turning point', near(W.airyWkb(-9.3), W.airy(-9.3), 0.02) && near(W.airyWkb(4), W.airy(4), 0.03));

// harmonic oscillator: exact levels n + ½, and WKB exact too
for (let n = 0; n < 8; n++) {
  check(`harmonic n = ${n}: exact level n + ½`, Math.abs(W.exactLevel('harmonic', n) - (n + 0.5)) < 2e-6, String(W.exactLevel('harmonic', n)));
  check(`harmonic n = ${n}: WKB level n + ½`, Math.abs(W.wkbLevel('harmonic', n) - (n + 0.5)) < 1e-9, String(W.wkbLevel('harmonic', n)));
}
// |x| well: even levels from zeros of Ai′, odd from zeros of Ai, E = −a/2^{1/3}
const APZ = [-1.018792971647471, -3.248197582179837, -4.820099211178736];
const c = 2 ** (1 / 3);
[APZ[0], AZ[0], APZ[1], AZ[1], APZ[2], AZ[2]].forEach((a, k) => check(`|x| well level ${k}`, near(W.exactLevel('linear', k), -a / c, 2e-5), `${W.exactLevel('linear', k)} vs ${-a / c}`));
// bouncer: Airy zeros; WKB from (n − ¼)π
AZ.forEach((a, k) => {
  check(`bouncer n = ${k + 1}: exact −aₙ/2^{1/3}`, near(W.exactLevel('bouncer', k), -a / c, 2e-6), String(W.exactLevel('bouncer', k)));
  const wk = (1.5 * Math.PI * (k + 0.75)) ** (2 / 3) / c;
  check(`bouncer n = ${k + 1}: WKB [3π(n − ¼)/2]^{2/3}/2^{1/3}`, near(W.wkbLevel('bouncer', k), wk, 1e-9), `${W.wkbLevel('bouncer', k)} vs ${wk}`);
});
// quartic: E₀ of p²/2 + x⁴/2 is 1.0603620905/2
check('quartic ground state', near(W.exactLevel('quartic', 0), 1.0603620904841829 / 2, 1e-5), String(W.exactLevel('quartic', 0)));
// a flat box: n²/2 exactly, and WKB exact (two walls)
for (let k = 0; k < 4; k++) {
  check(`flat box level ${k + 1}`, near(W.exactLevel('tilt', k, 0), (k + 1) ** 2 / 2, 1e-6), String(W.exactLevel('tilt', k, 0)));
  check(`flat box WKB level ${k + 1}`, near(W.wkbLevel('tilt', k, 0), (k + 1) ** 2 / 2, 1e-9));
}
// WKB improves with n: the quartic's relative error falls
const errs = [0, 2, 6, 12].map((k) => Math.abs(W.wkbLevel('quartic', k) / W.exactLevel('quartic', k) - 1));
check('WKB error falls with n (quartic)', errs.every((e, i) => i === 0 || e < errs[i - 1]), errs.join(', '));

// wave functions: normalized; WKB matches exact well away from the turning points
for (const [pot, k] of [['harmonic', 10], ['quartic', 8], ['bouncer', 6]]) {
  const E = W.exactLevel(pot, k), ex = W.exactPsi(pot, E);
  const h = ex.xs[1] - ex.xs[0];
  const norm = ex.ys.reduce((s, y) => s + y * y * h, 0);
  check(`${pot} ${k}: exact ψ normalized`, near(norm, 1, 1e-9), String(norm));
  const T = W.turning(pot, E);
  const xs = [], ys = [];
  for (let i = 0; i < ex.xs.length; i += 7) if (ex.xs[i] > T.x1 + 0.25 * (T.x2 - T.x1) && ex.xs[i] < T.x2 - 0.25 * (T.x2 - T.x1)) { xs.push(ex.xs[i]); ys.push(ex.ys[i]); }
  const wk = W.wkbPsi(pot, E, xs, 0, k);
  const dev = Math.max(...wk.map((v, i) => Math.abs(v - ys[i]))) / Math.max(...ys.map(Math.abs));
  check(`${pot} ${k}: WKB ψ within 5% of exact in the middle of the well`, dev < 0.05, String(dev));
}
// the phase-space area of the harmonic level n is (n + ½)h
check('harmonic: ∮p dx = (n + ½)h', near(2 * W.action('harmonic', 3.5), 3.5 * 2 * Math.PI, 1e-9));

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
