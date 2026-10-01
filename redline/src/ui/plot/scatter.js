/* X–Y characterisation plot: one point per run, the least-squares line,
   and a hover readout of the nearest point. One quantity per axis. */
import { h } from '../dom.js';
import { toDisplay, fmt, unitLabel } from '../../lib/units.js';

function niceStep(span, n) {
  const raw = span / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}
const disp = (v, q) => (q === 'time' ? v * 1e3 : q === 'ratio' ? v : toDisplay(v, q));
const unitOf = (q, key) => (q === 'time' ? 'ms' : q === 'ratio' ? '' : unitLabel(q, q === 'pressure' ? (key === 'PcAbs' ? false : true) : undefined));

export class Scatter {
  constructor(host) {
    this.host = host;
    this.canvas = h('canvas', { style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } });
    this.tip = h('div.plot-tip');
    host.style.position = 'relative';
    host.append(this.canvas, this.tip);
    this.ctx = this.canvas.getContext('2d');
    this.ro = new ResizeObserver(() => this.draw());
    this.ro.observe(host);
    this.canvas.addEventListener('mousemove', e => this.hover(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mouseleave', () => { this.hot = null; this.tip.style.display = 'none'; this.draw(); });
    this.data = null;
  }
  destroy() { this.ro.disconnect(); }

  set(data) { this.data = data; this.draw(); }

  rect() { return { x: 64, y: 14, w: Math.max(20, this.W - 64 - 16), h: Math.max(20, this.H - 14 - 44) }; }

  draw() {
    const r0 = this.host.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    this.W = r0.width; this.H = r0.height;
    this.canvas.width = Math.round(this.W * dpr); this.canvas.height = Math.round(this.H * dpr);
    const c = this.ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, this.W, this.H);
    const d = this.data;
    const mono = getComputedStyle(document.body).getPropertyValue('--mono');
    c.font = '10.5px ' + mono;
    if (!d || !d.points.length) {
      c.fillStyle = '#6e7986'; c.textAlign = 'center'; c.fillText(d?.empty || 'No runs with both quantities.', this.W / 2, this.H / 2); return;
    }
    const pts = d.points.map(p => ({ ...p, X: disp(p.x, d.xq), Y: disp(p.y, d.yq) }));
    const inc = pts.filter(p => p.included);
    let xs = pts.map(p => p.X), ys = pts.map(p => p.Y);
    if (d.fit && d.zeroX) xs = xs.concat([0]);
    if (d.fit && d.zeroX) ys = ys.concat([disp(d.fit.b, d.yq)]);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (x1 - x0 < 1e-12) { x0 -= 1; x1 += 1; }
    if (y1 - y0 < 1e-12) { y0 -= Math.abs(y0) * 0.1 + 1e-3; y1 += Math.abs(y1) * 0.1 + 1e-3; }
    const px = (x1 - x0) * 0.08, py = (y1 - y0) * 0.1;
    x0 -= px; x1 += px; y0 -= py; y1 += py;
    const R = this.rect();
    const X = v => R.x + (v - x0) / (x1 - x0) * R.w, Y = v => R.y + R.h - (v - y0) / (y1 - y0) * R.h;
    this.map = { X, Y, pts };
    c.fillStyle = '#0a0d11'; c.fillRect(R.x, R.y, R.w, R.h);
    // grid
    c.lineWidth = 1;
    const sx = niceStep(x1 - x0, Math.floor(R.w / 90)), sy = niceStep(y1 - y0, Math.floor(R.h / 40));
    const dp = s => Math.max(0, -Math.floor(Math.log10(s) + 1e-9));
    c.textAlign = 'center'; c.textBaseline = 'top';
    for (let v = Math.ceil(x0 / sx) * sx; v <= x1; v += sx) {
      const x = Math.round(X(v)) + 0.5; c.strokeStyle = Math.abs(v) < sx * 1e-6 ? '#2a333d' : '#141a20';
      c.beginPath(); c.moveTo(x, R.y); c.lineTo(x, R.y + R.h); c.stroke();
      c.fillStyle = '#6e7986'; c.fillText(v.toFixed(Math.min(4, dp(sx))), x, R.y + R.h + 4);
    }
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (let v = Math.ceil(y0 / sy) * sy; v <= y1; v += sy) {
      const y = Math.round(Y(v)) + 0.5; c.strokeStyle = Math.abs(v) < sy * 1e-6 ? '#2a333d' : '#141a20';
      c.beginPath(); c.moveTo(R.x, y); c.lineTo(R.x + R.w, y); c.stroke();
      c.fillStyle = '#6e7986'; c.fillText(v.toFixed(Math.min(4, dp(sy))), R.x - 6, y);
    }
    c.fillStyle = '#8391a0'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillText(`${d.xLabel}${unitOf(d.xq, d.xKey) ? ' (' + unitOf(d.xq, d.xKey) + ')' : ''}`, R.x + R.w / 2, this.H - 6);
    c.save(); c.translate(12, R.y + R.h / 2); c.rotate(-Math.PI / 2);
    c.fillText(`${d.yLabel}${unitOf(d.yq, d.yKey) ? ' (' + unitOf(d.yq, d.yKey) + ')' : ''}`, 0, 0); c.restore();
    // fit line
    if (d.fit) {
      const f = xv => disp(d.fit.at(xv), d.yq);
      // fit is in SI; draw across the x range by converting ends back
      const xsSI = [Math.min(...inc.map(p => p.x)), Math.max(...inc.map(p => p.x))];
      if (d.zeroX) xsSI[0] = Math.min(xsSI[0], 0);
      c.strokeStyle = '#a3adb8'; c.lineWidth = 1.5; c.setLineDash([]);
      c.beginPath(); c.moveTo(X(disp(xsSI[0], d.xq)), Y(f(xsSI[0]))); c.lineTo(X(disp(xsSI[1], d.xq)), Y(f(xsSI[1]))); c.stroke();
    }
    // points
    for (const p of pts) {
      const x = X(p.X), y = Y(p.Y);
      c.beginPath(); c.arc(x, y, p === this.hot ? 6 : 4.5, 0, Math.PI * 2);
      if (p.included) { c.fillStyle = '#3987e5'; c.fill(); c.strokeStyle = '#0a0d11'; c.lineWidth = 2; c.stroke(); }
      else { c.strokeStyle = '#6e7986'; c.lineWidth = 1.5; c.stroke(); }
    }
    // direct labels (few points only)
    if (pts.length <= 8) {
      c.fillStyle = '#a3adb8'; c.textAlign = 'left'; c.textBaseline = 'bottom'; c.font = '9.5px ' + mono;
      for (const p of pts) c.fillText(p.label, X(p.X) + 7, Y(p.Y) - 4);
    }
    c.strokeStyle = '#1c232b'; c.lineWidth = 1; c.strokeRect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1);
  }

  hover(mx, my) {
    if (!this.map) return;
    let best = null, bd = 24 * 24;
    for (const p of this.map.pts) { const dx = this.map.X(p.X) - mx, dy = this.map.Y(p.Y) - my; const dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = p; } }
    if (best !== this.hot) { this.hot = best; this.draw(); }
    if (!best) { this.tip.style.display = 'none'; return; }
    const d = this.data;
    this.tip.innerHTML = '';
    this.tip.append(h('div.tt', best.label + (best.included ? '' : ' (excluded)')),
      h('div.r', h('b', d.xq === 'time' ? `${(best.x * 1e3).toFixed(2)} ms` : fmt(best.x, d.xq, d.xq === 'ratio' ? 4 : undefined)), h('span', d.xLabel)),
      h('div.r', h('b', d.yq === 'time' ? `${(best.y * 1e3).toFixed(2)} ms` : fmt(best.y, d.yq, d.yq === 'ratio' ? 4 : undefined)), h('span', d.yLabel)),
      d.fit && best.included ? h('div.r', h('b', d.yq === 'time' ? `${((best.y - d.fit.at(best.x)) * 1e3).toFixed(3)} ms` : fmt(best.y - d.fit.at(best.x), d.yq, 4)), h('span', 'residual')) : null);
    this.tip.style.display = 'block';
    const tw = this.tip.offsetWidth;
    this.tip.style.left = (mx + 14 + tw > this.W ? mx - tw - 14 : mx + 14) + 'px';
    this.tip.style.top = Math.max(4, my - 20) + 'px';
  }
}
