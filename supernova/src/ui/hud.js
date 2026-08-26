/* =============================================================================
   HUD — the data panel, phase readout, and energy bookkeeping
   -----------------------------------------------------------------------------
   Numbers only get written when they change enough to matter — writing to the
   DOM every frame for values the eye cannot distinguish is wasted layout work.

   The four energies are deliberately separate lines and never summed:
   gravitational binding energy released, neutrino losses, ejecta kinetic
   energy, electromagnetic output. Conflating them is the single most common
   error in popular supernova accounts, and keeping them visibly distinct is
   one of the most educational things this panel can do.
   ========================================================================== */

import * as fmt from './format.js';
import { KM, M_SUN } from '../config.js';

const PHASE_LABEL = {
  progenitor: 'RED SUPERGIANT — final minutes',
  collapse:   'IRON CORE COLLAPSE',
  bounce:     'CORE BOUNCE',
  stall:      'SHOCK STALL — SASI',
  explosion:  'EXPLOSION — SHOCK REVIVAL',
  light:      'SUPERNOVA — light curve',
  free:       'REMNANT — free expansion',
  sedov:      'REMNANT — Sedov-Taylor',
  deflagration: 'THERMONUCLEAR RUNAWAY',
  detonation: 'DETONATION',
  fireball:   'TYPE IA — fireball',
  tail:       'RADIOACTIVE TAIL',
};

export class Hud {
  constructor(model) {
    this.model = model;
    this.$ = id => document.getElementById(id);
    this._cache = {};
    this.el = {
      phase: this.$('p-phase'), time: this.$('p-time'), warp: this.$('p-warp'),
      body: this.$('panel-body'),
    };
  }

  /* Write only when the formatted string changed. */
  _set(id, text) {
    if (this._cache[id] === text) return;
    this._cache[id] = text;
    const el = this.$(id);
    if (el) el.textContent = text;
  }

  update(snap, clock) {
    const label = snap.bhFormed
      ? (snap.t < 86400 ? 'FALLBACK — no revival' : 'THE STAR GOES DARK')
      : (PHASE_LABEL[snap.phase] ?? snap.phase);
    this._set('p-phase', label);
    this._set('p-time', (snap.t < 0 ? 'T−' : 'T+') + fmt.time(Math.abs(snap.t)).replace('−', ''));
    this._set('p-warp', clock.playing ? fmt.warpFactor(Math.abs(clock.dtdwall)) : 'paused');

    const post = snap.t > 0;
    this._set('d-rstar', fmt.dist(snap.R_star * KM));
    this._set('d-teff', Math.round(snap.T_eff).toLocaleString() + ' K');
    this._set('d-rcore', snap.phase === 'progenitor' || snap.phase === 'collapse'
      ? fmt.dist(snap.R_core * KM) : (snap.R_pns > 0 ? fmt.dist(snap.R_pns * KM) : '—'));
    this._set('d-rhoc', fmt.sci(snap.rho_c, 2) + ' g/cm³');
    this._set('d-tc', fmt.sci(snap.T_c, 2) + ' K');
    this._set('d-shock', snap.R_shock > 0 ? fmt.dist(snap.R_shock * KM) : '—');
    this._set('d-vshock', snap.R_shock > 0 ? fmt.speed(snap.v_shock * KM) : '—');
    this._set('d-lnu', snap.L_nu > 1e40 ? fmt.energy(snap.L_nu) + '/s' : '—');
    this._set('d-lem', fmt.energy(snap.L_em) + '/s');
    this._set('d-mni', snap.M_ni > 0 ? (snap.M_ni / M_SUN).toFixed(3) + ' M☉' : '—');

    /* the four energies, never summed */
    this._set('e-bind', fmt.energy(snap.E_nu > 0 ? snap.E_nu / 0.99 : 0));
    this._set('e-nu', fmt.energy(snap.E_nu));
    this._set('e-kin', fmt.energy(snap.E_expl));
    this._set('e-em', snap.L_em > 0 && post ? fmt.energy(snap.E_expl * 0.01) : '—');

    const rem = this.$('d-remnant');
    if (rem) {
      let label = '—';
      if (snap.bhFormed) label = `black hole · ${(snap.M_bh / M_SUN).toFixed(1)} M☉`;
      else if (snap.M_pns > 0 && post) label = `neutron star · ${(snap.M_pns / M_SUN).toFixed(2)} M☉`;
      this._set('d-remnant', label);
    }
  }
}
