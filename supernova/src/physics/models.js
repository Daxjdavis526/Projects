/* =============================================================================
   MODELS — progenitor parameter packs
   -----------------------------------------------------------------------------
   Every scenario the simulator can run is a set of numbers in this file plus an
   entry in the phase table. If a scenario ever needs its own code path outside
   here, the phase abstraction has been drawn wrong.

   Values are representative of published stellar-evolution models rather than
   any single calculation, and are quoted at the precision the visualisation
   actually uses. The assumptions modal says so in as many words.
   ========================================================================== */

import { M_SUN, R_SUN, YEAR } from '../config.js';

/* -----------------------------------------------------------------------------
   CCSN15 — the default. A 15 Msun zero-age main sequence star, now an evolved
   red supergiant with a degenerate iron core at the Chandrasekhar limit. This
   is the canonical Type IIP progenitor; SN 1987A's was similar in mass though
   compact and blue, and the Crab's was probably lighter.

   The shell masses matter more than they look. The Si/O interface at 1.8 Msun
   is a real density discontinuity, and when it accretes through the stalled
   shock at ~400 ms the ram pressure drops sharply — which is what lets the
   neutrino heating win and revive the shock. The explosion is triggered by a
   feature of the progenitor's structure, and that causal chain is worth having.
-------------------------------------------------------------------------------*/
export const CCSN15 = {
  id: 'ccsn15',
  name: 'Core collapse · 15 M☉ red supergiant',
  short: 'Core collapse',
  outcome: 'neutron-star',

  M_zams:  15.0 * M_SUN,
  M_star:  14.5 * M_SUN,       // after ~0.5 Msun of wind loss
  R_star:  600  * R_SUN,       // cm — extends past the orbit of Mars
  T_eff:   3500,               // K
  L_star:  5.0e4,              // Lsun

  /* Onion shells: outer mass coordinate of each burning region, in Msun.
     Boundaries are smoothstepped over dm — burning shells are extended, and
     hard edges in the cutaway would be a lie. */
  shells: [
    { el: 'Fe', m: 1.45, dm: 0.05, rho: 3.0e9, T: 8.0e9 },
    { el: 'Si', m: 1.80, dm: 0.08, rho: 1.5e7, T: 3.5e9 },
    { el: 'O',  m: 3.50, dm: 0.25, rho: 3.0e5, T: 2.0e9 },
    { el: 'Ne', m: 4.00, dm: 0.20, rho: 5.0e4, T: 1.4e9 },
    { el: 'C',  m: 4.50, dm: 0.25, rho: 1.0e4, T: 8.0e8 },
    { el: 'He', m: 5.50, dm: 0.40, rho: 2.0e2, T: 2.0e8 },
    { el: 'H',  m: 14.5, dm: 0.60, rho: 1.0e-6, T: 5.0e6 },
  ],

  M_fe:      1.45 * M_SUN,     // iron core — at the effective Chandrasekhar mass
  Ye_core:   0.43,
  rho_c0:    3.0e9,            // g/cm^3 at the onset of collapse
  T_c0:      8.0e9,            // K

  M_ic:      0.60 * M_SUN,     // homologous inner core at bounce
  R_pns_0:   30e5,             // cm — proto-neutron star at bounce
  R_pns_inf: 12e5,             // cm — cold neutron star
  tau_pns:   1.0,              // s, Kelvin-Helmholtz contraction

  E_expl:    1.0e51,           // erg of ejecta kinetic energy
  E_bind:    3.0e53,           // erg released as gravitational binding energy
  f_nu:      0.99,             // fraction of that carried off by neutrinos
  M_ni:      0.07 * M_SUN,     // Ni-56 synthesised
  M_remnant: 1.45 * M_SUN,     // baryonic mass of the remnant

  /* Mass loss: sets the dust you can see now AND the CSM the forward shock
     runs into in two thousand years. */
  Mdot:      1.0e-5 * M_SUN / YEAR,   // g/s
  v_wind:    15e5,                    // cm/s

  /* SASI growth rates per multipole, 1/s. l=1 fastest — this is why real
     core-collapse supernovae are dipolar rather than spherical. */
  sasi: { sigma: [0, 40, 30, 18, 11], omega_1: 2 * Math.PI / 0.040 },

  t_plateau: 100 * 86400,      // s — hydrogen recombination plateau
  L_plateau: 1.0e42,           // erg/s
  type:      'IIP',
};

/* -----------------------------------------------------------------------------
   CCSN40BH — a high-mass progenitor whose shock never revives. Accretion
   continues, the proto-neutron star crosses the maximum mass a neutron star can
   support, and it collapses to a black hole. The neutrino signal does not fade;
   it stops, abruptly, at the moment the horizon forms.
-------------------------------------------------------------------------------*/
export const CCSN40BH = {
  ...CCSN15,
  id: 'ccsn40bh',
  name: 'Core collapse · 40 M☉ · black hole',
  short: 'Black hole',
  outcome: 'black-hole',

  M_zams: 40.0 * M_SUN,
  M_star: 15.0 * M_SUN,        // heavy mass loss strips most of the envelope
  R_star: 30 * R_SUN,          // compact blue progenitor, not a supergiant
  T_eff:  20000,
  L_star: 5.0e5,

  M_fe:      2.10 * M_SUN,
  rho_c0:    5.0e9,
  M_ic:      0.75 * M_SUN,

  E_expl:    1.0e50,           // weak — most of the star falls back
  M_ni:      0.005 * M_SUN,
  M_remnant: 7.5 * M_SUN,
  t_bh:      2.0,              // s after bounce when M_pns crosses M_TOV
  Mdot:      1.0e-4 * M_SUN / YEAR,
  v_wind:    1000e5,           // fast, hot, Wolf-Rayet-like wind
  type:      'faint IIb / failed',
};

/* -----------------------------------------------------------------------------
   IA — a thermonuclear supernova. Physically a different event that happens to
   share a name: a carbon-oxygen white dwarf near the Chandrasekhar mass, no
   iron core, no collapse, no neutrino burst, no remnant at all. The star is
   entirely unbound. Roughly ten times the Ni-56 of a core collapse, which is
   why these are the ones visible across the universe.
-------------------------------------------------------------------------------*/
export const IA = {
  id: 'ia',
  name: 'Thermonuclear · Type Ia white dwarf',
  short: 'Type Ia',
  outcome: 'none',

  M_zams:  1.38 * M_SUN,
  M_star:  1.38 * M_SUN,       // at the Chandrasekhar mass
  R_star:  1.0e9,              // cm — about the size of the Earth
  T_eff:   12000,
  L_star:  1.0e-2,

  shells: [
    { el: 'O',  m: 0.60, dm: 0.10, rho: 2.0e9, T: 4.0e8 },
    { el: 'C',  m: 1.38, dm: 0.15, rho: 1.0e7, T: 1.0e8 },
  ],

  rho_c0:  2.0e9,
  T_c0:    4.0e8,

  /* Deflagration ignites near the centre, transitions to detonation, and
     unbinds the star in about two seconds. */
  t_deflag:  1.0,
  t_detonate:1.5,
  v_deflag:  100e5,            // cm/s — subsonic burning front
  v_detonate:1.1e9,            // cm/s — supersonic

  E_expl:    1.3e51,
  E_bind:    5.0e50,
  f_nu:      0.0,              // no core collapse, no neutrino burst
  M_ni:      0.60 * M_SUN,     // ~10x a core collapse — hence the brightness
  M_remnant: 0.0,              // nothing survives

  Mdot:   1.0e-8 * M_SUN / YEAR,
  v_wind: 20e5,
  sasi:   { sigma: [0, 6, 9, 7, 5], omega_1: 2 * Math.PI / 0.35 },
  type:   'Ia',
};

export const MODELS = { ccsn15: CCSN15, ccsn40bh: CCSN40BH, ia: IA };
export const DEFAULT_MODEL = 'ccsn15';
