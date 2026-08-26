/* ============================================================================
   camera.js — orbit + logarithmic-zoom camera rig, with free-flight mode
   ----------------------------------------------------------------------------
   ORBIT (default): focus point + azimuth/polar + log10(dist). The camera sits
   exactly 1 render unit from the focus; scroll walks the scale ladder.
   FLY: the camera itself is the anchor (focus = camera position). WASD+RF
   moves at speed ∝ 10^logD per second — scroll shifts your speed through the
   same 21 orders of magnitude. Mouse drag looks around. Fully seamless both
   ways: entering keeps your exact view; exiting orbits the point ahead.
   flyTo() animates focus + zoom together along a rise-and-fall zoom arc.
   Any user input during a locked (tour/voyage) flight calls onLockedInput so
   the app can hand control back instantly instead of eating the input.
   ========================================================================== */
import { clamp, lerp, smoothstep } from './scale.js';

export class Rig {
  constructor(dom) {
    this.dom = dom;
    this.mode = 'orbit';                // 'orbit' | 'fly'
    this.focus = [1.496e11, 0, 0];
    this.focusObj = null;
    this.theta = 0.6; this.phi = 1.25;
    this.logD = 7.6;
    this.tTheta = this.theta; this.tPhi = this.phi; this.tLogD = this.logD;
    this.minLogD = 6.2; this.maxLogD = 27.15;
    this.fly = null;
    this.onMove = null;
    this.onLockedInput = null;          // called when input hits a locked flight
    this.onModeChange = null;
    // free-flight state
    this.yaw = 0; this.pitch = 0; this.tYaw = 0; this.tPitch = 0;
    this.keys = { f: 0, b: 0, l: 0, r: 0, u: 0, d: 0, boost: 0, slow: 0 };
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
      const k = e.deltaMode === 1 ? 0.045 : 0.0014;
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
        if (this.mode === 'fly') {
          this.tYaw -= dx * 0.0042;
          this.tPitch = clamp(this.tPitch + dy * 0.0042, -1.55, 1.55);
        } else {
          this.tTheta -= dx * 0.0052;
          this.tPhi = clamp(this.tPhi - dy * 0.0052, 0.03, Math.PI - 0.03);
        }
        this._userMoved();
      } else if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch > 0)
          this.tLogD = clamp(this.tLogD - Math.log10(d / lastPinch) * 2.2,
                             this.minLogD, this.maxLogD);
        lastPinch = d;
        this._userMoved();
      }
    });
    const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) lastPinch = 0; };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    window.addEventListener('pointerup', up);       // never leave a pointer stuck
    window.addEventListener('blur', () => { ptrs.clear(); lastPinch = 0;
      Object.keys(this.keys).forEach(k => this.keys[k] = 0); });
  }

  _userMoved() {
    if (this.fly) {
      if (this.fly.locked) { this.onLockedInput && this.onLockedInput(); }
      this.fly = null;                  // input always hands control back
    }
    if (this.onMove) this.onMove();
  }

  // ------------------------------------------------------------ fly mode
  viewDir() {
    if (this.mode === 'fly') {
      const cp = Math.cos(this.pitch);
      return [cp * Math.sin(this.yaw), Math.sin(this.pitch), -cp * Math.cos(this.yaw)];
    }
    const v = this.camDir();
    return [-v[0], -v[1], -v[2]];
  }
  enterFly() {
    if (this.mode === 'fly') return;
    const pos = this.camPos();
    const v = this.viewDir();
    this.mode = 'fly';
    this.fly = null;
    this.focusObj = null;
    this.focus = pos;                                   // camera = anchor
    this.pitch = this.tPitch = Math.asin(clamp(v[1], -1, 1));
    this.yaw = this.tYaw = Math.atan2(v[0], -v[2]);
    this.onModeChange && this.onModeChange('fly');
  }
  exitFly() {
    if (this.mode !== 'fly') return;
    const v = this.viewDir();
    const d = this.dist;
    // orbit the point one scale-length ahead: the camera does not move
    this.focus = [this.focus[0] + v[0]*d, this.focus[1] + v[1]*d, this.focus[2] + v[2]*d];
    this.mode = 'orbit';
    this.phi = this.tPhi = Math.acos(clamp(-v[1], -1, 1));
    this.theta = this.tTheta = Math.atan2(-v[2], -v[0]);
    this.onModeChange && this.onModeChange('orbit');
  }
  toggleFly() { this.mode === 'fly' ? this.exitFly() : this.enterFly(); }

  // ------------------------------------------------------------- flights
  flyTo(target, logD, opts = {}) {
    if (this.mode === 'fly') this.exitFly();
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
      locked: !!opts.locked,
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
    if (this.mode === 'fly') {
      const s = 1 - Math.exp(-dt * 8);
      this.yaw += (this.tYaw - this.yaw) * s;
      this.pitch += (this.tPitch - this.pitch) * s;
      this.logD += (this.tLogD - this.logD) * (1 - Math.exp(-dt * 9));
      const k = this.keys;
      const sp = this.dist * 0.9 * (k.boost ? 7 : 1) * (k.slow ? 0.12 : 1);
      const v = this.viewDir();
      const upv = [0, 1, 0];
      const right = [v[2]*upv[1] - v[1]*upv[2], v[0]*upv[2] - v[2]*upv[0], v[1]*upv[0] - v[0]*upv[1]];
      const rl = Math.hypot(...right) || 1;
      const mvF = (k.f - k.b) * sp * dt, mvR = (k.r - k.l) * sp * dt, mvU = (k.u - k.d) * sp * dt;
      this.focus[0] += v[0]*mvF + (right[0]/rl)*(-mvR) + upv[0]*mvU;
      this.focus[1] += v[1]*mvF + (right[1]/rl)*(-mvR) + upv[1]*mvU;
      this.focus[2] += v[2]*mvF + (right[2]/rl)*(-mvR) + upv[2]*mvU;
      this.logD = clamp(this.logD, this.minLogD, this.maxLogD);
      return;
    }
    if (this.fly) {
      const f = this.fly;
      f.t = Math.min(f.t + dt / f.dur, 1);
      const t = f.t;
      const e = t * t * (3 - 2 * t);
      const up = smoothstep(0, 0.5, e), dn = smoothstep(0.5, 1, e);
      this.logD = f.from.logD + (f.peak - f.from.logD) * up
                              + (f.toLogD - f.peak) * dn;
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
      if (this.focusObj && this.focusObj.pos) this.focus = [...this.focusObj.pos()];
      const s = 1 - Math.exp(-dt * 7.5);
      this.theta += (this.tTheta - this.theta) * s;
      this.phi   += (this.tPhi   - this.phi)   * s;
      this.logD  += (this.tLogD  - this.logD)  * (1 - Math.exp(-dt * 9));
    }
    this.logD = clamp(this.logD, this.minLogD, this.maxLogD);
  }

  camDir() {
    const sp = Math.sin(this.phi);
    return [sp * Math.cos(this.theta), Math.cos(this.phi), sp * Math.sin(this.theta)];
  }
  /** Camera position in universe coordinates. */
  camPos() {
    if (this.mode === 'fly') return [...this.focus];
    const d = this.dist, v = this.camDir();
    return [this.focus[0] + v[0]*d, this.focus[1] + v[1]*d, this.focus[2] + v[2]*d];
  }
  /** Place the three.js camera in render space. */
  apply(camera) {
    if (this.mode === 'fly') {
      camera.position.set(0, 0, 0);
      const v = this.viewDir();
      camera.up.set(0, 1, 0);
      camera.lookAt(v[0], v[1], v[2]);
      camera.updateMatrixWorld();
      return;
    }
    const v = this.camDir();
    camera.position.set(v[0], v[1], v[2]);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  }
}
