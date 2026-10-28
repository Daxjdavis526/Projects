// Constants and data for the PHYS 2710 lessons on photons, atomic models and
// matter waves (modules MP4–MP6) that content/phys2710/_constants.js does
// not carry. Not a lesson: the leading underscore keeps it out of the
// registry.
//
// Measured constants are CODATA 2022 (Rev. Mod. Phys. 97, 025002, 2025);
// atomic masses are AME2020 (in u); particle widths are the Particle Data
// Group's (2024); X-ray line energies are Bearden's (1967), as tabulated in
// the X-ray Data Booklet; mercury and oxygen levels are from the NIST Atomic
// Spectra Database; lattice spacings are room-temperature values.

import { C, H, HBAR, QE, ME } from './_constants.js';

// ---- constants ----
export const ALPHA = 7.2973525643e-3;              // fine-structure constant
export const EPS0 = 8.8541878188e-12;              // F/m, vacuum permittivity
export const HBAR_EVS = HBAR / QE;                 // eV s: 6.582 119 569…e-16
export const HBARC = (HBAR * C / QE) * 1e9;        // eV nm, the same digits as MeV fm: 197.326 980…
export const KE2 = ALPHA * HBARC;                  // e²/4πε₀ in eV nm (= MeV fm): 1.439 964 5…
export const RYD = 13.605693122990;                // eV, the Rydberg energy R∞hc
export const U_KG = 1.66053906892e-27;             // kg, the atomic mass unit
export const MAC2 = 3727.3794118;                  // MeV, the alpha particle’s rest energy
export const LAMBDA_C_PM = (H / (ME * C)) * 1e12;  // pm, the electron’s Compton wavelength: 2.426 310…
export const G0 = 9.80665;                         // m/s², standard gravity (exact by definition)
/** e²/(8π²ε₀mₑ): the ionospheric constant 40.3 m³ s⁻² in the GPS delay formula 40.3·TEC/f². */
export const IONO = (QE * QE) / (8 * Math.PI * Math.PI * EPS0 * ME);

// ---- atomic masses (AME2020), in u ----
export const M_O16 = 15.99491462;
export const M_SI28 = 27.97692653;
export const M_FE56 = 55.93493633;
export const M_CS133 = 132.905451961;
export const M_PB208 = 207.9766525;
export const AU_GPMOL = 196.96657;                 // g/mol, gold (one isotope)
export const RHO_AU = 19.32;                       // g/cm³, gold at room temperature
export const N_A = 6.02214076e23;                  // per mol, exact
export const HG_GPMOL = 200.592;                   // g/mol, mercury (standard atomic weight)

// ---- particles (PDG 2024) ----
export const GAMMA_Z = 2495.5;                     // MeV, the Z boson’s full width
export const GAMMA_JPSI = 0.0926;                  // MeV, the J/ψ’s full width (92.6 keV)
export const GAMMA_DELTA = 117;                    // MeV, the Δ(1232) resonance’s width (Breit–Wigner, about)

// ---- X-ray lines, keV (Bearden 1967) and K absorption edges ----
export const XRAY = {
  mo: { name: 'molybdenum', Z: 42, ka1: 17.47934, ka2: 17.3743, kb1: 19.6083, edge: 19.9995 },
  cu: { name: 'copper', Z: 29, ka1: 8.04778, ka2: 8.02783, kb1: 8.90529, edge: 8.97903 },
  w: { name: 'tungsten', Z: 74, ka1: 59.31824, ka2: 57.9817, kb1: 67.2443, edge: 69.525 },
};
/** The intensity-weighted Kα of a target (Kα₁ is twice as strong as Kα₂), as a wavelength in pm. */
export const kalphaPm = (t) => { const X = XRAY[t]; return (2 * (1239.841984 / X.ka1) + 1239.841984 / X.ka2) / 3; };

// ---- crystal plane spacings, pm ----
export const CRYSTAL = {
  nacl: { name: 'rock salt (NaCl), (200) planes', short: 'NaCl', d: 282.01 },
  lif: { name: 'lithium fluoride (LiF), (200) planes', short: 'LiF', d: 201.35 },
  si: { name: 'silicon, (111) planes', short: 'Si', d: 313.56 },
  calcite: { name: 'calcite, its cleavage planes', short: 'calcite', d: 303.56 },
};

// ---- mercury’s lowest levels above the ground state, eV (NIST ASD) ----
export const HG_LEVELS = { '3P0': 4.66737, '3P1': 4.88648, '3P2': 5.46061, '1P1': 6.70368, ion: 10.4375 };
// ---- atomic oxygen’s two auroral levels, eV ----
export const O_1D = 1.96736, O_1S = 4.18968;

// ---- Mössbauer iron-57 ----
export const FE57_KEV = 14.4129;                   // keV, the 14.4 keV gamma ray
export const FE57_TAU = 98.3e-9 / Math.LN2;        // s, mean life of its level (half-life 98.3 ns)
