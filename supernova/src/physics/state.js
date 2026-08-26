/* =============================================================================
   STATE — the complete simulation state, and nothing else
   -----------------------------------------------------------------------------
   Plain data. No three.js, no DOM, no imports beyond config. Everything the
   renderer will ever see is derived from this object by engine.snapshot().

   The model is Lagrangian: N_SHELL shells at FIXED mass coordinates. Because a
   shell keeps its mass forever, composition never needs advecting — X[i] is
   simply the material that shell was born with, wherever it has moved to.

   All units cgs. t = 0 at core bounce (the astrophysics convention), so the
   progenitor phase runs at negative time.
   ========================================================================== */

import { N_SHELL, NEL } from '../config.js';

export function createState() {
  return {
    t: -1e9,                 // s, relative to core bounce
    phase: 'progenitor',
    phaseT: 0,               // time since entering the current phase

    /* --- per-shell Lagrangian fields ------------------------------------- */
    m:   new Float64Array(N_SHELL),   // enclosed mass, g (fixed after init)
    r:   new Float64Array(N_SHELL),   // radius, cm
    v:   new Float64Array(N_SHELL),   // radial velocity, cm/s
    rho: new Float64Array(N_SHELL),   // density, g/cm^3
    T:   new Float64Array(N_SHELL),   // temperature, K
    ye:  new Float64Array(N_SHELL),   // electron fraction
    X:   new Float32Array(N_SHELL * NEL),  // mass fractions

    /* Initial radii, needed by the collapse solution r(r0, t). */
    r0:  new Float64Array(N_SHELL),

    /* --- scalars --------------------------------------------------------- */
    rho_c: 0, T_c: 0, Ye_c: 0,
    R_star: 0, T_eff: 0,
    R_core: 0,               // outer edge of the iron core, cm

    R_pns: 0, M_pns: 0,      // proto-neutron star
    R_shock: 0, v_shock: 0,
    R_nu: 0,                 // neutrinosphere radius
    L_nu: 0, E_nu: 0,        // neutrino luminosity erg/s, cumulative erg

    E_expl: 0,               // ejecta kinetic energy so far, erg
    E_heat: 0,               // neutrino heating deposited behind the shock
    M_dot_acc: 0,            // accretion rate through the stalled shock, g/s

    M_ni: 0, M_co: 0, M_fe_dec: 0,   // radioactive chain inventories, g
    L_em: 0,                 // electromagnetic luminosity, erg/s

    /* remnant-phase scalars */
    R_fwd: 0, R_rev: 0, R_cd: 0,    // forward shock, reverse shock, contact
    M_swept: 0,              // CSM mass swept by the forward shock, g
    T_ej: 0,                 // characteristic ejecta temperature

    /* asymmetry field: real spherical-harmonic coefficients, l = 1..4.
       Layout: [l1m-1, l1m0, l1m1, l2m-2 ... l4m4], 24 coefficients. */
    a: new Float32Array(24),
    aFrozen: false,          // set at shock revival — asymmetry imprints
    rtAmp: 0,                // Rayleigh-Taylor fine-structure amplitude
    kick: [0, 0, 0],         // neutron star kick direction * speed, cm/s

    seed: 20260826,          // PRNG seed for the SASI phases, shown in UI

    /* black-hole variant */
    bhFormed: false, M_bh: 0,
  };
}

/* Checkpointing for the timeline scrubber. Typed arrays are copied; scalars
   are spread. ~25 KB per checkpoint at N_SHELL = 256. */
export function cloneState(s) {
  const c = { ...s };
  for (const k of ['m', 'r', 'v', 'rho', 'T', 'ye', 'X', 'r0', 'a']) c[k] = s[k].slice();
  c.kick = [...s.kick];
  return c;
}

export function restoreState(dst, src) {
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (ArrayBuffer.isView(v)) dst[k].set(v);
    else if (Array.isArray(v)) dst[k] = [...v];
    else dst[k] = v;
  }
}
