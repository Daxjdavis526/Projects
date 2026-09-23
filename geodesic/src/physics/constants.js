/* =============================================================================
   CONSTANTS AND UNITS
   -----------------------------------------------------------------------------
   Internal units are AU, solar masses and Julian years. In that system
   G ~ 4pi^2, which keeps every solar-system quantity within a few orders of
   magnitude of 1 and leaves float64 with room to represent a black hole
   horizon (2e-8 AU) and a wide binary (1e4 AU) in the same scene.

   Everything here is derived from SI values rather than from the convenient
   fiction G = 4pi^2 exactly, so the numbers the UI reports are the real ones.
   ========================================================================== */

/* --- SI --------------------------------------------------------------------- */
export const SI = {
  G:    6.67430e-11,        // m^3 kg^-1 s^-2   (CODATA 2018)
  c:    2.99792458e8,       // m/s              (exact, by definition)
  AU:   1.495978707e11,     // m                (exact, by definition)
  M_SUN: 1.98847e30,        // kg
  R_SUN: 6.957e8,           // m
  YR:   3.15576e7,          // s                (Julian year, 365.25 d)
  M_EARTH: 5.97217e24,      // kg
  R_EARTH: 6.371e6,         // m
  M_JUP: 1.89813e27,        // kg
  R_JUP: 6.9911e7,          // m
};

/* --- unit conversions ------------------------------------------------------- */
export const AU_PER_M   = 1 / SI.AU;
export const M_PER_AU   = SI.AU;
export const MSUN_PER_KG = 1 / SI.M_SUN;
export const KG_PER_MSUN = SI.M_SUN;
export const YR_PER_S   = 1 / SI.YR;
export const S_PER_YR   = SI.YR;

/* --- derived constants in internal units ----------------------------------- */
/* G [AU^3 / (Msun yr^2)] */
export const G = SI.G * SI.M_SUN * SI.YR * SI.YR / (SI.AU ** 3);
/* c [AU / yr] */
export const C = SI.c * SI.YR / SI.AU;
export const C2 = C * C;

/* Handy reference values, internal units */
export const R_SUN_AU   = SI.R_SUN / SI.AU;          // 4.65e-3
export const R_EARTH_AU = SI.R_EARTH / SI.AU;        // 4.26e-5
export const R_JUP_AU   = SI.R_JUP / SI.AU;          // 4.67e-4
export const M_EARTH_MSUN = SI.M_EARTH / SI.M_SUN;   // 3.00e-6
export const M_JUP_MSUN   = SI.M_JUP / SI.M_SUN;     // 9.55e-4

/* Angle/misc */
export const ARCSEC_PER_RAD = 206264.80624709636;
export const DAY_PER_YR = 365.25;

/* =============================================================================
   MATERIALS
   -----------------------------------------------------------------------------
   Mean densities in kg/m^3, and the internal-unit equivalent. These let the
   UI offer "make it rock" instead of demanding a number, and let radius and
   density stay consistent when the user edits mass.
   ========================================================================== */
const rhoToInternal = (kgm3) => kgm3 / SI.M_SUN * (SI.AU ** 3);   // -> Msun/AU^3

export const MATERIALS = {
  ice:        { label: 'Ice',            rho: 917 },
  rock:       { label: 'Rock',           rho: 3000 },
  iron:       { label: 'Iron',           rho: 7870 },
  terrestrial:{ label: 'Terrestrial',    rho: 5514 },   // Earth's mean density
  gasGiant:   { label: 'Gas giant',      rho: 1326 },   // Jupiter
  star:       { label: 'Main-sequence',  rho: 1408 },   // the Sun
  whiteDwarf: { label: 'White dwarf',    rho: 1.0e9 },
  neutronStar:{ label: 'Neutron star',   rho: 5.0e17 }, // ~2x nuclear saturation
  blackHole:  { label: 'Black hole',     rho: null },   // radius IS the horizon
};
for (const m of Object.values(MATERIALS)) {
  m.rhoInternal = m.rho == null ? null : rhoToInternal(m.rho);
}
export { rhoToInternal };

/* =============================================================================
   PHYSICAL LIMITS
   ========================================================================== */
/* Buchdahl's theorem: no static, spherically symmetric body of uniform-or-
   decreasing density can have 2GM/Rc^2 above 8/9 — beyond it, no pressure
   profile can hold the body up and collapse is unavoidable. */
export const BUCHDAHL_LIMIT = 8 / 9;

/* Where the Newtonian layer stops being trustworthy. */
export const V_NEWTONIAN_MAX = 0.1;    // in units of c
export const PHI_WEAK_MAX = 1e-3;      // |Phi|/c^2 above which "weak field" is a lie
