// The Stern–Gerlach chain behind sims/qm4-sg.js (PHYS 4700, M1): eigenkets of
// n̂·σ, the textbook sequential experiments (McIntyre ch. 1–2, Townsend ch. 1),
// the unobserved "both beams" loop, Monte Carlo counts against the exact
// fractions, and the sim's validator.
//   node atlas/test/qm4-sg.test.mjs

import * as M from '../src/viz/model/qm4-sg.js';
import { validate, defaults } from '../src/viz/sims/qm4-sg.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol;
const abs2 = (z) => z[0] * z[0] + z[1] * z[1];
const matvec = (A, v) => A.map((row) => row.reduce((s, a, k) => [s[0] + a[0] * v[k][0] - a[1] * v[k][1], s[1] + a[0] * v[k][1] + a[1] * v[k][0]], [0, 0]));

// ── eigenkets ──
for (const [th, ph] of [[0, 0], [90, 0], [90, 90], [60, 0], [120, 45], [33, 250], [180, 0]]) {
  const K = M.kets(th, ph), S = M.sigmaN(th, ph);
  check(`|+n⟩ normalised (${th}, ${ph})`, close(abs2(K.plus[0]) + abs2(K.plus[1]), 1));
  check(`⟨−n|+n⟩ = 0 (${th}, ${ph})`, close(abs2(M.braket(K.minus, K.plus)), 0));
  const Sp = matvec(S, K.plus), Sm = matvec(S, K.minus);
  check(`n·σ|+n⟩ = +|+n⟩ (${th}, ${ph})`, Sp.every((z, k) => close(z[0], K.plus[k][0], 1e-12) && close(z[1], K.plus[k][1], 1e-12)));
  check(`n·σ|−n⟩ = −|−n⟩ (${th}, ${ph})`, Sm.every((z, k) => close(z[0], -K.minus[k][0], 1e-12) && close(z[1], -K.minus[k][1], 1e-12)));
  check(`P(+n | +z) = cos²(θ/2) (${th})`, close(abs2(M.braket(K.plus, [[1, 0], [0, 0]])), Math.cos((th * Math.PI) / 360) ** 2));
}
// x and y bases are mutually unbiased
const X = M.kets(90, 0), Y = M.kets(90, 90);
check('|⟨+y|+x⟩|² = ½', close(abs2(M.braket(Y.plus, X.plus)), 0.5));
check('|⟨−y|+x⟩|² = ½', close(abs2(M.braket(Y.minus, X.plus)), 0.5));

// ── the classic experiments (fractions of atoms leaving the oven) ──
let E = M.exact('oven', [{ axis: 'z' }]);
check('oven → Z: ½ and ½', close(E.plus, 0.5) && close(E.minus, 0.5));
E = M.exact('oven', [{ axis: 'z', pass: '+' }, { axis: 'z' }]);
check('oven → Z+ → Z: all of the ½ that pass are up', close(E.plus, 0.5) && close(E.minus, 0) && close(E.blocked[0], 0.5));
E = M.exact('oven', [{ axis: 'z', pass: '+' }, { axis: 'x' }]);
check('oven → Z+ → X: ¼ and ¼', close(E.plus, 0.25) && close(E.minus, 0.25));
E = M.exact('oven', [{ axis: 'z', pass: '+' }, { axis: 'x', pass: '+' }, { axis: 'z' }]);
check('oven → Z+ → X+ → Z: ⅛ and ⅛ (the X measurement erases z)', close(E.plus, 0.125) && close(E.minus, 0.125) && close(E.blocked[1], 0.25));
E = M.exact('oven', [{ axis: 'z', pass: '+' }, { axis: 'x', pass: 'both' }, { axis: 'z' }]);
check('oven → Z+ → X(both, unobserved) → Z: ½ up, none down', close(E.plus, 0.5) && close(E.minus, 0) && E.blocked[1] === null);
E = M.exact('oven', [{ axis: 'z', pass: '+' }, { axis: 'x', pass: '-' }, { axis: 'z' }]);
check('oven → Z+ → X− → Z: ⅛ and ⅛', close(E.plus, 0.125) && close(E.minus, 0.125));
E = M.exact('z+', [{ axis: 'n', theta: 60 }]);
check('|+z⟩ → n̂(60°): ¾ and ¼', close(E.plus, 0.75) && close(E.minus, 0.25));
E = M.exact('z+', [{ axis: 'n', theta: 60, pass: '+' }, { axis: 'z' }]);
check('|+z⟩ → n̂(60°)+ → Z: ¾·¾ and ¾·¼', close(E.plus, 0.5625) && close(E.minus, 0.1875));
E = M.exact('x+', [{ axis: 'y' }]);
check('|+x⟩ → Y: ½ and ½', close(E.plus, 0.5));
E = M.exact('y+', [{ axis: 'y' }]);
check('|+y⟩ → Y: all +', close(E.plus, 1));
E = M.exact('state', [{ axis: 'x' }], 90, 180);
check('state (90°, 180°) is |−x⟩', close(E.minus, 1));
E = M.exact('oven', [{ axis: 'n', theta: 37, phi: 120 }]);
check('an oven beam splits ½ : ½ along any axis', close(E.plus, 0.5) && close(E.minus, 0.5));
// probability is conserved: blocks + counters = 1
for (const chainSpec of [[{ axis: 'z', pass: '+' }, { axis: 'n', theta: 50, pass: '-' }, { axis: 'y' }], [{ axis: 'x', pass: 'both' }, { axis: 'y', pass: '+' }, { axis: 'n', theta: 140, phi: 30 }]]) {
  const e = M.exact('oven', chainSpec);
  const tot = e.plus + e.minus + e.blocked.reduce((s, b) => s + (b || 0), 0);
  check(`fractions sum to 1 (${chainSpec.map((a) => a.axis).join('→')})`, close(tot, 1, 1e-12), String(tot));
}

// ── Monte Carlo ──
for (const [src, chainSpec] of [['oven', [{ axis: 'z', pass: '+' }, { axis: 'x', pass: '+' }, { axis: 'z' }]], ['z+', [{ axis: 'n', theta: 60, pass: '+' }, { axis: 'z' }]], ['oven', [{ axis: 'z', pass: '+' }, { axis: 'x', pass: 'both' }, { axis: 'z' }]]]) {
  const n = 40000, c = M.fire(src, chainSpec, n, M.rng(11)), e = M.exact(src, chainSpec);
  for (const [name, got, want] of [['+', c.plus / n, e.plus], ['−', c.minus / n, e.minus]]) {
    const sd = Math.sqrt(want * (1 - want) / n);
    check(`Monte Carlo ${src} ${chainSpec.map((a) => a.axis).join('→')} ${name}: ${got.toFixed(4)} vs ${want}`, Math.abs(got - want) <= 4.5 * sd + 1e-12);
  }
  check('every atom accounted for', c.plus + c.minus + c.blocked.reduce((s, b) => s + b, 0) === n);
}
const a1 = M.fire('oven', [{ axis: 'z' }], 500, M.rng(3)), a2 = M.fire('oven', [{ axis: 'z' }], 500, M.rng(3));
check('the seeded counts are reproducible', a1.plus === a2.plus);

// ── validator ──
check('defaults validate', validate(defaults).length === 0, validate(defaults).join('; '));
check('bad source rejected', validate({ ...defaults, source: 'lamp' }).length > 0);
check('four analysers rejected', validate({ ...defaults, analysers: [{}, {}, {}, {}] }).length > 0);
check('a last analyser with pass both rejected', validate({ ...defaults, analysers: [{ axis: 'z', pass: 'both' }] }).length > 0);
check('theta out of range rejected', validate({ ...defaults, analysers: [{ axis: 'n', theta: 200 }] }).length > 0);
check('unknown control rejected', validate({ ...defaults, controls: ['a9'] }).length > 0);
check('M.axisName', M.axisName({ axis: 'x' }) === 'X' && M.axisName({ axis: 'n', theta: 60 }) === 'n̂ 60°');

console.log(`qm4-sg: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
