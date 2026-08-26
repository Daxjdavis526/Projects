/* =============================================================================
   ENGINE — the one interface the rest of the app sees
   -----------------------------------------------------------------------------
     engine.stepTo(t)    advance (or seek) the physics to simulation time t
     engine.snapshot()   plain-object view of everything renderable
     engine.reset()      back to the progenitor

   Internally the simulation is a sequence of PHASES. Each phase has:
     enter(st, model)          one-time transition work
     step(st, model, t0, t1)   advance from t0 to t1 (may substep internally)

   Phase steps are written to be STABLE UNDER LARGE dt: closed-form where
   possible, semi-implicit relaxation where not. That is what makes the scrub
   bar safe — seeking 500 years forward in one frame must not explode anything.

   Backward seeks restore the nearest earlier checkpoint and fast-forward.
   Checkpoints are laid down automatically at phase entries and at fixed
   intervals of the narrative coordinate.
   ========================================================================== */

import { createState, cloneState, restoreState } from './state.js';
import { buildProgenitor } from './progenitor.js';
import { PHASES } from './phases.js';
import { N_SHELL } from '../config.js';

export class Engine {
  constructor(model, clock) {
    this.model = model;
    this.clock = clock;
    this.state = createState();
    this.reset();
  }

  reset() {
    buildProgenitor(this.state, this.model);
    this.state.t = this.clock.tMin;
    this._checkpoints = [{ u: 0, snap: cloneState(this.state) }];
    this._lastCkptU = 0;
  }

  /* --- main entry -------------------------------------------------------- */
  stepTo(tTarget) {
    const st = this.state;
    if (tTarget < st.t - 1e-12) this._seekBack(tTarget);
    if (tTarget <= st.t) return;

    /* March forward segment by segment so phase transitions land exactly. */
    let guard = 0;
    while (st.t < tTarget - 1e-12 && guard++ < 64) {
      const seg = this.clock.segments.find(x => st.t < x.t1 - 1e-12)
                ?? this.clock.segments.at(-1);
      const phase = PHASES[seg.phase];
      if (st.phase !== seg.phase) {
        st.phase = seg.phase; st.phaseT = 0;
        phase.enter?.(st, this.model);
        this._checkpoint();
      }
      const tEnd = Math.min(tTarget, seg.t1);
      phase.step(st, this.model, st.t, tEnd);
      st.phaseT += tEnd - st.t;
      st.t = tEnd;
    }

    /* Periodic checkpoints for cheap backward scrubbing. */
    const u = this.clock.uOfT(st.t);
    if (u - this._lastCkptU > 0.02) this._checkpoint(u);
  }

  _checkpoint(u = this.clock.uOfT(this.state.t)) {
    this._checkpoints.push({ u, snap: cloneState(this.state) });
    this._lastCkptU = u;
    if (this._checkpoints.length > 60) this._checkpoints.splice(1, 1);
  }

  _seekBack(tTarget) {
    const u = this.clock.uOfT(tTarget);
    let best = this._checkpoints[0];
    for (const c of this._checkpoints) if (c.u <= u + 1e-9 && c.u >= best.u) best = c;
    restoreState(this.state, best.snap);
    /* Drop checkpoints that are now in the future. */
    this._checkpoints = this._checkpoints.filter(c => c.u <= u + 1e-9);
    if (!this._checkpoints.length) this._checkpoints = [{ u: best.u, snap: best.snap }];
    this._lastCkptU = this._checkpoints.at(-1).u;
  }

  /* --- renderer-facing view ---------------------------------------------- */
  snapshot() {
    const st = this.state;
    return {
      t: st.t, phase: st.phase,
      /* references, not copies — profiles.js consumes them read-only */
      m: st.m, r: st.r, v: st.v, rho: st.rho, T: st.T, X: st.X,
      a: st.a, rtAmp: st.rtAmp, kick: st.kick,
      n: N_SHELL,

      rho_c: st.rho_c, T_c: st.T_c, Ye_c: st.Ye_c,
      R_star: st.R_star, T_eff: st.T_eff, R_core: st.R_core,
      R_pns: st.R_pns, M_pns: st.M_pns,
      R_shock: st.R_shock, v_shock: st.v_shock,
      R_nu: st.R_nu, L_nu: st.L_nu, E_nu: st.E_nu,
      E_expl: st.E_expl, M_dot_acc: st.M_dot_acc,
      M_ni: st.M_ni, M_co: st.M_co, L_em: st.L_em,
      R_fwd: st.R_fwd, R_rev: st.R_rev, R_cd: st.R_cd, M_swept: st.M_swept,
      bhFormed: st.bhFormed, M_bh: st.M_bh,
      aFrozen: st.aFrozen, seed: st.seed,
    };
  }
}
