// The algebra behind the ten-basis simulation — components in a skewed basis,
// the dual basis, the pairing of a covector with a vector and its
// independence of the basis — checked headlessly.
//   node atlas/test/ten-basis.test.mjs

import * as M from '../src/viz/model/ten-basis.js';
import * as SIM from '../src/viz/sims/ten-basis.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const s3 = Math.sqrt(3);
const SKEW = [[1, 0], [0.5, s3 / 2]];

// components in a skewed basis (the research notes' K-A0)
const c = M.comps(SKEW, [1, 1]);
check('V = (1, 1) in e₁ = (1, 0), e₂ = (½, √3/2) has V¹ = 1 − 1/√3', near(c[0], 1 - 1 / s3), c[0]);
check('… and V² = 2/√3', near(c[1], 2 / s3), c[1]);
const back = M.combine(SKEW, c);
check('V¹e₁ + V²e₂ rebuilds the arrow', near(back[0], 1) && near(back[1], 1));
check('a degenerate basis gives NaN components', M.comps([[1, 2], [2, 4]], [1, 0]).every(Number.isNaN));

// the dual basis: eⁱ(eⱼ) = δⁱⱼ, and eⁱ(V) = Vⁱ
const D = M.dual(SKEW);
for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) check(`e^${i + 1}(e_${j + 1}) = δ`, near(M.pair(D[i], SKEW[j]), i === j ? 1 : 0));
check('e¹ = (1, −1/√3) and e² = (0, 2/√3) for the skewed basis', near(D[0][0], 1) && near(D[0][1], -1 / s3) && near(D[1][0], 0) && near(D[1][1], 2 / s3));
check('eⁱ(V) are the components of V', near(M.pair(D[0], [1, 1]), c[0]) && near(M.pair(D[1], [1, 1]), c[1]));
check('the dual of a stretched basis is shrunk: (2e₁, e₂) has e¹ = ½ dx', near(M.dual([[2, 0], [0, 1]])[0][0], 0.5));

// a covector: components, rebuilding, and the pairing's independence of the basis
const row = [0.7, -1.3], V = [2.2, 0.9];
const w = M.covComps(SKEW, row);
const rb = M.covFromComps(SKEW, w);
check('ω₁e¹ + ω₂e² rebuilds the covector', near(rb[0], row[0]) && near(rb[1], row[1]));
const pairIn = (B) => { const wc = M.covComps(B, row), vc = M.comps(B, V); return wc[0] * vc[0] + wc[1] * vc[1]; };
const bases = [[[1, 0], [0, 1]], SKEW, [[2, 0.3], [-0.4, 1.1]], M.rotate(SKEW, 0.8), [[0.5, 0], [0, 3]]];
check('ωᵢVⁱ is the same number in five bases', bases.every((B) => near(pairIn(B), M.pair(row, V))), bases.map(pairIn).join(', '));

// changing basis: e′ⱼ = Aⁱⱼ eᵢ, so V′ = A⁻¹V and ω′ = ω A
const NEW = [[1.5, 0.5], [-0.5, 1]];
const A = M.changeMatrix(SKEW, NEW);
const col = (j) => M.combine(SKEW, [A[0][j], A[1][j]]);
check('column j of A holds the old components of e′ⱼ', [0, 1].every((j) => near(col(j)[0], NEW[j][0]) && near(col(j)[1], NEW[j][1])));
const Ai = M.inv2(A), vo = M.comps(SKEW, V), vn = M.comps(NEW, V);
check('vector components transform with A⁻¹', [0, 1].every((j) => near(vn[j], Ai[j][0] * vo[0] + Ai[j][1] * vo[1])));
const wo = M.covComps(SKEW, row), wn = M.covComps(NEW, row);
check('covector components transform with A itself', [0, 1].every((j) => near(wn[j], A[0][j] * wo[0] + A[1][j] * wo[1])));
check('a rotation keeps lengths', near(M.len(M.rotate([[3, 4]], 1.1)[0]), 5));

// stacks: the levels in a window, their clipped segments, and the lines a displacement crosses
check('levels of x + y in [0, 2] × [0, 1] are 0 … 3', JSON.stringify(M.levelsIn([1, 1], [0, 2], [0, 1])) === '[0,1,2,3]');
const seg = M.clipLine([1, 1], 1, [0, 2], [0, 2]);
check('the line x + y = 1 clips to (1, 0)–(0, 1)', seg && seg.some((p) => near(p[0], 0) && near(p[1], 1)) && seg.some((p) => near(p[0], 1) && near(p[1], 0)));
check('a vertical line clips correctly', (() => { const s = M.clipLine([2, 0], 1, [-1, 1], [-1, 1]); return s && s.every((p) => near(p[0], 0.5)); })());
check('a line outside the window clips to null', M.clipLine([1, 0], 5, [0, 1], [0, 1]) === null);
check('from level 0 to 2.5 crosses 1 and 2', JSON.stringify(M.crossed([1, 0], [0, 0], [2.5, 0])) === '[1,2]');
check('from level 0 to exactly 3 crosses 1, 2, 3', JSON.stringify(M.crossed([1, 0], [0, 0], [3, 0])) === '[1,2,3]');
check('going down from 0 to −1.5 crosses −1', JSON.stringify(M.crossed([1, 0], [0, 0], [-1.5, 0])) === '[-1]');
check('a step along a line crosses nothing', M.crossed([1, 1], [0, 0], [1, -1]).length === 0);

// the simulation's parameter check
const val = (p) => SIM.validate({ ...SIM.defaults, ...p });
check('the defaults are valid', val({}).length === 0, val({}).join('; '));
check('a parallel basis is rejected', val({ basis: [[1, 1], [2, 2]] }).length > 0);
check('rotate and dragBasis together are rejected', val({ rotate: true, dragBasis: true }).length > 0);
check('TeX in a canvas label is rejected', val({ vname: '\\vec V' }).length > 0);
check('a bad readout key is rejected', val({ readout: ['nope'] }).length > 0);
check('covector components outside the sliders are rejected', val({ mode: 'covector', covector: [4, 0] }).length > 0);
check('presets must start with the starting basis', val({ presets: [{ label: 'a', basis: [[0, 1], [1, 0]] }] }).length > 0);

console.log(`ten-basis: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
