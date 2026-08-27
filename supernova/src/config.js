/* =============================================================================
   CONFIG — constants, units, quality tiers, palette
   -----------------------------------------------------------------------------
   Physics runs in cgs (the astrophysics convention: cm, g, s, erg). Rendering
   runs in kilometres. Nothing else converts: `KM` is the only bridge, and it is
   applied exactly once, in render/profiles.js.
   ========================================================================== */

/* --- fundamental constants, cgs ------------------------------------------ */
export const C       = 2.99792458e10;   // speed of light, cm/s
export const G       = 6.67430e-8;      // gravitational constant, cgs
export const K_B     = 1.380649e-16;    // Boltzmann, erg/K
export const M_H     = 1.6735575e-24;   // hydrogen mass, g
export const SIGMA_SB= 5.670374e-5;     // Stefan-Boltzmann, erg/cm^2/s/K^4
export const MEV     = 1.602176634e-6;  // 1 MeV in erg

/* --- astronomical scales, cgs -------------------------------------------- */
export const M_SUN   = 1.98892e33;      // g
export const R_SUN   = 6.957e10;        // cm
export const L_SUN   = 3.828e33;        // erg/s
export const AU      = 1.495978707e13;  // cm
export const PC      = 3.0856775815e18; // cm
export const LY      = 9.4607304726e17; // cm
export const YEAR    = 3.15576e7;       // s
export const DAY     = 86400;           // s

/* --- the one unit bridge -------------------------------------------------- */
/* Scene units are kilometres. cm -> km. */
export const KM = 1e-5;

/* --- supernova-specific thresholds --------------------------------------- */
export const RHO_NUC   = 2.7e14;  // nuclear saturation density, g/cm^3
export const RHO_TRAP  = 2.0e12;  // neutrino trapping density, g/cm^3
export const M_TOV     = 2.2;     // max non-rotating NS gravitational mass, Msun
export const E_PHOTO   = 8.8;     // photodisintegration cost, MeV/nucleon
export const Q_FE56    = 124.4;   // 56Fe -> 13a + 4n, MeV (endothermic)

/* Ni-56 -> Co-56 -> Fe-56 decay chain */
export const TAU_NI = 8.8   * DAY;   // e-folding time, s
export const TAU_CO = 111.3 * DAY;
export const EPS_NI = 3.9e10;        // erg/s per gram of Ni-56
export const EPS_CO = 6.8e9;         // erg/s per gram of Co-56

/* --- composition ---------------------------------------------------------- */
/* Index order is used by the shell arrays and both composition textures. */
export const ELEMENTS = ['H', 'He', 'C', 'O', 'Ne', 'Mg', 'Si', 'Fe'];
export const NEL = ELEMENTS.length;

/* Display colours per element, linear-ish sRGB. Chosen to read as distinct
   under bloom, and loosely evocative of real emission: shocked hydrogen pale
   rose, oxygen teal (the [O III] association), iron-group hot gold. */
export const ELEMENT_COLOR = {
  H:  [1.00, 0.72, 0.74],
  He: [1.00, 0.90, 0.62],
  C:  [0.62, 0.66, 0.72],
  O:  [0.30, 0.92, 0.86],
  Ne: [0.55, 0.72, 1.00],
  Mg: [0.78, 0.62, 1.00],
  Si: [1.00, 0.62, 0.38],
  Fe: [1.00, 0.84, 0.44],
};

/* --- shell resolution ----------------------------------------------------- */
export const N_SHELL = 256;   // Lagrangian shells; also the DataTexture width

/* --- quality tiers -------------------------------------------------------- */
/* volumeSteps is the primary fill-rate knob; volumeScale is the offscreen
   render-target fraction. knots is the instance count for fine ejecta detail. */
export const QUALITY = {
  low:    { volumeSteps: 16, volumeScale: 0.40, knots:  1500, shockDetail: 5,
            bloom: { strength: 0.55, radius: 0.55, threshold: 1.0 },
            starfield: 6000,  dust:  600, pixelRatioCap: 1.0 },
  medium: { volumeSteps: 24, volumeScale: 0.50, knots:  6000, shockDetail: 6,
            bloom: { strength: 0.60, radius: 0.60, threshold: 1.0 },
            starfield: 12000, dust: 1200, pixelRatioCap: 1.5 },
  high:   { volumeSteps: 40, volumeScale: 0.65, knots: 20000, shockDetail: 7,
            bloom: { strength: 0.65, radius: 0.60, threshold: 1.0 },
            starfield: 20000, dust: 2000, pixelRatioCap: 2.0 },
  ultra:  { volumeSteps: 64, volumeScale: 1.00, knots: 60000, shockDetail: 7,
            bloom: { strength: 0.70, radius: 0.62, threshold: 1.0 },
            starfield: 32000, dust: 3000, pixelRatioCap: 2.0 },
};
export const QUALITY_ORDER = ['low', 'medium', 'high', 'ultra'];

/* --- camera --------------------------------------------------------------- */
export const CAMERA = {
  fov: 55,
  near: 1.0,          // km — near tier; far tier uses its own
  far: 1e12,
  speedFactor: 0.20,  // v = speedFactor * distance-to-nearest-focus
  speedMin: 1e-3,     // km/s — crawl at the neutron star
  speedMax: 3e9,      // km/s — ~10 c, for crossing the mature remnant
  boost: 8.0,
  damping: 9.0,       // exponential approach rate, 1/s
  lookSpeed: 0.0022,
};

/* --- render tier split ---------------------------------------------------- */
/* Objects beyond NEAR_TIER_RADIUS km of the camera go in the far scene, which
   renders first with its own depth range and is then cleared. */
export const NEAR_TIER_RADIUS = 1e9;
