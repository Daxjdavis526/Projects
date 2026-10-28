// Solids, DOM-free (tested in test/mp-solids.test.mjs): the Kronig–Penney
// band condition and its band edges, the free-electron (Fermi) gas,
// intrinsic and doped semiconductors, the p–n junction (built-in potential,
// depletion width, band profile), the ideal diode and the illuminated solar
// cell (open-circuit voltage, maximum power point), LED wavelengths, and the
// superconducting critical field, BCS gap and London moment. Used by the
// mp-junction simulation and the PHYS 2710 lessons on solids (MP12).
//
// Constants are CODATA 2022 (exact where the 2019 SI fixes them). Material
// data are room-temperature handbook values (Kittel; Ashcroft & Mermin; Sze &
// Ng, Physics of Semiconductor Devices) and are marked where approximate.

export const HBAR = 1.054571817e-34;          // J s
export const H = 6.62607015e-34;              // J s
export const ME = 9.1093837139e-31;           // kg
export const QE = 1.602176634e-19;            // C
export const KB_EV = 8.617333262e-5;          // eV/K
export const EPS0 = 8.8541878188e-12;         // F/m
export const HC_EVNM = 1239.841984;           // eV nm
export const MEC2_EV = 0.51099895069e6;       // eV
export const kT = (T = 300) => KB_EV * T;     // eV

// ---- the Kronig–Penney model (a row of thin, strong barriers: the delta-function limit)
// With x = αa = a√(2mE)/ħ and P = mV₀ba/ħ² the barrier strength, a Bloch
// wave cos(ka) exists only where |f(x)| ≤ 1:   cos ka = cos x + P sin x / x.
export const kpF = (x, P) => (x === 0 ? 1 + P : Math.cos(x) + (P * Math.sin(x)) / x);
export const kpAllowed = (x, P) => Math.abs(kpF(x, P)) <= 1 + 1e-12;
/** The energy unit E₁ = ħ²π²/(2ma²) = h²/(8ma²), in eV, for a lattice period a in nm: then E/E₁ = (x/π)². */
export const kpE1 = (aNm) => (HC_EVNM * HC_EVNM) / (8 * MEC2_EV * aNm * aNm);
/**
 * Band edges, in x = αa, of the lowest n bands for P ≥ 0: [[bottom, top], …].
 * Band k always ends at x = kπ (where f = (−1)ᵏ); its bottom is the root of
 * f(x) = (−1)ᵏ⁻¹ in ((k − 1)π, kπ), found by bisection.
 */
export function kpBands(P, n = 4) {
  const out = [];
  for (let k = 1; k <= n; k++) {
    const top = k * Math.PI, s = k % 2 ? 1 : -1;
    if (P <= 0) { out.push([(k - 1) * Math.PI, top]); continue; }
    let lo = (k - 1) * Math.PI + 1e-12, hi = top;
    const g = (x) => kpF(x, P) - s;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (Math.sign(g(mid)) === Math.sign(g(lo))) lo = mid; else hi = mid; }
    out.push([(lo + hi) / 2, top]);
  }
  return out;
}
/** Band k as points [ka/π, E/E₁], sampled densely at both edges (ka from 0 to 1 or back). */
export function kpBandCurve(P, k, samples = 60) {
  const [lo, hi] = kpBands(P, k)[k - 1], pts = [];
  for (let i = 0; i <= samples; i++) {
    const x = lo + ((hi - lo) * (1 - Math.cos((Math.PI * i) / samples))) / 2;
    const f = Math.max(-1, Math.min(1, kpF(x, P)));
    pts.push([Math.acos(f) / Math.PI, (x / Math.PI) ** 2]);
  }
  return pts;
}

// ---- the free-electron gas
/** Conduction-electron densities (m⁻³, one per atom for the monovalent metals; Ashcroft & Mermin) and resistivities at 20 °C (Ω m). */
export const METALS = {
  cu: { label: 'copper', n: 8.47e28, rho: 1.68e-8 },
  ag: { label: 'silver', n: 5.86e28, rho: 1.59e-8 },
  au: { label: 'gold', n: 5.90e28, rho: 2.44e-8 },
  al: { label: 'aluminium', n: 18.1e28, rho: 2.65e-8 },
  na: { label: 'sodium', n: 2.65e28, rho: 4.77e-8 },
};
/** E_F = (ħ²/2m)(3π²n)^(2/3), in eV, for n in m⁻³. */
export const fermiEnergy = (n) => ((HBAR * HBAR) / (2 * ME)) * Math.cbrt(3 * Math.PI * Math.PI * n) ** 2 / QE;
export const fermiSpeed = (EF) => Math.sqrt((2 * EF * QE) / ME);      // m/s, EF in eV
export const fermiTemp = (EF) => EF / KB_EV;                           // K
/** The number density with Fermi energy EF (eV): n = (2mE_F)^(3/2)/(3π²ħ³). */
export const densityFromEF = (EF) => (2 * ME * EF * QE) ** 1.5 / (3 * Math.PI * Math.PI * HBAR ** 3);
/** The Fermi–Dirac occupation of a state at energy E (eV) when the chemical potential is mu (eV). */
export const fermiDirac = (E, mu, T) => 1 / (Math.exp((E - mu) / kT(T)) + 1);
/** Drude: the mean time between collisions τ = m/(ne²ρ), in s. */
export const collisionTime = (n, rho) => ME / (n * QE * QE * rho);

// ---- semiconductors
/**
 * Band gaps at 300 K (eV), intrinsic carrier densities (cm⁻³; Sze & Ng — silicon’s is
 * often quoted as 1.0 or 0.97 × 10¹⁰), relative permittivities, and whether the gap
 * is direct (light-emitting). The LED alloys’ gaps depend on composition: typical values.
 */
export const SEMIS = {
  si: { label: 'silicon', short: 'Si', Eg: 1.12, ni: 1.0e10, epsR: 11.7, direct: false },
  ge: { label: 'germanium', short: 'Ge', Eg: 0.66, ni: 2.0e13, epsR: 16.0, direct: false },
  gaas: { label: 'gallium arsenide', short: 'GaAs', Eg: 1.42, ni: 2.1e6, epsR: 12.9, direct: true },
  gaasp: { label: 'GaAsP (red LEDs)', short: 'GaAsP', Eg: 1.91, ni: null, epsR: 12.0, direct: true },
  ingan: { label: 'InGaN (blue LEDs)', short: 'InGaN', Eg: 2.70, ni: null, epsR: 10.0, direct: true },
};
/** n_i(T) ∝ T^(3/2) e^(−E_g/2kT), scaled from its 300 K value (the gap’s own slow fall with T ignored). */
export const intrinsicRatio = (T1, T2, Eg) => (T2 / T1) ** 1.5 * Math.exp((Eg / (2 * KB_EV)) * (1 / T1 - 1 / T2));
export const intrinsic = (mat, T = 300) => mat.ni * intrinsicRatio(300, T, mat.Eg);
/** The built-in potential (V) of a junction doped NA, ND with intrinsic density ni (all in the same units). */
export const builtIn = (NA, ND, ni, T = 300) => kT(T) * Math.log((NA * ND) / (ni * ni));
/**
 * The depletion region for a junction voltage Vj = V_bi − V (V), dopings in m⁻³:
 * W = √(2εVj(NA + ND)/(e NA ND)), split xp NA = xn ND (charge balance). Lengths in m.
 */
export function depletion(NA, ND, Vj, epsR) {
  const W = Math.sqrt((2 * epsR * EPS0 * Math.max(0, Vj) * (NA + ND)) / (QE * NA * ND));
  return { W, xp: (W * ND) / (NA + ND), xn: (W * NA) / (NA + ND) };
}
/**
 * The fraction s(x) of the junction voltage dropped by position x (x = 0 at the
 * metallurgical junction, p side negative): 0 deep in the p side, 1 deep in the
 * n side, parabolic in each half of the depletion region (uniform doping).
 * The conduction-band edge is E_c(x) = E_c,p − e·Vj·s(x).
 */
export function profile(x, xp, xn) {
  const W = xp + xn;
  if (!(W > 0)) return x < 0 ? 0 : 1;
  if (x <= -xp) return 0;
  if (x >= xn) return 1;
  if (x <= 0) return (x + xp) ** 2 / (xp * W);
  return 1 - (xn - x) ** 2 / (xn * W);
}

// ---- the ideal diode and the solar cell (diode sign convention: forward current positive)
export const diode = (V, I0, T = 300, n = 1) => I0 * Math.expm1(V / (n * kT(T)));
export const cell = (V, I0, IL, T = 300) => I0 * Math.expm1(V / kT(T)) - IL;
export const vOC = (I0, IL, T = 300) => kT(T) * Math.log1p(IL / I0);
/** The maximum power point of an illuminated cell: { V, I, P } with P = −IV > 0 (golden-section search). */
export function mpp(I0, IL, T = 300) {
  if (!(IL > 0)) return { V: 0, I: 0, P: 0 };
  let a = 0, b = vOC(I0, IL, T);
  const pw = (v) => -v * cell(v, I0, IL, T), g = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 120; i++) { const c = b - g * (b - a), d = a + g * (b - a); if (pw(c) > pw(d)) b = d; else a = c; }
  const V = (a + b) / 2;
  return { V, I: cell(V, I0, IL, T), P: pw(V) };
}
/**
 * The ideal short-circuit current density (mA/cm²) of a cell of gap Eg (eV): every
 * photon above the gap gives one electron. Sunlight is modelled as a 5772 K
 * blackbody scaled to S W/m² (1000 for “one sun” at the ground, 1361 in space).
 */
export function sunJsc(Eg, S = 1000) {
  const kTs = KB_EV * 5772, shape = (E) => (E * E) / Math.expm1(E / kTs);
  const integ = (f, a, b, n = 4000) => { let s = 0; const h = (b - a) / n; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h); return s * h; };
  const power = integ((E) => E * shape(E) * QE, 1e-4, 12);
  return ((S / power) * integ(shape, Eg, 12) * QE) / 10;
}
/** The wavelength (nm) of a photon of energy E (eV): an LED emits near its gap. */
export const ledNm = (E) => HC_EVNM / E;

/**
 * The p–n junction of the mp-junction simulation: NA = ND = 10¹⁶ cm⁻³, 1 cm²,
 * 300 K. Each side’s Fermi level sits 0.203 eV inside its band (about kT ln(N_c/N_D)),
 * chosen so that silicon’s V_bi is the textbook 0.714 V (n_i = 10¹⁰ cm⁻³); every
 * material gets V_bi = E_g − 0.406 V. I₀ ∝ n_i² ∝ e^(−E_g/kT), scaled to 1 pA for
 * silicon — a teaching model, not any particular device.
 */
export const JUNCTION = { N: 1e22, delta: 0.203, I0si: 1e-12, T: 300 };
export function junction(key, V, light = 0) {
  const m = SEMIS[key], J = JUNCTION;
  const Vbi = m.Eg - 2 * J.delta, Vj = Math.max(0.02, Vbi - V);
  const I0 = J.I0si * Math.exp(-(m.Eg - SEMIS.si.Eg) / kT(J.T));
  const IL = light * sunJsc(m.Eg, 1000) * 1e-3;                         // A, for 1 cm²
  const { W, xp, xn } = depletion(J.N, J.N, Vj, m.epsR);
  return { m, Vbi, Vj, I0, IL, W, xp, xn, I: cell(V, I0, IL, J.T) };
}

// ---- superconductors
/** Elements with T_c (K) and the critical field B_c(0) (T) of type I (Kittel, Table 10.1). */
export const SUPER = {
  pb: { label: 'lead', Tc: 7.193, Bc0: 0.0803 },
  hg: { label: 'mercury', Tc: 4.154, Bc0: 0.0412 },
  sn: { label: 'tin', Tc: 3.722, Bc0: 0.0305 },
  in: { label: 'indium', Tc: 3.4035, Bc0: 0.02815 },
  al: { label: 'aluminium', Tc: 1.175, Bc0: 0.0105 },
};
/** B_c(T) = B_c(0)[1 − (T/T_c)²], and the temperature at which a field B destroys superconductivity. */
export const critField = (T, Tc, Bc0) => (T >= Tc ? 0 : Bc0 * (1 - (T / Tc) ** 2));
export const critTemp = (B, Tc, Bc0) => (B >= Bc0 ? 0 : Tc * Math.sqrt(1 - B / Bc0));
/** BCS (weak coupling): the gap across a Cooper pair, 2Δ = 3.528 kT_c, in eV. */
export const BCS = 3.528;
export const pairGap = (Tc) => BCS * KB_EV * Tc;
/** The flux quantum h/2e (Wb) — 2e because the carriers are pairs. */
export const FLUX_QUANTUM = H / (2 * QE);
/** The London moment: a superconductor spinning at f (Hz) carries B = 2mₑω/e inside, in T. */
export const londonField = (f) => (2 * ME * 2 * Math.PI * f) / QE;
