/* =============================================================================
   CONFIG — constants, unit conventions, quality tiers
   -----------------------------------------------------------------------------
   The whole simulation works in SI: metres, seconds, kilograms, kelvin. There
   is no scene-unit conversion anywhere, because the Moon is rendered at its
   real size; what makes that possible is the floating origin (see FRAME below)
   and a logarithmic depth buffer, not a fudged scale factor.

   Coordinates are Mean Earth / Polar Axis (ME) of DE421 — the frame every LOLA,
   SLDEM2015 and LROC product is archived in:

       +Z  through the north pole
       +X  through (0 deg N, 0 deg E)
       +Y  through (0 deg N, 90 deg E)

   Latitude is planetocentric, longitude positive east. Elevation is height
   above a sphere of radius R_MOON, which is the LOLA datum, not a geoid.
   ========================================================================== */

/* --- the Moon, measured ---------------------------------------------------- */
export const R_MOON   = 1737400;          // m, LOLA reference sphere (datum)
export const GM_MOON  = 4.90280011526e12; // m^3/s^2, GRAIL GRGM1200A
export const G0_MOON  = GM_MOON / (R_MOON * R_MOON);  // 1.6246 m/s^2 at the datum
export const R_EARTH  = 6378137;          // m, WGS84 equatorial (for angular size)
export const R_SUN    = 6.957e8;          // m
export const AU       = 1.495978707e11;   // m
export const SOLAR_CONSTANT = 1361;       // W/m^2 at 1 AU
/* Earthshine at full Earth, Glenar et al. 2019: 0.15 W/m^2, ~1e-4 of sunlight. */
export const EARTHSHINE_FULL = 0.15;      // W/m^2

/* Sidereal rotation = orbital period; the solar day is the synodic month. */
export const SIDEREAL_MONTH = 27.321661 * 86400;   // s
export const SYNODIC_MONTH  = 29.530589 * 86400;   // s  (one lunar day/night cycle)

/* --- rendering frame ------------------------------------------------------- */
export const FRAME = {
  originLattice: 256,     // m, floating origin snaps to this grid
  originRadius: 2048,     // m, rebase once the camera drifts this far
  detailLattice: 4096,    // m, lattice the procedural shader detail is keyed to
  near: 0.05,             // m
  far: 6.0e6,             // m, comfortably past the far limb from orbit
};

/* --- terrain --------------------------------------------------------------- */
export const TERRAIN = {
  /* The regolith noise repeats on this many metres, which lets a tile carry its
     texture coordinates in a float without a seam where they wrap. */
  detailPeriod: 2048,
  verts: 33,              // vertices per tile edge (32 quads)
  apron: 32,              // extra cells sampled around a tile for normals/horizon
  splitK: 3.0,            // split when distance < splitK * tile arc length
  horizonDirs: 8,         // azimuths in the per-vertex horizon map
  skirt: 0.005,           // skirt depth as a fraction of the tile edge
  seed: 0x5e1e4e,         // global seed for all procedural detail
  /* Procedural detail is band-limited to wavelengths shorter than the source
     raster can resolve, so it can never move or erase a real landform. */
  detailAmpAt100m: 3.0,   // m RMS of fractal roughness at a 100 m wavelength
  detailHurst: 0.7,
  craterMinD: 0.6,        // m, smallest procedural crater
  craterEqSlope: 1.83,    // cumulative size-frequency exponent (Hartmann & Gaskell)
  rockCell: 8.0,          // m, hash cell for scattered rocks
};

/* --- quality tiers --------------------------------------------------------- */
export const QUALITY = {
  performance: { maxLevel: 15, tileBudget: 420,  cache: 700,  shadow: 1024, cascades: 2,
                 apron: 16, rocks: 0.35, pixelRatio: 1.0, bloom: false, imagery: true },
  balanced:    { maxLevel: 17, tileBudget: 700,  cache: 1100, shadow: 2048, cascades: 3,
                 apron: 24, rocks: 0.7,  pixelRatio: 1.25, bloom: true,  imagery: true },
  high:        { maxLevel: 18, tileBudget: 1000, cache: 1500, shadow: 2048, cascades: 3,
                 apron: 32, rocks: 1.0,  pixelRatio: 1.5, bloom: true,  imagery: true },
  ultra:       { maxLevel: 18, tileBudget: 1400, cache: 2000, shadow: 4096, cascades: 4,
                 apron: 32, rocks: 1.4,  pixelRatio: 2.0, bloom: true,  imagery: true },
  /* Scientific visualisation: measured data with as little artistic processing
     as possible. Flat Lambert shading, no procedural micro-relief, no bloom. */
  science:     { maxLevel: 17, tileBudget: 900,  cache: 1300, shadow: 2048, cascades: 3,
                 apron: 24, rocks: 0.0,  pixelRatio: 1.25, bloom: false, imagery: true,
                 plain: true, noProcedural: true },
};
export const DEFAULT_QUALITY = 'high';

/* --- regolith optics ------------------------------------------------------- */
/* Hapke-like, ESTIMATED. Sato et al. 2014 published resolved parameter maps but
   the numeric table is paywalled; see RESEARCH.md. These reproduce the two
   things that matter visually: strong backscatter, and an opposition surge. */
export const OPTICS = {
  albedoMare: 0.085,       // approximate normal albedo, 643 nm
  albedoHighland: 0.145,
  /* The brightest fresh crater material measured on the Moon is around a
     quarter; the colour map's ray craters are stretched well past that for
     display. See render/albedo.js for what is done about it. */
  albedoMax: 0.24,
  albedoKnee: 3,           // how sharply the map's bright end rolls over
  /* How much of the colour map's chroma to keep. Its linear red to blue ratio
     is 1.117 because it is a 689/643/604 nm composite; the published visual
     ratio for mature regolith is 1.05 to 1.10. See render/albedo.js. */
  chroma: 0.55,
  hgG: -0.25,              // Henyey-Greenstein asymmetry (backscattering)
  oppositionB0: 0.9,       // surge amplitude
  oppositionH: 0.06,       // surge angular width (rad)
  normalisePhase: 30 * Math.PI / 180,  // BRDF matches Lambert at this phase angle
  earthshineTint: [0.62, 0.72, 1.0],   // Earth is blue; the surface it lights is not
};

/* --- exposure -------------------------------------------------------------- */
/* Analytic eye adaptation. Apollo crews could not see stars from the sunlit
   surface; they could from shadow. That is an exposure fact, not a sky fact. */
export const EXPOSURE = {
  evMin: -14, evMax: 1,
  tauBrighten: 1.5,        // s, adapting to more light is fast
  tauDarken: 12.0,         // s, adapting to darkness is slow
  /* Where sunlit regolith sits on the tone curve. Set so a level mare surface
     under a middling sun renders like a well-exposed Hasselblad frame — bright
     grey, not white — with the shadows left properly black. */
  evReference: -2.4,
};

/* --- player, suit, vehicles (FICTIONAL hardware, plausible numbers) --------- */
/* Locomotion follows the Apollo film analyses: the walk-to-lope transition sits
   at a Froude number near 0.37, loping is the efficient gait, top speed is
   roughly 60 % of a terrestrial runner's. See RESEARCH.md section 8. */
export const PLAYER = {
  height: 1.85, radius: 0.34, eye: 1.62, mass: 82, suitMass: 55,
  walk: 1.1, lope: 2.6, sprint: 3.6,     // m/s
  jumpHeight: 0.45,                       // m at 1/6 g
  slopeLimit: 32 * Math.PI / 180,
  slideAccel: 0.9,
  airControl: 0.12,
  stepUp: 0.45,
  fallHurt: 6.0, fallFatal: 11.0,         // m/s impact speed
  jetpackAccel: 18.0,                     // m/s^2 (FICTIONAL)
  jetpackHeatUp: 0.13, jetpackHeatDown: 0.085,  // fraction per second
};

/* Suit consumables. Apollo's PLSS carried ~0.85 kg of oxygen for an eight-hour
   EVA (~0.09 kg/h at work rates); the xEMU design point is 8 h + 1 h reserve.
   SELENE's suit is a near-future one with the same architecture. */
/* Sized so that all four consumables run out within about an hour of each
   other at moderate work, which is how a real suit is designed: there is no
   point carrying ten hours of oxygen behind an eight hour scrubber. Which one
   binds first then depends on what you are actually doing, and the lamps and
   the shade cost you real endurance. Apollo's own numbers are the anchor
   (0.85 kg of oxygen and 3.9 kg of feedwater for about eight hours); this suit
   is near-future fiction and carries a little more. See RESEARCH.md section 9. */
export const SUIT = {
  o2Capacity: 1.05,        // kg, primary
  o2Secondary: 0.068,      // kg, the purge bottle: about thirty minutes
  o2RateIdle: 0.075, o2RateHard: 0.20,   // kg/h, including suit leakage
  co2Capacity: 0.60,       // kg absorbed before the scrubber saturates
  co2Rate: 0.098,          // kg/h produced at hard work
  powerCapacity: 900,      // Wh
  powerBase: 75, powerLights: 40, powerHeater: 90, powerCooling: 25,  // W
  waterCapacity: 4.5, waterRate: 0.75,   // kg, kg/h at hard work (sublimator + drinking)
  pressure: 29.6,          // kPa (4.3 psi)
  reserveWarnFraction: 0.20,
  reserveCriticalFraction: 0.08,
  co2WarnMmHg: 7.6, co2CriticalMmHg: 15.2,   // NASA suit limits
  modes: { realistic: 1.0, relaxed: 0.33, unlimited: 0.0 },
};

export const ROVER = {
  mass: 1450, wheelBase: 3.1, track: 2.4, wheelRadius: 0.52, clearance: 0.55,
  /* Spring rates are set for lunar weight, not Earth weight. The vehicle
     presses down with 1450 kg times 1.62, which is 2.3 kN in total, so a rate
     that would give a sensible 11 cm of static sag on Earth would hold this
     one rigid and every pebble would launch it. Damping is a little past
     critical, because a bouncing rover in low gravity takes a very long time
     to settle. */
  suspTravel: 0.42, suspK: 5200, suspC: 2600,            // N/m, N.s/m per wheel
  motorForce: 3600, brakeForce: 5200, boostFactor: 2.4,  // N total
  speedMax: 5.0, speedBoost: 8.3,                        // m/s (18 / 30 km/h)
  grip: 0.62,                                            // regolith friction
  slopeMax: 25 * Math.PI / 180,
  cabinVolume: 9.0,                                      // m^3, like the LER trial
  pressuriseTime: 45,                                    // s
  supplies: { o2: 34, co2: 40, water: 120, food: 14 },   // kg, kg, kg, days-of-food
  boostHeatUp: 0.09, boostHeatDown: 0.05,
};

/* The ship as models/ship.js actually builds it. NASA's habitable volume
   guidance is about 25 cubic metres per person and crew quarters want about
   five, so a hundred and fifty over two decks is a genuine three-person
   habitat rather than a capsule. The Apollo lunar module cabin, for scale,
   was 6.7. All of these numbers are FICTIONAL: no such vehicle exists. */
export const SHIP = {
  radius: 3.6, height: 9.5, legSpan: 12.4,
  padRadius: 16.0, padFeather: 11.0,   // the one place terrain is edited (FICTIONAL)
  interiorVolume: 154,                 // m^3 pressurised, two decks plus the airlock
  airlockCycle: 22,                    // s
};

/* --- time ------------------------------------------------------------------ */
export const TIME = {
  modes: {
    realistic: [1],
    accelerated: [60, 600, 3600, 21600, 86400],
    fixed: [0],
  },
  defaultMode: 'accelerated',
  defaultRate: 600,
};

/* --- data provenance labels ------------------------------------------------ */
export const LABEL = {
  MEASURED: 'MEASURED',
  DERIVED: 'DERIVED',
  INTERPOLATED: 'INTERPOLATED',
  REGIONAL: 'REGIONAL DATA',
  PROCEDURAL: 'PROCEDURAL',
  FICTIONAL: 'FICTIONAL',
};

/* --- streaming ------------------------------------------------------------- */
export const STREAM = {
  concurrency: 6,
  retries: 3,
  retryDelay: 900,          // ms, doubled each retry
  cacheBytesDefault: 512e6,
  timeout: 25000,           // ms
  enabled: true,            // NASA Trek streaming on by default; page works without it
};
