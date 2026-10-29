// Diatomic molecules’ rotation and vibration, DOM-free (tested in
// test/mp-molecule.test.mjs). Term values in cm⁻¹ from the standard
// spectroscopic constants (Huber & Herzberg, Constants of Diatomic Molecules,
// 1979, as served by the NIST Chemistry WebBook):
//   G(v)    = ωₑ(v + ½) − ωₑxₑ(v + ½)² + ωₑyₑ(v + ½)³
//   B_v     = Bₑ − αₑ(v + ½)
//   F_v(J)  = B_v J(J + 1) − D J²(J + 1)²
// Other isotopologues follow from the main one by the reduced mass alone
// (the Born–Oppenheimer approximation): with ρ = √(μ/μ′), ωₑ scales as ρ,
// ωₑxₑ and Bₑ as ρ², ωₑyₑ and αₑ as ρ³, D as ρ⁴. Line strengths: the
// Boltzmann population of the lower level times the Hönl–London factor
// (J + 1 for R(J), J for P(J), J + 1 for a pure rotational J + 1 ← J line),
// times the isotope’s natural abundance — relative heights, not absolute
// absorption. Used by the mp-molecule simulation and the PHYS 2710 lesson
// on rotational and vibrational spectra.

export const C_CM = 2.99792458e10;                  // cm/s
export const GHZ_PER_CM = 29.9792458;               // 1 cm⁻¹ in GHz
const H = 6.62607015e-34, KB = 1.380649e-23, U = 1.66053906892e-27;
export const HCK = (H * C_CM) / KB;                 // K per cm⁻¹: 1.438 776 877…

// atomic masses (AME2020), u; natural abundances (IUPAC)
export const MASS = { H: 1.00782503190, D: 2.01410177784, Cl35: 34.968852682, Cl37: 36.965902602, C12: 12, C13: 13.00335483534, O16: 15.99491461957 };
const ABUND = { H: 1, D: 1, Cl35: 0.7576, Cl37: 0.2424, C12: 0.9893, C13: 0.0107, O16: 1 };

// the reference isotopologues (Huber & Herzberg), cm⁻¹, and rₑ in pm
const REF = {
  HCl: { atoms: ['H', 'Cl35'], we: 2990.946, wexe: 52.8186, weye: 0.2243, Be: 10.59341, ae: 0.30718, D: 5.3194e-4, re: 127.455 },
  CO: { atoms: ['C12', 'O16'], we: 2169.81358, wexe: 13.28831, weye: 0, Be: 1.93128087, ae: 0.01750441, D: 6.12147e-6, re: 112.8323 },
};
export const reduced = ([a, b]) => (MASS[a] * MASS[b]) / (MASS[a] + MASS[b]);

/** The isotopologues on offer: label, the reference they scale from, their atoms. */
export const MOLECULES = {
  HCl35: { label: 'H³⁵Cl', ref: 'HCl', atoms: ['H', 'Cl35'] },
  HCl37: { label: 'H³⁷Cl', ref: 'HCl', atoms: ['H', 'Cl37'] },
  DCl35: { label: 'D³⁵Cl', ref: 'HCl', atoms: ['D', 'Cl35'] },
  DCl37: { label: 'D³⁷Cl', ref: 'HCl', atoms: ['D', 'Cl37'] },
  CO: { label: '¹²C¹⁶O', ref: 'CO', atoms: ['C12', 'O16'] },
  CO13: { label: '¹³C¹⁶O', ref: 'CO', atoms: ['C13', 'O16'] },
};

/** The constants of one isotopologue, scaled from its reference by the reduced mass. */
export function constants(key) {
  const M = MOLECULES[key], R = REF[M.ref];
  const mu = reduced(M.atoms), rho = Math.sqrt(reduced(R.atoms) / mu);
  return {
    key, label: M.label, mu, abundance: ABUND[M.atoms[0]] * ABUND[M.atoms[1]],
    we: R.we * rho, wexe: R.wexe * rho ** 2, weye: R.weye * rho ** 3, Be: R.Be * rho ** 2, ae: R.ae * rho ** 3, D: R.D * rho ** 4, re: R.re,
  };
}

export const G = (c, v) => c.we * (v + 0.5) - c.wexe * (v + 0.5) ** 2 + c.weye * (v + 0.5) ** 3;
export const Bv = (c, v) => c.Be - c.ae * (v + 0.5);
export const F = (c, v, J) => Bv(c, v) * J * (J + 1) - c.D * J * J * (J + 1) ** 2;
/** Energy of (v, J) above the lowest level (v = 0, J = 0), cm⁻¹. */
export const term = (c, v, J) => G(c, v) + F(c, v, J) - G(c, 0);
/** The band origin of the fundamental, v = 1 ← 0 (no rotation), cm⁻¹. */
export const origin = (c) => G(c, 1) - G(c, 0);

/** Fraction of molecules in (v = 0, J) at temperature T (vibrationally excited ones are ignored). */
export function population(c, J, T) {
  let z = 0;
  // (the centrifugal term −DJ²(J + 1)² would eventually turn F down: stop long before, once the terms are negligible)
  for (let j = 0; j < 400; j++) { const w = (2 * j + 1) * Math.exp((-HCK * F(c, 0, j)) / T); z += w; if (j > 5 && w < 1e-16 * z) break; }
  return ((2 * J + 1) * Math.exp((-HCK * F(c, 0, J)) / T)) / z;
}

/** The fundamental band v = 1 ← 0: lines { branch, J (lower), m, nu (cm⁻¹), I (relative, abundance included) }. */
export function band(c, T, Jmax = 12) {
  const out = [];
  for (let J = 0; J <= Jmax; J++) {
    const p = population(c, J, T) * c.abundance;
    out.push({ branch: 'R', J, m: J + 1, nu: term(c, 1, J + 1) - term(c, 0, J), I: (p * (J + 1)) / (2 * J + 1) });
    if (J >= 1) out.push({ branch: 'P', J, m: -J, nu: term(c, 1, J - 1) - term(c, 0, J), I: (p * J) / (2 * J + 1) });
  }
  return out.sort((a, b) => a.nu - b.nu);
}

/** Pure rotational lines J + 1 ← J in v = 0: { J (lower), nu (cm⁻¹), ghz, I }. */
export function rotation(c, T, Jmax = 12) {
  return Array.from({ length: Jmax + 1 }, (_, J) => {
    const nu = F(c, 0, J + 1) - F(c, 0, J);
    // absorption strength ∝ population difference × (J + 1)/(2J + 1) × ν (stimulated emission included)
    const I = c.abundance * population(c, J, T) * (1 - Math.exp((-HCK * nu) / T)) * ((J + 1) / (2 * J + 1)) * nu;
    return { J, nu, ghz: nu * GHZ_PER_CM, I };
  });
}

/** The bond length (pm) that a rotational constant B (cm⁻¹) implies for reduced mass mu (u): B = h/(8π²cI), I = μr². */
export const bondLengthPm = (B, mu) => Math.sqrt(H / (8 * Math.PI ** 2 * 299792458 * (100 * B) * mu * U)) * 1e12;
/** The force constant (N/m) of a harmonic vibration of wavenumber w (cm⁻¹) and reduced mass mu (u): k = μ(2πcν̃)². */
export const forceConstant = (w, mu) => mu * U * (2 * Math.PI * 299792458 * 100 * w) ** 2;
