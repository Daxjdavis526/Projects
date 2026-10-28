// The models behind the pde2-membrane and pde2-fourier simulations:
// Bessel zeros against NIST DLMF Table 10.21.1, mode shapes vanishing on the
// edge and solving the Helmholtz equation, the drum's overtone ratios; and the
// Fourier-space solutions against their closed forms, the PDEs themselves
// (by finite differences) and the transform of a Gaussian.
//   node atlas/test/pde2.test.mjs

import * as B from '../src/viz/model/pde2-membrane.js';
import * as F from '../src/viz/model/pde2-fourier.js';
import { besselJ } from '../src/core/expr.js';
import { validate as vMem, defaults as dMem } from '../src/viz/sims/pde2-membrane.js';
import { validate as vFou, defaults as dFou } from '../src/viz/sims/pde2-fourier.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// Bessel zeros: DLMF Table 10.21.1
const DLMF = [[0, 1, 2.404825557695773], [0, 2, 5.520078110286311], [0, 3, 8.653727912911012], [1, 1, 3.831705970207512], [1, 2, 7.015586669815619], [2, 1, 5.135622301840683], [2, 2, 8.417244140399865], [3, 1, 6.380161895923984], [4, 1, 7.588342434503805], [5, 1, 8.771483815959954]];
for (const [m, k, z] of DLMF) check(`j(${m},${k}) = ${z}`, close(B.besselZero(m, k), z, 1e-11), String(B.besselZero(m, k)));
for (const [m, k] of DLMF) check(`J_${m} vanishes at j(${m},${k})`, Math.abs(besselJ(m, B.besselZero(m, k))) < 1e-12);

// mode shapes vanish on the edge and satisfy ∇²φ + k²φ = 0 (five-point Laplacian)
for (const [sh, m, n, asp] of [['disk', 0, 1, 1], ['disk', 2, 2, 1], ['disk', 3, 1, 1], ['rect', 1, 1, 1], ['rect', 2, 3, 0.7], ['rect', 3, 1, 1.6]]) {
  const k = B.modeK(sh, m, n, asp), h = 1e-3;
  let worst = 0, edge = 0;
  const pts = sh === 'disk' ? [[0.3, 0.2], [-0.5, 0.1], [0.1, -0.6]] : [[0.3, 0.2 * asp], [0.7, 0.55 * asp], [0.45, 0.8 * asp]];
  for (const [x, y] of pts) {
    const f = (a, b) => B.shape(sh, m, n, a, b, asp);
    const lap = (f(x + h, y) + f(x - h, y) + f(x, y + h) + f(x, y - h) - 4 * f(x, y)) / (h * h);
    worst = Math.max(worst, Math.abs(lap + k * k * f(x, y)));
  }
  if (sh === 'disk') for (let t = 0; t < 6.28; t += 0.5) edge = Math.max(edge, Math.abs(B.shape(sh, m, n, Math.cos(t) * (1 - 1e-12), Math.sin(t) * (1 - 1e-12))));
  else for (let s = 0; s <= 1; s += 0.1) edge = Math.max(edge, Math.abs(B.shape(sh, m, n, s, 0, asp)), Math.abs(B.shape(sh, m, n, 0, s * asp, asp)), Math.abs(B.shape(sh, m, n, 1, s * asp, asp)), Math.abs(B.shape(sh, m, n, s, asp, asp)));
  check(`${sh} (${m},${n}) solves Helmholtz`, worst < 1e-3 * k * k, worst.toExponential(2));
  check(`${sh} (${m},${n}) vanishes on the edge`, edge < 1e-9, edge.toExponential(2));
}

// the drum's overtone ratios (research notes) and the square's degeneracy
const disk = B.modeList('disk', 8);
const want = [['0,1', 1], ['1,1', 1.5933], ['2,1', 2.1355], ['0,2', 2.2954], ['3,1', 2.6531], ['1,2', 2.9173], ['4,1', 3.1555], ['2,2', 3.5001]];
want.forEach(([mn, r], i) => check(`disk mode ${i + 1} is (${mn}) at ${r}`, `${disk[i].m},${disk[i].n}` === mn && Math.abs(disk[i].ratio - r) < 6e-5, `${disk[i].m},${disk[i].n} ${disk[i].ratio}`));
const sq = B.modeList('rect', 4, 1);
check('square: (1,2) and (2,1) share a frequency √(5/2)', close(sq[1].ratio, Math.sqrt(2.5), 1e-12) && close(sq[2].ratio, Math.sqrt(2.5), 1e-12));
check('freqHz: drum of radius 0.17 m, c = 92 m/s', close(B.freqHz('disk', 0, 1, 92, 0.17), (92 * 2.404825557695773) / (2 * Math.PI * 0.17), 1e-12));

// Fourier: the transform of e^{−x²/2} is √(2π) e^{−k²/2} (checked at k = 1.3 by quadrature)
{
  let s = 0; const h = 0.001;
  for (let x = -12; x <= 12; x += h) s += Math.exp(-x * x / 2) * Math.cos(1.3 * x) * h;
  check('FT of a Gaussian at k = 1.3', close(s, F.fhat('gauss', 1, 1.3), 1e-9) && close(s, Math.sqrt(2 * Math.PI) * Math.exp(-0.845), 1e-9));
}
// closed forms against synthesis
const p = { D: 0.5, c: 1, beta: 0.5 };
for (const [eq, pr, tol] of [['heat', 'gauss', 1e-10], ['heat', 'box', 1e-10], ['wave', 'gauss', 1e-10], ['schrod', 'gauss', 1e-10], ['laplace', 'box', 1e-7]]) {
  let worst = 0;
  for (let x = -3; x <= 3; x += 0.31) { const a = F.solve(pr, 1, eq, 0.8, p, x), b = F.synth(pr, 1, eq, 0.8, p, x, eq === 'laplace' ? 400 : 40, eq === 'laplace' ? 40000 : 4000); worst = Math.max(worst, Math.hypot(a[0] - b[0], a[1] - b[1])); }
  check(`${eq}/${pr}: closed form = inverse transform`, worst < tol, worst.toExponential(2));
}
// the closed forms solve their PDEs (finite differences)
{
  const h = 1e-3, x = 0.4, s = 0.7;
  const u = (eq, pr, X, S) => F.solve(pr, 1.2, eq, S, p, X);
  const heat = (u('heat', 'gauss', x, s + h)[0] - u('heat', 'gauss', x, s - h)[0]) / (2 * h) - p.D * (u('heat', 'gauss', x + h, s)[0] - 2 * u('heat', 'gauss', x, s)[0] + u('heat', 'gauss', x - h, s)[0]) / (h * h);
  check('heat solution satisfies u_t = D u_xx', Math.abs(heat) < 1e-5, String(heat));
  const sch = [0, 1].map((c) => (u('schrod', 'gauss', x, s + h)[c] - u('schrod', 'gauss', x, s - h)[c]) / (2 * h));
  const lap = [0, 1].map((c) => (u('schrod', 'gauss', x + h, s)[c] - 2 * u('schrod', 'gauss', x, s)[c] + u('schrod', 'gauss', x - h, s)[c]) / (h * h));
  // u_t = iβ u_xx: re(u_t) = −β im(u_xx), im(u_t) = β re(u_xx)
  check('dispersive solution satisfies u_t = iβ u_xx', Math.abs(sch[0] + p.beta * lap[1]) < 1e-5 && Math.abs(sch[1] - p.beta * lap[0]) < 1e-5);
  const L = (X, Y) => F.solve('box', 1, 'laplace', Y, p, X)[0];
  const lapl = (L(x + h, 0.6) + L(x - h, 0.6) + L(x, 0.6 + h) + L(x, 0.6 - h) - 4 * L(x, 0.6)) / (h * h);
  check('Laplace half-plane solution is harmonic', Math.abs(lapl) < 1e-4, String(lapl));
}
// heat spreads a Gaussian as σ² = w² + 2Dt; the dispersive packet's |u| keeps its area-like norm ∫|u|²
{
  const xs = [], us = [];
  for (let x = -30; x <= 30; x += 0.01) { xs.push(x); us.push(F.solve('gauss', 1, 'heat', 2, p, x)[0]); }
  check('heat: rms half-width √(w² + 2Dt)', close(F.spread(xs, us), Math.sqrt(1 + 2 * 0.5 * 2), 1e-6));
  let n0 = 0, n1 = 0;
  for (let x = -30; x <= 30; x += 0.01) { n0 += F.f0('gauss', 1, x) ** 2; const [r, i] = F.solve('gauss', 1, 'schrod', 3, p, x); n1 += r * r + i * i; }
  check('dispersive: ∫|u|² is conserved', close(n0, n1, 1e-9));
}

// validators accept the defaults and reject nonsense
check('pde2-membrane defaults valid', vMem({ ...dMem }).length === 0, vMem({ ...dMem }).join('; '));
check('pde2-membrane rejects m = 0 on a rectangle', vMem({ ...dMem, shape: 'rect', m: 0 }).length > 0);
check('pde2-fourier defaults valid', vFou({ ...dFou }).length === 0, vFou({ ...dFou }).join('; '));
check('pde2-fourier rejects t > tmax', vFou({ ...dFou, t: 9, tmax: 4 }).length > 0);

console.log(`pde2: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
