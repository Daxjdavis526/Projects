// Hydrogen's wave functions ψₙₗₘ = Rₙₗ(r) Yₗₘ(θ, φ), DOM-free (tested in
// test/mp-orbitals.test.mjs). Lengths are in Bohr radii a₀ (Z = 1, infinite
// nuclear mass: the reduced-mass correction, 0.05%, is ignored); angles in
// radians, θ from +z and φ from +x (the physics convention). Spherical
// harmonics carry the Condon–Shortley phase, as SciPy's sph_harm_y does.
// Used by the mp-orbitals simulation and the PHYS 2710 hydrogen lessons.

export const RYD_EV = 13.605693122990;          // eV, the Rydberg energy (CODATA 2022)
export const A0_NM = 0.0529177210544;           // nm, the Bohr radius (CODATA 2022)

/** Eₙ = −13.6 eV/n² (no reduced-mass, fine-structure or Lamb-shift corrections). */
export const energy = (n) => -RYD_EV / (n * n);

const fact = (n) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

/** The generalised Laguerre polynomial L_k^α(x), by its three-term recurrence. */
export function laguerre(k, alpha, x) {
  let l0 = 1, l1 = 1 + alpha - x;
  if (k === 0) return l0;
  for (let j = 1; j < k; j++) { const l2 = ((2 * j + 1 + alpha - x) * l1 - (j + alpha) * l0) / (j + 1); l0 = l1; l1 = l2; }
  return l1;
}

/** Rₙₗ(r), normalised so ∫Rₙₗ² r² dr = 1 (r in a₀, R in a₀^(−3/2)). */
export function radial(n, l, r) {
  const rho = (2 * r) / n;
  const N = Math.sqrt((2 / n) ** 3 * fact(n - l - 1) / (2 * n * fact(n + l)));
  return N * Math.exp(-rho / 2) * rho ** l * laguerre(n - l - 1, 2 * l + 1, rho);
}
/** The radial probability density P(r) = r²Rₙₗ²: the chance per unit radius. */
export const radialP = (n, l, r) => r * r * radial(n, l, r) ** 2;
/** ⟨r⟩ = [3n² − l(l + 1)]/2 a₀. */
export const meanR = (n, l) => (3 * n * n - l * (l + 1)) / 2;
/** The most probable radius: the highest peak of P(r) (n² a₀ when l = n − 1). */
export function peakR(n, l) {
  let best = 0, rb = 0;
  const top = 4 * n * n + 10;
  for (let i = 1; i <= 8000; i++) { const r = (top * i) / 8000, p = radialP(n, l, r); if (p > best) { best = p; rb = r; } }
  // refine by golden-section search around the coarse peak
  let a = Math.max(1e-9, rb - top / 8000), b = rb + top / 8000;
  for (let i = 0; i < 80; i++) { const m1 = a + (b - a) * 0.382, m2 = a + (b - a) * 0.618; if (radialP(n, l, m1) < radialP(n, l, m2)) a = m1; else b = m2; }
  return (a + b) / 2;
}
/** The radius inside which a fraction q of the probability lies. */
export function enclosingR(n, l, q = 0.99) {
  const dr = 0.005 * n;
  let s = 0, r = 0;
  while (s < q && r < 400) { s += 0.5 * dr * (radialP(n, l, r) + radialP(n, l, r + dr)); r += dr; }
  return r;
}
/** The chance of finding the electron inside radius r (by Simpson's rule). */
export function probInside(n, l, R) {
  const N = 2000, h = R / N;
  let s = radialP(n, l, 0) + radialP(n, l, R);
  for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * radialP(n, l, i * h);
  return (s * h) / 3;
}

/** The associated Legendre function P_l^m(x) for m ≥ 0, with the Condon–Shortley phase (−1)^m. */
export function legendre(l, m, x) {
  let pmm = 1;
  const s = Math.sqrt(Math.max(0, 1 - x * x));
  for (let i = 1; i <= m; i++) pmm *= -(2 * i - 1) * s;
  if (l === m) return pmm;
  let p1 = x * (2 * m + 1) * pmm;
  if (l === m + 1) return p1;
  let p0 = pmm;
  for (let ll = m + 2; ll <= l; ll++) { const p2 = ((2 * ll - 1) * x * p1 - (ll + m - 1) * p0) / (ll - m); p0 = p1; p1 = p2; }
  return p1;
}
const ylmNorm = (l, m) => Math.sqrt(((2 * l + 1) / (4 * Math.PI)) * (fact(l - m) / fact(l + m)));

/** Yₗₘ(θ, φ) as { re, im } (any m from −l to l; Y_{l,−m} = (−1)^m Yₗₘ*). */
export function ylm(l, m, theta, phi) {
  const am = Math.abs(m), base = ylmNorm(l, am) * legendre(l, am, Math.cos(theta));
  const sgn = m < 0 && am % 2 ? -1 : 1;
  return { re: sgn * base * Math.cos(m * phi), im: sgn * base * Math.sin(m * phi) };
}
/** |Yₗₘ(θ)|², which does not depend on φ. */
export const ylm2 = (l, m, theta) => { const v = ylmNorm(l, Math.abs(m)) * legendre(l, Math.abs(m), Math.cos(theta)); return v * v; };

/**
 * The real orbitals chemists draw: m = 0 is Yₗ₀; m > 0 is √2 (−1)^m Re Yₗₘ
 * (∝ cos mφ); m < 0 is √2 (−1)^m Im Yₗ|ₘ| (∝ sin |m|φ). Each is a mixture of
 * the states +|m| and −|m|, so it has a definite shape but no definite Lz.
 */
export function realY(l, m, theta, phi) {
  const am = Math.abs(m), base = ylmNorm(l, am) * legendre(l, am, Math.cos(theta)) * (am % 2 ? -1 : 1);
  if (m === 0) return base;
  return Math.SQRT2 * base * (m > 0 ? Math.cos(am * phi) : Math.sin(am * phi));
}

const NAMES = {
  '0,0': 's',
  '1,0': 'pz', '1,1': 'px', '1,-1': 'py',
  '2,0': 'dz²', '2,1': 'dxz', '2,-1': 'dyz', '2,2': 'dx²−y²', '2,-2': 'dxy',
  '3,0': 'fz³', '3,1': 'fxz²', '3,-1': 'fyz²', '3,2': 'fz(x²−y²)', '3,-2': 'fxyz', '3,3': 'fx(x²−3y²)', '3,-3': 'fy(3x²−y²)',
};
/** The spectroscopic letter of l. */
export const letter = (l) => 'spdfghik'[l] ?? `l=${l}`;
/** A real orbital's name, as plain text: 2px, 3dz², … */
export const realName = (n, l, m) => `${n}${NAMES[`${l},${m}`] ?? `${letter(l)}(m = ${m})`}`;

/**
 * The vertical plane through the z-axis in which a state is drawn: φ = 0
 * (the xz-plane) except for the real orbitals with m < 0, whose lobes lie at
 * φ = π/2|m| — the yz-plane for py and dyz.
 */
export const slicePhi = (m, real) => (real && m < 0 ? Math.PI / (2 * Math.abs(m)) : 0);

/** ψ in the slice plane at horizontal coordinate u and height z (both in a₀): a real number for real orbitals, |ψ| otherwise. */
export function sliceValue(n, l, m, u, z, real) {
  const r = Math.hypot(u, z), th = Math.atan2(Math.abs(u), z), ph = slicePhi(m, real) + (u < 0 ? Math.PI : 0);
  const R = radial(n, l, r);
  if (real) return R * realY(l, m, th, ph);
  return Math.abs(R) * Math.sqrt(ylm2(l, m, th));
}

/** Allowed (n, l, m): clamps l into 0…n−1 and m into −l…l. */
export function clampQN(n, l, m) {
  const N = Math.max(1, Math.round(n)), Ll = Math.max(0, Math.min(N - 1, Math.round(l))), M = Math.max(-Ll, Math.min(Ll, Math.round(m)));
  return { n: N, l: Ll, m: M };
}
