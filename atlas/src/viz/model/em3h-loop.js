// B–H hysteresis loops of real magnetic materials, as a smooth model fitted
// to each material's saturation polarization J_s = μ₀M_s, remanence and
// coercivity. The falling branch (coming down from positive saturation) is
//   J↓(H) = J_s · S((H + H_cJ)/w),   S(u) = u / (1 + |u|ⁿ)^{1/n},
// a step whose squareness grows with n; the rising branch is its mirror,
// J↑(H) = −J↓(−H); and B = μ₀H + J. The model draws the major loop only (no
// minor loops or recoil lines) and approaches saturation faster than real
// iron does; the material numbers are typical, not a datasheet. From it:
// the remanence B_r, the coercivities H_cJ (J = 0) and H_cB (B = 0), the
// loop area (energy lost per cycle per unit volume), and a permanent
// magnet's operating point on the load line B = −μ₀ (1 − N)/N · H of an
// ellipsoid with demagnetizing factor N. DOM-free; tested in
// test/em3h-loop.test.mjs.

export const MU0 = 1.25663706127e-6;   // N/A², CODATA 2022

/**
 * Materials (SI: J_s in T, H in A/m). Typical values; real ones vary with grade,
 * purity, heat treatment and temperature.
 *   soft iron: J_s = 2.15 T (Coey 2010); H_c ≈ 80 A/m and B_r ≈ 1.2 T for annealed
 *              commercial iron (they vary several-fold with purity and annealing)
 *   Alnico 5:  B_r ≈ 1.28 T, H_c ≈ 51 kA/m (640 Oe), (BH)max ≈ 44 kJ/m³ (MMPA 0100-00)
 *   NdFeB N42: B_r ≈ 1.31 T, H_cJ ≈ 1000 kA/m (grade minimum 955), (BH)max ≈ 320 kJ/m³
 */
export const MATERIALS = {
  iron: { name: 'soft iron', Js: 2.15, Hc: 80, w: 120, n: 2, scale: 1, unit: 'A/m', Hmax: 1000 },
  alnico: { name: 'Alnico 5', Js: 1.28, Hc: 52e3, w: 15e3, n: 6, scale: 1e3, unit: 'kA/m', Hmax: 150e3 },
  ndfeb: { name: 'NdFeB (N42)', Js: 1.31, Hc: 1000e3, w: 150e3, n: 4, scale: 1e3, unit: 'kA/m', Hmax: 2400e3 },
};

const S = (u, n) => u / (1 + Math.abs(u) ** n) ** (1 / n);

/** Polarization μ₀M (T) on the falling (down) or rising (up) branch at H (A/m). */
export function J(m, H, branch = 'down') {
  return branch === 'down' ? m.Js * S((H + m.Hc) / m.w, m.n) : -m.Js * S((-H + m.Hc) / m.w, m.n);
}

/** B (T) on a branch at H (A/m). */
export const B = (m, H, branch = 'down') => MU0 * H + J(m, H, branch);

/** The remanence B_r (T): B at H = 0 on the falling branch. */
export const remanence = (m) => B(m, 0, 'down');

/** Solve f(H) = 0 for H in [a, b] by bisection (f changes sign). */
function bisect(f, a, b) {
  let fa = f(a);
  for (let i = 0; i < 200; i++) {
    const c = (a + b) / 2, fc = f(c);
    if ((fc < 0) === (fa < 0)) { a = c; fa = fc; } else b = c;
  }
  return (a + b) / 2;
}

/** The coercivity H_cB (A/m, positive): where B = 0 on the falling branch. */
export const coerciveB = (m) => -bisect((H) => B(m, H, 'down'), -m.Hmax, 0);
/** The intrinsic coercivity H_cJ (A/m, positive): where J = 0 on the falling branch (= Hc by construction). */
export const coerciveJ = (m) => -bisect((H) => J(m, H, 'down'), -m.Hmax, 0);

/** The operating point of an ellipsoid with demagnetizing factor N (0 < N < 1), magnetized to remanence: { H, B, J, BH }. */
export function operating(m, N) {
  const pc = (1 - N) / N;                                         // permeance coefficient −B/μ₀H
  const H = bisect((h) => B(m, h, 'down') + MU0 * pc * h, -m.Hmax, 0);
  const b = B(m, H, 'down');
  return { H, B: b, J: J(m, H, 'down'), BH: -H * b, pc };
}

/** The largest energy product (BH)max (J/m³) on the falling branch's second quadrant, and where. */
export function bhMax(m, steps = 4000) {
  const hc = coerciveB(m);
  let best = { BH: 0, H: 0, B: 0 };
  for (let i = 1; i < steps; i++) {
    const H = (-hc * i) / steps, b = B(m, H, 'down');
    if (-H * b > best.BH) best = { BH: -H * b, H, B: b };
  }
  return best;
}

/** The loop's area ∮H dB = ∫(J↓ − J↑) dH over ±Hmax (J/m³), the path closed at ±Hmax: the energy dissipated per cycle per unit volume. */
export function loss(m, steps = 20000) {
  let s = 0;
  const h = (2 * m.Hmax) / steps;
  for (let i = 0; i < steps; i++) { const H = -m.Hmax + (i + 0.5) * h; s += (J(m, H, 'down') - J(m, H, 'up')) * h; }
  return s;
}

/** The demagnetizing factor along the long axis of a prolate spheroid of aspect ratio k = length/diameter (> 1), or a sphere (k = 1). */
export function spheroidN(k) {
  if (Math.abs(k - 1) < 1e-9) return 1 / 3;
  if (k > 1) { const e = Math.sqrt(k * k - 1); return (1 / (k * k - 1)) * ((k / e) * Math.log(k + e) - 1); }
  // oblate (k < 1): along the short axis
  const e = Math.sqrt(1 - k * k);
  return (1 / (1 - k * k)) * (1 - (k / e) * Math.acos(k));
}
