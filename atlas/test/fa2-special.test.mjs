// The special functions behind the st-e lessons E6–E12 (src/viz/model/fa2-special.js)
// against reference values from SciPy 1.18 (scipy.special: yv, yvp, lpmv,
// eval_genlaguerre, eval_hermite, zeta; brentq on the annular cross-products),
// plus identities they must satisfy: orthogonality with the right weight,
// the Bessel Wronskian, Bernstein ellipses, and the fa2 simulations' validate().
//   node atlas/test/fa2-special.test.mjs

import * as S from '../src/viz/model/fa2-special.js';
import { validate as vSphere, defaults as dSphere } from '../src/viz/sims/fa2-sphere.js';
import { validate as vBessel, defaults as dBessel } from '../src/viz/sims/fa2-bessel.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const PI = Math.PI;

// Yₙ(x): scipy.special.yv
const Y = [[0, 0.1, -1.5342386513503667], [0, 1, 0.088256964215677], [0, 5, -0.3085176252490338], [0, 20, 0.06264059680938386],
  [0, 45, 0.0270604697633133], [1, 0.5, -1.4714723926702433], [1, 3, 0.32467442479180014], [1, 30, 0.08442557066174725],
  [2, 0.05, -509.6148958461817], [3, 2, -1.127783776840428], [5, 1, -260.40586662581234], [4, 12, -0.15121770441750626], [6, 0.3, -3368520.895537457]];
for (const [n, x, v] of Y) check(`Y_${n}(${x}) = ${v}`, close(S.besselY(n, x), v, 1e-11), String(S.besselY(n, x)));
for (const [n, x, v] of [[0, 1.5, 0.4123086269739113], [1, 2.5, 0.4397031044285177], [2, 7, -0.28537392003324996]]) check(`Y'_${n}(${x})`, close(S.besselYp(n, x), v, 1e-11));
// the Wronskian Jₙ Yₙ′ − Jₙ′ Yₙ = 2/(πx)
for (const [n, x] of [[0, 0.7], [1, 4.2], [3, 9.5], [2, 25]]) {
  const W = S.besselJ(n, x) * S.besselYp(n, x) - S.besselJp(n, x) * S.besselY(n, x);
  check(`Wronskian at n = ${n}, x = ${x}`, close(W, 2 / (PI * x), 1e-10), String(W));
}
// associated Legendre (no Condon–Shortley phase): (−1)ᵐ scipy.special.lpmv
for (const [l, m, x, v] of [[3, 2, 0.3, 4.095], [4, 1, -0.6, 0.576], [5, 5, 0.2, 853.3160043467132], [6, 3, 0.7, 95.96917540484844]]) check(`P_${l}^${m}(${x})`, close(S.assocLegendre(l, m, x), v, 1e-12));
for (const l of [0, 1, 2, 5, 9]) check(`P_${l}^0 = P_${l}`, close(S.assocLegendre(l, 0, 0.37), S.legendre(l, 0.37), 1e-13));
// Laguerre and Hermite
for (const [n, x, a, v] of [[3, 1.7, 0, -0.5838333333333332], [4, 2.2, 1, -0.6972666666666665], [5, 0.4, 2, 9.583381333333334]]) check(`L_${n}^(${a})(${x})`, close(S.laguerre(n, x, a), v, 1e-12));
for (const [n, x, v] of [[5, 0.7, 34.49824], [6, -1.3, 34.78777599999988]]) check(`H_${n}(${x})`, close(S.hermite(n, x), v, 1e-12));
check('H_n(x) = 2^(n/2) He_n(√2 x)', close(S.hermite(5, 0.9), 2 ** 2.5 * S.hermiteHe(5, Math.SQRT2 * 0.9), 1e-12));
// orthogonality with the weight, by quadrature
const ip = (f, g, w, a, b) => S.integrate((x) => f(x) * g(x) * w(x), a, b, 60);
check('∫P₃² = 2/7', close(ip((x) => S.legendre(3, x), (x) => S.legendre(3, x), () => 1, -1, 1), 2 / 7, 1e-13));
check('∫P₂P₄ = 0', Math.abs(ip((x) => S.legendre(2, x), (x) => S.legendre(4, x), () => 1, -1, 1)) < 1e-14);
check('∫H₃² e^(−x²) = 48√π', close(ip((x) => S.hermite(3, x), (x) => S.hermite(3, x), (x) => Math.exp(-x * x), -12, 12), 48 * Math.sqrt(PI), 1e-12));
check('∫H₂H₄ e^(−x²) = 0', Math.abs(ip((x) => S.hermite(2, x), (x) => S.hermite(4, x), (x) => Math.exp(-x * x), -12, 12)) < 1e-10);
check('∫L₂L₃ e^(−x) = 0', Math.abs(ip((x) => S.laguerre(2, x), (x) => S.laguerre(3, x), (x) => Math.exp(-x), 0, 80)) < 1e-12);
check('∫L₃² e^(−x) = 1', close(ip((x) => S.laguerre(3, x), (x) => S.laguerre(3, x), (x) => Math.exp(-x), 0, 80), 1, 1e-12));
// real spherical harmonics are orthonormal on the sphere
const sph = (f) => S.integrate((th) => Math.sin(th) * S.integrate((ph) => f(th, ph), 0, 2 * PI, 8), 0, PI, 16);
for (const [l, m] of [[0, 0], [1, 1], [2, -1], [3, 2], [4, -3]]) check(`∫Y_${l}${m}² dΩ = 1`, close(sph((t, p) => S.ylmReal(l, m, t, p) ** 2), 1, 1e-10));
check('∫Y₂₁ Y₃₁ dΩ = 0', Math.abs(sph((t, p) => S.ylmReal(2, 1, t, p) * S.ylmReal(3, 1, t, p))) < 1e-12);
check('∫Y₂₂ Y₂₋₂ dΩ = 0', Math.abs(sph((t, p) => S.ylmReal(2, 2, t, p) * S.ylmReal(2, -2, t, p))) < 1e-12);
check('Unsöld: Σₘ Y_3m² = 7/4π', close([-3, -2, -1, 0, 1, 2, 3].reduce((s, m) => s + S.ylmReal(3, m, 1.1, 0.4) ** 2, 0), 7 / (4 * PI), 1e-12));
// Gauss–Legendre and Chebyshev
const g3 = S.gaussLegendre(3);
check('3-point Gauss–Legendre nodes ±√(3/5), 0', close(Math.max(...g3.x), Math.sqrt(0.6), 1e-15) && close(g3.w[1], 8 / 9, 1e-14));
check('Tₙ(cos θ) = cos nθ', close(S.chebT(7, Math.cos(0.83)), Math.cos(7 * 0.83), 1e-13));
const c = S.chebCoeffs((x) => 1 / (2 - x), 12), rho = 2 + Math.sqrt(3);
check('Chebyshev coefficients of 1/(2 − x) = (2/√3)ρ⁻ⁿ', [1, 4, 9, 12].every((n) => close(c[n], (2 / Math.sqrt(3)) * rho ** -n, 1e-12)));
check('a₀/2 of 1/(2 − x) = 1/√3', close(c[0], 1 / Math.sqrt(3), 1e-12));
check('Bernstein ρ for a pole at x = 2', close(S.bernsteinRho(2, 0), rho, 1e-13));
check('Bernstein ρ for poles at ±0.5i', close(S.bernsteinRho(0, 0.5), 0.5 + Math.sqrt(1.25), 1e-13));
check('Bernstein ρ for a pole at x = −1.5', close(S.bernsteinRho(-1.5, 0), 1.5 + Math.sqrt(1.25), 1e-13));
// annular roots: brentq on scipy's cross-products
const ANN = [[0, 0.5, 'D', [6.246061839191385, 12.54687142798436, 18.83641508450315]], [1, 0.3, 'D', [4.705775538709763, 9.104234860704777, 13.55316738484169]],
  [0, 0.2, 'D', [3.8159563304570785, 7.785531703235998, 11.732103553169685]], [1, 0.5, 'N', [1.354672010273168, 6.5649423823227595, 12.706422337097447]], [2, 0.4, 'N', [2.842400720610953, 6.41599876310978, 11.055958731190021]]];
for (const [m, q, kind, ks] of ANN) check(`annulus ${kind} m = ${m}, q = ${q}`, S.annulusRoots(m, q, 3, kind).every((k, i) => close(k, ks[i], 1e-11)), String(S.annulusRoots(m, q, 3, kind)));
check('annulus shape vanishes on both rims', [0.3, 1].every((r) => Math.abs(S.annulusShape(1, 0.3, S.annulusRoots(1, 0.3, 1)[0], r)) < 1e-11));
// ζ and γ
check('ζ(3)', close(S.zeta(3), 1.2020569031595942, 1e-14));
check('ζ(4) = π⁴/90', close(S.zeta(4), PI ** 4 / 90, 1e-14));
check('Euler–Mascheroni γ', close(S.EULER_GAMMA, 0.5772156649015329, 1e-12));
check('Γ(½) = √π', close(S.gammaFn(0.5), Math.sqrt(PI), 1e-14));

// the simulations' parameter checks
check('fa2-sphere defaults validate', vSphere(dSphere).length === 0, vSphere(dSphere).join('; '));
check('fa2-sphere rejects |m| > l', vSphere({ ...dSphere, l: 2, m: 3 }).length > 0);
check('fa2-bessel defaults validate', vBessel(dBessel).length === 0, vBessel(dBessel).join('; '));
check('fa2-bessel rejects a bad mode', vBessel({ ...dBessel, mode: 'drum' }).length > 0);
check('fa2-bessel rejects q outside (0, 1)', vBessel({ ...dBessel, mode: 'annulus', q: 1.2 }).length > 0);

console.log(`fa2-special: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
