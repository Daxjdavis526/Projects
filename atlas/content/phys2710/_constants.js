// Constants for the PHYS 2710 lessons — the ones src/core/units.js does not
// carry. Not a lesson: the leading underscore keeps it out of the registry.
//
// The 2019 SI fixes c, h, e, k_B and N_A exactly, so σ, Wien's b and hc are
// exact too (computed here from them). Measured constants are CODATA 2022
// (Rev. Mod. Phys. 97, 025002, 2025); particle masses and lifetimes are the
// Particle Data Group's (2024); atomic masses are AME2020; solar values are
// the IAU 2015 nominal ones; the CMB temperature is Fixsen (2009).

// ---- exact (2019 SI) ----
export const C = 299792458;                       // m/s
export const H = 6.62607015e-34;                  // J s
export const HBAR = H / (2 * Math.PI);            // J s
export const QE = 1.602176634e-19;                // C, and J per eV
export const KB = 1.380649e-23;                   // J/K
export const KB_EV = KB / QE;                     // eV/K: 8.617 333 262…e-5
export const H_EVS = H / QE;                      // eV s: 4.135 667 696…e-15
export const HC_EVNM = (H * C / QE) * 1e9;        // eV nm: 1239.841 984…

// ---- derived exactly from those ----
export const SIGMA = (2 * Math.PI ** 5 * KB ** 4) / (15 * H ** 3 * C ** 2);   // W m⁻² K⁻⁴: 5.670 374 419…e-8
/** The root of x = n(1 − e^(−x)), by fixed-point iteration (n = 5: Wien's wavelength law; n = 3: its frequency form). */
const wienRoot = (n) => { let x = n; for (let i = 0; i < 200; i++) x = n * (1 - Math.exp(-x)); return x; };
export const WIEN_X = wienRoot(5);                // 4.965 114 231…
export const WIEN_NU_X = wienRoot(3);             // 2.821 439 372…
export const WIEN_B = (H * C) / (WIEN_X * KB);    // m K: 2.897 771 955…e-3
export const WIEN_NU = (WIEN_NU_X * KB) / H;      // Hz per K: 5.878 925 757…e10

// ---- measured (CODATA 2022) ----
export const ME = 9.1093837139e-31;               // kg, electron
export const MEC2 = 0.51099895069;                // MeV
export const MP = 1.67262192595e-27;              // kg, proton
export const MPC2 = 938.27208943;                 // MeV
export const MNC2 = 939.56542194;                 // MeV, neutron
export const MDC2 = 1875.612945;                  // MeV, deuteron
export const UC2 = 931.49410372;                  // MeV per atomic mass unit
export const RINF = 10973731.568157;              // m⁻¹, Rydberg constant
export const MP_ME = 1836.152673426;              // proton–electron mass ratio
export const RH = RINF / (1 + 1 / MP_ME);         // m⁻¹, Rydberg constant for hydrogen (reduced mass)
export const A0 = 5.29177210544e-11;              // m, Bohr radius
export const RE = 2.8179403205e-15;               // m, classical electron radius

// ---- particles (PDG 2024), rest energies in MeV, mean lives in s ----
export const MMUC2 = 105.6583755;                 // muon
export const TAU_MU = 2.1969811e-6;               // muon mean life
export const MPIC2 = 139.57039;                   // charged pion
export const MPI0C2 = 134.9768;                   // neutral pion
export const META = 547.862;                      // eta meson
export const MZC2 = 91188;                        // Z boson (91.188 GeV)

// ---- atomic masses (AME2020), in u ----
export const M_H1 = 1.00782503190;
export const M_H2 = 2.01410177784;
export const M_H3 = 3.01604928132;
export const M_HE4 = 4.00260325413;
export const M_N = 1.00866491606;                 // the neutron (CODATA 2022)

// ---- astronomy ----
export const T_SUN = 5772;                        // K, IAU 2015 nominal effective temperature
export const R_SUN = 6.957e8;                     // m, IAU 2015 nominal radius
export const L_SUN = 3.828e26;                    // W, IAU 2015 nominal luminosity
export const S_SUN = 1361;                        // W/m², IAU 2015 nominal total solar irradiance at 1 au
export const AU = 1.495978707e11;                 // m, exact (IAU 2012)
export const LY = 9.4607304725808e15;             // m (Julian year)
export const YEAR = 365.25 * 86400;               // s, Julian year
export const T_CMB = 2.72548;                     // K, Fixsen (2009), ± 0.00057 K
export const V_CMB = 369.82e3;                    // m/s, the Sun's speed relative to the CMB (Planck 2018)
export const DT_CMB = 3.36208e-3;                 // K, the measured CMB dipole amplitude (Planck 2018)
