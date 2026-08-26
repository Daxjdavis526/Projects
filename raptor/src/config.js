// RAPTOR — F-22 simulation parameters.
//
// Every number here comes from public, open-literature sources (manufacturer
// fact sheets, USAF pages, Jane's-style references) or from generic fighter
// aerodynamics. The real aircraft's flight-control laws and aerodynamic
// coefficients are classified; nothing in this file claims to reproduce them.
// What it does claim is to be a *plausible* twin-engine, thrust-vectoring,
// supercruising air-superiority fighter.

export const AC = {
  name: 'F-22A Raptor',

  // ---- mass & geometry (public figures) ----
  emptyMass: 19700,        // kg
  fuelCapacity: 8200,      // kg internal
  wingArea: 78.04,         // m^2
  wingSpan: 13.56,         // m
  length: 18.92,           // m
  mac: 5.75,               // m, mean aerodynamic chord (estimated)
  aspectRatio: 13.56 * 13.56 / 78.04,
  oswald: 0.80,            // span efficiency, typical for a blended delta

  // ---- inertia tensor, body axes (estimated from mass & geometry) ----
  Ixx: 31000,              // roll   kg m^2
  Iyy: 195000,             // pitch
  Izz: 215000,             // yaw

  // ---- propulsion: 2x F119-class afterburning turbofan ----
  engineCount: 2,
  thrustMil: 116000,       // N per engine, sea-level static
  thrustAB: 156000,        // N per engine, sea-level static with augmentation
  spoolUpTime: 2.4,        // s, idle -> mil
  spoolDownTime: 3.2,      // s
  idleFraction: 0.028,      // fraction of mil thrust at idle
  sfcMil: 2.15e-5,         // kg/(N s) — ~0.76 lb/(lbf h)
  sfcAB: 6.4e-5,           // kg/(N s) — ~2.26 lb/(lbf h)
  nozzleVectorMax: 20 * Math.PI / 180,   // rad, pitch-axis only
  nozzleVectorRate: 60 * Math.PI / 180,  // rad/s

  // ---- aerodynamics ----
  CL0: 0.06,
  CLalpha: 3.5,            // per rad, low-aspect-ratio blended wing
  alphaStall: 26 * Math.PI / 180,  // relaxed-stability fighter, high-alpha capable
  alphaMax: 60 * Math.PI / 180,    // post-stall, thrust-vectoring regime
  CD0: 0.021,              // clean parasite drag
  CDgear: 0.028,
  CDbrake: 0.06,
  CLmaxDevice: 1.9,

  // control power (moment coefficients per unit stick, per rad of surface)
  Clda: 0.16,              // roll from ailerons/flaperons
  Cmde: 0.55,              // pitch from stabilators
  Cndr: 0.10,              // yaw from rudders
  Cnbeta: 0.14,            // weathercock stability
  Clbeta: -0.09,           // dihedral effect
  // rate damping derivatives (per rad, non-dimensional)
  Clp: -0.34, Cmq: -6.5, Cnr: -0.42,

  // ---- limits & gear ----
  gLimit: 9.0,
  gLimitNeg: -3.0,
  maxMach: 2.25,
  serviceCeiling: 19800,   // m
  gearDownMaxSpeed: 154,   // m/s (~300 kt)
  gearTransitTime: 4.0,    // s
  wheelbase: 6.1,
  track: 3.2,
  gearHeight: 2.35,
  brakeForce: 90000,       // N
  rollingResistance: 0.03,
  noseWheelMaxSteer: 45 * Math.PI / 180,
};

// Fuel gives ~ (fuel / (thrust * sfc)) seconds; ballpark 1.5 h on mil power.
export const SIM = {
  fixedDt: 1 / 240,        // s, physics step
  maxSubSteps: 90,
  speedOfSoundSL: 340.29,  // m/s
  earthRadius: 6371000,    // m
  g0: 9.80665,
};

export const WORLD = {
  // Reference geodetic origin of the local tangent world (Nellis AFB, Nevada —
  // desert, mountains and a long runway make a good starting point).
  originLat: 36.235,
  originLon: -115.034,
  originName: 'Nellis AFB',
};
