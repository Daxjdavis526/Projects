// The algebra behind the ten-metric simulation — bilinear machines, lowering
// and raising, the inverse, signature (and that a change of basis cannot alter
// it), the metric's unit "circles", and lengths on coordinate charts —
// checked headlessly.
//   node atlas/test/ten-metric.test.mjs

import * as M from '../src/viz/model/ten-metric.js';
import * as SIM from '../src/viz/sims/ten-metric.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// a bilinear machine and its two partial feedings
const T = [[2, 1], [-1, 3]], U = [1, 2], V = [3, -1];
check('T(U, V) = Uᵘ T_μν Vᵛ', near(M.bil(T, U, V), 1 * (2 * 3 + 1 * -1) + 2 * (-1 * 3 + 3 * -1)));
check('T(U, ·) applied to V is T(U, V)', near(M.pair(M.feedFirst(T, U), V), M.bil(T, U, V)));
check('T(·, U) applied to V is T(V, U)', near(M.pair(M.feedSecond(T, U), V), M.bil(T, V, U)));
check('linear in the first slot: T(2U + V, V) = 2T(U, V) + T(V, V)', near(M.bil(T, [2 * U[0] + V[0], 2 * U[1] + V[1]], V), 2 * M.bil(T, U, V) + M.bil(T, V, V)));
check('not linear jointly: T(2U, 2V) = 4T(U, V)', near(M.bil(T, [2, 4], [6, -2]), 4 * M.bil(T, U, V)));
// symmetric and antisymmetric parts
const S = M.sym(T), A = M.anti(T);
check('T = S + A', [0, 1].every((i) => [0, 1].every((j) => near(S[i][j] + A[i][j], T[i][j]))));
check('A(X, X) = 0 for every X', near(M.bil(A, [0.3, -1.7], [0.3, -1.7]), 0));
check('T(X, X) sees only the symmetric part', near(M.bil(T, [0.3, -1.7], [0.3, -1.7]), M.bil(S, [0.3, -1.7], [0.3, -1.7])));
// products
const P = M.outer([1, 2], [3, -1]);
check('a tensor product has determinant 0', near(M.det2(P), 0));
check('(ω ⊗ η)(U, V) = ω(U) η(V)', near(M.bil(P, U, V), M.pair([1, 2], U) * M.pair([3, -1], V)));
// the metric: lowering, raising, the inverse
const g = [[1, 0.5], [0.5, 1]];
const Vlow = M.feedFirst(g, V);
check('raising the lowered vector gives it back', M.raise(g, Vlow).every((x, i) => near(x, V[i])));
const gi = M.inv2(g);
check('g^{μλ} g_{λν} = δ', near(gi[0][0] * g[0][0] + gi[0][1] * g[1][0], 1) && near(gi[0][0] * g[0][1] + gi[0][1] * g[1][1], 0));
check('a degenerate tensor has no inverse', M.inv2([[1, 2], [2, 4]]) === null);
// the skewed basis of the research notes (K-A0): e₁ = (1, 0), e₂ = (½, √3/2), V = (1, 1) in Cartesian
const s3 = Math.sqrt(3), Vc = [1 - 1 / s3, 2 / s3];
check('K-A0: g(V, V) = 2 in the skewed basis', near(M.bil(g, Vc, Vc), 2));
check('K-A0: V_i = (1, (1 + √3)/2)', near(M.feedFirst(g, Vc)[0], 1) && near(M.feedFirst(g, Vc)[1], (1 + s3) / 2));
// signature, and Sylvester's law of inertia under random changes of basis
const eta = [[-1, 0], [0, 1]];
check('η has signature (−, +)', M.sigText(M.signature(eta)) === '(−, +)');
check('light-cone coordinates: g = [[0, −½], [−½, 0]] has signature (−, +)', M.sigText(M.signature([[0, -0.5], [-0.5, 0]])) === '(−, +)');
check('a degenerate form shows a zero', M.signature([[1, 1], [1, 1]]).zero === 1);
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 4 - 2;
let kept = true;
for (let k = 0; k < 200; k++) {
  const B = [[rnd(), rnd()], [rnd(), rnd()]];
  if (Math.abs(M.det2(B)) < 0.05) continue;
  for (const G of [eta, g, [[-1, 0], [0, -2]]]) if (M.sigText(M.signature(M.congruent(G, B))) !== M.sigText(M.signature(G))) kept = false;
}
check('Sylvester: no change of basis alters the signature (200 random bases)', kept);
check('congruent(T, A) is T(e′μ, e′ν)', near(M.congruent(g, [[2, 0], [1, 1]])[0][1], M.bil(g, [2, 1], [0, 1])));
// null directions and kinds
const nd = M.nullDirs(eta);
check('η has two null directions, x = ±t', nd.length === 2 && nd.every((d) => near(M.bil(eta, d, d), 0)));
check('a Euclidean metric has no null directions', M.nullDirs([[1, 0], [0, 1]]).length === 0);
check('light-cone null directions are the axes', M.nullDirs([[0, -0.5], [-0.5, 0]]).every((d) => near(M.bil([[0, -0.5], [-0.5, 0]], d, d), 0)));
check('(t = 2, x = 1) is timelike', M.kind([[1, 0], [0, -1]], [1, 2]) === 'timelike');
// the conic: every point on it has T(X, X) = level
const ell = M.conic([[1, 0], [0, 4]], 1).flat();
check('the unit ellipse of diag(1, 4): g(X, X) = 1 everywhere', ell.length > 100 && ell.every((x) => near(M.bil([[1, 0], [0, 4]], x, x), 1, 1e-9)));
check('…and it is one closed curve', M.conic([[1, 0], [0, 4]], 1).length === 1);
const hyp = M.conic(eta, 1, 10);
check('η(X, X) = 1 is a hyperbola: two branches', hyp.length === 2 && hyp.flat().every((x) => near(M.bil(eta, x, x), 1, 1e-9)));
check('a negative-definite form has no unit circle', M.conic([[-1, 0], [0, -1]], 1).length === 0);
// metric fields on charts
const sp = M.chartMetric('sphere', 0.3, Math.PI / 6);
check('the unit 2-sphere at θ = 30°: g_φφ = sin²θ = ¼, g_θθ = 1', near(sp[0][0], 0.25) && near(sp[1][1], 1));
check('polar g at r = 2 is diag(1, 4)', near(M.chartMetric('polar', 2, 1)[1][1], 4));
check('polar is singular at r = 0', M.chartMetric('polar', 0, 1) === null);
const circ = M.segmentLength('polar', [2, 0], [2, 2 * Math.PI]);
check('a circle r = 2 in the polar chart has length 4π', near(circ.length, 4 * Math.PI, 1e-6), circ.length);
const hp = M.segmentLength('halfplane', [0, 1], [0, Math.E]);
check('half-plane: from y = 1 to y = e is length 1', near(hp.length, 1, 1e-5), hp.length);
const mk = M.segmentLength('minkowski', [0, 0], [3, 5]);
check('Minkowski: (Δt, Δx) = (5, 3) has Δs² = −16', near(mk.s2, -16, 1e-9), mk.s2);
const eq = M.segmentLength('sphere', [0, Math.PI / 2], [Math.PI, Math.PI / 2], { R: 2 });
check('half the equator of a sphere of radius 2 is 2π', near(eq.length, 2 * Math.PI, 1e-6));
// the sim's own validation
const D = SIM.defaults;
check('defaults validate', SIM.validate({ ...D }).length === 0, SIM.validate({ ...D }).join('; '));
check('chart defaults validate', SIM.validate({ ...D, mode: 'chart' }).length === 0, SIM.validate({ ...D, mode: 'chart' }).join('; '));
check('an unknown chart is caught', SIM.validate({ ...D, mode: 'chart', chart: 'torus' }).length > 0);
check('a probe on the pole is caught', SIM.validate({ ...D, mode: 'chart', chart: 'sphere', probe: [1, 0] }).length > 0);
check('a TeX canvas label is caught', SIM.validate({ ...D, uname: 'U_1' }).length > 0);
check('sym sliders need a symmetric T', SIM.validate({ ...D, sliders: 'sym', T: [[1, 2], [0, 1]] }).length > 0);

console.log(`ten-metric: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
