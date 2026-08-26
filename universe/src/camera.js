/* ============================================================================
   camera.js — orbit + logarithmic-zoom camera rig
   ----------------------------------------------------------------------------
   The rig owns:  focus (universe coords, doubles) · azimuth/polar · log10(dist)
   Rendering happens in a frame where focus = origin and 1 unit = camera
   distance, so the camera always sits exactly 1 unit from the focus.
   flyTo() animates focus + zoom together along a rise-and-fall zoom arc, which
   turns any jump (Earth → Andromeda) into one continuous pull-back-and-dive.
   ========================================================================== */
import { clamp, lerp, smoothstep } from './scale.js';

const TAU = Math.PI * 2;

export class Rig {
  constructor(dom) {
    this.dom = dom;
    this.focus = [1.496e11, 0, 0];      // placeholder; main sets Earth
    this.focusObj = null;               // registry object the focus tracks
    this.theta = 0.6; this.phi = 1.25;  // view angles
    this.logD = 7.6;                    // log10 meters from focus
    this.tTheta = this.theta; this.tPhi = this.phi; this.tLogD = this.logD;
    this.minLogD = 6.2; this.maxLogD = 27.15;
    this.fly = null;                    // active flight animation
    this.onMove = null;                 // user-interaction callback
    this._bind();
  }

  get dist() { return 10 ** this.logD; }

  // ---------------------------------------------------------------- input
  _bind() {
    const el = this.dom;
    const ptrs = new Map();
    let lastPinch = 0;

    el.addEventListener('wheel', e => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 0.045 : 0.0014;   // lines vs pixels
      this.tLogD = clamp(this.tLogD + e.deltaY * k, this.minLogD, this.maxLogD);
      this._userMoved();
    }, { passive: false });

    el.addEventListener('pointerdown', e => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      el.setPointerCapture(e.pointerId);
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        lastPinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    });
    el.addEventListener('pointermove', e => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (ptrs.size === 1) {
        this.tTheta -= dx * 0.0052;
        this.tPhi = clamp(this.tPhi - dy * 0.0052, 0.03, Math.PI - 0.03);
        this._userMoved();
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch > 0) {
          this.tLogD = clamp(this.tLogD - Math.log10(d / lastPinch) * 2.2,
                             this.minLogD, this.maxLogD);
        }
        lastPinch = d;
        this._userMoved();
      }
    });
    const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) lastPinch = 0; };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  _userMoved() {
    if (this.fly && !this.fly.locked) this.fly = null;  // user interrupts flight
    if (this.onMove) this.onMove();
  }

  // ------------------------------------------------------------- flights
  /** Fly to an object (or {pos:[x,y,z]}) at the given log-distance. */
  flyTo(target, logD, opts = {}) {
    const toPos = () => target.pos ? target.pos() : this.focus;
    const from = { focus: [...this.focus], logD: this.logD,
                   theta: this.theta, phi: this.phi };
    const p0 = from.focus, p1 = toPos();
    const gap = Math.hypot(p1[0]-p0[0], p1[1]-p0[1], p1[2]-p0[2]);
    const peak = Math.max(from.logD, logD,
                          gap > 1 ? Math.log10(gap) + 0.25 : 0);
    const travel = Math.abs(peak - from.logD) + Math.abs(peak - logD);
    const dur = opts.dur ?? clamp(1.6 + travel * 0.42, 2.0, 13);
    this.fly = {
      t: 0, dur, from, toPos, toLogD: logD, peak,
      toTheta: opts.theta ?? this.tTheta,
      toPhi: opts.phi ?? this.tPhi,
      locked: !!opts.locked,           // tour flights ignore small user input
      done: opts.done ?? null,
    };
    this.focusObj = target.pos ? target : null;
  }

  jumpTo(target, logD) {
    this.focusObj = target.pos ? target : null;
    if (target.pos) this.focus = [...target.pos()];
    this.logD = this.tLogD = clamp(logD, this.minLogD, this.maxLogD);
  }

  // -------------------------------------------------------------- update
  update(dt) {
    if (this.fly) {
      const f = this.fly;
      f.t = Math.min(f.t + dt / f.dur, 1);
      const t = f.t;
      const e = t * t * (3 - 2 * t);                    // ease whole flight
      // zoom arc: rise to peak, fall to target
      const up = smoothstep(0, 0.5, e), dn = smoothstep(0.5, 1, e);
      this.logD = f.from.logD + (f.peak - f.from.logD) * up
                              + (f.toLogD - f.peak) * dn;
      // move focus mostly while high up
      const w = smoothstep(0.22, 0.78, e);
      const p1 = f.toPos();
      this.focus = [
        lerp(f.from.focus[0], p1[0], w),
        lerp(f.from.focus[1], p1[1], w),
        lerp(f.from.focus[2], p1[2], w),
      ];
      this.theta = this.tTheta = lerp(f.from.theta, f.toTheta, e);
      this.phi = this.tPhi = clamp(lerp(f.from.phi, f.toPhi, e), 0.03, Math.PI - 0.03);
      this.tLogD = this.logD;
      if (t >= 1) { const cb = f.done; this.fly = null; cb && cb(); }
    } else {
      // track a moving focus object (planets drift)
      if (this.focusObj && this.focusObj.pos) this.focus = [...this.focusObj.pos()];
      const s = 1 - Math.exp(-dt * 7.5);
      this.theta += (this.tTheta - this.theta) * s;
      this.phi   += (this.tPhi   - this.phi)   * s;
      this.logD  += (this.tLogD  - this.logD)  * (1 - Math.exp(-dt * 9));
    }
    this.logD = clamp(this.logD, this.minLogD, this.maxLogD);
  }

  /** Unit direction from focus toward camera (render frame). */
  camDir() {
    const sp = Math.sin(this.phi);
    return [sp * Math.cos(this.theta), Math.cos(this.phi), sp * Math.sin(this.theta)];
  }
  /** Camera position in universe coordinates (doubles). */
  camPos() {
    const d = this.dist, v = this.camDir();
    return [this.focus[0] + v[0]*d, this.focus[1] + v[1]*d, this.focus[2] + v[2]*d];
  }
  /** Place the three.js camera: 1 render unit from origin. */
  apply(camera) {
    const v = this.camDir();
    camera.position.set(v[0], v[1], v[2]);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  }
}
