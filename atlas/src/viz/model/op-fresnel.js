// Reflection and transmission of a plane wave at flat boundaries, for the
// op-fresnel simulation (PHYS 4650 O3.3–O3.4). DOM-free; tested headlessly in
// test/op-fresnel.test.mjs.
//
// Conventions. Time dependence e^{−iωt}. Medium 1 fills y > 0 and the light
// arrives from it, travelling toward −y at angle θ from the normal. The
// amplitude coefficients follow Hecht (Optics, 5th ed., §4.6): for s light
// (E perpendicular to the plane of incidence)
//   r_s = (n₁cosθ₁ − n₂cosθ₂)/(n₁cosθ₁ + n₂cosθ₂),  t_s = 2n₁cosθ₁/(n₁cosθ₁ + n₂cosθ₂),
// and for p light (E in the plane of incidence)
//   r_p = (n₂cosθ₁ − n₁cosθ₂)/(n₁cosθ₂ + n₂cosθ₁),  t_p = 2n₁cosθ₁/(n₁cosθ₂ + n₂cosθ₁).
// (In this convention r_s and r_p have opposite signs at normal incidence; that
// is a choice of which way the p arrows point, not physics. Griffiths's
// E-field convention flips the sign of r_p.) Beyond the critical angle cosθ₂
// is imaginary, i·√(n₁²sin²θ/n₂² − 1), chosen so the field decays into medium 2;
// then |r| = 1 and r carries a phase.
//
// A gap: a layer of index n₂ and thickness d between medium 1 and a third
// medium n₃ (frustrated total internal reflection when n₃ > n₁ sinθ > n₂). The
// layer is solved exactly with complex wavenumbers; the field is the s-light
// E (out of the page) or, for p light, the magnetic field H (out of the page).

export const DEG = Math.PI / 180;

// ─── complex numbers as [re, im] ───────────────────────────────────────────
export const cx = (re, im = 0) => [re, im];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const scl = (a, s) => [a[0] * s, a[1] * s];
export const div = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
export const abs = (a) => Math.hypot(a[0], a[1]);
export const arg = (a) => Math.atan2(a[1], a[0]);
export const exp = (a) => { const m = Math.exp(a[0]); return [m * Math.cos(a[1]), m * Math.sin(a[1])]; };
const ccos = (a) => [Math.cos(a[0]) * Math.cosh(a[1]), -Math.sin(a[0]) * Math.sinh(a[1])];
const csin = (a) => [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])];
const I = [0, 1];

/** √(x) for a real x, as a complex number on the decaying branch: i√(−x) when x < 0. */
const root = (x) => (x >= 0 ? [Math.sqrt(x), 0] : [0, Math.sqrt(-x)]);

/** The critical angle (rad) from n₁ into n₂, or NaN when n₁ ≤ n₂. */
export const critical = (n1, n2) => (n1 > n2 ? Math.asin(n2 / n1) : NaN);
/** Brewster's angle (rad): r_p = 0, tan θ_B = n₂/n₁. */
export const brewster = (n1, n2) => Math.atan(n2 / n1);

/**
 * Fresnel coefficients at one interface, incidence angle th (rad) in medium n1.
 * Complex amplitudes rs, rp, ts, tp; power fractions Rs, Rp, Ts, Tp (and their
 * averages R, T for unpolarized light); the phases (rad) of rs and rp; tir.
 */
export function coefficients(n1, n2, th) {
  const c1 = Math.cos(th), s = (n1 * Math.sin(th)) / n2;
  const c2 = root(1 - s * s);                       // cos θ₂, complex beyond θ_c
  const n1c1 = [n1 * c1, 0], n2c2 = scl(c2, n2), n2c1 = [n2 * c1, 0], n1c2 = scl(c2, n1);
  const rs = div(sub(n1c1, n2c2), add(n1c1, n2c2));
  const rp = div(sub(n2c1, n1c2), add(n1c2, n2c1));
  const ts = div([2 * n1 * c1, 0], add(n1c1, n2c2));
  const tp = div([2 * n1 * c1, 0], add(n1c2, n2c1));
  const k = n2c2[0] / (n1 * c1);                    // the power factor n₂cosθ₂/n₁cosθ₁ (zero when θ₂ is complex)
  const Rs = abs(rs) ** 2, Rp = abs(rp) ** 2;
  const Ts = c1 > 1e-12 ? k * abs(ts) ** 2 : 0, Tp = c1 > 1e-12 ? k * abs(tp) ** 2 : 0;
  return {
    rs, rp, ts, tp, Rs, Rp, Ts, Tp, R: (Rs + Rp) / 2, T: (Ts + Tp) / 2,
    phis: arg(rs), phip: arg(rp), tir: s > 1, cos2: c2,
  };
}

/** Real reflection amplitudes below the critical angle (Hecht's signs), for plotting. */
export function realAmplitudes(n1, n2, th) {
  const f = coefficients(n1, n2, th);
  return { rs: f.rs[0], rp: f.rp[0], ts: f.ts[0], tp: f.tp[0] };
}

/** Normal-incidence reflectance ((n₁ − n₂)/(n₁ + n₂))²; n₂ may be complex [n, κ] (a metal). */
export function normalR(n1, n2) {
  const N2 = Array.isArray(n2) ? n2 : [n2, 0];
  return abs(div(sub([n1, 0], N2), add([n1, 0], N2))) ** 2;
}

/** Decay constant κ (1/m) of the evanescent field beyond the critical angle, for vacuum wavelength lambda (m); 0 below it. */
export function kappa(n1, n2, th, lambda) {
  const q = (n1 * Math.sin(th)) ** 2 - n2 * n2;
  return q > 0 ? ((2 * Math.PI) / lambda) * Math.sqrt(q) : 0;
}

/** Penetration depth δ = 1/κ (m): the field falls by e over δ, the irradiance over δ/2. Infinity below θ_c. */
export const penetration = (n1, n2, th, lambda) => { const k = kappa(n1, n2, th, lambda); return k > 0 ? 1 / k : Infinity; };

/**
 * A layer of index n2 and thickness d (m) between medium n1 (where the light
 * arrives) and medium n3: the exact r and t of the scalar field (E for 's', H
 * for 'p'), the power fractions R and T, and a field function. With d = 0 it
 * is a single n1 | n3 interface. lambda is the vacuum wavelength (m).
 */
export function layer({ n1, n2, n3, th, d, lambda, pol = 's' }) {
  const k0 = (2 * Math.PI) / lambda, kx = k0 * n1 * Math.sin(th);
  const q = (n) => scl(root((k0 * n) ** 2 - kx * kx), 1);        // the normal wavenumber, decaying branch
  const w = (n) => (pol === 'p' ? n * n : 1);
  const q1 = q(n1), q2 = q(n2), q3 = q(n3);
  const p1 = scl(q1, 1 / w(n1)), p2 = scl(q2, 1 / w(n2)), p3 = scl(q3, 1 / w(n3));
  // through the layer: ψ(0) = t·α, (1/w)ψ′(0) = t·β, with S = sin(q₂d)/q₂ (→ d as q₂ → 0)
  const u = scl(q2, d);
  const S = abs(q2) * d < 1e-9 ? [d, 0] : div(csin(u), q2);
  const cu = ccos(u);
  const alpha = sub(cu, mul(I, scl(mul(p3, S), w(n2))));
  const beta = scl(add(scl(mul(mul(q2, q2), S), 1 / w(n2)), mul(I, mul(p3, cu))), -1);
  const t = div(scl(mul(I, p1), -2), sub(beta, mul(I, mul(p1, alpha))));
  const r = sub(mul(t, alpha), [1, 0]);
  const R = abs(r) ** 2, T = p1[0] > 0 ? (p3[0] / p1[0]) * abs(t) ** 2 : 0;
  /** The complex field at (x, y), in units of the incident amplitude (x, y in m). */
  function field(x, y) {
    const ex = exp([0, kx * x]);
    let v;
    if (y >= 0) v = add(exp(mul([0, -1], scl(q1, y))), mul(r, exp(mul(I, scl(q1, y)))));
    else if (y >= -d) {
      const z = y + d, uz = scl(q2, z);
      const Sz = abs(q2) * z < 1e-9 ? [z, 0] : div(csin(uz), q2);
      v = mul(t, sub(ccos(uz), mul(I, scl(mul(p3, Sz), w(n2)))));
    } else v = mul(t, exp(mul([0, -1], scl(q3, y + d))));
    return mul(v, ex);
  }
  return { r, t, R, T, q1, q2, q3, kx, field };
}

/** Frustrated-TIR transmission for s light through a gap (closed form, as for a quantum barrier): 1/T = 1 + ((q₁² + κ²)²/(4q₁²κ²)) sinh²(κd). */
export function ftirS(n1, n2, th, d, lambda) {
  const k0 = (2 * Math.PI) / lambda, q1 = k0 * n1 * Math.cos(th), K = kappa(n1, n2, th, lambda);
  if (!(K > 0)) return NaN;
  return 1 / (1 + (((q1 * q1 + K * K) ** 2) / (4 * q1 * q1 * K * K)) * Math.sinh(K * d) ** 2);
}
