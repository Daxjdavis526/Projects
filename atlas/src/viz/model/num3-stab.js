// Linear stability of one-step ODE methods — the model behind the
// num3-stability simulation (Numerical Methods, st-f F9–F11). DOM-free; tested
// in test/num3-stab.test.mjs.
//
// Applied to the test equation y′ = λy with step h, every method here takes
// y₍ₙ₊₁₎ = R(z)·yₙ with z = hλ. R is the method's stability function: a
// polynomial for an explicit Runge–Kutta method, a rational function for an
// implicit one. The method is absolutely stable at z when |R(z)| ≤ 1.
//
//   euler   explicit Euler                 R = 1 + z
//   heun    any 2-stage, order-2 RK        R = 1 + z + z²/2
//   rk3     any 3-stage, order-3 RK        R = 1 + z + z²/2 + z³/6
//   rk4     any 4-stage, order-4 RK        R = 1 + z + … + z⁴/24
//   dp5     Dormand–Prince 5(4), the 5th-order solution:  1 + z + … + z⁵/120 + z⁶/600
//   beuler  implicit (backward) Euler      R = 1/(1 − z)
//   trap    trapezoidal rule (Crank–Nicolson)   R = (1 + z/2)/(1 − z/2)
//
// The method of lines for the heat equation u_t = D u_xx on N interior points
// with u = 0 at both ends: the semi-discrete system has eigenvalues
// λₖ = −(4D/Δx²) sin²(kπ/(2(N + 1))), k = 1 … N, so with Δt the scaled values
// are zₖ = −4r sin²(kπ/(2(N + 1))), r = DΔt/Δx².

export const METHODS = ['euler', 'heun', 'rk3', 'rk4', 'dp5', 'beuler', 'trap'];
export const NAME = { euler: 'Euler', heun: 'RK2 (Heun)', rk3: 'RK3', rk4: 'RK4', dp5: 'Dormand–Prince 5', beuler: 'backward Euler', trap: 'trapezoid (CN)' };
export const ORDER = { euler: 1, heun: 2, rk3: 3, rk4: 4, dp5: 5, beuler: 1, trap: 2 };
export const IMPLICIT = { beuler: true, trap: true };

// complex numbers as [re, im]
export const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
export const cabs = (a) => Math.hypot(a[0], a[1]);

const POLY = {
  euler: [1, 1],
  heun: [1, 1, 1 / 2],
  rk3: [1, 1, 1 / 2, 1 / 6],
  rk4: [1, 1, 1 / 2, 1 / 6, 1 / 24],
  dp5: [1, 1, 1 / 2, 1 / 6, 1 / 24, 1 / 120, 1 / 600],
};
/** The polynomial's coefficients (explicit methods), lowest power first. */
export const coeffs = (m) => POLY[m] && [...POLY[m]];

function horner(c, z) {
  let s = [c[c.length - 1], 0];
  for (let k = c.length - 2; k >= 0; k--) s = cadd(cmul(s, z), [c[k], 0]);
  return s;
}

/** R(z) for method m at complex z = [re, im]. */
export function R(m, z) {
  if (POLY[m]) return horner(POLY[m], z);
  if (m === 'beuler') return cdiv([1, 0], [1 - z[0], -z[1]]);
  if (m === 'trap') return cdiv([1 + z[0] / 2, z[1] / 2], [1 - z[0] / 2, -z[1] / 2]);
  throw new Error(`num3-stab: unknown method ${m}`);
}
export const absR = (m, z) => cabs(R(m, z));

/** Largest s with |R(−x)| ≤ 1 for every x in [0, s] (Infinity for an A-stable method). */
export function realLimit(m) {
  if (IMPLICIT[m]) return Infinity;
  return firstExit((s) => absR(m, [-s, 0]));
}
/** Largest s with |R(iy)| ≤ 1 for every y in [0, s]; 0 if the method is unstable just off 0 on the imaginary axis. */
export function imagLimit(m) {
  if (IMPLICIT[m]) return Infinity;
  return firstExit((s) => absR(m, [0, s]));
}
function firstExit(g) {
  // march out from 0 until |R| exceeds 1 (by more than round-off), then bisect
  const tol = 1e-14, dx = 1e-3;
  let a = 0, b = dx;
  while (b < 50 && g(b) <= 1 + tol) { a = b; b += dx; }
  if (b >= 50) return Infinity;
  if (a === 0 && g(b) > 1 + tol) {
    // unstable immediately (|R(iy)|² = 1 + O(y⁴) for Euler and RK2): report 0
    return 0;
  }
  for (let i = 0; i < 60; i++) { const c = (a + b) / 2; if (g(c) <= 1 + tol) a = c; else b = c; }
  const s = (a + b) / 2;
  return s < 0.01 ? 0 : s;
}

/** Scaled eigenvalues z = Δt·λ of the semi-discrete heat equation (N interior points, Dirichlet ends) at mesh ratio r. */
export function heatZ(N, r) {
  return Array.from({ length: N }, (_, i) => [-4 * r * Math.sin(((i + 1) * Math.PI) / (2 * (N + 1))) ** 2, 0]);
}

/** The amplification of n steps, |R(z)|ⁿ, and the exact decay |e^(nz)|, as log₁₀ (so huge values stay finite). */
export function logGrowth(m, z, n) {
  return { num: n * Math.log10(Math.max(1e-300, absR(m, z))), exact: (n * z[0]) / Math.LN10 };
}
