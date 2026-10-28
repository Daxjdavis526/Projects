// The complex-map model behind the cx-map simulation: arithmetic, every
// function in the catalogue against its derivative (by difference quotients)
// and against Cauchy–Riemann, branches and continuation of log, √ and powers,
// the colour map, and the spinor map SL(2, C) → SO⁺(1, 3) that makes Lorentz
// transformations act on the sky as Möbius maps; and the simulation's
// parameter validator.
//   node atlas/test/cx-map.test.mjs

import * as M from '../src/viz/model/cx-map.js';
import { validate, defaults } from '../src/viz/sims/cx-map.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const cclose = (a, b, tol = 1e-9) => M.abs(M.sub(a, b)) <= tol * Math.max(1, M.abs(b));
const show = (z) => `${z[0]} + ${z[1]}i`;

// ── arithmetic ──
check('i² = −1', cclose(M.mul([0, 1], [0, 1]), [-1, 0]));
check('(1 + i)⁸ = 16', cclose([1, 2, 3, 4, 5, 6, 7].reduce((p) => M.mul(p, [1, 1]), [1, 1]), [16, 0]));
check('|3 + 4i| = 5', M.abs([3, 4]) === 5);
check('arg(1 + i) = π/4', close(M.arg([1, 1]), Math.PI / 4));
check('e^{iπ} = −1', cclose(M.exp([0, Math.PI]), [-1, 0], 1e-15));
check('(2 + 3i)/(1 − i) = −½ + 5i/2', cclose(M.div([2, 3], [1, -1]), [-0.5, 2.5]));
{
  const roots = [0, 1, 2].map((k) => M.polar(1, (2 * Math.PI * k) / 3));
  check('cube roots of unity sum to 0', M.abs(roots.reduce(M.add, [0, 0])) < 1e-15);
  check('cube roots of unity cube to 1', roots.every((r) => cclose(M.mul(r, M.mul(r, r)), [1, 0], 1e-12)));
}
check('i^i = e^{−π/2} (principal)', cclose(M.powAt([0, 1], [0, 1]), [Math.exp(-Math.PI / 2), 0], 1e-12), show(M.powAt([0, 1], [0, 1])));
check('Log(−1) = iπ', cclose(M.log([-1, 0]), [0, Math.PI]));
check('sin(i) = i sinh 1', cclose(M.sin([0, 1]), [0, Math.sinh(1)]));
check('cos(π + i ln 2)… cos z = (e^{iz} + e^{−iz})/2', (() => {
  const z = [0.7, -1.3], iz = M.mul([0, 1], z);
  return cclose(M.cos(z), M.scale(M.add(M.exp(iz), M.exp(M.scale(iz, -1))), 0.5), 1e-12);
})());
check('sin² z + cos² z = 1 off the real line', cclose(M.add(M.mul(M.sin([1.1, 0.8]), M.sin([1.1, 0.8])), M.mul(M.cos([1.1, 0.8]), M.cos([1.1, 0.8]))), [1, 0], 1e-12));

// ── derivatives: every analytic function's df against a difference quotient in two directions ──
const opts = { a: [1, 0], b: [0, -1], c: [1, 0], d: [0, 1], p: [0.5, 0.3] };
const samples = [[0.7, 0.4], [-0.6, 1.1], [1.3, -0.9], [-1.2, -0.5], [0.3, 1.7]];
for (const key of Object.keys(M.FNS)) {
  if (key === 'conj' || key === 'uv') continue;
  for (const z of samples) {
    const d = M.derivative(key, z, opts);
    const h = 1e-6;
    const q1 = M.scale(M.sub(M.value(key, M.add(z, [h, 0]), opts), M.value(key, M.sub(z, [h, 0]), opts)), 1 / (2 * h));
    const q2 = M.div(M.sub(M.value(key, M.add(z, [0, h]), opts), M.value(key, M.sub(z, [0, h]), opts)), [0, 2 * h]);
    check(`${key}: f′ matches the difference quotient along x at ${show(z)}`, cclose(d, q1, 1e-6), `${show(d)} vs ${show(q1)}`);
    check(`${key}: same quotient along y (complex-differentiable) at ${show(z)}`, cclose(q1, q2, 1e-6));
    const [r1, r2] = M.crResidual(M.jacobian(key, z, opts));
    check(`${key}: Cauchy–Riemann holds at ${show(z)}`, Math.hypot(r1, r2) < 1e-6, `${r1}, ${r2}`);
  }
}
// non-analytic maps fail Cauchy–Riemann
{
  const [r1, r2] = M.crResidual(M.jacobian('conj', [0.4, 0.2]));
  check('z̄ fails CR: u_x − v_y = 2', close(r1, 2, 1e-6) && Math.abs(r2) < 1e-6);
  check('z̄ has no derivative', M.derivative('conj', [0.4, 0.2]) === null && M.amplitwist('conj', [0.4, 0.2]) === null);
  const abs2 = M.uvFrom('x^2 + y^2', '0');
  const J = M.jacobian('uv', [0.5, -0.3], abs2), [s1, s2] = M.crResidual(J);
  check('|z|² fails CR away from 0: u_x − v_y = 2x, u_y + v_x = 2y', close(s1, 1, 1e-6) && close(s2, -0.6, 1e-6));
  check('|z|² is differentiable at 0 only', M.derivative('uv', [0, 0], abs2) !== null && M.derivative('uv', [0.5, -0.3], abs2) === null);
  const sq = M.uvFrom('x^2 - y^2', '2x y');
  check('u + iv = (x² − y²) + 2ixy is z² (derivative 2z from the Jacobian)', cclose(M.derivative('uv', [0.8, 0.6], sq), [1.6, 1.2], 1e-6));
  const ex = M.uvFrom('e^x cos(y)', 'e^x sin(y)');
  check('e^x cos y + i e^x sin y passes CR', M.derivative('uv', [0.3, 2], ex) !== null);
}
// the amplitwist of z² at 1 + i: f′ = 2 + 2i, amplification 2√2, twist 45°
{
  const a = M.amplitwist('z2', [1, 1]);
  check('amplitwist of z² at 1 + i', close(a.amp, 2 * Math.SQRT2) && close(a.twist, Math.PI / 4));
  const b = M.amplitwist('exp', [0.5, 2]);
  check('amplitwist of eᶻ: |f′| = eˣ, twist = y', close(b.amp, Math.exp(0.5)) && close(b.twist, 2));
  const c = M.amplitwist('inv', [2, 0]);
  check('amplitwist of 1/z at 2: amplification ¼, twist 180°', close(c.amp, 0.25) && close(Math.abs(c.twist), Math.PI));
}
// a small circle maps to a near-circle of radius |f′|ε (analytic) or an ellipse (z ↦ x + 2iy)
{
  const z0 = [0.8, 0.5], e = 1e-3, a = M.amplitwist('z2', z0);
  const radii = M.mapCurve('z2', {}, (t) => [z0[0] + e * Math.cos(t), z0[1] + e * Math.sin(t)], 0, 2 * Math.PI, 64).w.map((w) => M.abs(M.sub(w, M.value('z2', z0))));
  check('a small circle under z² has radius |f′|ε to first order', Math.max(...radii.map((r) => Math.abs(r / e - a.amp))) < 2e-3);
  const st = M.uvFrom('x', '2y');
  const rs = M.mapCurve('uv', st, (t) => [z0[0] + e * Math.cos(t), z0[1] + e * Math.sin(t)], 0, 2 * Math.PI, 64).w.map((w) => M.abs(M.sub(w, [z0[0], 2 * z0[1]])) / e);
  check('…and under x + 2iy is an ellipse with semi-axes ε and 2ε', close(Math.min(...rs), 1, 1e-3) && close(Math.max(...rs), 2, 1e-3));
}

// ── maps of curves ──
{
  const { w } = M.mapCurve('joukowski', {}, (t) => M.polar(1, t), 0, 2 * Math.PI, 200);
  check('Joukowski sends |z| = 1 onto the segment [−2, 2]', w.every((p) => Math.abs(p[1]) < 1e-12 && Math.abs(p[0]) <= 2 + 1e-12));
  const cay = { a: [1, 0], b: [0, -1], c: [1, 0], d: [0, 1] };     // (z − i)/(z + i)
  let worst = 0;
  for (let k = 0; k < 1000; k++) { const z = [Math.tan((k * 0.618) % 1.5 - 0.75) * 3, 1e-3 + ((k * 0.377) % 1) * 5]; worst = Math.max(worst, M.abs(M.value('mobius', z, cay))); }
  check('(z − i)/(z + i) sends the upper half-plane into the unit disc', worst < 1);
  const line = M.mapCurve('mobius', cay, (t) => [t, 0], -50, 50, 200).w;
  check('…and the real axis onto the unit circle', line.every((p) => close(M.abs(p), 1, 1e-12)));
  check('z² doubles the angle at 0: π/4 → π/2', close(M.arg(M.value('z2', M.polar(0.3, Math.PI / 4))), Math.PI / 2));
  // a Möbius map sends circles to circles: |z − 1| = 0.5 under 1/z is the circle centred 4/3 of radius 2/3
  const img = M.mapCurve('inv', {}, (t) => M.add([1, 0], M.polar(0.5, t)), 0, 2 * Math.PI, 90).w;
  check('1/z sends the circle |z − 1| = ½ to the circle |w − 4/3| = 2/3', img.every((p) => close(M.abs(M.sub(p, [4 / 3, 0])), 2 / 3, 1e-12)));
  // log sends a polar grid to a Cartesian one
  check('Log maps the circle |z| = 2 to the vertical line u = ln 2', M.mapCurve('log', {}, (t) => M.polar(2, t), -3, 3, 50).w.every((p) => close(p[0], Math.LN2)));
  // a curve crossing the cut breaks in the principal image, and is continuous when followed
  const around = (t) => M.polar(1, t);
  const pr = M.mapCurve('sqrt', {}, around, 0, 2 * Math.PI, 400, { jump: 0.5 });
  check('principal √ breaks where the circle crosses the negative reals', pr.w.some((p) => Number.isNaN(p[0])));
  const fo = M.mapCurve('sqrt', {}, around, 0, 2 * Math.PI, 400, { follow: true, jump: 0.5 });
  check('followed √ is continuous once round', fo.w.every((p) => Number.isFinite(p[0])) && cclose(fo.w[fo.w.length - 1], [-1, 0], 1e-9));
}

// ── branches ──
{
  check('√ just above the cut is +i, just below is −i', cclose(M.sqrtAt([-1, 1e-12]), [0, 1], 1e-9) && cclose(M.sqrtAt([-1, -1e-12]), [0, -1], 1e-9));
  let th = 0;
  for (let k = 1; k <= 720; k++) th = M.contArg(th, M.polar(1, (2 * Math.PI * k) / 360));
  check('continuing the argument twice round 0 gives 4π', close(th, 4 * Math.PI));
  check('branch number after two turns is 2', M.branchOf([1, 0], th) === 2);
  check('√ after two turns is back where it started (monodromy of order 2)', cclose(M.sqrtAt([1, 0], th), [1, 0]));
  check('log after one turn has gained 2πi', cclose(M.logAt([1, 0], 2 * Math.PI), [0, 2 * Math.PI]));
  check('z^{1/3} after one turn is multiplied by e^{2πi/3}', cclose(M.powAt([1, 0], [1 / 3, 0], 2 * Math.PI), M.polar(1, 2 * Math.PI / 3)));
  check('z² is single-valued (no cut); z^½ is not', !M.multivalued('pow', { p: [2, 0] }) && M.multivalued('pow', { p: [0.5, 0] }) && M.multivalued('log') && !M.multivalued('exp'));
  // Log(ab) ≠ Log a + Log b across the cut
  const a = [-1, 1], b = [-1, 1];
  check('Log(ab) and Log a + Log b differ by 2πi for a = b = −1 + i', cclose(M.sub(M.add(M.log(a), M.log(b)), M.log(M.mul(a, b))), [0, 2 * Math.PI]));
}

// ── colour ──
{
  const ok = (c) => c.length === 3 && c.every((x) => Number.isInteger(x) && x >= 0 && x <= 255);
  let all = true;
  for (let k = 0; k < 72; k++) for (const r of [0.3, 1, 3.7]) if (!ok(M.phaseColor(M.polar(r, (2 * Math.PI * k) / 72)))) all = false;
  check('phase colours are valid RGB', all);
  const red = M.phaseColor([1.5, 0], { bands: false });
  check('the positive reals are drawn red', red[0] > red[1] && red[0] > red[2]);
  const blue = M.phaseColor([-1.5, 0], { bands: false });
  check('the negative reals are drawn blue-cyan', blue[2] > blue[0]);
  const same = M.phaseColor(M.polar(1.2, 1), { bands: false }), turned = M.phaseColor(M.polar(1.2, 1 + 2 * Math.PI), { bands: false });
  check('the hue is periodic in arg w', same.every((x, i) => x === turned[i]));
  check('zero and infinity have their own colours', ok(M.phaseColor([0, 0])) && ok(M.phaseColor([Infinity, 0])));
  // lightness steps at |w| = 2: just below is brighter than just above
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  check('brightness steps down where |w| crosses a power of 2', lum(M.phaseColor([1.999, 0.0001])) > lum(M.phaseColor([2.001, 0.0001])));
}

// ── PSL(2, C) ≅ SO⁺(1, 3): Möbius maps of the sky are Lorentz transformations ──
{
  const eta = [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  const matmul = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
  const T = (A) => A[0].map((_, j) => A.map((r) => r[j]));
  const det4 = (A) => {
    const m = A.map((r) => r.slice()); let d = 1;
    for (let i = 0; i < 4; i++) {
      let p = i; for (let r = i + 1; r < 4; r++) if (Math.abs(m[r][i]) > Math.abs(m[p][i])) p = r;
      if (p !== i) { [m[i], m[p]] = [m[p], m[i]]; d = -d; }
      d *= m[i][i];
      for (let r = i + 1; r < 4; r++) { const f = m[r][i] / m[i][i]; for (let c = i; c < 4; c++) m[r][c] -= f * m[i][c]; }
    }
    return d;
  };
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647) * 2 - 1; };
  for (let trial = 0; trial < 20; trial++) {
    let A = [[[rnd(), rnd()], [rnd(), rnd()]], [[rnd(), rnd()], [rnd(), rnd()]]];
    // normalise to det 1: divide by a square root of det A
    const s = M.sqrtAt(M.det2(A));
    A = A.map((r) => r.map((z) => M.div(z, s)));
    const L = M.lorentzOf(A);
    const G = matmul(T(L), matmul(eta, L));
    const worst = Math.max(...G.flatMap((r, i) => r.map((x, j) => Math.abs(x - eta[i][j]))));
    check(`random A ∈ SL(2,C) gives Λ with ΛᵀηΛ = η (trial ${trial})`, worst < 1e-9, `worst ${worst}`);
    check(`…det Λ = +1 and Λ⁰₀ ≥ 1: proper and orthochronous (trial ${trial})`, close(det4(L), 1, 1e-9) && L[0][0] >= 1 - 1e-12);
    const Lm = M.lorentzOf(A.map((r) => r.map((z) => M.scale(z, -1))));
    check(`…and −A gives the same Λ: the map is two-to-one (trial ${trial})`, Lm.every((r, i) => r.every((x, j) => close(x, L[i][j], 1e-12))));
    // the Möbius action on ζ agrees with Λ acting on null directions
    const th = 0.3 + 2.5 * Math.abs(rnd()), ph = 3 * rnd();
    const k = [1, Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
    const k2 = L.map((r) => r.reduce((s2, x, j) => s2 + x * k[j], 0));
    const n = [k2[1] / k2[0], k2[2] / k2[0], k2[3] / k2[0]];
    const [th2, ph2] = M.unstereo(M.actOnSky(A, M.stereo(th, ph)));
    const n2 = [Math.sin(th2) * Math.cos(ph2), Math.sin(th2) * Math.sin(ph2), Math.cos(th2)];
    check(`…its Möbius map of ζ moves each star exactly as Λ does (trial ${trial})`, n.every((x, i) => close(x, n2[i], 1e-9)), `${n} vs ${n2}`);
  }
  // a boost along z is a dilation of ζ, and reproduces the aberration formula
  for (const beta of [0.3, 0.6, 0.9, 0.99]) {
    const rap = Math.atanh(beta), k = Math.exp(-rap);         // ζ ↦ e^{−η} ζ
    check(`e^{−η} = √((1 − β)/(1 + β)) at β = ${beta}`, close(k, Math.sqrt((1 - beta) / (1 + beta))));
    for (const th of [0.4, 1.2, Math.PI / 2, 2.5]) {
      const [th2] = M.unstereo(M.scale(M.stereo(th, 0.7), k));
      check(`dilation by e^{−η} is relativistic aberration (β = ${beta}, θ = ${th})`, close(th2, M.aberrate(th, beta), 1e-12));
    }
    const A = [[[Math.exp(rap / 2), 0], [0, 0]], [[0, 0], [Math.exp(-rap / 2), 0]]];
    const L = M.lorentzOf(A);
    check(`diag(e^{η/2}, e^{−η/2}) is the boost with γ = cosh η along z (β = ${beta})`, close(L[0][0], 1 / Math.sqrt(1 - beta * beta)) && close(Math.abs(L[0][3]), beta / Math.sqrt(1 - beta * beta)));
  }
  // a rotation of the sky is a unitary A: z-rotation by α is ζ ↦ e^{iα} ζ
  const al = 0.9, R = [[[Math.cos(al / 2), -Math.sin(al / 2)], [0, 0]], [[0, 0], [Math.cos(al / 2), Math.sin(al / 2)]]];
  check('A = diag(e^{−iα/2}, e^{iα/2}) turns the sky by α about z', cclose(M.actOnSky(R, [0.6, 0.2]), M.mul(M.polar(1, al), [0.6, 0.2]), 1e-12));
  check('…and its Λ is a rotation (Λ⁰₀ = 1)', close(M.lorentzOf(R)[0][0], 1));
}

// ── the simulation's validator ──
check('defaults validate', validate({ ...defaults }).length === 0, validate({ ...defaults }).join('; '));
check('an unknown function is caught', validate({ ...defaults, f: 'tan' }).length > 0);
check('a bad expression is caught', validate({ ...defaults, a: ['k*', 0], sliders: [{ key: 'k', label: 'k', min: 0, max: 1, value: 0.5, explain: 'x' }] }).length > 0);
check('Möbius with slider expressions validates', validate({ ...defaults, f: 'mobius', a: ['r*cos(th)', 'r*sin(th)'], sliders: [{ key: 'r', label: 'r', min: 0.5, max: 2, value: 1, explain: 'size' }, { key: 'th', label: 'θ', min: -3, max: 3, value: 0, explain: 'turn' }] }).length === 0);
check('TeX in a canvas label is caught', validate({ ...defaults, drag: { x: 1, y: 1, label: '$z_0$' } }).length > 0);
check('u, v expressions are checked', validate({ ...defaults, f: 'uv', u: 'x^2 - ', v: 'y' }).length > 0 && validate({ ...defaults, f: 'uv', u: 'x^2 - y^2', v: '2x y' }).length === 0);
check('fns must include f', validate({ ...defaults, fns: ['exp', 'log'] }).length > 0);

console.log(`cx-map: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
