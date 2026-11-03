// The 2D plot: a canvas with a pannable, zoomable view (drag the background,
// scroll to zoom about the cursor), axes and grid with nice ticks, and a
// drawing API in math coordinates. A demo supplies a draw(g) callback; every
// command is recorded, so the same picture renders to canvas and exports to
// SVG. Draggable handles are registered each draw and hit-tested in pixels.

import { niceStep, fmtTick } from './viewport3d';
import { colormapCss, Colormap } from './colors';

export interface View { x0: number; x1: number; y0: number; y1: number }
type P = [number, number];

export interface Style { color?: string; width?: number; dash?: number[]; fill?: string; alpha?: number; font?: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline }

type Cmd =
  | { k: 'path'; pts: P[]; s: Style; closed?: boolean }
  | { k: 'text'; at: P; text: string; s: Style; dx?: number; dy?: number }
  | { k: 'circle'; at: P; r: number; s: Style }
  | { k: 'image'; data: ImageData; x0: number; x1: number; y0: number; y1: number };

export interface DragHandle { id: string; at: P; r?: number; color?: string; onDrag: (p: P) => void; constrain?: (p: P) => P; label?: string }

export class Graphics {
  cmds: Cmd[] = [];
  handles: DragHandle[] = [];
  constructor(public view: View, public pxW: number, public pxH: number) {}

  /** pixel size of one math unit, for sampling decisions */
  get ppx() { return this.pxW / (this.view.x1 - this.view.x0); }

  path(pts: P[], s: Style = {}, closed = false) { this.cmds.push({ k: 'path', pts, s, closed }); }
  line(a: P, b: P, s: Style = {}) { this.path([a, b], s); }
  polygon(pts: P[], s: Style) { this.path(pts, s, true); }
  text(at: P, text: string, s: Style = {}, dx = 0, dy = 0) { this.cmds.push({ k: 'text', at, text, s, dx, dy }); }
  point(at: P, r = 4, s: Style = {}) { this.cmds.push({ k: 'circle', at, r, s: { fill: s.color ?? '#fff', ...s } }); }
  image(data: ImageData, x0: number, x1: number, y0: number, y1: number) { this.cmds.push({ k: 'image', data, x0, x1, y0, y1 }); }

  /** y = f(x) across the view, adaptively sampled, broken at asymptotes and undefined points. */
  fn(f: (x: number) => number, s: Style = {}, domain?: [number, number]) {
    const [a, b] = domain ?? [this.view.x0, this.view.x1];
    const n = Math.max(200, Math.ceil(this.pxW * 1.5));
    const ySpan = this.view.y1 - this.view.y0;
    let run: P[] = [];
    let prev: P | null = null;
    const flush = () => { if (run.length > 1) this.path(run, s); run = []; };
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      const y = f(x);
      if (!Number.isFinite(y)) { flush(); prev = null; continue; }
      // a jump bigger than the view between neighbours is an asymptote, not a line
      if (prev && Math.abs(y - prev[1]) > ySpan * 2) flush();
      run.push([x, y]);
      prev = [x, y];
    }
    flush();
  }

  /** A parametric curve (x(t), y(t)). */
  parametric(fx: (t: number) => number, fy: (t: number) => number, t0: number, t1: number, s: Style = {}, n = 600) {
    const pts: P[] = [];
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      const p: P = [fx(t), fy(t)];
      if (p.every(Number.isFinite)) pts.push(p); else { if (pts.length > 1) this.path(pts.splice(0), s); pts.length = 0; }
    }
    if (pts.length > 1) this.path(pts, s);
  }

  /** The region between f and g (or the x-axis) over [a, b]. */
  fillBetween(f: (x: number) => number, g: (x: number) => number, a: number, b: number, s: Style, n = 300) {
    const top: P[] = [], bot: P[] = [];
    for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; const y1 = f(x), y2 = g(x); if (Number.isFinite(y1) && Number.isFinite(y2)) { top.push([x, y1]); bot.push([x, y2]); } }
    this.polygon([...top, ...bot.reverse()], s);
  }

  arrow(a: P, b: P, s: Style = {}) {
    this.line(a, b, s);
    const ppx = this.ppx, ppy = this.pxH / (this.view.y1 - this.view.y0);
    const dx = (b[0] - a[0]) * ppx, dy = (b[1] - a[1]) * ppy;
    const L = Math.hypot(dx, dy);
    if (L < 1) return;
    const h = Math.min(12, L * 0.4), ux = dx / L, uy = dy / L;
    const back: P = [b[0] - (ux * h) / ppx, b[1] - (uy * h) / ppy];
    const side = (k: number): P => [back[0] + (-uy * h * 0.45 * k) / ppx, back[1] + (ux * h * 0.45 * k) / ppy];
    this.polygon([b, side(1), side(-1)], { fill: s.color ?? '#fff', color: s.color, width: 1 });
  }

  /** Arrows of a planar field on a grid, normalized, coloured by magnitude. */
  field(F: (x: number, y: number) => P | null, n = 20, cmap: Colormap = 'plasma') {
    const { x0, x1, y0, y1 } = this.view;
    const hx = (x1 - x0) / n, hy = (y1 - y0) / Math.round(n * this.pxH / this.pxW);
    const ny = Math.round(n * this.pxH / this.pxW);
    const items: { p: P; v: P; m: number }[] = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < n; i++) {
      const p: P = [x0 + (i + 0.5) * hx, y0 + (j + 0.5) * hy];
      const v = F(p[0], p[1]);
      if (v && v.every(Number.isFinite)) items.push({ p, v, m: Math.hypot(v[0], v[1]) });
    }
    const mx = Math.max(1e-12, ...items.map((it) => it.m));
    for (const it of items) {
      if (it.m < 1e-12) { this.point(it.p, 1.5, { color: colormapCss(cmap, 0) }); continue; }
      const len = 0.42 * Math.min(hx, hy) * (0.4 + 0.6 * Math.sqrt(it.m / mx));
      const u: P = [(it.v[0] / it.m) * len, (it.v[1] / it.m) * len];
      this.arrow([it.p[0] - u[0], it.p[1] - u[1]], [it.p[0] + u[0], it.p[1] + u[1]], { color: colormapCss(cmap, 0.15 + 0.85 * it.m / mx), width: 1.4 });
    }
  }

  /** Short line segments of slope f(x, y): a direction field. */
  slopeField(f: (x: number, y: number) => number, n = 22, s: Style = {}) {
    const { x0, x1, y0, y1 } = this.view;
    const ny = Math.round(n * this.pxH / this.pxW);
    const hx = (x1 - x0) / n, hy = (y1 - y0) / ny;
    const ppx = this.ppx, ppy = this.pxH / (y1 - y0);
    for (let j = 0; j < ny; j++) for (let i = 0; i < n; i++) {
      const x = x0 + (i + 0.5) * hx, y = y0 + (j + 0.5) * hy;
      const m = f(x, y);
      if (!Number.isFinite(m)) continue;
      // a segment of fixed screen length
      const dxp = 1, dyp = m * ppy / ppx;
      const L = Math.hypot(dxp, dyp), half = Math.min(hx * ppx, hy * ppy) * 0.38;
      const ex = (dxp / L) * half / ppx, ey = (dyp / L) * half / ppy;
      this.line([x - ex, y - ey], [x + ex, y + ey], { color: s.color ?? '#7d8597', width: s.width ?? 1.2, alpha: s.alpha ?? 0.8 });
    }
  }

  /** The zero set of F(x, y) by marching squares on the view. */
  implicit(F: (x: number, y: number) => number, s: Style = {}, n = 160) {
    const { x0, x1, y0, y1 } = this.view;
    const ny = Math.round(n * this.pxH / this.pxW);
    const hx = (x1 - x0) / n, hy = (y1 - y0) / ny;
    const v: number[][] = [];
    for (let j = 0; j <= ny; j++) { v.push([]); for (let i = 0; i <= n; i++) v[j].push(F(x0 + i * hx, y0 + j * hy)); }
    const segs: [P, P][] = [];
    const lerp = (a: number, b: number) => (Math.abs(a - b) < 1e-300 ? 0.5 : a / (a - b));
    for (let j = 0; j < ny; j++) for (let i = 0; i < n; i++) {
      const a = v[j][i], b = v[j][i + 1], c = v[j + 1][i + 1], d = v[j + 1][i];
      if (![a, b, c, d].every(Number.isFinite)) continue;
      const X = x0 + i * hx, Y = y0 + j * hy;
      const e: P[] = [];
      if ((a < 0) !== (b < 0)) e.push([X + lerp(a, b) * hx, Y]);
      if ((b < 0) !== (c < 0)) e.push([X + hx, Y + lerp(b, c) * hy]);
      if ((c < 0) !== (d < 0)) e.push([X + (1 - lerp(c, d)) * hx, Y + hy]);
      if ((d < 0) !== (a < 0)) e.push([X, Y + (1 - lerp(d, a)) * hy]);
      // ignore sign flips across poles (huge values on both sides)
      if (e.length >= 2 && Math.max(Math.abs(a), Math.abs(b), Math.abs(c), Math.abs(d)) < 1e6) { segs.push([e[0], e[1]]); if (e.length === 4) segs.push([e[2], e[3]]); }
    }
    for (const [p, q] of segs) this.line(p, q, s);
  }

  /** A filled heat map of f over the view; alpha < 1 lets the grid and axes show through. */
  heatmap(f: (x: number, y: number) => number, range: [number, number], cmap: Colormap = 'coolwarm', res = 160, alpha = 1) {
    const { x0, x1, y0, y1 } = this.view;
    const ny = Math.round(res * this.pxH / this.pxW);
    const img = new ImageData(res, ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < res; i++) {
      const v = f(x0 + ((i + 0.5) * (x1 - x0)) / res, y1 - ((j + 0.5) * (y1 - y0)) / ny);
      const t = (v - range[0]) / (range[1] - range[0] || 1);
      const hex = colormapCss(cmap, t);
      const k = 4 * (j * res + i);
      img.data[k] = parseInt(hex.slice(1, 3), 16); img.data[k + 1] = parseInt(hex.slice(3, 5), 16); img.data[k + 2] = parseInt(hex.slice(5, 7), 16);
      img.data[k + 3] = Number.isFinite(v) ? Math.round(255 * Math.min(1, Math.max(0, alpha))) : 0;
    }
    this.image(img, x0, x1, y0, y1);
  }

  /** A draggable point. */
  handle(h: DragHandle) { this.handles.push(h); }
}

export interface PlotOpts { equal?: boolean; axes?: boolean; grid?: boolean; xLabel?: string; yLabel?: string; pan?: boolean }

export class Plot2D {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private host: HTMLElement;
  view: View = { x0: -5, x1: 5, y0: -3.5, y1: 3.5 };
  opts: PlotOpts;
  private drawFn: ((g: Graphics) => void) | null = null;
  private last: Graphics | null = null;
  private ro: ResizeObserver;
  private queued = false;
  private dark = true;
  private dragging: DragHandle | null = null;
  private panning: { x: number; y: number; v: View } | null = null;
  onViewChange?: (v: View) => void;
  /** called with math coordinates on a click that was not a drag (place a solution, a point) */
  onClick?: (p: P, e?: { shift: boolean; ctrl: boolean; alt: boolean }) => void;

  constructor(host: HTMLElement, opts: PlotOpts = {}) {
    this.host = host;
    this.opts = { axes: true, grid: true, pan: true, ...opts };
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none';
    host.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.render());
    this.ro.observe(host);
    this.wire();
  }

  setDraw(fn: (g: Graphics) => void) { this.drawFn = fn; this.render(); }
  setTheme(dark: boolean) { this.dark = dark; this.render(); }
  setView(v: View) { this.view = { ...v }; this.fixAspect(); this.render(); }

  private fixAspect() {
    if (!this.opts.equal) return;
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    const cx = (this.view.x0 + this.view.x1) / 2, cy = (this.view.y0 + this.view.y1) / 2;
    const sx = (this.view.x1 - this.view.x0) / w, sy = (this.view.y1 - this.view.y0) / h;
    const s = Math.max(sx, sy);
    this.view = { x0: cx - (s * w) / 2, x1: cx + (s * w) / 2, y0: cy - (s * h) / 2, y1: cy + (s * h) / 2 };
  }

  /** Schedule a redraw (coalesced to one per frame). */
  render() {
    if (this.queued) return;
    this.queued = true;
    requestAnimationFrame(() => { this.queued = false; this.paint(); });
  }

  private X(x: number) { return ((x - this.view.x0) / (this.view.x1 - this.view.x0)) * this.wPx(); }
  private Y(y: number) { return this.hPx() - ((y - this.view.y0) / (this.view.y1 - this.view.y0)) * this.hPx(); }
  private wPx() { return this.host.clientWidth || 1; }
  private hPx() { return this.host.clientHeight || 1; }
  toMath(px: number, py: number): P { return [this.view.x0 + (px / this.wPx()) * (this.view.x1 - this.view.x0), this.view.y0 + (1 - py / this.hPx()) * (this.view.y1 - this.view.y0)]; }

  private paint() {
    const w = this.wPx(), h = this.hPx(), dpr = Math.min(2, window.devicePixelRatio || 1);
    this.fixAspect();
    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
      this.canvas.style.width = `${w}px`; this.canvas.style.height = `${h}px`;
    }
    const g = new Graphics(this.view, w, h);
    this.drawAxes(g);
    this.drawFn?.(g);
    for (const hd of g.handles) g.point(hd.at, hd.r ?? 7, { fill: hd.color ?? '#ffffff', color: this.dark ? '#0d1017' : '#ffffff', width: 2 });
    for (const hd of g.handles) if (hd.label) g.text(hd.at, hd.label, { color: hd.color ?? (this.dark ? '#e6e9ef' : '#1b1f2a'), font: '600 13px Inter, system-ui, sans-serif' }, 10, -10);
    this.last = g;
    const c = this.ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = this.dark ? '#0d1017' : '#f7f8fa';
    c.fillRect(0, 0, w, h);
    for (const cmd of g.cmds) this.paintCmd(c, cmd);
  }

  private paintCmd(c: CanvasRenderingContext2D, cmd: Cmd) {
    if (cmd.k === 'image') {
      const tmp = document.createElement('canvas'); tmp.width = cmd.data.width; tmp.height = cmd.data.height;
      tmp.getContext('2d')!.putImageData(cmd.data, 0, 0);
      c.save(); c.imageSmoothingEnabled = true;
      c.drawImage(tmp, this.X(cmd.x0), this.Y(cmd.y1), this.X(cmd.x1) - this.X(cmd.x0), this.Y(cmd.y0) - this.Y(cmd.y1));
      c.restore(); return;
    }
    const s = cmd.s;
    c.save();
    c.globalAlpha = s.alpha ?? 1;
    if (cmd.k === 'path') {
      c.beginPath();
      cmd.pts.forEach(([x, y], i) => { const X = this.X(x), Y = this.Y(clampY(y, this.view)); if (i) c.lineTo(X, Y); else c.moveTo(X, Y); });
      if (cmd.closed) c.closePath();
      if (s.fill) { c.fillStyle = s.fill; c.fill(); }
      if (s.color || !s.fill) { c.strokeStyle = s.color ?? (this.dark ? '#e6e9ef' : '#1b1f2a'); c.lineWidth = s.width ?? 2; c.setLineDash(s.dash ?? []); c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); }
    } else if (cmd.k === 'circle') {
      c.beginPath(); c.arc(this.X(cmd.at[0]), this.Y(cmd.at[1]), cmd.r, 0, Math.PI * 2);
      if (s.fill) { c.fillStyle = s.fill; c.fill(); }
      if (s.color) { c.strokeStyle = s.color; c.lineWidth = s.width ?? 1.5; c.stroke(); }
    } else if (cmd.k === 'text') {
      c.font = s.font ?? '13px Inter, system-ui, sans-serif';
      c.fillStyle = s.color ?? (this.dark ? '#c9cfdb' : '#2a3040');
      c.textAlign = s.align ?? 'left'; c.textBaseline = s.baseline ?? 'alphabetic';
      c.fillText(cmd.text, this.X(cmd.at[0]) + (cmd.dx ?? 0), this.Y(cmd.at[1]) + (cmd.dy ?? 0));
    }
    c.restore();
  }

  private drawAxes(g: Graphics) {
    const { x0, x1, y0, y1 } = this.view;
    const w = this.wPx(), h = this.hPx();
    const sx = niceStep((x1 - x0) / Math.max(4, w / 90)), sy = niceStep((y1 - y0) / Math.max(3, h / 70));
    const gridCol = this.dark ? 'rgba(160,170,190,0.10)' : 'rgba(40,50,70,0.10)';
    const axisCol = this.dark ? '#5b6375' : '#8a93a6';
    const tickCol = this.dark ? '#7d8597' : '#5b6375';
    if (this.opts.grid) {
      for (let x = Math.ceil(x0 / sx) * sx; x <= x1; x += sx) g.line([x, y0], [x, y1], { color: gridCol, width: 1 });
      for (let y = Math.ceil(y0 / sy) * sy; y <= y1; y += sy) g.line([x0, y], [x1, y], { color: gridCol, width: 1 });
    }
    if (!this.opts.axes) return;
    const ax = Math.min(x1, Math.max(x0, 0)), ay = Math.min(y1, Math.max(y0, 0));
    g.line([x0, ay], [x1, ay], { color: axisCol, width: 1.2 });
    g.line([ax, y0], [ax, y1], { color: axisCol, width: 1.2 });
    const font = '11px Inter, system-ui, sans-serif';
    const bottomEdge = (y1 - ay) / (y1 - y0) * h > h - 20;
    for (let x = Math.ceil(x0 / sx) * sx; x <= x1; x += sx) if (Math.abs(x) > sx * 1e-6) g.text([x, ay], fmtTick(+x.toFixed(10)), { color: tickCol, font, align: 'center', baseline: bottomEdge ? 'bottom' : 'top' }, 0, bottomEdge ? -4 : 4);
    // y tick labels sit left of the axis, unless the axis is at the left edge (then right of it)
    const leftEdge = (ax - x0) / (x1 - x0) * w < 34;
    for (let y = Math.ceil(y0 / sy) * sy; y <= y1; y += sy) if (Math.abs(y) > sy * 1e-6) g.text([ax, y], fmtTick(+y.toFixed(10)), { color: tickCol, font, align: leftEdge ? 'left' : 'right', baseline: 'middle' }, leftEdge ? 5 : -5, 0);
    if (this.opts.xLabel) g.text([x1, ay], this.opts.xLabel, { color: tickCol, font: 'italic 13px Inter, sans-serif', align: 'right', baseline: 'bottom' }, -4, -4);
    if (this.opts.yLabel) g.text([ax, y1], this.opts.yLabel, { color: tickCol, font: 'italic 13px Inter, sans-serif', align: 'left', baseline: 'top' }, 6, 4);
  }

  private wire() {
    const el = this.canvas;
    let downAt: { x: number; y: number } | null = null;
    const local = (e: PointerEvent | WheelEvent) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const hit = (x: number, y: number) => (this.last?.handles ?? []).slice().reverse().find((hd) => Math.hypot(this.X(hd.at[0]) - x, this.Y(hd.at[1]) - y) <= (hd.r ?? 7) + 8);
    el.addEventListener('pointerdown', (e) => {
      const { x, y } = local(e);
      downAt = { x, y };
      const hd = hit(x, y);
      el.setPointerCapture(e.pointerId);
      if (hd) { this.dragging = hd; el.style.cursor = 'grabbing'; return; }
      if (this.opts.pan) this.panning = { x, y, v: { ...this.view } };
    });
    el.addEventListener('pointermove', (e) => {
      const { x, y } = local(e);
      if (this.dragging) {
        let p = this.toMath(x, y);
        if (this.dragging.constrain) p = this.dragging.constrain(p);
        this.dragging.onDrag(p);
        this.render();
        return;
      }
      if (this.panning) {
        const dx = ((x - this.panning.x) / this.wPx()) * (this.panning.v.x1 - this.panning.v.x0);
        const dy = ((y - this.panning.y) / this.hPx()) * (this.panning.v.y1 - this.panning.v.y0);
        this.view = { x0: this.panning.v.x0 - dx, x1: this.panning.v.x1 - dx, y0: this.panning.v.y0 + dy, y1: this.panning.v.y1 + dy };
        this.onViewChange?.(this.view);
        this.render();
        return;
      }
      el.style.cursor = hit(x, y) ? 'grab' : this.opts.pan ? 'crosshair' : '';
    });
    const up = (e: PointerEvent) => {
      const { x, y } = local(e);
      const wasDrag = this.dragging, wasClick = downAt && Math.hypot(x - downAt.x, y - downAt.y) < 4;
      this.dragging = null; this.panning = null; downAt = null;
      el.style.cursor = '';
      if (!wasDrag && wasClick && this.onClick) this.onClick(this.toMath(x, y), { shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey, alt: e.altKey });
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', () => { this.dragging = null; this.panning = null; downAt = null; });
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const { x, y } = local(e);
      const [mx, my] = this.toMath(x, y);
      const k = Math.exp(e.deltaY * 0.0015);
      const v = this.view;
      this.view = { x0: mx + (v.x0 - mx) * k, x1: mx + (v.x1 - mx) * k, y0: my + (v.y0 - my) * k, y1: my + (v.y1 - my) * k };
      this.onViewChange?.(this.view);
      this.render();
    }, { passive: false });
  }

  /** PNG of the plot. */
  screenshot(): string { this.paint(); return this.canvas.toDataURL('image/png'); }

  /** The current picture as an SVG document. */
  toSVG(): string {
    const g = this.last;
    const w = this.wPx(), h = this.hPx();
    const out: string[] = [`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`, `<rect width="100%" height="100%" fill="${this.dark ? '#0d1017' : '#f7f8fa'}"/>`];
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    for (const cmd of g?.cmds ?? []) {
      if (cmd.k === 'path') {
        const d = cmd.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${this.X(x).toFixed(2)},${this.Y(clampY(y, this.view)).toFixed(2)}`).join('') + (cmd.closed ? 'Z' : '');
        out.push(`<path d="${d}" fill="${cmd.s.fill ?? 'none'}" stroke="${cmd.s.color ?? (cmd.s.fill ? 'none' : '#e6e9ef')}" stroke-width="${cmd.s.width ?? 2}" ${cmd.s.dash ? `stroke-dasharray="${cmd.s.dash.join(' ')}"` : ''} opacity="${cmd.s.alpha ?? 1}" stroke-linejoin="round" stroke-linecap="round"/>`);
      } else if (cmd.k === 'circle') {
        out.push(`<circle cx="${this.X(cmd.at[0]).toFixed(2)}" cy="${this.Y(cmd.at[1]).toFixed(2)}" r="${cmd.r}" fill="${cmd.s.fill ?? 'none'}" stroke="${cmd.s.color ?? 'none'}"/>`);
      } else if (cmd.k === 'text') {
        const anchor = cmd.s.align === 'center' ? 'middle' : cmd.s.align === 'right' ? 'end' : 'start';
        out.push(`<text x="${(this.X(cmd.at[0]) + (cmd.dx ?? 0)).toFixed(1)}" y="${(this.Y(cmd.at[1]) + (cmd.dy ?? 0)).toFixed(1)}" fill="${cmd.s.color ?? '#c9cfdb'}" font-family="Inter, sans-serif" font-size="12" text-anchor="${anchor}">${esc(cmd.text)}</text>`);
      } else if (cmd.k === 'image') {
        const tmp = document.createElement('canvas'); tmp.width = cmd.data.width; tmp.height = cmd.data.height;
        tmp.getContext('2d')!.putImageData(cmd.data, 0, 0);
        out.push(`<image href="${tmp.toDataURL()}" x="${this.X(cmd.x0)}" y="${this.Y(cmd.y1)}" width="${this.X(cmd.x1) - this.X(cmd.x0)}" height="${this.Y(cmd.y0) - this.Y(cmd.y1)}" preserveAspectRatio="none"/>`);
      }
    }
    out.push('</svg>');
    return out.join('\n');
  }

  dispose() { this.ro.disconnect(); this.canvas.remove(); }
}

// keep wildly out-of-range points from overflowing canvas coordinates
const clampY = (y: number, v: View) => { const span = v.y1 - v.y0; return Math.min(v.y1 + span * 10, Math.max(v.y0 - span * 10, y)); };
