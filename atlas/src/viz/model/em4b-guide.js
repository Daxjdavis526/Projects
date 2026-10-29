// TE modes of a hollow rectangular waveguide with perfectly conducting walls,
// DOM-free (tested in test/em4b-guide.test.mjs; drawn by sims/em4b-guide.js).
// SI units. The guide runs along z with inner width a (along x) and height b
// (along y), a ≥ b by convention. Following Griffiths §9.5.2:
//
//   B_z = B₀ cos(mπx/a) cos(nπy/b) e^{i(kz − ωt)},   E_z = 0,
//   k² = (ω/c)² − K²,  K² = (mπ/a)² + (nπ/b)²,
//   cutoff  ω_mn = cK,  f_mn = (c/2)√((m/a)² + (n/b)²),
//
// and the transverse fields follow from B_z (Griffiths eq. 9.180 with
// E_z = 0). Above cutoff k is real: the mode propagates with phase velocity
// v_p = c/√(1 − (f_mn/f)²) > c and group velocity v_g = c√(1 − (f_mn/f)²) < c,
// v_p v_g = c². Below it k = iκ: the fields die away as e^{−κz} without
// travelling. Every field returned is the real part of the complex field, with
// B₀ = 1 T, so E comes out in V/m per tesla of B_z.

export const C = 299792458;   // m/s, exact

/** WR-90 (X band): inner dimensions 0.900 in × 0.400 in, recommended band 8.2–12.4 GHz (EIA RS-261-B). */
export const WR90 = { name: 'WR-90', a: 0.9 * 0.0254, b: 0.4 * 0.0254, band: [8.2e9, 12.4e9] };

/** Cutoff frequency (Hz) of the TE_mn (or TM_mn) mode of an a × b guide (m). */
export const cutoff = (a, b, m, n) => (C / 2) * Math.sqrt((m / a) ** 2 + (n / b) ** 2);

/**
 * Propagation of the TE_mn mode at frequency f: { fc, above, k, kappa, lam0,
 * lamg, vp, vg, decay }. Above cutoff: k (rad/m), guide wavelength lamg = 2π/k,
 * vp, vg (m/s). Below: kappa (1/m) and decay = 1/κ (m), the e-folding length of
 * the fields.
 */
export function guide(a, b, m, n, f) {
  const fc = cutoff(a, b, m, n), lam0 = C / f;
  if (f > fc) {
    const s = Math.sqrt(1 - (fc / f) ** 2), k = ((2 * Math.PI) / C) * Math.sqrt(f * f - fc * fc);
    return { fc, above: true, k, kappa: 0, lam0, lamg: (2 * Math.PI) / k, vp: C / s, vg: C * s, decay: Infinity };
  }
  const kappa = ((2 * Math.PI) / C) * Math.sqrt(fc * fc - f * f);
  return { fc, above: false, k: 0, kappa, lam0, lamg: Infinity, vp: NaN, vg: 0, decay: 1 / kappa };
}

// complex numbers as [re, im]
const mul = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
const sc = (s, p) => [s * p[0], s * p[1]];

/**
 * The real fields of the TE_mn mode (B_z amplitude 1 T) at (x, y, z) and time
 * t, frequency f: { Ex, Ey, Ez, Bx, By, Bz }. m and n are whole numbers, not
 * both zero.
 */
export function te(a, b, m, n, f, x, y, z, t) {
  const w = 2 * Math.PI * f, g = guide(a, b, m, n, f);
  const K2 = (m * Math.PI / a) ** 2 + (n * Math.PI / b) ** 2;
  const kt = g.above ? [g.k, 0] : [0, g.kappa];            // k̃: k or iκ
  // e^{i(k̃z − ωt)}
  const ph = g.above ? [Math.cos(g.k * z - w * t), Math.sin(g.k * z - w * t)] : sc(Math.exp(-g.kappa * z), [Math.cos(w * t), -Math.sin(w * t)]);
  const cx = Math.cos((m * Math.PI * x) / a), sx = Math.sin((m * Math.PI * x) / a);
  const cy = Math.cos((n * Math.PI * y) / b), sy = Math.sin((n * Math.PI * y) / b);
  const i = [0, 1];
  const Bz = sc(cx * cy, ph);
  const Ex = mul(sc((w / K2) * (-n * Math.PI / b) * cx * sy, i), ph);
  const Ey = mul(sc((w / K2) * (m * Math.PI / a) * sx * cy, i), ph);
  const ik = mul(i, kt);
  const Bx = mul(sc((-m * Math.PI / a) * sx * cy / K2, ik), ph);
  const By = mul(sc((-n * Math.PI / b) * cx * sy / K2, ik), ph);
  return { Ex: Ex[0], Ey: Ey[0], Ez: 0, Bx: Bx[0], By: By[0], Bz: Bz[0] };
}

/** The modes of an a × b guide with cutoff below fmax, lowest first: [{ m, n, fc }]. */
export function modesBelow(a, b, fmax, nmax = 6) {
  const out = [];
  for (let m = 0; m <= nmax; m++) for (let n = 0; n <= nmax; n++) {
    if (!m && !n) continue;
    const fc = cutoff(a, b, m, n);
    if (fc < fmax) out.push({ m, n, fc });
  }
  return out.sort((p, q) => p.fc - q.fc);
}
