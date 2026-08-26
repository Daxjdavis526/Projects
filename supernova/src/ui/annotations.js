/* =============================================================================
   ANNOTATIONS — one-line science captions that fire as events happen
   -----------------------------------------------------------------------------
   Each note fires once per run when its condition first becomes true, in
   order. Rewinding past a note re-arms it. Kept terse on purpose: the point
   is orientation, not a lecture.
   ========================================================================== */

const NOTES = [
  { id: 'ignite',   when: s => s.phase === 'collapse',
    text: 'Iron cannot burn — the core has no energy source left. Electron degeneracy fails; collapse begins.' },
  { id: 'trap',     when: s => s.phase === 'collapse' && s.rho_c > 2e12,
    text: 'Neutrino trapping: the core is now so dense even neutrinos cannot escape it.' },
  { id: 'bounce',   when: s => s.t > 0,
    text: 'Nuclear density. The core stiffens and rebounds — the bounce launches the shock.' },
  { id: 'burst',    when: s => s.t > 0 && s.L_nu > 1e53,
    text: 'The neutrino burst: ~10⁵³ erg/s, briefly outshining the light of every star in the observable universe combined.' },
  { id: 'stall',    when: s => s.phase === 'stall' && s.phaseT > 0.02,
    text: 'The shock stalls near 150 km, bleeding energy into iron dissociation — 8.8 MeV per nucleon.' },
  { id: 'sasi',     when: s => s.phase === 'stall' && s.phaseT > 0.1,
    text: 'The stalled shock sloshes — the standing accretion shock instability. The l=1 mode grows fastest; the explosion will be lopsided.' },
  { id: 'revive',   when: s => s.phase === 'explosion',
    text: 'The Si/O interface falls through: accretion drops, neutrino heating wins. The shock revives.' },
  { id: 'nickel',   when: s => s.M_ni > 0.03 * 1.989e33,
    text: 'Explosive nucleosynthesis: the shock forges ~0.07 M☉ of radioactive ⁵⁶Ni in the silicon shell.' },
  { id: 'breakout', when: s => s.phase === 'explosion' && s.R_shock >= s.R_star * 0.99,
    text: 'Shock breakout — after a day climbing through the envelope, the blast reaches the surface. First light.' },
  { id: 'plateau',  when: s => s.phase === 'light' && s.t > 20 * 86400,
    text: 'The plateau: hydrogen recombination holds the brightness roughly constant for ~100 days.' },
  { id: 'tail',     when: s => s.phase === 'light' && s.t > 150 * 86400,
    text: 'The radioactive tail: ⁵⁶Ni → ⁵⁶Co → ⁵⁶Fe now powers the light — fading 0.0098 magnitudes per day.' },
  { id: 'freeexp',  when: s => s.phase === 'free',
    text: 'Free expansion: the ejecta coast, sweeping up the wind the star shed while it lived.' },
  { id: 'reverse',  when: s => s.R_rev > 0 && s.R_rev < s.R_fwd * 0.9,
    text: 'The reverse shock forms and drives inward, reheating the ejecta — the remnant begins to glow from inside.' },
  { id: 'sedov',    when: s => s.phase === 'sedov',
    text: 'Swept-up mass now exceeds the ejecta: the remnant forgets its origins. R ∝ t²ᐟ³ in the wind-blown medium.' },
  { id: 'kick',     when: s => s.phase === 'sedov' && s.t > 600 * 3.156e7,
    text: 'The neutron star drifts off-centre — kicked at hundreds of km/s, recoil from its own lopsided explosion.' },
  { id: 'bh',       when: s => s.bhFormed,
    text: 'The proto-neutron star exceeds its maximum mass. Collapse to a black hole — the neutrino signal simply stops.' },
  { id: 'runaway',  when: s => s.phase === 'deflagration',
    text: 'Thermonuclear runaway: degenerate carbon ignites. There is no thermostat — the white dwarf will not survive.' },
  { id: 'detonate', when: s => s.phase === 'detonation',
    text: 'Detonation. The burning front goes supersonic; the star is unbound in seconds. No remnant will remain.' },
];

export class Annotations {
  constructor() {
    this.el = document.getElementById('annotation');
    this.fired = new Set();
    this._queue = [];
    this._showing = null;
    this._timer = 0;
    this._lastT = -Infinity;
  }

  update(snap, dt, enabled = true) {
    /* rewind re-arms everything after the new time */
    if (snap.t < this._lastT - 1) { this.fired.clear(); this._queue.length = 0; }
    this._lastT = snap.t;
    if (!enabled) { this.el.classList.remove('show'); return; }

    for (const n of NOTES) {
      if (!this.fired.has(n.id) && n.when(snap)) {
        this.fired.add(n.id);
        this._queue.push(n.text);
      }
    }

    if (this._showing === null && this._queue.length) {
      this._showing = this._queue.shift();
      this.el.textContent = this._showing;
      this.el.classList.add('show');
      this._timer = Math.max(6, this._showing.length * 0.055);
    }
    if (this._showing !== null) {
      this._timer -= dt;
      if (this._timer <= 0) {
        this.el.classList.remove('show');
        this._showing = null;
      }
    }
  }
}
