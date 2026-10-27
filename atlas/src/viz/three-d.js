// A small software 3D renderer for mathematical surfaces on a 2D canvas:
// an orbiting camera (drag to rotate, wheel or pinch to zoom), perspective
// projection, depth-sorted shaded quads with a wireframe, plus 3D lines,
// points and arrows. Enough for rotatable surfaces, tangent planes, curves
// on surfaces and vectors, with no WebGL dependency.

import { themeColors } from './plot.js';

export class View3D {
  constructor(canvas, o = {}) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.yaw = o.yaw ?? -0.75;
    this.pitch = o.pitch ?? 0.5;
    this.dist = o.dist ?? 9;
    this.target = o.target || [0, 0, 0];
    this.scale = o.scale ?? 1;
    this.items = [];
    this.onChange = null;
    this._wire();
  }
  resize() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = this.c.clientWidth || 600, h = this.c.clientHeight || 400;
    if (this.c.width !== Math.round(w * dpr)) { this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr); }
    this.w = w; this.h = h;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.col = themeColors();
  }
  /** camera basis from yaw/pitch (z is up) */
  basis() {
    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const fwd = [-cp * cy, -cp * sy, -sp];              // from camera toward target
    const right = [-sy, cy, 0];
    const up = [right[1] * fwd[2] - right[2] * fwd[1], right[2] * fwd[0] - right[0] * fwd[2], right[0] * fwd[1] - right[1] * fwd[0]];
    const eye = [this.target[0] - fwd[0] * this.dist, this.target[1] - fwd[1] * this.dist, this.target[2] - fwd[2] * this.dist];
    return { fwd, right, up, eye };
  }
  /** world point → [sx, sy, depth] */
  project(p, B = this._B) {
    const d = [p[0] - B.eye[0], p[1] - B.eye[1], p[2] - B.eye[2]];
    const z = d[0] * B.fwd[0] + d[1] * B.fwd[1] + d[2] * B.fwd[2];
    const x = d[0] * B.right[0] + d[1] * B.right[1] + d[2] * B.right[2];
    const y = d[0] * B.up[0] + d[1] * B.up[1] + d[2] * B.up[2];
    const f = (Math.min(this.w, this.h) * 1.1 * this.scale) / Math.max(0.1, z);
    return [this.w / 2 + x * f, this.h / 2 - y * f, z];
  }
  begin() { this.resize(); this._B = this.basis(); this.items = []; this.ctx.clearRect(0, 0, this.w, this.h); }

  /**
   * Add a surface from a grid of points P[i][j] = [x, y, z] (NaN to skip).
   * o: { color, alpha, wire, colorBy: (p) => 0..1, light }
   */
  surface(P, o = {}) {
    const n = P.length - 1, m = P[0].length - 1;
    const L = norm(o.light || [0.4, -0.5, 0.8]);
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const q = [P[i][j], P[i + 1][j], P[i + 1][j + 1], P[i][j + 1]];
      if (q.some((p) => !p || p.some((v) => !Number.isFinite(v)))) continue;
      const nrm = norm(cross(sub(q[2], q[0]), sub(q[3], q[1])));
      const shade = 0.35 + 0.65 * Math.abs(dot(nrm, L));
      const pr = q.map((p) => this.project(p));
      if (pr.some((p) => p[2] <= 0.05)) continue;
      const depth = (pr[0][2] + pr[1][2] + pr[2][2] + pr[3][2]) / 4;
      const t = o.colorBy ? o.colorBy(q[0], q[2]) : null;
      this.items.push({ kind: 'quad', pr, depth, shade, t, o });
    }
  }
  line(pts, o = {}) {
    for (let k = 0; k < pts.length - 1; k++) {
      const a = this.project(pts[k]), b = this.project(pts[k + 1]);
      if (a[2] <= 0.05 || b[2] <= 0.05) continue;
      this.items.push({ kind: 'seg', a, b, depth: (a[2] + b[2]) / 2 - (o.bias ?? 0.02), o });
    }
  }
  point(p, o = {}) { const a = this.project(p); if (a[2] > 0.05) this.items.push({ kind: 'pt', a, depth: a[2] - (o.bias ?? 0.05), o }); }
  arrow(from, to, o = {}) {
    this.line([from, to], { ...o, bias: o.bias ?? 0.05 });
    const a = this.project(from), b = this.project(to);
    if (a[2] > 0.05 && b[2] > 0.05) this.items.push({ kind: 'head', a, b, depth: b[2] - 0.06, o });
  }
  label(p, text, o = {}) { const a = this.project(p); if (a[2] > 0.05) this.items.push({ kind: 'txt', a, text, depth: a[2] - 1, o }); }

  /** Axes from the origin with labels. */
  axes(len = 3, labels = ['x', 'y', 'z']) {
    const c = 'ink3';
    this.arrow([0, 0, 0], [len, 0, 0], { color: c, width: 1.2 }); this.label([len * 1.08, 0, 0], labels[0], { color: c });
    this.arrow([0, 0, 0], [0, len, 0], { color: c, width: 1.2 }); this.label([0, len * 1.08, 0], labels[1], { color: c });
    this.arrow([0, 0, 0], [0, 0, len], { color: c, width: 1.2 }); this.label([0, 0, len * 1.08], labels[2], { color: c });
  }

  end() {
    const g = this.ctx, C = this.col;
    this.items.sort((a, b) => b.depth - a.depth);
    for (const it of this.items) {
      if (it.kind === 'quad') {
        const base = it.t !== null ? ramp(it.t) : hexToRgb(colorOf(C, it.o.color || 'accent'));
        const s = it.shade;
        g.fillStyle = `rgba(${Math.round(base[0] * s)},${Math.round(base[1] * s)},${Math.round(base[2] * s)},${it.o.alpha ?? 0.92})`;
        g.beginPath(); it.pr.forEach((p, k) => (k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill();
        if (it.o.wire !== false) { g.strokeStyle = `rgba(255,255,255,${it.o.wireAlpha ?? 0.09})`; g.lineWidth = 0.6; g.stroke(); }
      } else if (it.kind === 'seg') {
        g.strokeStyle = colorOf(C, it.o.color || 'ink'); g.lineWidth = it.o.width || 2; g.lineCap = 'round';
        g.setLineDash(it.o.dash || []);
        g.beginPath(); g.moveTo(it.a[0], it.a[1]); g.lineTo(it.b[0], it.b[1]); g.stroke();
        g.setLineDash([]);
      } else if (it.kind === 'pt') {
        g.fillStyle = colorOf(C, it.o.color || 'gold');
        g.beginPath(); g.arc(it.a[0], it.a[1], it.o.r || 4.5, 0, Math.PI * 2); g.fill();
      } else if (it.kind === 'head') {
        const dx = it.b[0] - it.a[0], dy = it.b[1] - it.a[1], L = Math.hypot(dx, dy);
        if (L < 2) continue;
        const ux = dx / L, uy = dy / L, hd = Math.min(10, L * 0.4);
        g.fillStyle = colorOf(C, it.o.color || 'ink');
        g.beginPath(); g.moveTo(it.b[0], it.b[1]); g.lineTo(it.b[0] - ux * hd - uy * hd * 0.45, it.b[1] - uy * hd + ux * hd * 0.45); g.lineTo(it.b[0] - ux * hd + uy * hd * 0.45, it.b[1] - uy * hd - ux * hd * 0.45); g.closePath(); g.fill();
      } else if (it.kind === 'txt') {
        g.font = `600 ${it.o.size || 12}px Inter, sans-serif`; g.fillStyle = colorOf(C, it.o.color || 'ink'); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(it.text, it.a[0], it.a[1]);
      }
    }
  }

  _wire() {
    const c = this.c;
    c.style.touchAction = 'none';
    let drag = null;
    const pts = new Map();
    c.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, [e.clientX, e.clientY]); drag = { x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch }; c.setPointerCapture(e.pointerId); c.style.cursor = 'grabbing'; });
    c.addEventListener('pointermove', (e) => {
      if (!drag) return;
      if (pts.size === 2) {
        const prev = [...pts.values()];
        pts.set(e.pointerId, [e.clientX, e.clientY]);
        const now = [...pts.values()];
        const d0 = Math.hypot(prev[0][0] - prev[1][0], prev[0][1] - prev[1][1]), d1 = Math.hypot(now[0][0] - now[1][0], now[0][1] - now[1][1]);
        if (d0 > 0) this.dist = Math.max(2, Math.min(40, this.dist * d0 / d1));
      } else {
        this.yaw = drag.yaw - (e.clientX - drag.x) * 0.008;
        this.pitch = Math.max(-1.45, Math.min(1.45, drag.pitch + (e.clientY - drag.y) * 0.008));
      }
      this.onChange?.();
    });
    const up = (e) => { pts.delete(e.pointerId); if (!pts.size) { drag = null; c.style.cursor = 'grab'; } };
    c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    c.addEventListener('wheel', (e) => { e.preventDefault(); this.dist = Math.max(2, Math.min(40, this.dist * (e.deltaY > 0 ? 1.08 : 1 / 1.08))); this.onChange?.(); }, { passive: false });
    c.tabIndex = 0;
    c.addEventListener('keydown', (e) => {
      const k = { ArrowLeft: [0.08, 0], ArrowRight: [-0.08, 0], ArrowUp: [0, 0.08], ArrowDown: [0, -0.08] }[e.key];
      if (!k) return;
      e.preventDefault(); this.yaw += k[0]; this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch + k[1])); this.onChange?.();
    });
    c.style.cursor = 'grab';
  }
}

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

function colorOf(C, name) { return C[name] || name; }
function hexToRgb(c) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(c.trim());
  if (m) return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  const r = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
  return r ? [+r[1], +r[2], +r[3]] : [92, 157, 255];
}
// a perceptual-ish blue → teal → gold ramp for height colouring
function ramp(t) {
  t = Math.max(0, Math.min(1, t));
  const stops = [[38, 70, 160], [60, 140, 230], [51, 196, 180], [242, 193, 78]];
  const x = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
  return stops[i].map((v, k) => v + (stops[i + 1][k] - v) * f);
}
