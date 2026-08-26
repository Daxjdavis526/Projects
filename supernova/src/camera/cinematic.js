/* =============================================================================
   CINEMATIC — the documentary camera
   -----------------------------------------------------------------------------
   Drives the orbit rig through the story: wide on the dying star, a slow dive
   toward the core as the collapse begins, holding on the bounce and the
   sloshing shock, pulled back hard by the explosion, and settling into a
   grand slow orbit of the remnant.

   It writes rig.yaw / pitch / orbitDist / target each frame and never touches
   the camera directly, so the moment the user does anything — drag, scroll, a
   key — control is theirs, cleanly. That is the whole §38 contract: cinema
   until you move, yours the instant you do.
   ========================================================================== */

import { KM } from '../config.js';

export class Cinematic {
  constructor(rig, clock) {
    this.rig = rig;
    this.clock = clock;
    this.active = false;
    this._t = 0;

    /* any deliberate input hands the camera back */
    const stop = () => this.stop();
    addEventListener('mousedown', stop);
    addEventListener('wheel', stop, { passive: true });
    addEventListener('keydown', e => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(e.code)) stop();
    });
  }

  start() {
    this.active = true;
    this.rig.mode = 'orbit';
    document.getElementById('btn-cine')?.classList.add('on');
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    document.getElementById('btn-cine')?.classList.remove('on');
  }

  update(dt, snap) {
    if (!this.active) return;
    this._t += dt;
    const rig = this.rig;
    const R = snap.R_star * KM;
    const coreR = Math.max((snap.t >= 0 ? snap.R_pns : snap.R_core) * KM, 12);

    /* target distance and drift rate by phase */
    let dist, yawRate = 0.02, pitch = -0.10;
    switch (snap.phase) {
      case 'progenitor':
        dist = R * 4.6; yawRate = 0.035; pitch = -0.08; break;
      case 'collapse': {
        /* dive: log-interpolate from the star to the core as collapse runs */
        const f = Math.min(Math.max(snap.phaseT / 0.42, 0), 1);
        const s = f * f * (3 - 2 * f);
        dist = Math.exp((1 - s) * Math.log(R * 3.2) + s * Math.log(2400));
        yawRate = 0.05 + 0.30 * s; pitch = -0.10 - 0.1 * s;
        break;
      }
      case 'bounce':
        dist = 1500; yawRate = 0.42; pitch = -0.16; break;
      case 'stall':
        dist = 1150 + 250 * Math.sin(this._t * 0.11);
        yawRate = 0.26; pitch = -0.14 + 0.06 * Math.sin(this._t * 0.07);
        break;
      case 'explosion': {
        /* ride the blast out: stay a fixed multiple ahead of the shock */
        dist = Math.max(snap.R_shock * KM * 2.6, 1800);
        yawRate = 0.12; pitch = -0.12;
        break;
      }
      case 'deflagration': dist = R * 5.5; yawRate = 0.05; break;
      case 'detonation':   dist = Math.max(snap.R_shock * KM * 3.0, R * 4); yawRate = 0.08; break;
      default:
        /* light, fireball, tail, free, sedov: the grand tour */
        dist = R * 2.5; yawRate = 0.045; pitch = -0.13;
    }

    /* ease everything — cuts are for editors, this is one continuous shot */
    const k = 1 - Math.exp(-dt * 1.6);
    rig.orbitDist += (dist - rig.orbitDist) * k;
    rig.yaw += yawRate * dt;
    rig.pitch += (pitch - rig.pitch) * k * 0.5;
    rig.target.x = rig.target.y = rig.target.z = 0;
  }
}
