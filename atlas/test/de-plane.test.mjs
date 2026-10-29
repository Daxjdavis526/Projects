// The planar-systems and normal-mode models behind sims/de-plane.js,
// sims/de-tracedet.js and sims/de-modes.js, checked against results the
// MATH 2280 lessons teach: every type on the trace–determinant map, e^{At}
// against its power series and its defining properties, trajectories that
// close (a centre) and that conserve energy (the pendulum), equilibria and
// their types (pendulum, competing species), and normal modes of two coupled
// masses and of CO₂.
//   node atlas/test/de-plane.test.mjs

import { eig2, classify2, classifyTD, expm2, expmSeries, trajectory, orbit, at, jacobian, equilibria } from '../src/viz/model/de-plane.js';
import { symEig, chainK, modes, motion, energies } from '../src/viz/model/de-modes.js';
import * as PL from '../src/viz/sims/de-plane.js';
import * as TD from '../src/viz/sims/de-tracedet.js';
import * as MO from '../src/viz/sims/de-modes.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const mnear = (A, B, tol) => A.every((r, i) => r.every((v, j) => near(v, B[i][j], tol * Math.max(1, Math.abs(B[i][j])))));

// the trace–determinant map, every region and border
{
  const cases = [
    [[1, 2], [2, 1], 'saddle', 'unstable'],
    [[-2, 1], [1, -2], 'node', 'stable'],
    [[3, 1], [1, 2], 'node', 'unstable'],
    [[-1, 2], [-2, -1], 'spiral', 'stable'],
    [[0.5, -3], [3, 0.5], 'spiral', 'unstable'],
    [[0, 1], [-1, 0], 'centre', 'neutral'],
    [[3, 1], [0, 3], 'degenerate', 'unstable'],
    [[-2, 0], [0, -2], 'star', 'stable'],
    [[1, 2], [2, 4], 'line', 'unstable'],
    [[0, 1], [0, 0], 'line', 'neutral'],
    [[0, 0], [0, 0], 'zero', 'neutral'],
  ];
  for (const [[a, b], [c, d], kind, stab] of cases) {
    const T = classify2(a, b, c, d);
    check(`[[${a}, ${b}], [${c}, ${d}]] is a ${stab} ${kind}`, T.kind === kind && T.stability === stab, `${T.kind} ${T.stability}`);
  }
  check('rotation sense: c > 0 turns counterclockwise', classify2(0, -1, 1, 0).turn === 'ccw' && classify2(0, 1, -1, 0).turn === 'cw');
  check('companion form: τ = −1, Δ = 2 is a stable spiral', classifyTD(-1, 2).name === 'stable spiral');
  check('companion form on the parabola is a degenerate node, not a star', classifyTD(-2, 1).kind === 'degenerate');
  check('companion form: Δ < 0 is a saddle whatever τ', [-3, 0, 3].every((t) => classifyTD(t, -1).kind === 'saddle'));
  // eigenvectors really are eigenvectors
  for (const A of [[[1, 2], [2, 1]], [[-0.15, 0.05], [0.05, -0.15]], [[1, 1], [4, 1]], [[3, 1], [0, 3]]]) {
    const e = eig2(A[0][0], A[0][1], A[1][0], A[1][1]);
    const ok = e.vectors.every(({ lambda, dir }) => near(A[0][0] * dir[0] + A[0][1] * dir[1], lambda * dir[0], 1e-12) && near(A[1][0] * dir[0] + A[1][1] * dir[1], lambda * dir[1], 1e-12));
    check(`Av = λv for every eigenvector of ${JSON.stringify(A)}`, ok && e.vectors.length === (A[0][0] === 3 ? 1 : 2));
  }
  const e = eig2(1, -5, 1, -3);
  check('[[1, −5], [1, −3]] has eigenvalues −1 ± i', near(e.values[0].re, -1, 1e-12) && near(Math.abs(e.values[0].im), 1, 1e-12));
}

// e^{At}
{
  const mats = [[[1, 2], [2, 1]], [[-1, 2], [-2, -1]], [[3, 1], [0, 3]], [[0, 1], [-4, 0]], [[1, -5], [1, -3]], [[0, 1], [0, 0]], [[-2, 0], [0, -2]]];
  for (const A of mats) for (const t of [0.3, 1.1]) {
    const X = expm2(A[0][0], A[0][1], A[1][0], A[1][1], t);
    check(`e^{At} matches its series for ${JSON.stringify(A)}, t = ${t}`, mnear(X, expmSeries(A, t, 60), 1e-10), JSON.stringify(X));
  }
  const A = [[1, 2], [2, 1]], t = 0.7, X = expm2(1, 2, 2, 1, t);
  const e3 = Math.exp(3 * t), e1 = Math.exp(-t);
  check('diagonalization: e^{At} = ½[[e³ᵗ + e⁻ᵗ, e³ᵗ − e⁻ᵗ], …]', mnear(X, [[(e3 + e1) / 2, (e3 - e1) / 2], [(e3 - e1) / 2, (e3 + e1) / 2]], 1e-12));
  check('nilpotent part: e^{At} = e³ᵗ(I + Nt) for [[3, 1], [0, 3]]', mnear(expm2(3, 1, 0, 3, t), [[Math.exp(3 * t), t * Math.exp(3 * t)], [0, Math.exp(3 * t)]], 1e-12));
  const h = 1e-6, Xp = expm2(1, 2, 2, 1, t + h), Xm = expm2(1, 2, 2, 1, t - h);
  const dX = [[(Xp[0][0] - Xm[0][0]) / (2 * h), (Xp[0][1] - Xm[0][1]) / (2 * h)], [(Xp[1][0] - Xm[1][0]) / (2 * h), (Xp[1][1] - Xm[1][1]) / (2 * h)]];
  const AX = [[A[0][0] * X[0][0] + A[0][1] * X[1][0], A[0][0] * X[0][1] + A[0][1] * X[1][1]], [A[1][0] * X[0][0] + A[1][1] * X[1][0], A[1][0] * X[0][1] + A[1][1] * X[1][1]]];
  check('d/dt e^{At} = A e^{At}', mnear(dX, AX, 1e-6));
  const D = expm2(-1, 2, -2, -1, 1.3), det = D[0][0] * D[1][1] - D[0][1] * D[1][0];
  check('det e^{At} = e^{τt} (Liouville)', near(det, Math.exp(-2 * 1.3), 1e-12));
  check('e^{A·0} = I', mnear(expm2(4, -1, 2, 7, 0), [[1, 0], [0, 1]], 1e-15));
}

// trajectories
{
  const f = (x, y) => [y, -x];
  const p = trajectory(f, 1, 0, { T: 2 * Math.PI, box: [[-2, 2], [-2, 2]] });
  const end = p[p.length - 1];
  check('a centre closes after one period 2π', near(end.x, 1, 1e-7) && near(end.y, 0, 1e-7) && near(end.t, 2 * Math.PI, 1e-12), JSON.stringify(end));
  const q = at(p, Math.PI / 2);
  check('at(): the position a quarter period on is (0, −1)', near(q.x, 0, 1e-3) && near(q.y, -1, 1e-3));
  const pend = (x, y) => [y, -Math.sin(x)], E = (x, y) => y * y / 2 - Math.cos(x);
  const r = trajectory(pend, 2.5, 0, { T: 40, box: [[-4, 4], [-3, 3]], maxSteps: 20000 });
  const drift = Math.max(...r.map((s) => Math.abs(E(s.x, s.y) - E(2.5, 0))));
  check('the pendulum conserves energy along a traced trajectory (drift < 1e-6)', drift < 1e-6, drift.toExponential(2));
  const o = orbit((x, y) => [-x, -2 * y], 1, 1, { T: 3, box: [[-2, 2], [-2, 2]] });
  check('orbit(): times increase through the start point', o.every((s, i) => i === 0 || s.t > o[i - 1].t) && o.some((s) => s.t === 0));
  const out = trajectory((x, y) => [x, y], 1, 1, { T: 100, box: [[-2, 2], [-2, 2]] });
  check('a trajectory stops after it leaves the window', out[out.length - 1].t < 5);
}

// equilibria and their types
{
  const pend = (x, y) => [y, -Math.sin(x) - 0.5 * y];
  const eq = equilibria(pend, [[-4, 4], [-2, 2]]);
  const names = eq.map((e) => `${e.x.toFixed(3)}:${e.type.name}`).join(' ');
  check('damped pendulum: saddles at ±π, a stable spiral at 0', eq.length === 3 && near(eq[0].x, -Math.PI, 1e-7) && eq[0].type.kind === 'saddle' && near(eq[1].x, 0, 1e-9) && eq[1].type.name === 'stable spiral' && eq[2].type.kind === 'saddle', names);
  const comp = (x, y) => [x * (3 - x - 2 * y), y * (2 - x - y)];
  const ec = equilibria(comp, [[-0.5, 4], [-0.5, 3]]);
  const want = [[0, 0, 'unstable node'], [0, 2, 'stable node'], [1, 1, 'saddle'], [3, 0, 'stable node']];
  check('competing species x(3 − x − 2y), y(2 − x − y): four equilibria, coexistence a saddle', ec.length === 4 && want.every(([x, y, n], i) => near(ec[i].x, x, 1e-7) && near(ec[i].y, y, 1e-7) && ec[i].type.name === n), ec.map((e) => `(${e.x.toFixed(3)}, ${e.y.toFixed(3)}) ${e.type.name}`).join('; '));
  const lv = (x, y) => [x * (1 - 0.5 * y), y * (-0.75 + 0.25 * x)];
  const el = equilibria(lv, [[-0.5, 8], [-0.5, 6]]);
  check('Lotka–Volterra: a saddle at the origin, a linearized centre at (3, 2)', el.length === 2 && el[0].type.kind === 'saddle' && near(el[1].x, 3, 1e-7) && near(el[1].y, 2, 1e-7) && el[1].type.kind === 'centre', el.map((e) => e.type.name).join(', '));
  const J = jacobian((x, y) => [x * x * y, Math.sin(x) + y * y], 1, 2);
  check('jacobian by central differences', mnear(J, [[4, 1], [Math.cos(1), 4]], 1e-8));
}

// normal modes
{
  const { values } = symEig([[2, -1, 0], [-1, 2, -1], [0, -1, 2]]);
  check('symEig: eigenvalues 2 − √2, 2, 2 + √2', near(values[0], 2 - Math.SQRT2, 1e-12) && near(values[1], 2, 1e-12) && near(values[2], 2 + Math.SQRT2, 1e-12));
  const m = 1, k = 10, kc = 1, M = modes([m, m], chainK([k, kc, k]));
  check('two equal masses: ω₁ = √(k/m) in phase, ω₂ = √((k + 2k_c)/m) out of phase', near(M[0].omega, Math.sqrt(k / m), 1e-12) && near(M[1].omega, Math.sqrt((k + 2 * kc) / m), 1e-12) && M[0].shape.join() === '1,1' && near(M[1].shape[1], -1, 1e-12));
  const x = motion([m, m], chainK([k, kc, k]), [1, 0], [0, 0]);
  const tb = Math.PI / (M[1].omega - M[0].omega), s = x(tb);
  const e1 = (q) => 0.5 * m * q.v[0] ** 2 + 0.5 * k * q.x[0] ** 2;
  check('beats: after π/(ω₂ − ω₁) mass 1 holds under 5% of the energy it started with', Math.abs(s.x[0]) < 1e-9 && e1(s) < 0.05 * e1(x(0)), String(e1(s) / e1(x(0))));
  const springs = [k, kc, k], E0 = energies([m, m], springs, [1, 0], [0, 0]);
  const tot = (q) => q.kinetic.reduce((a, b) => a + b, 0) + q.springs.reduce((a, b) => a + b, 0);
  const s7 = x(7.3);
  check('modal superposition conserves energy', near(tot(energies([m, m], springs, s7.x, s7.v)), tot(E0), 1e-12));
  const C = modes([16, 12, 16], chainK([0, 1, 1, 0]));
  check('CO₂ as balls and springs: ω = 0, √(k/m_O), √(k/m_O)·√(1 + 2m_O/m_C)', C[0].omega === 0 && near(C[1].omega, 0.25, 1e-12) && near(C[2].omega / C[1].omega, Math.sqrt(1 + 32 / 12), 1e-12));
  check('CO₂ antisymmetric stretch: carbon moves 2m_O/m_C times as far, the other way', near(C[2].shape[1] / C[2].shape[0], -32 / 12, 1e-10));
  check('CO₂ symmetric stretch: carbon stands still', C[1].shape[1] === 0 && near(C[1].shape[0], -C[1].shape[2], 1e-12));
}

// the sims' parameter checks
{
  check('de-plane defaults validate', PL.validate({ ...PL.defaults }).length === 0, PL.validate({ ...PL.defaults }).join('; '));
  check('de-plane catches a bad expression', PL.validate({ ...PL.defaults, fx: 'y +* 2' }).length === 1);
  check('de-plane catches TeX in a canvas label', PL.validate({ ...PL.defaults, points: [{ x: 0, y: 0, label: '$x_0$' }] }).length === 1);
  check('de-plane needs a start point for series', PL.validate({ ...PL.defaults, series: true }).length === 1);
  check('de-plane accepts a matrix in slider keys', PL.validate({ ...PL.defaults, matrix: [[0, 1], ['-k', '-c']], sliders: [{ key: 'k', label: 'k', min: 0, max: 4, value: 1, explain: 'e' }, { key: 'c', label: 'c', min: 0, max: 4, value: 1, explain: 'e' }] }).length === 0);
  check('de-tracedet defaults validate', TD.validate({ ...TD.defaults }).length === 0, TD.validate({ ...TD.defaults }).join('; '));
  check('de-tracedet catches a bad panel', TD.validate({ ...TD.defaults, panels: 'all' }).length === 1);
  check('de-modes defaults validate', MO.validate({ ...MO.defaults }).length === 0, MO.validate({ ...MO.defaults }).join('; '));
  check('de-modes co2 validates', MO.validate({ ...MO.defaults, system: 'co2', start: 'mode2', controls: ['ratio'] }).length === 0);
  check('de-modes catches a bad start', MO.validate({ ...MO.defaults, start: 'mode3' }).length === 1);
}

console.log(`de-plane: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
