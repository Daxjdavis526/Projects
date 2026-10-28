// Nuclei, DOM-free (tested in test/qm-nuclear.test.mjs): binding energies
// from measured atomic masses, the semi-empirical (liquid-drop) mass
// formula, nuclear radii, Q-values, and the law of radioactive decay with
// the half-lives of common isotopes and the power of a radioisotope heat
// source. Used by the qm-binding and qm-decay simulations and the PHYS 2220
// lessons on nuclear structure and radioactivity.

export const U_MEV = 931.49410372;            // MeV per atomic mass unit (CODATA 2022)
export const U_KG = 1.66053906892e-27;        // kg (CODATA 2022)
export const M_H = 1.00782503223;             // u, the hydrogen-1 atom (AME2020)
export const M_N = 1.00866491606;             // u, the neutron (CODATA 2022)
export const NA = 6.02214076e23;              // mol⁻¹, exact
export const QE = 1.602176634e-19;            // J per eV, exact
export const YEAR = 365.25 * 86400;           // s, Julian year
export const LN2 = Math.LN2;

/**
 * Atomic masses (u) from the 2020 Atomic Mass Evaluation (Wang et al., Chinese
 * Physics C 45, 030003), to the digits needed here. Atomic, not nuclear,
 * masses: the electrons’ masses cancel against those in Z hydrogen atoms.
 */
export const NUCLIDES = [
  ['H-2', 1, 1, 2.01410177812], ['H-3', 1, 2, 3.01604928132], ['He-3', 2, 1, 3.01602932197], ['He-4', 2, 2, 4.00260325413],
  ['Li-6', 3, 3, 6.0151228874], ['Li-7', 3, 4, 7.0160034366], ['Be-9', 4, 5, 9.012183065], ['B-10', 5, 5, 10.01293695],
  ['B-11', 5, 6, 11.00930536], ['C-12', 6, 6, 12], ['C-13', 6, 7, 13.00335483507], ['C-14', 6, 8, 14.0032419884],
  ['N-14', 7, 7, 14.00307400443], ['O-16', 8, 8, 15.99491461957], ['F-19', 9, 10, 18.99840316273], ['Ne-20', 10, 10, 19.9924401762],
  ['Na-23', 11, 12, 22.989769282], ['Mg-24', 12, 12, 23.985041697], ['Al-27', 13, 14, 26.98153853], ['Si-28', 14, 14, 27.97692653465],
  ['S-32', 16, 16, 31.9720711744], ['K-40', 19, 21, 39.963998166], ['Ca-40', 20, 20, 39.962590863], ['Ar-40', 18, 22, 39.9623831237],
  ['Ti-48', 22, 26, 47.94794198], ['Cr-52', 24, 28, 51.94050623], ['Fe-56', 26, 30, 55.93493633], ['Ni-58', 28, 30, 57.93534241],
  ['Fe-58', 26, 32, 57.93327443], ['Co-59', 27, 32, 58.93319429], ['Co-60', 27, 33, 59.9338163], ['Ni-62', 28, 34, 61.92834537],
  ['Cu-63', 29, 34, 62.92959772], ['Zn-64', 30, 34, 63.92914201], ['Kr-84', 36, 48, 83.9114977282], ['Sr-88', 38, 50, 87.9056125],
  ['Zr-90', 40, 50, 89.9046977], ['Mo-98', 42, 56, 97.90540482], ['Ag-107', 47, 60, 106.9050916], ['Sn-120', 50, 70, 119.902201873],
  ['I-127', 53, 74, 126.9044719], ['I-131', 53, 78, 130.9061263], ['Xe-132', 54, 78, 131.9041550856], ['Cs-137', 55, 82, 136.9070895],
  ['Ba-138', 56, 82, 137.905247], ['Nd-142', 60, 82, 141.907729], ['Gd-158', 64, 94, 157.9241123], ['Er-166', 68, 98, 165.9302995],
  ['W-184', 74, 110, 183.95093092], ['Pt-195', 78, 117, 194.9647917], ['Au-197', 79, 118, 196.96656879], ['Hg-202', 80, 122, 201.9706434],
  ['Pb-208', 82, 126, 207.9766525], ['Bi-209', 83, 126, 208.9803991], ['Rn-222', 86, 136, 222.0175782], ['Ra-226', 88, 138, 226.0254103],
  ['Th-232', 90, 142, 232.0380558], ['U-234', 92, 142, 234.0409523], ['U-235', 92, 143, 235.0439301], ['Pu-238', 94, 144, 238.0495601],
  ['U-238', 92, 146, 238.0507884], ['Pu-239', 94, 145, 239.0521636],
].map(([name, Z, N, M]) => ({ name, Z, N, A: Z + N, M }));
export const byName = Object.fromEntries(NUCLIDES.map((n) => [n.name, n]));

/** Mass defect (u) and binding energy (MeV) of a nuclide from its atomic mass. */
export const massDefect = ({ Z, N, M }) => Z * M_H + N * M_N - M;
export const binding = (nuc) => massDefect(nuc) * U_MEV;
export const bindingPerNucleon = (nuc) => binding(nuc) / nuc.A;

/** Nuclear radius R = R₀A^(1/3), R₀ ≈ 1.2 fm (a fit to electron-scattering data; real nuclei have a fuzzy edge). */
export const R0_FM = 1.2;
export const radiusFm = (A) => R0_FM * Math.cbrt(A);

/**
 * The semi-empirical mass formula (liquid drop), MeV, with the coefficients
 * of Rohlf (1994): volume, surface, Coulomb, asymmetry and pairing terms.
 */
export const SEMF = { aV: 15.75, aS: 17.8, aC: 0.711, aA: 23.7, aP: 11.18 };
export function semf(Z, A, { pairing = true } = {}) {
  const N = A - Z, { aV, aS, aC, aA, aP } = SEMF;
  const vol = aV * A, surf = aS * A ** (2 / 3), coul = (aC * Z * (Z - 1)) / Math.cbrt(A), asym = (aA * (A - 2 * Z) ** 2) / A;
  let pair = 0;
  if (pairing) pair = Z % 2 === 0 && N % 2 === 0 ? aP / Math.sqrt(A) : Z % 2 === 1 && N % 2 === 1 ? -aP / Math.sqrt(A) : 0;
  return { B: vol - surf - coul - asym + pair, vol, surf, coul, asym, pair };
}
/** The liquid-drop B/A along the valley of stability: the best Z for each A (pairing left out, for a smooth curve). */
export function semfCurve(A) {
  let best = -Infinity;
  for (let Z = 1; Z <= A; Z++) best = Math.max(best, semf(Z, A, { pairing: false }).B);
  return best / A;
}

/** Energy released (MeV) when atomic masses `before` become `after` (lists of masses in u). */
export const qValue = (before, after) => (before.reduce((s, m) => s + m, 0) - after.reduce((s, m) => s + m, 0)) * U_MEV;

// ---- radioactive decay
/** Half-lives, decay modes and energies of some common radioisotopes (NUBASE2020; carbon-14 at its conventional 5730 years). */
export const ISOTOPES = {
  c14: { label: 'carbon-14', T: 5730, unit: 'yr', mode: 'β⁻', use: 'radiocarbon dating' },
  pu238: { label: 'plutonium-238', T: 87.7, unit: 'yr', mode: 'α', Q: 5.593, M: 238.0495601, use: 'heat for spacecraft power' },
  i131: { label: 'iodine-131', T: 8.02, unit: 'd', mode: 'β⁻', use: 'thyroid treatment' },
  tc99m: { label: 'technetium-99m', T: 6.01, unit: 'h', mode: 'γ', use: 'medical imaging' },
  rn222: { label: 'radon-222', T: 3.82, unit: 'd', mode: 'α', use: 'indoor radiation from the ground' },
  co60: { label: 'cobalt-60', T: 5.27, unit: 'yr', mode: 'β⁻ then γ', use: 'radiotherapy and sterilization' },
  cs137: { label: 'cesium-137', T: 30.08, unit: 'yr', mode: 'β⁻ then γ', use: 'fallout; gauges' },
  am241: { label: 'americium-241', T: 432.6, unit: 'yr', mode: 'α', use: 'smoke detectors' },
  u238: { label: 'uranium-238', T: 4.468e9, unit: 'yr', mode: 'α', use: 'dating the oldest rocks' },
};
export const UNIT_S = { s: 1, h: 3600, d: 86400, yr: YEAR };

/** N(t) = N₀ 2^(−t/T½), and the same written with the decay constant λ = ln 2 / T½. */
export const remaining = (N0, t, T) => N0 * Math.pow(2, -t / T);
export const decayConstant = (T) => LN2 / T;
export const meanLife = (T) => T / LN2;
/** Activity (decays per unit time, in the units of T) of N nuclei. */
export const activity = (N, T) => (LN2 / T) * N;
/** Age from the surviving fraction: t = T½ log₂(N₀/N). */
export const ageFromFraction = (frac, T) => T * Math.log2(1 / frac);
/** Each nucleus’s own decay time, from a uniform random u ∈ (0, 1): t = −T½ log₂ u. */
export const decayTime = (u, T) => -T * Math.log2(Math.max(u, 1e-300));

/** Thermal power per gram (W/g) of a pure α-emitter of half-life T (years), decay energy Q (MeV) and molar mass M (g/mol). */
export const specificPower = (T_years, Q_MeV, M) => (LN2 / (T_years * YEAR)) * (NA / M) * Q_MeV * 1e6 * QE;
