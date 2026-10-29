// Oscillating electric and magnetic dipoles, DOM-free (PHYS 4600 M5.1–M5.2).
// Used by the em4c-dipole simulation; tested in test/em4c-dipole.test.mjs.
//
// Units: k = ω/c = 1, c = 1, ω = 1 and p₀/4πε₀ = 1 (so lengths are in units of
// 1/k = λ/2π). A point (Hertzian) dipole p(t) = p₀ cos ωt along z. Its exact
// fields at (r, θ), evaluated at the retarded time, are
//   E_r = 2 cos θ (p/r³ + ṗ/r²),  E_θ = sin θ (p/r³ + ṗ/r² + p̈/r),
//   B_φ = sin θ (ṗ/r² + p̈/r)            (B in units of E/c)
// with p, ṗ, p̈ taken at u = ωt − kr. In a meridian plane the electric field
// lines are the level curves of the flux function
//   Ψ = sin²θ (cos u / kr − sin u)  =  sin²θ [cos(kr − ωt)/kr + sin(kr − ωt)],
// because E_r = ∂_θΨ/(r² sin θ) and E_θ = −∂_rΨ/(r sin θ). For a magnetic
// dipole m(t) = m₀ cos ωt the same curves are the magnetic field lines (the
// fields are dual: E → cB, cB → −E, p → m/c), and E circles the axis.

const PI = Math.PI;

/** The exact fields of the unit electric dipole at (r, θ) (r in units of 1/k), phase ph = ωt (rad). */
export function fields(r, th, ph) {
  const u = ph - r, p = Math.cos(u), pd = -Math.sin(u), pdd = -Math.cos(u);
  const s = Math.sin(th), c = Math.cos(th);
  return {
    Er: 2 * c * (p / r ** 3 + pd / r ** 2),
    Eth: s * (p / r ** 3 + pd / r ** 2 + pdd / r),
    Bphi: s * (pd / r ** 2 + pdd / r),
  };
}

/** The flux function Ψ at (r, θ) (r in units of 1/k), phase ph = ωt (rad): its level curves are the field lines. */
export function psi(r, th, ph) {
  const u = ph - r, s = Math.sin(th);
  return s * s * (Math.cos(u) / r - Math.sin(u));
}

/** Ψ at a point (x, z) of the meridian plane given in wavelengths, phase ph in rad. */
export function psiXZ(x, z, ph) {
  const r = Math.hypot(x, z), kr = 2 * PI * r;
  const s2 = r > 0 ? (x * x) / (r * r) : 0;
  const u = ph - kr;
  return s2 * (Math.cos(u) / kr - Math.sin(u));
}

/** Normalized radiation patterns (largest value 1): 'short' (a point dipole, sin²θ) or 'half' (a half-wave antenna). */
export function pattern(kind, th) {
  const s = Math.sin(th);
  if (kind === 'half') {
    if (Math.abs(s) < 1e-9) return 0;
    const v = Math.cos((PI / 2) * Math.cos(th)) / s;
    return v * v;
  }
  return s * s;
}

/** ∫₀^π f(θ) dθ by composite Simpson's rule with n (even) panels. */
export function simpson(f, a, b, n = 2000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h);
  return (s * h) / 3;
}

/** ∫₀^π cos²(π/2 cos θ)/sin θ dθ ≈ 1.21883 — the half-wave antenna's pattern integral. */
export function halfWaveIntegral() {
  const f = (th) => { const s = Math.sin(th); return s < 1e-12 ? 0 : Math.cos((PI / 2) * Math.cos(th)) ** 2 / s; };
  return simpson(f, 0, PI, 4000);
}

/**
 * Radiation resistance (Ω) given the impedance of free space Z0 (Ω):
 * 'half' — a half-wave antenna, (Z₀/2π)∫cos²(π/2 cos θ)/sin θ dθ ≈ 73 Ω;
 * 'short' — a short antenna of length d carrying the same current I₀ along
 * all of it (Griffiths's model), (2π/3)Z₀(d/λ)² ≈ 789 (d/λ)² Ω.
 */
export function radResistance(kind, Z0, dOverLambda = 0) {
  if (kind === 'half') return (Z0 / (2 * PI)) * halfWaveIntegral();
  return ((2 * PI) / 3) * Z0 * dOverLambda ** 2;
}

/** The fraction of a pattern's power inside the cone |θ − 90°| < half (rad) about the equator. */
export function beltFraction(kind, half) {
  const w = (th) => pattern(kind, th) * Math.sin(th);
  return simpson(w, PI / 2 - half, PI / 2 + half, 2000) / simpson(w, 0, PI, 4000);
}
