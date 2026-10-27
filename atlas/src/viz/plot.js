// A 2D plotting surface on a canvas: world ↔ screen transforms, a grid and
// labelled axes, functions sampled adaptively (with gaps at discontinuities),
// parametric and polar curves, points, arrows, filled regions and labels, plus
// draggable handles. Colours come from the page's CSS variables at draw time,
// so every plot follows the dark and light themes.

export function themeColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n, f) => (cs.getPropertyValue(n).trim() || f);
  return {
    ink: v('--ink', '#e7edf7'), ink2: v('--ink-2', '#aab6ca'), ink3: v('--ink-3', '#71809a'), ink4: v('--ink-4', '#4b5873'),
    line: v('--line', 'rgba(150,172,214,.13)'), line2: v('--line-2', 'rgba(150,172,214,.24)'), line3: v('--line-3', 'rgba(150,172,214,.38)'),
    bg: v('--bg-2', '#0a0f1c'), panel: v('--panel', '#0e1526'),
    accent: v('--accent', '#5c9dff'), accent2: v('--accent-2', '#8cbaff'), good: v('--good', '#38d39f'),
    warn: v('--warn', '#f3b74f'), bad: v('--bad', '#ff6b7d'), violet: v('--violet', '#b38cff'), gold: v('--gold', '#f2c14e'), teal: v('--teal', '#33c4b4'),
  };
}

export const PALETTE = ['accent', 'warn', 'good', 'violet', 'bad', 'teal', 'gold'];

export class Plot {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} o { x: [min, max], y: [min, max], equal: bool, pad: {l,r,t,b}, xlabel, ylabel, grid: true }
   */
  constructor(canvas, o = {}) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.o = { grid: true, axes: true, pad: { l: 46, r: 16, t: 14, b: 34 }, ...o };
    this.setView(o.x || [-5, 5], o.y || [-5, 5]);
    this.handles = [];
    this.resize();
  }
  setView(x, y) { this.x0 = x[0]; this.x1 = x[1]; this.y0 = y[0]; this.y1 = y[1]; this._fit(); }
  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = this.c.clientWidth || 600, h = this.c.clientHeight || 375;
    if (this.c.width !== Math.round(w * dpr) || this.c.height !== Math.round(h * dpr)) {
      this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
    }
    this.w = w; this.h = h; this.dpr = dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._fit();
  }
  _fit() {
    if (!this.w) return;
    const p = this.o.pad;
    this.L = p.l; this.R = this.w - p.r; this.T = p.t; this.B = this.h - p.b;
    if (this.o.equal) {
      // expand the shorter range so one unit is the same length on both axes
      const sx = (this.R - this.L) / (this.x1 - this.x0), sy = (this.B - this.T) / (this.y1 - this.y0);
      if (sx > sy) { const cx = (this.x0 + this.x1) / 2, half = (this.R - this.L) / sy / 2; this.vx0 = cx - half; this.vx1 = cx + half; this.vy0 = this.y0; this.vy1 = this.y1; }
      else { const cy = (this.y0 + this.y1) / 2, half = (this.B - this.T) / sx / 2; this.vy0 = cy - half; this.vy1 = cy + half; this.vx0 = this.x0; this.vx1 = this.x1; }
    } else { this.vx0 = this.x0; this.vx1 = this.x1; this.vy0 = this.y0; this.vy1 = this.y1; }
  }
  X(x) { return this.L + ((x - this.vx0) / (this.vx1 - this.vx0)) * (this.R - this.L); }
  Y(y) { return this.B - ((y - this.vy0) / (this.vy1 - this.vy0)) * (this.B - this.T); }
  ix(px) { return this.vx0 + ((px - this.L) / (this.R - this.L)) * (this.vx1 - this.vx0); }
  iy(py) { return this.vy0 + ((this.B - py) / (this.B - this.T)) * (this.vy1 - this.vy0); }
  get col() { return (this._col ??= themeColors()); }
  refreshTheme() { this._col = themeColors(); }

  clear() {
    this.resize();
    this.refreshTheme();
    this.ctx.clearRect(0, 0, this.w, this.h);
    if (this.o.grid) this.grid();
    if (this.o.axes) this.axes();
    return this;
  }

  static ticks(a, b, target = 7) {
    const span = b - a;
    if (!(span > 0)) return [];
    const raw = span / target;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= target + 1) || 10 * mag;
    const out = [];
    for (let t = Math.ceil(a / step) * step; t <= b + 1e-9 * span; t += step) out.push(+t.toFixed(10));
    return out;
  }

  grid() {
    const g = this.ctx, c = this.col;
    g.save();
    g.lineWidth = 1;
    g.strokeStyle = c.line;
    for (const t of Plot.ticks(this.vx0, this.vx1, this.o.xticks || 8)) { const x = Math.round(this.X(t)) + 0.5; g.beginPath(); g.moveTo(x, this.T); g.lineTo(x, this.B); g.stroke(); }
    for (const t of Plot.ticks(this.vy0, this.vy1, this.o.yticks || 6)) { const y = Math.round(this.Y(t)) + 0.5; g.beginPath(); g.moveTo(this.L, y); g.lineTo(this.R, y); g.stroke(); }
    g.restore();
  }

  axes() {
    const g = this.ctx, c = this.col;
    g.save();
    g.strokeStyle = c.line3; g.lineWidth = 1.2; g.fillStyle = c.ink3;
    g.font = '11px Inter, system-ui, sans-serif';
    const y0 = this.vy0 <= 0 && this.vy1 >= 0 ? this.Y(0) : this.B;
    const x0 = this.vx0 <= 0 && this.vx1 >= 0 ? this.X(0) : this.L;
    g.beginPath(); g.moveTo(this.L, Math.round(y0) + 0.5); g.lineTo(this.R, Math.round(y0) + 0.5); g.stroke();
    g.beginPath(); g.moveTo(Math.round(x0) + 0.5, this.T); g.lineTo(Math.round(x0) + 0.5, this.B); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'top';
    const fmt = this.o.tickFormat || ((t) => (Math.abs(t) >= 1e4 || (Math.abs(t) < 1e-3 && t !== 0) ? t.toExponential(0) : String(+t.toPrecision(6))));
    for (const t of Plot.ticks(this.vx0, this.vx1, this.o.xticks || 8)) {
      if (Math.abs(t) < 1e-12 && x0 > this.L) continue;
      const ly = Math.min(this.B + 4, Math.max(this.T, y0 + 4));
      g.fillText(this.o.xfmt ? this.o.xfmt(t) : fmt(t), this.X(t), ly);
    }
    g.textAlign = 'right'; g.textBaseline = 'middle';
    for (const t of Plot.ticks(this.vy0, this.vy1, this.o.yticks || 6)) {
      if (Math.abs(t) < 1e-12 && y0 < this.B) continue;
      const lx = Math.max(this.L - 4, Math.min(this.R, x0 - 4));
      g.fillText(this.o.yfmt ? this.o.yfmt(t) : fmt(t), lx, this.Y(t));
    }
    g.fillStyle = c.ink2; g.font = '12px Inter, system-ui, sans-serif';
    if (this.o.xlabel) { g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(this.o.xlabel, this.R, this.B + 30); }
    if (this.o.ylabel && this.o.ylabel.length <= 3) { g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText(this.o.ylabel, 6, this.T); }
    else if (this.o.ylabel) { g.save(); g.translate(14, this.T); g.rotate(-Math.PI / 2); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(this.o.ylabel, 0, 0); g.restore(); }
    g.restore();
  }

  color(name) { return this.col[name] || name; }

  /** Plot y = f(x), sampling adaptively and breaking at jumps and NaN. */
  fn(f, o = {}) {
    const g = this.ctx;
    const [a, b] = o.domain || [this.vx0, this.vx1];
    const n = o.samples || Math.max(200, Math.round(this.R - this.L));
    const jump = (this.vy1 - this.vy0) * 1.5;
    g.save();
    this._stroke(o);
    g.beginPath();
    let pen = false, prev = null;
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      const y = f(x);
      if (!Number.isFinite(y) || (prev !== null && Math.abs(y - prev) > jump)) { pen = false; prev = Number.isFinite(y) ? y : null; if (!Number.isFinite(y)) continue; }
      const px = this.X(x), py = this.Y(Math.max(this.vy0 - jump, Math.min(this.vy1 + jump, y)));
      if (!pen) { g.moveTo(px, py); pen = true; } else g.lineTo(px, py);
      prev = y;
    }
    g.stroke();
    g.restore();
    return this;
  }

  /** Parametric curve (x(t), y(t)). */
  curve(fx, fy, t0, t1, o = {}) {
    const g = this.ctx, n = o.samples || 400;
    g.save(); this._stroke(o); g.beginPath();
    let pen = false;
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      const x = fx(t), y = fy(t);
      if (!Number.isFinite(x) || !Number.isFinite(y)) { pen = false; continue; }
      if (!pen) { g.moveTo(this.X(x), this.Y(y)); pen = true; } else g.lineTo(this.X(x), this.Y(y));
    }
    g.stroke(); g.restore();
    return this;
  }

  /** Polyline through world points [[x, y], ...]. */
  path(pts, o = {}) {
    const g = this.ctx;
    g.save(); this._stroke(o); g.beginPath();
    let pen = false;
    for (const [x, y] of pts) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) { pen = false; continue; }
      if (!pen) { g.moveTo(this.X(x), this.Y(y)); pen = true; } else g.lineTo(this.X(x), this.Y(y));
    }
    if (o.close) g.closePath();
    if (o.fill) { g.fillStyle = this.color(o.fill); g.globalAlpha = o.fillAlpha ?? 0.18; g.fill(); g.globalAlpha = 1; }
    if (o.stroke !== false) g.stroke();
    g.restore();
    return this;
  }

  /** Fill between y = f(x) and y = g(x) (default g = 0) over [a, b]. */
  area(f, a, b, o = {}) {
    const gfn = o.lower || (() => 0);
    const n = o.samples || 200;
    const top = [], bot = [];
    for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; top.push([x, f(x)]); bot.push([x, gfn(x)]); }
    const g = this.ctx;
    g.save();
    g.beginPath();
    top.forEach(([x, y], i) => (i ? g.lineTo(this.X(x), this.Y(y)) : g.moveTo(this.X(x), this.Y(y))));
    for (let i = bot.length - 1; i >= 0; i--) g.lineTo(this.X(bot[i][0]), this.Y(bot[i][1]));
    g.closePath();
    g.fillStyle = this.color(o.color || 'accent');
    g.globalAlpha = o.alpha ?? 0.2;
    g.fill();
    g.restore();
    return this;
  }

  rect(x, y, w, hh, o = {}) {
    const g = this.ctx;
    const px = this.X(x), py = this.Y(y + hh), pw = this.X(x + w) - px, ph = this.Y(y) - py;
    g.save();
    if (o.fill !== false) { g.fillStyle = this.color(o.fill || o.color || 'accent'); g.globalAlpha = o.alpha ?? 0.25; g.fillRect(px, py, pw, ph); g.globalAlpha = 1; }
    if (o.stroke !== false) { g.strokeStyle = this.color(o.stroke || o.color || 'accent'); g.lineWidth = o.width || 1; g.strokeRect(px, py, pw, ph); }
    g.restore();
    return this;
  }

  line(x0, y0, x1, y1, o = {}) {
    const g = this.ctx;
    g.save(); this._stroke(o);
    g.beginPath(); g.moveTo(this.X(x0), this.Y(y0)); g.lineTo(this.X(x1), this.Y(y1)); g.stroke();
    g.restore();
    return this;
  }

  /** Infinite line through (x0, y0) with slope m, clipped to the view. */
  slopeLine(x0, y0, m, o = {}) {
    return this.line(this.vx0, y0 + m * (this.vx0 - x0), this.vx1, y0 + m * (this.vx1 - x0), o);
  }

  arrow(x0, y0, x1, y1, o = {}) {
    const g = this.ctx;
    const a = [this.X(x0), this.Y(y0)], b = [this.X(x1), this.Y(y1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.5) return this;
    const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
    const head = Math.min(o.head || 10, len * 0.45);
    g.save();
    this._stroke(o);
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0] - ux * head * 0.6, b[1] - uy * head * 0.6); g.stroke();
    g.fillStyle = this.color(o.color || 'ink');
    g.beginPath();
    g.moveTo(b[0], b[1]);
    g.lineTo(b[0] - ux * head - uy * head * 0.45, b[1] - uy * head + ux * head * 0.45);
    g.lineTo(b[0] - ux * head + uy * head * 0.45, b[1] - uy * head - ux * head * 0.45);
    g.closePath(); g.fill();
    g.restore();
    if (o.label) this.text(o.label, x1, y1, { dx: o.ldx ?? 8, dy: o.ldy ?? -8, color: o.color, size: o.lsize, align: o.lalign });
    return this;
  }

  /** Arrow in screen-pixel units from a world point (for forces drawn to scale in px). */
  arrowPx(x, y, dxPx, dyPx, o = {}) {
    return this.arrow(x, y, this.ix(this.X(x) + dxPx), this.iy(this.Y(y) - dyPx), o);
  }

  point(x, y, o = {}) {
    const g = this.ctx;
    g.save();
    g.fillStyle = this.color(o.color || 'accent');
    g.beginPath(); g.arc(this.X(x), this.Y(y), o.r || 4.5, 0, Math.PI * 2); g.fill();
    if (o.ring) { g.strokeStyle = this.color(o.ring); g.lineWidth = 2; g.stroke(); }
    g.restore();
    if (o.label) this.text(o.label, x, y, { dx: o.ldx ?? 9, dy: o.ldy ?? -9, color: o.lcolor || o.color, size: o.lsize });
    return this;
  }

  circle(x, y, rWorld, o = {}) {
    const g = this.ctx;
    const rx = Math.abs(this.X(x + rWorld) - this.X(x)), ry = Math.abs(this.Y(y + rWorld) - this.Y(y));
    g.save();
    g.beginPath(); g.ellipse(this.X(x), this.Y(y), rx, ry, 0, 0, Math.PI * 2);
    if (o.fill) { g.fillStyle = this.color(o.fill); g.globalAlpha = o.alpha ?? 1; g.fill(); g.globalAlpha = 1; }
    if (o.stroke !== false) { this._stroke(o); g.stroke(); }
    g.restore();
    return this;
  }

  text(s, x, y, o = {}) {
    const g = this.ctx;
    g.save();
    g.fillStyle = this.color(o.color || 'ink');
    g.font = `${o.weight || 500} ${o.size || 12.5}px ${o.font || 'Inter, system-ui, sans-serif'}`;
    g.textAlign = o.align || 'left'; g.textBaseline = o.baseline || 'middle';
    const px = (o.screen ? x : this.X(x)) + (o.dx || 0), py = (o.screen ? y : this.Y(y)) + (o.dy || 0);
    if (o.halo !== false) { g.lineWidth = 3.5; g.strokeStyle = this.col.bg; g.globalAlpha = 0.85; g.strokeText(s, px, py); g.globalAlpha = 1; }
    g.fillText(s, px, py);
    g.restore();
    return this;
  }

  _stroke(o) {
    const g = this.ctx;
    g.strokeStyle = this.color(o.color || 'accent');
    g.lineWidth = o.width || 2;
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.setLineDash(o.dash || []);
    g.globalAlpha = o.alpha ?? 1;
  }

  /**
   * Make a draggable handle. get() → [x, y]; set(x, y) is called while dragging
   * (return a corrected position to constrain it). Keyboard: arrow keys move it.
   */
  handle(get, set, o = {}) {
    const H = { get, set, r: o.r || 9, label: o.label || 'point' };
    this.handles.push(H);
    if (!this._wired) this._wire();
    return H;
  }

  _wire() {
    this._wired = true;
    const c = this.c;
    c.tabIndex = 0;
    let drag = null;
    const pos = (e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const hit = ([px, py]) => this.handles.find((H) => { const [x, y] = H.get(); return Math.hypot(this.X(x) - px, this.Y(y) - py) <= H.r + 8; });
    c.addEventListener('pointerdown', (e) => {
      const H = hit(pos(e));
      if (!H) return;
      drag = H; this.active = H;
      c.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    c.addEventListener('pointermove', (e) => {
      const p = pos(e);
      if (!drag) { c.style.cursor = hit(p) ? 'grab' : ''; return; }
      c.style.cursor = 'grabbing';
      drag.set(this.ix(p[0]), this.iy(p[1]));
      this.onDrag?.();
    });
    const end = () => { if (drag) { drag = null; c.style.cursor = ''; this.onDragEnd?.(); } };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener('keydown', (e) => {
      const H = this.active || this.handles[0];
      if (!H) return;
      const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!k) return;
      e.preventDefault();
      const [x, y] = H.get();
      const step = e.shiftKey ? 0.1 : 0.02;
      H.set(x + k[0] * step * (this.vx1 - this.vx0), y + k[1] * step * (this.vy1 - this.vy0));
      this.onDrag?.();
      this.onDragEnd?.();
    });
  }

  drawHandles() {
    for (const H of this.handles) {
      const [x, y] = H.get();
      const g = this.ctx;
      g.save();
      g.fillStyle = this.col.panel;
      g.strokeStyle = this.col.accent2;
      g.lineWidth = 2.5;
      g.beginPath(); g.arc(this.X(x), this.Y(y), H.r - 2, 0, Math.PI * 2); g.fill(); g.stroke();
      g.restore();
    }
  }
}
